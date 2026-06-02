<script setup>
import { ref, onMounted } from 'vue'
import { useContactsStore } from '../../stores/contacts'

const store = useContactsStore()
const statusFilter = ref('all')
const editingNote = ref(null)
const noteText = ref('')

const statusMap = {
  pending: { label: '待跟进', class: 'badge-pending' },
  contacted: { label: '已联系', class: 'badge-contacted' },
  invalid: { label: '无效', class: 'badge-invalid' },
}

function loadData() {
  store.fetchAll(statusFilter.value)
  store.fetchStats()
}

function setFilter(status) {
  statusFilter.value = status
  loadData()
}

async function changeStatus(id, status) {
  await store.updateStatus(id, status)
  store.fetchStats()
}

function startEditNote(item) {
  editingNote.value = item.id
  noteText.value = item.note || ''
}

async function saveNote(id) {
  await store.updateNote(id, noteText.value)
  editingNote.value = null
  noteText.value = ''
}

function cancelEditNote() {
  editingNote.value = null
  noteText.value = ''
}

async function handleDelete(id) {
  if (!confirm('确定删除该线索？')) return
  await store.remove(id)
  store.fetchStats()
}

async function handleExport() {
  try {
    await store.exportExcel(statusFilter.value)
  } catch (e) {
    alert('导出失败: ' + e.message)
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div>
    <div class="admin-header">
      <h1>线索管理</h1>
      <button class="btn btn-export" @click="handleExport">📥 导出 Excel</button>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card" @click="setFilter('all')">
        <div class="stat-number">{{ store.stats.total }}</div>
        <div class="stat-label">全部线索</div>
      </div>
      <div class="stat-card stat-pending" @click="setFilter('pending')">
        <div class="stat-number">{{ store.stats.pending }}</div>
        <div class="stat-label">待跟进</div>
      </div>
      <div class="stat-card stat-contacted" @click="setFilter('contacted')">
        <div class="stat-number">{{ store.stats.contacted }}</div>
        <div class="stat-label">已联系</div>
      </div>
      <div class="stat-card stat-invalid" @click="setFilter('invalid')">
        <div class="stat-number">{{ store.stats.invalid }}</div>
        <div class="stat-label">无效</div>
      </div>
    </div>

    <!-- 状态筛选 -->
    <div class="filter-bar">
      <button class="filter-btn" :class="{ active: statusFilter === 'all' }" @click="setFilter('all')">全部</button>
      <button class="filter-btn" :class="{ active: statusFilter === 'pending' }" @click="setFilter('pending')">待跟进</button>
      <button class="filter-btn" :class="{ active: statusFilter === 'contacted' }" @click="setFilter('contacted')">已联系</button>
      <button class="filter-btn" :class="{ active: statusFilter === 'invalid' }" @click="setFilter('invalid')">无效</button>
    </div>

    <!-- 线索列表 -->
    <div class="admin-card">
      <table class="admin-table">
        <thead>
          <tr>
            <th>提交时间</th>
            <th>姓名</th>
            <th>手机号</th>
            <th>需求描述</th>
            <th>状态</th>
            <th>跟进备注</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in store.items" :key="item.id">
            <td class="cell-time">{{ new Date(item.created_at).toLocaleString() }}</td>
            <td class="cell-name">{{ item.name }}</td>
            <td>{{ item.contact_info || '-' }}</td>
            <td class="cell-desc">
              <span :title="item.message">{{ item.message || '-' }}</span>
            </td>
            <td>
              <span class="badge" :class="statusMap[item.status]?.class || 'badge-pending'">
                {{ statusMap[item.status]?.label || item.status }}
              </span>
            </td>
            <td class="cell-note">
              <template v-if="editingNote === item.id">
                <div class="note-editor">
                  <textarea v-model="noteText" rows="2" placeholder="输入跟进备注..."></textarea>
                  <div class="note-actions">
                    <button class="btn btn-sm btn-primary" @click="saveNote(item.id)">保存</button>
                    <button class="btn btn-sm btn-ghost" @click="cancelEditNote">取消</button>
                  </div>
                </div>
              </template>
              <template v-else>
                <span class="note-text" @click="startEditNote(item)" :title="item.note || '点击添加备注'">
                  {{ item.note || '点击添加备注' }}
                </span>
              </template>
            </td>
            <td class="cell-actions">
              <div class="action-group">
                <select
                  v-if="item.status !== 'contacted'"
                  class="status-select"
                  @change="changeStatus(item.id, $event.target.value)"
                >
                  <option value="" disabled selected>更改状态</option>
                  <option v-if="item.status !== 'pending'" value="pending">待跟进</option>
                  <option v-if="item.status !== 'contacted'" value="contacted">已联系</option>
                  <option v-if="item.status !== 'invalid'" value="invalid">无效</option>
                </select>
                <button class="btn btn-sm btn-danger" @click="handleDelete(item.id)">删除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!store.items.length" class="empty-tip">暂无线索数据</p>
    </div>
  </div>
</template>

<style scoped>
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-card .stat-number {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-card .stat-label {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 4px;
}

.stat-card.stat-pending .stat-number { color: #fbbf24; }
.stat-card.stat-contacted .stat-number { color: #22c55e; }
.stat-card.stat-invalid .stat-number { color: #ef4444; }

.filter-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.filter-btn {
  padding: 8px 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.filter-btn.active {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

.cell-time {
  color: var(--text-muted);
  font-size: 13px;
}

.cell-name {
  font-weight: 600;
}

.cell-desc {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cell-desc span {
  color: var(--text-secondary);
}

.cell-note {
  max-width: 200px;
}

.note-text {
  color: var(--text-muted);
  cursor: pointer;
  font-size: 13px;
  transition: color 0.2s;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.note-text:hover {
  color: var(--accent);
}

.note-editor textarea {
  width: 100%;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 13px;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 6px;
}

.note-editor textarea:focus {
  outline: none;
  border-color: var(--accent);
}

.note-actions {
  display: flex;
  gap: 6px;
}

.cell-actions {
  white-space: nowrap;
}

.action-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.status-select {
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 12px;
  cursor: pointer;
}

.status-select:focus {
  outline: none;
  border-color: var(--accent);
}

@media (max-width: 768px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .filter-bar {
    flex-wrap: wrap;
  }

  .cell-desc,
  .cell-note {
    max-width: 120px;
  }
}
</style>
