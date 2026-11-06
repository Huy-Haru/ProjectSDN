const path = require('node:path');
const dotenv = require('dotenv');
function loadEnvironment() { dotenv.config({ path: path.resolve(__dirname, '../../.env') }); }
function readEnvironment(env = process.env) {
  const mongoUri = env.MONGODB_URI || env.MONGO_URI;
  if (!mongoUri || !/^mongodb(?:\+srv)?:\/\//.test(mongoUri)) throw new Error('MONGODB_URI (legacy MONGO_URI) must be a MongoDB connection string.');
  const port = Number(env.PORT || 5000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be an integer between 1 and 65535.');
  if (!env.CORS_ORIGIN) throw new Error('CORS_ORIGIN is required.');
  const origin = new URL(env.CORS_ORIGIN);
  if (!['http:', 'https:'].includes(origin.protocol) || origin.origin !== env.CORS_ORIGIN) throw new Error('CORS_ORIGIN must be an HTTP(S) origin without a trailing slash.');
  return { port, mongoUri, corsOrigin: env.CORS_ORIGIN };
}
module.exports = { loadEnvironment, readEnvironment };
