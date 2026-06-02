const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SEED_DIR = path.join(__dirname, 'seed-materials');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const MANIFEST_PATH = path.join(SEED_DIR, 'manifest.json');

const FILE_TYPES = {
  '.pdf': 'pdf',
  '.ppt': 'ppt',
  '.pptx': 'ppt',
  '.doc': 'doc',
  '.docx': 'doc',
  '.xls': 'excel',
  '.xlsx': 'excel',
  '.jpg': 'image',
  '.jpeg': 'image',
  '.png': 'image',
  '.gif': 'image',
  '.webp': 'image'
};

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getFileType(ext) {
  return FILE_TYPES[ext.toLowerCase()] || 'link';
}

function tryConvertPptToPdf(sourcePath, uploadsDir, uploadFilename) {
  const ext = path.extname(sourcePath).toLowerCase();
  if (!['.ppt', '.pptx'].includes(ext)) {
    return { pdf_url: null, pdf_filename: null };
  }

  const baseName = path.basename(uploadFilename, path.extname(uploadFilename));
  const pdfName = `${baseName}.pdf`;
  const pdfPath = path.join(uploadsDir, pdfName);

  try {
    execSync(
      `libreoffice --headless --convert-to pdf --outdir "${uploadsDir}" "${sourcePath}"`,
      { timeout: 30000 }
    );
    if (fs.existsSync(pdfPath)) {
      return { pdf_url: `/uploads/${pdfName}`, pdf_filename: pdfName };
    }
  } catch (e) {
    console.warn('PPT to PDF conversion skipped:', e.message);
  }

  return { pdf_url: null, pdf_filename: null };
}

function copyToUploads(sourcePath, originalFilename) {
  const ext = path.extname(originalFilename);
  const uploadFilename = `seed-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const destPath = path.join(UPLOADS_DIR, uploadFilename);
  fs.copyFileSync(sourcePath, destPath);
  return { uploadFilename, destPath, file_url: `/uploads/${uploadFilename}` };
}

function seedDefaultMaterials(db) {
  ensureDir(UPLOADS_DIR);

  if (!fs.existsSync(MANIFEST_PATH)) {
    console.warn('seed-materials/manifest.json not found, skipping material seed');
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const categories = db.prepare('SELECT id, name FROM material_categories').all();
  const categoryByName = Object.fromEntries(categories.map(c => [c.name, c.id]));
  const existsByFilename = db.prepare('SELECT id FROM materials WHERE original_filename = ?');
  const insertMaterial = db.prepare(`
    INSERT INTO materials (
      title, category_id, tags, file_url, file_type, original_filename,
      pdf_url, pdf_filename, is_pinned, visibility, sort_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let seeded = 0;

  for (const item of manifest) {
    const sourcePath = path.join(SEED_DIR, item.filename);
    if (!fs.existsSync(sourcePath)) {
      console.warn(`Seed file missing: ${item.filename}`);
      continue;
    }

    if (existsByFilename.get(item.filename)) {
      continue;
    }

    const { uploadFilename, destPath, file_url } = copyToUploads(sourcePath, item.filename);
    const ext = path.extname(item.filename).toLowerCase();
    const file_type = getFileType(ext);
    const category_id = categoryByName[item.category] || null;
    const tags = JSON.stringify(item.tags || []);
    const { pdf_url, pdf_filename } = tryConvertPptToPdf(destPath, UPLOADS_DIR, uploadFilename);

    insertMaterial.run(
      item.title || path.basename(item.filename, ext),
      category_id,
      tags,
      file_url,
      file_type,
      item.filename,
      pdf_url,
      pdf_filename,
      item.is_pinned ? 1 : 0,
      item.visibility || 'employee',
      item.sort_order || 0
    );
    seeded += 1;
  }

  if (seeded > 0) {
    console.log(`Seeded ${seeded} material(s) from seed-materials/`);
  }
}

module.exports = { seedDefaultMaterials };
