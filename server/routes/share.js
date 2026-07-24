const express = require('express');
const { db } = require('../db');

const router = express.Router();

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getSiteUrl(req) {
  return process.env.SITE_URL || `${req.protocol}://${req.get('host')}`;
}

function toAbsoluteUrl(base, url) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `${base.replace(/\/$/, '')}${url.startsWith('/') ? url : `/${url}`}`;
}

function formatDateTime(dt) {
  if (!dt) return '';
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return escapeHtml(String(dt));
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function renderNotFound(siteUrl, companyName) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>活动不存在 - ${escapeHtml(companyName)}</title>
  <meta property="og:title" content="活动不存在">
  <meta property="og:description" content="${escapeHtml(companyName)}">
</head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif;background:#09090b;color:#fafafa;margin:0;padding:40px 20px;text-align:center;">
  <h1 style="font-size:24px;margin-bottom:16px;">活动不存在或已下线</h1>
  <p style="color:#a1a1aa;margin-bottom:32px;">该活动可能已结束或尚未发布</p>
  <a href="${escapeHtml(siteUrl)}/" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:#fff;text-decoration:none;border-radius:8px;font-weight:500;">返回官网首页</a>
</body>
</html>`;
}

function renderActivityPage(activity, siteUrl, companyName) {
  const title = escapeHtml(activity.title);
  const summary = escapeHtml(activity.summary || activity.title);
  const coverUrl = toAbsoluteUrl(siteUrl, activity.cover_image_url);
  const shareUrl = `${siteUrl.replace(/\/$/, '')}/share/activities/${activity.id}`;
  const spaUrl = `${siteUrl.replace(/\/$/, '')}/#/activities/${activity.id}`;
  const contactUrl = `${siteUrl.replace(/\/$/, '')}/#/#contact`;

  const timeRange = [
    activity.start_time ? formatDateTime(activity.start_time) : '',
    activity.end_time ? formatDateTime(activity.end_time) : '',
  ].filter(Boolean).join(' ~ ');

  const location = escapeHtml(activity.location || '');
  const content = activity.content || '';

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - ${escapeHtml(companyName)}</title>
  <meta name="description" content="${summary}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${escapeHtml(shareUrl)}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${summary}">
  ${coverUrl ? `<meta property="og:image" content="${escapeHtml(coverUrl)}">` : ''}
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif; background: #09090b; color: #fafafa; line-height: 1.7; }
    .header { background: linear-gradient(135deg, #1e3a5f, #3b1c5e); padding: 24px 20px; text-align: center; }
    .header h1 { font-size: 22px; font-weight: 600; }
    .cover { width: 100%; max-height: 400px; object-fit: cover; display: block; }
    .container { max-width: 720px; margin: 0 auto; padding: 32px 20px 48px; }
    .title { font-size: 28px; font-weight: 700; margin-bottom: 16px; letter-spacing: -0.5px; }
    .meta { color: #a1a1aa; font-size: 14px; margin-bottom: 24px; }
    .meta span { display: block; margin-bottom: 6px; }
    .content { color: #d4d4d8; font-size: 16px; }
    .content p { margin-bottom: 16px; }
    .content ul, .content ol { margin: 0 0 16px 24px; }
    .content li { margin-bottom: 8px; }
    .actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 40px; padding-top: 32px; border-top: 1px solid #27272a; }
    .btn { display: inline-block; padding: 14px 28px; border-radius: 10px; font-size: 15px; font-weight: 600; text-decoration: none; text-align: center; }
    .btn-primary { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: #fff; flex: 1; min-width: 160px; }
    .btn-ghost { background: transparent; color: #a1a1aa; border: 1px solid #27272a; flex: 1; min-width: 160px; }
    .footer { text-align: center; color: #71717a; font-size: 13px; padding: 24px; }
  </style>
</head>
<body>
  <div class="header"><h1>${escapeHtml(companyName)}</h1></div>
  ${coverUrl ? `<img class="cover" src="${escapeHtml(coverUrl)}" alt="${title}">` : ''}
  <div class="container">
    <h2 class="title">${title}</h2>
    <div class="meta">
      ${timeRange ? `<span>📅 ${timeRange}</span>` : ''}
      ${location ? `<span>📍 ${location}</span>` : ''}
    </div>
    <div class="content">${content}</div>
    <div class="actions">
      <a class="btn btn-primary" href="${escapeHtml(spaUrl)}">进入官网查看</a>
      <a class="btn btn-ghost" href="${escapeHtml(contactUrl)}">联系咨询</a>
    </div>
  </div>
  <div class="footer">${escapeHtml(companyName)} · 品质装修</div>
</body>
</html>`;
}

router.get('/activities/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM activities WHERE id = ?').get(req.params.id);
  const siteUrl = getSiteUrl(req);
  const setting = db.prepare('SELECT value FROM settings WHERE `key` = ?').get('company_name');
  const companyName = setting?.value || '尚润装饰';

  if (!row || row.status === 'draft') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(404).send(renderNotFound(siteUrl, companyName));
  }

  db.prepare('UPDATE activities SET view_count = view_count + 1 WHERE id = ?').run(req.params.id);

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(renderActivityPage(row, siteUrl, companyName));
});

module.exports = router;
