/**
 * 为已有数据库补全缺失的展示图片路径（不覆盖已有图片）
 * 用法: node scripts/applySeedImages.js
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const seedDir = path.join(__dirname, '..', 'uploads', 'seed');
if (!fs.existsSync(seedDir)) {
  console.error('请先运行: node scripts/generateSeedImages.js');
  process.exit(1);
}

const { db, initDatabase } = require('../db');
initDatabase();

function upsertSetting(key, value) {
  const existing = db.prepare('SELECT value FROM settings WHERE `key` = ?').get(key);
  if (existing?.value) return false;
  db.prepare(
    'INSERT INTO settings (`key`, value, updated_at) VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE value = VALUES(value), updated_at = NOW()'
  ).run(key, value);
  return true;
}

function migrateSeedPngToJpg() {
  const pairs = [
    ['case-modern.png', 'case-modern.jpg'],
    ['case-chinese.png', 'case-chinese.jpg'],
    ['case-luxury.png', 'case-luxury.jpg'],
    ['banner-1.png', 'banner-1.jpg'],
    ['banner-2.png', 'banner-2.jpg'],
    ['designer-1.png', 'designer-1.jpg'],
    ['designer-2.png', 'designer-2.jpg'],
  ];
  let count = 0;
  for (const [from, to] of pairs) {
    const fromUrl = `/uploads/seed/${from}`;
    const toUrl = `/uploads/seed/${to}`;
    for (const [table, col] of [['cases', 'image_url'], ['banners', 'image_url'], ['designers', 'photo_url']]) {
      const r = db.prepare(`UPDATE ${table} SET ${col} = ? WHERE ${col} = ?`).run(toUrl, fromUrl);
      if (r.changes) {
        count += r.changes;
        console.log(`${table}.${col}: ${fromUrl} -> ${toUrl}`);
      }
    }
  }
  return count;
}

function main() {
  let count = migrateSeedPngToJpg();

  const caseImages = [
    '/uploads/seed/case-modern.jpg',
    '/uploads/seed/case-chinese.jpg',
    '/uploads/seed/case-luxury.jpg',
  ];
  const cases = db.prepare('SELECT id, image_url FROM cases ORDER BY sort_order ASC, id ASC').all();
  cases.forEach((row, index) => {
    if (!row.image_url && caseImages[index]) {
      db.prepare('UPDATE cases SET image_url = ? WHERE id = ?').run(caseImages[index], row.id);
      count += 1;
      console.log(`cases#${row.id} -> ${caseImages[index]}`);
    }
  });

  const bannerImages = ['/uploads/seed/banner-1.jpg', '/uploads/seed/banner-2.jpg'];
  const banners = db.prepare('SELECT id, image_url FROM banners ORDER BY sort_order ASC, id ASC').all();
  banners.forEach((row, index) => {
    if (!row.image_url && bannerImages[index]) {
      db.prepare('UPDATE banners SET image_url = ? WHERE id = ?').run(bannerImages[index], row.id);
      count += 1;
      console.log(`banners#${row.id} -> ${bannerImages[index]}`);
    }
  });

  const designerImages = ['/uploads/seed/designer-1.jpg', '/uploads/seed/designer-2.jpg'];
  const designers = db.prepare('SELECT id, photo_url FROM designers ORDER BY sort_order ASC, id ASC').all();
  designers.forEach((row, index) => {
    if (!row.photo_url && designerImages[index]) {
      db.prepare('UPDATE designers SET photo_url = ? WHERE id = ?').run(designerImages[index], row.id);
      count += 1;
      console.log(`designers#${row.id} -> ${designerImages[index]}`);
    }
  });

  if (upsertSetting('wechat_qr_url', '/uploads/seed/wechat-qr-placeholder.svg')) {
    count += 1;
    console.log('settings.wechat_qr_url -> /uploads/seed/wechat-qr-placeholder.svg');
  }
  if (upsertSetting('business_hours', '周一至周五 9:00 - 18:00')) {
    count += 1;
    console.log('settings.business_hours -> 周一至周五 9:00 - 18:00');
  }

  console.log(`Done. Updated ${count} record(s).`);
}

main();
