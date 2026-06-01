import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '../utils/request'

export const useReviewsStore = defineStore('reviews', () => {
  const items = ref([])

  async function fetchAll() {
    const res = await request.get('/reviews')
    if (res.code === 200) items.value = res.data
  }

  async function create(data) {
    const res = await request.post('/reviews', data)
    if (res.code === 200) items.value.push(res.data)
    return res
  }

  async function update(id, data) {
    const res = await request.put(`/reviews/${id}`, data)
    if (res.code === 200) {
      const idx = items.value.findIndex(i => i.id === id)
      if (idx !== -1) items.value[idx] = res.data
    }
    return res
  }

  async function remove(id) {
    const res = await request.delete(`/reviews/${id}`)
    if (res.code === 200) items.value = items.value.filter(i => i.id !== id)
    return res
  }

  return { items, fetchAll, create, update, remove }
})
