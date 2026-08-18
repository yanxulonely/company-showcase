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

  'activity-national-day.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" fill="none"> <defs> <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"> <stop offset="0%" stop-color="#1a0505"/> <stop offset="35%" stop-color="#7f1d1d"/> <stop offset="70%" stop-color="#b91c1c"/> <stop offset="100%" stop-color="#450a0a"/> </linearGradient> <linearGradient id="gold" x1="0" y1="0" x2="1" y2="0"> <stop offset="0%" stop-color="#fde68a"/> <stop offset="50%" stop-color="#fbbf24"/> <stop offset="100%" stop-color="#d97706"/> </linearGradient> <linearGradient id="goldV" x1="0" y1="0" x2="0" y2="1"> <stop offset="0%" stop-color="#fef3c7"/> <stop offset="100%" stop-color="#f59e0b"/> </linearGradient> <filter id="glow"> <feGaussianBlur stdDeviation="6" result="b"/> <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge> </filter> <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse"> <circle cx="2" cy="2" r="1" fill="#fbbf24" opacity="0.08"/> </pattern> </defs> <rect width="1200" height="630" fill="url(#bg)"/> <rect width="1200" height="630" fill="url(#dots)"/> <circle cx="1050" cy="100" r="200" fill="#fbbf24" opacity="0.1"/> <circle cx="100" cy="530" r="160" fill="#ffffff" opacity="0.04"/> <!-- 飘带装饰 --> <path d="M0 120 Q300 80 600 140 T1200 100" stroke="#fbbf24" stroke-width="2" fill="none" opacity="0.2"/> <path d="M0 500 Q400 460 800 520 T1200 480" stroke="#fde68a" stroke-width="1.5" fill="none" opacity="0.15"/> <text x="72" y="56" fill="#fde68a" font-size="14" font-family="PingFang SC, Microsoft YaHei, sans-serif" letter-spacing="6" opacity="0.8">NATIONAL DAY SPECIAL</text> <text x="72" y="100" fill="#fecaca" font-size="26" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-weight="600" letter-spacing="6">国庆家装大促</text> <!-- 艺术字主标题 --> <text x="72" y="210" fill="none" stroke="#92400e" stroke-width="3" font-size="88" font-family="PingFang SC, Microsoft YaHei, serif" font-weight="900" filter="url(#glow)">1元定金</text> <text x="72" y="210" fill="url(#goldV)" font-size="88" font-family="PingFang SC, Microsoft YaHei, serif" font-weight="900">1元定金</text> <text x="72" y="310" fill="none" stroke="#b45309" stroke-width="2.5" font-size="76" font-family="PingFang SC, Microsoft YaHei, serif" font-weight="900">抵1000元</text> <text x="72" y="310" fill="url(#gold)" font-size="76" font-family="PingFang SC, Microsoft YaHei, serif" font-weight="900">抵1000元</text> <rect x="72" y="340" width="400" height="52" rx="26" fill="url(#gold)"/> <text x="272" y="375" text-anchor="middle" fill="#7f1d1d" font-size="24" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-weight="800">限时抢购 · 名额有限</text> <text x="72" y="450" fill="#fecaca" font-size="22" font-family="PingFang SC, Microsoft YaHei, sans-serif">免费量房 · 免费设计 · 材料升级礼</text> <text x="72" y="490" fill="#fca5a5" font-size="20" font-family="PingFang SC, Microsoft YaHei, sans-serif" letter-spacing="2">8.18 起火热预约 · 国庆专享</text> <!-- 右侧大数字 --> <rect x="720" y="80" width="400" height="420" rx="16" fill="#ffffff" fill-opacity="0.06" stroke="url(#gold)" stroke-width="2"/> <text x="920" y="300" text-anchor="middle" fill="none" stroke="#fbbf24" stroke-width="4" font-size="200" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-weight="900" opacity="0.5">1</text> <text x="920" y="300" text-anchor="middle" fill="url(#goldV)" font-size="200" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-weight="900">1</text> <text x="920" y="380" text-anchor="middle" fill="#ffffff" font-size="36" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-weight="700">元抢定</text> <text x="920" y="430" text-anchor="middle" fill="#fbbf24" font-size="26" font-family="PingFang SC, Microsoft YaHei, sans-serif">签约立减1000</text> <rect x="0" y="560" width="1200" height="70" fill="#1a0505" opacity="0.7"/> <text x="600" y="605" text-anchor="middle" fill="#fde68a" font-size="18" font-family="PingFang SC, Microsoft YaHei, sans-serif" letter-spacing="4">尚润装饰 · 品质装修</text> </svg>`,

  'activity-hard-deco.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" fill="none"> <defs> <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"> <stop offset="0%" stop-color="#030712"/> <stop offset="45%" stop-color="#0f172a"/> <stop offset="100%" stop-color="#1e1b4b"/> </linearGradient> <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0"> <stop offset="0%" stop-color="#60a5fa"/> <stop offset="50%" stop-color="#a78bfa"/> <stop offset="100%" stop-color="#818cf8"/> </linearGradient> <linearGradient id="price" x1="0" y1="0" x2="1" y2="1"> <stop offset="0%" stop-color="#e0e7ff"/> <stop offset="50%" stop-color="#93c5fd"/> <stop offset="100%" stop-color="#6366f1"/> </linearGradient> <linearGradient id="shine" x1="0" y1="0" x2="0" y2="1"> <stop offset="0%" stop-color="#ffffff" stop-opacity="0.12"/> <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/> </linearGradient> <filter id="glow"> <feGaussianBlur stdDeviation="5" result="b"/> <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge> </filter> </defs> <rect width="1200" height="630" fill="url(#bg)"/> <ellipse cx="900" cy="150" rx="350" ry="250" fill="#3b82f6" opacity="0.08"/> <ellipse cx="200" cy="500" rx="280" ry="200" fill="#8b5cf6" opacity="0.06"/> <rect x="48" y="48" width="1104" height="534" rx="12" fill="#ffffff" fill-opacity="0.03" stroke="#ffffff" stroke-opacity="0.08"/> <text x="80" y="90" fill="#93c5fd" font-size="14" font-family="PingFang SC, Microsoft YaHei, sans-serif" letter-spacing="6">FULL HOUSE PACKAGE</text> <text x="80" y="130" fill="#e2e8f0" font-size="30" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-weight="700" letter-spacing="4">全屋硬装特惠</text> <text x="80" y="220" fill="#f8fafc" font-size="52" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-weight="800">100㎡以内</text> <!-- 价格艺术字 --> <text x="80" y="330" fill="none" stroke="#4338ca" stroke-width="3" font-size="96" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-weight="900" filter="url(#glow)">38888</text> <text x="80" y="330" fill="url(#price)" font-size="96" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-weight="900">38888</text> <text x="500" y="320" fill="#e2e8f0" font-size="40" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-weight="700">元起</text> <line x1="80" y1="360" x2="560" y2="360" stroke="url(#accent)" stroke-width="2" opacity="0.5"/> <text x="80" y="400" fill="#cbd5e1" font-size="22" font-family="PingFang SC, Microsoft YaHei, sans-serif">包工包料 · 水电泥瓦木油全包 · 透明报价</text> <text x="80" y="440" fill="#94a3b8" font-size="20" font-family="PingFang SC, Microsoft YaHei, sans-serif">尚润装饰品质保障 · 隐蔽工程5年质保</text> <!-- 右侧套餐示意 --> <rect x="720" y="100" width="400" height="400" rx="12" fill="#0f172a" stroke="url(#accent)" stroke-width="1.5"/> <rect x="720" y="100" width="400" height="80" rx="12" fill="url(#shine)"/> <text x="920" y="155" text-anchor="middle" fill="url(#accent)" font-size="24" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-weight="700">硬装全包套餐</text> <rect x="760" y="200" width="320" height="14" rx="4" fill="url(#accent)" opacity="0.7"/> <text x="780" y="212" fill="#0f172a" font-size="11" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-weight="700">水电改造</text> <rect x="760" y="240" width="280" height="14" rx="4" fill="#6366f1" opacity="0.6"/> <text x="780" y="252" fill="#e2e8f0" font-size="11" font-family="PingFang SC, Microsoft YaHei, sans-serif">泥瓦工程</text> <rect x="760" y="280" width="300" height="14" rx="4" fill="#8b5cf6" opacity="0.55"/> <text x="780" y="292" fill="#e2e8f0" font-size="11" font-family="PingFang SC, Microsoft YaHei, sans-serif">木工工程</text> <rect x="760" y="320" width="260" height="14" rx="4" fill="#a78bfa" opacity="0.5"/> <text x="780" y="332" fill="#e2e8f0" font-size="11" font-family="PingFang SC, Microsoft YaHei, sans-serif">油漆工程</text> <rect x="760" y="360" width="240" height="14" rx="4" fill="#c4b5fd" opacity="0.45"/> <text x="780" y="372" fill="#e2e8f0" font-size="11" font-family="PingFang SC, Microsoft YaHei, sans-serif">辅材人工</text> <text x="920" y="450" text-anchor="middle" fill="#64748b" font-size="16" font-family="PingFang SC, Microsoft YaHei, sans-serif">一口价 · 无隐藏增项</text> <rect x="0" y="560" width="1200" height="70" fill="#030712" opacity="0.8"/> <text x="600" y="605" text-anchor="middle" fill="#93c5fd" font-size="18" font-family="PingFang SC, Microsoft YaHei, sans-serif" letter-spacing="4">尚润装饰 · 品质装修</text> </svg>`,

  'activity-model-room-v2.svg': `<?xml version="1.0" encoding="UTF-8"?> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" fill="none"> <defs> <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"> <stop offset="0%" stop-color="#0c0f14"/> <stop offset="40%" stop-color="#141c28"/> <stop offset="100%" stop-color="#1a1410"/> </linearGradient> <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"> <stop offset="0%" stop-color="#f5e6c8"/> <stop offset="35%" stop-color="#d4af37"/> <stop offset="70%" stop-color="#f0d78c"/> <stop offset="100%" stop-color="#b8860b"/> </linearGradient> <linearGradient id="goldH" x1="0" y1="0" x2="1" y2="0"> <stop offset="0%" stop-color="#c9a227"/> <stop offset="50%" stop-color="#f5e6c8"/> <stop offset="100%" stop-color="#c9a227"/> </linearGradient> <linearGradient id="shine" x1="0" y1="0" x2="0" y2="1"> <stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/> <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/> </linearGradient> <linearGradient id="roomGlow" x1="0.5" y1="0" x2="0.5" y2="1"> <stop offset="0%" stop-color="#d4af37" stop-opacity="0.35"/> <stop offset="100%" stop-color="#d4af37" stop-opacity="0"/> </linearGradient> <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"> <path d="M40 0H0V40" fill="none" stroke="#d4af37" stroke-opacity="0.06"/> </pattern> </defs> <rect width="1200" height="630" fill="url(#bg)"/> <rect width="1200" height="630" fill="url(#grid)"/> <ellipse cx="980" cy="520" rx="420" ry="280" fill="#d4af37" opacity="0.06"/> <ellipse cx="200" cy="80" rx="300" ry="180" fill="#3b82f6" opacity="0.05"/> <rect x="680" y="40" width="480" height="550" rx="4" fill="#1a2230" stroke="url(#gold)" stroke-width="1.5"/> <rect x="700" y="60" width="440" height="300" fill="#0f1419"/> <rect x="700" y="60" width="440" height="300" fill="url(#roomGlow)"/> <rect x="720" y="80" width="180" height="260" fill="none" stroke="#d4af37" stroke-width="2" opacity="0.5"/> <line x1="810" y1="80" x2="810" y2="340" stroke="#d4af37" stroke-width="1" opacity="0.3"/> <line x1="720" y1="180" x2="900" y2="180" stroke="#d4af37" stroke-width="1" opacity="0.3"/> <rect x="940" y="80" width="180" height="260" fill="none" stroke="#d4af37" stroke-width="2" opacity="0.35"/> <path d="M720 400 Q860 360 1000 400 L1000 480 Q860 520 720 480 Z" fill="#2a3544" stroke="#d4af37" stroke-width="1" opacity="0.6"/> <rect x="760" y="420" width="200" height="40" rx="8" fill="#d4af37" opacity="0.15"/> <line x1="860" y1="60" x2="860" y2="120" stroke="#d4af37" stroke-width="2" opacity="0.6"/> <ellipse cx="860" cy="130" rx="40" ry="12" fill="url(#gold)" opacity="0.7"/> <text x="56" y="52" fill="#d4af37" font-size="13" font-family="PingFang SC, Microsoft YaHei, sans-serif" letter-spacing="8" opacity="0.85">SHOWROOM INVITATION</text> <text x="56" y="88" fill="#94a3b8" font-size="22" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-weight="500" letter-spacing="4">样板间限时开放</text> <path d="M48 110 L48 130 L68 130" stroke="url(#gold)" stroke-width="2" fill="none"/> <path d="M620 110 L620 130 L600 130" stroke="url(#gold)" stroke-width="2" fill="none"/> <text x="56" y="195" fill="none" stroke="#b8860b" stroke-width="2.5" font-size="54" font-family="PingFang SC, Microsoft YaHei, STSong, serif" font-weight="900" letter-spacing="2">京润现代城</text> <text x="56" y="195" fill="url(#goldH)" font-size="54" font-family="PingFang SC, Microsoft YaHei, STSong, serif" font-weight="900" letter-spacing="2">京润现代城</text> <text x="56" y="255" fill="none" stroke="#8b6914" stroke-width="2" font-size="42" font-family="PingFang SC, Microsoft YaHei, serif" font-weight="800" letter-spacing="12">四号院</text> <text x="56" y="255" fill="url(#gold)" font-size="42" font-family="PingFang SC, Microsoft YaHei, serif" font-weight="800" letter-spacing="12">四号院</text> <line x1="56" y1="278" x2="200" y2="278" stroke="url(#goldH)" stroke-width="1.5" opacity="0.7"/> <circle cx="340" cy="278" r="4" fill="#d4af37"/> <line x1="360" y1="278" x2="620" y2="278" stroke="url(#goldH)" stroke-width="1.5" opacity="0.4"/> <text x="56" y="345" fill="none" stroke="#b8860b" stroke-width="2.5" font-size="48" font-family="PingFang SC, Microsoft YaHei, STSong, serif" font-weight="900" letter-spacing="3">梧桐苑</text> <text x="56" y="345" fill="url(#goldH)" font-size="48" font-family="PingFang SC, Microsoft YaHei, STSong, serif" font-weight="900" letter-spacing="3">梧桐苑</text> <text x="56" y="400" fill="none" stroke="#8b6914" stroke-width="2" font-size="38" font-family="PingFang SC, Microsoft YaHei, serif" font-weight="800" letter-spacing="8">惠民馨园</text> <text x="56" y="400" fill="url(#gold)" font-size="38" font-family="PingFang SC, Microsoft YaHei, serif" font-weight="800" letter-spacing="8">惠民馨园</text> <rect x="56" y="430" width="320" height="72" rx="4" fill="#1a2230" stroke="url(#gold)" stroke-width="1.5"/> <rect x="56" y="430" width="320" height="36" rx="4" fill="url(#shine)"/> <text x="76" y="462" fill="#f5e6c8" font-size="20" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-weight="600">签约立享</text> <text x="76" y="492" fill="url(#gold)" font-size="32" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-weight="900">3000元装修优惠</text> <rect x="0" y="560" width="1200" height="70" fill="#0a0a0f" opacity="0.85"/> <rect x="0" y="560" width="1200" height="1" fill="url(#goldH)" opacity="0.5"/> <text x="56" y="600" fill="#e2e8f0" font-size="18" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-weight="500">每小区仅限 </text> <text x="168" y="600" fill="url(#gold)" font-size="22" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-weight="900">5</text> <text x="188" y="600" fill="#e2e8f0" font-size="18" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-weight="500"> 个名额</text> <text x="320" y="600" fill="#64748b" font-size="18" font-family="PingFang SC, Microsoft YaHei, sans-serif">|</text> <text x="350" y="600" fill="#94a3b8" font-size="18" font-family="PingFang SC, Microsoft YaHei, sans-serif">扫码预约 · 实地参观 · 限时参与</text> <text x="900" y="600" fill="#d4af37" font-size="16" font-family="PingFang SC, Microsoft YaHei, sans-serif" letter-spacing="2">尚润装饰</text> </svg>`,

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
