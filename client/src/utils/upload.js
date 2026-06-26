import request from './request'

/**
 * 上传文件到 /api/upload
 * 注意：不要手动设置 Content-Type，否则 multipart boundary 会丢失导致上传失败
 */
export async function uploadFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/upload', formData)
}

export function withCacheBust(url) {
  if (!url) return ''
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${Date.now()}`
}
