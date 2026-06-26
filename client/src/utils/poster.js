const POSTER_WIDTH = 750
const POSTER_HEIGHT = 1334
const BG_COLOR = '#09090b'

function resolveUrl(url) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  const base = typeof window !== 'undefined' ? window.location.origin : ''
  return `${base}${url.startsWith('/') ? url : `/${url}`}`
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
    img.src = resolveUrl(url)
  })
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas export failed'))),
      'image/png',
      1
    )
  })
}

export async function generateCasePoster(caseItem, options = {}) {
  const companyName = options.companyName || '尚润装饰'
  const slogan = options.slogan || '专注品质装修 · 值得信赖'
  const wechatQrUrl = options.wechatQrUrl || ''
  const siteLabel = options.siteLabel || '尚润装饰 · 品质装修'

  const canvas = document.createElement('canvas')
  canvas.width = POSTER_WIDTH
  canvas.height = POSTER_HEIGHT
  const ctx = canvas.getContext('2d')

  paintBackground(ctx)

  const topHeight = POSTER_HEIGHT * 0.38
  let headerDrawn = false

  if (caseItem?.image_url) {
    try {
      const img = await loadImage(caseItem.image_url)
      drawHeaderImage(ctx, img, topHeight)
      headerDrawn = true
    } catch {
      drawHeaderFallback(ctx, caseItem, topHeight)
    }
  } else {
    drawHeaderFallback(ctx, caseItem, topHeight)
  }

  if (headerDrawn) {
    const grad = ctx.createLinearGradient(0, topHeight * 0.45, 0, topHeight + 80)
    grad.addColorStop(0, 'rgba(9,9,11,0)')
    grad.addColorStop(1, BG_COLOR)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, POSTER_WIDTH, topHeight + 80)
  }

  await drawContent(ctx, caseItem, topHeight, { companyName, slogan, wechatQrUrl, siteLabel })

  return canvasToBlob(canvas)
}

function paintBackground(ctx) {
  ctx.fillStyle = BG_COLOR
  ctx.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT)
}

function drawHeaderImage(ctx, img, topHeight) {
  const imgAspect = img.width / img.height
  let sx = 0
  let sy = 0
  let sw = img.width
  let sh = img.height
  if (imgAspect > POSTER_WIDTH / topHeight) {
    sw = img.height * (POSTER_WIDTH / topHeight)
    sx = (img.width - sw) / 2
  } else {
    sh = img.width * (topHeight / POSTER_WIDTH)
    sy = (img.height - sh) / 2
  }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, POSTER_WIDTH, topHeight)
}

function drawHeaderFallback(ctx, caseItem, topHeight) {
  const palettes = [
    ['#1e3a5f', '#3b1c5e', '#1a0a2e'],
    ['#1c3d2f', '#0f2922', '#0a1f15'],
    ['#4a1942', '#2d1b4e', '#1a0a2e'],
  ]
  const palette = palettes[(caseItem?.id || 0) % palettes.length]
  const grad = ctx.createLinearGradient(0, 0, POSTER_WIDTH, topHeight)
  grad.addColorStop(0, palette[0])
  grad.addColorStop(0.55, palette[1])
  grad.addColorStop(1, palette[2])
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, POSTER_WIDTH, topHeight)

  ctx.fillStyle = 'rgba(255,255,255,0.08)'
  for (let i = 0; i < 12; i++) {
    ctx.beginPath()
    ctx.arc(
      (i * 97 + 40) % POSTER_WIDTH,
      (i * 53 + 20) % topHeight,
      24 + (i % 4) * 14,
      0,
      Math.PI * 2
    )
    ctx.fill()
  }

  if (caseItem?.icon) {
    ctx.font = '120px "Apple Color Emoji", "Segoe UI Emoji", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(caseItem.icon, POSTER_WIDTH / 2, topHeight * 0.55)
  }
}

async function drawContent(ctx, caseItem, contentStartY, meta) {
  const centerX = POSTER_WIDTH / 2
  const { companyName, slogan, wechatQrUrl, siteLabel } = meta

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 52px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(companyName, centerX, contentStartY + 60)

  ctx.fillStyle = 'rgba(255,255,255,0.72)'
  ctx.font = '26px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillText(slogan, centerX, contentStartY + 108)

  const lineY = contentStartY + 145
  drawAccentLine(ctx, centerX, lineY)

  if (caseItem?.tag) {
    ctx.fillStyle = 'rgba(59,130,246,0.25)'
    const tag = caseItem.tag
    ctx.font = '24px "PingFang SC", "Microsoft YaHei", sans-serif'
    const tagWidth = ctx.measureText(tag).width + 36
    roundRect(ctx, centerX - tagWidth / 2, lineY + 18, tagWidth, 42, 21)
    ctx.fill()
    ctx.fillStyle = '#93c5fd'
    ctx.fillText(tag, centerX, lineY + 48)
  }

  const title = caseItem?.title || '精选案例'
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 38px "PingFang SC", "Microsoft YaHei", sans-serif'
  wrapText(ctx, title, centerX, lineY + 110, POSTER_WIDTH - 120, 50)

  const desc = caseItem?.description || ''
  const truncatedDesc = desc.length > 90 ? `${desc.slice(0, 90)}...` : desc
  if (truncatedDesc) {
    ctx.fillStyle = 'rgba(255,255,255,0.68)'
    ctx.font = '26px "PingFang SC", "Microsoft YaHei", sans-serif'
    wrapText(ctx, truncatedDesc, centerX, lineY + 175, POSTER_WIDTH - 140, 40)
  }

  const bottomY = POSTER_HEIGHT - 250
  drawAccentLine(ctx, centerX, bottomY)

  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.font = '24px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('扫码了解更多', centerX, bottomY + 42)

  const qrSize = 140
  const qrX = centerX - qrSize / 2
  const qrY = bottomY + 62

  if (wechatQrUrl) {
    try {
      const qrImg = await loadImage(wechatQrUrl)
      ctx.fillStyle = '#ffffff'
      roundRect(ctx, qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 12)
      ctx.fill()
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)
    } catch {
      drawQrPlaceholder(ctx, centerX, qrX, qrY, qrSize)
    }
  } else {
    drawQrPlaceholder(ctx, centerX, qrX, qrY, qrSize)
  }

  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.font = '20px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillText(siteLabel, centerX, POSTER_HEIGHT - 36)
}

function drawAccentLine(ctx, centerX, y) {
  const lineGrad = ctx.createLinearGradient(centerX - 100, 0, centerX + 100, 0)
  lineGrad.addColorStop(0, 'rgba(59,130,246,0)')
  lineGrad.addColorStop(0.5, 'rgba(59,130,246,0.85)')
  lineGrad.addColorStop(1, 'rgba(139,92,246,0)')
  ctx.fillStyle = lineGrad
  ctx.fillRect(centerX - 120, y, 240, 2)
}

function drawQrPlaceholder(ctx, centerX, qrX, qrY, qrSize) {
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'
  ctx.lineWidth = 2
  ctx.setLineDash([6, 4])
  ctx.strokeRect(qrX, qrY, qrSize, qrSize)
  ctx.setLineDash([])
  ctx.fillStyle = 'rgba(255,255,255,0.28)'
  ctx.font = '22px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('微信咨询', centerX, qrY + qrSize / 2 + 8)
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const chars = text.split('')
  let line = ''
  let currentY = y

  for (let i = 0; i < chars.length; i++) {
    const testLine = line + chars[i]
    if (ctx.measureText(testLine).width > maxWidth && i > 0) {
      ctx.fillText(line, x, currentY)
      line = chars[i]
      currentY += lineHeight
    } else {
      line = testLine
    }
  }
  if (line) ctx.fillText(line, x, currentY)
}
