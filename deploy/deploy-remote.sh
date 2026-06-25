#!/usr/bin/env bash
# 在本地 Mac 执行，自动上传代码并在腾讯云服务器上安装
# 用法: SSH_IDENTITY=deploy/.ssh/company.pem ./deploy/deploy-remote.sh ubuntu@106.54.246.16
set -euo pipefail

TARGET="${1:?用法: $0 root@服务器IP}"
SERVER_IP="${TARGET#*@}"
APP_DIR="/opt/company-showcase"
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SSH_OPTS=(-o StrictHostKeyChecking=accept-new -o ConnectTimeout=15)
if [[ -n "${SSH_IDENTITY:-}" ]]; then
  SSH_OPTS+=(-i "${SSH_IDENTITY}")
fi

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
ssh "${SSH_OPTS[@]}" "${TARGET}" "mkdir -p /tmp"
scp "${SSH_OPTS[@]}" "${TMP_TAR}" "${TARGET}:/tmp/showcase.tar.gz"
rm -f "${TMP_TAR}"

echo "==> 远程安装（可能需要几分钟，含 npm install 与前端构建）"
ssh "${SSH_OPTS[@]}" "${TARGET}" bash -s "${SERVER_IP}" "${APP_DIR}" <<'REMOTE'
set -euo pipefail
SERVER_IP="$1"
APP_DIR="$2"

sudo mkdir -p "${APP_DIR}"
sudo tar xzf /tmp/showcase.tar.gz -C "${APP_DIR}"
rm -f /tmp/showcase.tar.gz
sudo chmod +x "${APP_DIR}/deploy/install.sh"
sudo bash "${APP_DIR}/deploy/install.sh" "${SERVER_IP}"
REMOTE

echo ""
echo "部署完成，请访问: http://${SERVER_IP}/"
echo "管理后台: http://${SERVER_IP}/#/admin/login  (admin / admin123)"
echo "请在服务器后台重新上传轮播图等资源。"
