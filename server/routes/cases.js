const express = require('express');
const { db } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Public: list all cases
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM cases ORDER BY sort_order ASC').all();
  res.json({ code: 200, message: 'success', data: rows });
});

// Public: get single case
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM cases WHERE id = ?').get(req.params.id);
  if (!row) return res.json({ code: 404, message: '案例不存在', data: null });
  res.json({ code: 200, message: 'success', data: row });
});

// Admin: create case
router.post('/', authMiddleware, (req, res) => {
  const { title, description, tag, icon, image_url, sort_order } = req.body;
  if (!title) return res.json({ code: 400, message: '标题不能为空', data: null });
  const result = db.prepare(
    'INSERT INTO cases (title, description, tag, icon, image_url, sort_order) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(title, description || '', tag || '', icon || '', image_url || '', sort_order || 0);
  const row = db.prepare('SELECT * FROM cases WHERE id = ?').get(result.lastInsertRowid);
  res.json({ code: 200, message: 'success', data: row });
});

// Admin: update case
router.put('/:id', authMiddleware, (req, res) => {
  const { title, description, tag, icon, image_url, sort_order } = req.body;
  const existing = db.prepare('SELECT * FROM cases WHERE id = ?').get(req.params.id);
  if (!existing) return res.json({ code: 404, message: '案例不存在', data: null });
  db.prepare(
    'UPDATE cases SET title=?, description=?, tag=?, icon=?, image_url=?, sort_order=? WHERE id=?'
  ).run(
    title ?? existing.title,
    description ?? existing.description,
    tag ?? existing.tag,
    icon ?? existing.icon,
    image_url ?? existing.image_url,
    sort_order ?? existing.sort_order,
    req.params.id
  );
  const row = db.prepare('SELECT * FROM cases WHERE id = ?').get(req.params.id);
  res.json({ code: 200, message: 'success', data: row });
});

// Admin: delete case
router.delete('/:id', authMiddleware, (req, res) => {
  const existing = db.prepare('SELECT * FROM cases WHERE id = ?').get(req.params.id);
  if (!existing) return res.json({ code: 404, message: '案例不存在', data: null });
  db.prepare('DELETE FROM cases WHERE id = ?').run(req.params.id);
  res.json({ code: 200, message: 'success', data: null });
});

module.exports = router;
