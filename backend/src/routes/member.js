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
    amount: pkg.price, status: 'pending', paymentStatus: 'unpaid'
  });
  return sendSuccess(res, { subscription }, 'Đã gửi đăng ký. Vui lòng thanh toán tại quầy để Admin xác nhận.', 201);
}));

module.exports = router;
