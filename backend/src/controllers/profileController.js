const User = require('../models/User');
const TrainerProfile = require('../models/TrainerProfile');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/response');
const { ROLES } = require('../constants/roles');

/** Whitelist trường user có thể tự cập nhật (không cho đổi role/isActive) */
const USER_WHITELIST = ['fullName', 'phone', 'gender', 'dateOfBirth', 'avatar'];

/** Whitelist trường TrainerProfile PT có thể tự cập nhật (không cho đổi rating) */
const TRAINER_PROFILE_WHITELIST = ['specialties', 'experienceYears', 'bio', 'certificates', 'pricePerSession'];

/**
 * GET /api/profile/me
 * Trả về profile của user đang đăng nhập (kèm TrainerProfile nếu là trainer)
 */
async function getMyProfile(req, res) {
  const user = req.user;
  const result = {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone || null,
    gender: user.gender || null,
    dateOfBirth: user.dateOfBirth || null,
    avatar: user.avatar || null,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt
  };

  // Nếu là trainer → lấy kèm TrainerProfile
  if (user.role === ROLES.TRAINER) {
    const profile = await TrainerProfile.findOne({ user: user._id });
    result.trainerProfile = profile || null;
  }

  return sendSuccess(res, result);
}

/**
 * PATCH /api/profile/me
 * Cập nhật thông tin cá nhân — chỉ trường whitelist, không tự đổi role/isActive/rating
 */
async function updateMyProfile(req, res) {
  const user = req.user;

  // Lọc chỉ các trường cho phép
  const updateData = {};
  USER_WHITELIST.forEach(field => {
    if (req.body[field] !== undefined) updateData[field] = req.body[field];
  });

  if (Object.keys(updateData).length === 0) {
    throw new AppError('Không có trường hợp lệ để cập nhật.', 400);
  }

  const updated = await User.findByIdAndUpdate(
    user._id,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  const result = {
    _id: updated._id,
    fullName: updated.fullName,
    email: updated.email,
    phone: updated.phone || null,
    gender: updated.gender || null,
    dateOfBirth: updated.dateOfBirth || null,
    avatar: updated.avatar || null,
    role: updated.role,
    isActive: updated.isActive,
    updatedAt: updated.updatedAt
  };

  return sendSuccess(res, result, 'Cập nhật hồ sơ thành công!');
}

/**
 * PATCH /api/profile/trainer
 * Trainer tự cập nhật TrainerProfile (chuyên môn, bio, giá, v.v.)
 * Không cho tự đổi ratingAverage / ratingCount / isActive
 */
async function updateTrainerProfile(req, res) {
  const user = req.user;

  if (user.role !== ROLES.TRAINER) {
    throw new AppError('Chỉ huấn luyện viên mới có thể cập nhật hồ sơ PT.', 403);
  }

  // Lọc chỉ trường whitelist trainer
  const profileData = {};
  TRAINER_PROFILE_WHITELIST.forEach(field => {
    if (req.body[field] !== undefined) profileData[field] = req.body[field];
  });

  if (Object.keys(profileData).length === 0) {
    throw new AppError('Không có trường hợp lệ để cập nhật.', 400);
  }

  const profile = await TrainerProfile.findOneAndUpdate(
    { user: user._id },
    { $set: profileData },
    { new: true, runValidators: true, upsert: false }
  );

  if (!profile) {
    throw new AppError('Hồ sơ huấn luyện viên không tồn tại. Liên hệ Admin để tạo.', 404);
  }

  return sendSuccess(res, profile, 'Cập nhật hồ sơ huấn luyện viên thành công!');
}

/**
 * POST /api/profile/change-password
 * Đổi mật khẩu — luồng riêng, yêu cầu mật khẩu cũ
 */
async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError('Mật khẩu hiện tại và mật khẩu mới là bắt buộc.', 400);
  }

  if (newPassword.length < 6) {
    throw new AppError('Mật khẩu mới phải có ít nhất 6 ký tự.', 400);
  }

  // Lấy lại user kèm password (select: false)
  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    throw new AppError('Mật khẩu hiện tại không đúng.', 400);
  }

  user.password = newPassword;
  await user.save(); // pre-save hook sẽ hash lại

  return sendSuccess(res, {}, 'Đổi mật khẩu thành công!');
}

module.exports = { getMyProfile, updateMyProfile, updateTrainerProfile, changePassword };
