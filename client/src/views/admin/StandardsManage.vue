<script setup>
import { ref, onMounted } from 'vue'
import { useStandardsStore } from '../../stores/standards'
import ModuleVisibilityToggle from '../../components/admin/ModuleVisibilityToggle.vue'

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
    <ModuleVisibilityToggle module-id="standards" />
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
@media (max-width: 768px) {
  .admin-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
