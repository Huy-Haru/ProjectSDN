const mongoose = require('mongoose');
const AppError = require('../utils/AppError');

async function getHealth() {
  if (mongoose.connection.readyState !== 1) {
    throw new AppError('MongoDB is unavailable', 503);
  }

  try {
    await mongoose.connection.db.admin().ping({ maxTimeMS: 2000 });
  } catch {
    throw new AppError('MongoDB is unavailable', 503);
  }

  return { status: 'ok', database: 'connected' };
}

module.exports = { getHealth };
