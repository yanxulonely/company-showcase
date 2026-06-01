const express = require('express');
const { db } = require('../db');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/banners/active - 获取启用的轮播图（前台）
router.get('/active', (req, res) => {
  const banners = db.prepare('SELECT * FROM banners WHERE is_active = 1 ORDER BY sort_order ASC, id ASC').all();
  res.json({ code: 200, message: 'success', data: banners });
});

// GET /api/banners - 获取轮播图列表（管理员）
router.get('/', authMiddleware, requireRole('admin'), (req, res) => {
  const banners = db.prepare('SELECT * FROM banners ORDER BY sort_order ASC, id ASC').all();
  res.json({ code: 200, message: 'success', data: banners });
});

// POST /api/banners - 创建轮播图
router.post('/', authMiddleware, requireRole('admin'), (req, res) => {
  const { title, subtitle, image_url, sort_order } = req.body;
  const result = db.prepare(
    'INSERT INTO banners (title, subtitle, image_url, sort_order) VALUES (?, ?, ?, ?)'
  ).run(title || '', subtitle || '', image_url || '', sort_order || 0);
  const banner = db.prepare('SELECT * FROM banners WHERE id = ?').get(result.lastInsertRowid);
  res.json({ code: 200, message: 'success', data: banner });
});

// PUT /api/banners/:id - 更新轮播图
router.put('/:id', authMiddleware, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  const { title, subtitle, image_url, sort_order, is_active } = req.body;
  const banner = db.prepare('SELECT id FROM banners WHERE id = ?').get(id);
  if (!banner) {
    return res.json({ code: 404, message: '轮播图不存在', data: null });
  }
  db.prepare(
    'UPDATE banners SET title = ?, subtitle = ?, image_url = ?, sort_order = ?, is_active = ? WHERE id = ?'
  ).run(title || '', subtitle || '', image_url || '', sort_order || 0, is_active !== undefined ? is_active : 1, id);
  const updated = db.prepare('SELECT * FROM banners WHERE id = ?').get(id);
  res.json({ code: 200, message: 'success', data: updated });
});

// DELETE /api/banners/:id - 删除轮播图
router.delete('/:id', authMiddleware, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  const banner = db.prepare('SELECT id FROM banners WHERE id = ?').get(id);
  if (!banner) {
    return res.json({ code: 404, message: '轮播图不存在', data: null });
  }
  db.prepare('DELETE FROM banners WHERE id = ?').run(id);
  res.json({ code: 200, message: 'success', data: null });
});

// PUT /api/banners/:id/toggle - 启用/禁用
router.put('/:id/toggle', authMiddleware, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  const banner = db.prepare('SELECT id, is_active FROM banners WHERE id = ?').get(id);
  if (!banner) {
    return res.json({ code: 404, message: '轮播图不存在', data: null });
  }
  const newActive = banner.is_active ? 0 : 1;
  db.prepare('UPDATE banners SET is_active = ? WHERE id = ?').run(newActive, id);
  const updated = db.prepare('SELECT * FROM banners WHERE id = ?').get(id);
  res.json({ code: 200, message: 'success', data: updated });
});

module.exports = router;
