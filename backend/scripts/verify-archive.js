const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const mongoose = require("mongoose");
const {
  backupDatabase,
  restoreDatabase,
} = require("../src/utils/databaseArchive");
const suffix = crypto.randomBytes(8).toString("hex");
const source = "fitmanager_archive_test_" + suffix;
const target = "fitmanager_restore_test_" + suffix;
let directory;
async function run() {
  await mongoose.connect("mongodb://127.0.0.1:27017/" + source, {
    serverSelectionTimeoutMS: 5000,
  });
  directory = await fs.mkdtemp(path.join(os.tmpdir(), "fitmanager-archive-"));
  const db = mongoose.connection.db,
    file = path.join(directory, "backup.ejson.gz");
  const id = new mongoose.Types.ObjectId(),
    timestamp = new Date("2026-10-23T10:00:00Z");
  await db
    .collection("users")
    .insertOne({
      _id: id,
      email: "archive@test.example",
      createdAt: timestamp,
      nested: { values: ["PT", 5] },
    });
  await db
    .collection("users")
    .createIndex({ email: 1 }, { unique: true, name: "unique_email" });
  await db
    .collection("bookings")
    .insertOne({ member: id, status: "booked", date: timestamp });
  await db
    .collection("bookings")
    .createIndex(
      { member: 1, date: 1 },
      {
        unique: true,
        name: "held_slot",
        partialFilterExpression: { status: { $in: ["booked", "completed"] } },
      },
    );
  const result = await backupDatabase(db, file);
  assert.equal(result.documents, 2);
  assert.equal(result.sha256.length, 64);
  await assert.rejects(
    backupDatabase(db, file),
    (error) => error.code === "EEXIST",
  );
  await assert.rejects(
    restoreDatabase(mongoose.connection.getClient(), file, source),
  );
  await assert.rejects(
    restoreDatabase(mongoose.connection.getClient(), file, "fitmanager"),
  );
  await restoreDatabase(mongoose.connection.getClient(), file, target);
  const restored = mongoose.connection.getClient().db(target);
  const user = await restored.collection("users").findOne({ _id: id });
  assert.equal(user.createdAt.toISOString(), timestamp.toISOString());
  assert.deepEqual(user.nested.values, ["PT", 5]);
  assert.equal(
    (await restored.collection("bookings").findOne({})).member.toHexString(),
    id.toHexString(),
  );
  for (const name of ["users", "bookings"]) {
    assert.equal(
      await restored.collection(name).countDocuments(),
      await db.collection(name).countDocuments(),
    );
    assert.deepEqual(
      await restored.collection(name).indexes(),
      await db.collection(name).indexes(),
    );
  }
  await assert.rejects(
    restored.collection("users").insertOne({ email: "archive@test.example" }),
    (error) => error.code === 11000,
  );
  await assert.rejects(
    restoreDatabase(mongoose.connection.getClient(), file, target),
    /already exists/,
  );
  assert.equal(await db.collection("users").countDocuments(), 1);
  console.log(
    "PASS: logical backup/restore preserves BSON ObjectId/Date, nested values, counts, unique/partial indexes; rejects overwrite and existing restore target.",
  );
}
run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (
      mongoose.connection.readyState === 1 &&
      mongoose.connection.name === source &&
      /^fitmanager_archive_test_[a-f0-9]{16}$/.test(source)
    ) {
      await mongoose.connection.getClient().db(target).dropDatabase();
      await mongoose.connection.db.dropDatabase();
    }
    await mongoose.disconnect();
    if (
      directory &&
      path.basename(directory).startsWith("fitmanager-archive-") &&
      path.dirname(directory) === os.tmpdir()
    )
      await fs.rm(directory, { recursive: true });
  });
