const mongoose = require("mongoose");
const {
  loadEnvironment,
  readEnvironment,
} = require("../src/config/environment");
async function run() {
  loadEnvironment();
  const env = readEnvironment();
  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD)
    throw new Error(
      "Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 8 characters) before running.",
    );
  await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 5000 });
  const User = require("../src/models/User");
  await User.init();
  if (await User.exists({ email: ADMIN_EMAIL.toLowerCase().trim() }))
    throw new Error("Email already exists; no existing account was changed.");
  await User.create({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    fullName: ADMIN_NAME || "Quản trị viên",
    role: "admin",
  });
  console.log("Admin account created.");
}
run()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
