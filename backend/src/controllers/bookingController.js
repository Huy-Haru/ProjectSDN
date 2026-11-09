const bookingService = require('../services/memberBookingService');
const { sendSuccess } = require('../utils/response');

async function createBooking(req, res) {
  const booking = await bookingService.create(req.user._id, req.body);
  return sendSuccess(res, { booking }, 'Đặt lịch thành công.', 201);
}

async function getMyBookings(req, res) {
  const bookings = await bookingService.bookings(req.user._id, req.query);
  return sendSuccess(res, { bookings });
}

async function cancelBooking(req, res) {
  const reason = req.body?.reason;
  if (reason !== undefined && typeof reason !== 'string') {
    const AppError = require('../utils/AppError');
    throw new AppError('Lý do hủy phải là chuỗi ký tự.', 400);
  }
  const booking = await bookingService.cancel(req.user._id, req.params.id, reason);
  return sendSuccess(res, { booking }, 'Đã hủy lịch tập.');
}

module.exports = { createBooking, getMyBookings, cancelBooking };
