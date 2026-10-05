const mongoose = require('mongoose');

const workoutPlanSchema = new mongoose.Schema({
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TrainerProfile',
    required: [true, 'ID huấn luyện viên là bắt buộc']
  },
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ID học viên là bắt buộc']
  },
  title: {
    type: String,
    required: [true, 'Tiêu đề là bắt buộc'],
    trim: true
  },
  goal: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, 'Ngày bắt đầu là bắt buộc']
  },
  endDate: {
    type: Date,
    required: [true, 'Ngày kết thúc là bắt buộc']
  },
  items: [{
    dayOfWeek: {
      type: String, // ví dụ: 'Monday', '2', v.v.
      trim: true
    },
    exerciseName: {
      type: String,
      required: [true, 'Tên bài tập là bắt buộc'],
      trim: true
    },
    sets: {
      type: Number,
      required: [true, 'Số hiệp là bắt buộc']
    },
    reps: {
      type: String, // String để có thể linh hoạt, vd '8-12'
      required: [true, 'Số lần lặp (reps) là bắt buộc']
    },
    note: {
      type: String,
      trim: true
    }
  }],
  status: {
    type: String,
    enum: {
      values: ['active', 'completed', 'cancelled'],
      message: 'Trạng thái không hợp lệ'
    },
    default: 'active'
  }
}, {
  timestamps: true
});

const WorkoutPlan = mongoose.model('WorkoutPlan', workoutPlanSchema);

module.exports = WorkoutPlan;
