const express = require('express');
const XLSX = require('xlsx');
const { db } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Public: submit contact form
router.post('/', (req, res) => {
  const { name, phone, address, area, budget, company, contact_info, message } = req.body;
  if (!name) return res.json({ code: 400, message: '姓名不能为空', data: null });
  if (!phone) return res.json({ code: 400, message: '手机号不能为空', data: null });

  // Build message from fields
  const parts = [];
  if (address) parts.push(`地址: ${address}`);
  if (area) parts.push(`面积: ${area}`);
  if (budget) parts.push(`预算: ${budget}`);
  if (message) parts.push(message);
  const fullMessage = parts.join(' | ');

  const result = db.prepare(
    'INSERT INTO contacts (name, company, contact_info, message) VALUES (?, ?, ?, ?)'
  ).run(name, company || '', phone || contact_info || '', fullMessage);
  res.json({ code: 200, message: 'success', data: { id: result.lastInsertRowid } });
});

// Admin: stats - 获取线索统计 (must be before /:id routes)
router.get('/stats', authMiddleware, (req, res) => {
  const pending = db.prepare("SELECT COUNT(*) as count FROM contacts WHERE status = 'pending'").get().count;
  const contacted = db.prepare("SELECT COUNT(*) as count FROM contacts WHERE status = 'contacted'").get().count;
  const invalid = db.prepare("SELECT COUNT(*) as count FROM contacts WHERE status = 'invalid'").get().count;
  const total = db.prepare("SELECT COUNT(*) as count FROM contacts").get().count;
  res.json({
    code: 200,
    message: 'success',
    data: { pending, contacted, invalid, total }
  });
});

// Admin: export Excel
router.get('/export', authMiddleware, (req, res) => {
  const { status } = req.query;
  let sql = 'SELECT * FROM contacts';
  const params = [];
  if (status && status !== 'all') {
    sql += ' WHERE status = ?';
    params.push(status);
  }
  sql += ' ORDER BY created_at DESC';
  const rows = db.prepare(sql).all(...params);

  const statusMap = { pending: '待跟进', contacted: '已联系', invalid: '无效' };
  const data = rows.map(r => ({
    'ID': r.id,
    '姓名': r.name,
    '手机号': r.contact_info,
    '公司': r.company || '',
    '需求描述': r.message || '',
    '状态': statusMap[r.status] || r.status,
    '跟进备注': r.note || '',
    '提交时间': r.created_at,
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, '线索');
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=contacts.xlsx');
  res.send(buf);
});

// Admin: list all contacts with optional status filter
router.get('/', authMiddleware, (req, res) => {
  const { status } = req.query;
  let sql = 'SELECT * FROM contacts';
  const params = [];
  if (status && status !== 'all') {
    sql += ' WHERE status = ?';
    params.push(status);
  }
  sql += ' ORDER BY created_at DESC';
  const rows = db.prepare(sql).all(...params);
  res.json({ code: 200, message: 'success', data: rows });
});

// Admin: update contact status
router.put('/:id/status', authMiddleware, (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'contacted', 'invalid'];
  if (!validStatuses.includes(status)) {
    return res.json({ code: 400, message: '无效的状态值', data: null });
  }
  const existing = db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id);
  if (!existing) return res.json({ code: 404, message: '联系记录不存在', data: null });
  db.prepare('UPDATE contacts SET status = ? WHERE id = ?').run(status, req.params.id);
  const row = db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id);
  res.json({ code: 200, message: 'success', data: row });
});

// Admin: update contact note
router.put('/:id/note', authMiddleware, (req, res) => {
  const { note } = req.body;
  const existing = db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id);
  if (!existing) return res.json({ code: 404, message: '联系记录不存在', data: null });
  db.prepare('UPDATE contacts SET note = ? WHERE id = ?').run(note || '', req.params.id);
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
