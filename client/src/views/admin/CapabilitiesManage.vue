<script setup>
import { ref, onMounted } from 'vue'
import { useCapabilitiesStore } from '../../stores/capabilities'
import ModuleVisibilityToggle from '../../components/admin/ModuleVisibilityToggle.vue'

const store = useCapabilitiesStore()
const showModal = ref(false)
const editItem = ref(null)
const form = ref({ title: '', description: '', icon: '', sort_order: 0 })

onMounted(() => store.fetchAll())

function openCreate() {
  editItem.value = null
  form.value = { title: '', description: '', icon: '', sort_order: 0 }
  showModal.value = true
}

function openEdit(item) {
  editItem.value = item
  form.value = { title: item.title, description: item.description, icon: item.icon, sort_order: item.sort_order }
  showModal.value = true
}

async function handleSubmit() {
  if (editItem.value) {
    await store.update(editItem.value.id, form.value)
  } else {
    await store.create(form.value)
  }
  showModal.value = false
}

async function handleDelete(id) {
  if (confirm('确定删除？')) await store.remove(id)
}
</script>

<template>
  <div>
    <div class="admin-header">
      <h1>能力管理</h1>
      <button class="btn btn-primary" @click="openCreate">+ 新增能力</button>
    </div>
    <ModuleVisibilityToggle module-id="capabilities" />
    <div class="admin-card">
      <table class="admin-table">
        <thead>
          <tr><th>标题</th><th>图标</th><th>排序</th><th>操作</th></tr>
        </thead>
        <tbody>
          <tr v-for="item in store.items" :key="item.id">
            <td>{{ item.title }}</td>
            <td>{{ item.icon }}</td>
            <td>{{ item.sort_order }}</td>
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
          <h3>{{ editItem ? '编辑能力' : '新增能力' }}</h3>
          <button class="modal-close" @click="showModal = false">×</button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="form-group"><label>标题</label><input v-model="form.title" required></div>
          <div class="form-group"><label>描述</label><textarea v-model="form.description"></textarea></div>
          <div class="form-group"><label>图标 (emoji)</label><input v-model="form.icon"></div>
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
