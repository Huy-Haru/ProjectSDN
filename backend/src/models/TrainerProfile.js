const mongoose = require('mongoose');
const { integer, optionalInteger } = require('../utils/schemaRules');

const trainerProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID là bắt buộc'],
    unique: true
  },
  specialties: [{
    type: String,
    trim: true
  }],
  experienceYears: {
    type: Number,
    validate: optionalInteger,
    min: [0, 'Năm kinh nghiệm không hợp lệ']
  },
  bio: {
    type: String,
    trim: true
  },
  certificates: [{
    type: String,
    trim: true
  }],
  pricePerSession: {
    type: Number,
    required: [true, 'Giá mỗi buổi tập là bắt buộc'],
    validate: integer,
    min: [0, 'Giá không hợp lệ']
  },
  ratingAverage: {
    type: Number,
    default: 0,
    min: [0, 'Đánh giá tối thiểu là 0'],
    max: [5, 'Đánh giá tối đa là 5'],
    set: val => Math.round(val * 10) / 10 // Làm tròn 1 chữ số thập phân
  },
  ratingCount: {
    type: Number,
    min: 0,
    validate: integer,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  optimisticConcurrency: true
});

trainerProfileSchema.index({ isActive: 1, specialties: 1, ratingAverage: -1 });

const TrainerProfile = mongoose.model('TrainerProfile', trainerProfileSchema);

module.exports = TrainerProfile;
