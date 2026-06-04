# AGENTS.md

## Cursor Cloud specific instructions

### 产品概览

尚润装饰公司展示全栈应用：Vue 3 + Vite 前端（`client/`），Express 5 + SQLite 后端（`server/`）。无 monorepo 根 `package.json`，无 Docker/CI，无 ESLint 配置。需在 `client/` 与 `server/` 分别安装依赖并启动进程。

| 路由 | 说明 |
|------|------|
| `http://localhost:5173/#/` | 对外营销首页（案例、设计师、能力、评价等，均依赖 API） |
| `http://localhost:5173/#/admin/login` | 管理后台（默认账号 `admin` / `admin123`） |
| `http://localhost:5173/#/employee` | 员工资料库 |

### 必跑服务（本地开发 E2E）

| 服务 | 端口 | 启动命令 |
|------|------|----------|
| Express API | 3000 | `cd server && node index.js` |
| Vite 开发服务器 | 5173 | `cd client && npm run dev` |

SQLite（`server/data.db`）随 API 启动时通过 `db.js` 初始化并种子化；无需单独数据库进程。

前端 axios 直连 `http://localhost:3000/api`（见 `client/src/utils/request.js`），**API 必须先于或与 Vite 同时运行**。Vite 虽代理 `/api` 与 `/uploads`，直连仍依赖 3000 端口。

仅跑 API 可做 `GET /api/health` 冒烟；完整浏览器 E2E 须同时跑 API + Vite。

### 默认账号

- 管理员：`admin` / `admin123`（种子数据）
- 员工账号需在管理后台「用户管理」中创建（`role: employee`）

### 常用命令

```bash
cd server && npm install
cd client && npm install
```

| 目录 | 命令 | 说明 |
|------|------|------|
| `server/` | `node index.js` | 启动 API（`package.json` 无 `start` 脚本） |
| `client/` | `npm run dev` | 开发服务器 |
| `client/` | `npm run build` | 生产构建（输出 `client/dist/`） |
| `client/` | `npm run preview` | 预览构建（仍需 API 在 3000） |

健康检查：`GET http://localhost:3000/api/health`

### 测试与 Lint

- 无 ESLint/Prettier
- `server` 的 `npm test` 仅为占位，会失败
- `client` 无测试脚本

验证：API `curl` + 浏览器访问 `http://localhost:5173/` 与 `http://localhost:5173/#/admin/login`。

### 环境变量（可选）

| 变量 | 默认 | 用途 |
|------|------|------|
| `PORT` | `3000` | API 监听端口 |
| `JWT_SECRET` | 内置默认值 | JWT 签名（见 `server/middleware/auth.js`） |

`dotenv` 已安装但 `server/index.js` 未加载 `.env`；一般无需 `.env` 即可本地开发。

### 非 obvious 说明

- **设计师模块**：前台 `#designers`，后台「设计师管理」；种子数据含 2 位示例设计师，可在后台改文案/头像。
- **PPT→PDF**：上传/种子可能调用 `libreoffice --headless` 或 Windows PowerPoint COM；失败会被捕获，不影响多数 E2E。员工端仍可用 `@vue-office/pptx` 或已有 PDF。
- **LibreOffice**（Linux）：管理端上传 PPT/PPTX 转 PDF 预览；未安装时上传仍可用，可能缺 PDF 预览。
- **生产静态资源**：Express **不**托管 `client/dist`；生产需反向代理或单独静态托管前端。
- **热更新**：改 `server/` 须重启 `node index.js`；`client/` 由 Vite HMR 刷新。
- 种子轮播图引用 `/uploads/default-banner-*.jpg`，仓库内可能无文件，前台横幅 404 时需在后台重新上传。

### 维护脚本（`server/scripts/`，无 npm script）

`node scripts/syncPdfPreviews.js`、`resyncMaterials.js`、`generateSeedFiles.js`
