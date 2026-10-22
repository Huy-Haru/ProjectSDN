const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

// POST /api/auth/register — Đăng ký tài khoản member mới (public)
router.post('/register', asyncHandler(authController.register));

// POST /api/auth/login — Đăng nhập (public)
router.post('/login', asyncHandler(authController.login));

// POST /api/auth/logout — Đăng xuất (yêu cầu đang đăng nhập)
router.post('/logout', authenticate, asyncHandler(authController.logout));

// GET /api/auth/me — Lấy thông tin user hiện tại (yêu cầu đang đăng nhập)
router.get('/me', authenticate, asyncHandler(authController.me));

module.exports = router;
