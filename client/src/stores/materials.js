import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import request from '../utils/request'

export const useMaterialsStore = defineStore('materials', () => {
  const items = ref([])
  const searchQuery = ref('')
  const selectedCategoryId = ref(null)
  const selectedTag = ref(null)

  const filteredItems = computed(() => {
    let list = [...items.value]
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      list = list.filter(m =>
        m.title.toLowerCase().includes(q) ||
        (m.tags && m.tags.some(t => t.toLowerCase().includes(q)))
      )
    }
    if (selectedCategoryId.value) {
      list = list.filter(m => m.category_id === selectedCategoryId.value)
    }
    if (selectedTag.value) {
      list = list.filter(m => m.tags && m.tags.includes(selectedTag.value))
    }
    return list
  })

  const allTags = computed(() => {
    const tagSet = new Set()
    items.value.forEach(m => {
      if (m.tags && Array.isArray(m.tags)) {
        m.tags.forEach(t => tagSet.add(t))
      }
    })
    return [...tagSet].sort()
  })

  function setSearch(q) { searchQuery.value = q }
  function setCategory(id) { selectedCategoryId.value = id }
  function setTag(tag) { selectedTag.value = tag }
  function clearFilters() {
    searchQuery.value = ''
    selectedCategoryId.value = null
    selectedTag.value = null
  }

  async function fetchAll(params) {
    const res = await request.get('/materials', { params })
    if (res.code === 200) items.value = res.data
    return res
  }

  async function fetchOne(id) {
    const res = await request.get(`/materials/${id}`)
    return res
  }

  async function create(data) {
    const res = await request.post('/materials', data)
    if (res.code === 200) items.value.unshift(res.data)
    return res
  }

  async function update(id, data) {
    const res = await request.put(`/materials/${id}`, data)
    if (res.code === 200) {
      const idx = items.value.findIndex(i => i.id === id)
      if (idx !== -1) items.value[idx] = res.data
    }
    return res
  }

  async function remove(id) {
    const res = await request.delete(`/materials/${id}`)
    if (res.code === 200) items.value = items.value.filter(i => i.id !== id)
    return res
  }

  async function togglePin(id) {
    const res = await request.put(`/materials/${id}/pin`)
    if (res.code === 200) {
      const idx = items.value.findIndex(i => i.id === id)
      if (idx !== -1) items.value[idx] = res.data
    }
    return res
  }

  async function upload(file) {
    const { uploadMaterialFile } = await import('../utils/upload')
    return uploadMaterialFile(file)
  }

  return {
    items, searchQuery, selectedCategoryId, selectedTag,
    filteredItems, allTags,
    setSearch, setCategory, setTag, clearFilters,
    fetchAll, fetchOne, create, update, remove, togglePin, upload
  }
})
