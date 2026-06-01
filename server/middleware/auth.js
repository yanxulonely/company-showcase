const jwt = require('jsonwebtoken');
const { db } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'company-showcase-secret-key';

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ code: 401, message: '未登录', data: null });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Attach full user info from DB
    const user = db.prepare('SELECT id, username, role, display_name, phone, is_active FROM users WHERE id = ?').get(decoded.id);
    if (!user) {
      return res.status(401).json({ code: 401, message: '用户不存在', data: null });
    }
    if (!user.is_active) {
      return res.status(403).json({ code: 403, message: '账号已被禁用', data: null });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ code: 401, message: '登录已过期', data: null });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ code: 401, message: '未登录', data: null });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ code: 403, message: '权限不足', data: null });
    }
    next();
  };
}

module.exports = { authMiddleware, requireRole, JWT_SECRET };
