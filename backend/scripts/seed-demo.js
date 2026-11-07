require('dotenv').config({ path: require('node:path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const { User, TrainerProfile, MembershipPackage, Subscription, Booking, WorkoutPlan, ProgressLog, Review, WorkoutSubmission } = require('../src/models');

const PASSWORD = 'FitManager123!';
const isoDate = offset => { const date = new Date(); date.setUTCHours(0, 0, 0, 0); date.setUTCDate(date.getUTCDate() + offset); return date; };

async function clearDemo() {
  const users = await User.find({ email: /@fitmanager\.test$/i }).select('_id');
  const userIds = users.map(user => user._id);
  const trainers = await TrainerProfile.find({ user: { $in: userIds } }).select('_id');
  const trainerIds = trainers.map(trainer => trainer._id);
  const subscriptions = await Subscription.find({ member: { $in: userIds } }).select('_id');
  const subscriptionIds = subscriptions.map(subscription => subscription._id);
  const plans = await WorkoutPlan.find({ $or: [{ member: { $in: userIds } }, { trainer: { $in: trainerIds } }] }).select('_id');
  await Promise.all([
    WorkoutSubmission.deleteMany({ $or: [{ member: { $in: userIds } }, { plan: { $in: plans.map(plan => plan._id) } }] }),
    Review.deleteMany({ $or: [{ member: { $in: userIds } }, { trainer: { $in: trainerIds } }] }),
    ProgressLog.deleteMany({ $or: [{ member: { $in: userIds } }, { trainer: { $in: trainerIds } }] }),
    Booking.deleteMany({ $or: [{ member: { $in: userIds } }, { trainer: { $in: trainerIds } }, { subscription: { $in: subscriptionIds } }] }),
    WorkoutPlan.deleteMany({ _id: { $in: plans.map(plan => plan._id) } }),
    Subscription.deleteMany({ _id: { $in: subscriptionIds } }),
    TrainerProfile.deleteMany({ _id: { $in: trainerIds } }),
    User.deleteMany({ _id: { $in: userIds } }),
    MembershipPackage.deleteMany({ name: /^\[DEMO\]/ })
  ]);
}

async function seed() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error('MONGODB_URI chưa được cấu hình.');
  await mongoose.connect(uri);
  await clearDemo();
  const admin = await User.create({ fullName: 'FitManager Admin', email: 'admin@fitmanager.test', password: PASSWORD, phone: '0900000001', role: 'admin', avatar: 'https://i.pravatar.cc/160?img=12' });
  const trainers = await User.create(Array.from({ length: 10 }, (_, index) => ({ fullName: ['Nguyễn Minh Anh', 'Trần Quốc Huy', 'Lê Khánh Linh', 'Phạm Hoàng Nam', 'Võ Ngọc Mai', 'Đặng Gia Bảo', 'Bùi Thanh Hà', 'Phan Đức Long', 'Hồ Thảo Vy', 'Đỗ Nhật Minh'][index], email: `trainer${String(index + 1).padStart(2, '0')}@fitmanager.test`, password: PASSWORD, phone: `090100${String(index + 1).padStart(4, '0')}`, role: 'trainer', avatar: `https://i.pravatar.cc/320?img=${20 + index}` })));
  const trainerProfiles = await TrainerProfile.create(trainers.map((trainer, index) => ({ user: trainer._id, specialties: [['Strength', 'Bodybuilding'], ['Yoga', 'Mobility'], ['Fat loss', 'Cardio'], ['Powerlifting', 'Strength'], ['Pilates', 'Core'], ['Functional', 'Rehab'], ['HIIT', 'Conditioning'], ['Boxing', 'Conditioning'], ['Dance fitness', 'Zumba'], ['Nutrition', 'Lifestyle']][index], experienceYears: 3 + (index % 8), bio: `HLV ${trainer.fullName} xây dựng lộ trình thực tế, theo sát từng tuần và điều chỉnh theo thể trạng.`, certificates: ['ACE CPT', index % 2 ? 'NASM' : 'ISSA'], pricePerSession: 280000 + index * 30000, ratingAverage: 4.2 + (index % 8) / 10, ratingCount: 8 + index * 3, isActive: true })));
  const members = await User.create(Array.from({ length: 100 }, (_, index) => ({ fullName: `Hội viên Demo ${String(index + 1).padStart(3, '0')}`, email: `member${String(index + 1).padStart(3, '0')}@fitmanager.test`, password: PASSWORD, phone: `091200${String(index + 1).padStart(4, '0')}`, role: 'member', gender: index % 2 ? 'female' : 'male', avatar: `https://i.pravatar.cc/160?img=${(index % 70) + 1}` })));
  const packages = await MembershipPackage.create([
    ['[DEMO] Starter tháng', 'Tự do sử dụng khu máy cơ bản.', 30, 399000, null, false],
    ['[DEMO] Fit quý', 'Tập không giới hạn trong 3 tháng.', 90, 999000, null, false],
    ['[DEMO] Annual unlimited', 'Một năm tập luyện chủ động.', 365, 2999000, null, false],
    ['[DEMO] PT Foundation', '12 buổi PT và quyền sử dụng toàn bộ khu tập.', 30, 1899000, 12, true],
    ['[DEMO] PT Transformation', '24 buổi PT, đánh giá hình thể và giáo án.', 90, 3999000, 24, true],
    ['[DEMO] Athlete performance', '36 buổi PT chuyên sâu theo mục tiêu thành tích.', 180, 6999000, 36, true],
    ['[DEMO] Couple training', 'Gói đôi cho hai thành viên cùng lịch.', 90, 2499000, 20, true]
  ].map(([name, description, durationDays, price, sessionLimit, includesPT]) => ({ name, description, durationDays, price, sessionLimit, includesPT, isActive: true })));
  const subscriptions = await Subscription.create(members.map((member, index) => { const pkg = packages[index % packages.length]; const pending = index % 10 === 0; const expired = index % 17 === 0; const startDate = expired ? isoDate(-420) : isoDate(-20); const endDate = new Date(startDate); endDate.setUTCDate(endDate.getUTCDate() + pkg.durationDays); return { member: member._id, package: pkg._id, startDate, endDate, status: expired ? 'expired' : pending ? 'pending' : 'active', paymentStatus: pending ? 'unpaid' : 'paid', paidAt: pending ? undefined : new Date(startDate.getTime() + 86400000), amount: pkg.price, includesPT: pkg.includesPT, sessionLimit: pkg.sessionLimit, reservedSessions: 0 }; }));
  const bookings = [];
  const eligibleSubscriptions = subscriptions.filter(subscription => subscription.status === 'active' && subscription.paymentStatus === 'paid' && subscription.includesPT);
  for (let index = 0; index < 180; index += 1) { const subscription = eligibleSubscriptions[index % eligibleSubscriptions.length]; const trainerIndex = index % trainerProfiles.length; const dayOffset = (index % 40) - 20 || 1; const date = isoDate(dayOffset); const hour = 8 + (Math.floor(index / 10) % 12); const startTime = `${String(hour).padStart(2, '0')}:00`; const endTime = `${String(hour + 1).padStart(2, '0')}:00`; const status = dayOffset < 0 ? (index % 9 === 0 ? 'no_show' : 'completed') : 'booked'; const duplicate = bookings.some(item => (String(item.trainer) === String(trainerProfiles[trainerIndex]._id) || String(item.member) === String(subscription.member)) && item.date.getTime() === date.getTime() && item.startTime === startTime); if (duplicate) continue; bookings.push({ member: subscription.member, trainer: trainerProfiles[trainerIndex]._id, subscription: subscription._id, date, startTime, endTime, status, quotaReserved: status !== 'cancelled', note: index % 4 === 0 ? 'Tập trung kỹ thuật và form.' : '' }); subscription.reservedSessions += 1; }
  const savedBookings = await Booking.create(bookings);
  await Promise.all(subscriptions.map(subscription => Subscription.updateOne({ _id: subscription._id }, { $set: { reservedSessions: subscription.reservedSessions } })));
  const plans = await WorkoutPlan.create(members.slice(0, 50).map((member, index) => ({ trainer: trainerProfiles[index % trainerProfiles.length]._id, member: member._id, title: ['Lean & strong', 'Mobility reset', 'Hypertrophy base', 'Conditioning 30'][index % 4], goal: ['Giảm mỡ bền vững', 'Tăng sức mạnh', 'Cải thiện kỹ thuật', 'Tăng sức bền'][index % 4], startDate: isoDate(-14), endDate: isoDate(45), items: [['Squat', 'Bench press', 'Row', 'Plank'][index % 4], ['Deadlift', 'Lat pulldown', 'Lunge', 'Stretch'][index % 4], ['Warm-up', 'Push-up', 'Pull-up', 'Cycling'][index % 4]].map((exerciseName, itemIndex) => ({ dayOfWeek: ['Mon', 'Wed', 'Fri'][itemIndex], exerciseName, sets: 3 + (itemIndex % 2), reps: itemIndex === 3 ? '45s' : '8-12', note: 'Giữ form ổn định, nghỉ 90 giây.' })) })));
  await ProgressLog.create(members.slice(0, 80).map((member, index) => ({ member: member._id, trainer: trainerProfiles[index % trainerProfiles.length]._id, date: isoDate(-(index % 45)), weight: 57 + (index % 18), bodyFat: 18 + (index % 9), height: 160 + (index % 25), attendedSessions: 3 + (index % 12), note: index % 2 ? 'Tiến bộ tốt ở sức bền.' : 'Cần ưu tiên giấc ngủ và phục hồi.' })));
  const completed = savedBookings.filter(booking => booking.status === 'completed');
  await Review.create(completed.slice(0, 45).map((booking, index) => ({ member: booking.member, trainer: booking.trainer, booking: booking._id, rating: 4 + (index % 2), comment: index % 2 ? 'HLV hướng dẫn rõ, buổi tập rất hiệu quả.' : 'Không khí tích cực và bài tập vừa sức.' })));
  const proofImages = ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80'];
  await WorkoutSubmission.create(plans.slice(0, 35).map((plan, index) => ({ plan: plan._id, member: plan.member, exerciseName: plan.items[0].exerciseName, completedOn: isoDate(-(index % 14)), proofUrl: proofImages[index % proofImages.length], note: 'Đã hoàn thành theo giáo án.', status: index % 3 ? 'submitted' : 'reviewed' })));
  console.log(JSON.stringify({ admin: admin.email, trainers: trainers.length, members: members.length, packages: packages.length, subscriptions: subscriptions.length, bookings: savedBookings.length, plans: plans.length, progressLogs: 80, reviews: Math.min(45, completed.length), password: PASSWORD }, null, 2));
}

seed().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => { await mongoose.disconnect(); });


