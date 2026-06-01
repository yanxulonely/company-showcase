import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '../utils/request'

export const useContactsStore = defineStore('contacts', () => {
  const items = ref([])
  const stats = ref({ pending: 0, contacted: 0, invalid: 0, total: 0 })

  async function fetchAll(status) {
    const params = status && status !== 'all' ? { status } : {}
    const res = await request.get('/contacts', { params })
    if (res.code === 200) items.value = res.data
    return res
  }

  async function submit(data) {
    return await request.post('/contacts', data)
  }

  async function updateStatus(id, status) {
    const res = await request.put(`/contacts/${id}/status`, { status })
    if (res.code === 200) {
      const idx = items.value.findIndex(i => i.id === id)
      if (idx !== -1) items.value[idx] = res.data
    }
    return res
  }

  async function updateNote(id, note) {
    const res = await request.put(`/contacts/${id}/note`, { note })
    if (res.code === 200) {
      const idx = items.value.findIndex(i => i.id === id)
      if (idx !== -1) items.value[idx] = res.data
    }
    return res
  }

  async function fetchStats() {
    const res = await request.get('/contacts/stats')
    if (res.code === 200) stats.value = res.data
    return res
  }

  async function exportExcel(status) {
    const params = status && status !== 'all' ? `?status=${status}` : ''
    const token = localStorage.getItem('token')
    const response = await fetch(`http://localhost:3000/api/contacts/export${params}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!response.ok) throw new Error('导出失败')
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `线索列表_${new Date().toLocaleDateString()}.xlsx`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  async function remove(id) {
    const res = await request.delete(`/contacts/${id}`)
    if (res.code === 200) items.value = items.value.filter(i => i.id !== id)
    return res
  }

  return { items, stats, fetchAll, submit, updateStatus, updateNote, fetchStats, exportExcel, remove }
})
