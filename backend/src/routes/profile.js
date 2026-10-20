const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const profileController = require('../controllers/profileController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

// Tất cả routes profile đều yêu cầu đăng nhập
router.use(authenticate);

// GET  /api/profile/me           — Xem profile của mình
router.get('/me', asyncHandler(profileController.getMyProfile));

// PATCH /api/profile/me          — Cập nhật profile cá nhân (whitelist fields)
router.patch('/me', asyncHandler(profileController.updateMyProfile));

// PATCH /api/profile/trainer     — Trainer cập nhật TrainerProfile
router.patch('/trainer', asyncHandler(profileController.updateTrainerProfile));

// POST /api/profile/change-password — Đổi mật khẩu (yêu cầu mật khẩu cũ)
router.post('/change-password', asyncHandler(profileController.changePassword));

module.exports = router;
