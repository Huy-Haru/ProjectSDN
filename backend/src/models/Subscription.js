const mongoose = require('mongoose');
const { integer, dateRange } = require('../utils/schemaRules');
const { SUBSCRIPTION_STATUS, PAYMENT_STATUS } = require('../constants/statuses');

const subscriptionSchema = new mongoose.Schema({
  includesPT: { type: Boolean },
  sessionLimit: { type: Number, min: 1, validate: { validator: value => value == null || Number.isInteger(value), message: 'Hạn mức phải là số nguyên' } },
  reservedSessions: { type: Number, min: 0, validate: integer },
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ID học viên là bắt buộc']
  },
  package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MembershipPackage',
    required: [true, 'ID gói là bắt buộc']
  },
  startDate: {
    type: Date,
    required: [true, 'Ngày bắt đầu là bắt buộc']
  },
  endDate: {
    type: Date,
    required: [true, 'Ngày kết thúc là bắt buộc']
  },
  status: {
    type: String,
    enum: {
      values: Object.values(SUBSCRIPTION_STATUS),
      message: 'Trạng thái không hợp lệ'
    },
    default: SUBSCRIPTION_STATUS.PENDING
  },
  paymentStatus: {
    type: String,
    enum: {
      values: Object.values(PAYMENT_STATUS),
      message: 'Trạng thái thanh toán không hợp lệ'
    },
    default: PAYMENT_STATUS.UNPAID
  },
  amount: {
    type: Number,
    required: [true, 'Số tiền là bắt buộc'],
    validate: integer,
    min: [0, 'Số tiền không hợp lệ']
  },
  paidAt: { type: Date, required: function() { return this.paymentStatus === PAYMENT_STATUS.PAID; } }
}, {
  timestamps: true,
  optimisticConcurrency: true
});

dateRange(subscriptionSchema);
subscriptionSchema.index({ member: 1, status: 1, endDate: -1 });
subscriptionSchema.index({ paymentStatus: 1, paidAt: -1 });
// Method kiểm tra hiệu lực của gói hiện tại
subscriptionSchema.methods.isValid = function(at = new Date()) {
  return this.status === SUBSCRIPTION_STATUS.ACTIVE && this.paymentStatus === PAYMENT_STATUS.PAID && this.startDate <= at && this.endDate >= at;
};

// Static method tìm gói active của một member
subscriptionSchema.statics.findActiveByMember = function(memberId, at = new Date()) {
  return this.findOne({
    member: memberId,
    status: SUBSCRIPTION_STATUS.ACTIVE,
    paymentStatus: PAYMENT_STATUS.PAID,
    startDate: { $lte: at },
    endDate: { $gte: at }
  }).sort({ endDate: -1, _id: -1 });
};

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
