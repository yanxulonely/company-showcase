<script setup>
import { ref, onMounted } from 'vue'
import { useDesignersStore } from '../../stores/designers'
import SkeletonCard from '../SkeletonCard.vue'

const emit = defineEmits(['book'])

const designersStore = useDesignersStore()
const loading = ref(true)

const avatarClasses = ['designer-avatar-1', 'designer-avatar-2', 'designer-avatar-3']

function photoSrc(url) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return url.startsWith('/') ? url : `/${url}`
}

function bookDesigner(designer) {
  emit('book', designer)
  const el = document.querySelector('#contact')
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

onMounted(async () => {
  await designersStore.fetchActive()
  loading.value = false
})
</script>

<template>
  <section class="section designers-section" id="designers">
    <div class="section-header fade-in-up" style="max-width: 1400px; margin: 0 auto 64px;">
      <div class="section-label">Design Team</div>
      <h2>设计师团队</h2>
      <p class="section-desc">认准风格与设计师，预约一对一方案沟通</p>
    </div>

    <div class="designers-grid">
      <template v-if="loading">
        <SkeletonCard v-for="n in 2" :key="'sk-d-' + n" type="review" />
      </template>
      <template v-else>
        <article
          v-for="(item, i) in designersStore.items"
          :key="item.id"
          class="designer-card fade-in-up"
          :style="{ transitionDelay: i * 0.1 + 's' }"
        >
          <div class="designer-top">
            <div
              v-if="item.photo_url"
              class="designer-photo"
              v-lazy-img:url="photoSrc(item.photo_url)"
            ></div>
            <div
              v-else
              class="designer-avatar"
              :class="avatarClasses[(item.id - 1) % 3]"
            >
              {{ item.name[0] }}
            </div>
            <div class="designer-meta">
              <h3 class="designer-name">{{ item.name }}</h3>
              <p class="designer-title">{{ item.title }}</p>
              <p v-if="item.slogan" class="designer-slogan">{{ item.slogan }}</p>
            </div>
          </div>

          <p class="designer-bio">{{ item.bio }}</p>

          <div v-if="item.styles?.length" class="designer-styles">
            <span v-for="style in item.styles" :key="style" class="style-tag">{{ style }}</span>
          </div>

          <div class="designer-stats">
            <span v-if="item.years_experience">🎓 {{ item.years_experience }} 年经验</span>
            <span v-if="item.project_count">🏠 {{ item.project_count }}+ 项目</span>
          </div>

          <button type="button" class="book-btn" @click="bookDesigner(item)">
            预约 {{ item.name }} 出方案
          </button>
        </article>
      </template>
    </div>

    <p v-if="!loading && !designersStore.items.length" class="empty-hint">
      暂无设计师展示，请在后台「设计师管理」中添加
    </p>
  </section>
</template>

<style scoped>
.section {
  padding: 120px 40px;
}

.designers-section {
  background: var(--bg-primary);
}

.section-header {
  margin-bottom: 64px;
}

.section-desc {
  margin-top: 16px;
  color: var(--text-muted);
  font-size: 18px;
  max-width: 560px;
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

.designers-grid {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
}

.designer-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 36px 32px;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.designer-card:hover {
  border-color: rgba(59, 130, 246, 0.4);
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
}

.designer-top {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.designer-photo {
  width: 88px;
  height: 88px;
  border-radius: 16px;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
  border: 2px solid var(--border);
}

.designer-avatar {
  width: 88px;
  height: 88px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.designer-avatar-1 { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
.designer-avatar-2 { background: linear-gradient(135deg, #8b5cf6, #6d28d9); }
.designer-avatar-3 { background: linear-gradient(135deg, #10b981, #047857); }

.designer-name {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}

.designer-title {
  color: var(--accent-light);
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
}

.designer-slogan {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.5;
  font-style: italic;
}

.designer-bio {
  color: var(--text-secondary);
  line-height: 1.7;
  font-size: 15px;
}

.designer-styles {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.style-tag {
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  background: rgba(59, 130, 246, 0.12);
  color: var(--accent-light);
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.designer-stats {
  display: flex;
  gap: 20px;
  font-size: 13px;
  color: var(--text-muted);
}

.book-btn {
  margin-top: auto;
  width: 100%;
  padding: 14px 20px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--accent), #8b5cf6);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.2s;
}

.book-btn:hover {
  opacity: 0.92;
  transform: translateY(-1px);
}

.empty-hint {
  text-align: center;
  color: var(--text-muted);
  margin-top: 24px;
}

@media (max-width: 900px) {
  .designers-grid {
    grid-template-columns: 1fr;
  }

  .section {
    padding: 80px 24px;
  }

  .section-header h2 {
    font-size: 36px;
  }
}
</style>
