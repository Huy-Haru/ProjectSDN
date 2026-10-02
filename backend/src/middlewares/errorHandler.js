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
