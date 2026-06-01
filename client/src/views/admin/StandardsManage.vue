<script setup>
import { ref, onMounted } from 'vue'
import { useStandardsStore } from '../../stores/standards'

const store = useStandardsStore()
const showModal = ref(false)
const editItem = ref(null)
const form = ref({ title: '', type: 'execution', items: '', sort_order: 0 })

onMounted(() => store.fetchAll())

function openCreate() {
  editItem.value = null
  form.value = { title: '', type: 'execution', items: '', sort_order: 0 }
  showModal.value = true
}

function openEdit(item) {
  editItem.value = item
  form.value = { title: item.title, type: item.type, items: item.items.join('\n'), sort_order: item.sort_order }
  showModal.value = true
}

async function handleSubmit() {
  const data = { ...form.value, items: form.value.items.split('\n').filter(Boolean) }
  if (editItem.value) await store.update(editItem.value.id, data)
  else await store.create(data)
  showModal.value = false
}

async function handleDelete(id) {
  if (confirm('确定删除？')) await store.remove(id)
}
</script>

<template>
  <div>
    <div class="admin-header">
      <h1>标准管理</h1>
      <button class="btn btn-primary" @click="openCreate">+ 新增标准</button>
    </div>
    <div class="admin-card">
      <table class="admin-table">
        <thead><tr><th>标题</th><th>类型</th><th>条目数</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="item in store.items" :key="item.id">
            <td>{{ item.title }}</td>
            <td>{{ item.type === 'execution' ? '执行标准' : '报价标准' }}</td>
            <td>{{ item.items?.length || 0 }}</td>
            <td>
              <button class="btn btn-ghost btn-sm" @click="openEdit(item)">编辑</button>
              <button class="btn btn-danger btn-sm" @click="handleDelete(item.id)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!store.items.length" style="color: var(--text-muted); text-align: center; padding: 40px;">暂无数据</p>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ editItem ? '编辑标准' : '新增标准' }}</h3>
          <button class="modal-close" @click="showModal = false">×</button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="form-group"><label>标题</label><input v-model="form.title" required></div>
          <div class="form-group">
            <label>类型</label>
            <select v-model="form.type">
              <option value="execution">执行标准</option>
              <option value="pricing">报价标准</option>
            </select>
          </div>
          <div class="form-group"><label>条目 (每行一条)</label><textarea v-model="form.items" rows="6"></textarea></div>
          <div class="form-group"><label>排序</label><input v-model.number="form.sort_order" type="number"></div>
          <button type="submit" class="btn btn-primary" style="width: 100%;">保存</button>
        </form>
      </div>
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
.btn-primary { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; }
.btn-ghost { background: transparent; color: var(--text-secondary); border: 1px solid var(--border); }
.btn-danger { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }
.btn-sm { padding: 6px 12px; font-size: 13px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 2000; }
.modal { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 32px; width: 90%; max-width: 520px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.modal-header h3 { font-size: 18px; font-weight: 600; }
.modal-close { width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border); background: transparent; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; font-weight: 500; color: var(--text-secondary); margin-bottom: 8px; font-size: 14px; }
.form-group input, .form-group textarea, .form-group select { width: 100%; padding: 12px 16px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; font-size: 14px; color: var(--text-primary); font-family: inherit; }
.form-group input:focus, .form-group textarea:focus, .form-group select:focus { outline: none; border-color: var(--accent); }
.form-group textarea { min-height: 100px; resize: vertical; }
</style>
