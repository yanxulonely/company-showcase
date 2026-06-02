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
    insertSetting.run('company_name', '尚润装饰');
    insertSetting.run('company_slogan', '专注品质装修，为您打造理想家园');
    insertSetting.run('hero_title', '用心装修每一个家<br><span class=\'gradient-text\'>尚润装饰 值得信赖</span>');
    insertSetting.run('hero_desc', '尚润装饰专注室内外装修设计与施工，拥有多年行业经验，严选材料、精工细作，为您提供一站式装修解决方案。');
    insertSetting.run('contact_address', '请在后台设置公司地址');
    insertSetting.run('contact_phone', '请在后台设置联系电话');
    insertSetting.run('contact_email', '请在后台设置联系邮箱');
    insertSetting.run('footer_text', '© 2026 尚润装饰. All rights reserved.');
    insertSetting.run('slogan', '专注品质装修，值得信赖');
  }

  // Seed default cases
  const casesCount = db.prepare('SELECT COUNT(*) as count FROM cases').get().count;
  if (casesCount === 0) {
    const insertCase = db.prepare('INSERT INTO cases (title, description, tag, icon, sort_order) VALUES (?, ?, ?, ?, ?)');
    insertCase.run('现代简约 · 三室两厅', '120㎡现代简约风格，整体以白色和原木色为主调，简洁大方，适合年轻家庭。', '现代简约', '🏠', 1);
    insertCase.run('新中式 · 四室两厅', '160㎡新中式风格，融入传统中式元素，沉稳大气，彰显文化底蕴。', '新中式', '🏡', 2);
    insertCase.run('轻奢风格 · 复式', '200㎡轻奢风格复式楼，金属质感与大理石搭配，品质生活从家开始。', '轻奢', '🏢', 3);
  }

  // Seed default capabilities
  const capsCount = db.prepare('SELECT COUNT(*) as count FROM capabilities').get().count;
  if (capsCount === 0) {
    const insertCap = db.prepare('INSERT INTO capabilities (title, description, icon, sort_order) VALUES (?, ?, ?, ?)');
    insertCap.run('室内设计', '专业设计团队，量身定制装修方案，从现代简约到新中式，满足您的个性化需求。', '🎨', 1);
    insertCap.run('精工施工', '自有施工团队，严格遵循施工标准，水电/泥瓦/木工/油漆全流程把控。', '🔨', 2);
    insertCap.run('材料严选', '一线品牌建材直供，环保达标，品质有保障，让您装修更放心。', '🏗️', 3);
    insertCap.run('全屋定制', '橱柜、衣柜、鞋柜等全屋家具定制，空间利用最大化，风格统一协调。', '🏠', 4);
    insertCap.run('软装搭配', '窗帘、灯具、家具、饰品一站式选购，专业软装设计师为您搭配。', '🛋️', 5);
    insertCap.run('售后保障', '隐蔽工程5年质保，整体工程2年质保，24小时响应售后问题。', '🛡️', 6);
  }

  // Seed default reviews
  const reviewsCount = db.prepare('SELECT COUNT(*) as count FROM reviews').get().count;
  if (reviewsCount === 0) {
    const insertReview = db.prepare('INSERT INTO reviews (name, company, content, rating, avatar_bg, sort_order) VALUES (?, ?, ?, ?, ?, ?)');
    insertReview.run('张先生', '明昊嘉苑业主', '尚润装饰的施工非常规范，材料都是正品，设计师也很耐心地帮我调整方案，最终效果超出预期！', 5, 1, 1);
    insertReview.run('李女士', '锦绣花园业主', '从设计到施工全程跟进，有问题及时沟通解决，工期也没有拖延，非常满意。', 5, 2, 2);
    insertReview.run('王先生', '东方家园业主', '报价透明，没有隐藏费用，施工质量很好，特别是水电改造做得很专业。', 5, 3, 3);
  }

  // Seed default standards
  const stdCount = db.prepare('SELECT COUNT(*) as count FROM standards').get().count;
  if (stdCount === 0) {
    const insertStd = db.prepare('INSERT INTO standards (title, type, items, sort_order) VALUES (?, ?, ?, ?)');
    insertStd.run('施工标准', 'execution', JSON.stringify([
      '水电改造：横平竖直，强弱电分开，水管打压试验合格',
      '泥瓦工程：墙面平整度≤3mm，地砖空鼓率≤5%',
      '木工工程：板材环保E1级以上，接缝严密',
      '油漆工程：墙面平整光滑，无色差、无流坠'
    ]), 1);
    insertStd.run('报价标准', 'pricing', JSON.stringify([
      '设计费：按㎡计算，免费量房出方案',
      '材料费：一线品牌直供，明码标价',
      '人工费：按工序报价，透明公开',
      '管理费：含全程监理、验收、保洁'
    ]), 2);
  }

  // Seed default banners
  const bannersCount = db.prepare('SELECT COUNT(*) as count FROM banners').get().count;
  if (bannersCount === 0) {
    const insertBanner = db.prepare('INSERT INTO banners (title, subtitle, image_url, sort_order) VALUES (?, ?, ?, ?)');
    insertBanner.run('用心装修每一个家', '尚润装饰，品质生活从家开始', '/uploads/default-banner-1.jpg', 1);
    insertBanner.run('精工细作 品质保障', '自有施工团队，严格施工标准，让您装修更放心', '/uploads/default-banner-2.jpg', 2);
  }

  // Seed default material categories
  const catCount = db.prepare('SELECT COUNT(*) as count FROM material_categories').get().count;
  if (catCount === 0) {
    const insertCat = db.prepare('INSERT INTO material_categories (name, sort_order) VALUES (?, ?)');
    insertCat.run('装修材料清单', 1);
    insertCat.run('施工工艺说明', 2);
    insertCat.run('报价参考与预算', 3);
    insertCat.run('培训课件与话术', 4);
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

  // Add columns to materials if missing
  const materialsColumns = db.prepare("PRAGMA table_info(materials)").all().map(c => c.name);
  if (!materialsColumns.includes('pdf_url')) {
    db.exec("ALTER TABLE materials ADD COLUMN pdf_url TEXT");
  }
  if (!materialsColumns.includes('pdf_filename')) {
    db.exec("ALTER TABLE materials ADD COLUMN pdf_filename TEXT");
  }
}

module.exports = { db, initDatabase };
