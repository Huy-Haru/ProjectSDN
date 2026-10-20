const User = require('../models/User');
const TrainerProfile = require('../models/TrainerProfile');
const Booking = require('../models/Booking');
const WorkoutPlan = require('../models/WorkoutPlan');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/response');
const { ROLES } = require('../constants/roles');
const { BOOKING_STATUS } = require('../constants/statuses');

/**
 * GET /api/trainer/schedule
 * PT xem lịch của mình: chỉ bookings liên quan đến trainer này.
 * Query params: status, date (YYYY-MM-DD)
 */
async function getTrainerSchedule(req, res) {
  const user = req.user;

  // Lấy TrainerProfile của PT đang đăng nhập
  const trainerProfile = await TrainerProfile.findOne({ user: user._id });
  if (!trainerProfile) {
    throw new AppError('Hồ sơ huấn luyện viên không tồn tại.', 404);
  }

  const filter = { trainer: trainerProfile._id };

  // Lọc theo status nếu có
  if (req.query.status && Object.values(BOOKING_STATUS).includes(req.query.status)) {
    filter.status = req.query.status;
  }

  // Lọc theo ngày nếu có
  if (req.query.date) {
    const startOfDay = new Date(req.query.date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(req.query.date);
    endOfDay.setHours(23, 59, 59, 999);
    filter.date = { $gte: startOfDay, $lte: endOfDay };
  }

  const bookings = await Booking.find(filter)
    .populate('member', 'fullName email phone avatar')
    .populate('subscription', 'status paymentStatus startDate endDate')
    .sort({ date: 1, startTime: 1 });

  return sendSuccess(res, { bookings, trainerProfileId: trainerProfile._id });
}

/**
 * GET /api/trainer/members
 * PT xem danh sách hội viên liên quan (đã từng/đang có booking với mình)
 */
async function getTrainerMembers(req, res) {
  const user = req.user;

  const trainerProfile = await TrainerProfile.findOne({ user: user._id });
  if (!trainerProfile) {
    throw new AppError('Hồ sơ huấn luyện viên không tồn tại.', 404);
  }

  // Lấy distinct members từ bookings của trainer này
  const memberIds = await Booking.distinct('member', { trainer: trainerProfile._id });

  const members = await User.find({ _id: { $in: memberIds }, role: ROLES.MEMBER })
    .select('fullName email phone avatar createdAt');

  // Với mỗi member, đếm số buổi và lấy lịch gần nhất
  const membersWithStats = await Promise.all(members.map(async (member) => {
    const totalBookings = await Booking.countDocuments({ trainer: trainerProfile._id, member: member._id });
    const completedBookings = await Booking.countDocuments({
      trainer: trainerProfile._id,
      member: member._id,
      status: BOOKING_STATUS.COMPLETED
    });
    const latestBooking = await Booking.findOne({
      trainer: trainerProfile._id,
      member: member._id
    }).sort({ date: -1 }).select('date startTime status');

    return {
      _id: member._id,
      fullName: member.fullName,
      email: member.email,
      phone: member.phone || null,
      avatar: member.avatar || null,
      totalBookings,
      completedBookings,
      latestBooking: latestBooking || null
    };
  }));

  return sendSuccess(res, { members: membersWithStats, trainerProfileId: trainerProfile._id });
}

/**
 * POST /api/trainer/workout-plans
 * PT tạo giáo án cho member.
 * Chỉ được tạo cho member đã/đang có booking với mình.
 */
async function createWorkoutPlan(req, res) {
  const user = req.user;

  const trainerProfile = await TrainerProfile.findOne({ user: user._id });
  if (!trainerProfile) {
    throw new AppError('Hồ sơ huấn luyện viên không tồn tại.', 404);
  }

  const { memberId, title, goal, startDate, endDate, items } = req.body;

  if (!memberId || !title || !startDate || !endDate) {
    throw new AppError('memberId, title, startDate và endDate là bắt buộc.', 400);
  }

  // Kiểm tra member có booking với trainer này không (tránh tạo giáo án cho người không liên quan)
  const hasRelation = await Booking.exists({ trainer: trainerProfile._id, member: memberId });
  if (!hasRelation) {
    throw new AppError('Học viên này không có lịch tập với bạn.', 403);
  }

  // Kiểm tra member tồn tại và đúng role
  const member = await User.findOne({ _id: memberId, role: ROLES.MEMBER });
  if (!member) {
    throw new AppError('Học viên không tồn tại.', 404);
  }

  const plan = await WorkoutPlan.create({
    trainer: trainerProfile._id,
    member: memberId,
    title: title.trim(),
    goal: goal?.trim(),
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    items: items || []
  });

  return sendSuccess(res, { plan }, 'Tạo giáo án thành công!', 201);
}

/**
 * GET /api/trainer/workout-plans
 * PT xem tất cả giáo án của mình (có thể lọc theo member)
 */
async function getWorkoutPlans(req, res) {
  const user = req.user;

  const trainerProfile = await TrainerProfile.findOne({ user: user._id });
  if (!trainerProfile) {
    throw new AppError('Hồ sơ huấn luyện viên không tồn tại.', 404);
  }

  const filter = { trainer: trainerProfile._id };
  if (req.query.memberId) filter.member = req.query.memberId;
  if (req.query.status) filter.status = req.query.status;

  const plans = await WorkoutPlan.find(filter)
    .populate('member', 'fullName email phone avatar')
    .sort({ createdAt: -1 });

  return sendSuccess(res, { plans });
}

/**
 * GET /api/trainer/workout-plans/:planId
 * PT xem chi tiết một giáo án (phải là giáo án của mình)
 */
async function getWorkoutPlanById(req, res) {
  const user = req.user;

  const trainerProfile = await TrainerProfile.findOne({ user: user._id });
  if (!trainerProfile) {
    throw new AppError('Hồ sơ huấn luyện viên không tồn tại.', 404);
  }

  const plan = await WorkoutPlan.findOne({ _id: req.params.planId, trainer: trainerProfile._id })
    .populate('member', 'fullName email phone avatar');

  if (!plan) {
    throw new AppError('Giáo án không tồn tại hoặc bạn không có quyền xem.', 404);
  }

  return sendSuccess(res, { plan });
}

/**
 * PATCH /api/trainer/workout-plans/:planId
 * PT cập nhật giáo án (chỉ giáo án của mình)
 */
async function updateWorkoutPlan(req, res) {
  const user = req.user;

  const trainerProfile = await TrainerProfile.findOne({ user: user._id });
  if (!trainerProfile) {
    throw new AppError('Hồ sơ huấn luyện viên không tồn tại.', 404);
  }

  const PLAN_WHITELIST = ['title', 'goal', 'startDate', 'endDate', 'items', 'status'];
  const updateData = {};
  PLAN_WHITELIST.forEach(f => {
    if (req.body[f] !== undefined) updateData[f] = req.body[f];
  });

  if (Object.keys(updateData).length === 0) {
    throw new AppError('Không có trường hợp lệ để cập nhật.', 400);
  }

  const plan = await WorkoutPlan.findOneAndUpdate(
    { _id: req.params.planId, trainer: trainerProfile._id },
    { $set: updateData },
    { new: true, runValidators: true }
  ).populate('member', 'fullName email phone avatar');

  if (!plan) {
    throw new AppError('Giáo án không tồn tại hoặc bạn không có quyền chỉnh sửa.', 404);
  }

  return sendSuccess(res, { plan }, 'Cập nhật giáo án thành công!');
}

/**
 * GET /api/member/workout-plans
 * Member xem giáo án của mình (tất cả giáo án do PT tạo cho member)
 */
async function getMemberWorkoutPlans(req, res) {
  const user = req.user;

  const plans = await WorkoutPlan.find({ member: user._id })
    .populate('trainer', 'specialties bio pricePerSession ratingAverage')
    .sort({ createdAt: -1 });

  // Populate thêm thông tin user của trainer
  const plansWithTrainerUser = await Promise.all(plans.map(async (plan) => {
    const planObj = plan.toObject();
    if (plan.trainer) {
      const trainerUser = await User.findById(plan.trainer.user).select('fullName avatar email');
      planObj.trainerUser = trainerUser || null;
    }
    return planObj;
  }));

  return sendSuccess(res, { plans: plansWithTrainerUser });
}

module.exports = {
  getTrainerSchedule,
  getTrainerMembers,
  createWorkoutPlan,
  getWorkoutPlans,
  getWorkoutPlanById,
  updateWorkoutPlan,
  getMemberWorkoutPlans
};
