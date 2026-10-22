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
  if (req.query.status && !Object.values(BOOKING_STATUS).includes(req.query.status)) {
    throw new AppError('Trạng thái lịch tập không hợp lệ.', 400);
  }
  if (req.query.status) {
    filter.status = req.query.status;
  }

  // Lọc theo ngày nếu có
  if (req.query.date) {
    const date = req.query.date;
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        Number.isNaN(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) {
      throw new AppError('Ngày phải hợp lệ và có định dạng YYYY-MM-DD.', 400);
    }
    // Booking stores a calendar date at UTC midnight, independent of server timezone.
    filter.date = new Date(date + 'T00:00:00.000Z');
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
  const { page, limit, skip } = require('../utils/pagination')(req.query);
  const trainerProfile = await TrainerProfile.findOne({ user: req.user._id });
  if (!trainerProfile) throw new AppError('Hồ sơ huấn luyện viên không tồn tại.', 404);
  const search = req.query.search ?? '';
  if (typeof search !== 'string' || search.length > 120) throw new AppError('Tìm kiếm không hợp lệ.', 400);
  const escaped = [...search.trim()].map(c => '.*+?^${}()|[]\\'.includes(c) ? '\\' + c : c).join('');
  const pipeline = [
    { $match: { trainer: trainerProfile._id } },
    { $sort: { date: -1, startTime: -1, _id: -1 } },
    { $group: {
      _id: '$member', totalBookings: { $sum: 1 },
      completedBookings: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
      latestBooking: { $first: { date: '$date', startTime: '$startTime', status: '$status' } }
    } },
    { $lookup: { from: User.collection.name, localField: '_id', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' },
    { $match: { 'user.role': ROLES.MEMBER } }
  ];
  if (escaped) pipeline.push({ $match: { $or: ['fullName', 'email'].map(field => ({ ['user.' + field]: { $regex: escaped, $options: 'i' } })) } });
  pipeline.push({ $sort: { 'user.fullName': 1, _id: 1 } }, { $facet: {
    members: [{ $skip: skip }, { $limit: limit }, { $project: {
      _id: 1, fullName: '$user.fullName', email: '$user.email', phone: { $ifNull: ['$user.phone', null] },
      avatar: { $ifNull: ['$user.avatar', null] }, createdAt: '$user.createdAt', totalBookings: 1, completedBookings: 1, latestBooking: 1
    } }],
    count: [{ $count: 'total' }]
  } });
  const [result] = await Booking.aggregate(pipeline);
  const total = result.count[0]?.total || 0;
  return sendSuccess(res, { members: result.members, total, page, limit, pages: Math.ceil(total / limit), trainerProfileId: trainerProfile._id });
}

/**
 * POST /api/trainer/workout-plans
 * PT tạo giáo án cho member.
 * Chỉ được tạo cho member đã/đang có booking với mình.
 */
async function createWorkoutPlan(req, res) {
  const user = req.user;

  const trainerProfile = await TrainerProfile.findOne({ user: user._id });
  if (!trainerProfile || !trainerProfile.isActive) {
    throw new AppError('Hồ sơ huấn luyện viên không tồn tại.', 404);
  }

  const { memberId, title, goal, startDate, endDate, items } = req.body;

  if (!memberId || !title || !startDate || !endDate) {
    throw new AppError('memberId, title, startDate và endDate là bắt buộc.', 400);
  }

  if (typeof title !== 'string' || (goal !== undefined && typeof goal !== 'string')) {
    throw new AppError('Tiêu đề và mục tiêu phải là văn bản.', 400);
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
  const { page, limit, skip } = require('../utils/pagination')(req.query);
  if (req.query.status !== undefined && !['active', 'completed', 'cancelled'].includes(req.query.status)) {
    throw new AppError('Trạng thái giáo án không hợp lệ.', 400);
  }
  if (req.query.memberId !== undefined && (typeof req.query.memberId !== 'string' || !require('mongoose').isObjectIdOrHexString(req.query.memberId))) {
    throw new AppError('ID học viên không hợp lệ.', 400);
  }

  const trainerProfile = await TrainerProfile.findOne({ user: user._id });
  if (!trainerProfile) {
    throw new AppError('Hồ sơ huấn luyện viên không tồn tại.', 404);
  }

  const filter = { trainer: trainerProfile._id };
  if (req.query.memberId) filter.member = req.query.memberId;
  if (req.query.status) filter.status = req.query.status;

  const [plans, total] = await Promise.all([
    WorkoutPlan.find(filter).populate('member', 'fullName email phone avatar')
      .sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit),
    WorkoutPlan.countDocuments(filter)
  ]);

  return sendSuccess(res, { plans, total, page, limit, pages: Math.ceil(total / limit) });
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
  if (!trainerProfile || !trainerProfile.isActive) {
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

  const plan = await WorkoutPlan.findOne({
    _id: req.params.planId, trainer: trainerProfile._id
  });

  if (!plan) {
    throw new AppError('Giáo án không tồn tại hoặc bạn không có quyền chỉnh sửa.', 404);
  }

  if (req.body.expectedVersion !== undefined &&
      (!Number.isInteger(req.body.expectedVersion) || req.body.expectedVersion !== plan.__v)) {
    throw new AppError('Giáo án đã được cập nhật. Hãy tải lại trước khi sửa.', 409);
  }

  Object.assign(plan, updateData);
  await plan.save(); // Document validation checks both dates and optimistic concurrency.
  await plan.populate('member', 'fullName email phone avatar');
  return sendSuccess(res, { plan }, 'Cập nhật giáo án thành công!');
}

/**
 * GET /api/member/workout-plans
 * Member xem giáo án của mình (tất cả giáo án do PT tạo cho member)
 */
async function getMemberWorkoutPlans(req, res) {
  const user = req.user;

  const plans = await WorkoutPlan.find({ member: user._id })
    .populate({
      path: 'trainer',
      select: 'user specialties bio pricePerSession ratingAverage',
      populate: { path: 'user', select: 'fullName avatar email' }
    })
    .sort({ createdAt: -1 });

  const plansWithTrainerUser = plans.map(plan => ({
    ...plan.toObject(), trainerUser: plan.trainer?.user || null
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
