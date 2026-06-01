<script setup>
import { onMounted } from 'vue'
import { useStandardsStore } from '../../stores/standards'

const standardsStore = useStandardsStore()

onMounted(() => {
  standardsStore.fetchAll()
})
</script>

<template>
  <section class="section" id="standards">
    <div class="standards-container">
      <div v-for="(item, i) in standardsStore.items" :key="item.id" class="standard-card fade-in-up" :style="{ transitionDelay: i * 0.1 + 's' }">
        <div class="standard-header">
          <div class="standard-icon" :class="`standard-icon-${i + 1}`">{{ item.type === 'execution' ? '📋' : '💰' }}</div>
          <h3 class="standard-title">{{ item.title }}</h3>
        </div>
        <ul class="standard-list">
          <li v-for="(listItem, j) in item.items" :key="j">
            <span class="check-icon">✓</span>
            {{ listItem }}
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section {
  padding: 120px 40px;
}

.standards-container {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.standard-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 40px;
  transition: all var(--transition);
  position: relative;
  overflow: hidden;
}

.standard-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, var(--glow-color) 0%, transparent 70%);
  opacity: 0;
  transition: opacity var(--transition);
}

.standard-card:hover::before {
  opacity: 1;
}

.standard-card:hover {
  transform: translateY(-4px);
}

.standard-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
  position: relative;
}

.standard-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  transition: transform var(--transition);
}

.standard-card:hover .standard-icon {
  transform: scale(1.1) rotate(-5deg);
}

.standard-icon-1 { background: rgba(59, 130, 246, 0.1); }
.standard-icon-2 { background: rgba(16, 185, 129, 0.1); }

.standard-title {
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.5px;
}

.standard-list {
  list-style: none;
}

.standard-list li {
  padding: 14px 0;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-secondary);
  font-size: 15px;
  transition: all var(--transition);
}

.standard-list li:last-child {
  border-bottom: none;
}

.standard-list li:hover {
  padding-left: 8px;
  color: var(--text-primary);
}

.check-icon {
  width: 22px;
  height: 22px;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #10b981;
  font-size: 12px;
  flex-shrink: 0;
}
</style>
