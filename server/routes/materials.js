const express = require('express');
const multer = require('multer');
const path = require('path');
const { db } = require('../db');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// File upload config
const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `material-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|svg|pdf|doc|docx|ppt|pptx|xls|xlsx/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    cb(null, ext);
  }
});

// GET /api/materials - 获取资料列表
router.get('/', authMiddleware, (req, res) => {
  const { category_id, tag, pinned, visibility } = req.query;
  let sql = 'SELECT m.*, mc.name as category_name FROM materials m LEFT JOIN material_categories mc ON m.category_id = mc.id';
  const conditions = [];
  const params = [];

  // Visibility filtering based on role
  if (req.user.role === 'admin') {
    // Admin sees all
  } else if (req.user.role === 'employee') {
    conditions.push("m.visibility IN ('employee', 'user')");
  } else {
    conditions.push("m.visibility = 'user'");
  }

  if (category_id) {
    conditions.push('m.category_id = ?');
    params.push(category_id);
  }
  if (pinned === '1') {
    conditions.push('m.is_pinned = 1');
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }
  sql += ' ORDER BY m.is_pinned DESC, m.sort_order ASC, m.id DESC';

  const materials = db.prepare(sql).all(...params);
  // Parse tags JSON
  materials.forEach(m => {
    try { m.tags = m.tags ? JSON.parse(m.tags) : []; } catch { m.tags = []; }
  });
  res.json({ code: 200, message: 'success', data: materials });
});

// GET /api/materials/:id - 获取资料详情
router.get('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const material = db.prepare(
    'SELECT m.*, mc.name as category_name FROM materials m LEFT JOIN material_categories mc ON m.category_id = mc.id WHERE m.id = ?'
  ).get(id);
  if (!material) {
    return res.json({ code: 404, message: '资料不存在', data: null });
  }
  try { material.tags = material.tags ? JSON.parse(material.tags) : []; } catch { material.tags = []; }
  res.json({ code: 200, message: 'success', data: material });
});

// POST /api/materials - 创建资料
router.post('/', authMiddleware, requireRole('admin'), (req, res) => {
  const { title, category_id, tags, file_url, file_type, original_filename, is_pinned, visibility, sort_order } = req.body;
  if (!title) {
    return res.json({ code: 400, message: '标题不能为空', data: null });
  }
  const tagsJson = Array.isArray(tags) ? JSON.stringify(tags) : (tags || '[]');
  const result = db.prepare(
    `INSERT INTO materials (title, category_id, tags, file_url, file_type, original_filename, is_pinned, visibility, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    title,
    category_id || null,
    tagsJson,
    file_url || '',
    file_type || 'link',
    original_filename || '',
    is_pinned ? 1 : 0,
    visibility || 'employee',
    sort_order || 0
  );
  const material = db.prepare(
    'SELECT m.*, mc.name as category_name FROM materials m LEFT JOIN material_categories mc ON m.category_id = mc.id WHERE m.id = ?'
  ).get(result.lastInsertRowid);
  try { material.tags = material.tags ? JSON.parse(material.tags) : []; } catch { material.tags = []; }
  res.json({ code: 200, message: 'success', data: material });
});

// PUT /api/materials/:id - 更新资料
router.put('/:id', authMiddleware, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  const { title, category_id, tags, file_url, file_type, original_filename, is_pinned, visibility, sort_order } = req.body;
  const material = db.prepare('SELECT id FROM materials WHERE id = ?').get(id);
  if (!material) {
    return res.json({ code: 404, message: '资料不存在', data: null });
  }
  const tagsJson = Array.isArray(tags) ? JSON.stringify(tags) : (tags || '[]');
  db.prepare(
    `UPDATE materials SET title = ?, category_id = ?, tags = ?, file_url = ?, file_type = ?, original_filename = ?, is_pinned = ?, visibility = ?, sort_order = ? WHERE id = ?`
  ).run(
    title || '',
    category_id || null,
    tagsJson,
    file_url || '',
    file_type || 'link',
    original_filename || '',
    is_pinned ? 1 : 0,
    visibility || 'employee',
    sort_order || 0,
    id
  );
  const updated = db.prepare(
    'SELECT m.*, mc.name as category_name FROM materials m LEFT JOIN material_categories mc ON m.category_id = mc.id WHERE m.id = ?'
  ).get(id);
  try { updated.tags = updated.tags ? JSON.parse(updated.tags) : []; } catch { updated.tags = []; }
  res.json({ code: 200, message: 'success', data: updated });
});

// DELETE /api/materials/:id - 删除资料
router.delete('/:id', authMiddleware, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  const material = db.prepare('SELECT id FROM materials WHERE id = ?').get(id);
  if (!material) {
    return res.json({ code: 404, message: '资料不存在', data: null });
  }
  db.prepare('DELETE FROM materials WHERE id = ?').run(id);
  res.json({ code: 200, message: 'success', data: null });
});

// PUT /api/materials/:id/pin - 设置/取消置顶
router.put('/:id/pin', authMiddleware, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  const material = db.prepare('SELECT id, is_pinned FROM materials WHERE id = ?').get(id);
  if (!material) {
    return res.json({ code: 404, message: '资料不存在', data: null });
  }
  const newPinned = material.is_pinned ? 0 : 1;
  db.prepare('UPDATE materials SET is_pinned = ? WHERE id = ?').run(newPinned, id);
  const updated = db.prepare(
    'SELECT m.*, mc.name as category_name FROM materials m LEFT JOIN material_categories mc ON m.category_id = mc.id WHERE m.id = ?'
  ).get(id);
  try { updated.tags = updated.tags ? JSON.parse(updated.tags) : []; } catch { updated.tags = []; }
  res.json({ code: 200, message: 'success', data: updated });
});

// POST /api/materials/upload - 上传文件
router.post('/upload', authMiddleware, requireRole('admin'), upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.json({ code: 400, message: '请选择文件', data: null });
  }
  const url = `/uploads/${req.file.filename}`;
  res.json({
    code: 200,
    message: 'success',
    data: { url, filename: req.file.filename, originalname: req.file.originalname }
  });
});

module.exports = router;
