<script setup>
import { ref, onMounted } from 'vue'
import { useMaterialCategoriesStore } from '../../stores/materialCategories'

const categoriesStore = useMaterialCategoriesStore()
const showModal = ref(false)
const editItem = ref(null)
const form = ref({ name: '', sort_order: 0 })

onMounted(() => categoriesStore.fetchAll())

function openCreate() {
  editItem.value = null
  form.value = { name: '', sort_order: 0 }
  showModal.value = true
}

function openEdit(item) {
  editItem.value = item
  form.value = { name: item.name, sort_order: item.sort_order }
  showModal.value = true
}

async function handleSubmit() {
  if (editItem.value) {
    const res = await categoriesStore.update(editItem.value.id, form.value)
    if (res.code === 200) showModal.value = false
  } else {
    const res = await categoriesStore.create(form.value)
    if (res.code === 200) showModal.value = false
  }
}

async function handleDelete(id) {
  if (confirm('确定删除该分类？')) await categoriesStore.remove(id)
}
</script>

<template>
  <div>
    <div class="admin-header">
      <h1>资料分类管理</h1>
      <button class="btn btn-primary" @click="openCreate">+ 新增分类</button>
    </div>
    <div class="admin-card">
      <table class="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>分类名称</th>
            <th>排序</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in categoriesStore.items" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.name }}</td>
            <td>{{ item.sort_order }}</td>
            <td>{{ item.created_at }}</td>
            <td>
              <button class="btn btn-ghost btn-sm" @click="openEdit(item)">编辑</button>
              <button class="btn btn-danger btn-sm" @click="handleDelete(item.id)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!categoriesStore.items.length" style="color: var(--text-muted); text-align: center; padding: 40px;">暂无数据</p>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ editItem ? '编辑分类' : '新增分类' }}</h3>
          <button class="modal-close" @click="showModal = false">×</button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>分类名称</label>
            <input v-model="form.name" required placeholder="如：产品手册">
          </div>
          <div class="form-group">
            <label>排序</label>
            <input v-model.number="form.sort_order" type="number">
          </div>
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
