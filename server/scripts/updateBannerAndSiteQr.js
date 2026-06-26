/**
 * 将首张轮播图改为种子图，并写入官网二维码设置
 * 用法: node scripts/updateBannerAndSiteQr.js
 */
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { db, initDatabase } = require('../db');

const BANNER_IMAGE = '/uploads/seed/banner-1.jpg';
const SITE_QR = '/uploads/seed/site-qr.png';
const qrPath = path.join(__dirname, '..', 'uploads', 'seed', 'site-qr.png');

initDatabase();

if (!fs.existsSync(qrPath)) {
  console.error('缺少 site-qr.png，请先运行: node scripts/generateSiteQr.js');
  process.exit(1);
}

const firstBanner = db.prepare('SELECT id, image_url FROM banners ORDER BY sort_order ASC, id ASC LIMIT 1').get();
if (firstBanner) {
  db.prepare('UPDATE banners SET image_url = ? WHERE id = ?').run(BANNER_IMAGE, firstBanner.id);
  console.log(`banners#${firstBanner.id}: ${firstBanner.image_url || '(空)'} -> ${BANNER_IMAGE}`);
}

db.prepare(
  'INSERT INTO settings (`key`, value, updated_at) VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE value = VALUES(value), updated_at = NOW()'
).run('site_qr_url', SITE_QR);
console.log(`settings.site_qr_url -> ${SITE_QR}`);

console.log('Done.');
