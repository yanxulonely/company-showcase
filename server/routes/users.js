const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../db');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/users - 获取用户列表（支持 role 筛选）
router.get('/', authMiddleware, requireRole('admin'), (req, res) => {
  const { role } = req.query;
  let sql = 'SELECT id, username, role, display_name, phone, is_active, created_at FROM users';
  const params = [];
  if (role) {
    sql += ' WHERE role = ?';
    params.push(role);
  }
  sql += ' ORDER BY created_at DESC';
  const users = db.prepare(sql).all(...params);
  res.json({ code: 200, message: 'success', data: users });
});

// POST /api/users - 创建用户
router.post('/', authMiddleware, requireRole('admin'), (req, res) => {
  const { username, password, role, display_name, phone } = req.body;
  if (!username || !password) {
    return res.json({ code: 400, message: '用户名和密码不能为空', data: null });
  }
  const exists = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (exists) {
    return res.json({ code: 400, message: '用户名已存在', data: null });
  }
  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare(
    'INSERT INTO users (username, password, role, display_name, phone) VALUES (?, ?, ?, ?, ?)'
  ).run(username, hash, role || 'user', display_name || '', phone || '');
  const user = db.prepare('SELECT id, username, role, display_name, phone, is_active, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
  res.json({ code: 200, message: 'success', data: user });
});

// PUT /api/users/:id - 更新用户
router.put('/:id', authMiddleware, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  const { role, display_name, phone, username } = req.body;
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
  if (!user) {
    return res.json({ code: 404, message: '用户不存在', data: null });
  }
  // Check username uniqueness if changing
  if (username) {
    const dup = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(username, id);
    if (dup) {
      return res.json({ code: 400, message: '用户名已存在', data: null });
    }
  }
  db.prepare(
    'UPDATE users SET role = ?, display_name = ?, phone = ?, username = ? WHERE id = ?'
  ).run(role || 'user', display_name || '', phone || '', username || '', id);
  const updated = db.prepare('SELECT id, username, role, display_name, phone, is_active, created_at FROM users WHERE id = ?').get(id);
  res.json({ code: 200, message: 'success', data: updated });
});

// DELETE /api/users/:id - 删除用户
router.delete('/:id', authMiddleware, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  const user = db.prepare('SELECT id, username FROM users WHERE id = ?').get(id);
  if (!user) {
    return res.json({ code: 404, message: '用户不存在', data: null });
  }
  if (user.username === 'admin') {
    return res.json({ code: 400, message: '不能删除管理员账号', data: null });
  }
  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  res.json({ code: 200, message: 'success', data: null });
});

// PUT /api/users/:id/toggle - 启用/禁用用户
router.put('/:id/toggle', authMiddleware, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  const user = db.prepare('SELECT id, username, is_active FROM users WHERE id = ?').get(id);
  if (!user) {
    return res.json({ code: 404, message: '用户不存在', data: null });
  }
  if (user.username === 'admin') {
    return res.json({ code: 400, message: '不能禁用管理员账号', data: null });
  }
  const newActive = user.is_active ? 0 : 1;
  db.prepare('UPDATE users SET is_active = ? WHERE id = ?').run(newActive, id);
  const updated = db.prepare('SELECT id, username, role, display_name, phone, is_active, created_at FROM users WHERE id = ?').get(id);
  res.json({ code: 200, message: 'success', data: updated });
});

// PUT /api/users/:id/reset-password - 重置密码
router.put('/:id/reset-password', authMiddleware, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  if (!password) {
    return res.json({ code: 400, message: '密码不能为空', data: null });
  }
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
  if (!user) {
    return res.json({ code: 404, message: '用户不存在', data: null });
  }
  const hash = bcrypt.hashSync(password, 10);
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hash, id);
  res.json({ code: 200, message: 'success', data: null });
});

module.exports = router;
