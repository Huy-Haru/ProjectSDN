const bookingService = require('../services/bookingService');
const { sendSuccess } = require('../utils/response');

/**
 * POST /api/bookings
 * Đặt lịch tập mới với PT
 */
async function createBooking(req, res) {
  const memberId = req.user._id;
  const { trainerId, date, startTime, endTime, note } = req.body;

  const result = await bookingService.createBooking({
    memberId,
    trainerId,
    date,
    startTime,
    endTime,
    note
  });

  return sendSuccess(
    res,
    result,
    'Đặt lịch tập thành công!',
    201
  );
}

/**
 * GET /api/bookings/my
 * Xem danh sách lịch tập của Member
 */
async function getMyBookings(req, res) {
  const memberId = req.user._id;
  const { status, from, to } = req.query;

  const bookings = await bookingService.getMyBookings(memberId, { status, from, to });

  return sendSuccess(res, bookings, 'Lấy danh sách lịch tập thành công.');
}

/**
 * PATCH /api/bookings/:id/cancel
 * Member hủy lịch tập đã đặt
 */
async function cancelBooking(req, res) {
  const memberId = req.user._id;
  const bookingId = req.params.id;
  const { reason } = req.body;

  const result = await bookingService.cancelBooking({
    memberId,
    bookingId,
    reason
  });

  return sendSuccess(res, result, 'Hủy lịch tập thành công.');
}

module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking
};
