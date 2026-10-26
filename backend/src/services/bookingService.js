const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const TrainerProfile = require('../models/TrainerProfile');
const subscriptionService = require('./subscriptionService');
const AppError = require('../utils/AppError');
const { BOOKING_STATUS } = require('../constants/statuses');

/**
 * Đặt lịch tập mới với Huấn Luyện Viên (PT)
 * @param {Object} param0
 * @param {string} param0.memberId - ID của member đăng nhập
 * @param {string} param0.trainerId - ID của TrainerProfile
 * @param {string|Date} param0.date - Ngày tập (YYYY-MM-DD hoặc Date)
 * @param {string} param0.startTime - Giờ bắt đầu (HH:mm)
 * @param {string} param0.endTime - Giờ kết thúc (HH:mm)
 * @param {string} [param0.note] - Ghi chú cho buổi tập
 * @returns {Promise<Object>} Booking đã tạo kèm thông tin hạn mức còn lại
 */
async function createBooking({ memberId, trainerId, date, startTime, endTime, note }) {
  // 1. Kiểm tra tham số đầu vào
  if (!trainerId || !date || !startTime || !endTime) {
    throw new AppError('Vui lòng cung cấp đầy đủ thông tin: HLV, ngày tập, giờ bắt đầu và giờ kết thúc.', 400);
  }

  if (!mongoose.Types.ObjectId.isValid(trainerId)) {
    throw new AppError('Mã huấn luyện viên không hợp lệ.', 400);
  }

  const bookingDate = new Date(date);
  if (isNaN(bookingDate.getTime())) {
    throw new AppError('Ngày đặt lịch không hợp lệ.', 400);
  }
  bookingDate.setUTCHours(0, 0, 0, 0);

  // Không cho phép đặt lịch cho ngày trong quá khứ
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  if (bookingDate < today) {
    throw new AppError('Không thể đặt lịch cho ngày trong quá khứ.', 400);
  }

  const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
    throw new AppError('Giờ tập phải đúng định dạng HH:mm (ví dụ 09:00).', 400);
  }

  if (startTime >= endTime) {
    throw new AppError('Giờ kết thúc phải sau giờ bắt đầu.', 400);
  }

  // 2. Kiểm tra Trainer tồn tại và đang hoạt động
  const trainer = await TrainerProfile.findById(trainerId);
  if (!trainer || !trainer.isActive) {
    throw new AppError('Huấn luyện viên không tồn tại hoặc hiện đang tạm ngưng nhận lịch.', 404);
  }

  // 3. Kiểm tra gói tập của Member (còn hiệu lực, có quyền PT, còn số buổi)
  const { subscription, usage } = await subscriptionService.validateSubscriptionForBooking(memberId);

  // Kiểm tra ngày đặt lịch phải nằm trong thời hạn của gói
  const subEnd = new Date(subscription.endDate);
  subEnd.setUTCHours(23, 59, 59, 999);
  if (bookingDate > subEnd) {
    throw new AppError('Ngày đặt lịch vượt quá thời hạn hiệu lực của gói tập hiện tại.', 400);
  }

  // 4. Kiểm tra xung đột lịch của Huấn luyện viên
  const trainerConflict = await Booking.findOne({
    trainer: trainerId,
    date: bookingDate,
    status: {
      $in: [
        BOOKING_STATUS.BOOKED,
        BOOKING_STATUS.COMPLETED,
        BOOKING_STATUS.NO_SHOW
      ]
    },
    $or: [
      { startTime },
      {
        startTime: { $lt: endTime },
        endTime: { $gt: startTime }
      }
    ]
  });

  if (trainerConflict) {
    throw new AppError('Huấn luyện viên đã có lịch tập vào khung giờ này. Vui lòng chọn khung giờ khác.', 409);
  }

  // 5. Kiểm tra xung đột lịch của chính Member
  const memberConflict = await Booking.findOne({
    member: memberId,
    date: bookingDate,
    status: {
      $in: [
        BOOKING_STATUS.BOOKED,
        BOOKING_STATUS.COMPLETED,
        BOOKING_STATUS.NO_SHOW
      ]
    },
    $or: [
      { startTime },
      {
        startTime: { $lt: endTime },
        endTime: { $gt: startTime }
      }
    ]
  });

  if (memberConflict) {
    throw new AppError('Bạn đã có một lịch tập khác trùng vào khung giờ này.', 409);
  }

  // 6. Tạo Booking
  const booking = await Booking.create({
    member: memberId,
    trainer: trainerId,
    subscription: subscription._id,
    date: bookingDate,
    startTime,
    endTime,
    note: note ? note.trim() : '',
    status: BOOKING_STATUS.BOOKED
  });

  // 7. Populate dữ liệu liên quan
  await booking.populate([
    {
      path: 'trainer',
      populate: { path: 'user', select: 'fullName email phone avatar' }
    },
    {
      path: 'subscription',
      populate: { path: 'package', select: 'name sessionLimit' }
    }
  ]);

  // Cập nhật lại số buổi còn lại
  const updatedUsage = await subscriptionService.getSubscriptionUsage(subscription._id);

  return {
    booking,
    remainingSessions: updatedUsage.remainingSessions,
    usedSessions: updatedUsage.usedSessions
  };
}

/**
 * Lấy danh sách lịch tập của Member (kèm bộ lọc tùy chọn)
 * @param {string} memberId - ID của member
 * @param {Object} [filters] - Bộ lọc { status, from, to }
 * @returns {Promise<Array>} Danh sách bookings
 */
async function getMyBookings(memberId, filters = {}) {
  const query = { member: memberId };

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.from || filters.to) {
    query.date = {};
    if (filters.from) {
      const fromDate = new Date(filters.from);
      fromDate.setUTCHours(0, 0, 0, 0);
      query.date.$gte = fromDate;
    }
    if (filters.to) {
      const toDate = new Date(filters.to);
      toDate.setUTCHours(23, 59, 59, 999);
      query.date.$lte = toDate;
    }
  }

  return Booking.find(query)
    .populate([
      {
        path: 'trainer',
        populate: { path: 'user', select: 'fullName email phone avatar' }
      },
      {
        path: 'subscription',
        populate: { path: 'package', select: 'name sessionLimit includesPT' }
      }
    ])
    .sort({ date: -1, startTime: -1 });
}

/**
 * Hủy lịch tập (Member tự hủy trước giờ tập)
 * @param {Object} param0
 * @param {string} param0.memberId - ID của member đăng nhập
 * @param {string} param0.bookingId - ID của lịch đặt
 * @param {string} [param0.reason] - Lý do hủy
 * @returns {Promise<Object>} Booking đã hủy và hạn mức buổi cập nhật
 */
async function cancelBooking({ memberId, bookingId, reason }) {
  if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
    throw new AppError('Mã lịch tập không hợp lệ.', 400);
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new AppError('Không tìm thấy lịch tập cần hủy.', 404);
  }

  // Kiểm tra quyền sở hữu lịch
  if (booking.member.toString() !== memberId.toString()) {
    throw new AppError('Bạn không có quyền thao tác trên lịch tập của người khác.', 403);
  }

  // Kiểm tra trạng thái hiện tại
  if (booking.status === BOOKING_STATUS.CANCELLED) {
    throw new AppError('Lịch tập này đã được hủy trước đó.', 400);
  }

  if (booking.status === BOOKING_STATUS.COMPLETED) {
    throw new AppError('Buổi tập đã hoàn thành, không thể hủy.', 400);
  }

  // Kiểm tra thời gian: Không cho phép hủy khi đã quá giờ bắt đầu buổi tập
  const sessionDateTime = new Date(booking.date);
  const [hours, minutes] = (booking.startTime || '00:00').split(':');
  sessionDateTime.setHours(Number(hours), Number(minutes), 0, 0);

  if (sessionDateTime < new Date()) {
    throw new AppError('Không thể hủy buổi tập đã diễn ra hoặc đã qua giờ bắt đầu.', 400);
  }

  // Đổi trạng thái sang cancelled
  booking.status = BOOKING_STATUS.CANCELLED;
  if (reason) {
    booking.note = booking.note ? `${booking.note} | Lý do hủy: ${reason.trim()}` : `Lý do hủy: ${reason.trim()}`;
  }
  await booking.save();

  // Populate lại thông tin
  await booking.populate([
    {
      path: 'trainer',
      populate: { path: 'user', select: 'fullName email phone avatar' }
    },
    {
      path: 'subscription',
      populate: { path: 'package', select: 'name sessionLimit' }
    }
  ]);

  // Lấy hạn mức cập nhật sau khi giải phóng slot
  const updatedUsage = await subscriptionService.getSubscriptionUsage(booking.subscription._id || booking.subscription);

  return {
    booking,
    remainingSessions: updatedUsage.remainingSessions,
    usedSessions: updatedUsage.usedSessions
  };
}

module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking
};

