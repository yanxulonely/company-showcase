const express = require('express');
const { db } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Public: submit contact form
router.post('/', (req, res) => {
  const { name, company, contact_info, message } = req.body;
  if (!name) return res.json({ code: 400, message: '姓名不能为空', data: null });
  const result = db.prepare(
    'INSERT INTO contacts (name, company, contact_info, message) VALUES (?, ?, ?, ?)'
  ).run(name, company || '', contact_info || '', message || '');
  res.json({ code: 200, message: 'success', data: { id: result.lastInsertRowid } });
});

// Admin: list all contacts
router.get('/', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM contacts ORDER BY created_at DESC').all();
  res.json({ code: 200, message: 'success', data: rows });
});

// Admin: update contact status
router.put('/:id', authMiddleware, (req, res) => {
  const { status } = req.body;
  const existing = db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id);
  if (!existing) return res.json({ code: 404, message: '联系记录不存在', data: null });
  db.prepare('UPDATE contacts SET status = ? WHERE id = ?').run(status || existing.status, req.params.id);
  const row = db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id);
  res.json({ code: 200, message: 'success', data: row });
});

// Admin: delete contact
router.delete('/:id', authMiddleware, (req, res) => {
  const existing = db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id);
  if (!existing) return res.json({ code: 404, message: '联系记录不存在', data: null });
  db.prepare('DELETE FROM contacts WHERE id = ?').run(req.params.id);
  res.json({ code: 200, message: 'success', data: null });
});

module.exports = router;
