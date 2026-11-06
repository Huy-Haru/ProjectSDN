// Integration checks write only to a unique temporary database, never fitmanager.
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const mongoose = require('mongoose');
const createApp = require('../src/app');
const dbName = 'fitmanager_verification_' + crypto.randomBytes(8).toString('hex');
let server;

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/' + dbName, { serverSelectionTimeoutMS: 5000 });
  const { User, TrainerProfile, MembershipPackage, Subscription, Booking, Review } = require('../src/models');
  await Promise.all(Object.values(require('../src/models')).map(m => m.init()));
  const member = await User.create({ fullName: 'Verification Member', email: 'member@example.com', password: 'Example123', role: 'member' });
  const other = await User.create({ fullName: 'Other Member', email: 'other@example.com', password: 'Example123' });
  const trainerUser = await User.create({ fullName: 'Verification PT', email: 'trainer@example.com', password: 'Example123', role: 'trainer' });
  assert.equal(await member.comparePassword('Example123'), true);
  assert.notEqual(member.password, 'Example123');
  const trainer = await TrainerProfile.create({ user: trainerUser._id, pricePerSession: 100000 });
  const pkg = await MembershipPackage.create({ name: 'Verification', durationDays: 30, price: 100000 });
  const subscription = await Subscription.create({ member: member._id, package: pkg._id, startDate: '2026-10-01', endDate: '2026-11-01', status: 'active', paymentStatus: 'paid', paidAt: '2026-10-01', amount: 100000 });
  const base = { member: member._id, trainer: trainer._id, subscription: subscription._id, date: '2026-10-11', startTime: '09:00', endTime: '10:00' };
  const first = await Booking.create(base);
  await assert.rejects(Booking.create({ ...base, member: other._id }), e => e.code === 11000);
  const secondTrainerUser = await User.create({ fullName: 'Second PT', email: 'pt2@example.com', password: 'Example123', role: 'trainer' });
  const anotherTrainer = await TrainerProfile.create({ user: secondTrainerUser._id, pricePerSession: 100000 });
  await assert.rejects(Booking.create({ ...base, trainer: anotherTrainer._id }), e => e.code === 11000);
  first.status = 'cancelled'; await first.save();
  const second = await Booking.create({ ...base, status: 'completed' });
  const review = await Review.create({ member: member._id, trainer: trainer._id, booking: second._id, rating: 4 });
  assert.equal((await TrainerProfile.findById(trainer._id)).ratingAverage, 4);
  await assert.rejects(Review.create({ member: member._id, trainer: trainer._id, booking: second._id, rating: 5 }), e => e.code === 11000);
  review.rating = 5; await review.save();
  assert.equal((await TrainerProfile.findById(trainer._id)).ratingAverage, 5);
  await Review.findByIdAndUpdate(review._id, { rating: 3 }, { new: true, runValidators: true }).lean();
  assert.equal((await TrainerProfile.findById(trainer._id)).ratingAverage, 3);
  await Review.findByIdAndDelete(review._id);
  assert.equal((await TrainerProfile.findById(trainer._id)).ratingCount, 0);
  const a = await Subscription.findById(subscription._id), b = await Subscription.findById(subscription._id);
  a.amount = 200000; await a.save(); b.amount = 300000;
  await assert.rejects(b.save(), e => e.name === 'VersionError');
  server = createApp({ corsOrigin: 'http://localhost:3000' }).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const response = await fetch('http://127.0.0.1:' + server.address().port + '/api/health');
  assert.equal(response.status, 200);
  assert.equal((await response.json()).data.database, 'connected');
  console.log('PASS: real MongoDB indexes, cancellation/rebooking, password hashing, review aggregate, optimistic concurrency and health API.');
}
run().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => {
  if (server) await new Promise(resolve => server.close(resolve));
  if (mongoose.connection.readyState === 1 && mongoose.connection.name === dbName && /^fitmanager_verification_[a-f0-9]{16}$/.test(dbName)) await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});
