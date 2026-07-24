<script setup>
import { ref, onMounted } from 'vue'
import { useActivitiesStore } from '../../stores/activities'
import { uploadFile } from '../../utils/upload'
import ShareActivityModal from '../../components/ShareActivityModal.vue'
import ModuleVisibilityToggle from '../../components/admin/ModuleVisibilityToggle.vue'

const activitiesStore = useActivitiesStore()
const showModal = ref(false)
const editItem = ref(null)
const uploading = ref(false)
const shareVisible = ref(false)
const shareActivity = ref(null)

const statusOptions = [
  { value: 'draft', label: '草稿' },
  { value: 'published', label: '已发布' },
  { value: 'ended', label: '已结束' },
]

const form = ref({
  title: '',
  summary: '',
  content: '',
  cover_image_url: '',
  location: '',
  start_time: '',
  end_time: '',
  status: 'draft',
  sort_order: 0,
})

function toDatetimeLocal(val) {
  if (!val) return ''
  const d = new Date(val)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fromDatetimeLocal(val) {
  if (!val) return null
  return val.replace('T', ' ') + ':00'
}

onMounted(() => activitiesStore.fetchAdminList())

function openCreate() {
  editItem.value = null
  form.value = {
    title: '',
    summary: '',
    content: '',
    cover_image_url: '',
    location: '',
    start_time: '',
    end_time: '',
    status: 'draft',
    sort_order: 0,
  }
  showModal.value = true
}

function openEdit(item) {
  editItem.value = item
  form.value = {
    title: item.title,
    summary: item.summary || '',
    content: item.content || '',
    cover_image_url: item.cover_image_url || '',
    location: item.location || '',
    start_time: toDatetimeLocal(item.start_time),
    end_time: toDatetimeLocal(item.end_time),
    status: item.status || 'draft',
    sort_order: item.sort_order || 0,
  }
  showModal.value = true
}

async function handleUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  uploading.value = true
  try {
    const res = await uploadFile(file)
    if (res.code === 200) {
      form.value.cover_image_url = res.data.url
    } else {
      alert(res.message || '上传失败')
    }
  } catch (err) {
    alert(err.response?.data?.message || err.message || '上传失败')
  } finally {
    uploading.value = false
  }
}

async function handleSubmit() {
  const payload = {
    ...form.value,
    start_time: fromDatetimeLocal(form.value.start_time),
    end_time: fromDatetimeLocal(form.value.end_time),
  }
  if (editItem.value) {
    await activitiesStore.update(editItem.value.id, payload)
  } else {
    await activitiesStore.create(payload)
  }
  showModal.value = false
}

async function handleDelete(id) {
  if (confirm('确定删除该活动？')) await activitiesStore.remove(id)
}

function openShare(item) {
  shareActivity.value = item
  shareVisible.value = true
}

function statusLabel(status) {
  return statusOptions.find(o => o.value === status)?.label || status
}
</script>

<template>
  <div>
    <div class="admin-header">
      <h1>活动管理</h1>
      <button class="btn btn-primary" @click="openCreate">+ 新增活动</button>
    </div>
    <ModuleVisibilityToggle module-id="activities" />
    <div class="admin-card">
      <table class="admin-table">
        <thead>
          <tr>
            <th>封面</th>
            <th>标题</th>
            <th>状态</th>
            <th>时间</th>
            <th>排序</th>
            <th>浏览</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in activitiesStore.items" :key="item.id">
            <td>
              <img v-if="item.cover_image_url" :src="item.cover_image_url" class="table-thumb" alt="">
              <span v-else class="table-icon">🎉</span>
            </td>
            <td>{{ item.title }}</td>
            <td>
              <span class="status-tag" :class="item.status">{{ statusLabel(item.status) }}</span>
            </td>
            <td class="time-cell">{{ item.start_time || '—' }}</td>
            <td>{{ item.sort_order }}</td>
            <td>{{ item.view_count || 0 }}</td>
            <td class="actions-cell">
              <button class="btn btn-ghost btn-sm" @click="openEdit(item)">编辑</button>
              <button v-if="item.status !== 'draft'" class="btn btn-ghost btn-sm" @click="openShare(item)">分享</button>
              <button class="btn btn-danger btn-sm" @click="handleDelete(item.id)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!activitiesStore.items.length" style="color: var(--text-muted); text-align: center; padding: 40px;">暂无数据</p>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal modal-wide">
        <div class="modal-header">
          <h3>{{ editItem ? '编辑活动' : '新增活动' }}</h3>
          <button class="modal-close" @click="showModal = false">×</button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>标题 *</label>
            <input v-model="form.title" required>
          </div>
          <div class="form-group">
            <label>摘要（列表/分享卡片描述）</label>
            <textarea v-model="form.summary" rows="2"></textarea>
          </div>
          <div class="form-group">
            <label>详情正文（支持简单 HTML）</label>
            <textarea v-model="form.content" rows="6" placeholder="<p>活动详情...</p>"></textarea>
          </div>
          <div class="form-group">
            <label>封面图</label>
            <div class="upload-area">
              <input type="file" accept="image/*" @change="handleUpload" style="display: none;" id="activity-upload">
              <label for="activity-upload" class="upload-btn">
                {{ uploading ? '上传中...' : '选择图片' }}
              </label>
              <img v-if="form.cover_image_url" :src="form.cover_image_url" class="preview-img" alt="">
            </div>
            <input v-model="form.cover_image_url" placeholder="或直接输入图片 URL" style="margin-top: 8px;">
          </div>
          <div class="form-group">
            <label>活动地点</label>
            <input v-model="form.location" placeholder="如：尚润装饰展厅">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>开始时间</label>
              <input v-model="form.start_time" type="datetime-local">
            </div>
            <div class="form-group">
              <label>结束时间</label>
              <input v-model="form.end_time" type="datetime-local">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>状态</label>
              <select v-model="form.status" class="form-select">
                <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>排序</label>
              <input v-model.number="form.sort_order" type="number">
            </div>
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%;">保存</button>
        </form>
      </div>
    </div>

    <ShareActivityModal v-model:visible="shareVisible" :activity="shareActivity" />
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

.status-tag {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.status-tag.draft {
  background: rgba(113, 113, 122, 0.15);
  color: var(--text-muted);
}

.status-tag.published {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.status-tag.ended {
  background: rgba(249, 115, 22, 0.15);
  color: #f97316;
}

.time-cell {
  font-size: 13px;
  color: var(--text-muted);
  max-width: 160px;
}

.actions-cell {
  white-space: nowrap;
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
}

.preview-img {
  width: 80px;
  height: 45px;
  object-fit: cover;
  border-radius: 6px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.modal-wide {
  max-width: 560px;
}

.form-select {
  width: 100%;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-size: 15px;
  color: var(--text-primary);
  font-family: inherit;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
