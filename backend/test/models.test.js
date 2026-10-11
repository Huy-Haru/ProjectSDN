const { test } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { User, Subscription, MembershipPackage, Booking, WorkoutPlan, Review } = require('../src/models');
const id = () => new mongoose.Types.ObjectId();

test('shared User profile supports member, PT (trainer), and admin only', async () => {
  for (const role of ['member', 'trainer', 'admin']) {
    await new User({ fullName: 'Test User', email: `${role}@example.com`, password: 'Example123', role }).validate();
  }
  await assert.rejects(new User({ fullName: 'Test', email: 'bad-email', password: 'Example123' }).validate());
  await assert.rejects(new User({ fullName: 'Test', email: 'test@example.com', password: 'short' }).validate());
  await assert.rejects(new User({ fullName: 'Test', email: 'test@example.com', password: 'Example123', role: 'PT' }).validate());
  assert.equal(new User({ password: 'private' }).toJSON().password, undefined);
});

test('subscription requires paidAt, valid range and uses start date/payment in validity', async () => {
  const doc = new Subscription({ member: id(), package: id(), startDate: new Date('2026-10-01'), endDate: new Date('2026-11-01'), amount: 100000, status: 'active', paymentStatus: 'paid' });
  await assert.rejects(doc.validate(), /paidAt/);
  doc.paidAt = new Date('2026-10-01');
  await doc.validate();
  assert.equal(doc.isValid(new Date('2026-10-11')), true);
  assert.equal(doc.isValid(new Date('2026-09-30')), false);
  assert.equal(doc.isValid(new Date('2026-11-02')), false);
  doc.paymentStatus = 'unpaid';
  assert.equal(doc.isValid(new Date('2026-10-11')), false);
  doc.endDate = doc.startDate;
  await assert.rejects(doc.validate(), /Ngày kết thúc/);
});

test('booking validates clock times/order and normalizes calendar date', async () => {
  const base = { member: id(), trainer: id(), subscription: id(), date: '2026-10-11T12:34:00Z', startTime: '09:00', endTime: '10:00' };
  const doc = new Booking(base);
  await doc.validate();
  assert.equal(doc.date.toISOString(), '2026-10-11T00:00:00.000Z');
  for (const times of [{ startTime: '24:00' }, { endTime: '08:00' }, { startTime: '9:00' }]) {
    await assert.rejects(new Booking({ ...base, ...times }).validate());
  }
});

test('integer business values reject fractional durations, VND, sets, and ratings', async () => {
  await assert.rejects(new MembershipPackage({ name: 'Test', durationDays: 1.5, price: 100 }).validate());
  await assert.rejects(new MembershipPackage({ name: 'Test', durationDays: 30, price: 1.5 }).validate());
  await new MembershipPackage({ name: 'Unlimited', durationDays: 30, price: 0, sessionLimit: null }).validate();
  await assert.rejects(new Review({ member: id(), trainer: id(), booking: id(), rating: 3.5 }).validate());
  await assert.rejects(new WorkoutPlan({ trainer: id(), member: id(), title: 'Test', startDate: '2026-10-01', endDate: '2026-11-01', items: [{ exerciseName: 'Squat', sets: 0, reps: '10' }] }).validate());
});
