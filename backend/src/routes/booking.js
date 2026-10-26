const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticate, authorize } = require('../middlewares/auth');
const asyncHandler = require('../utils/asyncHandler');
const { ROLES } = require('../constants/roles');

/**
 * POST /api/bookings
 * Member đặt lịch tập với PT
 */
router.post(
  '/',
  authenticate,
  authorize(ROLES.MEMBER),
  asyncHandler(bookingController.createBooking)
);

/**
 * GET /api/bookings/my
 * Xem danh sách lịch tập của Member
 */
router.get(
  '/my',
  authenticate,
  authorize(ROLES.MEMBER),
  asyncHandler(bookingController.getMyBookings)
);

/**
 * PATCH /api/bookings/:id/cancel
 * Member hủy lịch tập đã đặt
 */
router.patch(
  '/:id/cancel',
  authenticate,
  authorize(ROLES.MEMBER),
  asyncHandler(bookingController.cancelBooking)
);

module.exports = router;
