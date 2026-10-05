const mongoose = require('mongoose');
const { SUBSCRIPTION_STATUS, PAYMENT_STATUS } = require('../constants/statuses');

const subscriptionSchema = new mongoose.Schema({
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
    min: [0, 'Số tiền không hợp lệ']
  }
}, {
  timestamps: true
});

// Method kiểm tra hiệu lực của gói hiện tại
subscriptionSchema.methods.isValid = function() {
  return this.status === SUBSCRIPTION_STATUS.ACTIVE && this.endDate >= new Date();
};

// Static method tìm gói active của một member
subscriptionSchema.statics.findActiveByMember = async function(memberId) {
  return this.findOne({
    member: memberId,
    status: SUBSCRIPTION_STATUS.ACTIVE,
    endDate: { $gte: new Date() }
  });
};

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
