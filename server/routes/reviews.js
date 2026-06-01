const express = require('express');
const { db } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM reviews ORDER BY sort_order ASC').all();
  res.json({ code: 200, message: 'success', data: rows });
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM reviews WHERE id = ?').get(req.params.id);
  if (!row) return res.json({ code: 404, message: '评价不存在', data: null });
  res.json({ code: 200, message: 'success', data: row });
});

router.post('/', authMiddleware, (req, res) => {
  const { name, company, content, rating, avatar_bg, sort_order } = req.body;
  if (!name) return res.json({ code: 400, message: '姓名不能为空', data: null });
  const result = db.prepare(
    'INSERT INTO reviews (name, company, content, rating, avatar_bg, sort_order) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(name, company || '', content || '', rating || 5, avatar_bg || 1, sort_order || 0);
  const row = db.prepare('SELECT * FROM reviews WHERE id = ?').get(result.lastInsertRowid);
  res.json({ code: 200, message: 'success', data: row });
});

router.put('/:id', authMiddleware, (req, res) => {
  const { name, company, content, rating, avatar_bg, sort_order } = req.body;
  const existing = db.prepare('SELECT * FROM reviews WHERE id = ?').get(req.params.id);
  if (!existing) return res.json({ code: 404, message: '评价不存在', data: null });
  db.prepare(
    'UPDATE reviews SET name=?, company=?, content=?, rating=?, avatar_bg=?, sort_order=? WHERE id=?'
  ).run(
    name ?? existing.name,
    company ?? existing.company,
    content ?? existing.content,
    rating ?? existing.rating,
    avatar_bg ?? existing.avatar_bg,
    sort_order ?? existing.sort_order,
    req.params.id
  );
  const row = db.prepare('SELECT * FROM reviews WHERE id = ?').get(req.params.id);
  res.json({ code: 200, message: 'success', data: row });
});

router.delete('/:id', authMiddleware, (req, res) => {
  const existing = db.prepare('SELECT * FROM reviews WHERE id = ?').get(req.params.id);
  if (!existing) return res.json({ code: 404, message: '评价不存在', data: null });
  db.prepare('DELETE FROM reviews WHERE id = ?').run(req.params.id);
  res.json({ code: 200, message: 'success', data: null });
});

module.exports = router;
