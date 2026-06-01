<script setup>
import { ref, onMounted } from 'vue'
import { useBannersStore } from '../../stores/banners'
import request from '../../utils/request'

const bannersStore = useBannersStore()
const showModal = ref(false)
const editItem = ref(null)
const form = ref({ title: '', subtitle: '', image_url: '', sort_order: 0, is_active: 1 })
const uploading = ref(false)

onMounted(() => bannersStore.fetchAll())

function openCreate() {
  editItem.value = null
  form.value = { title: '', subtitle: '', image_url: '', sort_order: 0, is_active: 1 }
  showModal.value = true
}

function openEdit(item) {
  editItem.value = item
  form.value = {
    title: item.title || '',
    subtitle: item.subtitle || '',
    image_url: item.image_url || '',
    sort_order: item.sort_order || 0,
    is_active: item.is_active
  }
  showModal.value = true
}

async function handleSubmit() {
  if (editItem.value) {
    const res = await bannersStore.update(editItem.value.id, form.value)
    if (res.code === 200) showModal.value = false
  } else {
    const res = await bannersStore.create(form.value)
    if (res.code === 200) showModal.value = false
  }
}

async function handleDelete(id) {
  if (confirm('确定删除该轮播图？')) await bannersStore.remove(id)
}

async function handleToggle(item) {
  await bannersStore.toggle(item.id)
}

async function handleUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    const res = await request.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    if (res.code === 200) {
      form.value.image_url = res.data.url
    }
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <div>
    <div class="admin-header">
      <h1>轮播图管理</h1>
      <button class="btn btn-primary" @click="openCreate">+ 新增轮播图</button>
    </div>
    <div class="admin-card">
      <table class="admin-table">
        <thead>
          <tr>
            <th>排序</th>
            <th>图片</th>
            <th>标题</th>
            <th>副标题</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in bannersStore.items" :key="item.id">
            <td>{{ item.sort_order }}</td>
            <td>
              <img v-if="item.image_url" :src="item.image_url" class="table-thumb" alt="">
              <span v-else class="text-muted">无图片</span>
            </td>
            <td>{{ item.title }}</td>
            <td>{{ item.subtitle }}</td>
            <td>
              <span :class="['status-badge', item.is_active ? 'active' : 'inactive']">
                {{ item.is_active ? '启用' : '禁用' }}
              </span>
            </td>
            <td>
              <button class="btn btn-ghost btn-sm" @click="openEdit(item)">编辑</button>
              <button class="btn btn-ghost btn-sm" @click="handleToggle(item)">
                {{ item.is_active ? '禁用' : '启用' }}
              </button>
              <button class="btn btn-danger btn-sm" @click="handleDelete(item.id)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!bannersStore.items.length" style="color: var(--text-muted); text-align: center; padding: 40px;">暂无数据</p>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ editItem ? '编辑轮播图' : '新增轮播图' }}</h3>
          <button class="modal-close" @click="showModal = false">×</button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>标题</label>
            <input v-model="form.title" placeholder="轮播图标题">
          </div>
          <div class="form-group">
            <label>副标题</label>
            <input v-model="form.subtitle" placeholder="轮播图副标题">
          </div>
          <div class="form-group">
            <label>图片</label>
            <div class="upload-area">
              <input type="file" accept="image/*" @change="handleUpload" ref="fileInput" style="display: none;" id="banner-upload">
              <label for="banner-upload" class="upload-btn">
                {{ uploading ? '上传中...' : '选择图片' }}
              </label>
              <img v-if="form.image_url" :src="form.image_url" class="preview-img" alt="">
            </div>
            <input v-model="form.image_url" placeholder="或直接输入图片 URL" style="margin-top: 8px;">
          </div>
          <div class="form-group">
            <label>排序</label>
            <input v-model.number="form.sort_order" type="number">
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" v-model="form.is_active" :true-value="1" :false-value="0"> 启用
            </label>
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%;">保存</button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.admin-header h1 {
  font-size: 24px;
  font-weight: 700;
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

.table-thumb {
  width: 80px;
  height: 45px;
  object-fit: cover;
  border-radius: 6px;
}

.text-muted {
  color: var(--text-muted);
  font-size: 13px;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.active {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.status-badge.inactive {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border);
}

.btn-ghost:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.btn-danger {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 32px;
  width: 90%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
}

.modal-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 8px;
  font-size: 14px;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-primary);
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--accent);
}

.upload-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.upload-btn {
  display: inline-block;
  padding: 8px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  color: var(--text-primary);
}

.upload-btn:hover {
  border-color: var(--accent);
}

.preview-img {
  width: 80px;
  height: 45px;
  object-fit: cover;
  border-radius: 6px;
}
</style>
