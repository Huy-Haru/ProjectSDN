const AppError = require('../utils/AppError');

async function transition(booking, status) {
  if (!['completed', 'cancelled', 'no_show'].includes(status)) throw new AppError('Trạng thái đích không hợp lệ.', 400);
  if (booking.status === status) return booking;
  if (booking.status !== 'booked') throw new AppError('Không thể thay đổi trạng thái đã kết thúc.', 409);
  const day = booking.date.toISOString().slice(0, 10);
  const start = new Date(`${day}T${booking.startTime}:00+07:00`);
  const end = new Date(`${day}T${booking.endTime}:00+07:00`);
  if (status === 'cancelled' && start <= new Date()) throw new AppError('Chỉ hủy trước giờ bắt đầu.', 409);
  if (status !== 'cancelled' && end > new Date()) throw new AppError('Chưa đến giờ kết thúc buổi tập.', 409);
  booking.status = status;
  await booking.save();
  if (status === 'cancelled') await require('./memberBookingService').releaseQuota(booking);
  return booking;
}
module.exports = { transition };
