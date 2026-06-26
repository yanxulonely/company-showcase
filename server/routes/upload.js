const express = require('express');
const path = require('path');
const { authMiddleware } = require('../middleware/auth');
const { createUploader, persistUpload } = require('../lib/uploadStorage');

const router = express.Router();

const upload = createUploader({
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|svg|heic|heif|pdf|doc|docx/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(null, ext || mime);
  },
});

function handleUpload(req, res) {
  if (!req.file) {
    return res.json({ code: 400, message: '请选择文件或未收到文件数据', data: null });
  }
  try {
    const saved = persistUpload(req.file);
    res.json({ code: 200, message: 'success', data: { url: saved.url, filename: saved.filename } });
  } catch (e) {
    console.error('Upload finalize failed:', e);
    res.json({ code: 500, message: '保存文件失败，请重试', data: null });
  }
}

// 必须先解析 multipart，再跑 auth（auth 内 deasync 会阻塞事件循环，否则 >64KB 会失败）
router.post('/', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      const message = err.code === 'LIMIT_FILE_SIZE'
        ? '文件过大，最大 10MB'
        : (err.message || '上传失败');
      return res.json({ code: 400, message, data: null });
    }
    next();
  });
}, authMiddleware, handleUpload);

module.exports = router;
