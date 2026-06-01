import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '../utils/request'

export const useStandardsStore = defineStore('standards', () => {
  const items = ref([])

  async function fetchAll() {
    const res = await request.get('/standards')
    if (res.code === 200) items.value = res.data
  }

  async function create(data) {
    const res = await request.post('/standards', data)
    if (res.code === 200) items.value.push(res.data)
    return res
  }

  async function update(id, data) {
    const res = await request.put(`/standards/${id}`, data)
    if (res.code === 200) {
      const idx = items.value.findIndex(i => i.id === id)
      if (idx !== -1) items.value[idx] = res.data
    }
    return res
  }

  async function remove(id) {
    const res = await request.delete(`/standards/${id}`)
    if (res.code === 200) items.value = items.value.filter(i => i.id !== id)
    return res
  }

  return { items, fetchAll, create, update, remove }
})
