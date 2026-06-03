import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '../utils/request'

export const useDesignersStore = defineStore('designers', () => {
  const items = ref([])

  async function fetchActive() {
    const res = await request.get('/designers/active')
    if (res.code === 200) items.value = res.data
    return res
  }

  async function fetchAll() {
    const res = await request.get('/designers')
    if (res.code === 200) items.value = res.data
    return res
  }

  async function create(data) {
    const res = await request.post('/designers', data)
    if (res.code === 200) items.value.push(res.data)
    return res
  }

  async function update(id, data) {
    const res = await request.put(`/designers/${id}`, data)
    if (res.code === 200) {
      const idx = items.value.findIndex(i => i.id === id)
      if (idx !== -1) items.value[idx] = res.data
    }
    return res
  }

  async function toggle(id) {
    const res = await request.put(`/designers/${id}/toggle`)
    if (res.code === 200) {
      const idx = items.value.findIndex(i => i.id === id)
      if (idx !== -1) items.value[idx] = res.data
    }
    return res
  }

  async function remove(id) {
    const res = await request.delete(`/designers/${id}`)
    if (res.code === 200) items.value = items.value.filter(i => i.id !== id)
    return res
  }

  return { items, fetchActive, fetchAll, create, update, toggle, remove }
})
