const mongoose = require('mongoose');
const { integer } = require('../utils/schemaRules');

const reviewSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    immutable: true,
    required: [true, 'ID học viên là bắt buộc']
  },
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TrainerProfile',
    immutable: true,
    required: [true, 'ID huấn luyện viên là bắt buộc']
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    immutable: true,
    required: [true, 'ID lịch đặt là bắt buộc'],
    unique: true
  },
  rating: {
    type: Number,
    required: [true, 'Đánh giá là bắt buộc'],
    validate: integer,
    min: [1, 'Đánh giá tối thiểu là 1'],
    max: [5, 'Đánh giá tối đa là 5']
  },
  comment: {
    type: String,
    maxlength: 2000,
    trim: true
  }
}, {
  timestamps: true,
  optimisticConcurrency: true
});

reviewSchema.index({ trainer: 1, createdAt: -1 });
reviewSchema.index({ member: 1, createdAt: -1 });

// Static method để tính toán average rating của trainer
reviewSchema.statics.calcAverageRatings = async function(trainerId) {
  const stats = await this.aggregate([
    { $match: { trainer: new mongoose.Types.ObjectId(String(trainerId)) } },
    {
      $group: {
        _id: '$trainer',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await mongoose.model('TrainerProfile').findByIdAndUpdate(trainerId, {
      ratingCount: stats[0].nRating,
      ratingAverage: stats[0].avgRating
    });
  } else {
    await mongoose.model('TrainerProfile').findByIdAndUpdate(trainerId, {
      ratingCount: 0,
      ratingAverage: 0
    });
  }
};

// Chạy sau khi document được lưu (create hoặc save)
reviewSchema.post('save', async function() {
  // this trỏ đến document vừa được lưu
  await this.constructor.calcAverageRatings(this.trainer);
});

// Chạy sau khi document bị xóa (findByIdAndDelete, findOneAndDelete)
reviewSchema.post(['findOneAndUpdate', 'findOneAndDelete'], async function(doc) {
  if (doc) {
    await this.model.calcAverageRatings(doc.trainer);
  }
});

reviewSchema.post('deleteOne', { document: true, query: false }, async function() {
  await this.constructor.calcAverageRatings(this.trainer);
});
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
