<script setup>
import { ref, onMounted } from 'vue'
import { useReviewsStore } from '../../stores/reviews'

const store = useReviewsStore()
const showModal = ref(false)
const editItem = ref(null)
const form = ref({ name: '', company: '', content: '', rating: 5, avatar_bg: 1, sort_order: 0 })

onMounted(() => store.fetchAll())

function openCreate() {
  editItem.value = null
  form.value = { name: '', company: '', content: '', rating: 5, avatar_bg: 1, sort_order: 0 }
  showModal.value = true
}

function openEdit(item) {
  editItem.value = item
  form.value = { name: item.name, company: item.company, content: item.content, rating: item.rating, avatar_bg: item.avatar_bg, sort_order: item.sort_order }
  showModal.value = true
}

async function handleSubmit() {
  if (editItem.value) await store.update(editItem.value.id, form.value)
  else await store.create(form.value)
  showModal.value = false
}

async function handleDelete(id) {
  if (confirm('确定删除？')) await store.remove(id)
}
</script>

<template>
  <div>
    <div class="admin-header">
      <h1>评价管理</h1>
      <button class="btn btn-primary" @click="openCreate">+ 新增评价</button>
    </div>
    <div class="admin-card">
      <table class="admin-table">
        <thead><tr><th>姓名</th><th>公司</th><th>评分</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="item in store.items" :key="item.id">
            <td>{{ item.name }}</td>
            <td>{{ item.company }}</td>
            <td>{{ '★'.repeat(item.rating) }}</td>
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
          <h3>{{ editItem ? '编辑评价' : '新增评价' }}</h3>
          <button class="modal-close" @click="showModal = false">×</button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="form-group"><label>姓名</label><input v-model="form.name" required></div>
          <div class="form-group"><label>公司</label><input v-model="form.company"></div>
          <div class="form-group"><label>评价内容</label><textarea v-model="form.content"></textarea></div>
          <div class="form-group"><label>评分 (1-5)</label><input v-model.number="form.rating" type="number" min="1" max="5"></div>
          <div class="form-group"><label>头像配色 (1-3)</label><input v-model.number="form.avatar_bg" type="number" min="1" max="3"></div>
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
.form-group input, .form-group textarea { width: 100%; padding: 12px 16px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; font-size: 14px; color: var(--text-primary); font-family: inherit; }
.form-group input:focus, .form-group textarea:focus { outline: none; border-color: var(--accent); }
.form-group textarea { min-height: 100px; resize: vertical; }
</style>
