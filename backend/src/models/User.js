const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES } = require('../constants/roles');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Họ và tên là bắt buộc'],
    maxlength: 120,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email là bắt buộc'],
    maxlength: 254,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email không hợp lệ'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Mật khẩu là bắt buộc'],
    minlength: 8,
    validate: { validator: value => Buffer.byteLength(value, 'utf8') <= 72, message: 'Mật khẩu không vượt quá 72 byte' },
    select: false
  },
  phone: {
    type: String,
    trim: true
  },
  gender: {
    type: String,
    enum: {
      values: ['male', 'female', 'other'],
      message: 'Giới tính không hợp lệ'
    }
  },
  dateOfBirth: {
    type: Date
  },
  avatar: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: {
      values: Object.values(ROLES),
      message: 'Vai trò không hợp lệ'
    },
    default: ROLES.MEMBER
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  optimisticConcurrency: true
});

userSchema.index({ role: 1, isActive: 1, createdAt: -1 });
userSchema.set('toJSON', { transform: (_doc, ret) => { delete ret.password; return ret; } });
// Hash mật khẩu trước khi lưu
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method kiểm tra mật khẩu
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
