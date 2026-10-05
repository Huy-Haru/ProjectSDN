const mongoose = require('mongoose');

const membershipPackageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên gói là bắt buộc'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  durationDays: {
    type: Number,
    required: [true, 'Thời hạn gói (số ngày) là bắt buộc'],
    min: [1, 'Thời hạn ít nhất là 1 ngày']
  },
  price: {
    type: Number,
    required: [true, 'Giá gói là bắt buộc'],
    min: [0, 'Giá gói không hợp lệ']
  },
  sessionLimit: {
    type: Number,
    default: null, // null nghĩa là không giới hạn
    min: [1, 'Số buổi giới hạn không hợp lệ']
  },
  includesPT: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const MembershipPackage = mongoose.model('MembershipPackage', membershipPackageSchema);

module.exports = MembershipPackage;
