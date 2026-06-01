# Company Showcase 项目 - 编码任务

你是一个资深全栈开发者。请根据以下 coding plan 实现公司展示网站。

## 项目概述
公司展示网站，用于售前/客户展示。前台展示 + 后台管理。

## 技术栈
- 前端：Vue3 + Vite + Vue Router + Pinia + Axios
- 后端：Node.js + Express + SQLite (better-sqlite3) + JWT + multer
- 样式：纯 CSS + CSS 变量（复用设计原型）

## 项目目录
`~/Documents/GitHub/company-showcase/`

## 设计原型
`~/.openclaw/canvas/showcase/index-v3.html`

## 开发步骤

### Step 1: 项目初始化
1. 在 `company-showcase/` 目录下创建 `client/` 和 `server/` 子目录
2. 在 `client/` 目录初始化 Vue3 + Vite 项目
3. 在 `server/` 目录初始化 Node.js 项目
4. 安装所有依赖

### Step 2: 后端基础
1. 创建数据库连接和建表脚本
2. 实现统一响应格式和错误处理
3. 实现 JWT 认证中间件
4. 实现管理员登录 API

### Step 3: 后端 API
1. 实现案例 CRUD API
2. 实现能力 CRUD API
3. 实现评价 CRUD API
4. 实现标准 CRUD API
5. 实现联系表单 API
6. 实现设置 API
7. 实现文档上传 API

### Step 4: 前端基础
1. 配置路由（前台 + 后台）
2. 创建 Pinia stores
3. 封装 Axios
4. 实现 composables

### Step 5: 前端特效组件
1. CursorGlow
2. FloatingShapes
3. PageLoader
4. ThemeToggle
5. BackToTop

### Step 6: 前端布局组件
1. Navbar
2. Footer

### Step 7: 前台页面
1. 所有 section 组件
2. HomePage 组装

### Step 8: 后台页面
1. LoginPage
2. DashboardPage
3. 各管理页面

## 要求
1. 按步骤逐步实现，每完成一步汇报
2. 严格复用设计原型的样式（参考 index-v3.html）
3. 确保所有 API 正常工作
4. 确保前后端联调正常
5. 完成后总结修改了哪些文件

## 注意事项
- 使用 `<script setup>` 语法
- 使用 CSS 变量实现主题切换
- 数据库启动时自动建表
- 默认管理员账号：admin / admin123
- API 响应格式：`{ code: 200, message: 'success', data: {...} }`
