import axios from 'axios'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  timeout: 10000
})

request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // FormData 必须由浏览器自动带 boundary；误设 multipart 会导致 nginx 400
  if (config.data instanceof FormData) {
    if (typeof config.headers?.setContentType === 'function') {
      config.headers.setContentType(undefined)
    } else {
      delete config.headers['Content-Type']
    }
  }
  return config
})

request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/admin/login'
    }
    return Promise.reject(error)
  }
)

export default request
