const AppError = require('./AppError');
module.exports = function pagination(query) {
  for (const key of ['page', 'limit']) {
    if (query[key] !== undefined && typeof query[key] !== 'string') throw new AppError('Phân trang không hợp lệ.', 400);
  }
  const page = query.page === undefined ? 1 : Number(query.page);
  const limit = query.limit === undefined ? 10 : Number(query.limit);
  const skip = (page - 1) * limit;
  if (!Number.isSafeInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100 || !Number.isSafeInteger(skip))
    throw new AppError('Phân trang không hợp lệ.', 400);
  return { page, limit, skip };
};
