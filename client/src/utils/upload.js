const API_BASE = import.meta.env.VITE_API_BASE || '/api'

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

function isImageFile(file) {
  if (!file) return false
  if (IMAGE_TYPES.includes(file.type)) return true
  return /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(file.name || '')
}

/** 上传前压缩大图，减轻 COS 读写压力并加快加载 */
export async function prepareUploadFile(file) {
  if (!isImageFile(file)) return file
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

/**
 * 用原生 fetch 上传，避免 axios 误设 Content-Type 导致 nginx 400
 */
async function postFormData(path, formData, { timeout = 120000 } = {}) {
  const token = localStorage.getItem('token')
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers,
      body: formData,
      signal: controller.signal,
    })

    const contentType = res.headers.get('content-type') || ''
    const data = contentType.includes('application/json')
      ? await res.json()
      : { code: res.status, message: `上传失败 (${res.status})`, data: null }

    if (!res.ok) {
      const err = new Error(data.message || `上传失败 (${res.status})`)
      err.response = { status: res.status, data }
      throw err
    }
    return data
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('上传超时，请换小一点的图片或检查网络')
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}

export async function uploadFile(file) {
  const prepared = await prepareUploadFile(file)
  const formData = new FormData()
  formData.append('file', prepared)
  return postFormData('/upload', formData)
}

export async function uploadMaterialFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  return postFormData('/materials/upload', formData)
}

export function withCacheBust(url) {
  if (!url) return ''
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${Date.now()}`
}
