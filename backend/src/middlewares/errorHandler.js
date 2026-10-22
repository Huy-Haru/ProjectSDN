const AppError = require('../utils/AppError');

function notFound(req, res, next) {
  next(new AppError('Route not found', 404));
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  let statusCode = 500;
  let message = 'Internal server error';

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = Object.entries(error.errors).map(([path, item]) => path === 'password' ? 'Mật khẩu phải có ít nhất 8 ký tự và tối đa 72 byte' : item.message).join('; ');
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Dữ liệu hoặc ID không hợp lệ';
  } else if (error.code === 11000) {
    statusCode = 409;
    message = 'Dữ liệu đã tồn tại hoặc lịch bị trùng';
  } else if (error.name === 'VersionError') {
    statusCode = 409;
    message = 'Dữ liệu vừa thay đổi. Vui lòng tải lại và thử lại.';
  } else if (error.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Invalid JSON body';
  } else if (error.type === 'entity.too.large') {
    statusCode = 413;
    message = 'Request body is too large';
  } else {
    console.error('Unhandled request error:', error.name);
  }

  return res.status(statusCode).json({ success: false, message });
}

module.exports = { notFound, errorHandler };
