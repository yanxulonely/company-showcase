#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/opt/company-showcase"
SERVER_NAME="${1:-_}"
ENV_FILE="${APP_DIR}/server/.env"

echo "==> 安装系统依赖"
if command -v apt-get >/dev/null 2>&1; then
  apt-get update -qq
  apt-get install -y -qq nginx mysql-server curl ca-certificates \
    build-essential python3 git
elif command -v yum >/dev/null 2>&1; then
  yum install -y nginx mysql-server curl ca-certificates git \
    gcc-c++ make python3
  systemctl enable nginx 2>/dev/null || true
else
  echo "不支持的系统，请手动安装 nginx、sqlite3、curl、gcc-c++"
  exit 1
fi

echo "==> 检查 Node.js"
install_node() {
  if command -v apt-get >/dev/null 2>&1; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y -qq nodejs
  elif command -v yum >/dev/null 2>&1; then
    curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
    yum install -y nodejs
  fi
}

if ! command -v node >/dev/null 2>&1; then
  install_node
else
  NODE_MAJOR="$(node -v | sed 's/v//' | cut -d. -f1)"
  if [[ "${NODE_MAJOR}" -lt 18 ]]; then
    echo "Node $(node -v) 版本过低，安装 Node 20..."
    install_node
  else
    echo "已安装 Node $(node -v)，跳过"
  fi
fi

echo "==> 安装 PM2"
if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2
fi

echo "==> 部署应用目录: ${APP_DIR}"
mkdir -p "${APP_DIR}"

echo "==> 配置 MySQL"
DB_NAME="${DB_NAME:-company_showcase}"
DB_USER="${DB_USER:-showcase}"
DB_PASS="${DB_PASSWORD:-$(openssl rand -hex 16)}"

mysql <<EOSQL
CREATE DATABASE IF NOT EXISTS ${DB_NAME} DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
EOSQL

echo "==> 安装后端依赖"
cd "${APP_DIR}/server"
npm install

echo "==> 构建前端"
cd "${APP_DIR}/client"
npm install
npm run build

echo "==> 准备数据目录"
mkdir -p "${APP_DIR}/server/uploads"
chmod 755 "${APP_DIR}/server/uploads" 2>/dev/null || true
chmod 755 /opt "${APP_DIR}" "${APP_DIR}/client" "${APP_DIR}/client/dist" 2>/dev/null || true
chmod -R a+rX "${APP_DIR}/client/dist"

echo "==> 写入生产环境配置"
if [[ ! -f "${ENV_FILE}" ]]; then
  JWT_SECRET="$(openssl rand -hex 32)"
  cat > "${ENV_FILE}" <<EOF
PORT=3000
NODE_ENV=production
JWT_SECRET=${JWT_SECRET}
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASS}
DB_NAME=${DB_NAME}
EOF
  chmod 600 "${ENV_FILE}"
  echo "已创建 ${ENV_FILE}"
  echo "JWT_SECRET=${JWT_SECRET}"
  echo "DB_PASSWORD=${DB_PASS}"
else
  echo "保留已有 ${ENV_FILE}，补充 MySQL 配置（若缺失）"
  grep -q '^DB_HOST=' "${ENV_FILE}" || cat >> "${ENV_FILE}" <<EOF
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASS}
DB_NAME=${DB_NAME}
EOF
fi

echo "==> 配置 PM2"
cd "${APP_DIR}/server"
pm2 delete company-api 2>/dev/null || true
pm2 start "${APP_DIR}/deploy/ecosystem.config.js"
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null | grep -E '^sudo' | bash || true

echo "==> 配置 Nginx"
if [[ "${SERVER_NAME}" == "_" || -z "${SERVER_NAME}" ]]; then
  SERVER_NAME="_"
fi
NGINX_CONF="/etc/nginx/conf.d/company-showcase.conf"
if [[ -d /etc/nginx/sites-available ]]; then
  NGINX_CONF="/etc/nginx/sites-available/company-showcase"
fi
sed "s/SERVER_NAME_PLACEHOLDER/${SERVER_NAME}/g" "${APP_DIR}/deploy/nginx.conf" > "${NGINX_CONF}"

if [[ -d /etc/nginx/sites-enabled ]]; then
  ln -sf /etc/nginx/sites-available/company-showcase /etc/nginx/sites-enabled/company-showcase
  rm -f /etc/nginx/sites-enabled/default
fi

# 避免与 OpenClaw 等默认站点冲突
if [[ -f /etc/nginx/conf.d/default.conf ]]; then
  mv /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf.bak 2>/dev/null || true
fi

nginx -t
systemctl enable nginx 2>/dev/null || true
systemctl restart nginx

echo ""
echo "=========================================="
echo "部署完成！"
echo "  健康检查: curl http://127.0.0.1:3000/api/health"
if [[ "${SERVER_NAME}" != "_" ]]; then
  echo "  访问地址: http://${SERVER_NAME}/"
  echo "  管理后台: http://${SERVER_NAME}/#/admin/login  (admin / admin123)"
else
  echo "  访问地址: http://<你的公网IP>/"
  echo "  管理后台: http://<你的公网IP>/#/admin/login  (admin / admin123)"
fi
echo "  上传目录: ${APP_DIR}/server/uploads"
echo "=========================================="
