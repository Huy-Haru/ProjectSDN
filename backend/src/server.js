const { once } = require('node:events');
const { loadEnvironment, readEnvironment } = require('./config/environment');
const { connectDatabase, disconnectDatabase } = require('./config/database');
const createApp = require('./app');

async function startServer() {
  loadEnvironment();
  const config = readEnvironment();
  await connectDatabase(config.mongoUri);

  const app = createApp(config);
  const server = app.listen(config.port);
  await once(server, 'listening');
  console.log(`Backend listening on port ${config.port}; MongoDB connected.`);

  let shuttingDown = false;
  const shutdown = () => {
    if (shuttingDown) return;
    shuttingDown = true;
    const timeout = setTimeout(() => process.exit(1), 10000);
    timeout.unref();
    server.close(async () => {
      try {
        await disconnectDatabase();
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
    await disconnectDatabase().catch(() => {});
    process.exitCode = 1;
  });
}

module.exports = { startServer };
