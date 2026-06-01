import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '../utils/request'

export const useContactsStore = defineStore('contacts', () => {
  const items = ref([])

  async function fetchAll() {
    const res = await request.get('/contacts')
    if (res.code === 200) items.value = res.data
  }

  async function submit(data) {
    return await request.post('/contacts', data)
  }

  async function updateStatus(id, status) {
    const res = await request.put(`/contacts/${id}`, { status })
    if (res.code === 200) {
      const idx = items.value.findIndex(i => i.id === id)
      if (idx !== -1) items.value[idx] = res.data
    }
    return res
  }

  async function remove(id) {
    const res = await request.delete(`/contacts/${id}`)
    if (res.code === 200) items.value = items.value.filter(i => i.id !== id)
    return res
  }

  return { items, fetchAll, submit, updateStatus, remove }
})
