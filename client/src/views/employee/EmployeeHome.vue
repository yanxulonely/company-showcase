<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useMaterialsStore } from '../../stores/materials'
import { useAppStore } from '../../stores/app'

const router = useRouter()
const authStore = useAuthStore()
const materialsStore = useMaterialsStore()
const appStore = useAppStore()

const pinnedMaterials = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await materialsStore.fetchAll({ pinned: '1' })
    if (res.code === 200) {
      pinnedMaterials.value = res.data.slice(0, 6)
    }
  } catch (e) {
    console.error('Failed to load pinned materials:', e)
  } finally {
    loading.value = false
  }
})

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
  <div class="emp-home">
    <!-- 欢迎区 -->
    <div class="welcome-section">
      <div class="welcome-text">
        <h1>👋 你好，{{ authStore.displayName || authStore.username }}</h1>
        <p>欢迎回到员工专区，这里有你需要的工作资料。</p>
      </div>
    </div>

    <!-- 快捷入口 -->
    <div class="quick-links">
      <div class="quick-card" @click="router.push('/employee/materials')">
        <div class="quick-icon">📚</div>
        <div class="quick-info">
          <h3>资料库</h3>
          <p>浏览和下载工作资料</p>
        </div>
        <span class="quick-arrow">→</span>
      </div>
      <a href="/" class="quick-card">
        <div class="quick-icon">🌐</div>
        <div class="quick-info">
          <h3>公司官网</h3>
          <p>查看公司前台展示</p>
        </div>
        <span class="quick-arrow">→</span>
      </a>
    </div>

    <!-- 置顶资料 -->
    <div class="section">
      <div class="section-header">
        <h2>📌 置顶资料</h2>
        <router-link to="/employee/materials" class="view-all">查看全部 →</router-link>
      </div>
      <div v-if="loading" class="loading-state">加载中...</div>
      <div v-else-if="pinnedMaterials.length === 0" class="empty-state">暂无置顶资料</div>
      <div v-else class="materials-grid">
        <div
          v-for="item in pinnedMaterials"
          :key="item.id"
          class="material-card"
          @click="router.push(`/employee/materials/${item.id}`)"
        >
          <div class="card-header">
            <span class="file-icon">{{ getFileIcon(item.file_type) }}</span>
            <span v-if="item.category_name" class="card-category">{{ item.category_name }}</span>
          </div>
          <h3 class="card-title">{{ item.title }}</h3>
          <div class="card-footer">
            <span class="card-time">{{ formatTime(item.created_at) }}</span>
            <div class="card-tags" v-if="item.tags && item.tags.length">
              <span v-for="tag in item.tags.slice(0, 2)" :key="tag" class="card-tag">{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.emp-home {
  max-width: 1200px;
  margin: 0 auto;
}

/* 欢迎区 */
.welcome-section {
  margin-bottom: 32px;
}

.welcome-text h1 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.welcome-text p {
  color: var(--text-muted);
  font-size: 15px;
}

/* 快捷入口 */
.quick-links {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 40px;
}

.quick-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  cursor: pointer;
  transition: all var(--transition);
  text-decoration: none;
  color: inherit;
}

.quick-card:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.quick-icon {
  width: 52px;
  height: 52px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.quick-info h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.quick-info p {
  font-size: 13px;
  color: var(--text-muted);
}

.quick-arrow {
  margin-left: auto;
  font-size: 18px;
  color: var(--text-muted);
  transition: all var(--transition);
}

.quick-card:hover .quick-arrow {
  color: var(--accent);
  transform: translateX(4px);
}

/* 区域 */
.section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 20px;
  font-weight: 600;
}

.view-all {
  font-size: 14px;
  color: var(--accent);
  text-decoration: none;
  font-weight: 500;
  transition: opacity var(--transition);
}

.view-all:hover {
  opacity: 0.8;
}

/* 资料卡片网格 */
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.file-icon {
  font-size: 28px;
}

.card-category {
  font-size: 12px;
  color: var(--accent);
  background: rgba(59, 130, 246, 0.1);
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 500;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--text-muted);
}

.card-tags {
  display: flex;
  gap: 6px;
}

.card-tag {
  background: var(--bg-secondary);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 40px;
  color: var(--text-muted);
  font-size: 14px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
}

/* 响应式 */
@media (max-width: 768px) {
  .quick-links {
    grid-template-columns: 1fr;
  }

  .materials-grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .materials-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
