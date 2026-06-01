const express = require('express');
const { db } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM capabilities ORDER BY sort_order ASC').all();
  res.json({ code: 200, message: 'success', data: rows });
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM capabilities WHERE id = ?').get(req.params.id);
  if (!row) return res.json({ code: 404, message: '能力不存在', data: null });
  res.json({ code: 200, message: 'success', data: row });
});

router.post('/', authMiddleware, (req, res) => {
  const { title, description, icon, sort_order } = req.body;
  if (!title) return res.json({ code: 400, message: '标题不能为空', data: null });
  const result = db.prepare(
    'INSERT INTO capabilities (title, description, icon, sort_order) VALUES (?, ?, ?, ?)'
  ).run(title, description || '', icon || '', sort_order || 0);
  const row = db.prepare('SELECT * FROM capabilities WHERE id = ?').get(result.lastInsertRowid);
  res.json({ code: 200, message: 'success', data: row });
});

router.put('/:id', authMiddleware, (req, res) => {
  const { title, description, icon, sort_order } = req.body;
  const existing = db.prepare('SELECT * FROM capabilities WHERE id = ?').get(req.params.id);
  if (!existing) return res.json({ code: 404, message: '能力不存在', data: null });
  db.prepare(
    'UPDATE capabilities SET title=?, description=?, icon=?, sort_order=? WHERE id=?'
  ).run(
    title ?? existing.title,
    description ?? existing.description,
    icon ?? existing.icon,
    sort_order ?? existing.sort_order,
    req.params.id
  );
  const row = db.prepare('SELECT * FROM capabilities WHERE id = ?').get(req.params.id);
  res.json({ code: 200, message: 'success', data: row });
});

router.delete('/:id', authMiddleware, (req, res) => {
  const existing = db.prepare('SELECT * FROM capabilities WHERE id = ?').get(req.params.id);
  if (!existing) return res.json({ code: 404, message: '能力不存在', data: null });
  db.prepare('DELETE FROM capabilities WHERE id = ?').run(req.params.id);
  res.json({ code: 200, message: 'success', data: null });
});

module.exports = router;
