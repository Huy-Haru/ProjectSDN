const mongoose = require('mongoose');
const { Review, Booking, TrainerProfile } = require('../models');
const AppError = require('../utils/AppError');
const populateTrainer = { path: 'trainer', select: 'user', populate: { path: 'user', select: 'fullName' } };
const ended = booking => new Date(`${booking.date.toISOString().slice(0, 10)}T${booking.endTime}:00+07:00`) <= new Date();

async function memberReviews(member) {
  const reviewedIds = await Review.find({ member }).distinct('booking');
  const [reviews, completed] = await Promise.all([
    Review.find({ member }).populate(populateTrainer).populate('booking', 'date startTime endTime').sort({ createdAt: -1, _id: -1 }),
    Booking.find({ member, status: 'completed', _id: { $nin: reviewedIds } }).populate(populateTrainer).sort({ date: -1, startTime: -1 })
  ]);
  return { reviews, eligible: completed.filter(ended) };
}
async function create(member, body) {
  if (typeof body.bookingId !== 'string' || !mongoose.isObjectIdOrHexString(body.bookingId)) throw new AppError('Lịch tập không hợp lệ.', 400);
  if (!Number.isInteger(body.rating) || body.rating < 1 || body.rating > 5) throw new AppError('Chọn số sao nguyên từ 1 đến 5.', 400);
  if (body.comment !== undefined && (typeof body.comment !== 'string' || body.comment.length > 2000)) throw new AppError('Nhận xét tối đa 2000 ký tự.', 400);
  const booking = await Booking.findOne({ _id: body.bookingId, member });
  if (!booking) throw new AppError('Không tìm thấy buổi tập của bạn.', 404);
  if (booking.status !== 'completed' || !ended(booking)) throw new AppError('Chỉ đánh giá buổi tập đã hoàn thành và kết thúc.', 409);
  return Review.create({ member, trainer: booking.trainer, booking: booking._id, rating: body.rating, comment: body.comment?.trim() || '' });
}
async function trainerReviews(userId) {
  const trainer = await TrainerProfile.findOne({ user: userId });
  if (!trainer) throw new AppError('Không tìm thấy hồ sơ PT.', 404);
  const reviews = await Review.find({ trainer: trainer._id }).populate('member', 'fullName')
    .populate('booking', 'date startTime endTime').sort({ createdAt: -1, _id: -1 });
  const count = reviews.length;
  return { reviews, summary: { count, average: count ? Math.round(reviews.reduce((sum, review) => sum + review.rating, 0) / count * 10) / 10 : 0 } };
}
module.exports = { memberReviews, create, trainerReviews };
