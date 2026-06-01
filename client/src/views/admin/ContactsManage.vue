<script setup>
import { onMounted } from 'vue'
import { useContactsStore } from '../../stores/contacts'

const store = useContactsStore()

onMounted(() => store.fetchAll())

async function markProcessed(id) {
  await store.updateStatus(id, 'processed')
}

async function handleDelete(id) {
  if (confirm('确定删除？')) await store.remove(id)
}
</script>

<template>
  <div>
    <div class="admin-header">
      <h1>联系管理</h1>
    </div>
    <div class="admin-card">
      <table class="admin-table">
        <thead><tr><th>姓名</th><th>公司</th><th>联系方式</th><th>需求</th><th>状态</th><th>时间</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="item in store.items" :key="item.id">
            <td>{{ item.name }}</td>
            <td>{{ item.company || '-' }}</td>
            <td>{{ item.contact_info || '-' }}</td>
            <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ item.message || '-' }}</td>
            <td>
              <span class="badge" :class="item.status === 'pending' ? 'badge-pending' : 'badge-processed'">
                {{ item.status === 'pending' ? '待处理' : '已处理' }}
              </span>
            </td>
            <td>{{ new Date(item.created_at).toLocaleDateString() }}</td>
            <td>
              <button v-if="item.status === 'pending'" class="btn btn-ghost btn-sm" @click="markProcessed(item.id)">标记已处理</button>
              <button class="btn btn-danger btn-sm" @click="handleDelete(item.id)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!store.items.length" style="color: var(--text-muted); text-align: center; padding: 40px;">暂无咨询记录</p>
    </div>
  </div>
</template>

<style scoped>
.admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
.admin-header h1 { font-size: 24px; font-weight: 700; }
.admin-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 24px; }
.admin-table { width: 100%; border-collapse: collapse; }
.admin-table th, .admin-table td { padding: 12px 16px; text-align: left; border-bottom: 1px solid var(--border); font-size: 14px; }
.admin-table th { color: var(--text-muted); font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
.btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 500; border: none; cursor: pointer; transition: all 0.3s ease; }
.btn-ghost { background: transparent; color: var(--text-secondary); border: 1px solid var(--border); }
.btn-danger { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }
.btn-sm { padding: 6px 12px; font-size: 13px; }
.badge { display: inline-flex; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; }
.badge-pending { background: rgba(251, 191, 36, 0.1); color: #fbbf24; }
.badge-processed { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
</style>
