const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'data.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      display_name TEXT,
      phone TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      tag TEXT,
      icon TEXT,
      image_url TEXT,
      external_url TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS capabilities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      company TEXT,
      content TEXT,
      rating INTEGER DEFAULT 5,
      avatar_bg INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS standards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'execution',
      items TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      company TEXT,
      contact_info TEXT,
      message TEXT,
      status TEXT DEFAULT 'pending',
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS banners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      subtitle TEXT,
      image_url TEXT,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS material_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category_id INTEGER,
      tags TEXT,
      file_url TEXT,
      file_type TEXT,
      original_filename TEXT,
      is_pinned INTEGER DEFAULT 0,
      visibility TEXT DEFAULT 'employee',
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES material_categories(id)
    );
  `);

  // Migrate existing tables: add new columns if missing
  migrateTable();

  // Seed default admin
  const admin = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  if (!admin) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO users (username, password, role, display_name) VALUES (?, ?, ?, ?)').run('admin', hash, 'admin', '管理员');
  } else {
    // Ensure existing admin has role = 'admin'
    db.prepare("UPDATE users SET role = 'admin', display_name = COALESCE(display_name, '管理员') WHERE username = 'admin'").run();
  }

  // Seed default settings
  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM settings').get().count;
  if (settingsCount === 0) {
    const insertSetting = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
    insertSetting.run('company_name', '公司名称');
    insertSetting.run('company_slogan', '专注数字化转型，为企业创造可持续的技术价值');
    insertSetting.run('hero_title', '为企业构建<br>下一代数字基础设施');
    insertSetting.run('hero_desc', '我们专注于为全球企业提供前沿的技术解决方案，从架构设计到落地交付，助力客户在数字化浪潮中保持领先。');
    insertSetting.run('contact_address', '北京市朝阳区科技大厦');
    insertSetting.run('contact_phone', '400-888-8888');
    insertSetting.run('contact_email', 'contact@company.com');
    insertSetting.run('footer_text', '© 2026 公司名称. All rights reserved.');
  }

  // Seed default cases
  const casesCount = db.prepare('SELECT COUNT(*) as count FROM cases').get().count;
  if (casesCount === 0) {
    const insertCase = db.prepare('INSERT INTO cases (title, description, tag, icon, sort_order) VALUES (?, ?, ?, ?, ?)');
    insertCase.run('智能制造数字化转型', '为某大型汽车零部件企业构建智能工厂系统，实现生产效率提升 40%。', '制造业', '🏭', 1);
    insertCase.run('智慧医疗平台', '为三甲医院打造一站式智慧医疗解决方案，优化患者就医全流程。', '医疗健康', '🏥', 2);
    insertCase.run('全渠道零售系统', '打通线上线下数据孤岛，构建统一的全渠道运营中台。', '零售电商', '🛒', 3);
  }

  // Seed default capabilities
  const capsCount = db.prepare('SELECT COUNT(*) as count FROM capabilities').get().count;
  if (capsCount === 0) {
    const insertCap = db.prepare('INSERT INTO capabilities (title, description, icon, sort_order) VALUES (?, ?, ?, ?)');
    insertCap.run('软件开发', '企业级应用定制开发，从微服务架构到单体应用，覆盖全技术栈。', '💻', 1);
    insertCap.run('云原生架构', '基于 K8s 的云原生解决方案，实现弹性伸缩与高可用部署。', '☁️', 2);
    insertCap.run('AI 智能', '大模型应用开发，智能客服、文档分析、图像识别等场景落地。', '🤖', 3);
    insertCap.run('数据工程', '数据中台建设，实时数仓、数据治理、BI 可视化全链路支持。', '📊', 4);
    insertCap.run('安全合规', '等保合规、渗透测试、安全加固，保障企业数字资产安全。', '🔒', 5);
    insertCap.run('移动开发', 'iOS / Android / 小程序 / H5，跨平台一站式移动解决方案。', '📱', 6);
  }

  // Seed default reviews
  const reviewsCount = db.prepare('SELECT COUNT(*) as count FROM reviews').get().count;
  if (reviewsCount === 0) {
    const insertReview = db.prepare('INSERT INTO reviews (name, company, content, rating, avatar_bg, sort_order) VALUES (?, ?, ?, ?, ?, ?)');
    insertReview.run('张明辉', '某制造企业 CTO', '团队的技术实力和项目管理能力都非常出色，交付质量远超预期。特别是在架构设计阶段提出的优化建议，为我们节省了大量后期成本。', 5, 1, 1);
    insertReview.run('李婉清', '某科技公司 VP', '从需求沟通到上线运维，整个过程非常专业透明。响应速度快，问题解决及时，是值得信赖的长期合作伙伴。', 5, 2, 2);
    insertReview.run('王建国', '某互联网公司 技术总监', '帮助我们完成了核心系统的云原生改造，系统稳定性从 99.9% 提升到 99.99%，运维成本反而降低了 30%。', 5, 3, 3);
  }

  // Seed default standards
  const stdCount = db.prepare('SELECT COUNT(*) as count FROM standards').get().count;
  if (stdCount === 0) {
    const insertStd = db.prepare('INSERT INTO standards (title, type, items, sort_order) VALUES (?, ?, ?, ?)');
    insertStd.run('执行标准', 'execution', JSON.stringify([
      '需求调研与业务分析',
      '技术方案设计与评审',
      '敏捷开发与持续交付',
      '全流程质量保障体系',
      '上线支持与运维交接',
      '质保期免费维护服务'
    ]), 1);
    insertStd.run('报价标准', 'pricing', JSON.stringify([
      '按需定价，透明报价',
      '分阶段付款，降低风险',
      '免费需求评估与咨询',
      '灵活的合作模式',
      '增值服务按需选购',
      '长期合作优惠方案'
    ]), 2);
  }

  // Seed default banners
  const bannersCount = db.prepare('SELECT COUNT(*) as count FROM banners').get().count;
  if (bannersCount === 0) {
    const insertBanner = db.prepare('INSERT INTO banners (title, subtitle, image_url, sort_order) VALUES (?, ?, ?, ?)');
    insertBanner.run('数字化转型加速器', '助力企业快速实现数字化升级', '/uploads/default-banner-1.jpg', 1);
    insertBanner.run('云原生解决方案', '弹性架构，无限可能', '/uploads/default-banner-2.jpg', 2);
  }

  // Seed default material categories
  const catCount = db.prepare('SELECT COUNT(*) as count FROM material_categories').get().count;
  if (catCount === 0) {
    const insertCat = db.prepare('INSERT INTO material_categories (name, sort_order) VALUES (?, ?)');
    insertCat.run('产品手册', 1);
    insertCat.run('技术文档', 2);
    insertCat.run('案例方案', 3);
    insertCat.run('培训资料', 4);
  }
}

function migrateTable() {
  // Add columns to users if missing
  const userColumns = db.prepare("PRAGMA table_info(users)").all().map(c => c.name);
  if (!userColumns.includes('role')) {
    db.exec("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'");
  }
  if (!userColumns.includes('display_name')) {
    db.exec("ALTER TABLE users ADD COLUMN display_name TEXT");
  }
  if (!userColumns.includes('phone')) {
    db.exec("ALTER TABLE users ADD COLUMN phone TEXT");
  }
  if (!userColumns.includes('is_active')) {
    db.exec("ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1");
  }

  // Add columns to cases if missing
  const casesColumns = db.prepare("PRAGMA table_info(cases)").all().map(c => c.name);
  if (!casesColumns.includes('external_url')) {
    db.exec("ALTER TABLE cases ADD COLUMN external_url TEXT");
  }

  // Add columns to contacts if missing
  const contactsColumns = db.prepare("PRAGMA table_info(contacts)").all().map(c => c.name);
  if (!contactsColumns.includes('note')) {
    db.exec("ALTER TABLE contacts ADD COLUMN note TEXT");
  }
}

module.exports = { db, initDatabase };
