<script setup>
import { ref, onMounted } from 'vue'
import { useReviewsStore } from '../../stores/reviews'
import ModuleVisibilityToggle from '../../components/admin/ModuleVisibilityToggle.vue'

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
    <ModuleVisibilityToggle module-id="reviews" />
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
@media (max-width: 768px) {
  .admin-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
