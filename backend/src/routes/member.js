const express = require('express');
const mongoose = require('mongoose');
const { authenticate, authorize } = require('../middlewares/auth');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/response');
const MembershipPackage = require('../models/MembershipPackage');
const Subscription = require('../models/Subscription');
const router = express.Router();

router.get('/packages', asyncHandler(async (req, res) => {
  const packages = await MembershipPackage.find({ isActive: true }).sort({ price: 1, _id: 1 });
  return sendSuccess(res, { packages });
}));

router.use(authenticate, authorize('member'));
router.get('/subscriptions', asyncHandler(async (req, res) => {
  const subscriptions = await Subscription.find({ member: req.user._id })
    .populate('package', 'name durationDays includesPT sessionLimit').sort({ createdAt: -1, _id: -1 });
  return sendSuccess(res, { subscriptions });
}));

router.get('/check-in-qr', asyncHandler(async (req, res) => {
  const active = await Subscription.findActiveByMember(req.user._id).populate('package', 'name includesPT');
  if (!active) return sendSuccess(res, { available: false, qrData: null, subscription: null });
  const qrData = JSON.stringify({ type: 'FITMANAGER_CHECK_IN', memberId: String(req.user._id), subscriptionId: String(active._id), validUntil: active.endDate.toISOString() });
  return sendSuccess(res, { available: true, qrData, subscription: active });
}));

router.post('/subscriptions', asyncHandler(async (req, res) => {
  if (typeof req.body.packageId !== 'string' || !mongoose.isObjectIdOrHexString(req.body.packageId)) {
    throw new AppError('Vui lòng chọn gói tập hợp lệ.', 400);
  }
  const pkg = await MembershipPackage.findOne({ _id: req.body.packageId, isActive: true });
  if (!pkg) throw new AppError('Gói tập không tồn tại hoặc đã ngừng đăng ký.', 404);
  // Start at today's midnight in Vietnam; never accept price, owner or payment from the client.
  const today = new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10);
  const date = req.body.startDate || today;
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      Number.isNaN(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date || date < today) {
    throw new AppError('Ngày bắt đầu phải hợp lệ và không trước hôm nay.', 400);
  }
  const startDate = new Date(date + 'T00:00:00+07:00');
  const endDate = new Date(startDate.getTime() + pkg.durationDays * 86400000);
  if (Number.isNaN(endDate.getTime())) throw new AppError('Thời hạn gói không hợp lệ.', 400);
  const subscription = await Subscription.create({
    member: req.user._id, package: pkg._id, startDate, endDate,
    amount: pkg.price, status: 'pending', paymentStatus: 'unpaid',
    includesPT: pkg.includesPT, sessionLimit: pkg.sessionLimit, reservedSessions: 0
  });
  return sendSuccess(res, { subscription }, 'Đã gửi đăng ký. Vui lòng thanh toán tại quầy để Admin xác nhận.', 201);
}));

const bookingService = require('../services/memberBookingService');
const reviewService = require('../services/reviewService');
const WorkoutPlan = require('../models/WorkoutPlan');
const WorkoutSubmission = require('../models/WorkoutSubmission');
router.get('/reviews', asyncHandler(async (req, res) => sendSuccess(res, await reviewService.memberReviews(req.user._id))));
router.post('/reviews', asyncHandler(async (req, res) => sendSuccess(res, { review: await reviewService.create(req.user._id, req.body) }, 'Đã gửi đánh giá.', 201)));
router.get('/progress', asyncHandler(async (req, res) => sendSuccess(res, { logs: await require('../services/progressService').listForMember(req.user._id) })));
router.get('/workout-submissions', asyncHandler(async (req, res) => {
  const submissions = await WorkoutSubmission.find({ member: req.user._id }).sort({ completedOn: -1, createdAt: -1 });
  return sendSuccess(res, { submissions });
}));
router.post('/workout-submissions', asyncHandler(async (req, res) => {
  const { planId, exerciseName, completedOn, proofUrl, note } = req.body;
  if (!planId || !exerciseName || !completedOn || !proofUrl) throw new AppError('Vui lòng chọn bài tập, ngày hoàn thành và đường dẫn bằng chứng.', 400);
  if (!/^https?:\/\//i.test(proofUrl)) throw new AppError('Đường dẫn bằng chứng phải bắt đầu bằng http:// hoặc https://.', 400);
  const plan = await WorkoutPlan.findOne({ _id: planId, member: req.user._id });
  if (!plan) throw new AppError('Giáo án không tồn tại hoặc không thuộc về bạn.', 404);
  const item = plan.items.find(entry => entry.exerciseName === exerciseName);
  if (!item) throw new AppError('Bài tập không thuộc giáo án đã chọn.', 400);
  const submission = await WorkoutSubmission.create({ plan: plan._id, member: req.user._id, exerciseName, completedOn: new Date(completedOn), proofUrl: proofUrl.trim(), note: note?.trim() });
  return sendSuccess(res, { submission }, 'Đã gửi bằng chứng buổi tập.', 201);
}));
router.get('/trainers', asyncHandler(async (req, res) => sendSuccess(res, { trainers: await bookingService.trainers() })));
router.get('/bookings', asyncHandler(async (req, res) => sendSuccess(res, { bookings: await bookingService.bookings(req.user._id) })));
router.post('/bookings', asyncHandler(async (req, res) => sendSuccess(res, { booking: await bookingService.create(req.user._id, req.body) }, 'Đặt lịch thành công.', 201)));
router.post('/bookings/:id/cancel', asyncHandler(async (req, res) => sendSuccess(res, { booking: await bookingService.cancel(req.user._id, req.params.id) })));

module.exports = router;
