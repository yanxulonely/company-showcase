import request from './request'

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif']
const MAX_EDGE = 1920
const JPEG_QUALITY = 0.82
const MAX_BYTES = 900 * 1024

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('图片读取失败'))
    }
    img.src = url
  })
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('图片压缩失败'))),
      type,
      quality
    )
  })
}

/** 上传前压缩大图，减轻 COS 读写压力并加快加载 */
export async function prepareUploadFile(file) {
  if (!file || !IMAGE_TYPES.includes(file.type)) return file
  if (file.size <= MAX_BYTES) return file

  try {
    const img = await loadImageFromFile(file)
    const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height))
    const width = Math.max(1, Math.round(img.width * scale))
    const height = Math.max(1, Math.round(img.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, width, height)
    const blob = await canvasToBlob(canvas, 'image/jpeg', JPEG_QUALITY)
    const base = file.name.replace(/\.[^.]+$/, '') || 'image'
    return new File([blob], `${base}.jpg`, { type: 'image/jpeg' })
  } catch {
    return file
  }
}

export async function uploadFile(file) {
  const prepared = await prepareUploadFile(file)
  const formData = new FormData()
  formData.append('file', prepared)
  return request.post('/upload', formData, { timeout: 120000 })
}

export function withCacheBust(url) {
  if (!url) return ''
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${Date.now()}`
}
