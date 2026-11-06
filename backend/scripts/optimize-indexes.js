// Add declared indexes; replace only the verified legacy booking index.
// Never syncIndexes(): unrelated existing indexes must remain intact.
const mongoose = require('mongoose');
const { loadEnvironment, readEnvironment } = require('../src/config/environment');

async function run() {
  loadEnvironment();
  const env = readEnvironment();
  await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 5000, autoIndex: false });
  const models = require('../src/models');
  const collection = models.Booking.collection;
  const exists = await mongoose.connection.db.listCollections({ name: collection.name }).hasNext();
  if (exists) {
    const unnormalized = await collection.countDocuments({ $expr: { $ne: ['$date', { $dateTrunc: { date: '$date', unit: 'day', timezone: 'UTC' } }] } });
    if (unnormalized) throw new Error('Booking dates need an explicit data migration before index changes. No indexes were changed.');
  }
  // Creating new unique indexes fails before any old constraint is dropped if data conflicts.
  for (const model of Object.values(models)) await model.createIndexes();
  const indexes = await collection.indexes();
  const legacy = indexes.find(i => i.name === 'trainer_1_date_1_startTime_1');
  if (legacy) {
    if (!legacy.unique || legacy.partialFilterExpression || JSON.stringify(legacy.key) !== JSON.stringify({ trainer: 1, date: 1, startTime: 1 })) {
      throw new Error('Legacy index differs from expected specification; preserved for manual review.');
    }
    await collection.dropIndex(legacy.name);
    console.log('Replaced verified legacy booking index with trainer/member held-slot indexes.');
  }
  for (const model of Object.values(models)) {
    console.log(JSON.stringify({ collection: model.collection.name, indexes: (await model.collection.indexes()).map(i => i.name) }));
  }
}
run().catch(error => { console.error('Index migration failed:', error.message); process.exitCode = 1; }).finally(() => mongoose.disconnect());
