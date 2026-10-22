const mongoose = require('mongoose');
const { User, TrainerProfile, Subscription, Booking } = require('../models');
const AppError = require('../utils/AppError');

function id(value) {
  if (typeof value !== 'string' || !mongoose.isObjectIdOrHexString(value)) throw new AppError('ID không hợp lệ.', 400);
  return value;
}
async function trainers() {
  const users = await User.find({ role: 'trainer', isActive: true }).distinct('_id');
  return TrainerProfile.find({ isActive: true, user: { $in: users } })
    .populate('user', 'fullName avatar').sort({ ratingAverage: -1, _id: 1 });
}
async function bookings(member) {
  return Booking.find({ member }).populate({ path: 'trainer', select: 'user', populate: { path: 'user', select: 'fullName' } })
    .populate({ path: 'subscription', select: 'package', populate: { path: 'package', select: 'name' } })
    .sort({ date: -1, startTime: -1, _id: -1 });
}
async function create(member, body) {
  const { date, startTime } = body;
  id(body.trainerId); id(body.subscriptionId);
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date)
    throw new AppError('Ngày tập không hợp lệ.', 400);
  if (typeof startTime !== 'string' || !/^(0[8-9]|1\d|2[01]):00$/.test(startTime))
    throw new AppError('Chọn ca 60 phút, bắt đầu từ 08:00 đến 21:00.', 400);
  const endTime = String(Number(startTime.slice(0, 2)) + 1).padStart(2, '0') + ':00';
  const start = new Date(`${date}T${startTime}:00+07:00`);
  const end = new Date(`${date}T${endTime}:00+07:00`);
  if (start <= new Date()) throw new AppError('Chỉ đặt lịch trong tương lai.', 400);
  const sub = await Subscription.findOne({ _id: body.subscriptionId, member }).populate('package');
  if (!sub || sub.status !== 'active' || sub.paymentStatus !== 'paid' || sub.startDate > start || sub.endDate < end)
    throw new AppError('Gói không hợp lệ hoặc không bao phủ thời gian buổi tập.', 409);
  if (!(sub.includesPT ?? sub.package?.includesPT)) throw new AppError('Gói không bao gồm PT.', 409);
  const trainer = await TrainerProfile.findOne({ _id: body.trainerId, isActive: true });
  if (!trainer || !await User.exists({ _id: trainer.user, role: 'trainer', isActive: true }))
    throw new AppError('Huấn luyện viên không còn hoạt động.', 409);
  const calendarDate = new Date(date + 'T00:00:00Z');
  if (await Booking.exists({ date: calendarDate, status: { $ne: 'cancelled' }, startTime: { $lt: endTime }, endTime: { $gt: startTime }, $or: [{ member }, { trainer: trainer._id }] }))
    throw new AppError('Bạn hoặc PT đã có lịch trong ca này.', 409);
  // Existing bookings predate quota tracking. Count them separately; new reservations use an atomic counter.
  const legacy = await Booking.countDocuments({ subscription: sub._id, quotaReserved: { $ne: true }, status: { $ne: 'cancelled' } });
  const limit = sub.sessionLimit === undefined ? sub.package?.sessionLimit : sub.sessionLimit;
  const filter = { _id: sub._id, member, status: 'active', paymentStatus: 'paid' };
  if (limit != null) filter.$expr = { $lt: [{ $add: [{ $ifNull: ['$reservedSessions', 0] }, legacy] }, limit] };
  const reserved = await Subscription.findOneAndUpdate(filter, { $inc: { reservedSessions: 1 } }, { new: true });
  if (!reserved) throw new AppError('Gói đã hết hạn mức buổi tập hoặc không còn hoạt động.', 409);
  try {
    return await Booking.create({ member, trainer: trainer._id, subscription: sub._id, date: calendarDate, startTime, endTime,
      note: typeof body.note === 'string' ? body.note.slice(0, 2000) : '', quotaReserved: true });
  } catch (error) {
    await Subscription.updateOne({ _id: sub._id, reservedSessions: { $gt: 0 } }, { $inc: { reservedSessions: -1 } });
    throw error;
  }
}
async function releaseQuota(booking) {
  if (booking.quotaReserved) await Subscription.updateOne({ _id: booking.subscription, reservedSessions: { $gt: 0 } }, { $inc: { reservedSessions: -1 } });
}
async function cancel(member, bookingId) {
  const doc = await Booking.findOne({ _id: id(bookingId), member });
  if (!doc) throw new AppError('Không tìm thấy lịch tập.', 404);
  if (doc.status === 'cancelled') return doc;
  if (doc.status !== 'booked' || new Date(`${doc.date.toISOString().slice(0, 10)}T${doc.startTime}:00+07:00`) <= new Date())
    throw new AppError('Chỉ hủy lịch đang chờ và trước giờ bắt đầu.', 409);
  doc.status = 'cancelled';
  await doc.save(); // Optimistic concurrency ensures that only one cancellation releases quota.
  await releaseQuota(doc);
  return doc;
}
module.exports = { trainers, bookings, create, cancel, releaseQuota };
