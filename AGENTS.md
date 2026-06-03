# AGENTS.md

## Cursor Cloud specific instructions

### 产品概览

本仓库为 **尚润装饰** 公司展示站：Vue 3 前端（`client/`）+ Express 5 API（`server/`）。无根级 `package.json`，需在两个子目录分别安装依赖并启动进程。

| 路由 | 说明 |
|------|------|
| `http://localhost:5173/#/` | 对外营销首页（案例、能力、评价等，均依赖 API） |
| `http://localhost:5173/#/admin/login` | 管理后台（默认账号 `admin` / `admin123`） |
| `http://localhost:5173/#/employee` | 员工资料库 |

### 必跑服务

1. **API**：在 `server/` 下执行 `node index.js`（默认端口 **3000**）。启动时会通过 `db.js` 初始化 SQLite（`server/data.db`），无独立数据库进程。
2. **前端开发**：在 `client/` 下执行 `npm run dev`（默认 **5173**）。Vite 将 `/api` 与 `/uploads` 代理到 3000；`client/src/utils/request.js` 中 Axios 的 baseURL 也硬编码为 `http://localhost:3000/api`。

仅跑 API 可做 `GET /api/health` 等接口冒烟；完整浏览器 E2E 必须同时跑 API + Vite。

### 常用命令

| 目录 | 命令 | 说明 |
|------|------|------|
| `server/` | `npm install` | 安装依赖（含 native 模块 `better-sqlite3`） |
| `server/` | `node index.js` | 启动 API（`package.json` 无 `start` 脚本） |
| `client/` | `npm install` | 安装依赖 |
| `client/` | `npm run dev` | 开发服务器 |
| `client/` | `npm run build` | 生产构建（输出 `client/dist/`） |
| `client/` | `npm run preview` | 预览构建结果（仍需 API 在 3000） |

**Lint / 测试**：两包均未配置 ESLint 或有效单元测试；`server` 的 `npm test` 仅为占位脚本。

### 环境变量（可选）

| 变量 | 默认 | 用途 |
|------|------|------|
| `PORT` | `3000` | API 监听端口 |
| `JWT_SECRET` | 内置默认值 | JWT 签名（见 `server/middleware/auth.js`） |

`dotenv` 已安装但未在代码中 `config()`，一般无需 `.env` 即可本地开发。

### 非 obvious 说明

- **PPT→PDF**：上传/种子数据可能调用 `libreoffice --headless`；失败会被捕获，不影响多数 E2E。员工端仍可用 `@vue-office/pptx` 或已有 PDF 预览。
- **生产静态资源**：当前 Express **不**托管 `client/dist`；生产形态需自行反向代理或单独静态托管前端。
- **热更新**：修改 `server/` 代码后需重启 `node index.js`；`client/` 由 Vite HMR 自动刷新。
