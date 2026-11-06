const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const trainerController = require('../controllers/trainerController');
const { authenticate, authorize } = require('../middlewares/auth');
const { ROLES } = require('../constants/roles');

const router = express.Router();
const progressService = require('../services/progressService');
const { sendSuccess } = require('../utils/response');
router.patch('/bookings/:id/status', authenticate, authorize(ROLES.TRAINER), asyncHandler(async (req, res) => {
  const mongoose = require('mongoose');
  const AppError = require('../utils/AppError');
  const { TrainerProfile, Booking } = require('../models');
  if (!['completed', 'no_show'].includes(req.body.status)) throw new AppError('PT chỉ xác nhận hoàn thành hoặc vắng mặt.', 400);
  if (!mongoose.isObjectIdOrHexString(req.params.id)) throw new AppError('ID lịch tập không hợp lệ.', 400);
  const trainer = await TrainerProfile.findOne({ user: req.user._id, isActive: true });
  if (!trainer) throw new AppError('Hồ sơ PT không hoạt động.', 403);
  const booking = await Booking.findOne({ _id: req.params.id, trainer: trainer._id });
  if (!booking) throw new AppError('Không tìm thấy lịch dạy của bạn.', 404);
  return sendSuccess(res, { booking: await require('../services/bookingStatusService').transition(booking, req.body.status) });
}));
router.get('/reviews', authenticate, authorize(ROLES.TRAINER), asyncHandler(async (req, res) =>
  sendSuccess(res, await require('../services/reviewService').trainerReviews(req.user._id))));
router.get('/members/:memberId/progress', authenticate, authorize(ROLES.TRAINER), asyncHandler(async (req, res) =>
  sendSuccess(res, { logs: await progressService.listForTrainer(req.user._id, req.params.memberId) })));
router.post('/members/:memberId/progress', authenticate, authorize(ROLES.TRAINER), asyncHandler(async (req, res) =>
  sendSuccess(res, { log: await progressService.create(req.user._id, req.params.memberId, req.body) }, 'Đã lưu tiến độ.', 201)));

// ─── Routes dành riêng cho TRAINER ────────────────────────────────────────────

// GET  /api/trainer/schedule             — PT xem lịch dạy của mình
router.get(
  '/schedule',
  authenticate, authorize(ROLES.TRAINER),
  asyncHandler(trainerController.getTrainerSchedule)
);

// GET  /api/trainer/members              — PT xem hội viên liên quan
router.get(
  '/members',
  authenticate, authorize(ROLES.TRAINER),
  asyncHandler(trainerController.getTrainerMembers)
);

// POST /api/trainer/workout-plans        — Tạo giáo án
router.post(
  '/workout-plans',
  authenticate, authorize(ROLES.TRAINER),
  asyncHandler(trainerController.createWorkoutPlan)
);

// GET  /api/trainer/workout-plans        — Danh sách giáo án của mình
router.get(
  '/workout-plans',
  authenticate, authorize(ROLES.TRAINER),
  asyncHandler(trainerController.getWorkoutPlans)
);

// GET  /api/trainer/workout-plans/:planId — Chi tiết một giáo án
router.get(
  '/workout-plans/:planId',
  authenticate, authorize(ROLES.TRAINER),
  asyncHandler(trainerController.getWorkoutPlanById)
);

// PATCH /api/trainer/workout-plans/:planId — Cập nhật giáo án
router.patch(
  '/workout-plans/:planId',
  authenticate, authorize(ROLES.TRAINER),
  asyncHandler(trainerController.updateWorkoutPlan)
);

// ─── Routes dành cho MEMBER ───────────────────────────────────────────────────

// GET  /api/trainer/member/workout-plans — Member xem giáo án của mình
router.get(
  '/member/workout-plans',
  authenticate, authorize(ROLES.MEMBER),
  asyncHandler(trainerController.getMemberWorkoutPlans)
);

module.exports = router;
