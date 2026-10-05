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
    trim: true
  },
  endTime: {
    type: String,
    required: [true, 'Giờ kết thúc là bắt buộc'],
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
  timestamps: true
});

// Index unique chống trùng lịch của cùng một trainer + date + startTime
bookingSchema.index({ trainer: 1, date: 1, startTime: 1 }, { unique: true });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
