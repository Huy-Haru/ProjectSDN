const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const bookingResultController = require('../controllers/bookingResultController');
const { authenticate, authorize } = require('../middlewares/auth');
const { ROLES } = require('../constants/roles');

const router = express.Router();

// PATCH /api/bookings/:bookingId/result — PT liên quan hoặc Admin xác nhận completed/no_show
router.patch(
  '/:bookingId/result',
  authenticate,
  authorize(ROLES.TRAINER, ROLES.ADMIN),
  asyncHandler(bookingResultController.confirmBookingResult)
);

// GET /api/bookings/:bookingId — Chi tiết một booking (PT/Member/Admin)
router.get(
  '/:bookingId',
  authenticate,
  asyncHandler(bookingResultController.getBookingById)
);

module.exports = router;
