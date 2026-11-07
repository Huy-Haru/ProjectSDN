const mongoose = require('mongoose');
const Subscription = require('../models/Subscription');
const MembershipPackage = require('../models/MembershipPackage');
const AppError = require('../utils/AppError');
const { SUBSCRIPTION_STATUS, PAYMENT_STATUS, BOOKING_STATUS } = require('../constants/statuses');

/**
 * Đăng ký gói tập mới cho Member
 * @param {Object} param0
 * @param {string} param0.memberId - ID của member đăng nhập
 * @param {string} param0.packageId - ID gói tập cần đăng ký
 * @param {string|Date} [param0.startDate] - Ngày bắt đầu (tùy chọn, mặc định là hiện tại)
 * @returns {Promise<Object>} Subscription mới tạo
 */
async function createSubscription({ memberId, packageId, startDate }) {
  if (!packageId) {
    throw new AppError('Vui lòng chọn gói tập.', 400);
  }

  if (!mongoose.Types.ObjectId.isValid(packageId)) {
    throw new AppError('Mã gói tập không hợp lệ.', 400);
  }

  // 1. Kiểm tra gói tập tồn tại và đang hoạt động
  const pkg = await MembershipPackage.findById(packageId);
  if (!pkg || !pkg.isActive) {
    throw new AppError('Gói tập không tồn tại hoặc đã ngừng áp dụng.', 404);
  }

  // 2. Kiểm tra xem member đã có gói nào đang active chưa hết hạn hay không
  const activeSub = await Subscription.findOne({
    member: memberId,
    status: SUBSCRIPTION_STATUS.ACTIVE,
    endDate: { $gte: new Date() }
  });
  if (activeSub) {
    throw new AppError('Bạn đang có một gói tập vẫn còn hiệu lực. Không thể đăng ký thêm gói mới.', 400);
  }

  // 3. Kiểm tra xem member có đăng ký pending nào chưa thanh toán không
  const pendingSub = await Subscription.findOne({
    member: memberId,
    status: SUBSCRIPTION_STATUS.PENDING
  });
  if (pendingSub) {
    throw new AppError('Bạn đang có yêu cầu đăng ký gói chờ thanh toán. Vui lòng thanh toán hoặc liên hệ để được hỗ trợ.', 400);
  }

  // 4. Tính toán ngày bắt đầu và kết thúc
  let start = new Date();
  if (startDate) {
    const parsedStart = new Date(startDate);
    if (isNaN(parsedStart.getTime())) {
      throw new AppError('Ngày bắt đầu không hợp lệ.', 400);
    }
    start = parsedStart;
  }

  const end = new Date(start.getTime() + pkg.durationDays * 24 * 60 * 60 * 1000);

  // 5. Tạo subscription với trạng thái pending/unpaid và chốt giá (amount) theo package.price
  const subscription = await Subscription.create({
    member: memberId,
    package: pkg._id,
    startDate: start,
    endDate: end,
    status: SUBSCRIPTION_STATUS.PENDING,
    paymentStatus: PAYMENT_STATUS.UNPAID,
    amount: pkg.price
  });

  // Populate thông tin gói để trả về giao diện
  await subscription.populate('package', 'name description durationDays price sessionLimit includesPT');

  return subscription;
}

/**
 * Lấy danh sách tất cả gói đăng ký của Member
 * @param {string} memberId
 * @returns {Promise<Array>}
 */
async function getMySubscriptions(memberId) {
  // Tự động cập nhật gói hết hạn nếu quá endDate
  const now = new Date();
  await Subscription.updateMany(
    {
      member: memberId,
      status: SUBSCRIPTION_STATUS.ACTIVE,
      endDate: { $lt: now }
    },
    { $set: { status: SUBSCRIPTION_STATUS.EXPIRED } }
  );

  return Subscription.find({ member: memberId })
    .populate('package')
    .sort({ createdAt: -1 });
}

/**
 * Lấy gói tập active hiện tại của Member
 * @param {string} memberId
 * @returns {Promise<Object|null>}
 */
async function getActiveSubscription(memberId) {
  const now = new Date();
  // Kiểm tra gói hết hạn trước
  await Subscription.updateMany(
    {
      member: memberId,
      status: SUBSCRIPTION_STATUS.ACTIVE,
      endDate: { $lt: now }
    },
    { $set: { status: SUBSCRIPTION_STATUS.EXPIRED } }
  );

  return Subscription.findOne({
    member: memberId,
    status: SUBSCRIPTION_STATUS.ACTIVE,
    endDate: { $gte: now }
  }).populate('package');
}

/**
 * Tính toán hạn mức buổi tập đã dùng và còn lại của gói
 * @param {string} subscriptionId
 * @returns {Promise<Object>}
 */
async function getSubscriptionUsage(subscriptionId) {
  const Booking = require('../models/Booking');

  const subscription = await Subscription.findById(subscriptionId).populate('package');
  if (!subscription) {
    throw new AppError('Không tìm thấy thông tin gói tập.', 404);
  }

  const pkg = subscription.package;
  const totalLimit = pkg ? pkg.sessionLimit : null;

  // Đếm các buổi tập đã đặt (booked, completed, no_show tính vào hạn mức; cancelled không tính)
  const usedCount = await Booking.countDocuments({
    subscription: subscriptionId,
    status: {
      $in: [
        BOOKING_STATUS.BOOKED,
        BOOKING_STATUS.COMPLETED,
        BOOKING_STATUS.NO_SHOW
      ]
    }
  });

  const remainingSessions = totalLimit === null ? null : Math.max(0, totalLimit - usedCount);
  const hasRemaining = totalLimit === null || remainingSessions > 0;

  return {
    subscriptionId: subscription._id,
    packageName: pkg ? pkg.name : '',
    includesPT: pkg ? pkg.includesPT : false,
    totalSessions: totalLimit,
    usedSessions: usedCount,
    remainingSessions,
    hasRemaining,
    isValid: subscription.isValid ? subscription.isValid() : (subscription.status === SUBSCRIPTION_STATUS.ACTIVE && subscription.endDate >= new Date())
  };
}

/**
 * Kiểm tra gói tập của Member có đủ điều kiện để đặt lịch PT hay không
 * @param {string} memberId
 * @returns {Promise<Object>} { subscription, usage }
 */
async function validateSubscriptionForBooking(memberId) {
  const activeSub = await getActiveSubscription(memberId);
  if (!activeSub) {
    throw new AppError('Bạn chưa có gói tập nào đang kích hoạt hoặc gói tập của bạn đã hết hạn.', 400);
  }

  if (!activeSub.package || !activeSub.package.includesPT) {
    throw new AppError('Gói tập hiện tại của bạn không bao gồm quyền lợi đặt lịch với Huấn Luyện Viên (PT).', 400);
  }

  const usage = await getSubscriptionUsage(activeSub._id);
  if (!usage.hasRemaining) {
    throw new AppError(`Bạn đã sử dụng hết số buổi tập theo gói (${usage.totalSessions} buổi). Vui lòng gia hạn thêm.`, 400);
  }

  return { subscription: activeSub, usage };
}

/**
 * Lấy chi tiết 1 gói đăng ký theo ID
 * @param {string} memberId
 * @param {string} subscriptionId
 * @returns {Promise<Object>}
 */
async function getSubscriptionById(memberId, subscriptionId) {
  if (!subscriptionId || !mongoose.Types.ObjectId.isValid(subscriptionId)) {
    throw new AppError('Mã gói đăng ký không hợp lệ.', 400);
  }

  const subscription = await Subscription.findById(subscriptionId).populate('package');
  if (!subscription) {
    throw new AppError('Không tìm thấy thông tin gói đăng ký.', 404);
  }

  if (subscription.member.toString() !== memberId.toString()) {
    throw new AppError('Bạn không có quyền xem thông tin gói của người khác.', 403);
  }

  return subscription;
}

/**
 * Hủy yêu cầu đăng ký gói khi chưa thanh toán (chỉ áp dụng khi status: pending)
 * @param {string} memberId
 * @param {string} subscriptionId
 * @returns {Promise<Object>}
 */
async function cancelSubscription(memberId, subscriptionId) {
  if (!subscriptionId || !mongoose.Types.ObjectId.isValid(subscriptionId)) {
    throw new AppError('Mã gói đăng ký không hợp lệ.', 400);
  }

  const subscription = await Subscription.findById(subscriptionId);
  if (!subscription) {
    throw new AppError('Không tìm thấy thông tin đăng ký gói.', 404);
  }

  if (subscription.member.toString() !== memberId.toString()) {
    throw new AppError('Bạn không có quyền hủy gói đăng ký của người khác.', 403);
  }

  if (subscription.status !== SUBSCRIPTION_STATUS.PENDING) {
    throw new AppError('Chỉ có thể hủy yêu cầu đăng ký gói đang ở trạng thái chờ thanh toán.', 400);
  }

  subscription.status = SUBSCRIPTION_STATUS.CANCELLED;
  await subscription.save();

  return subscription;
}

module.exports = {
  createSubscription,
  getMySubscriptions,
  getActiveSubscription,
  getSubscriptionById,
  getSubscriptionUsage,
  validateSubscriptionForBooking,
  cancelSubscription
};



