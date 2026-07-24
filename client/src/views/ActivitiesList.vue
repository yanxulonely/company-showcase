<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useActivitiesStore } from '../stores/activities'
import Navbar from '../components/Navbar.vue'
import Footer from '../components/Footer.vue'
import BackToTop from '../components/BackToTop.vue'

const router = useRouter()
const activitiesStore = useActivitiesStore()
const loading = ref(true)

function formatDate(dt) {
  if (!dt) return ''
  const d = new Date(dt)
  if (Number.isNaN(d.getTime())) return dt
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function getStatusLabel(item) {
  if (item.status === 'ended') return '已结束'
  const now = Date.now()
  if (item.end_time && new Date(item.end_time).getTime() < now) return '已结束'
  if (item.start_time && new Date(item.start_time).getTime() > now) return '即将开始'
  return '进行中'
}

function openActivity(item) {
  router.push(`/activities/${item.id}`)
}

onMounted(async () => {
  await activitiesStore.fetchAll()
  loading.value = false
})
</script>

<template>
  <Navbar />
  <main class="page-main">
    <div class="page-header">
      <button class="back-btn" @click="router.push('/')">← 返回首页</button>
      <h1>精彩活动</h1>
      <p>了解尚润装饰最新活动与优惠信息</p>
    </div>

    <div v-if="loading" class="loading-text">加载中...</div>
    <div v-else class="activities-grid">
      <div
        v-for="item in activitiesStore.items"
        :key="item.id"
        class="activity-card"
        @click="openActivity(item)"
      >
        <div class="activity-image">
          <div v-if="item.cover_image_url" class="activity-image-bg" v-lazy-img:url="item.cover_image_url"></div>
          <div v-else class="activity-image-placeholder">🎉</div>
          <span class="activity-status" :class="{ ended: getStatusLabel(item) === '已结束' }">
            {{ getStatusLabel(item) }}
          </span>
        </div>
        <div class="activity-content">
          <h3>{{ item.title }}</h3>
          <p>{{ item.summary }}</p>
          <div class="activity-meta">
            <span v-if="item.start_time">📅 {{ formatDate(item.start_time) }}</span>
            <span v-if="item.location">📍 {{ item.location }}</span>
          </div>
        </div>
      </div>
    </div>
    <p v-if="!loading && !activitiesStore.items.length" class="empty-text">暂无活动</p>
  </main>
  <Footer />
  <BackToTop />
</template>

<style scoped>
.page-main {
  min-height: 80vh;
  padding: 100px 40px 80px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 48px;
}

.back-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 16px;
  padding: 0;
  font-family: inherit;
}

.back-btn:hover {
  color: var(--accent);
}

.page-header h1 {
  font-size: 40px;
  font-weight: 700;
  margin-bottom: 12px;
}

.page-header p {
  color: var(--text-muted);
}

.loading-text, .empty-text {
  text-align: center;
  color: var(--text-muted);
  padding: 80px 0;
}

.activities-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.activity-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
}

.activity-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.15);
}

.activity-image {
  height: 200px;
  position: relative;
  overflow: hidden;
}

.activity-image-bg {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
}

.activity-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  background: linear-gradient(135deg, #1e3a5f, #3b1c5e);
}

.activity-status {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(59, 130, 246, 0.9);
  color: white;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
}

.activity-status.ended {
  background: rgba(113, 113, 122, 0.9);
}

.activity-content {
  padding: 20px;
}

.activity-content h3 {
  font-size: 18px;
  margin-bottom: 8px;
}

.activity-content p {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.activity-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
  font-size: 13px;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .page-main {
    padding: 80px 20px 60px;
  }

  .page-header h1 {
    font-size: 28px;
  }

  .activities-grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .activities-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
