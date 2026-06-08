#!/usr/bin/env bash
# 在本地 Mac 执行，自动上传代码并在腾讯云服务器上安装
# 用法: ./deploy/deploy-remote.sh root@106.54.248.18
set -euo pipefail

TARGET="${1:?用法: $0 root@服务器IP}"
SERVER_IP="${TARGET#*@}"
APP_DIR="/opt/company-showcase"
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> 打包项目（排除 node_modules、数据库）"
TMP_TAR="$(mktemp /tmp/showcase.XXXXXX.tar.gz)"
tar czf "${TMP_TAR}" \
  --exclude=node_modules \
  --exclude='*.db' \
  --exclude='*.db-shm' \
  --exclude='*.db-wal' \
  --exclude='.git' \
  -C "${ROOT_DIR}" .

echo "==> 上传到 ${TARGET}"
ssh "${TARGET}" "mkdir -p ${APP_DIR}"
scp "${TMP_TAR}" "${TARGET}:/tmp/showcase.tar.gz"
rm -f "${TMP_TAR}"

echo "==> 远程安装"
ssh "${TARGET}" bash -s "${SERVER_IP}" <<'REMOTE'
set -euo pipefail
APP_DIR="/opt/company-showcase"
SERVER_IP="$1"

mkdir -p "${APP_DIR}"
tar xzf /tmp/showcase.tar.gz -C "${APP_DIR}"
rm -f /tmp/showcase.tar.gz
chmod +x "${APP_DIR}/deploy/install.sh"
bash "${APP_DIR}/deploy/install.sh" "${SERVER_IP}"
REMOTE

echo ""
echo "部署完成，请访问: http://${SERVER_IP}/"
