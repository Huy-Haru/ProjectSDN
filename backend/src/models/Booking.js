const mongoose = require('mongoose');
const { BOOKING_STATUS } = require('../constants/statuses');

const bookingSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ID học viên là bắt buộc']
  },
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TrainerProfile',
    required: [true, 'ID huấn luyện viên là bắt buộc']
  },
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    required: [true, 'ID gói là bắt buộc']
  },
  date: {
    type: Date,
    required: [true, 'Ngày đặt lịch là bắt buộc']
  },
  startTime: {
    type: String, // ví dụ '09:00'
    required: [true, 'Giờ bắt đầu là bắt buộc'],
    match: [/^(?:[01]\d|2[0-3]):[0-5]\d$/, 'Giờ phải có định dạng HH:mm'],
    trim: true
  },
  endTime: {
    type: String,
    required: [true, 'Giờ kết thúc là bắt buộc'],
    match: [/^(?:[01]\d|2[0-3]):[0-5]\d$/, 'Giờ phải có định dạng HH:mm'],
    trim: true
  },
  status: {
    type: String,
    enum: {
      values: Object.values(BOOKING_STATUS),
      message: 'Trạng thái không hợp lệ'
    },
    default: BOOKING_STATUS.BOOKED
  },
  note: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  optimisticConcurrency: true
});

bookingSchema.pre('validate', function() {
  // Calendar date encoded as UTC midnight; API should accept YYYY-MM-DD.
  if (this.date && !Number.isNaN(this.date.getTime())) this.date = new Date(Date.UTC(this.date.getUTCFullYear(), this.date.getUTCMonth(), this.date.getUTCDate()));
  if (this.startTime && this.endTime && this.endTime <= this.startTime) this.invalidate('endTime', 'Giờ kết thúc phải sau giờ bắt đầu');
});
const heldSlot = { status: { $in: [BOOKING_STATUS.BOOKED, BOOKING_STATUS.COMPLETED, BOOKING_STATUS.NO_SHOW] } };
bookingSchema.index({ trainer: 1, date: 1, startTime: 1 }, { name: 'trainer_held_slot_unique', unique: true, partialFilterExpression: heldSlot });
bookingSchema.index({ member: 1, date: 1, startTime: 1 }, { name: 'member_held_slot_unique', unique: true, partialFilterExpression: heldSlot });
bookingSchema.index({ trainer: 1, date: 1, status: 1, startTime: 1 });
bookingSchema.index({ member: 1, date: -1, startTime: 1 });
bookingSchema.index({ subscription: 1, status: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
