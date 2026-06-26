<script setup>
import { ref, onMounted } from 'vue'
import { useBannersStore } from '../../stores/banners'
import { uploadFile, withCacheBust } from '../../utils/upload'

const bannersStore = useBannersStore()
const showModal = ref(false)
const editItem = ref(null)
const form = ref({ title: '', subtitle: '', image_url: '', sort_order: 0, is_active: 1 })
const uploading = ref(false)
const previewUrl = ref('')
const uploadHint = ref('')

onMounted(() => bannersStore.fetchAll())

function openCreate() {
  editItem.value = null
  form.value = { title: '', subtitle: '', image_url: '', sort_order: 0, is_active: 1 }
  previewUrl.value = ''
  uploadHint.value = ''
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
  previewUrl.value = item.image_url ? withCacheBust(item.image_url) : ''
  uploadHint.value = ''
  showModal.value = true
}

async function handleSubmit() {
  if (!form.value.image_url) {
    alert('请先上传轮播图图片')
    return
  }
  const res = editItem.value
    ? await bannersStore.update(editItem.value.id, form.value)
    : await bannersStore.create(form.value)
  if (res.code === 200) {
    showModal.value = false
    await bannersStore.fetchAll()
  } else {
    alert(res.message || '保存失败')
  }
}

async function handleDelete(id) {
  if (confirm('确定删除该轮播图？')) await bannersStore.remove(id)
}

async function handleToggle(item) {
  await bannersStore.toggle(item.id)
}

async function handleUpload(e) {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
  uploading.value = true
  uploadHint.value = ''
  try {
    const res = await uploadFile(file)
    if (res.code === 200) {
      form.value.image_url = res.data.url
      previewUrl.value = withCacheBust(res.data.url)
      uploadHint.value = '上传成功，请点击下方「保存」生效'
    } else {
      uploadHint.value = res.message || '上传失败'
      alert(uploadHint.value)
    }
  } catch (err) {
    uploadHint.value = err.response?.data?.message || err.message || '上传失败'
    alert(uploadHint.value)
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
              <img v-if="previewUrl" :src="previewUrl" class="preview-img" alt="">
            </div>
            <p v-if="uploadHint" class="upload-hint">{{ uploadHint }}</p>
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

.upload-hint {
  margin-top: 8px;
  font-size: 13px;
  color: #22c55e;
}
</style>
