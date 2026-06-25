<script setup>
import { ref, onMounted } from 'vue'
import { useCapabilitiesStore } from '../../stores/capabilities'
import SkeletonCard from '../SkeletonCard.vue'

const capsStore = useCapabilitiesStore()
const loading = ref(true)

onMounted(async () => {
  await capsStore.fetchAll()
  loading.value = false
})
</script>

<template>
  <section class="section" id="capabilities">
    <div class="section-header fade-in-up" style="max-width: 1400px; margin: 0 auto 64px;">
      <div class="section-label">Our Capabilities</div>
      <h2>核心能力</h2>
    </div>
    <div class="capabilities-grid">
      <template v-if="loading">
        <SkeletonCard v-for="n in 6" :key="'sk-' + n" type="capability" />
      </template>
      <template v-else>
        <div v-for="(item, i) in capsStore.items" :key="item.id" class="capability-card fade-in-up" :style="{ transitionDelay: i * 0.05 + 's' }">
          <div class="capability-icon">{{ item.icon }}</div>
          <h3 class="capability-title">{{ item.title }}</h3>
          <p class="capability-desc">{{ item.description }}</p>
          <span class="capability-tag">查看详情 →</span>
        </div>
      </template>
    </div>
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

.capabilities-grid {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.capability-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 40px 32px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.capability-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--accent), #8b5cf6, #ec4899);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s;
}

.capability-card:hover::before {
  transform: scaleX(1);
}

.capability-card:hover {
  border-color: var(--accent);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(59, 130, 246, 0.1);
}

.capability-icon {
  width: 60px;
  height: 60px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-bottom: 24px;
  transition: all var(--transition);
}

.capability-card:hover .capability-icon {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
  border-color: var(--accent);
  transform: scale(1.1) rotate(5deg);
}

.capability-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  letter-spacing: -0.3px;
}

.capability-desc {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.7;
}

.capability-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 20px;
  font-size: 13px;
  color: var(--accent-light);
  font-weight: 500;
  opacity: 0;
  transform: translateX(-10px);
  transition: all var(--transition);
}

.capability-card:hover .capability-tag {
  opacity: 1;
  transform: translateX(0);
}

@media (max-width: 768px) {
  .section {
    padding: 72px 16px;
  }

  .section-header {
    margin-bottom: 32px;
  }

  .section-header h2 {
    font-size: 28px;
  }

  .capabilities-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .capability-card {
    padding: 24px 20px;
  }

  .capability-tag {
    opacity: 1;
    transform: none;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .capabilities-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
