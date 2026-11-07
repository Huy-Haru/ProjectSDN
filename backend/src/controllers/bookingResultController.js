const Booking = require('../models/Booking');
const ProgressLog = require('../models/ProgressLog');
const TrainerProfile = require('../models/TrainerProfile');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/response');
const { ROLES } = require('../constants/roles');
const { BOOKING_STATUS } = require('../constants/statuses');

/**
 * PATCH /api/bookings/:bookingId/result
 * PT liên quan hoặc Admin xác nhận kết quả buổi tập: completed | no_show
 * Sau khi completed → ghi ProgressLog (idempotent: nếu đã có log cùng booking thì update)
 */
async function confirmBookingResult(req, res) {
  const { bookingId } = req.params;
  const { status, note, weight, bodyFat, height, attendedSessions } = req.body;
  const user = req.user;

  // Chỉ cho phép đặt completed hoặc no_show
  if (![BOOKING_STATUS.COMPLETED, BOOKING_STATUS.NO_SHOW].includes(status)) {
    throw new AppError('Trạng thái phải là completed hoặc no_show.', 400);
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new AppError('Lịch đặt không tồn tại.', 404);
  }

  // Chỉ PT liên quan hoặc Admin được phép xác nhận
  if (user.role === ROLES.TRAINER) {
    const trainerProfile = await TrainerProfile.findOne({ user: user._id });
    if (!trainerProfile || !trainerProfile._id.equals(booking.trainer)) {
      throw new AppError('Bạn không có quyền xác nhận buổi tập này.', 403);
    }
  } else if (user.role !== ROLES.ADMIN) {
    throw new AppError('Bạn không có quyền thực hiện thao tác này.', 403);
  }

  // Không cho chuyển ngược từ completed/cancelled
  if (booking.status === BOOKING_STATUS.CANCELLED) {
    throw new AppError('Không thể thay đổi lịch đã bị hủy.', 400);
  }

  // Chỉ cho phép xác nhận khi còn ở trạng thái booked
  if (booking.status !== BOOKING_STATUS.BOOKED) {
    throw new AppError(`Buổi tập đã có trạng thái "${booking.status}", không thể xác nhận lại.`, 400);
  }

  // Cập nhật trạng thái booking
  booking.status = status;
  if (note !== undefined) booking.note = note;
  await booking.save();

  // Nếu completed → ghi ProgressLog (idempotent theo booking)
  let progressLog = null;
  if (status === BOOKING_STATUS.COMPLETED) {
    // Tìm TrainerProfile để gắn vào log
    let trainerProfileId = booking.trainer;

    // Build log data (chỉ ghi nếu có giá trị hợp lệ)
    const logData = {
      member: booking.member,
      trainer: trainerProfileId,
      date: booking.date,
      note: note || undefined
    };
    if (weight !== undefined && weight !== null && !isNaN(weight)) logData.weight = Number(weight);
    if (bodyFat !== undefined && bodyFat !== null && !isNaN(bodyFat)) logData.bodyFat = Number(bodyFat);
    if (height !== undefined && height !== null && !isNaN(height)) logData.height = Number(height);
    if (attendedSessions !== undefined && !isNaN(attendedSessions)) logData.attendedSessions = Number(attendedSessions);

    // Idempotent: Upsert theo booking reference (dùng field booking trên ProgressLog nếu cần)
    // Vì ProgressLog không có field booking, tìm bằng member + trainer + date gần đúng
    // → Tạo mới hoặc cập nhật log cùng ngày cùng trainer + member
    progressLog = await ProgressLog.findOneAndUpdate(
      {
        member: booking.member,
        trainer: trainerProfileId,
        date: {
          $gte: new Date(new Date(booking.date).setHours(0, 0, 0, 0)),
          $lte: new Date(new Date(booking.date).setHours(23, 59, 59, 999))
        }
      },
      { $set: logData },
      { new: true, upsert: true, runValidators: true }
    );
  }

  return sendSuccess(
    res,
    { booking, progressLog },
    `Xác nhận buổi tập ${status === BOOKING_STATUS.COMPLETED ? 'hoàn thành' : 'vắng'} thành công!`
  );
}

/**
 * GET /api/bookings/:bookingId
 * Lấy chi tiết một booking — PT liên quan, Admin hoặc Member sở hữu
 */
async function getBookingById(req, res) {
  const { bookingId } = req.params;
  const user = req.user;

  const booking = await Booking.findById(bookingId)
    .populate('member', 'fullName email phone avatar')
    .populate('trainer', 'specialties bio ratingAverage')
    .populate('subscription', 'status paymentStatus startDate endDate');

  if (!booking) {
    throw new AppError('Lịch đặt không tồn tại.', 404);
  }

  // Kiểm tra quyền truy cập
  if (user.role === ROLES.MEMBER) {
    if (!booking.member._id.equals(user._id)) {
      throw new AppError('Bạn không có quyền xem buổi tập này.', 403);
    }
  } else if (user.role === ROLES.TRAINER) {
    const trainerProfile = await TrainerProfile.findOne({ user: user._id });
    if (!trainerProfile || !trainerProfile._id.equals(booking.trainer._id)) {
      throw new AppError('Bạn không có quyền xem buổi tập này.', 403);
    }
  }
  // Admin có thể xem tất cả

  return sendSuccess(res, { booking });
}

/**
 * GET /api/progress
 * Member xem ProgressLog của mình, PT xem của hội viên liên quan (query: memberId)
 */
async function getProgressLogs(req, res) {
  const user = req.user;

  let filter = {};

  if (user.role === ROLES.MEMBER) {
    // Member chỉ xem log của mình
    filter.member = user._id;
  } else if (user.role === ROLES.TRAINER) {
    // PT xem log của hội viên liên quan (memberId là bắt buộc hoặc lọc tất cả HV của mình)
    const trainerProfile = await TrainerProfile.findOne({ user: user._id });
    if (!trainerProfile) {
      throw new AppError('Hồ sơ huấn luyện viên không tồn tại.', 404);
    }
    if (req.query.memberId) {
      // Kiểm tra member có liên quan đến PT không
      const hasRelation = await Booking.exists({ trainer: trainerProfile._id, member: req.query.memberId });
      if (!hasRelation) {
        throw new AppError('Học viên này không có lịch tập với bạn.', 403);
      }
      filter.member = req.query.memberId;
    } else {
      filter.trainer = trainerProfile._id;
    }
  } else if (user.role === ROLES.ADMIN) {
    // Admin xem được tất cả, lọc theo memberId nếu có
    if (req.query.memberId) filter.member = req.query.memberId;
  } else {
    throw new AppError('Bạn không có quyền truy cập.', 403);
  }

  const logs = await ProgressLog.find(filter)
    .populate('member', 'fullName email avatar')
    .populate('trainer', 'specialties bio')
    .sort({ date: -1 });

  return sendSuccess(res, { logs });
}

/**
 * POST /api/progress
 * PT hoặc Admin ghi ProgressLog cho member (idempotent: upsert theo member + trainer + ngày)
 */
async function createProgressLog(req, res) {
  const user = req.user;
  const { memberId, date, weight, bodyFat, height, note, attendedSessions } = req.body;

  if (!memberId) {
    throw new AppError('memberId là bắt buộc.', 400);
  }

  let trainerProfileId = null;

  if (user.role === ROLES.TRAINER) {
    const trainerProfile = await TrainerProfile.findOne({ user: user._id });
    if (!trainerProfile) {
      throw new AppError('Hồ sơ huấn luyện viên không tồn tại.', 404);
    }
    // Kiểm tra quan hệ
    const hasRelation = await Booking.exists({ trainer: trainerProfile._id, member: memberId });
    if (!hasRelation) {
      throw new AppError('Học viên này không có lịch tập với bạn.', 403);
    }
    trainerProfileId = trainerProfile._id;
  } else if (user.role !== ROLES.ADMIN) {
    throw new AppError('Bạn không có quyền ghi tiến độ.', 403);
  }

  const logDate = date ? new Date(date) : new Date();
  const logData = {
    member: memberId,
    trainer: trainerProfileId,
    date: logDate,
    note: note || undefined
  };
  if (weight !== undefined && !isNaN(weight)) logData.weight = Number(weight);
  if (bodyFat !== undefined && !isNaN(bodyFat)) logData.bodyFat = Number(bodyFat);
  if (height !== undefined && !isNaN(height)) logData.height = Number(height);
  if (attendedSessions !== undefined && !isNaN(attendedSessions)) logData.attendedSessions = Number(attendedSessions);

  // Idempotent: upsert theo member + trainer + ngày
  const log = await ProgressLog.findOneAndUpdate(
    {
      member: memberId,
      trainer: trainerProfileId,
      date: {
        $gte: new Date(new Date(logDate).setHours(0, 0, 0, 0)),
        $lte: new Date(new Date(logDate).setHours(23, 59, 59, 999))
      }
    },
    { $set: logData },
    { new: true, upsert: true, runValidators: true }
  );

  return sendSuccess(res, { log }, 'Ghi tiến độ thành công!', 201);
}

module.exports = {
  confirmBookingResult,
  getBookingById,
  getProgressLogs,
  createProgressLog
};
