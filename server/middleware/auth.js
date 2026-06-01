const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'company-showcase-secret-key';

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ code: 401, message: '未登录', data: null });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ code: 401, message: '登录已过期', data: null });
  }
}

module.exports = { authMiddleware, JWT_SECRET };
