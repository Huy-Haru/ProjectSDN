const fs = require("node:fs/promises");
const crypto = require("node:crypto");
const zlib = require("node:zlib");
const { promisify } = require("node:util");
const { BSON } = require("mongoose").mongo;
const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);
const MAX_BYTES = 64 * 1024 * 1024;
const MAX_DOCUMENTS = 100000;

// Logical maintenance-mode archive for this small project, not a live oplog backup.
async function backupDatabase(db, file) {
  const collections = [];
  let count = 0;
  let size = 0;
  for (const info of await db.listCollections().toArray()) {
    if (info.name.startsWith("system.")) continue;
    if (
      !/^[a-zA-Z][a-zA-Z0-9_]*$/.test(info.name) ||
      info.type !== "collection" ||
      Object.keys(info.options || {}).length
    ) {
      throw new Error(
        "Only ordinary collections without special options are supported.",
      );
    }
    const collection = db.collection(info.name);
    const documents = [];
    for await (const doc of collection.find({})) {
      if (++count > MAX_DOCUMENTS)
        throw new Error(
          "Archive exceeds the supported document limit; use MongoDB Database Tools.",
        );
      size += Buffer.byteLength(BSON.EJSON.stringify(doc, { relaxed: false }));
      if (size > MAX_BYTES)
        throw new Error("Archive exceeds 64 MiB; use MongoDB Database Tools.");
      documents.push(doc);
    }
    collections.push({
      name: info.name,
      documents,
      indexes: await collection.indexes(),
    });
  }
  const payload = BSON.EJSON.stringify(
    {
      format: "fitmanager-logical-v1",
      source: db.databaseName,
      createdAt: new Date(),
      collections,
    },
    { relaxed: false },
  );
  if (Buffer.byteLength(payload) > MAX_BYTES)
    throw new Error("Archive exceeds 64 MiB; use MongoDB Database Tools.");
  const bytes = await gzip(payload);
  const handle = await fs.open(file, "wx", 0o600);
  try {
    await handle.writeFile(bytes);
  } finally {
    await handle.close();
  }
  return {
    collections: collections.length,
    documents: count,
    sha256: crypto.createHash("sha256").update(bytes).digest("hex"),
  };
}

async function readArchive(file) {
  if ((await fs.stat(file)).size > MAX_BYTES)
    throw new Error("Compressed archive is too large.");
  const bytes = await fs.readFile(file);
  if (bytes.length > MAX_BYTES)
    throw new Error("Compressed archive is too large.");
  const content = await gunzip(bytes, { maxOutputLength: MAX_BYTES });
  const data = BSON.EJSON.parse(content.toString("utf8"), { relaxed: false });
  if (
    data.format !== "fitmanager-logical-v1" ||
    typeof data.source !== "string" ||
    !Array.isArray(data.collections)
  )
    throw new Error("Unsupported archive format.");
  const names = new Set();
  let count = 0;
  for (const collection of data.collections) {
    if (
      !collection ||
      typeof collection.name !== "string" ||
      !/^[a-zA-Z][a-zA-Z0-9_]*$/.test(collection.name) ||
      names.has(collection.name) ||
      !Array.isArray(collection.documents) ||
      !Array.isArray(collection.indexes)
    )
      throw new Error("Invalid collection in archive.");
    names.add(collection.name);
    count += collection.documents.length;
    if (count > MAX_DOCUMENTS)
      throw new Error("Archive exceeds the document limit.");
    for (const index of collection.indexes)
      if (!index.key || typeof index.name !== "string")
        throw new Error("Invalid index in archive.");
  }
  return data;
}

async function restoreDatabase(client, file, targetName) {
  const archive = await readArchive(file);
  // A restore always targets a new, explicitly named verification/recovery database.
  if (
    !/^fitmanager_restore_[a-zA-Z0-9_]+$/.test(targetName) ||
    targetName === archive.source
  )
    throw new Error(
      "Target must be a separate fitmanager_restore_<name> database.",
    );
  const existing = await client
    .db("admin")
    .admin()
    .listDatabases({ nameOnly: true });
  if (existing.databases.some((db) => db.name === targetName))
    throw new Error(
      "Restore target already exists; no existing data was changed.",
    );
  const target = client.db(targetName);
  // createCollection is atomic: concurrent restores cannot both claim this new target.
  await target.createCollection("_fitmanager_restore_lock");
  for (const collection of archive.collections) {
    await target.createCollection(collection.name);
    if (collection.documents.length)
      await target
        .collection(collection.name)
        .insertMany(collection.documents, { ordered: true });
    for (const index of collection.indexes.filter((i) => i.name !== "_id_")) {
      const options = {};
      for (const field of [
        "name",
        "unique",
        "sparse",
        "expireAfterSeconds",
        "partialFilterExpression",
        "collation",
        "hidden",
        "weights",
        "default_language",
        "language_override",
        "textIndexVersion",
        "2dsphereIndexVersion",
        "wildcardProjection",
      ]) {
        if (index[field] !== undefined) options[field] = index[field];
      }
      await target.collection(collection.name).createIndex(index.key, options);
    }
  }
  await target.collection("_fitmanager_restore_lock").drop();
  return {
    target: targetName,
    collections: archive.collections.length,
    documents: archive.collections.reduce(
      (sum, c) => sum + c.documents.length,
      0,
    ),
  };
}

module.exports = { backupDatabase, restoreDatabase, readArchive };
