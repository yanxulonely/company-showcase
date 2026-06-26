/**
 * 生成官网访问二维码 PNG
 * 用法: SITE_URL=http://106.54.246.16/ node scripts/generateSiteQr.js
 */
const fs = require('fs');
const path = require('path');

const SITE_URL = process.env.SITE_URL || 'http://106.54.246.16/';
const OUT_DIR = path.join(__dirname, '..', 'uploads', 'seed');
const OUT_FILE = path.join(OUT_DIR, 'site-qr.png');

async function main() {
  let QRCode;
  try {
    QRCode = require('qrcode');
  } catch {
    console.error('请先安装: cd server && npm install qrcode');
    process.exit(1);
  }

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  await QRCode.toFile(OUT_FILE, SITE_URL, {
    type: 'png',
    width: 400,
    margin: 2,
    color: { dark: '#1e293b', light: '#ffffff' },
  });

  console.log(`已生成: ${OUT_FILE}`);
  console.log(`链接: ${SITE_URL}`);
  console.log(`静态路径: /uploads/seed/site-qr.png`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
