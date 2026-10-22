const mongoose = require('mongoose');
const { loadEnvironment, readEnvironment } = require('../src/config/environment');
const { Subscription, Booking } = require('../src/models');

// Run with all API/other database writers stopped. Default mode only reports differences.
async function reconcile({ apply = false, writersStopped = false } = {}) {
  if (apply && !writersStopped) throw new Error('Stop all writers, then explicitly pass --writers-stopped.');
  const differences = [];
  for await (const sub of Subscription.find({}).select('reservedSessions').lean().cursor()) {
    const expected = await Booking.countDocuments({ subscription: sub._id, quotaReserved: true, status: { $ne: 'cancelled' } });
    const actual = sub.reservedSessions || 0;
    if (actual !== expected) {
      differences.push({ subscription: String(sub._id), actual, expected });
      if (apply) await Subscription.updateOne({ _id: sub._id }, { $set: { reservedSessions: expected } });
    }
  }
  return differences;
}
async function main() {
  const apply = process.argv.includes('--apply');
  const writersStopped = process.argv.includes('--writers-stopped');
  if (apply && !writersStopped) throw new Error('Apply requires --writers-stopped after stopping all API/database writers.');
  loadEnvironment();
  await mongoose.connect(readEnvironment().mongoUri, { autoIndex: false, serverSelectionTimeoutMS: 5000 });
  console.log(JSON.stringify({ mode: apply ? 'apply' : 'report', differences: await reconcile({ apply, writersStopped }) }, null, 2));
}
if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => mongoose.disconnect());
module.exports = { reconcile };
