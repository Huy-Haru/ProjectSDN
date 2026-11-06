const jwt = require('jsonwebtoken');
function secret() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must contain at least 32 characters.');
  return process.env.JWT_SECRET;
}
function signToken(payload) { return jwt.sign(payload, secret(), { expiresIn: process.env.JWT_EXPIRES_IN || '7d', algorithm: 'HS256' }); }
function verifyToken(token) { return jwt.verify(token, secret(), { algorithms: ['HS256'] }); }
module.exports = { signToken, verifyToken };
