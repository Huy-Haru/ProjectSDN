const mongoose = require('mongoose');

const workoutSubmissionSchema = new mongoose.Schema({
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkoutPlan', required: true },
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exerciseName: { type: String, trim: true, required: true },
  completedOn: { type: Date, required: true },
  proofUrl: { type: String, trim: true, required: true, maxlength: 1000 },
  note: { type: String, trim: true, maxlength: 500 },
  status: { type: String, enum: ['submitted', 'reviewed'], default: 'submitted' }
}, { timestamps: true });

workoutSubmissionSchema.index({ member: 1, completedOn: -1 });
workoutSubmissionSchema.index({ plan: 1, member: 1, completedOn: -1 });

module.exports = mongoose.model('WorkoutSubmission', workoutSubmissionSchema);
