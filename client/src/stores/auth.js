import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import request from '../utils/request'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const username = ref(localStorage.getItem('username') || '')

  const isLoggedIn = computed(() => !!token.value)

  async function login(u, p) {
    const res = await request.post('/auth/login', { username: u, password: p })
    if (res.code === 200) {
      token.value = res.data.token
      username.value = res.data.username
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('username', res.data.username)
    }
    return res
  }

  function logout() {
    token.value = ''
    username.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('username')
  }

  return { token, username, isLoggedIn, login, logout }
})
