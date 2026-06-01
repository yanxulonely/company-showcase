<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCasesStore } from '../../stores/cases'

const casesStore = useCasesStore()
const activeFilter = ref('全部')

const gradients = [
  'case-image-placeholder-1',
  'case-image-placeholder-2',
  'case-image-placeholder-3',
]

const tags = computed(() => {
  const set = new Set(casesStore.items.map(i => i.tag).filter(Boolean))
  return ['全部', ...set]
})

const filteredCases = computed(() => {
  if (activeFilter.value === '全部') return casesStore.items
  return casesStore.items.filter(i => i.tag === activeFilter.value)
})

function openCase(item) {
  if (item.external_url) {
    window.open(item.external_url, '_blank')
  }
}

function setFilter(tag) {
  activeFilter.value = tag
}

onMounted(() => {
  casesStore.fetchAll()
})
</script>

<template>
  <section class="section" id="cases">
    <div class="section-header fade-in-up" style="max-width: 1400px; margin: 0 auto 64px;">
      <div class="section-label">Featured Work</div>
      <h2>精选案例</h2>
    </div>

    <!-- 风格分类筛选 -->
    <div v-if="tags.length > 1" class="filter-bar fade-in-up" style="max-width: 1400px; margin: 0 auto 40px;">
      <button
        v-for="tag in tags"
        :key="tag"
        class="filter-tag"
        :class="{ active: activeFilter === tag }"
        @click="setFilter(tag)"
      >
        {{ tag }}
      </button>
    </div>

    <div class="cases-grid">
      <div
        v-for="(item, i) in filteredCases"
        :key="item.id"
        class="case-card fade-in-up"
        :style="{ transitionDelay: i * 0.1 + 's' }"
        :class="{ clickable: item.external_url }"
        @click="openCase(item)"
      >
        <div class="case-image">
          <div v-if="item.image_url" class="case-image-bg" :style="{ backgroundImage: `url(${item.image_url})` }"></div>
          <div v-else class="case-image-placeholder" :class="gradients[i % 3]">{{ item.icon }}</div>
          <span class="case-tag">{{ item.tag }}</span>
        </div>
        <div class="case-content">
          <h3 class="case-title">{{ item.title }}</h3>
          <p class="case-desc">{{ item.description }}</p>
          <span v-if="item.external_url" class="case-link">查看详情 →</span>
        </div>
      </div>
    </div>
    <p v-if="!filteredCases.length" style="color: var(--text-muted); text-align: center; padding: 60px 0;">暂无案例</p>
  </section>
</template>

<style scoped>
.section {
  padding: 120px 40px;
}

.section-header {
  margin-bottom: 64px;
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

/* Filter bar */
.filter-bar {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-tag {
  padding: 8px 20px;
  border-radius: 100px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition);
}

.filter-tag:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.filter-tag.active {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

.cases-grid {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.case-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: default;
  position: relative;
}

.case-card.clickable {
  cursor: pointer;
}

.case-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 16px;
  padding: 1px;
  background: linear-gradient(135deg, transparent, var(--accent), transparent);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.4s;
}

.case-card:hover::before {
  opacity: 1;
}

.case-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.case-image {
  height: 220px;
  position: relative;
  overflow: hidden;
}

.case-image-bg {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.case-card:hover .case-image-bg {
  transform: scale(1.1);
}

.case-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 56px;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.case-card:hover .case-image-placeholder {
  transform: scale(1.1);
}

.case-image-placeholder-1 { background: linear-gradient(135deg, #1e3a5f, #0f172a); }
.case-image-placeholder-2 { background: linear-gradient(135deg, #3b1c5e, #1a0a2e); }
.case-image-placeholder-3 { background: linear-gradient(135deg, #1c3d2f, #0a1f15); }

[data-theme="light"] .case-image-placeholder-1 { background: linear-gradient(135deg, #60a5fa, #3b82f6); }
[data-theme="light"] .case-image-placeholder-2 { background: linear-gradient(135deg, #a78bfa, #8b5cf6); }
[data-theme="light"] .case-image-placeholder-3 { background: linear-gradient(135deg, #34d399, #10b981); }

.case-tag {
  position: absolute;
  top: 16px;
  left: 16px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.case-content {
  padding: 24px;
}

.case-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  letter-spacing: -0.3px;
}

.case-desc {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.6;
}

.case-link {
  display: inline-block;
  margin-top: 12px;
  font-size: 14px;
  color: var(--accent-light);
  font-weight: 500;
  transition: color var(--transition);
}

.case-card.clickable:hover .case-link {
  color: var(--accent);
}
</style>
