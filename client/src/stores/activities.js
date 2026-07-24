import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '../utils/request'

export const useActivitiesStore = defineStore('activities', () => {
  const items = ref([])
  const current = ref(null)

  async function fetchAll(params) {
    const res = await request.get('/activities', { params })
    if (res.code === 200) items.value = res.data
    return res
  }

  async function fetchAdminList() {
    const res = await request.get('/activities/admin/list')
    if (res.code === 200) items.value = res.data
    return res
  }

  async function fetchOne(id) {
    const res = await request.get(`/activities/${id}`)
    if (res.code === 200) current.value = res.data
    return res
  }

  async function create(data) {
    const res = await request.post('/activities', data)
    if (res.code === 200) items.value.push(res.data)
    return res
  }

  async function update(id, data) {
    const res = await request.put(`/activities/${id}`, data)
    if (res.code === 200) {
      const idx = items.value.findIndex(i => i.id === id)
      if (idx !== -1) items.value[idx] = res.data
      if (current.value?.id === id) current.value = res.data
    }
    return res
  }

  async function remove(id) {
    const res = await request.delete(`/activities/${id}`)
    if (res.code === 200) {
      items.value = items.value.filter(i => i.id !== id)
      if (current.value?.id === id) current.value = null
    }
    return res
  }

  return { items, current, fetchAll, fetchAdminList, fetchOne, create, update, remove }
})
