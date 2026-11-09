const mongoose = require('mongoose');
const { User, TrainerProfile, Subscription, Booking, Review } = require('../models');
const AppError = require('../utils/AppError');

function id(value) {
  if (typeof value !== 'string' || !mongoose.isObjectIdOrHexString(value)) throw new AppError('ID không hợp lệ.', 400);
  return value;
}
async function trainers() {
  const users = await User.find({ role: 'trainer', isActive: true }).distinct('_id');
  const profiles = await TrainerProfile.find({ isActive: true, user: { $in: users } })
    .populate('user', 'fullName avatar').lean();
  // Read canonical review totals so concurrent cache refreshes cannot show stale ratings.
  const stats = await Review.aggregate([
    { $match: { trainer: { $in: profiles.map(profile => profile._id) } } },
    { $group: { _id: '$trainer', count: { $sum: 1 }, average: { $avg: '$rating' } } }
  ]);
  const byId = new Map(stats.map(stat => [String(stat._id), stat]));
  return profiles.map(profile => {
    const stat = byId.get(String(profile._id));
    return { ...profile, ratingCount: stat?.count || 0, ratingAverage: stat ? Math.round(stat.average * 10) / 10 : 0 };
  }).sort((a, b) => b.ratingAverage - a.ratingAverage || String(a._id).localeCompare(String(b._id)));
}
async function bookings(member, filters = {}) {
  const query = { member };
  if (filters.status) {
    if (!['booked', 'completed', 'cancelled', 'no_show'].includes(filters.status)) {
      throw new AppError('Trạng thái lịch không hợp lệ.', 400);
    }
    query.status = filters.status;
  }
  if (filters.from || filters.to) {
    query.date = {};
    if (filters.from) {
      if (typeof filters.from !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(filters.from) || Number.isNaN(Date.parse(filters.from)) || new Date(filters.from).toISOString().slice(0, 10) !== filters.from) {
        throw new AppError('Ngày bắt đầu lọc không hợp lệ.', 400);
      }
      query.date.$gte = new Date(`${filters.from}T00:00:00Z`);
    }
    if (filters.to) {
      if (typeof filters.to !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(filters.to) || Number.isNaN(Date.parse(filters.to)) || new Date(filters.to).toISOString().slice(0, 10) !== filters.to) {
        throw new AppError('Ngày kết thúc lọc không hợp lệ.', 400);
      }
      query.date.$lte = new Date(`${filters.to}T00:00:00Z`);
    }
    if (query.date.$gte && query.date.$lte && query.date.$gte > query.date.$lte) {
      throw new AppError('Khoảng ngày lọc không hợp lệ.', 400);
    }
  }
  return Booking.find(query).populate({ path: 'trainer', select: 'user', populate: { path: 'user', select: 'fullName' } })
    .populate({ path: 'subscription', select: 'package', populate: { path: 'package', select: 'name' } })
    .sort({ date: -1, startTime: -1, _id: -1 }).lean();
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
async function cancel(member, bookingId, reason) {
  const doc = await Booking.findOne({ _id: id(bookingId), member });
  if (!doc) throw new AppError('Không tìm thấy lịch tập.', 404);
  if (doc.status === 'cancelled') return doc;
  if (doc.status !== 'booked' || new Date(`${doc.date.toISOString().slice(0, 10)}T${doc.startTime}:00+07:00`) <= new Date())
    throw new AppError('Chỉ hủy lịch đang chờ và trước giờ bắt đầu.', 409);
  if (reason !== undefined && (typeof reason !== 'string' || reason.length > 500))
    throw new AppError('Lý do hủy tối đa 500 ký tự.', 400);
  doc.status = 'cancelled';
  if (typeof reason === 'string' && reason.trim()) doc.note = `${doc.note ? `${doc.note}\n` : ''}Lý do hủy: ${reason.trim()}`.slice(0, 2000);
  await doc.save(); // Optimistic concurrency ensures that only one cancellation releases quota.
  await releaseQuota(doc);
  return doc;
}
async function getById(member, bookingId) {
  const doc = await Booking.findOne({ _id: id(bookingId), member })
    .populate({ path: 'trainer', select: 'user', populate: { path: 'user', select: 'fullName email phone avatar' } })
    .populate({ path: 'subscription', select: 'package status paymentStatus startDate endDate', populate: { path: 'package', select: 'name sessionLimit includesPT' } });
  if (!doc) throw new AppError('Không tìm thấy lịch tập.', 404);
  return doc;
}
module.exports = { trainers, bookings, create, cancel, getById, releaseQuota };
