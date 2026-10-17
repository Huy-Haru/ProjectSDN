const jwt = require('jsonwebtoken');
const env = require('../config/environment');

/**
 * Tạo JWT token cho user
 * @param {Object} payload - { id, role }
 */
function signToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

/**
 * Xác thực JWT token
 * @param {string} token
 * @returns {Object} decoded payload
 */
function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}

module.exports = { signToken, verifyToken };
