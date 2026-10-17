const dotenv = require('dotenv');

// Đọc file .env
dotenv.config();

const { PORT, MONGODB_URI, NODE_ENV, CORS_ORIGIN, JWT_SECRET, JWT_EXPIRES_IN } = process.env;

// Báo lỗi nếu thiếu MONGODB_URI
if (!MONGODB_URI) {
  console.error('Lỗi: Thiếu MONGODB_URI trong file .env');
  process.exit(1);
}

if (!JWT_SECRET) {
  console.error('Lỗi: Thiếu JWT_SECRET trong file .env');
  process.exit(1);
}

module.exports = {
  PORT: PORT || 5000,
  MONGODB_URI,
  NODE_ENV: NODE_ENV || 'development',
  CORS_ORIGIN: CORS_ORIGIN || '*',
  JWT_SECRET,
  JWT_EXPIRES_IN: JWT_EXPIRES_IN || '7d'
};
