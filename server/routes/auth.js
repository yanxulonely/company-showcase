const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { db } = require('../db');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.json({ code: 400, message: '用户名和密码不能为空', data: null });
  }
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) {
    return res.json({ code: 401, message: '用户名或密码错误', data: null });
  }
  if (!bcrypt.compareSync(password, user.password)) {
    return res.json({ code: 401, message: '用户名或密码错误', data: null });
  }
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ code: 200, message: 'success', data: { token, username: user.username } });
});

router.get('/profile', authMiddleware, (req, res) => {
  res.json({ code: 200, message: 'success', data: { username: req.user.username } });
});

module.exports = router;
