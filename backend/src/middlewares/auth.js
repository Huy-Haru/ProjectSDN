const { verifyToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Middleware: xác thực JWT, gắn req.user
 * Chặn tài khoản đã khóa (isActive=false) và phiên hết hạn
 */
const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.', 401);
  }

  const token = authHeader.split(' ')[1];
  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 401);
    }
    throw new AppError('Token không hợp lệ. Vui lòng đăng nhập lại.', 401);
  }

  // Kiểm tra user còn tồn tại và chưa bị khóa
  const user = await User.findById(decoded.id).select('+isActive');
  if (!user) {
    throw new AppError('Tài khoản không tồn tại.', 401);
  }
  if (!user.isActive) {
    throw new AppError('Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.', 403);
  }

  req.user = user;
  next();
});

/**
 * Middleware: kiểm tra phân quyền theo role
 * @param {...string} roles - Danh sách role được phép
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('Bạn không có quyền thực hiện thao tác này.', 403));
    }
    next();
  };
};

module.exports = { authenticate, authorize };
