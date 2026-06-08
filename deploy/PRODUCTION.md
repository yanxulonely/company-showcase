# 尚润装饰展示站 — 生产环境部署规划

目标：将项目做成可长期对外使用的正式系统，采用 **域名 + HTTPS + MySQL + 腾讯云 COS** 架构。

## 目标架构

```
用户浏览器
    ↓  https://www.yourdomain.com
Nginx（443 HTTPS）
    ├─ /           → Vue 前端 dist
    └─ /api        → Node.js Express
                         ├─ MySQL（业务数据）
                         └─ COS（图片 / PPT / PDF，DB 存公网 URL）
```

| 组件 | 职责 |
|------|------|
| 域名 + HTTPS | 正式公网入口（内地服务器需 ICP 备案） |
| Nginx | 反代 API、托管前端，不对外暴露 3000 端口 |
| MySQL | 用户、轮播、案例、设计师、资料元数据等 |
| COS | 图片、PPT、PDF；数据库只存 `https://...` URL |
| Node.js | API、鉴权、上传逻辑 |

---

## 阶段划分（建议 4～6 周）

| 阶段 | 内容 | 耗时（估） | 可并行 |
|------|------|------------|--------|
| 0 | 准备与清理 | 1 天 | — |
| 1 | 基础设施（MySQL、COS） | 2～3 天 | 与阶段 2 |
| 2 | 代码改造（MySQL + COS） | 5～7 天 | 与备案并行 |
| 3 | 部署上线 | 1～2 天 | 备案通过后 |
| 4 | 内容录入与验收 | 2～3 天 | — |
| 5 | 运维与备份 | 持续 | — |

> ICP 备案约 10～20 工作日，从阶段 0 立即提交，与开发并行。

---

## 阶段 0：准备与清理

### 0.1 服务器

- [ ] 停掉 / 卸载 OpenClaw（龙虾），释放内存与磁盘
- [ ] 磁盘至少预留 15GB
- [ ] 记录公网 IP、地域（建议与 COS 同区，如上海）
- [ ] 防火墙放行：22、80、443（勿对公网开放 3000、3306）

### 0.2 域名

- [ ] 腾讯云购买域名（`.com` 或 `.cn`）
- [ ] 完成域名实名认证

### 0.3 对象存储（轻量赠送 50GB）

- [ ] 控制台 → 轻量服务器 → 对象存储 → 开通
- [ ] 创建存储桶，地域与服务器一致
- [ ] 访问权限：公有读私有写（网站图片需公网访问）
- [ ] 记录：桶名、地域、SecretId / SecretKey（建议 CAM 子账号）

### 0.4 ICP 备案

- [ ] 腾讯云备案 → 新建备案 → 关联轻量服务器
- [ ] 等待审核（备案期间可用 IP 内测，不能用域名解析内地机）

---

## 阶段 1：基础设施

### 1.1 MySQL（同机，推荐）

```bash
apt update && apt install -y mysql-server
mysql_secure_installation

mysql -u root -p <<'EOF'
CREATE DATABASE company_showcase DEFAULT CHARSET utf8mb4;
CREATE USER 'showcase'@'localhost' IDENTIFIED BY '强密码';
GRANT ALL ON company_showcase.* TO 'showcase'@'localhost';
FLUSH PRIVILEGES;
EOF
```

- 2核2G 去掉龙虾后同机可运行
- 勿对公网开放 3306
- 业务量大后可迁 TencentDB

### 1.2 目录规划

```
/opt/company-showcase/
├── client/dist/
├── server/
│   └── .env          # 生产配置，不进 Git
└── backups/
```

### 1.3 生产环境变量 `server/.env`

```env
PORT=3000
NODE_ENV=production
JWT_SECRET=随机长字符串

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=showcase
DB_PASSWORD=xxx
DB_NAME=company_showcase

COS_SECRET_ID=xxx
COS_SECRET_KEY=xxx
COS_BUCKET=company-showcase-assets
COS_REGION=ap-shanghai
COS_PUBLIC_BASE=https://<桶名>.cos.ap-shanghai.myqcloud.com
```

---

## 阶段 2：代码改造

### 已完成

- [x] 前端 API 改为 `/api`（`client/src/utils/request.js`）
- [x] 联系人导出改为相对路径
- [x] `deploy/install.sh`、`deploy-remote.sh`、`nginx.conf`

### 待完成：MySQL

- [ ] 安装 `mysql2`，替换 `better-sqlite3`
- [ ] 新建 `server/db/mysql.js` 连接池
- [ ] 建表 SQL 改为 MySQL 语法
- [ ] 各路由 `db.prepare()` 改为 mysql2 查询
- [ ] 种子数据写入 MySQL
- [ ] `scripts/migrate-sqlite-to-mysql.js`（可选，迁移本地 SQLite 数据）

### 待完成：COS

- [ ] 安装 `cos-nodejs-sdk-v5`
- [ ] `server/lib/cos.js` 封装上传
- [ ] 改 `routes/upload.js`、`routes/materials.js`
- [ ] 数据库统一存完整 HTTPS URL
- [ ] `server/index.js` 加载 `dotenv`

### 待完成：其他

- [ ] 生产环境强制自定义 `JWT_SECRET`、修改默认 admin 密码
- [ ] 案例管理后台补充图片上传（`CasesManage.vue`）
- [ ] 健康检查可增加 DB / COS 连通性

---

## 阶段 3：部署上线（备案通过后）

```bash
# 本地一键部署（需先 git pull 最新代码）
./deploy/deploy-remote.sh root@<服务器IP>

# 或服务器手动
cd /opt && git clone https://github.com/yanxulonely/company-showcase.git
bash company-showcase/deploy/install.sh <域名或IP>
```

### Nginx + HTTPS

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d www.yourdomain.com -d yourdomain.com
```

文件走 COS 公网 URL 后，通常无需 Nginx 反代 `/uploads`。

### 部署后检查

| 检查项 | 方式 |
|--------|------|
| API | `curl https://www.yourdomain.com/api/health` |
| 上传 | F12 确认 `POST https://域名/api/upload`，返回 COS URL |
| 持久化 | 换电脑 / 换浏览器仍能看到图片 |

---

## 阶段 4：内容录入

在**线上后台**重新录入，勿依赖本机 `data.db` / `uploads/`：

1. 系统设置（公司名、电话、地址）
2. 轮播图（上传至 COS）
3. 案例（封面图）
4. 设计师（头像）
5. 能力 / 评价 / 标准
6. 员工资料库
7. 修改 admin 密码，创建员工账号

验收：手机 4G、HTTPS、备案号展示、员工端资料预览。

---

## 阶段 5：运维

| 项 | 做法 |
|----|------|
| MySQL 备份 | 每日 `mysqldump` → `backups/`，可选同步 COS |
| 发版 | `git pull` → `client npm run build` → `pm2 restart company-api` |
| 安全 | 强密码、HTTPS、防火墙、JWT_SECRET |

---

## 费用粗算（年）

| 项目 | 费用 |
|------|------|
| 轻量服务器 | 已购 |
| 域名 | ~60 元 |
| 备案 / SSL | 免费 |
| MySQL 同机 | 0 元 |
| COS | 50GB 赠送额度内，外网流量按量 |
| **合计** | 约 60～150 元/年（不含服务器） |

---

## 推荐时间线

| 周次 | 运维 / 业务 | 开发 |
|------|-------------|------|
| 第 1 周 | 买域名、提交备案、开 COS、清服务器 | MySQL 建表与连接层 |
| 第 2 周 | 提供 COS 密钥（仅服务器 .env） | 上传改 COS、路由改 MySQL |
| 第 3 周 | 备案前 IP 内测 | 案例上传、迁移脚本 |
| 第 4 周 | DNS + HTTPS | 部署联调 |
| 第 5 周 | 后台录入真实内容 | 验收与备份脚本 |

---

## 常见问题

**Q：只有 IP 能访问吗？**  
A：可以。备案期间用 `http://<IP>/` 内测；正式对外建议域名 + HTTPS。

**Q：本机上传的图为什么线上没有？**  
A：旧版前端 API 写死 `localhost:3000`，请求打到本机。已改为 `/api`，部署后须在**服务器后台**重新上传。

**Q：COS 挂载和 SDK 直传选哪个？**  
A：本规划采用 **SDK 直传 + DB 存公网 URL**，利于多机与 CDN；挂载适合零代码改造，二选一即可。

**Q：2核2G 能跑 MySQL 吗？**  
A：可以。去掉龙虾后，Node + MySQL + Nginx 内存足够。
