import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '../utils/request'

export const useBannersStore = defineStore('banners', () => {
  const items = ref([])
  const activeItems = ref([])

  async function fetchAll() {
    const res = await request.get('/banners')
    if (res.code === 200) items.value = res.data
    return res
  }

  async function fetchActive() {
    const res = await request.get('/banners/active')
    if (res.code === 200) activeItems.value = res.data
    return res
  }

  async function create(data) {
    const res = await request.post('/banners', data)
    if (res.code === 200) items.value.push(res.data)
    return res
  }

  async function update(id, data) {
    const res = await request.put(`/banners/${id}`, data)
    if (res.code === 200) {
      const idx = items.value.findIndex(i => i.id === id)
      if (idx !== -1) items.value[idx] = res.data
    }
    return res
  }

  async function remove(id) {
    const res = await request.delete(`/banners/${id}`)
    if (res.code === 200) items.value = items.value.filter(i => i.id !== id)
    return res
  }

  async function toggle(id) {
    const res = await request.put(`/banners/${id}/toggle`)
    if (res.code === 200) {
      const idx = items.value.findIndex(i => i.id === id)
      if (idx !== -1) items.value[idx] = res.data
    }
    return res
  }

  return { items, activeItems, fetchAll, fetchActive, create, update, remove, toggle }
})
