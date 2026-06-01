const express = require('express');
const { db } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM standards ORDER BY sort_order ASC').all();
  const data = rows.map(r => ({ ...r, items: JSON.parse(r.items || '[]') }));
  res.json({ code: 200, message: 'success', data });
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM standards WHERE id = ?').get(req.params.id);
  if (!row) return res.json({ code: 404, message: '标准不存在', data: null });
  row.items = JSON.parse(row.items || '[]');
  res.json({ code: 200, message: 'success', data: row });
});

router.post('/', authMiddleware, (req, res) => {
  const { title, type, items, sort_order } = req.body;
  if (!title) return res.json({ code: 400, message: '标题不能为空', data: null });
  const result = db.prepare(
    'INSERT INTO standards (title, type, items, sort_order) VALUES (?, ?, ?, ?)'
  ).run(title, type || 'execution', JSON.stringify(items || []), sort_order || 0);
  const row = db.prepare('SELECT * FROM standards WHERE id = ?').get(result.lastInsertRowid);
  row.items = JSON.parse(row.items || '[]');
  res.json({ code: 200, message: 'success', data: row });
});

router.put('/:id', authMiddleware, (req, res) => {
  const { title, type, items, sort_order } = req.body;
  const existing = db.prepare('SELECT * FROM standards WHERE id = ?').get(req.params.id);
  if (!existing) return res.json({ code: 404, message: '标准不存在', data: null });
  db.prepare(
    'UPDATE standards SET title=?, type=?, items=?, sort_order=? WHERE id=?'
  ).run(
    title ?? existing.title,
    type ?? existing.type,
    items ? JSON.stringify(items) : existing.items,
    sort_order ?? existing.sort_order,
    req.params.id
  );
  const row = db.prepare('SELECT * FROM standards WHERE id = ?').get(req.params.id);
  row.items = JSON.parse(row.items || '[]');
  res.json({ code: 200, message: 'success', data: row });
});

router.delete('/:id', authMiddleware, (req, res) => {
  const existing = db.prepare('SELECT * FROM standards WHERE id = ?').get(req.params.id);
  if (!existing) return res.json({ code: 404, message: '标准不存在', data: null });
  db.prepare('DELETE FROM standards WHERE id = ?').run(req.params.id);
  res.json({ code: 200, message: 'success', data: null });
});

module.exports = router;
