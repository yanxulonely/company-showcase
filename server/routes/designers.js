const express = require('express');
const { db } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

function parseDesigner(row) {
  if (!row) return null;
  let styles = [];
  let featured_case_ids = [];
  try {
    styles = row.styles ? JSON.parse(row.styles) : [];
  } catch {
    styles = row.styles ? String(row.styles).split(/[,，]/).map(s => s.trim()).filter(Boolean) : [];
  }
  try {
    featured_case_ids = row.featured_case_ids ? JSON.parse(row.featured_case_ids) : [];
  } catch {
    featured_case_ids = [];
  }
  return {
    ...row,
    styles,
    featured_case_ids,
    is_active: row.is_active !== 0,
  };
}

function serializeArray(val) {
  if (Array.isArray(val)) return JSON.stringify(val);
  if (typeof val === 'string' && val.trim()) {
    const arr = val.split(/[,，]/).map(s => s.trim()).filter(Boolean);
    return JSON.stringify(arr);
  }
  return '[]';
}

// Public: active designers only
router.get('/active', (req, res) => {
  const rows = db.prepare(
    'SELECT * FROM designers WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
  ).all();
  res.json({ code: 200, message: 'success', data: rows.map(parseDesigner) });
});

// Admin: all designers
router.get('/', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM designers ORDER BY sort_order ASC, id ASC').all();
  res.json({ code: 200, message: 'success', data: rows.map(parseDesigner) });
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM designers WHERE id = ?').get(req.params.id);
  if (!row) return res.json({ code: 404, message: '设计师不存在', data: null });
  res.json({ code: 200, message: 'success', data: parseDesigner(row) });
});

router.post('/', authMiddleware, (req, res) => {
  const {
    name, title, bio, photo_url, styles, years_experience, project_count,
    slogan, featured_case_ids, sort_order, is_active,
  } = req.body;
  if (!name) return res.json({ code: 400, message: '姓名不能为空', data: null });
  const result = db.prepare(`
    INSERT INTO designers (
      name, title, bio, photo_url, styles, years_experience, project_count,
      slogan, featured_case_ids, sort_order, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    name,
    title || '',
    bio || '',
    photo_url || '',
    serializeArray(styles),
    years_experience || 0,
    project_count || 0,
    slogan || '',
    serializeArray(featured_case_ids),
    sort_order || 0,
    is_active !== undefined ? (is_active ? 1 : 0) : 1
  );
  const row = db.prepare('SELECT * FROM designers WHERE id = ?').get(result.lastInsertRowid);
  res.json({ code: 200, message: 'success', data: parseDesigner(row) });
});

router.put('/:id', authMiddleware, (req, res) => {
  const existing = db.prepare('SELECT * FROM designers WHERE id = ?').get(req.params.id);
  if (!existing) return res.json({ code: 404, message: '设计师不存在', data: null });
  const {
    name, title, bio, photo_url, styles, years_experience, project_count,
    slogan, featured_case_ids, sort_order, is_active,
  } = req.body;
  db.prepare(`
    UPDATE designers SET
      name=?, title=?, bio=?, photo_url=?, styles=?, years_experience=?,
      project_count=?, slogan=?, featured_case_ids=?, sort_order=?, is_active=?
    WHERE id=?
  `).run(
    name ?? existing.name,
    title ?? existing.title,
    bio ?? existing.bio,
    photo_url ?? existing.photo_url,
    styles !== undefined ? serializeArray(styles) : existing.styles,
    years_experience ?? existing.years_experience,
    project_count ?? existing.project_count,
    slogan ?? existing.slogan,
    featured_case_ids !== undefined ? serializeArray(featured_case_ids) : existing.featured_case_ids,
    sort_order ?? existing.sort_order,
    is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active,
    req.params.id
  );
  const row = db.prepare('SELECT * FROM designers WHERE id = ?').get(req.params.id);
  res.json({ code: 200, message: 'success', data: parseDesigner(row) });
});

router.put('/:id/toggle', authMiddleware, (req, res) => {
  const row = db.prepare('SELECT id, is_active FROM designers WHERE id = ?').get(req.params.id);
  if (!row) return res.json({ code: 404, message: '设计师不存在', data: null });
  const next = row.is_active ? 0 : 1;
  db.prepare('UPDATE designers SET is_active = ? WHERE id = ?').run(next, req.params.id);
  const updated = db.prepare('SELECT * FROM designers WHERE id = ?').get(req.params.id);
  res.json({ code: 200, message: 'success', data: parseDesigner(updated) });
});

router.delete('/:id', authMiddleware, (req, res) => {
  const existing = db.prepare('SELECT * FROM designers WHERE id = ?').get(req.params.id);
  if (!existing) return res.json({ code: 404, message: '设计师不存在', data: null });
  db.prepare('DELETE FROM designers WHERE id = ?').run(req.params.id);
  res.json({ code: 200, message: 'success', data: null });
});

module.exports = router;
