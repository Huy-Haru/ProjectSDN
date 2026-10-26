/**
 * Seed script — Tạo dữ liệu mẫu trong MongoDB để test.
 *
 * Chạy: node src/scripts/seed.js
 *
 * Script đọc .env giống server, kết nối MongoDB,
 * xóa dữ liệu cũ rồi tạo lại để đảm bảo idempotent.
 * Password được hash qua User.create() (model có pre-save hook).
 */

const path = require('path');

// Đọc .env từ thư mục backend (giống server.js)
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const mongoose = require('mongoose');
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fitmanager';

// Import tất cả model
const {
  User,
  TrainerProfile,
  MembershipPackage,
  Subscription,
  Booking,
  WorkoutPlan,
  ProgressLog,
  Review
} = require('../models');

async function seed() {
  // --- Kết nối MongoDB ---
  console.log('Đang kết nối MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('Đã kết nối MongoDB.');

  // --- Xóa dữ liệu cũ (theo thứ tự ngược lại quan hệ) ---
  console.log('Xóa dữ liệu cũ...');
  await Review.deleteMany({});
  await ProgressLog.deleteMany({});
  await WorkoutPlan.deleteMany({});
  await Booking.deleteMany({});
  await Subscription.deleteMany({});
  await TrainerProfile.deleteMany({});
  await MembershipPackage.deleteMany({});
  await User.deleteMany({});
  console.log('Đã xóa xong.');

  // --- Tạo Users ---
  // Dùng User.create() để pre-save hook hash password tự chạy.
  console.log('Tạo tài khoản...');

  const admin = await User.create({
    fullName: 'Phạm Hoàng Nam',
    email: 'admin@fitmanager.vn',
    password: 'Admin@123',
    phone: '0999999999',
    gender: 'male',
    role: 'admin'
  });

  const trainerUser = await User.create({
    fullName: 'Trần Minh Đức',
    email: 'minhduc.pt@fitmanager.vn',
    password: 'Trainer@123',
    phone: '0912345678',
    gender: 'male',
    role: 'trainer'
  });

  const trainerUser2 = await User.create({
    fullName: 'Nguyễn Thu Trang',
    email: 'thutrang.pt@fitmanager.vn',
    password: 'Trainer@123',
    phone: '0933445566',
    gender: 'female',
    role: 'trainer'
  });

  const member = await User.create({
    fullName: 'Nguyễn Văn An',
    email: 'nguyenvanan@gmail.com',
    password: 'Member@123',
    phone: '0987654321',
    gender: 'male',
    role: 'member'
  });

  console.log('  Admin  :', admin.email, '| pass: Admin@123');
  console.log('  Trainer:', trainerUser.email, '| pass: Trainer@123');
  console.log('  Trainer:', trainerUser2.email, '| pass: Trainer@123');
  console.log('  Member :', member.email, '| pass: Member@123');

  // --- Tạo TrainerProfile ---
  console.log('Tạo TrainerProfile...');

  const trainer1 = await TrainerProfile.create({
    user: trainerUser._id,
    specialties: ['Tăng cơ', 'Giảm mỡ', 'Tập tạ nặng'],
    experienceYears: 7,
    bio: 'Chuyên gia huấn luyện thể hình với chứng chỉ NASM. Đã giúp 300+ học viên.',
    certificates: ['NASM-CPT', 'ACE-PT'],
    pricePerSession: 500000,
    isActive: true
  });

  const trainer2 = await TrainerProfile.create({
    user: trainerUser2._id,
    specialties: ['Pilates', 'Cột sống & Posture', 'Dẻo dai'],
    experienceYears: 5,
    bio: 'Chuyên viên Pilates quốc tế Stott Pilates.',
    certificates: ['Stott Pilates'],
    pricePerSession: 450000,
    isActive: true
  });

  console.log('  Trainer1 profile:', trainer1._id);
  console.log('  Trainer2 profile:', trainer2._id);

  // --- Tạo MembershipPackage ---
  console.log('Tạo gói tập...');

  const pkgBasic = await MembershipPackage.create({
    name: 'Gói Cơ Bản (Basic Fit)',
    description: 'Dành cho người mới bắt đầu. Tập trung vào các tiện ích cơ bản.',
    durationDays: 30,
    price: 299000,
    sessionLimit: 8,
    includesPT: false,
    isActive: true
  });

  const pkgPremium = await MembershipPackage.create({
    name: 'Gói Cao Cấp (Premium Plus)',
    description: 'Trải nghiệm trọn vẹn mọi khung giờ, hỗ trợ PT chuyên sâu.',
    durationDays: 90,
    price: 1499000,
    sessionLimit: 24,
    includesPT: true,
    isActive: true
  });

  const pkgVip = await MembershipPackage.create({
    name: 'Gói VIP Thượng Đỉnh (VIP Elite)',
    description: 'Đặc quyền tối thượng dành cho doanh nhân.',
    durationDays: 365,
    price: 9990000,
    sessionLimit: null, // Không giới hạn buổi
    includesPT: true,
    isActive: true
  });

  console.log('  Basic  :', pkgBasic.name, '|', pkgBasic.price, 'đ |', pkgBasic.durationDays, 'ngày');
  console.log('  Premium:', pkgPremium.name, '|', pkgPremium.price, 'đ |', pkgPremium.durationDays, 'ngày');
  console.log('  VIP    :', pkgVip.name, '|', pkgVip.price, 'đ |', pkgVip.durationDays, 'ngày');

  // --- Tổng kết ---
  console.log('\n=== SEED HOÀN TẤT ===');
  console.log('Users        :', await User.countDocuments());
  console.log('TrainerProfile:', await TrainerProfile.countDocuments());
  console.log('Packages     :', await MembershipPackage.countDocuments());
  console.log('\nTài khoản test:');
  console.log('  Admin   → admin@fitmanager.vn / Admin@123');
  console.log('  Trainer → minhduc.pt@fitmanager.vn / Trainer@123');
  console.log('  Trainer → thutrang.pt@fitmanager.vn / Trainer@123');
  console.log('  Member  → nguyenvanan@gmail.com / Member@123');

  await mongoose.disconnect();
  console.log('\nĐã ngắt kết nối MongoDB.');
}

// Chạy và xử lý lỗi
seed().catch((err) => {
  console.error('Seed thất bại:', err);
  mongoose.disconnect();
  process.exit(1);
});
