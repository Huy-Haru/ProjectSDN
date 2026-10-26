const mongoose = require('mongoose');
const { BOOKING_STATUS } = require('../constants/statuses');

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

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
    trim: true,
    match: [TIME_REGEX, 'Giờ bắt đầu phải theo định dạng HH:mm (ví dụ 09:00)']
  },
  endTime: {
    type: String, // ví dụ '10:00'
    required: [true, 'Giờ kết thúc là bắt buộc'],
    trim: true,
    match: [TIME_REGEX, 'Giờ kết thúc phải theo định dạng HH:mm (ví dụ 10:00)']
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

// Hook tiền xử lý: kiểm tra endTime > startTime và chuẩn hóa ngày về UTC midnight
bookingSchema.pre('validate', function(next) {
  if (this.startTime && this.endTime && this.startTime >= this.endTime) {
    this.invalidate('endTime', 'Giờ kết thúc phải sau giờ bắt đầu');
  }

  if (this.date) {
    const d = new Date(this.date);
    if (!isNaN(d.getTime())) {
      d.setUTCHours(0, 0, 0, 0);
      this.date = d;
    }
  }

  next();
});

// Partial unique index cho trainer: Chống trùng lịch, không giữ chỗ khi cancelled
bookingSchema.index(
  { trainer: 1, date: 1, startTime: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: {
        $in: [
          BOOKING_STATUS.BOOKED,
          BOOKING_STATUS.COMPLETED,
          BOOKING_STATUS.NO_SHOW
        ]
      }
    }
  }
);

// Partial unique index cho member: Một member không thể đặt 2 lịch trùng giờ
bookingSchema.index(
  { member: 1, date: 1, startTime: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: {
        $in: [
          BOOKING_STATUS.BOOKED,
          BOOKING_STATUS.COMPLETED,
          BOOKING_STATUS.NO_SHOW
        ]
      }
    }
  }
);

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
