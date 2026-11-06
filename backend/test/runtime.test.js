const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readRuntime } = require("../src/config/runtime");
const base = {
  MONGODB_URI: "mongodb://127.0.0.1:27017/fitmanager",
  CORS_ORIGIN: "http://localhost:3000",
  JWT_SECRET: "a".repeat(48),
};

test("runtime fails fast for missing/placeholder secrets and invalid session lifetimes", () => {
  assert.equal(readRuntime(base).port, 5000);
  for (const JWT_SECRET of [
    "",
    "short",
    "your_placeholder_secret_that_is_long_enough",
  ])
    assert.throws(() => readRuntime({ ...base, JWT_SECRET }), /JWT_SECRET/);
  for (const JWT_EXPIRES_IN of ["0h", "-1d", "abc", "8d", "999999h", "1000"])
    assert.throws(
      () => readRuntime({ ...base, JWT_EXPIRES_IN }),
      /JWT_EXPIRES_IN/,
    );
  for (const JWT_EXPIRES_IN of ["30m", "1h", "7d"])
    assert.equal(readRuntime({ ...base, JWT_EXPIRES_IN }).port, 5000);
});
