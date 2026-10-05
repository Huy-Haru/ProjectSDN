const { once } = require('node:events');
const env = require('./config/environment');
const { connectDB, disconnectDB } = require('./config/database');
const createApp = require('./app');

async function startServer() {
  await connectDB(env.MONGODB_URI);

  const app = createApp({ corsOrigin: env.CORS_ORIGIN });
  const server = app.listen(env.PORT);
  await once(server, 'listening');
  console.log(`Backend listening on port ${env.PORT}`);

  let shuttingDown = false;
  const shutdown = () => {
    if (shuttingDown) return;
    shuttingDown = true;
    const timeout = setTimeout(() => process.exit(1), 10000);
    timeout.unref();
    server.close(async () => {
      try {
        await disconnectDB();
        clearTimeout(timeout);
      } catch {
        process.exitCode = 1;
      }
    });
    server.closeIdleConnections();
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
  return server;
}

if (require.main === module) {
  startServer().catch(async () => {
    console.error('Backend startup failed. Check .env, MongoDB availability and whether PORT is in use.');
    await disconnectDB().catch(() => {});
    process.exitCode = 1;
  });
}

module.exports = { startServer };
