const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { authenticate, authorize } = require('../middlewares/auth');
const asyncHandler = require('../utils/asyncHandler');
const { ROLES } = require('../constants/roles');

/**
 * POST /api/subscriptions
 * Đăng ký gói tập mới (Chỉ dành cho Member)
 */
router.post(
  '/',
  authenticate,
  authorize(ROLES.MEMBER),
  asyncHandler(subscriptionController.createSubscription)
);

/**
 * GET /api/subscriptions/my
 * Xem danh sách tất cả các gói của Member
 */
router.get(
  '/my',
  authenticate,
  authorize(ROLES.MEMBER),
  asyncHandler(subscriptionController.getMySubscriptions)
);

/**
 * GET /api/subscriptions/active
 * Xem gói đang có hiệu lực hiện tại của Member
 */
router.get(
  '/active',
  authenticate,
  authorize(ROLES.MEMBER),
  asyncHandler(subscriptionController.getActiveSubscription)
);

/**
 * GET /api/subscriptions/usage
 * Xem thống kê hạn mức buổi tập của gói hiện tại
 */
router.get(
  '/usage',
  authenticate,
  authorize(ROLES.MEMBER),
  asyncHandler(subscriptionController.getMySubscriptionUsage)
);

/**
 * GET /api/subscriptions/:id
 * Xem chi tiết 1 gói đăng ký
 */
router.get(
  '/:id',
  authenticate,
  authorize(ROLES.MEMBER),
  asyncHandler(subscriptionController.getSubscriptionById)
);

/**
 * PATCH /api/subscriptions/:id/cancel
 * Member hủy yêu cầu đăng ký gói chưa thanh toán
 */
router.patch(
  '/:id/cancel',
  authenticate,
  authorize(ROLES.MEMBER),
  asyncHandler(subscriptionController.cancelSubscription)
);

module.exports = router;
