const POSTER_WIDTH = 750
const POSTER_HEIGHT = 1334

export function generateCasePoster(caseItem) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    canvas.width = POSTER_WIDTH
    canvas.height = POSTER_HEIGHT
    const ctx = canvas.getContext('2d')

    if (caseItem?.image_url) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        drawWithImage(ctx, img, caseItem)
        canvas.toBlob((blob) => resolve(blob), 'image/png')
      }
      img.onerror = () => {
        drawWithoutImage(ctx, caseItem)
        canvas.toBlob((blob) => resolve(blob), 'image/png')
      }
      img.src = caseItem.image_url
    } else {
      drawWithoutImage(ctx, caseItem)
      canvas.toBlob((blob) => resolve(blob), 'image/png')
    }
  })
}

function drawWithImage(ctx, img, caseItem) {
  // Top 30%: cropped image as background
  const topHeight = POSTER_HEIGHT * 0.35
  const imgAspect = img.width / img.height
  let sx = 0, sy = 0, sw = img.width, sh = img.height
  if (imgAspect > POSTER_WIDTH / topHeight) {
    sw = img.height * (POSTER_WIDTH / topHeight)
    sx = (img.width - sw) / 2
  } else {
    sh = img.width * (topHeight / POSTER_WIDTH)
    sy = (img.height - sh) / 2
  }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, POSTER_WIDTH, topHeight)

  // Gradient overlay on image
  const grad = ctx.createLinearGradient(0, topHeight * 0.5, 0, topHeight)
  grad.addColorStop(0, 'rgba(9,9,11,0.0)')
  grad.addColorStop(1, 'rgba(9,9,11,0.95)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, POSTER_WIDTH, topHeight)

  drawContent(ctx, caseItem, topHeight)
}

function drawWithoutImage(ctx, caseItem) {
  // Gradient background
  const grad = ctx.createLinearGradient(0, 0, POSTER_WIDTH, POSTER_HEIGHT * 0.4)
  grad.addColorStop(0, '#1e3a5f')
  grad.addColorStop(0.5, '#3b1c5e')
  grad.addColorStop(1, '#1a0a2e')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT * 0.4)

  // Background pattern
  ctx.globalAlpha = 0.05
  for (let i = 0; i < 20; i++) {
    ctx.beginPath()
    ctx.arc(
      Math.random() * POSTER_WIDTH,
      Math.random() * POSTER_HEIGHT * 0.4,
      Math.random() * 60 + 20,
      0,
      Math.PI * 2
    )
    ctx.fillStyle = '#ffffff'
    ctx.fill()
  }
  ctx.globalAlpha = 1

  drawContent(ctx, caseItem, POSTER_HEIGHT * 0.35)
}

function drawContent(ctx, caseItem, contentStartY) {
  const centerX = POSTER_WIDTH / 2

  // Company name
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 56px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('尚润装饰', centerX, contentStartY + 80)

  // Slogan
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.font = '300 28px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillText('专注品质装修 · 值得信赖', centerX, contentStartY + 130)

  // Decorative line
  const lineY = contentStartY + 170
  const lineGrad = ctx.createLinearGradient(centerX - 100, 0, centerX + 100, 0)
  lineGrad.addColorStop(0, 'rgba(59,130,246,0)')
  lineGrad.addColorStop(0.5, 'rgba(59,130,246,0.8)')
  lineGrad.addColorStop(1, 'rgba(139,92,246,0)')
  ctx.fillStyle = lineGrad
  ctx.fillRect(centerX - 120, lineY, 240, 2)

  // Case title
  const title = caseItem?.title || '精选案例'
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 40px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.textAlign = 'center'
  wrapText(ctx, title, centerX, lineY + 70, POSTER_WIDTH - 120, 56)

  // Case description
  const desc = caseItem?.description || ''
  const truncatedDesc = desc.length > 80 ? desc.slice(0, 80) + '...' : desc
  if (truncatedDesc) {
    ctx.fillStyle = 'rgba(255,255,255,0.65)'
    ctx.font = '28px "PingFang SC", "Microsoft YaHei", sans-serif'
    const titleEndY = lineY + 70 + 60
    wrapText(ctx, truncatedDesc, centerX, titleEndY, POSTER_WIDTH - 140, 42)
  }

  // Bottom area
  const bottomY = POSTER_HEIGHT - 200

  // Bottom decorative line
  ctx.fillStyle = lineGrad
  ctx.fillRect(centerX - 120, bottomY, 240, 2)

  // "Scan to learn more"
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.font = '24px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('扫码了解更多', centerX, bottomY + 50)

  // QR placeholder area
  const qrSize = 120
  const qrX = centerX - qrSize / 2
  const qrY = bottomY + 70
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'
  ctx.lineWidth = 2
  ctx.setLineDash([6, 4])
  ctx.strokeRect(qrX, qrY, qrSize, qrSize)
  ctx.setLineDash([])
  ctx.fillStyle = 'rgba(255,255,255,0.25)'
  ctx.font = '20px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('二维码', centerX, qrY + qrSize / 2 + 6)

  // Footer
  ctx.fillStyle = 'rgba(255,255,255,0.3)'
  ctx.font = '20px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillText('尚润装饰 · shangrun', centerX, POSTER_HEIGHT - 40)
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const chars = text.split('')
  let line = ''
  let currentY = y

  for (let i = 0; i < chars.length; i++) {
    const testLine = line + chars[i]
    const metrics = ctx.measureText(testLine)
    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line, x, currentY)
      line = chars[i]
      currentY += lineHeight
    } else {
      line = testLine
    }
  }
  ctx.fillText(line, x, currentY)
}
