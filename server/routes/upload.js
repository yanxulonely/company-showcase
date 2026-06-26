const express = require('express');
const path = require('path');
const { authMiddleware } = require('../middleware/auth');
const { createUploader, finalizeUpload } = require('../lib/uploadStorage');

const router = express.Router();

const upload = createUploader({
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|svg|heic|heif|pdf|doc|docx/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(null, ext || mime);
  },
});

router.post('/', authMiddleware, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      const message = err.code === 'LIMIT_FILE_SIZE'
        ? '文件过大，最大 10MB'
        : (err.message || '上传失败');
      return res.json({ code: 400, message, data: null });
    }
    if (!req.file) {
      return res.json({ code: 400, message: '请选择文件或未收到文件数据', data: null });
    }
    try {
      const saved = finalizeUpload(req.file.filename);
      res.json({ code: 200, message: 'success', data: { url: saved.url, filename: saved.filename } });
    } catch (e) {
      console.error('Upload finalize failed:', e);
      res.json({ code: 500, message: '保存文件失败，请重试', data: null });
    }
  });
});

module.exports = router;
