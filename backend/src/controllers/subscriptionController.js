const subscriptionService = require('../services/subscriptionService');
const { sendSuccess } = require('../utils/response');

/**
 * POST /api/subscriptions
 * Member đăng ký gói tập mới (trạng thái pending/unpaid)
 */
async function createSubscription(req, res) {
  const memberId = req.user._id;
  const { packageId, startDate } = req.body;

  const subscription = await subscriptionService.createSubscription({
    memberId,
    packageId,
    startDate
  });

  return sendSuccess(
    res,
    subscription,
    'Đăng ký gói tập thành công. Vui lòng thanh toán để kích hoạt gói tập.',
    201
  );
}

/**
 * GET /api/subscriptions/my
 * Lấy toàn bộ danh sách gói đăng ký của Member
 */
async function getMySubscriptions(req, res) {
  const memberId = req.user._id;
  const subscriptions = await subscriptionService.getMySubscriptions(memberId);
  return sendSuccess(res, subscriptions, 'Lấy danh sách gói tập thành công.');
}

/**
 * GET /api/subscriptions/active
 * Lấy gói tập đang có hiệu lực hiện tại của Member
 */
async function getActiveSubscription(req, res) {
  const memberId = req.user._id;
  const subscription = await subscriptionService.getActiveSubscription(memberId);
  return sendSuccess(res, subscription, 'Lấy thông tin gói tập hiện tại thành công.');
}

/**
 * GET /api/subscriptions/usage
 * Lấy thống kê số buổi tập đã dùng và còn lại theo gói active
 */
async function getMySubscriptionUsage(req, res) {
  const memberId = req.user._id;
  const activeSub = await subscriptionService.getActiveSubscription(memberId);
  if (!activeSub) {
    return sendSuccess(res, null, 'Bạn chưa có gói tập nào đang kích hoạt.');
  }
  const usage = await subscriptionService.getSubscriptionUsage(activeSub._id);
  return sendSuccess(res, usage, 'Lấy thông tin hạn mức buổi tập thành công.');
}

module.exports = {
  createSubscription,
  getMySubscriptions,
  getActiveSubscription,
  getMySubscriptionUsage
};
