const mongoose = require('mongoose');
const crypto = require('node:crypto');
const { TrainerProfile, User, Booking, ProgressLog } = require('../models');
const AppError = require('../utils/AppError');

async function relatedTrainer(userId, memberId) {
  if (typeof memberId !== 'string' || !mongoose.isObjectIdOrHexString(memberId)) throw new AppError('ID học viên không hợp lệ.', 400);
  const trainer = await TrainerProfile.findOne({ user: userId, isActive: true });
  if (!trainer) throw new AppError('Hồ sơ PT không hoạt động.', 403);
  const [member, relation] = await Promise.all([
    User.exists({ _id: memberId, role: 'member', isActive: true }),
    Booking.exists({ member: memberId, trainer: trainer._id, status: { $in: ['booked', 'completed', 'no_show'] } })
  ]);
  if (!member || !relation) throw new AppError('Bạn không có học viên này trong lịch tập.', 403);
  return trainer;
}
async function listForTrainer(userId, memberId) {
  const trainer = await relatedTrainer(userId, memberId);
  return ProgressLog.find({ member: memberId, trainer: trainer._id }).sort({ date: -1, _id: -1 });
}
async function listForMember(memberId) {
  return ProgressLog.find({ member: memberId }).populate({ path: 'trainer', select: 'user', populate: { path: 'user', select: 'fullName' } })
    .sort({ date: -1, _id: -1 });
}
async function create(userId, memberId, body) {
  const trainer = await relatedTrainer(userId, memberId);
  const today = new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10);
  const date = body.date || today;
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date || date > today)
    throw new AppError('Ngày ghi nhận phải hợp lệ và không sau hôm nay.', 400);
  const data = { member: memberId, trainer: trainer._id, date: new Date(date + 'T00:00:00+07:00') };
  for (const field of ['weight', 'height', 'bodyFat']) {
    if (body[field] !== undefined) {
      if (typeof body[field] !== 'number' || !Number.isFinite(body[field])) throw new AppError('Chỉ số phải là số hợp lệ.', 400);
      data[field] = body[field];
    }
  }
  if (body.note !== undefined && (typeof body.note !== 'string' || body.note.length > 2000)) throw new AppError('Ghi chú tối đa 2000 ký tự.', 400);
  data.note = body.note?.trim() || '';
  if (!['weight', 'height', 'bodyFat'].some(field => data[field] !== undefined) && !data.note)
    throw new AppError('Nhập ít nhất một chỉ số hoặc ghi chú.', 400);
  let requestQuery;
  if (body.requestId !== undefined) {
    if (typeof body.requestId !== 'string' || !/^[a-zA-Z0-9_-]{16,100}$/.test(body.requestId))
      throw new AppError('Mã yêu cầu không hợp lệ.', 400);
    data.requestId = body.requestId;
    data.requestHash = crypto.createHash('sha256').update(JSON.stringify([
      date, data.weight ?? null, data.height ?? null, data.bodyFat ?? null, data.note
    ])).digest('hex');
    requestQuery = { trainer: trainer._id, member: memberId, requestId: data.requestId };
    const existing = await ProgressLog.findOne(requestQuery).select('+requestHash');
    if (existing) return replay(existing, data.requestHash);
  }
  data.attendedSessions = await Booking.countDocuments({ member: memberId, trainer: trainer._id, status: 'completed', date: { $lte: new Date(date + 'T00:00:00Z') } });
  try { return await ProgressLog.create(data); }
  catch (error) {
    if (error.code === 11000 && requestQuery) {
      const existing = await ProgressLog.findOne(requestQuery).select('+requestHash');
      if (existing) return replay(existing, data.requestHash);
    }
    throw error;
  }
}
function replay(existing, hash) {
  if (existing.requestHash !== hash) throw new AppError('Mã yêu cầu đã dùng cho nội dung khác.', 409);
  return existing;
}
module.exports = { listForTrainer, listForMember, create };
