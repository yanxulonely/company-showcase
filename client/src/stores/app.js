import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import request from '../utils/request'
import { parseModuleVisibility, SITE_MODULES } from '../constants/siteModules'

export const useAppStore = defineStore('app', () => {
  const settings = ref({})
  const banners = ref([])
  const loading = ref(false)

  const moduleVisibility = computed(() => parseModuleVisibility(settings.value))

  function isModuleVisible(id) {
    return moduleVisibility.value[id] !== false
  }

  function visibleNavModules() {
    return SITE_MODULES.filter((m) => m.navLabel && isModuleVisible(m.id))
  }

  async function fetchSettings() {
    try {
      const res = await request.get('/settings')
      settings.value = res.data
    } catch (e) {
      console.error('Failed to fetch settings:', e)
    }
  }

  async function updateSettings(data) {
    const res = await request.put('/settings', data)
    if (res.code === 200) {
      Object.assign(settings.value, data)
    }
    return res
  }

  async function setModuleVisible(moduleId, visible) {
    const current = parseModuleVisibility(settings.value)
    current[moduleId] = visible
    return updateSettings({
      module_visibility: JSON.stringify(current),
    })
  }

  async function getBanners() {
    try {
      const res = await request.get('/banners/active')
      if (res.code === 200) banners.value = res.data
    } catch (e) {
      console.error('Failed to fetch banners:', e)
    }
  }

  return {
    settings,
    banners,
    loading,
    moduleVisibility,
    isModuleVisible,
    visibleNavModules,
    fetchSettings,
    updateSettings,
    setModuleVisible,
    getBanners,
  }
})
