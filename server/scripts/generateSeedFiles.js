const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const PptxGenJS = require('pptxgenjs');

const SEED_DIR = path.join(__dirname, '..', 'seed-materials');

const FONT_CANDIDATES = [
  'C:\\Windows\\Fonts\\simhei.ttf',
  'C:\\Windows\\Fonts\\SIMHEI.TTF',
  'C:\\Windows\\Fonts\\simkai.ttf',
  'C:\\Windows\\Fonts\\SIMKAI.TTF'
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function resolveFontPath() {
  return FONT_CANDIDATES.find(p => fs.existsSync(p)) || null;
}

function writePdf(filePath, title, lines) {
  const fontPath = resolveFontPath();
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  if (fontPath) {
    doc.registerFont('Chinese', fontPath);
    doc.font('Chinese');
  }

  doc.fontSize(22).text(title, { underline: true });
  doc.moveDown();
  doc.fontSize(14);
  lines.forEach(line => {
    doc.text(`• ${line}`, { lineGap: 6 });
  });
  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}

async function writePptx(filePath, title, bullets) {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = '尚润装饰';
  pptx.title = title;

  const slide = pptx.addSlide();
  slide.background = { color: 'FFFFFF' };
  slide.addText(title, {
    x: 0.6,
    y: 0.5,
    w: 8.8,
    h: 1,
    fontSize: 28,
    bold: true,
    color: '1F2937',
    fontFace: 'Microsoft YaHei'
  });
  slide.addText(
    bullets.map(line => ({ text: line, options: { bullet: true, breakLine: true } })),
    {
      x: 0.8,
      y: 1.8,
      w: 8.4,
      h: 4.5,
      fontSize: 18,
      color: '374151',
      fontFace: 'Microsoft YaHei',
      lineSpacingMultiple: 1.2
    }
  );

  await pptx.writeFile({ fileName: filePath });
}

async function main() {
  ensureDir(SEED_DIR);

  await writePdf(
    path.join(SEED_DIR, '装修材料清单-常用品牌.pdf'),
    '装修材料清单 · 常用品牌',
    ['瓷砖：东鹏 / 马可波罗', '地板：大自然 / 圣象', '涂料：立邦 / 多乐士', '卫浴：九牧 / 箭牌']
  );

  await writePdf(
    path.join(SEED_DIR, '施工工艺说明-水电泥木油.pdf'),
    '施工工艺说明 · 水电泥木油',
    ['水电：横平竖直，强弱电分开', '泥瓦：平整度 ≤ 3mm', '木工：环保 E1 级板材', '油漆：两遍底漆，一遍面漆']
  );

  await writePdf(
    path.join(SEED_DIR, '报价参考-整装预算模板.pdf'),
    '报价参考 · 整装预算模板',
    ['设计费：按平米计算', '主材费：品牌直供', '人工费：按工序报价', '管理费：含监理验收']
  );

  await writePptx(
    path.join(SEED_DIR, '尚润装饰-销售话术培训.pptx'),
    '尚润装饰 · 销售话术培训',
    ['开场：了解客户需求与预算', '需求挖掘：关注风格 / 功能 / 工期', '方案介绍：突出尚润工艺与材料优势', '异议处理：价格 / 工期 / 环保问题', '促成签约：明确下一步行动']
  );

  await writePptx(
    path.join(SEED_DIR, '尚润装饰-公司简介.pptx'),
    '尚润装饰 · 公司简介',
    ['专注品质装修，值得信赖', '设计 + 施工 + 材料一站式服务', '自有施工团队，严格施工标准', '一线品牌建材，环保达标保障']
  );

  console.log('Seed files generated in', SEED_DIR);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
