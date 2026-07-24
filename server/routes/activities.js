const express = require('express');
const jwt = require('jsonwebtoken');
const { db } = require('../db');
const { authMiddleware, requireRole, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

function optionalAdmin(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return false;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT id, role, is_active FROM users WHERE id = ?').get(decoded.id);
    return user && user.is_active && user.role === 'admin';
  } catch {
    return false;
  }
}

// Admin: list all activities (including drafts)
router.get('/admin/list', authMiddleware, requireRole('admin'), (req, res) => {
  const rows = db.prepare(
    'SELECT * FROM activities ORDER BY sort_order ASC, start_time DESC, id DESC'
  ).all();
  res.json({ code: 200, message: 'success', data: rows });
});

// Public: list published/ended activities
router.get('/', (req, res) => {
  const { status } = req.query;
  let sql = 'SELECT * FROM activities WHERE status IN (\'published\', \'ended\')';
  const params = [];
  if (status && ['published', 'ended'].includes(status)) {
    sql = 'SELECT * FROM activities WHERE status = ?';
    params.push(status);
  }
  sql += ' ORDER BY sort_order ASC, start_time DESC, id DESC';
  const rows = db.prepare(sql).all(...params);
  res.json({ code: 200, message: 'success', data: rows });
});

// Public: get single activity
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM activities WHERE id = ?').get(req.params.id);
  if (!row) return res.json({ code: 404, message: '活动不存在', data: null });
  if (row.status === 'draft' && !optionalAdmin(req)) {
    return res.json({ code: 404, message: '活动不存在', data: null });
  }
  db.prepare('UPDATE activities SET view_count = view_count + 1 WHERE id = ?').run(req.params.id);
  const updated = db.prepare('SELECT * FROM activities WHERE id = ?').get(req.params.id);
  res.json({ code: 200, message: 'success', data: updated });
});

// Admin: create activity
router.post('/', authMiddleware, requireRole('admin'), (req, res) => {
  const {
    title, summary, content, cover_image_url, location,
    start_time, end_time, status, sort_order,
  } = req.body;
  if (!title) return res.json({ code: 400, message: '标题不能为空', data: null });
  const result = db.prepare(`
    INSERT INTO activities (
      title, summary, content, cover_image_url, location,
      start_time, end_time, status, sort_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    title,
    summary || '',
    content || '',
    cover_image_url || '',
    location || '',
    start_time || null,
    end_time || null,
    status || 'draft',
    sort_order || 0
  );
  const row = db.prepare('SELECT * FROM activities WHERE id = ?').get(result.lastInsertRowid);
  res.json({ code: 200, message: 'success', data: row });
});

// Admin: update activity
router.put('/:id', authMiddleware, requireRole('admin'), (req, res) => {
  const existing = db.prepare('SELECT * FROM activities WHERE id = ?').get(req.params.id);
  if (!existing) return res.json({ code: 404, message: '活动不存在', data: null });
  const {
    title, summary, content, cover_image_url, location,
    start_time, end_time, status, sort_order,
  } = req.body;
  db.prepare(`
    UPDATE activities SET
      title=?, summary=?, content=?, cover_image_url=?, location=?,
      start_time=?, end_time=?, status=?, sort_order=?
    WHERE id=?
  `).run(
    title ?? existing.title,
    summary ?? existing.summary,
    content ?? existing.content,
    cover_image_url ?? existing.cover_image_url,
    location ?? existing.location,
    start_time ?? existing.start_time,
    end_time ?? existing.end_time,
    status ?? existing.status,
    sort_order ?? existing.sort_order,
    req.params.id
  );
  const row = db.prepare('SELECT * FROM activities WHERE id = ?').get(req.params.id);
  res.json({ code: 200, message: 'success', data: row });
});

// Admin: delete activity
router.delete('/:id', authMiddleware, requireRole('admin'), (req, res) => {
  const existing = db.prepare('SELECT * FROM activities WHERE id = ?').get(req.params.id);
  if (!existing) return res.json({ code: 404, message: '活动不存在', data: null });
  db.prepare('DELETE FROM activities WHERE id = ?').run(req.params.id);
  res.json({ code: 200, message: 'success', data: null });
});

module.exports = router;
