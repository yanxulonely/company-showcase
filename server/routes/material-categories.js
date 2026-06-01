const express = require('express');
const { db } = require('../db');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/material-categories - 获取分类列表
router.get('/', authMiddleware, requireRole('admin'), (req, res) => {
  const categories = db.prepare('SELECT * FROM material_categories ORDER BY sort_order ASC, id ASC').all();
  res.json({ code: 200, message: 'success', data: categories });
});

// GET /api/material-categories/list - 前台获取分类列表
router.get('/list', (req, res) => {
  const categories = db.prepare('SELECT * FROM material_categories ORDER BY sort_order ASC, id ASC').all();
  res.json({ code: 200, message: 'success', data: categories });
});

// POST /api/material-categories - 创建分类
router.post('/', authMiddleware, requireRole('admin'), (req, res) => {
  const { name, sort_order } = req.body;
  if (!name) {
    return res.json({ code: 400, message: '分类名称不能为空', data: null });
  }
  const result = db.prepare(
    'INSERT INTO material_categories (name, sort_order) VALUES (?, ?)'
  ).run(name, sort_order || 0);
  const category = db.prepare('SELECT * FROM material_categories WHERE id = ?').get(result.lastInsertRowid);
  res.json({ code: 200, message: 'success', data: category });
});

// PUT /api/material-categories/:id - 更新分类
router.put('/:id', authMiddleware, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  const { name, sort_order } = req.body;
  const category = db.prepare('SELECT id FROM material_categories WHERE id = ?').get(id);
  if (!category) {
    return res.json({ code: 404, message: '分类不存在', data: null });
  }
  db.prepare(
    'UPDATE material_categories SET name = ?, sort_order = ? WHERE id = ?'
  ).run(name || '', sort_order || 0, id);
  const updated = db.prepare('SELECT * FROM material_categories WHERE id = ?').get(id);
  res.json({ code: 200, message: 'success', data: updated });
});

// DELETE /api/material-categories/:id - 删除分类
router.delete('/:id', authMiddleware, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  const category = db.prepare('SELECT id FROM material_categories WHERE id = ?').get(id);
  if (!category) {
    return res.json({ code: 404, message: '分类不存在', data: null });
  }
  // Check if any materials use this category
  const count = db.prepare('SELECT COUNT(*) as count FROM materials WHERE category_id = ?').get(id).count;
  if (count > 0) {
    return res.json({ code: 400, message: '该分类下有资料，不能删除', data: null });
  }
  db.prepare('DELETE FROM material_categories WHERE id = ?').run(id);
  res.json({ code: 200, message: 'success', data: null });
});

module.exports = router;
