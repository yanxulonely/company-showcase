/**
 * 生成首页种子展示图（SVG，可直接作为 /uploads 静态资源）
 * 用法: node scripts/generateSeedImages.js
 */
const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads', 'seed');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function write(name, svg) {
  const filePath = path.join(UPLOADS_DIR, name);
  fs.writeFileSync(filePath, svg.trim(), 'utf8');
  return `/uploads/seed/${name}`;
}

const images = {
  'case-modern.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" fill="none">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#e8eef5"/>
      <stop offset="100%" stop-color="#cfd9e8"/>
    </linearGradient>
    <linearGradient id="sofa" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#dbeafe"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#bg)"/>
  <rect x="0" y="520" width="1200" height="280" fill="#b8c4d4"/>
  <rect x="120" y="80" width="520" height="360" rx="8" fill="#ffffff" opacity="0.55"/>
  <rect x="700" y="120" width="380" height="300" rx="8" fill="#ffffff" opacity="0.35"/>
  <rect x="180" y="430" width="760" height="120" rx="24" fill="url(#sofa)"/>
  <rect x="220" y="470" width="680" height="36" rx="18" fill="#93c5fd" opacity="0.35"/>
  <circle cx="980" cy="180" r="90" fill="#fde68a" opacity="0.55"/>
  <rect x="860" y="560" width="180" height="8" rx="4" fill="#64748b" opacity="0.25"/>
  <text x="60" y="720" fill="#1e293b" font-size="42" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-weight="700">现代简约 · 三室两厅</text>
  <text x="60" y="770" fill="#475569" font-size="24" font-family="PingFang SC, Microsoft YaHei, sans-serif">白色与原木 · 简洁明亮</text>
</svg>`,

  'case-chinese.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" fill="none">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#2f2418"/>
      <stop offset="100%" stop-color="#1a120b"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#bg)"/>
  <rect x="80" y="100" width="1040" height="520" rx="12" fill="#3d2b1f" stroke="#8b6914" stroke-width="3"/>
  <rect x="520" y="140" width="120" height="420" fill="#5c4030" opacity="0.8"/>
  <circle cx="580" cy="350" r="70" fill="none" stroke="#d4af37" stroke-width="4"/>
  <path d="M180 620 Q600 560 1020 620" stroke="#8b6914" stroke-width="6" fill="none"/>
  <rect x="220" y="500" width="760" height="80" rx="8" fill="#4a3424"/>
  <rect x="260" y="520" width="680" height="40" rx="6" fill="#6b4c33"/>
  <text x="60" y="720" fill="#f5e6c8" font-size="42" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-weight="700">新中式 · 四室两厅</text>
  <text x="60" y="770" fill="#c4a574" font-size="24" font-family="PingFang SC, Microsoft YaHei, sans-serif">传统韵味 · 沉稳大气</text>
</svg>`,

  'case-luxury.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" fill="none">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#111827"/>
      <stop offset="100%" stop-color="#312e81"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#fde68a"/>
      <stop offset="100%" stop-color="#d4af37"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#bg)"/>
  <rect x="100" y="120" width="1000" height="420" rx="16" fill="#1f2937" stroke="url(#gold)" stroke-width="2"/>
  <rect x="160" y="180" width="420" height="300" rx="8" fill="#374151"/>
  <rect x="620" y="180" width="420" height="300" rx="8" fill="#4b5563"/>
  <rect x="200" y="540" width="800" height="60" rx="12" fill="#111827" stroke="#6b7280"/>
  <rect x="240" y="558" width="720" height="24" rx="12" fill="url(#gold)" opacity="0.45"/>
  <circle cx="980" cy="220" r="50" fill="url(#gold)" opacity="0.25"/>
  <text x="60" y="720" fill="#f9fafb" font-size="42" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-weight="700">轻奢风格 · 复式</text>
  <text x="60" y="770" fill="#c4b5fd" font-size="24" font-family="PingFang SC, Microsoft YaHei, sans-serif">金属质感 · 大理石搭配</text>
</svg>`,

  'banner-1.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 900" fill="none">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="55%" stop-color="#1e3a5f"/>
      <stop offset="100%" stop-color="#312e81"/>
    </linearGradient>
  </defs>
  <rect width="1920" height="900" fill="url(#bg)"/>
  <circle cx="1500" cy="200" r="260" fill="#3b82f6" opacity="0.12"/>
  <circle cx="300" cy="700" r="200" fill="#8b5cf6" opacity="0.15"/>
  <rect x="120" y="220" width="680" height="460" rx="20" fill="#ffffff" opacity="0.06" stroke="#ffffff" stroke-opacity="0.12"/>
  <rect x="860" y="280" width="920" height="340" rx="20" fill="#ffffff" opacity="0.04"/>
  <text x="160" y="360" fill="#ffffff" font-size="72" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-weight="700">用心装修每一个家</text>
  <text x="160" y="450" fill="#93c5fd" font-size="36" font-family="PingFang SC, Microsoft YaHei, sans-serif">尚润装饰 · 品质生活从家开始</text>
  <text x="160" y="560" fill="#cbd5e1" font-size="28" font-family="PingFang SC, Microsoft YaHei, sans-serif">设计 · 施工 · 材料 · 软装一站式</text>
</svg>`,

  'banner-2.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 900" fill="none">
  <defs>
    <linearGradient id="bg" x1="1" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1c1917"/>
      <stop offset="100%" stop-color="#44403c"/>
    </linearGradient>
  </defs>
  <rect width="1920" height="900" fill="url(#bg)"/>
  <rect x="0" y="620" width="1920" height="280" fill="#292524" opacity="0.8"/>
  <rect x="140" y="180" width="520" height="420" rx="12" fill="#57534e" opacity="0.5"/>
  <rect x="700" y="240" width="1080" height="300" rx="12" fill="#78716c" opacity="0.35"/>
  <text x="160" y="760" fill="#fafaf9" font-size="68" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-weight="700">精工细作 品质保障</text>
  <text x="160" y="840" fill="#d6d3d1" font-size="34" font-family="PingFang SC, Microsoft YaHei, sans-serif">自有施工团队 · 严格施工标准</text>
</svg>`,

  'designer-1.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" fill="none">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#dbeafe"/>
      <stop offset="100%" stop-color="#c4b5fd"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#bg)"/>
  <circle cx="200" cy="160" r="88" fill="#fde68a"/>
  <ellipse cx="200" cy="330" rx="120" ry="90" fill="#3b82f6" opacity="0.85"/>
  <circle cx="168" cy="150" r="10" fill="#1e293b"/>
  <circle cx="232" cy="150" r="10" fill="#1e293b"/>
  <path d="M175 190 Q200 215 225 190" stroke="#1e293b" stroke-width="4" fill="none" stroke-linecap="round"/>
  <text x="200" y="385" text-anchor="middle" fill="#1e3a8a" font-size="22" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-weight="600">林晓雯</text>
</svg>`,

  'designer-2.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" fill="none">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fef3c7"/>
      <stop offset="100%" stop-color="#fed7aa"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#bg)"/>
  <circle cx="200" cy="160" r="88" fill="#fcd34d"/>
  <ellipse cx="200" cy="330" rx="120" ry="90" fill="#78716c" opacity="0.88"/>
  <circle cx="168" cy="150" r="10" fill="#1e293b"/>
  <circle cx="232" cy="150" r="10" fill="#1e293b"/>
  <rect x="150" y="178" width="100" height="16" rx="8" fill="#1e293b" opacity="0.15"/>
  <text x="200" y="385" text-anchor="middle" fill="#92400e" font-size="22" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-weight="600">陈宇航</text>
</svg>`,

  'wechat-qr-placeholder.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" fill="none">
  <rect width="400" height="400" rx="24" fill="#ffffff"/>
  <rect x="24" y="24" width="352" height="352" rx="16" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="56" y="56" width="96" height="96" rx="8" fill="#111827"/>
  <rect x="248" y="56" width="96" height="96" rx="8" fill="#111827"/>
  <rect x="56" y="248" width="96" height="96" rx="8" fill="#111827"/>
  <rect x="184" y="184" width="32" height="32" fill="#111827"/>
  <rect x="232" y="184" width="16" height="16" fill="#111827"/>
  <rect x="184" y="232" width="16" height="16" fill="#111827"/>
  <rect x="216" y="216" width="48" height="48" rx="6" fill="#22c55e"/>
  <text x="200" y="372" text-anchor="middle" fill="#64748b" font-size="22" font-family="PingFang SC, Microsoft YaHei, sans-serif">尚润装饰 · 微信咨询</text>
</svg>`,
};

function main() {
  ensureDir(UPLOADS_DIR);
  const paths = {};
  for (const [name, svg] of Object.entries(images)) {
    paths[name] = write(name, svg);
  }
  console.log('Seed images generated:');
  Object.entries(paths).forEach(([name, url]) => console.log(`  ${name} -> ${url}`));
}

main();
