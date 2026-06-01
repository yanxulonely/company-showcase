import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '../utils/request'

export const useAppStore = defineStore('app', () => {
  const settings = ref({})
  const loading = ref(false)

  async function fetchSettings() {
    try {
      const res = await request.get('/settings')
      settings.value = res.data
    } catch (e) {
      console.error('Failed to fetch settings:', e)
    }
  }

  async function updateSettings(data) {
    try {
      await request.put('/settings', data)
      Object.assign(settings.value, data)
    } catch (e) {
      console.error('Failed to update settings:', e)
    }
  }

  return { settings, loading, fetchSettings, updateSettings }
})
