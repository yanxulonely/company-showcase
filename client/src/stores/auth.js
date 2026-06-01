import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import request from '../utils/request'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const username = ref(localStorage.getItem('username') || '')
  const role = ref(localStorage.getItem('role') || '')
  const displayName = ref(localStorage.getItem('displayName') || '')

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => role.value === 'admin')
  const isEmployee = computed(() => role.value === 'admin' || role.value === 'employee')

  async function login(u, p) {
    const res = await request.post('/auth/login', { username: u, password: p })
    if (res.code === 200) {
      token.value = res.data.token
      username.value = res.data.username
      role.value = res.data.role
      displayName.value = res.data.display_name || ''
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('username', res.data.username)
      localStorage.setItem('role', res.data.role)
      localStorage.setItem('displayName', res.data.display_name || '')
    }
    return res
  }

  function logout() {
    token.value = ''
    username.value = ''
    role.value = ''
    displayName.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('role')
    localStorage.removeItem('displayName')
  }

  return { token, username, role, displayName, isLoggedIn, isAdmin, isEmployee, login, logout }
})
