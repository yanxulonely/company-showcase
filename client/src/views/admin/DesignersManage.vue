<script setup>
import { ref, onMounted } from 'vue'
import { useDesignersStore } from '../../stores/designers'
import request from '../../utils/request'

const store = useDesignersStore()
const showModal = ref(false)
const editItem = ref(null)
const uploading = ref(false)
const form = ref({
  name: '',
  title: '',
  bio: '',
  photo_url: '',
  stylesText: '',
  years_experience: 0,
  project_count: 0,
  slogan: '',
  featuredCaseIdsText: '',
  sort_order: 0,
  is_active: true,
})

onMounted(() => store.fetchAll())

function stylesToText(styles) {
  if (!styles?.length) return ''
  return Array.isArray(styles) ? styles.join('，') : String(styles)
}

function idsToText(ids) {
  if (!ids?.length) return ''
  return Array.isArray(ids) ? ids.join(',') : String(ids)
}

function openCreate() {
  editItem.value = null
  form.value = {
    name: '',
    title: '',
    bio: '',
    photo_url: '',
    stylesText: '',
    years_experience: 0,
    project_count: 0,
    slogan: '',
    featuredCaseIdsText: '',
    sort_order: 0,
    is_active: true,
  }
  showModal.value = true
}

function openEdit(item) {
  editItem.value = item
  form.value = {
    name: item.name,
    title: item.title || '',
    bio: item.bio || '',
    photo_url: item.photo_url || '',
    stylesText: stylesToText(item.styles),
    years_experience: item.years_experience || 0,
    project_count: item.project_count || 0,
    slogan: item.slogan || '',
    featuredCaseIdsText: idsToText(item.featured_case_ids),
    sort_order: item.sort_order || 0,
    is_active: item.is_active !== false,
  }
  showModal.value = true
}

function buildPayload() {
  const styles = form.value.stylesText
    .split(/[,，]/)
    .map(s => s.trim())
    .filter(Boolean)
  const featured_case_ids = form.value.featuredCaseIdsText
    .split(/[,，]/)
    .map(s => parseInt(s.trim(), 10))
    .filter(n => !Number.isNaN(n))
  return {
    name: form.value.name,
    title: form.value.title,
    bio: form.value.bio,
    photo_url: form.value.photo_url,
    styles,
    years_experience: form.value.years_experience,
    project_count: form.value.project_count,
    slogan: form.value.slogan,
    featured_case_ids,
    sort_order: form.value.sort_order,
    is_active: form.value.is_active ? 1 : 0,
  }
}

async function handleSubmit() {
  const payload = buildPayload()
  if (editItem.value) await store.update(editItem.value.id, payload)
  else await store.create(payload)
  showModal.value = false
}

async function handleDelete(id) {
  if (confirm('确定删除该设计师？')) await store.remove(id)
}

async function handleToggle(item) {
  await store.toggle(item.id)
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
    if (res.code === 200) form.value.photo_url = res.data.url
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <div>
    <div class="admin-header">
      <h1>设计师管理</h1>
      <button class="btn btn-primary" @click="openCreate">+ 新增设计师</button>
    </div>
    <div class="admin-card">
      <table class="admin-table">
        <thead>
          <tr>
            <th>排序</th>
            <th>姓名</th>
            <th>职位</th>
            <th>擅长风格</th>
            <th>前台展示</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in store.items" :key="item.id">
            <td>{{ item.sort_order }}</td>
            <td>{{ item.name }}</td>
            <td>{{ item.title }}</td>
            <td>{{ (item.styles || []).join('、') || '-' }}</td>
            <td>
              <button
                class="btn btn-sm"
                :class="item.is_active ? 'btn-primary' : 'btn-ghost'"
                @click="handleToggle(item)"
              >
                {{ item.is_active ? '已展示' : '已隐藏' }}
              </button>
            </td>
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
      <div class="modal modal-wide">
        <div class="modal-header">
          <h3>{{ editItem ? '编辑设计师' : '新增设计师' }}</h3>
          <button class="modal-close" @click="showModal = false">×</button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="form-row-2">
            <div class="form-group">
              <label>姓名 *</label>
              <input v-model="form.name" required>
            </div>
            <div class="form-group">
              <label>职位</label>
              <input v-model="form.title" placeholder="如：首席设计师">
            </div>
          </div>
          <div class="form-group">
            <label>一句话介绍</label>
            <input v-model="form.slogan" placeholder="展示在姓名下方的短句">
          </div>
          <div class="form-group">
            <label>个人简介</label>
            <textarea v-model="form.bio" rows="4"></textarea>
          </div>
          <div class="form-group">
            <label>头像照片</label>
            <input type="file" accept="image/*" @change="handleUpload">
            <input v-model="form.photo_url" placeholder="或输入图片 URL" style="margin-top: 8px;">
            <p v-if="uploading" class="form-hint">上传中...</p>
          </div>
          <div class="form-group">
            <label>擅长风格</label>
            <input v-model="form.stylesText" placeholder="多个用逗号分隔，如：现代简约,新中式">
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label>从业年限</label>
              <input v-model.number="form.years_experience" type="number" min="0">
            </div>
            <div class="form-group">
              <label>完成项目数</label>
              <input v-model.number="form.project_count" type="number" min="0">
            </div>
          </div>
          <div class="form-group">
            <label>关联案例 ID</label>
            <input v-model="form.featuredCaseIdsText" placeholder="案例管理中的 ID，逗号分隔，如：1,2">
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label>排序</label>
              <input v-model.number="form.sort_order" type="number">
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" v-model="form.is_active" style="width: auto; margin-right: 8px;">
                在前台展示
              </label>
            </div>
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%;">保存</button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-wide {
  max-width: 560px;
}

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-hint {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 6px;
}

@media (max-width: 768px) {
  .admin-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .form-row-2 {
    grid-template-columns: 1fr;
  }
}
</style>
