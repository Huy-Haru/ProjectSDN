const Review = require('../models/Review');
const Booking = require('../models/Booking');
const TrainerProfile = require('../models/TrainerProfile');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/response');
const { ROLES } = require('../constants/roles');
const { BOOKING_STATUS } = require('../constants/statuses');

/**
 * POST /api/reviews
 * Member gửi đánh giá PT sau khi booking completed.
 * Điều kiện:
 *  - booking phải là của chính member gửi
 *  - booking.status === completed
 *  - booking chưa có review (unique)
 *  - rating nguyên 1-5
 */
async function createReview(req, res) {
  const user = req.user;

  if (user.role !== ROLES.MEMBER) {
    throw new AppError('Chỉ học viên mới có thể gửi đánh giá.', 403);
  }

  const { bookingId, rating, comment } = req.body;

  if (!bookingId || !rating) {
    throw new AppError('bookingId và rating là bắt buộc.', 400);
  }

  const ratingNum = Number(rating);
  if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    throw new AppError('Rating phải là số nguyên từ 1 đến 5.', 400);
  }

  // Tìm booking và kiểm tra quyền sở hữu
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new AppError('Lịch đặt không tồn tại.', 404);
  }

  if (!booking.member.equals(user._id)) {
    throw new AppError('Bạn không có quyền đánh giá buổi tập này.', 403);
  }

  if (booking.status !== BOOKING_STATUS.COMPLETED) {
    throw new AppError('Chỉ có thể đánh giá buổi tập đã hoàn thành.', 400);
  }

  // Kiểm tra đã review chưa (unique per booking)
  const existingReview = await Review.findOne({ booking: bookingId });
  if (existingReview) {
    throw new AppError('Bạn đã đánh giá buổi tập này rồi.', 409);
  }

  const review = await Review.create({
    member: user._id,
    trainer: booking.trainer,
    booking: bookingId,
    rating: ratingNum,
    comment: comment?.trim()
  });

  // Populate để trả về đầy đủ thông tin
  await review.populate('member', 'fullName avatar');

  return sendSuccess(res, { review }, 'Đánh giá thành công!', 201);
}

/**
 * GET /api/reviews/trainer/:trainerId
 * Lấy danh sách reviews và điểm tổng hợp của một PT.
 * Public (không cần auth) — ai cũng xem được.
 */
async function getTrainerReviews(req, res) {
  const { trainerId } = req.params;

  // Tìm TrainerProfile
  const trainerProfile = await TrainerProfile.findById(trainerId)
    .populate('user', 'fullName email avatar');

  if (!trainerProfile) {
    throw new AppError('Huấn luyện viên không tồn tại.', 404);
  }

  const reviews = await Review.find({ trainer: trainerId })
    .populate('member', 'fullName avatar')
    .sort({ createdAt: -1 });

  return sendSuccess(res, {
    trainerProfile,
    reviews,
    summary: {
      ratingAverage: trainerProfile.ratingAverage,
      ratingCount: trainerProfile.ratingCount
    }
  });
}

/**
 * GET /api/reviews/my-trainer-reviews
 * PT xem tất cả reviews về mình (kèm điểm tổng hợp)
 */
async function getMyTrainerReviews(req, res) {
  const user = req.user;

  if (user.role !== ROLES.TRAINER) {
    throw new AppError('Chỉ huấn luyện viên mới có thể xem đánh giá của mình.', 403);
  }

  const trainerProfile = await TrainerProfile.findOne({ user: user._id });
  if (!trainerProfile) {
    throw new AppError('Hồ sơ huấn luyện viên không tồn tại.', 404);
  }

  const reviews = await Review.find({ trainer: trainerProfile._id })
    .populate('member', 'fullName avatar email')
    .populate('booking', 'date startTime')
    .sort({ createdAt: -1 });

  return sendSuccess(res, {
    reviews,
    summary: {
      ratingAverage: trainerProfile.ratingAverage,
      ratingCount: trainerProfile.ratingCount
    }
  });
}

/**
 * GET /api/reviews/booking/:bookingId
 * Lấy review của một booking cụ thể (nếu có)
 * Member sở hữu, PT liên quan hoặc Admin mới xem được
 */
async function getBookingReview(req, res) {
  const { bookingId } = req.params;
  const user = req.user;

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new AppError('Lịch đặt không tồn tại.', 404);
  }

  // Kiểm tra quyền
  if (user.role === ROLES.MEMBER && !booking.member.equals(user._id)) {
    throw new AppError('Bạn không có quyền xem đánh giá này.', 403);
  }
  if (user.role === ROLES.TRAINER) {
    const trainerProfile = await TrainerProfile.findOne({ user: user._id });
    if (!trainerProfile || !trainerProfile._id.equals(booking.trainer)) {
      throw new AppError('Bạn không có quyền xem đánh giá này.', 403);
    }
  }

  const review = await Review.findOne({ booking: bookingId })
    .populate('member', 'fullName avatar');

  return sendSuccess(res, { review: review || null });
}

module.exports = {
  createReview,
  getTrainerReviews,
  getMyTrainerReviews,
  getBookingReview
};
