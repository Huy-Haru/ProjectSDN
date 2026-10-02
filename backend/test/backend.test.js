const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { spawn } = require('node:child_process');
const path = require('node:path');
const express = require('express');
const createApp = require('../src/app');
const { readEnvironment } = require('../src/config/environment');
const { errorHandler } = require('../src/middlewares/errorHandler');
const asyncHandler = require('../src/utils/asyncHandler');
const AppError = require('../src/utils/AppError');

const corsOrigin = 'http://localhost:5173';

async function withServer(app, run) {
  const server = app.listen(0, '127.0.0.1');
  try {
    await once(server, 'listening');
    await run(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
      server.closeIdleConnections();
    });
  }
}

test('environment rejects missing database, bad ports and invalid origins', () => {
  const base = { MONGO_URI: 'mongodb://127.0.0.1:27017/test', CORS_ORIGIN: corsOrigin };
  assert.equal(readEnvironment(base).port, 9999);
  assert.equal(readEnvironment({ ...base, PORT: '5000' }).port, 5000);
  assert.throws(() => readEnvironment({ CORS_ORIGIN: corsOrigin }), /MONGO_URI/);
  assert.throws(() => readEnvironment({ ...base, MONGO_URI: 'https://example.com' }), /MONGO_URI/);
  for (const PORT of ['0', '-1', '65536', 'abc', '1.5']) {
    assert.throws(() => readEnvironment({ ...base, PORT }), /PORT/);
  }
  assert.throws(() => readEnvironment({ ...base, CORS_ORIGIN: '' }), /CORS_ORIGIN/);
  assert.throws(() => readEnvironment({ ...base, CORS_ORIGIN: corsOrigin + '/' }), /CORS_ORIGIN/);
});

test('HTTP routes and middleware return consistent responses', async (t) => {
  await withServer(createApp({ corsOrigin }), async (baseUrl) => {
    await t.test('welcome and CORS', async () => {
      const response = await fetch(baseUrl, { headers: { Origin: corsOrigin } });
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('access-control-allow-origin'), corsOrigin);
      assert.equal(response.headers.get('x-powered-by'), null);
      assert.deepEqual(await response.json(), {
        success: true, message: 'Welcome to ProjectSDN API', data: {},
      });
    });

    await t.test('CORS preflight', async () => {
      const response = await fetch(baseUrl + '/api/health', {
        method: 'OPTIONS',
        headers: { Origin: corsOrigin, 'Access-Control-Request-Method': 'GET' },
      });
      assert.equal(response.status, 204);
      assert.equal(response.headers.get('access-control-allow-origin'), corsOrigin);
    });

    await t.test('missing route', async () => {
      const response = await fetch(baseUrl + '/api/does-not-exist');
      assert.equal(response.status, 404);
      assert.deepEqual(await response.json(), { success: false, message: 'Route not found' });
    });

    await t.test('invalid JSON', async () => {
      const response = await fetch(baseUrl, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad',
      });
      assert.equal(response.status, 400);
      assert.deepEqual(await response.json(), { success: false, message: 'Invalid JSON body' });
    });

    await t.test('oversized body', async () => {
      const response = await fetch(baseUrl, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'a'.repeat(1024 * 1024) }),
      });
      assert.equal(response.status, 413);
      assert.deepEqual(await response.json(), { success: false, message: 'Request body is too large' });
    });

    await t.test('health reports unavailable MongoDB instead of false success', async () => {
      const response = await fetch(baseUrl + '/api/health');
      assert.equal(response.status, 503);
      assert.deepEqual(await response.json(), { success: false, message: 'MongoDB is unavailable' });
    });
  });
});

test('Express 4 forwards rejected promises to centralized error handling', async () => {
  const app = express();
  app.get('/', asyncHandler(async () => {
    throw new AppError('Example validation failed', 422);
  }));
  app.use(errorHandler);
  await withServer(app, async (baseUrl) => {
    const response = await fetch(baseUrl);
    assert.equal(response.status, 422);
    assert.deepEqual(await response.json(), { success: false, message: 'Example validation failed' });
  });
});

test('unexpected errors do not expose internal details to the client', async (t) => {
  t.mock.method(console, 'error', () => {});
  const app = express();
  app.get('/', asyncHandler(async () => {
    throw new Error('Internal database credentials');
  }));
  app.use(errorHandler);
  await withServer(app, async (baseUrl) => {
    const response = await fetch(baseUrl);
    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), { success: false, message: 'Internal server error' });
  });
});

test('server exits instead of opening HTTP when MongoDB is unreachable', { timeout: 12000 }, async () => {
  const child = spawn(process.execPath, [path.resolve(__dirname, '../src/server.js')], {
    env: {
      ...process.env,
      MONGO_URI: 'mongodb://127.0.0.1:1/unreachable',
      PORT: '9999',
      CORS_ORIGIN: corsOrigin,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stdout.on('data', (chunk) => { output += chunk; });
  child.stderr.on('data', (chunk) => { output += chunk; });
  const timeout = setTimeout(() => child.kill(), 10000);
  try {
    const [code] = await once(child, 'exit');
    assert.equal(code, 1);
    assert.match(output, /Backend startup failed/);
    assert.doesNotMatch(output, /Backend listening/);
    assert.doesNotMatch(output, /mongodb:\/\//);
  } finally {
    clearTimeout(timeout);
    if (child.exitCode === null) child.kill();
  }
});
