#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/opt/company-showcase"
SERVER_NAME="${1:-_}"
JWT_SECRET="${JWT_SECRET:-$(openssl rand -hex 32)}"

echo "==> 安装系统依赖"
if command -v apt-get >/dev/null 2>&1; then
  apt-get update -qq
  apt-get install -y -qq nginx sqlite3 curl
elif command -v yum >/dev/null 2>&1; then
  yum install -y nginx sqlite curl
else
  echo "不支持的系统，请手动安装 nginx、sqlite3、curl"
  exit 1
fi

echo "==> 安装 Node.js 20（如未安装）"
if ! command -v node >/dev/null 2>&1 || [[ "$(node -v | cut -d. -f1 | tr -d v)" -lt 18 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y -qq nodejs
fi

echo "==> 安装 PM2"
npm install -g pm2

echo "==> 部署应用目录: ${APP_DIR}"
mkdir -p "${APP_DIR}"

echo "==> 安装后端依赖"
cd "${APP_DIR}/server"
npm install --production

echo "==> 构建前端"
cd "${APP_DIR}/client"
npm install
npm run build

echo "==> 准备数据目录"
mkdir -p "${APP_DIR}/server/uploads"
chmod 755 "${APP_DIR}/server/uploads"

echo "==> 配置 PM2"
cd "${APP_DIR}/server"
pm2 delete company-api 2>/dev/null || true
PORT=3000 JWT_SECRET="${JWT_SECRET}" pm2 start index.js --name company-api
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null | tail -1 | bash || true

echo "==> 配置 Nginx"
if [[ "${SERVER_NAME}" == "_" || -z "${SERVER_NAME}" ]]; then
  SERVER_NAME="_"
fi
sed "s/SERVER_NAME_PLACEHOLDER/${SERVER_NAME}/g" "${APP_DIR}/deploy/nginx.conf" > /etc/nginx/sites-available/company-showcase 2>/dev/null \
  || sed "s/SERVER_NAME_PLACEHOLDER/${SERVER_NAME}/g" "${APP_DIR}/deploy/nginx.conf" > /etc/nginx/conf.d/company-showcase.conf

if [[ -d /etc/nginx/sites-enabled ]]; then
  ln -sf /etc/nginx/sites-available/company-showcase /etc/nginx/sites-enabled/company-showcase
  rm -f /etc/nginx/sites-enabled/default
fi

nginx -t
systemctl enable nginx
systemctl reload nginx

echo ""
echo "部署完成！"
echo "  健康检查: curl http://127.0.0.1:3000/api/health"
echo "  访问地址: http://${SERVER_NAME}/"
echo "  管理后台: http://${SERVER_NAME}/#/admin/login  (admin / admin123)"
echo "  JWT_SECRET 已写入 PM2 环境，请记录: ${JWT_SECRET}"
