const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
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
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'ID lịch đặt là bắt buộc'],
    unique: true
  },
  rating: {
    type: Number,
    required: [true, 'Đánh giá là bắt buộc'],
    min: [1, 'Đánh giá tối thiểu là 1'],
    max: [5, 'Đánh giá tối đa là 5']
  },
  comment: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Static method để tính toán average rating của trainer
reviewSchema.statics.calcAverageRatings = async function(trainerId) {
  const stats = await this.aggregate([
    { $match: { trainer: trainerId } },
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
reviewSchema.post('save', function() {
  // this trỏ đến document vừa được lưu
  this.constructor.calcAverageRatings(this.trainer);
});

// Chạy sau khi document bị xóa (findByIdAndDelete, findOneAndDelete)
reviewSchema.post(/^findOneAnd/, async function(doc) {
  if (doc) {
    await doc.constructor.calcAverageRatings(doc.trainer);
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
