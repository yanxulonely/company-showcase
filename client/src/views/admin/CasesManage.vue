<script setup>
import { ref, onMounted } from 'vue'
import { useCasesStore } from '../../stores/cases'
import request from '../../utils/request'

const casesStore = useCasesStore()
const showModal = ref(false)
const editItem = ref(null)
const uploading = ref(false)
const form = ref({
  title: '',
  description: '',
  tag: '',
  icon: '',
  image_url: '',
  external_url: '',
  sort_order: 0,
})

onMounted(() => casesStore.fetchAll())

function openCreate() {
  editItem.value = null
  form.value = {
    title: '',
    description: '',
    tag: '',
    icon: '',
    image_url: '',
    external_url: '',
    sort_order: 0,
  }
  showModal.value = true
}

function openEdit(item) {
  editItem.value = item
  form.value = {
    title: item.title,
    description: item.description,
    tag: item.tag,
    icon: item.icon,
    image_url: item.image_url || '',
    external_url: item.external_url || '',
    sort_order: item.sort_order,
  }
  showModal.value = true
}

async function handleUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    const res = await request.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    if (res.code === 200) {
      form.value.image_url = res.data.url
    }
  } finally {
    uploading.value = false
  }
}

async function handleSubmit() {
  if (editItem.value) {
    await casesStore.update(editItem.value.id, form.value)
  } else {
    await casesStore.create(form.value)
  }
  showModal.value = false
}

async function handleDelete(id) {
  if (confirm('确定删除？')) await casesStore.remove(id)
}
</script>

<template>
  <div>
    <div class="admin-header">
      <h1>案例管理</h1>
      <button class="btn btn-primary" @click="openCreate">+ 新增案例</button>
    </div>
    <div class="admin-card">
      <table class="admin-table">
        <thead>
          <tr>
            <th>封面</th>
            <th>标题</th>
            <th>标签</th>
            <th>外链</th>
            <th>排序</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in casesStore.items" :key="item.id">
            <td>
              <img v-if="item.image_url" :src="item.image_url" class="table-thumb" alt="">
              <span v-else class="table-icon">{{ item.icon || '—' }}</span>
            </td>
            <td>{{ item.title }}</td>
            <td>{{ item.tag }}</td>
            <td>
              <a v-if="item.external_url" :href="item.external_url" target="_blank" rel="noopener" class="external-link">查看</a>
              <span v-else class="text-muted">—</span>
            </td>
            <td>{{ item.sort_order }}</td>
            <td>
              <button class="btn btn-ghost btn-sm" @click="openEdit(item)">编辑</button>
              <button class="btn btn-danger btn-sm" @click="handleDelete(item.id)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!casesStore.items.length" style="color: var(--text-muted); text-align: center; padding: 40px;">暂无数据</p>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ editItem ? '编辑案例' : '新增案例' }}</h3>
          <button class="modal-close" @click="showModal = false">×</button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>标题</label>
            <input v-model="form.title" required>
          </div>
          <div class="form-group">
            <label>描述</label>
            <textarea v-model="form.description"></textarea>
          </div>
          <div class="form-group">
            <label>标签</label>
            <input v-model="form.tag" placeholder="如：制造业">
          </div>
          <div class="form-group">
            <label>封面图</label>
            <div class="upload-area">
              <input type="file" accept="image/*" @change="handleUpload" style="display: none;" id="case-upload">
              <label for="case-upload" class="upload-btn">
                {{ uploading ? '上传中...' : '选择图片' }}
              </label>
              <img v-if="form.image_url" :src="form.image_url" class="preview-img" alt="">
            </div>
            <input v-model="form.image_url" placeholder="或直接输入图片 URL" style="margin-top: 8px;">
          </div>
          <div class="form-group">
            <label>图标 (emoji，无封面时显示)</label>
            <input v-model="form.icon" placeholder="如：🏭">
          </div>
          <div class="form-group">
            <label>详情外链</label>
            <input v-model="form.external_url" placeholder="https://... 或留空">
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
.table-thumb {
  width: 64px;
  height: 40px;
  object-fit: cover;
  border-radius: 6px;
}

.table-icon {
  font-size: 24px;
}

.text-muted {
  color: var(--text-muted);
  font-size: 13px;
}

.external-link {
  color: var(--accent);
  font-size: 13px;
  text-decoration: none;
}

.external-link:hover {
  text-decoration: underline;
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
  border-radius: var(--radius-md);
  font-size: 14px;
  cursor: pointer;
  color: var(--text-primary);
  transition: all var(--transition);
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

@media (max-width: 768px) {
  .admin-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
