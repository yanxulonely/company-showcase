<script setup>
import { ref, onMounted } from 'vue'
import { useCasesStore } from '../../stores/cases'
import { useCapabilitiesStore } from '../../stores/capabilities'
import { useReviewsStore } from '../../stores/reviews'
import { useContactsStore } from '../../stores/contacts'

const casesStore = useCasesStore()
const capsStore = useCapabilitiesStore()
const reviewsStore = useReviewsStore()
const contactsStore = useContactsStore()

const stats = ref([])

onMounted(async () => {
  await Promise.all([
    casesStore.fetchAll(),
    capsStore.fetchAll(),
    reviewsStore.fetchAll(),
    contactsStore.fetchAll()
  ])
  stats.value = [
    { label: '案例数量', value: casesStore.items.length, icon: '📁', color: '#3b82f6' },
    { label: '能力数量', value: capsStore.items.length, icon: '⚡', color: '#8b5cf6' },
    { label: '评价数量', value: reviewsStore.items.length, icon: '💬', color: '#ec4899' },
    { label: '咨询数量', value: contactsStore.items.length, icon: '✉️', color: '#10b981' },
  ]
})
</script>

<template>
  <div>
    <div class="admin-header">
      <h1>仪表盘</h1>
    </div>
    <div class="stats-grid">
      <div v-for="stat in stats" :key="stat.label" class="stat-card">
        <div class="stat-icon" :style="{ background: stat.color + '20', color: stat.color }">
          {{ stat.icon }}
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </div>
    <div class="admin-card">
      <h3 style="margin-bottom: 16px; font-size: 16px;">最近咨询</h3>
      <table class="admin-table" v-if="contactsStore.items.length">
        <thead>
          <tr>
            <th>姓名</th>
            <th>公司</th>
            <th>联系方式</th>
            <th>状态</th>
            <th>时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in contactsStore.items.slice(0, 5)" :key="item.id">
            <td>{{ item.name }}</td>
            <td>{{ item.company || '-' }}</td>
            <td>{{ item.contact_info || '-' }}</td>
            <td>
              <span class="badge" :class="item.status === 'pending' ? 'badge-pending' : 'badge-processed'">
                {{ item.status === 'pending' ? '待处理' : '已处理' }}
              </span>
            </td>
            <td>{{ new Date(item.created_at).toLocaleDateString() }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else style="color: var(--text-muted); font-size: 14px;">暂无咨询记录</p>
    </div>
  </div>
</template>

<style scoped>
.admin-header {
  margin-bottom: 32px;
}

.admin-header h1 {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all var(--transition);
}

.stat-card:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
}

.stat-label {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 2px;
}

.admin-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table th,
.admin-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--border);
  font-size: 14px;
}

.admin-table th {
  color: var(--text-muted);
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.badge {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.badge-pending {
  background: rgba(251, 191, 36, 0.1);
  color: #fbbf24;
}

.badge-processed {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}
</style>
