<script setup>
import { ref, onMounted } from 'vue'
import { useMaterialsStore } from '../../stores/materials'
import { useMaterialCategoriesStore } from '../../stores/materialCategories'

const materialsStore = useMaterialsStore()
const categoriesStore = useMaterialCategoriesStore()
const showModal = ref(false)
const editItem = ref(null)
const filterCategory = ref('')
const filterPinned = ref('')
const uploading = ref(false)
const tagInput = ref('')

const fileTypeOptions = [
  { value: 'ppt', label: 'PPT' },
  { value: 'pdf', label: 'PDF' },
  { value: 'image', label: '图片' },
  { value: 'link', label: '链接' },
  { value: 'doc', label: '文档' },
]

const form = ref({
  title: '',
  category_id: null,
  tags: [],
  file_url: '',
  file_type: 'link',
  original_filename: '',
  is_pinned: 0,
  visibility: 'employee',
  sort_order: 0
})

onMounted(async () => {
  await categoriesStore.fetchAll()
  await loadMaterials()
})

async function loadMaterials() {
  const params = {}
  if (filterCategory.value) params.category_id = filterCategory.value
  if (filterPinned.value === '1') params.pinned = '1'
  await materialsStore.fetchAll(params)
}

function openCreate() {
  editItem.value = null
  form.value = {
    title: '',
    category_id: null,
    tags: [],
    file_url: '',
    file_type: 'link',
    original_filename: '',
    is_pinned: 0,
    visibility: 'employee',
    sort_order: 0
  }
  tagInput.value = ''
  showModal.value = true
}

function openEdit(item) {
  editItem.value = item
  form.value = {
    title: item.title,
    category_id: item.category_id,
    tags: Array.isArray(item.tags) ? [...item.tags] : [],
    file_url: item.file_url || '',
    file_type: item.file_type || 'link',
    original_filename: item.original_filename || '',
    is_pinned: item.is_pinned,
    visibility: item.visibility || 'employee',
    sort_order: item.sort_order || 0
  }
  tagInput.value = ''
  showModal.value = true
}

function addTag() {
  const tag = tagInput.value.trim()
  if (tag && !form.value.tags.includes(tag)) {
    form.value.tags.push(tag)
  }
  tagInput.value = ''
}

function removeTag(index) {
  form.value.tags.splice(index, 1)
}

function onTagKeydown(e) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    addTag()
  }
}

async function handleSubmit() {
  const data = { ...form.value }
  if (!data.category_id) data.category_id = null
  if (editItem.value) {
    const res = await materialsStore.update(editItem.value.id, data)
    if (res.code === 200) showModal.value = false
  } else {
    const res = await materialsStore.create(data)
    if (res.code === 200) showModal.value = false
  }
}

async function handleDelete(id) {
  if (confirm('确定删除该资料？')) await materialsStore.remove(id)
}

async function handlePin(item) {
  await materialsStore.togglePin(item.id)
}

async function handleFileUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  uploading.value = true
  try {
    const res = await materialsStore.upload(file)
    if (res.code === 200) {
      form.value.file_url = res.data.url
      form.value.original_filename = res.data.originalname
      // Auto-detect file type
      const ext = res.data.originalname.split('.').pop().toLowerCase()
      if (['ppt', 'pptx'].includes(ext)) form.value.file_type = 'ppt'
      else if (ext === 'pdf') form.value.file_type = 'pdf'
      else if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) form.value.file_type = 'image'
      else if (['doc', 'docx'].includes(ext)) form.value.file_type = 'doc'
    }
  } finally {
    uploading.value = false
  }
}

function getFileTypeLabel(type) {
  const map = { ppt: 'PPT', pdf: 'PDF', image: '图片', link: '链接', doc: '文档' }
  return map[type] || type
}

function onFilterChange() {
  loadMaterials()
}
</script>

<template>
  <div>
    <div class="admin-header">
      <h1>资料库管理</h1>
      <button class="btn btn-primary" @click="openCreate">+ 新增资料</button>
    </div>

    <div class="filter-bar">
      <select v-model="filterCategory" @change="onFilterChange" class="filter-select">
        <option value="">全部分类</option>
        <option v-for="cat in categoriesStore.items" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
      </select>
      <select v-model="filterPinned" @change="onFilterChange" class="filter-select">
        <option value="">全部</option>
        <option value="1">仅置顶</option>
      </select>
    </div>

    <div class="admin-card">
      <table class="admin-table">
        <thead>
          <tr>
            <th>置顶</th>
            <th>标题</th>
            <th>分类</th>
            <th>类型</th>
            <th>标签</th>
            <th>可见性</th>
            <th>排序</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in materialsStore.items" :key="item.id">
            <td>
              <button class="pin-btn" :class="{ pinned: item.is_pinned }" @click="handlePin(item)">
                {{ item.is_pinned ? '📌' : '📍' }}
              </button>
            </td>
            <td>
              <div>{{ item.title }}</div>
              <div v-if="item.original_filename" class="file-info">{{ item.original_filename }}</div>
            </td>
            <td>{{ item.category_name || '-' }}</td>
            <td><span class="type-badge">{{ getFileTypeLabel(item.file_type) }}</span></td>
            <td>
              <div class="tags-cell">
                <span v-for="tag in (item.tags || [])" :key="tag" class="tag-badge">{{ tag }}</span>
              </div>
            </td>
            <td>
              <span :class="['visibility-badge', item.visibility]">
                {{ item.visibility === 'admin' ? '管理员' : item.visibility === 'employee' ? '员工' : '用户' }}
              </span>
            </td>
            <td>{{ item.sort_order }}</td>
            <td>
              <button class="btn btn-ghost btn-sm" @click="openEdit(item)">编辑</button>
              <button class="btn btn-danger btn-sm" @click="handleDelete(item.id)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!materialsStore.items.length" style="color: var(--text-muted); text-align: center; padding: 40px;">暂无数据</p>
    </div>

    <!-- 创建/编辑模态框 -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ editItem ? '编辑资料' : '新增资料' }}</h3>
          <button class="modal-close" @click="showModal = false">×</button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>标题 *</label>
            <input v-model="form.title" required placeholder="资料标题">
          </div>
          <div class="form-group">
            <label>分类</label>
            <select v-model="form.category_id">
              <option :value="null">无分类</option>
              <option v-for="cat in categoriesStore.items" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>文件</label>
            <div class="upload-area">
              <input type="file" accept=".ppt,.pptx,.pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx" @change="handleFileUpload" :disabled="uploading" style="display: none;" id="material-upload">
              <label for="material-upload" class="upload-btn" :class="{ disabled: uploading }">
                {{ uploading ? '上传中...' : '选择文件' }}
              </label>
              <span v-if="form.original_filename" class="file-name">{{ form.original_filename }}</span>
            </div>
            <input v-model="form.file_url" placeholder="或直接输入文件/链接 URL" style="margin-top: 8px;">
          </div>
          <div class="form-group">
            <label>文件类型</label>
            <select v-model="form.file_type">
              <option v-for="opt in fileTypeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>标签（回车添加）</label>
            <div class="tags-input-area">
              <span v-for="(tag, index) in form.tags" :key="index" class="tag-badge">
                {{ tag }}
                <button type="button" class="tag-remove" @click="removeTag(index)">×</button>
              </span>
              <input v-model="tagInput" @keydown="onTagKeydown" placeholder="输入标签后回车" class="tag-input">
            </div>
          </div>
          <div class="form-group">
            <label>可见性</label>
            <select v-model="form.visibility">
              <option value="user">所有用户</option>
              <option value="employee">仅员工</option>
            </select>
          </div>
          <div class="form-group">
            <label>排序</label>
            <input v-model.number="form.sort_order" type="number">
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" v-model="form.is_pinned" :true-value="1" :false-value="0"> 置顶显示
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
  margin-bottom: 24px;
}

.admin-header h1 {
  font-size: 24px;
  font-weight: 700;
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.filter-select {
  padding: 10px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-primary);
  cursor: pointer;
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

.file-info {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
}

.pin-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.pin-btn:hover, .pin-btn.pinned {
  opacity: 1;
}

.type-badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 12px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-weight: 500;
}

.tags-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tag-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.tag-remove {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  padding: 0 2px;
}

.visibility-badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.visibility-badge.employee {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.visibility-badge.user {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
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
  max-width: 560px;
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
  transition: border-color 0.2s;
}

.upload-btn:hover {
  border-color: var(--accent);
}

.upload-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.file-name {
  font-size: 13px;
  color: var(--text-muted);
}

.tags-input-area {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  min-height: 42px;
  align-items: center;
}

.tag-input {
  border: none !important;
  background: transparent !important;
  padding: 4px !important;
  flex: 1;
  min-width: 100px;
}
</style>
