<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useActivitiesStore } from '../stores/activities'
import Navbar from '../components/Navbar.vue'
import Footer from '../components/Footer.vue'
import BackToTop from '../components/BackToTop.vue'
import ShareActivityModal from '../components/ShareActivityModal.vue'

const props = defineProps({
  id: [String, Number],
})

const router = useRouter()
const route = useRoute()
const activitiesStore = useActivitiesStore()

const activity = ref(null)
const loading = ref(true)
const error = ref('')
const shareVisible = ref(false)

const activityId = computed(() => props.id || route.params.id)

function formatDateTime(dt) {
  if (!dt) return ''
  const d = new Date(dt)
  if (Number.isNaN(d.getTime())) return dt
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function getStatusLabel(item) {
  if (!item) return ''
  if (item.status === 'ended') return '已结束'
  const now = Date.now()
  if (item.end_time && new Date(item.end_time).getTime() < now) return '已结束'
  if (item.start_time && new Date(item.start_time).getTime() > now) return '即将开始'
  return '进行中'
}

function openShare() {
  shareVisible.value = true
}

function registerActivity() {
  router.push({ path: '/', query: { activity: activity.value?.title || '' } })
}

onMounted(async () => {
  try {
    const res = await activitiesStore.fetchOne(activityId.value)
    if (res.code === 200) {
      activity.value = res.data
    } else {
      error.value = res.message || '活动不存在'
    }
  } catch {
    error.value = '加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <Navbar />
  <main class="page-main">
    <div class="page-nav">
      <button class="back-btn" @click="router.push('/activities')">← 返回活动列表</button>
    </div>

    <div v-if="loading" class="state-text">加载中...</div>
    <div v-else-if="error" class="state-text error">{{ error }}</div>
    <article v-else-if="activity" class="activity-detail">
      <div v-if="activity.cover_image_url" class="cover-wrap">
        <img :src="activity.cover_image_url" :alt="activity.title" class="cover-image">
      </div>

      <div class="detail-header">
        <span class="status-badge" :class="{ ended: getStatusLabel(activity) === '已结束' }">
          {{ getStatusLabel(activity) }}
        </span>
        <h1>{{ activity.title }}</h1>
        <div class="meta">
          <span v-if="activity.start_time">📅 {{ formatDateTime(activity.start_time) }}
            <template v-if="activity.end_time"> ~ {{ formatDateTime(activity.end_time) }}</template>
          </span>
          <span v-if="activity.location">📍 {{ activity.location }}</span>
          <span v-if="activity.view_count">👁 {{ activity.view_count }} 次浏览</span>
        </div>
        <p v-if="activity.summary" class="summary">{{ activity.summary }}</p>
      </div>

      <div v-if="activity.content" class="content" v-html="activity.content"></div>

      <div class="actions">
        <button class="btn btn-primary" @click="registerActivity">我要报名</button>
        <button class="btn btn-ghost" @click="openShare">分享活动</button>
      </div>
    </article>
  </main>
  <Footer />
  <BackToTop />

  <ShareActivityModal v-model:visible="shareVisible" :activity="activity" />
</template>

<style scoped>
.page-main {
  min-height: 80vh;
  padding: 100px 40px 80px;
  max-width: 800px;
  margin: 0 auto;
}

.back-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
}

.back-btn:hover {
  color: var(--accent);
}

.page-nav {
  margin-bottom: 32px;
}

.state-text {
  text-align: center;
  color: var(--text-muted);
  padding: 80px 0;
}

.state-text.error {
  color: #f87171;
}

.cover-wrap {
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 32px;
  border: 1px solid var(--border);
}

.cover-image {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  display: block;
}

.detail-header {
  margin-bottom: 32px;
}

.status-badge {
  display: inline-block;
  background: rgba(59, 130, 246, 0.15);
  color: var(--accent-light);
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 16px;
}

.status-badge.ended {
  background: rgba(113, 113, 122, 0.15);
  color: var(--text-muted);
}

.detail-header h1 {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 16px;
  letter-spacing: -0.5px;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 16px;
}

.summary {
  color: var(--text-muted);
  font-size: 16px;
  line-height: 1.7;
}

.content {
  color: var(--text-secondary);
  font-size: 16px;
  line-height: 1.8;
  margin-bottom: 40px;
}

.content :deep(p) {
  margin-bottom: 16px;
}

.content :deep(ul),
.content :deep(ol) {
  margin: 0 0 16px 24px;
}

.content :deep(li) {
  margin-bottom: 8px;
}

.actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  padding-top: 32px;
  border-top: 1px solid var(--border);
}

.btn {
  padding: 14px 28px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border: none;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.35);
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border);
}

.btn-ghost:hover {
  border-color: var(--accent);
  color: var(--accent);
}

@media (max-width: 768px) {
  .page-main {
    padding: 80px 20px 60px;
  }

  .detail-header h1 {
    font-size: 26px;
  }

  .actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
