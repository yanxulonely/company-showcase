require('dotenv').config();

const mysql = require('mysql2/promise');
const deasync = require('deasync');
const bcrypt = require('bcryptjs');
const { seedDefaultMaterials, syncPptPdfPreviews } = require('./seedMaterials');

let pool;

function awaitSync(promise) {
  let done = false;
  let result;
  let error;
  promise.then((r) => { result = r; done = true; }).catch((e) => { error = e; done = true; });
  deasync.loopWhile(() => !done);
  if (error) throw error;
  return result;
}

function normalizeRow(row) {
  if (!row) return row;
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    out[k] = typeof v === 'bigint' ? Number(v) : v;
  }
  return out;
}

function normalizeRows(rows) {
  return rows.map(normalizeRow);
}

function prepare(sql) {
  return {
    get(...params) {
      const [rows] = awaitSync(pool.execute(sql, params));
      return normalizeRow(rows[0]);
    },
    all(...params) {
      const [rows] = awaitSync(pool.execute(sql, params));
      return normalizeRows(rows);
    },
    run(...params) {
      const [result] = awaitSync(pool.execute(sql, params));
      return {
        lastInsertRowid: Number(result.insertId),
        changes: result.affectedRows
      };
    }
  };
}

const db = {
  prepare,
  exec(sql) {
    awaitSync(pool.query(sql));
  }
};

function createPool() {
  pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'showcase',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'company_showcase',
    waitForConnections: true,
    connectionLimit: 10,
    charset: 'utf8mb4'
  });
}

function createTables() {
  const statements = [
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'user',
      display_name VARCHAR(255),
      phone VARCHAR(50),
      is_active TINYINT DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      \`key\` VARCHAR(255) UNIQUE NOT NULL,
      value TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS cases (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      tag VARCHAR(100),
      icon VARCHAR(50),
      image_url TEXT,
      external_url TEXT,
      sort_order INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS capabilities (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      icon VARCHAR(50),
      sort_order INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      company VARCHAR(255),
      content TEXT,
      rating INT DEFAULT 5,
      avatar_bg INT DEFAULT 1,
      sort_order INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS standards (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL DEFAULT 'execution',
      items TEXT,
      sort_order INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS contacts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      company VARCHAR(255),
      contact_info TEXT,
      message TEXT,
      status VARCHAR(50) DEFAULT 'pending',
      note TEXT,
      designer_id INT,
      designer_name VARCHAR(255),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS banners (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255),
      subtitle VARCHAR(255),
      image_url TEXT,
      sort_order INT DEFAULT 0,
      is_active TINYINT DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS material_categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      sort_order INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS materials (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      category_id INT,
      tags TEXT,
      file_url TEXT,
      file_type VARCHAR(50),
      original_filename VARCHAR(255),
      pdf_url TEXT,
      pdf_filename VARCHAR(255),
      is_pinned TINYINT DEFAULT 0,
      visibility VARCHAR(50) DEFAULT 'employee',
      sort_order INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES material_categories(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS designers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      title VARCHAR(255),
      bio TEXT,
      photo_url TEXT,
      styles TEXT,
      years_experience INT DEFAULT 0,
      project_count INT DEFAULT 0,
      slogan TEXT,
      featured_case_ids TEXT,
      sort_order INT DEFAULT 0,
      is_active TINYINT DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS activities (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      summary VARCHAR(500),
      content TEXT,
      cover_image_url TEXT,
      location VARCHAR(255),
      start_time DATETIME,
      end_time DATETIME,
      status VARCHAR(20) DEFAULT 'draft',
      sort_order INT DEFAULT 0,
      view_count INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
  ];

  for (const sql of statements) {
    db.exec(sql);
  }
}

function initDatabase() {
  createPool();
  createTables();

  const admin = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  if (!admin) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO users (username, password, role, display_name) VALUES (?, ?, ?, ?)').run('admin', hash, 'admin', '管理员');
  } else {
    db.prepare("UPDATE users SET role = 'admin', display_name = COALESCE(display_name, '管理员') WHERE username = 'admin'").run();
  }

  const settingsCount = Number(db.prepare('SELECT COUNT(*) as count FROM settings').get().count);
  if (settingsCount === 0) {
    const insertSetting = db.prepare('INSERT INTO settings (`key`, value) VALUES (?, ?)');
    insertSetting.run('company_name', '尚润装饰');
    insertSetting.run('company_slogan', '专注品质装修，为您打造理想家园');
    insertSetting.run('hero_title', '用心装修每一个家<br><span class=\'gradient-text\'>尚润装饰 值得信赖</span>');
    insertSetting.run('hero_desc', '尚润装饰专注室内外装修设计与施工，拥有多年行业经验，严选材料、精工细作，为您提供一站式装修解决方案。');
    insertSetting.run('contact_address', '请在后台设置公司地址');
    insertSetting.run('contact_phone', '请在后台设置联系电话');
    insertSetting.run('contact_email', '请在后台设置联系邮箱');
    insertSetting.run('business_hours', '周一至周五 9:00 - 18:00');
    insertSetting.run('wechat_qr_url', '/uploads/seed/wechat-qr-placeholder.svg');
    insertSetting.run('site_qr_url', '/uploads/seed/site-qr.png');
    insertSetting.run('footer_text', '© 2026 尚润装饰. All rights reserved.');
    insertSetting.run('slogan', '专注品质装修，值得信赖');
    insertSetting.run('module_visibility', JSON.stringify({
      hero: true, stats: true, cases: true, activities: true,
      designers: true, capabilities: true, reviews: true,
      standards: true, contact: true,
    }));
  }

  const moduleVis = db.prepare('SELECT value FROM settings WHERE `key` = ?').get('module_visibility');
  if (!moduleVis) {
    db.prepare('INSERT INTO settings (`key`, value) VALUES (?, ?)').run(
      'module_visibility',
      JSON.stringify({
        hero: true, stats: true, cases: true, activities: true,
        designers: true, capabilities: true, reviews: true,
        standards: true, contact: true,
      })
    );
  }

  const casesCount = Number(db.prepare('SELECT COUNT(*) as count FROM cases').get().count);
  if (casesCount === 0) {
    const insertCase = db.prepare(
      'INSERT INTO cases (title, description, tag, icon, image_url, sort_order) VALUES (?, ?, ?, ?, ?, ?)'
    );
    insertCase.run(
      '现代简约 · 三室两厅',
      '120㎡现代简约风格，整体以白色和原木色为主调，简洁大方，适合年轻家庭。',
      '现代简约', '🏠', '/uploads/seed/case-modern.jpg', 1
    );
    insertCase.run(
      '新中式 · 四室两厅',
      '160㎡新中式风格，融入传统中式元素，沉稳大气，彰显文化底蕴。',
      '新中式', '🏡', '/uploads/seed/case-chinese.jpg', 2
    );
    insertCase.run(
      '轻奢风格 · 复式',
      '200㎡轻奢风格复式楼，金属质感与大理石搭配，品质生活从家开始。',
      '轻奢', '🏢', '/uploads/seed/case-luxury.jpg', 3
    );
  }

  const capsCount = Number(db.prepare('SELECT COUNT(*) as count FROM capabilities').get().count);
  if (capsCount === 0) {
    const insertCap = db.prepare('INSERT INTO capabilities (title, description, icon, sort_order) VALUES (?, ?, ?, ?)');
    insertCap.run('室内设计', '专业设计团队，量身定制装修方案，从现代简约到新中式，满足您的个性化需求。', '🎨', 1);
    insertCap.run('精工施工', '自有施工团队，严格遵循施工标准，水电/泥瓦/木工/油漆全流程把控。', '🔨', 2);
    insertCap.run('材料严选', '一线品牌建材直供，环保达标，品质有保障，让您装修更放心。', '🏗️', 3);
    insertCap.run('全屋定制', '橱柜、衣柜、鞋柜等全屋家具定制，空间利用最大化，风格统一协调。', '🏠', 4);
    insertCap.run('软装搭配', '窗帘、灯具、家具、饰品一站式选购，专业软装设计师为您搭配。', '🛋️', 5);
    insertCap.run('售后保障', '隐蔽工程5年质保，整体工程2年质保，24小时响应售后问题。', '🛡️', 6);
  }

  const designersCount = Number(db.prepare('SELECT COUNT(*) as count FROM designers').get().count);
  if (designersCount === 0) {
    const insertDesigner = db.prepare(`
      INSERT INTO designers (
        name, title, bio, photo_url, styles, years_experience, project_count,
        slogan, featured_case_ids, sort_order, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);
    insertDesigner.run(
      '林晓雯', '首席设计师',
      '国家注册室内设计师，擅长现代简约与轻奢风格，注重空间采光与收纳规划，善于在有限面积内实现功能与美感平衡。',
      '/uploads/seed/designer-1.jpg', JSON.stringify(['现代简约', '轻奢']), 8, 120,
      '让家成为生活的延伸，而不是简单的样板间', JSON.stringify([1, 3]), 1
    );
    insertDesigner.run(
      '陈宇航', '资深设计师',
      '深耕新中式与混搭风格，熟悉本地户型改造要点，从动线、材料到软装提供一站式方案，沟通耐心、落地细致。',
      '/uploads/seed/designer-2.jpg', JSON.stringify(['新中式', '现代简约']), 6, 85,
      '传统韵味与现代舒适，可以兼得', JSON.stringify([2]), 2
    );
  }

  const reviewsCount = Number(db.prepare('SELECT COUNT(*) as count FROM reviews').get().count);
  if (reviewsCount === 0) {
    const insertReview = db.prepare('INSERT INTO reviews (name, company, content, rating, avatar_bg, sort_order) VALUES (?, ?, ?, ?, ?, ?)');
    insertReview.run('张先生', '明昊嘉苑业主', '尚润装饰的施工非常规范，材料都是正品，设计师也很耐心地帮我调整方案，最终效果超出预期！', 5, 1, 1);
    insertReview.run('李女士', '锦绣花园业主', '从设计到施工全程跟进，有问题及时沟通解决，工期也没有拖延，非常满意。', 5, 2, 2);
    insertReview.run('王先生', '东方家园业主', '报价透明，没有隐藏费用，施工质量很好，特别是水电改造做得很专业。', 5, 3, 3);
  }

  const stdCount = Number(db.prepare('SELECT COUNT(*) as count FROM standards').get().count);
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

  const bannersCount = Number(db.prepare('SELECT COUNT(*) as count FROM banners').get().count);
  if (bannersCount === 0) {
    const insertBanner = db.prepare('INSERT INTO banners (title, subtitle, image_url, sort_order) VALUES (?, ?, ?, ?)');
    insertBanner.run('用心装修每一个家', '尚润装饰，品质生活从家开始', '/uploads/seed/banner-1.jpg', 1);
    insertBanner.run('精工细作 品质保障', '自有施工团队，严格施工标准，让您装修更放心', '/uploads/seed/banner-2.jpg', 2);
  }

  const catCount = Number(db.prepare('SELECT COUNT(*) as count FROM material_categories').get().count);
  if (catCount === 0) {
    const insertCat = db.prepare('INSERT INTO material_categories (name, sort_order) VALUES (?, ?)');
    insertCat.run('装修材料清单', 1);
    insertCat.run('施工工艺说明', 2);
    insertCat.run('报价参考与预算', 3);
    insertCat.run('培训课件与话术', 4);
  }

  const activitiesCount = Number(db.prepare('SELECT COUNT(*) as count FROM activities').get().count);
  syncSeedActivities(db, activitiesCount === 0);

  seedDefaultMaterials(db);
  syncPptPdfPreviews(db);
}

const SEED_ACTIVITIES = [
  {
    title: '国庆家装大促 · 1元定金抵1000',
    summary: '国庆限时钜惠！1元抢定名额，签约立抵1000元，更享免费量房+专属设计方案',
    content: `<p><strong>🇨🇳 国庆七天，装修省钱七天！</strong></p>
<p>尚润装饰国庆家装大促火热开启，预约即享多重好礼：</p>
<ul>
<li><strong>1元定金抵1000元</strong> — 线上/到店支付1元锁定优惠名额，签约装修合同直接抵扣1000元</li>
<li><strong>免费上门量房</strong> — 专业设计师免费上门，精准测量户型</li>
<li><strong>免费设计方案</strong> — 量房后3天内出具专属装修方案</li>
<li><strong>材料升级礼</strong> — 签约即享指定品牌瓷砖/地板升级优惠</li>
<li><strong>施工质保延长</strong> — 活动期间签约，隐蔽工程质保延长至5年</li>
</ul>
<p>活动名额有限，先到先得！详情咨询门店或在线预约。</p>
<p><em>* 1元定金不可退，签约后可抵扣；未签约可在活动结束后7日内申请退还。最终解释权归尚润装饰所有。</em></p>`,
    cover_image_url: '/uploads/seed/activity-national-day.svg',
    location: '尚润装饰各门店 / 线上预约',
    start_time: '2026-08-18 00:00:00',
    end_time: '2026-10-07 23:59:59',
    status: 'published',
    sort_order: 2,
  },
  {
    title: '全屋硬装特惠 · 100㎡内38888元起',
    summary: '包工包料全屋硬装套餐，100平米以内仅需38888元，透明报价、无隐藏增项',
    content: `<p><strong>🏠 全屋硬装一口价，省心更省钱！</strong></p>
<p>尚润装饰推出全屋硬装特惠套餐，100㎡以内基础硬装全包仅需 <strong>38888元</strong> 起，适合刚需装修、二手房翻新家庭。</p>
<p><strong>套餐包含（包工包料）：</strong></p>
<ul>
<li>水电改造 — 全屋电路水路规范施工，打压测试合格</li>
<li>泥瓦工程 — 墙地砖铺贴、厨卫防水、墙面粉刷</li>
<li>木工工程 — 吊顶、柜体基层、门窗套制作安装</li>
<li>油漆工程 — 墙面腻子、乳胶漆多遍涂刷</li>
<li>辅材人工 — 水泥沙石、胶水腻子等辅材及人工费全包</li>
</ul>
<p><strong>我们的承诺：</strong></p>
<ul>
<li>报价透明，合同价即结算价，拒绝恶意增项</li>
<li>一线品牌辅材，环保达标</li>
<li>自有施工团队，全程监理验收</li>
<li>隐蔽工程5年质保，整体工程2年质保</li>
</ul>
<p>超出100㎡部分按标准单价另行核算，欢迎预约免费量房获取精准报价。</p>
<p><em>* 具体套餐内容以到店签约合同为准，特殊户型（复式、别墅等）不适用本套餐。</em></p>`,
    cover_image_url: '/uploads/seed/activity-hard-deco.svg',
    location: '尚润装饰展厅 · 全市可服务',
    start_time: '2026-07-01 00:00:00',
    end_time: '2026-12-31 23:59:59',
    status: 'published',
    sort_order: 3,
  },
  {
    title: '样板间限时邀约 · 京润现代城四号院 · 梧桐苑惠 · 民馨园',
    summary: '三大小区样板间同步开放，每小区仅限5个名额，扫码预约即刻享3000元装修优惠',
    content: `<p><strong>🏡 实景样板间开放，所见即所得！</strong></p>
<p>尚润装饰携 <strong>京润现代城四号院</strong>、<strong>梧桐苑惠</strong>、<strong>民馨园</strong> 三大小区样板间同步开放，邀请您亲临现场，感受真实装修效果与品质工艺。</p>
<p><strong>限时福利：</strong></p>
<ul>
<li><strong>立刻享受3000元优惠</strong> — 扫码预约并到店参观，签约装修合同立减3000元</li>
<li><strong>每小区仅限5个名额</strong> — 京润现代城四号院、梧桐苑惠、民馨园各5席，共15席，先到先得</li>
<li><strong>免费专属讲解</strong> — 设计师现场讲解户型方案与材料工艺</li>
<li><strong>一对一量房咨询</strong> — 参观后可预约免费上门量房，获取专属报价</li>
</ul>
<p><strong>参与方式：</strong></p>
<ul>
<li>扫描活动二维码或点击分享链接预约</li>
<li>到店参观样板间并登记信息</li>
<li>名额确认后享受3000元签约优惠</li>
</ul>
<p>名额有限，限时开放，欢迎邻里业主预约参观！</p>
<p><em>* 优惠仅限活动期间预约并签约的客户；每小区5个名额，满额即止；最终解释权归尚润装饰所有。</em></p>`,
    cover_image_url: '/uploads/seed/activity-model-room-v3.svg',
    location: '京润现代城四号院 · 梧桐苑惠 · 民馨园',
    start_time: '2026-08-18 00:00:00',
    end_time: '2026-09-18 23:59:59',
    status: 'published',
    sort_order: 1,
  },
];

function syncSeedActivities(db, insertIfEmpty) {
  const insertActivity = db.prepare(`
    INSERT INTO activities (
      title, summary, content, cover_image_url, location,
      start_time, end_time, status, sort_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const updateActivity = db.prepare(`
    UPDATE activities SET
      title=?, summary=?, content=?, cover_image_url=?, location=?,
      start_time=?, end_time=?, status=?, sort_order=?
    WHERE id=?
  `);
  const insertActivityWithId = db.prepare(`
    INSERT INTO activities (
      id, title, summary, content, cover_image_url, location,
      start_time, end_time, status, sort_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  if (insertIfEmpty) {
    for (const a of SEED_ACTIVITIES) {
      insertActivity.run(
        a.title, a.summary, a.content, a.cover_image_url, a.location,
        a.start_time, a.end_time, a.status, a.sort_order
      );
    }
    return;
  }

  SEED_ACTIVITIES.forEach((a, index) => {
    const id = index + 1;
    const existing = db.prepare('SELECT id FROM activities WHERE id = ?').get(id);
    if (existing) {
      updateActivity.run(
        a.title, a.summary, a.content, a.cover_image_url, a.location,
        a.start_time, a.end_time, a.status, a.sort_order, id
      );
    } else {
      insertActivityWithId.run(
        id, a.title, a.summary, a.content, a.cover_image_url, a.location,
        a.start_time, a.end_time, a.status, a.sort_order
      );
    }
  });
}

module.exports = { db, initDatabase };
