const mongoose = require('mongoose');
const { integer } = require('../utils/schemaRules');

const progressLogSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ID học viên là bắt buộc']
  },
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TrainerProfile' // optional
  },
  date: {
    type: Date,
    required: [true, 'Ngày ghi nhận là bắt buộc'],
    default: Date.now
  },
  weight: {
    type: Number, // đơn vị kg
    min: [0, 'Cân nặng không hợp lệ']
  },
  bodyFat: {
    type: Number, // phần trăm
    min: [0, 'Tỉ lệ mỡ không hợp lệ'],
    max: [100, 'Tỉ lệ mỡ không hợp lệ']
  },
  height: {
    type: Number, // đơn vị cm
    min: [0, 'Chiều cao không hợp lệ']
  },
  note: {
    type: String,
    trim: true
  },
  attendedSessions: {
    type: Number,
    default: 0,
    validate: integer,
    min: [0, 'Số buổi tập đã tham gia không hợp lệ']
  }
}, {
  timestamps: true,
  optimisticConcurrency: true
});

progressLogSchema.index({ member: 1, date: -1 });
progressLogSchema.index({ trainer: 1, member: 1, date: -1 });
const ProgressLog = mongoose.model('ProgressLog', progressLogSchema);

module.exports = ProgressLog;
