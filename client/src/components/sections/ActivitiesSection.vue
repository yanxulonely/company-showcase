<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useActivitiesStore } from '../../stores/activities'
import SkeletonCard from '../SkeletonCard.vue'

const activitiesStore = useActivitiesStore()
const router = useRouter()
const loading = ref(true)

const displayItems = computed(() => activitiesStore.items.slice(0, 6))

function formatDate(dt) {
  if (!dt) return ''
  const d = new Date(dt)
  if (Number.isNaN(d.getTime())) return dt
  return `${d.getMonth() + 1}月${d.getDate()}日`
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

function viewAll() {
  router.push('/activities')
}

onMounted(async () => {
  await activitiesStore.fetchAll()
  loading.value = false
})
</script>

<template>
  <section class="section" id="activities">
    <div class="section-header fade-in-up" style="max-width: 1400px; margin: 0 auto 64px;">
      <div class="section-label">Events</div>
      <h2>精彩活动</h2>
    </div>

    <div class="activities-grid">
      <template v-if="loading">
        <SkeletonCard v-for="n in 3" :key="'sk-' + n" type="case" />
      </template>
      <template v-else>
        <div
          v-for="(item, i) in displayItems"
          :key="item.id"
          class="activity-card fade-in-up clickable"
          :style="{ transitionDelay: i * 0.1 + 's' }"
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
            <h3 class="activity-title">{{ item.title }}</h3>
            <p class="activity-desc">{{ item.summary }}</p>
            <div class="activity-meta">
              <span v-if="item.start_time">📅 {{ formatDate(item.start_time) }}</span>
              <span v-if="item.location">📍 {{ item.location }}</span>
            </div>
            <span class="activity-link">查看详情 →</span>
          </div>
        </div>
      </template>
    </div>

    <div v-if="!loading && displayItems.length" class="view-all-wrap fade-in-up">
      <button class="view-all-btn" @click="viewAll">查看全部活动</button>
    </div>
    <p v-if="!loading && !displayItems.length" class="empty-text">暂无活动，敬请期待</p>
  </section>
</template>

<style scoped>
.section {
  padding: 120px 40px;
}

.section-label {
  font-size: 13px;
  color: var(--accent-light);
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 600;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-label::before {
  content: '';
  width: 24px;
  height: 2px;
  background: linear-gradient(90deg, var(--accent), #8b5cf6);
}

.section-header h2 {
  font-size: 48px;
  font-weight: 700;
  letter-spacing: -1px;
  line-height: 1.2;
}

.activities-grid {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.activity-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
}

.activity-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
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
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.activity-card:hover .activity-image-bg {
  transform: scale(1.1);
}

.activity-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 56px;
  background: linear-gradient(135deg, #1e3a5f, #3b1c5e);
}

.activity-status {
  position: absolute;
  top: 16px;
  left: 16px;
  background: rgba(59, 130, 246, 0.9);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.activity-status.ended {
  background: rgba(113, 113, 122, 0.9);
}

.activity-content {
  padding: 24px;
}

.activity-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.activity-desc {
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

.activity-link {
  display: inline-block;
  margin-top: 12px;
  font-size: 14px;
  color: var(--accent-light);
  font-weight: 500;
}

.view-all-wrap {
  max-width: 1400px;
  margin: 48px auto 0;
  text-align: center;
}

.view-all-btn {
  padding: 14px 32px;
  border-radius: 100px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.view-all-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  transform: translateY(-2px);
}

.empty-text {
  color: var(--text-muted);
  text-align: center;
  padding: 60px 0;
}

@media (max-width: 768px) {
  .section {
    padding: 80px 20px;
  }

  .section-header h2 {
    font-size: 32px;
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
