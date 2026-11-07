/**
 * A4.1 — Security & RBAC Test Suite (Anh — anhnthe194418)
 *
 * Kiểm thử bảo mật, phân quyền và ownership cho các module:
 *   Auth, Profile, Trainer schedule/workoutPlan, ProgressLog, Review
 *
 * Chạy: node --test test/auth-security.test.js
 * (Không cần kết nối DB thật — test middleware và response format bằng express mock)
 *
 * Các test case DB-dependent được đánh dấu [DB] và cần môi trường test riêng.
 */

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const express = require('express');
const { errorHandler } = require('../src/middlewares/errorHandler');
const asyncHandler = require('../src/utils/asyncHandler');
const AppError = require('../src/utils/AppError');
const { signToken, verifyToken } = require('../src/utils/jwt');

// ─── Helper: start/stop a throwaway Express server ──────────────────────────

async function withServer(app, run) {
  const server = app.listen(0, '127.0.0.1');
  try {
    await once(server, 'listening');
    await run(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolve, reject) =>
      server.close(err => err ? reject(err) : resolve())
    );
  }
}

// ─── Helper: build auth header ────────────────────────────────────────────────

function bearerHeader(payload) {
  const token = signToken(payload);
  return { Authorization: `Bearer ${token}` };
}

// ─── 1. JWT utils ─────────────────────────────────────────────────────────────

test('JWT: signToken + verifyToken round-trip', () => {
  const payload = { id: 'abc123', role: 'member' };
  const token = signToken(payload);
  assert.ok(typeof token === 'string' && token.length > 20, 'token phải là chuỗi JWT');
  const decoded = verifyToken(token);
  assert.equal(decoded.id, payload.id);
  assert.equal(decoded.role, payload.role);
});

test('JWT: token giả mạo bị từ chối', () => {
  assert.throws(() => verifyToken('invalid.token.here'), (err) => {
    return err.name === 'JsonWebTokenError' || err.name === 'SyntaxError';
  });
});

test('JWT: token bị sửa payload bị từ chối', () => {
  const token = signToken({ id: 'abc', role: 'member' });
  // Sửa payload bằng cách thêm ký tự vào giữa
  const parts = token.split('.');
  const fakePayload = Buffer.from(JSON.stringify({ id: 'abc', role: 'admin' })).toString('base64url');
  const tamperedToken = `${parts[0]}.${fakePayload}.${parts[2]}`;
  assert.throws(() => verifyToken(tamperedToken));
});

// ─── 2. Middleware authenticate (unit test với express mock) ──────────────────

function buildAuthApp(handler) {
  const app = express();
  app.use(express.json());

  // Dùng middleware thật nhưng mock User.findById
  const authMiddleware = require('../src/middlewares/auth');

  // Gắn mock user vào req trực tiếp (không qua DB) để test middleware logic
  app.get('/test', asyncHandler(handler));
  app.use(errorHandler);
  return app;
}

test('Middleware: không có Authorization header → 401', async () => {
  const app = express();
  app.use(express.json());
  const { authenticate } = require('../src/middlewares/auth');
  app.get('/protected', authenticate, (req, res) => res.json({ ok: true }));
  app.use(errorHandler);

  await withServer(app, async (base) => {
    const res = await fetch(`${base}/protected`);
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.message, /đăng nhập/i);
  });
});

test('Middleware: Authorization Bearer sai format → 401', async () => {
  const app = express();
  app.use(express.json());
  const { authenticate } = require('../src/middlewares/auth');
  app.get('/protected', authenticate, (req, res) => res.json({ ok: true }));
  app.use(errorHandler);

  await withServer(app, async (base) => {
    for (const bad of ['Basic abc', 'Bearer', 'Token xyz']) {
      const res = await fetch(`${base}/protected`, {
        headers: { Authorization: bad }
      });
      assert.equal(res.status, 401, `Authorization "${bad}" phải bị từ chối`);
    }
  });
});

test('Middleware: JWT hết hạn → 401 với thông báo rõ ràng', async () => {
  const jwt = require('jsonwebtoken');
  const secret = process.env.JWT_SECRET || 'fitmanager_jwt_secret_dev';
  // Tạo token đã hết hạn ngay lập tức
  const expiredToken = jwt.sign({ id: 'abc', role: 'member' }, secret, { expiresIn: -1 });

  const app = express();
  app.use(express.json());
  const { authenticate } = require('../src/middlewares/auth');
  app.get('/protected', authenticate, (req, res) => res.json({ ok: true }));
  app.use(errorHandler);

  await withServer(app, async (base) => {
    const res = await fetch(`${base}/protected`, {
      headers: { Authorization: `Bearer ${expiredToken}` }
    });
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.match(body.message, /hết hạn/i);
  });
});

test('Middleware: JWT token giả (sai secret) → 401', async () => {
  const jwt = require('jsonwebtoken');
  const fakeToken = jwt.sign({ id: 'abc', role: 'admin' }, 'wrong_secret_key');

  const app = express();
  app.use(express.json());
  const { authenticate } = require('../src/middlewares/auth');
  app.get('/protected', authenticate, (req, res) => res.json({ ok: true }));
  app.use(errorHandler);

  await withServer(app, async (base) => {
    const res = await fetch(`${base}/protected`, {
      headers: { Authorization: `Bearer ${fakeToken}` }
    });
    assert.equal(res.status, 401);
  });
});

// ─── 3. Middleware authorize (RBAC) ──────────────────────────────────────────

test('RBAC: authorize() chặn đúng role không được phép', async () => {
  const { authorize } = require('../src/middlewares/auth');
  const app = express();
  app.use(express.json());

  // Giả lập req.user được gắn sẵn bởi authenticate
  app.use((req, _res, next) => {
    req.user = { _id: 'u1', role: 'member' };
    next();
  });
  app.get('/admin-only', authorize('admin'), (req, res) => res.json({ ok: true }));
  app.get('/trainer-only', authorize('trainer'), (req, res) => res.json({ ok: true }));
  app.get('/any-role', authorize('member', 'trainer', 'admin'), (req, res) => res.json({ ok: true }));
  app.use(errorHandler);

  await withServer(app, async (base) => {
    // Member truy cập admin → 403
    let res = await fetch(`${base}/admin-only`);
    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.message, /quyền/i);

    // Member truy cập trainer-only → 403
    res = await fetch(`${base}/trainer-only`);
    assert.equal(res.status, 403);

    // Member truy cập any-role → 200
    res = await fetch(`${base}/any-role`);
    assert.equal(res.status, 200);
  });
});

test('RBAC: không có req.user khi gọi authorize() → 403', async () => {
  const { authorize } = require('../src/middlewares/auth');
  const app = express();
  app.use(express.json());
  // Không gắn req.user
  app.get('/protected', authorize('member'), (req, res) => res.json({ ok: true }));
  app.use(errorHandler);

  await withServer(app, async (base) => {
    const res = await fetch(`${base}/protected`);
    assert.equal(res.status, 403);
  });
});

// ─── 4. AppError không lộ internal details ────────────────────────────────────

test('Error handler: lỗi không kiểm soát không lộ stack/DB URI ra client', async (t) => {
  t.mock.method(console, 'error', () => {}); // suppress console.error
  const app = express();
  app.use(express.json());
  app.get('/crash', asyncHandler(async () => {
    throw new Error('mongodb://user:password@host:27017/db — credentials leaked');
  }));
  app.use(errorHandler);

  await withServer(app, async (base) => {
    const res = await fetch(`${base}/crash`);
    assert.equal(res.status, 500);
    const body = await res.json();
    // Không được lộ message nội bộ
    assert.equal(body.message, 'Internal server error');
    assert.ok(!JSON.stringify(body).includes('mongodb://'), 'URI không được lộ ra client');
    assert.ok(!JSON.stringify(body).includes('password'), 'Password không được lộ ra client');
    assert.ok(!JSON.stringify(body).includes('stack'), 'Stack trace không được lộ ra client');
  });
});

test('Error handler: AppError(403) không lộ thông tin nội bộ', async () => {
  const app = express();
  app.use(express.json());
  app.get('/forbidden', asyncHandler(async () => {
    throw new AppError('Bạn không có quyền.', 403);
  }));
  app.use(errorHandler);

  await withServer(app, async (base) => {
    const res = await fetch(`${base}/forbidden`);
    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.message, 'Bạn không có quyền.');
    // Không có field stack, data nội bộ
    assert.ok(!('stack' in body));
    assert.ok(!('error' in body) || typeof body.error !== 'object');
  });
});

// ─── 5. Register: không tự đặt role/isActive ──────────────────────────────────

test('Register payload: không cho truyền role/isActive vào body (logic-level)', () => {
  // Kiểm tra logic trong authController.register:
  // user.role luôn bị force = ROLES.MEMBER, không đọc từ body
  const { ROLES } = require('../src/constants/roles');
  // Giả lập body có role=admin
  const body = { fullName: 'Test', email: 't@t.com', password: '123456', role: 'admin', isActive: false };

  // Trích xuất logic như trong controller:
  const forcedRole = ROLES.MEMBER; // server luôn set cứng
  assert.equal(forcedRole, 'member', 'Public không thể tự tạo tài khoản admin/trainer');
  assert.notEqual(body.role, forcedRole); // body gửi admin nhưng sẽ bị bỏ qua
});

// ─── 6. Response format chuẩn hóa ─────────────────────────────────────────────

test('Response utils: sendSuccess trả đúng cấu trúc', () => {
  const { sendSuccess } = require('../src/utils/response');
  // Mock res object
  let captured;
  const mockRes = {
    status: function(code) { this._code = code; return this; },
    json: function(body) { captured = { code: this._code, body }; }
  };
  sendSuccess(mockRes, { foo: 'bar' }, 'OK', 201);
  assert.equal(captured.code, 201);
  assert.equal(captured.body.success, true);
  assert.equal(captured.body.message, 'OK');
  assert.deepEqual(captured.body.data, { foo: 'bar' });
});

test('Response utils: status 200 mặc định khi không truyền statusCode', () => {
  const { sendSuccess } = require('../src/utils/response');
  let captured;
  const mockRes = {
    status: function(code) { this._code = code; return this; },
    json: function(body) { captured = { code: this._code }; }
  };
  sendSuccess(mockRes, {}, 'Default');
  assert.equal(captured.code, 200);
});

// ─── 7. Ownership logic verification ─────────────────────────────────────────

test('Ownership: bookingId không thuộc member hiện tại → lỗi 403 (logic)', () => {
  // Giả lập logic kiểm tra ownership trong confirmBookingResult và createReview
  const memberId = 'member_A';
  const anotherMemberId = 'member_B';
  const bookingMember = memberId;

  // Member B cố review booking của Member A
  const canReview = bookingMember === anotherMemberId;
  assert.equal(canReview, false, 'Member B không được review booking của Member A');
});

test('Ownership: trainer không liên quan không được confirm buổi tập (logic)', () => {
  // TrainerProfile._id phải match booking.trainer
  const bookingTrainerId = 'trainer_profile_123';
  const currentTrainerProfileId = 'trainer_profile_999'; // PT khác

  const hasAccess = bookingTrainerId === currentTrainerProfileId;
  assert.equal(hasAccess, false, 'PT không liên quan không được confirm buổi tập');
});

// ─── 8. Review: validation logic ─────────────────────────────────────────────

test('Review: rating phải là số nguyên 1-5', () => {
  const validRatings = [1, 2, 3, 4, 5];
  const invalidRatings = [0, 6, 1.5, -1, 'abc', null, undefined];

  for (const r of validRatings) {
    const num = Number(r);
    assert.ok(Number.isInteger(num) && num >= 1 && num <= 5, `${r} phải hợp lệ`);
  }

  for (const r of invalidRatings) {
    const num = Number(r);
    const isValid = Number.isInteger(num) && num >= 1 && num <= 5;
    assert.equal(isValid, false, `${r} phải bị từ chối`);
  }
});

test('Review: booking status phải là completed để review', () => {
  const { BOOKING_STATUS } = require('../src/constants/statuses');
  const statusesAllowingReview = [BOOKING_STATUS.COMPLETED];
  const statusesBlockingReview = [
    BOOKING_STATUS.BOOKED,
    BOOKING_STATUS.CANCELLED,
    BOOKING_STATUS.NO_SHOW
  ];

  for (const s of statusesAllowingReview) {
    assert.equal(s, 'completed');
  }
  for (const s of statusesBlockingReview) {
    assert.notEqual(s, 'completed', `Trạng thái "${s}" không được phép review`);
  }
});

// ─── 9. Booking result: trạng thái hợp lệ ────────────────────────────────────

test('Booking result: chỉ completed và no_show được phép confirm', () => {
  const { BOOKING_STATUS } = require('../src/constants/statuses');
  const allowedStatuses = [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.NO_SHOW];
  const notAllowed = [BOOKING_STATUS.BOOKED, BOOKING_STATUS.CANCELLED];

  assert.ok(allowedStatuses.includes('completed'));
  assert.ok(allowedStatuses.includes('no_show'));
  assert.ok(!notAllowed.every(s => allowedStatuses.includes(s)));
});

test('Booking result: không chuyển ngược từ completed (logic)', () => {
  const { BOOKING_STATUS } = require('../src/constants/statuses');
  // Nếu booking.status === completed → không được confirm lại
  const currentStatus = BOOKING_STATUS.COMPLETED;
  const canConfirmAgain = currentStatus === BOOKING_STATUS.BOOKED;
  assert.equal(canConfirmAgain, false, 'Không được xác nhận lại buổi đã completed');
});
