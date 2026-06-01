import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '../utils/request'

export const useUsersStore = defineStore('users', () => {
  const items = ref([])

  async function fetchAll(role) {
    const params = role ? { role } : {}
    const res = await request.get('/users', { params })
    if (res.code === 200) items.value = res.data
    return res
  }

  async function create(data) {
    const res = await request.post('/users', data)
    if (res.code === 200) items.value.unshift(res.data)
    return res
  }

  async function update(id, data) {
    const res = await request.put(`/users/${id}`, data)
    if (res.code === 200) {
      const idx = items.value.findIndex(i => i.id === id)
      if (idx !== -1) items.value[idx] = res.data
    }
    return res
  }

  async function remove(id) {
    const res = await request.delete(`/users/${id}`)
    if (res.code === 200) items.value = items.value.filter(i => i.id !== id)
    return res
  }

  async function toggle(id) {
    const res = await request.put(`/users/${id}/toggle`)
    if (res.code === 200) {
      const idx = items.value.findIndex(i => i.id === id)
      if (idx !== -1) items.value[idx] = res.data
    }
    return res
  }

  async function resetPassword(id, password) {
    const res = await request.put(`/users/${id}/reset-password`, { password })
    return res
  }

  return { items, fetchAll, create, update, remove, toggle, resetPassword }
})
