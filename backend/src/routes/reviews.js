const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const reviewController = require('../controllers/reviewController');
const { authenticate, authorize } = require('../middlewares/auth');
const { ROLES } = require('../constants/roles');

const router = express.Router();

// POST /api/reviews — Member gửi đánh giá (booking completed + unique)
router.post(
  '/',
  authenticate,
  authorize(ROLES.MEMBER),
  asyncHandler(reviewController.createReview)
);

// GET /api/reviews/my-trainer-reviews — PT xem tất cả reviews của mình
router.get(
  '/my-trainer-reviews',
  authenticate,
  authorize(ROLES.TRAINER),
  asyncHandler(reviewController.getMyTrainerReviews)
);

// GET /api/reviews/booking/:bookingId — Review của một booking cụ thể
router.get(
  '/booking/:bookingId',
  authenticate,
  asyncHandler(reviewController.getBookingReview)
);

// GET /api/reviews/trainer/:trainerId — Danh sách reviews + điểm tổng hợp của PT (public)
router.get(
  '/trainer/:trainerId',
  asyncHandler(reviewController.getTrainerReviews)
);

module.exports = router;
