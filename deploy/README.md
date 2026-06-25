# 快速部署（当前版本：SQLite + 本机 uploads）

适用于先上线验证，后续再按 `PRODUCTION.md` 迁移 MySQL + COS。

## 前置条件

1. 腾讯云轻量服务器公网 IP（如 `106.54.246.16`）
2. 防火墙已放行 **80**、**22**
3. 本机可 SSH 登录：`ssh root@你的IP`

## 一键部署（在本机 Mac 项目根目录）

```bash
./deploy/deploy-remote.sh root@106.54.246.16
```

按提示输入 root 密码。脚本会自动：

- 打包上传代码到 `/opt/company-showcase`
- 安装 Nginx、PM2、编译 better-sqlite3
- 构建前端、`pm2` 启动 API
- 配置 Nginx 反代 `/api` 与 `/uploads`

## 部署后访问

| 地址 | 说明 |
|------|------|
| `http://<IP>/` | 营销首页 |
| `http://<IP>/#/admin/login` | 管理后台（admin / admin123） |
| `http://<IP>/#/employee` | 员工资料库 |

**重要：** 在服务器后台重新上传轮播图，本机测试数据不会同步。

## 服务器上常用命令

```bash
pm2 status
pm2 logs company-api
pm2 restart company-api
nginx -t && systemctl restart nginx
curl http://127.0.0.1:3000/api/health
```

## 更新发版

```bash
./deploy/deploy-remote.sh root@106.54.246.16
```

已有 `server/.env` 与 `data.db` 会保留。

## 故障排查

| 现象 | 处理 |
|------|------|
| 网站打不开 | 检查防火墙 80 端口、 `systemctl status nginx` |
| 后台上传后前台无图 | F12 看请求是否打到 `http://<IP>/api/upload`，不是 localhost |
| API 502 | `pm2 logs company-api`，检查 3000 端口 |
| 磁盘满 | 清理 OpenClaw 或扩容系统盘 |

完整规划见 [PRODUCTION.md](./PRODUCTION.md)。
