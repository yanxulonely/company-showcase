<script setup>
import { ref, onMounted } from 'vue'

const stats = [
  { target: 500, label: '成功案例' },
  { target: 98, label: '客户满意度 %' },
  { target: 10, label: '年行业经验' },
  { target: 50, label: '设计师团队' },
]

const displayed = ref(stats.map(() => 0))
const animated = ref(false)

function animateNumber(index, target) {
  let current = 0
  const increment = target / 50
  const stepTime = 40
  const timer = setInterval(() => {
    current += increment
    if (current >= target) {
      displayed.value[index] = target
      clearInterval(timer)
    } else {
      displayed.value[index] = Math.floor(current)
    }
  }, stepTime)
}

onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated.value) {
        animated.value = true
        stats.forEach((s, i) => setTimeout(() => animateNumber(i, s.target), i * 100))
      }
    })
  }, { threshold: 0.5 })
  const el = document.querySelector('.stats')
  if (el) observer.observe(el)
})
</script>

<template>
  <section class="stats">
    <div class="stats-content">
      <div v-for="(stat, i) in stats" :key="i" class="stat-item fade-in-up" :style="{ transitionDelay: i * 0.1 + 's' }">
        <div class="stat-number">{{ displayed[i] }}+</div>
        <div class="stat-label">{{ stat.label }}</div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.stats {
  padding: 80px 40px;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  background: var(--bg-secondary);
}

.stats-content {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 40px;
}

.stat-item {
  text-align: center;
  padding: 20px;
}

.stat-number {
  font-size: 56px;
  font-weight: 800;
  letter-spacing: -2px;
  background: linear-gradient(135deg, var(--accent), #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 14px;
  color: var(--text-muted);
  margin-top: 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

@media (max-width: 768px) {
  .stats {
    padding: 48px 16px;
  }

  .stats-content {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .stat-item {
    padding: 12px 8px;
  }

  .stat-number {
    font-size: 36px;
    letter-spacing: -1px;
  }

  .stat-label {
    font-size: 12px;
    letter-spacing: 0.5px;
  }
}
</style>
