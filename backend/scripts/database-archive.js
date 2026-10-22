const path = require("node:path");
const mongoose = require("mongoose");
const {
  loadEnvironment,
  readEnvironment,
} = require("../src/config/environment");
const {
  backupDatabase,
  restoreDatabase,
} = require("../src/utils/databaseArchive");

async function run() {
  const [mode, file, target, confirmation] = process.argv.slice(2);
  if (!["backup", "restore"].includes(mode) || !file)
    throw new Error(
      "Usage: node scripts/database-archive.js backup <file> --maintenance | restore <file> fitmanager_restore_<name>",
    );
  // Backup reads multiple collections sequentially: the operator must stop application writers first.
  if (mode === "backup" && target !== "--maintenance")
    throw new Error("Stop all application writers, then pass --maintenance.");
  if (confirmation) throw new Error("Unexpected argument.");
  loadEnvironment();
  const env = readEnvironment();
  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 5000,
    autoIndex: false,
  });
  const result =
    mode === "backup"
      ? await backupDatabase(mongoose.connection.db, path.resolve(file))
      : await restoreDatabase(
          mongoose.connection.getClient(),
          path.resolve(file),
          target,
        );
  console.log(JSON.stringify(result));
}
run()
  .catch((error) => {
    console.error("Archive operation failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
