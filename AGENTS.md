# AGENTS.md

## Cursor Cloud specific instructions

### 产品概览

尚润装饰公司展示全栈应用：Vue 3 + Vite 前端（`client/`），Express 5 + SQLite 后端（`server/`）。无 monorepo 根 `package.json`，无 Docker/CI，无 ESLint 配置。

### 必需服务（本地开发 E2E）

| 服务 | 端口 | 启动命令 |
|------|------|----------|
| Express API | 3000 | `cd server && node index.js` |
| Vite 开发服务器 | 5173 | `cd client && npm run dev` |

SQLite（`server/data.db`）随 API 首次启动自动创建并种子化；无需单独进程。

前端 axios 直连 `http://localhost:3000/api`（见 `client/src/utils/request.js`），**API 必须先于或与 Vite 同时运行**。Vite 虽代理 `/api`，但直连仍依赖 3000 端口。

### 默认账号

- 管理员：`admin` / `admin123`（种子数据）
- 员工账号需在管理后台「用户管理」中创建（`role: employee`）

### 常用命令

依赖安装（见各目录 `package.json`）：

```bash
cd server && npm install
cd client && npm install
```

构建与预览（仅前端）：

```bash
cd client && npm run build
cd client && npm run preview
```

健康检查：`GET http://localhost:3000/api/health`

### 测试与 Lint

- 无 ESLint/Prettier
- `server` 的 `npm test` 仅为占位，会失败
- `client` 无测试脚本

验证方式：API `curl` + 浏览器访问 `http://localhost:5173/` 与 `http://localhost:5173/#/admin/login`。

### 可选依赖

- **LibreOffice**（Linux）：管理端上传 PPT/PPTX 时转 PDF 预览；未安装时上传仍可用，但可能缺少 PDF 预览
- 种子轮播图引用 `/uploads/default-banner-*.jpg`，仓库内无这些文件，前台横幅可能 404，需在后台重新上传

### 维护脚本（`server/scripts/`，无 npm script）

`node scripts/syncPdfPreviews.js`、`resyncMaterials.js`、`generateSeedFiles.js`

### 环境变量

`dotenv` 已安装但 `server/index.js` 未加载 `.env`。可用环境变量：`PORT`（默认 3000）、`JWT_SECRET`（默认见 `server/middleware/auth.js`）。
