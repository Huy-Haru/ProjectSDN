const User = require('../models/User');
const { ROLES } = require('../constants/roles');
const { signToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/response');

/**
 * Format dữ liệu user trả về client (không lộ password, __v)
 */
function formatUser(user) {
  return {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone || null,
    gender: user.gender || null,
    dateOfBirth: user.dateOfBirth || null,
    avatar: user.avatar || null,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

/**
 * POST /api/auth/register
 * Đăng ký tài khoản member mới (public chỉ tạo được member)
 */
async function register(req, res) {
  const { fullName, email, password, phone, gender, dateOfBirth } = req.body;

  if (!fullName || !email || !password) {
    throw new AppError('Họ tên, email và mật khẩu là bắt buộc.', 400);
  }

  if (password.length < 6) {
    throw new AppError('Mật khẩu phải có ít nhất 6 ký tự.', 400);
  }

  // Kiểm tra email đã tồn tại
  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    throw new AppError('Email đã được sử dụng. Vui lòng dùng email khác.', 409);
  }

  // Chỉ tạo member - không cho tự set role
  const user = await User.create({
    fullName: fullName.trim(),
    email: email.toLowerCase().trim(),
    password,
    phone: phone?.trim(),
    gender,
    dateOfBirth,
    role: ROLES.MEMBER // Public luôn tạo member
  });

  const token = signToken({ id: user._id, role: user.role });

  return sendSuccess(res, { token, user: formatUser(user) }, 'Đăng ký thành công!', 201);
}

/**
 * POST /api/auth/login
 * Đăng nhập bằng email + password
 */
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email và mật khẩu là bắt buộc.', 400);
  }

  // Lấy user kèm password (select: false trong schema)
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
  if (!user) {
    throw new AppError('Email hoặc mật khẩu không đúng.', 401);
  }

  // Kiểm tra tài khoản bị khóa trước khi check password
  if (!user.isActive) {
    throw new AppError('Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.', 403);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Email hoặc mật khẩu không đúng.', 401);
  }

  const token = signToken({ id: user._id, role: user.role });

  return sendSuccess(res, { token, user: formatUser(user) }, 'Đăng nhập thành công!');
}

/**
 * POST /api/auth/logout
 * Đăng xuất - client xóa token; server trả xác nhận
 */
async function logout(req, res) {
  // JWT là stateless, logout = client xóa token
  // Trong tương lai có thể dùng token blacklist nếu cần
  return sendSuccess(res, {}, 'Đăng xuất thành công!');
}

/**
 * GET /api/auth/me
 * Lấy thông tin user đang đăng nhập (yêu cầu authenticate)
 */
async function me(req, res) {
  // req.user đã được gắn bởi middleware authenticate
  return sendSuccess(res, { user: formatUser(req.user) });
}

module.exports = { register, login, logout, me };
