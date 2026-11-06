const { loadEnvironment } = require("../src/config/environment");
const { readRuntime } = require("../src/config/runtime");
try {
  loadEnvironment();
  readRuntime();
  console.log(
    "PASS: MongoDB URI shape, HTTP port, frontend origin and JWT settings are valid. No secret values were printed.",
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
