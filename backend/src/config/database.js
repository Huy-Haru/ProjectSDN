const mongoose = require('mongoose');
mongoose.set('bufferCommands', false);
async function connectDB(uri) {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000, maxPoolSize: 10, minPoolSize: 0, autoIndex: process.env.NODE_ENV !== 'production' });
  require('../models');
}
async function disconnectDB() { await mongoose.disconnect(); }
module.exports = { connectDB, disconnectDB };
