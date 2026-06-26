const os = require('os');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
const TEMP_DIR = path.join(os.tmpdir(), 'company-showcase-uploads');

for (const dir of [UPLOADS_DIR, TEMP_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function buildFilename(prefix, originalname) {
  const ext = path.extname(originalname) || '.bin';
  return `${prefix}${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
}

function createUploader(options = {}) {
  const {
    filenamePrefix = '',
    fileSizeLimit = 10 * 1024 * 1024,
    fileFilter,
  } = options;

  const storage = multer.diskStorage({
    destination: TEMP_DIR,
    filename: (req, file, cb) => {
      cb(null, buildFilename(filenamePrefix, file.originalname));
    },
  });

  return multer({
    storage,
    limits: { fileSize: fileSizeLimit },
    fileFilter,
  });
}

/** cosfs 单次写入 >64KB 会失败，必须先落本地临时目录再复制到 uploads */
function finalizeUpload(tempFilename) {
  const tempPath = path.join(TEMP_DIR, tempFilename);
  const finalPath = path.join(UPLOADS_DIR, tempFilename);
  if (!fs.existsSync(tempPath)) {
    throw new Error('临时文件不存在');
  }
  fs.copyFileSync(tempPath, finalPath);
  fs.unlinkSync(tempPath);
  return {
    filename: tempFilename,
    url: `/uploads/${tempFilename}`,
    path: finalPath,
  };
}

module.exports = {
  UPLOADS_DIR,
  TEMP_DIR,
  createUploader,
  finalizeUpload,
};
