const jwt = require("jsonwebtoken");
const { readEnvironment } = require("./environment");

function readRuntime(env = process.env) {
  const config = readEnvironment(env);
  if (
    typeof env.JWT_SECRET !== "string" ||
    env.JWT_SECRET.length < 32 ||
    /^(your_|change[-_]?me|replace[-_]?me)/i.test(env.JWT_SECRET)
  ) {
    throw new Error(
      "JWT_SECRET must be a private random string of at least 32 characters.",
    );
  }
  const lifetime = env.JWT_EXPIRES_IN || "7d";
  // Limit session lifetime and reject JWT option errors before accepting HTTP traffic.
  if (!/^([1-9]\d{0,5})(s|m|h|d)$/.test(lifetime))
    throw new Error("JWT_EXPIRES_IN must be a duration such as 1h or 7d.");
  const [, value, unit] = lifetime.match(/^(\d+)([smhd])$/);
  const seconds = Number(value) * { s: 1, m: 60, h: 3600, d: 86400 }[unit];
  if (seconds > 7 * 86400)
    throw new Error("JWT_EXPIRES_IN must not exceed 7 days.");
  jwt.sign({ check: true }, env.JWT_SECRET, {
    expiresIn: lifetime,
    algorithm: "HS256",
  });
  return config;
}

module.exports = { readRuntime };
