import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '../utils/request'

export const useMaterialCategoriesStore = defineStore('materialCategories', () => {
  const items = ref([])

  async function fetchAll() {
    const res = await request.get('/material-categories')
    if (res.code === 200) items.value = res.data
    return res
  }

  async function fetchList() {
    const res = await request.get('/material-categories/list')
    if (res.code === 200) items.value = res.data
    return res
  }

  async function create(data) {
    const res = await request.post('/material-categories', data)
    if (res.code === 200) items.value.push(res.data)
    return res
  }

  async function update(id, data) {
    const res = await request.put(`/material-categories/${id}`, data)
    if (res.code === 200) {
      const idx = items.value.findIndex(i => i.id === id)
      if (idx !== -1) items.value[idx] = res.data
    }
    return res
  }

  async function remove(id) {
    const res = await request.delete(`/material-categories/${id}`)
    if (res.code === 200) items.value = items.value.filter(i => i.id !== id)
    return res
  }

  return { items, fetchAll, fetchList, create, update, remove }
})
