const mongoose = require('mongoose');

async function connectDB(uri) {
  try {
    // Lắng nghe sự kiện
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected!');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Lỗi kết nối MongoDB:', error);
    process.exit(1);
  }
}

async function disconnectDB() {
  await mongoose.disconnect();
}

module.exports = { connectDB, disconnectDB };
