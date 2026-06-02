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

function convertPptToPdfWindows(sourcePath, pdfPath) {
  const scriptPath = path.join(require('os').tmpdir(), `ppt2pdf-${Date.now()}.ps1`);
  const script = `
$ErrorActionPreference = 'Stop'
$src = '${sourcePath.replace(/'/g, "''")}'
$dst = '${pdfPath.replace(/'/g, "''")}'
$pp = New-Object -ComObject PowerPoint.Application
$pp.Visible = 1
$pres = $pp.Presentations.Open($src, $true, $true, $false)
$pres.SaveAs($dst, 32)
$pres.Close()
$pp.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($pp) | Out-Null
`;
  fs.writeFileSync(scriptPath, script, 'utf8');
  try {
    execSync(`powershell -NoProfile -ExecutionPolicy Bypass -File "${scriptPath}"`, {
      timeout: 120000,
      stdio: 'pipe'
    });
  } finally {
    fs.unlinkSync(scriptPath);
  }
}

function tryConvertPptToPdf(sourcePath, uploadsDir, uploadFilename) {
  const ext = path.extname(sourcePath).toLowerCase();
  if (!['.ppt', '.pptx'].includes(ext)) {
    return { pdf_url: null, pdf_filename: null };
  }

  const baseName = path.basename(uploadFilename, path.extname(uploadFilename));
  const pdfName = `${baseName}.pdf`;
  const pdfPath = path.join(uploadsDir, pdfName);

  if (fs.existsSync(pdfPath)) {
    return { pdf_url: `/uploads/${pdfName}`, pdf_filename: pdfName };
  }

  try {
    execSync(
      `libreoffice --headless --convert-to pdf --outdir "${uploadsDir}" "${sourcePath}"`,
      { timeout: 60000, stdio: 'pipe' }
    );
    if (fs.existsSync(pdfPath)) {
      return { pdf_url: `/uploads/${pdfName}`, pdf_filename: pdfName };
    }
  } catch {
    // LibreOffice not available
  }

  if (process.platform === 'win32') {
    try {
      convertPptToPdfWindows(sourcePath, pdfPath);
      if (fs.existsSync(pdfPath)) {
        return { pdf_url: `/uploads/${pdfName}`, pdf_filename: pdfName };
      }
    } catch (e) {
      console.warn('PowerPoint PDF conversion skipped:', e.message);
    }
  }

  return { pdf_url: null, pdf_filename: null };
}

function resolvePdfPreview(item, uploadFilename, uploadsDir) {
  if (item.pdf_file) {
    const pdfPath = path.join(uploadsDir, item.pdf_file);
    if (fs.existsSync(pdfPath)) {
      return { pdf_url: `/uploads/${item.pdf_file}`, pdf_filename: item.pdf_file };
    }
  }
  const sourcePath = path.join(uploadsDir, uploadFilename);
  return tryConvertPptToPdf(sourcePath, uploadsDir, uploadFilename);
}

function syncPptPdfPreviews(db) {
  const materials = db.prepare(`
    SELECT id, file_url, file_type FROM materials
    WHERE file_type IN ('ppt', 'pptx') AND (pdf_url IS NULL OR pdf_url = '')
  `).all();
  const update = db.prepare('UPDATE materials SET pdf_url = ?, pdf_filename = ? WHERE id = ?');

  for (const material of materials) {
    if (!material.file_url) continue;
    const uploadFilename = path.basename(material.file_url);
    const sourcePath = path.join(UPLOADS_DIR, uploadFilename);
    if (!fs.existsSync(sourcePath)) continue;

    const { pdf_url, pdf_filename } = tryConvertPptToPdf(sourcePath, UPLOADS_DIR, uploadFilename);
    if (pdf_url) {
      update.run(pdf_url, pdf_filename, material.id);
    }
  }
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
    if (existsByFilename.get(item.filename)) {
      continue;
    }

    let sourcePath;
    let file_url;
    let destPath;
    let uploadFilename;

    if (item.upload_file) {
      uploadFilename = item.upload_file;
      sourcePath = path.join(UPLOADS_DIR, uploadFilename);
      destPath = sourcePath;
      file_url = `/uploads/${uploadFilename}`;
      if (!fs.existsSync(sourcePath)) {
        console.warn(`Upload file missing: ${item.upload_file}`);
        continue;
      }
    } else {
      sourcePath = path.join(SEED_DIR, item.filename);
      if (!fs.existsSync(sourcePath)) {
        console.warn(`Seed file missing: ${item.filename}`);
        continue;
      }
      ({ uploadFilename, destPath, file_url } = copyToUploads(sourcePath, item.filename));
    }

    const ext = path.extname(item.filename).toLowerCase();
    const file_type = getFileType(ext);
    const category_id = categoryByName[item.category] || null;
    const tags = JSON.stringify(item.tags || []);
    const { pdf_url, pdf_filename } = resolvePdfPreview(item, uploadFilename, UPLOADS_DIR);

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

module.exports = { seedDefaultMaterials, syncPptPdfPreviews, tryConvertPptToPdf };
