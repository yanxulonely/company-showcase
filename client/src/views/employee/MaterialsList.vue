<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMaterialsStore } from '../../stores/materials'
import { useMaterialCategoriesStore } from '../../stores/materialCategories'

const router = useRouter()
const materialsStore = useMaterialsStore()
const categoriesStore = useMaterialCategoriesStore()

const searchQuery = ref('')
const selectedCategoryId = ref(null)
const selectedTag = ref(null)
const loading = ref(true)

// Collect all unique tags from materials
const allTags = computed(() => {
  const tagSet = new Set()
  materialsStore.items.forEach(m => {
    if (m.tags && Array.isArray(m.tags)) {
      m.tags.forEach(t => tagSet.add(t))
    }
  })
  return [...tagSet].sort()
})

// Filtered materials
const filteredMaterials = computed(() => {
  let list = [...materialsStore.items]

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

// Split pinned and normal
const pinnedMaterials = computed(() => filteredMaterials.value.filter(m => m.is_pinned))
const normalMaterials = computed(() => filteredMaterials.value.filter(m => !m.is_pinned))

onMounted(async () => {
  try {
    await Promise.all([
      materialsStore.fetchAll(),
      categoriesStore.fetchList()
    ])
  } catch (e) {
    console.error('Failed to load data:', e)
  } finally {
    loading.value = false
  }
})

function selectCategory(id) {
  selectedCategoryId.value = selectedCategoryId.value === id ? null : id
}

function selectTag(tag) {
  selectedTag.value = selectedTag.value === tag ? null : tag
}

function clearFilters() {
  searchQuery.value = ''
  selectedCategoryId.value = null
  selectedTag.value = null
}

function getFileIcon(type) {
  const icons = {
    pdf: '📄', image: '🖼️', ppt: '📊', doc: '📝', excel: '📈', link: '🔗'
  }
  return icons[type] || '📁'
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
</script>

<template>
  <div class="materials-page">
    <div class="page-header">
      <h1>📚 资料库</h1>
      <p>浏览和下载工作所需资料</p>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <div class="search-input-wrapper">
        <span class="search-icon">🔍</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索资料名称、标签..."
          class="search-input"
        >
        <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''">✕</button>
      </div>
      <button v-if="selectedCategoryId || selectedTag || searchQuery" class="clear-btn" @click="clearFilters">
        清除筛选
      </button>
    </div>

    <div class="content-layout">
      <!-- 左侧分类筛选 -->
      <aside class="filter-sidebar">
        <div class="filter-section">
          <h3 class="filter-title">📁 分类</h3>
          <div class="filter-list">
            <button
              class="filter-item"
              :class="{ active: !selectedCategoryId }"
              @click="selectedCategoryId = null"
            >
              <span>全部</span>
              <span class="filter-count">{{ materialsStore.items.length }}</span>
            </button>
            <button
              v-for="cat in categoriesStore.items"
              :key="cat.id"
              class="filter-item"
              :class="{ active: selectedCategoryId === cat.id }"
              @click="selectCategory(cat.id)"
            >
              <span>{{ cat.name }}</span>
              <span class="filter-count">{{ materialsStore.items.filter(m => m.category_id === cat.id).length }}</span>
            </button>
          </div>
        </div>

        <div v-if="allTags.length > 0" class="filter-section">
          <h3 class="filter-title">🏷️ 标签</h3>
          <div class="tag-list">
            <button
              v-for="tag in allTags"
              :key="tag"
              class="tag-btn"
              :class="{ active: selectedTag === tag }"
              @click="selectTag(tag)"
            >
              {{ tag }}
            </button>
          </div>
        </div>
      </aside>

      <!-- 右侧资料列表 -->
      <main class="materials-content">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>加载中...</p>
        </div>
        <div v-else-if="filteredMaterials.length === 0" class="empty-state">
          <div class="empty-icon">📭</div>
          <p>没有找到匹配的资料</p>
          <button class="clear-btn" @click="clearFilters">清除筛选</button>
        </div>
        <template v-else>
          <!-- 置顶资料 -->
          <div v-if="pinnedMaterials.length > 0" class="pinned-section">
            <h3 class="subsection-title">📌 置顶资料</h3>
            <div class="materials-grid">
              <div
                v-for="item in pinnedMaterials"
                :key="item.id"
                class="material-card pinned"
                @click="router.push(`/employee/materials/${item.id}`)"
              >
                <div class="card-top">
                  <span class="file-icon">{{ getFileIcon(item.file_type) }}</span>
                  <span class="pin-badge">📌 置顶</span>
                </div>
                <h3 class="card-title">{{ item.title }}</h3>
                <div class="card-meta">
                  <span v-if="item.category_name" class="card-category">{{ item.category_name }}</span>
                  <span class="card-time">{{ formatTime(item.created_at) }}</span>
                </div>
                <div v-if="item.tags && item.tags.length" class="card-tags">
                  <span v-for="tag in item.tags.slice(0, 3)" :key="tag" class="card-tag">{{ tag }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 普通资料 -->
          <div v-if="normalMaterials.length > 0" class="normal-section">
            <h3 v-if="pinnedMaterials.length > 0" class="subsection-title">📋 全部资料</h3>
            <div class="materials-grid">
              <div
                v-for="item in normalMaterials"
                :key="item.id"
                class="material-card"
                @click="router.push(`/employee/materials/${item.id}`)"
              >
                <div class="card-top">
                  <span class="file-icon">{{ getFileIcon(item.file_type) }}</span>
                </div>
                <h3 class="card-title">{{ item.title }}</h3>
                <div class="card-meta">
                  <span v-if="item.category_name" class="card-category">{{ item.category_name }}</span>
                  <span class="card-time">{{ formatTime(item.created_at) }}</span>
                </div>
                <div v-if="item.tags && item.tags.length" class="card-tags">
                  <span v-for="tag in item.tags.slice(0, 3)" :key="tag" class="card-tag">{{ tag }}</span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </main>
    </div>
  </div>
</template>

<style scoped>
.materials-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 6px;
  letter-spacing: -0.5px;
}

.page-header p {
  color: var(--text-muted);
  font-size: 15px;
}

/* 搜索栏 */
.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.search-input-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 14px;
  font-size: 16px;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 12px 40px 12px 42px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 14px;
  color: var(--text-primary);
  transition: all var(--transition);
  font-family: inherit;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-input::placeholder {
  color: var(--text-muted);
}

.search-clear {
  position: absolute;
  right: 10px;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: var(--bg-secondary);
  color: var(--text-muted);
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition);
}

.search-clear:hover {
  background: var(--border);
  color: var(--text-primary);
}

.clear-btn {
  padding: 10px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all var(--transition);
  white-space: nowrap;
  font-family: inherit;
}

.clear-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

/* 内容布局 */
.content-layout {
  display: flex;
  gap: 24px;
}

/* 侧边栏 */
.filter-sidebar {
  width: 200px;
  flex-shrink: 0;
}

.filter-section {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.filter-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.filter-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all var(--transition);
  font-family: inherit;
  width: 100%;
  text-align: left;
}

.filter-item:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.filter-item.active {
  background: rgba(59, 130, 246, 0.1);
  color: var(--accent);
}

.filter-count {
  font-size: 12px;
  color: var(--text-muted);
  background: var(--bg-secondary);
  padding: 1px 8px;
  border-radius: 10px;
}

.filter-item.active .filter-count {
  background: rgba(59, 130, 246, 0.15);
  color: var(--accent);
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-btn {
  padding: 5px 12px;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  font-size: 12px;
  cursor: pointer;
  transition: all var(--transition);
  font-family: inherit;
}

.tag-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.tag-btn.active {
  background: rgba(59, 130, 246, 0.1);
  border-color: var(--accent);
  color: var(--accent);
}

/* 内容区 */
.materials-content {
  flex: 1;
  min-width: 0;
}

.subsection-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pinned-section {
  margin-bottom: 32px;
}

.materials-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.material-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 20px;
  cursor: pointer;
  transition: all var(--transition);
}

.material-card:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.material-card.pinned {
  border-color: rgba(251, 191, 36, 0.3);
  background: linear-gradient(135deg, var(--bg-card), rgba(251, 191, 36, 0.03));
}

.material-card.pinned:hover {
  border-color: rgba(251, 191, 36, 0.5);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.file-icon {
  font-size: 32px;
}

.pin-badge {
  font-size: 11px;
  color: #f59e0b;
  background: rgba(251, 191, 36, 0.1);
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 500;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 10px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.card-category {
  font-size: 12px;
  color: var(--accent);
  background: rgba(59, 130, 246, 0.1);
  padding: 3px 10px;
  border-radius: 20px;
  font-weight: 500;
}

.card-time {
  font-size: 12px;
  color: var(--text-muted);
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.card-tag {
  background: var(--bg-secondary);
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 11px;
  color: var(--text-muted);
}

/* 加载/空状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px;
  color: var(--text-muted);
  font-size: 14px;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px;
  color: var(--text-muted);
}

.empty-icon {
  font-size: 48px;
  opacity: 0.5;
}

/* 响应式 */
@media (max-width: 1024px) {
  .materials-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .content-layout {
    flex-direction: column;
  }

  .filter-sidebar {
    width: 100%;
  }

  .filter-section {
    margin-bottom: 12px;
  }

  .filter-list {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 6px;
  }

  .filter-item {
    width: auto;
  }

  .materials-grid {
    grid-template-columns: 1fr;
  }

  .search-bar {
    flex-direction: column;
  }
}
</style>
