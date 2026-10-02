// Express 4 needs rejected promises forwarded to its error middleware.
module.exports = (handler) => (req, res, next) => {
  Promise.resolve().then(() => handler(req, res, next)).catch(next);
};
