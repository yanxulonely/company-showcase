<script setup>
import { ref, onMounted } from 'vue'
import { useUsersStore } from '../../stores/users'

const usersStore = useUsersStore()
const showModal = ref(false)
const showResetModal = ref(false)
const editItem = ref(null)
const resetItem = ref(null)
const filterRole = ref('')
const form = ref({ username: '', password: '', role: 'user', display_name: '', phone: '' })
const resetForm = ref({ password: '' })

onMounted(() => loadUsers())

async function loadUsers() {
  await usersStore.fetchAll(filterRole.value || undefined)
}

function openCreate() {
  editItem.value = null
  form.value = { username: '', password: '', role: 'user', display_name: '', phone: '' }
  showModal.value = true
}

function openEdit(item) {
  editItem.value = item
  form.value = {
    username: item.username,
    password: '',
    role: item.role,
    display_name: item.display_name || '',
    phone: item.phone || ''
  }
  showModal.value = true
}

function openReset(item) {
  resetItem.value = item
  resetForm.value = { password: '' }
  showResetModal.value = true
}

async function handleSubmit() {
  const data = { ...form.value }
  if (editItem.value) {
    if (!data.password) delete data.password
    const res = await usersStore.update(editItem.value.id, data)
    if (res.code === 200) showModal.value = false
  } else {
    if (!data.password) {
      alert('新用户密码不能为空')
      return
    }
    const res = await usersStore.create(data)
    if (res.code === 200) showModal.value = false
  }
}

async function handleResetPassword() {
  if (!resetForm.value.password) {
    alert('密码不能为空')
    return
  }
  const res = await usersStore.resetPassword(resetItem.value.id, resetForm.value.password)
  if (res.code === 200) {
    showResetModal.value = false
    alert('密码已重置')
  }
}

async function handleToggle(item) {
  await usersStore.toggle(item.id)
}

async function handleDelete(id) {
  if (confirm('确定删除该用户？')) await usersStore.remove(id)
}

function onFilterChange() {
  loadUsers()
}

function getRoleLabel(role) {
  const map = { admin: '管理员', employee: '员工', user: '用户' }
  return map[role] || role
}

function getRoleClass(role) {
  const map = { admin: 'role-admin', employee: 'role-employee', user: 'role-user' }
  return map[role] || ''
}
</script>

<template>
  <div>
    <div class="admin-header">
      <h1>员工管理</h1>
      <div class="header-actions">
        <select v-model="filterRole" @change="onFilterChange" class="filter-select">
          <option value="">全部角色</option>
          <option value="admin">管理员</option>
          <option value="employee">员工</option>
          <option value="user">用户</option>
        </select>
        <button class="btn btn-primary" @click="openCreate">+ 新增用户</button>
      </div>
    </div>
    <div class="admin-card">
      <table class="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>用户名</th>
            <th>显示名</th>
            <th>角色</th>
            <th>手机号</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in usersStore.items" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.username }}</td>
            <td>{{ item.display_name || '-' }}</td>
            <td><span :class="['role-badge', getRoleClass(item.role)]">{{ getRoleLabel(item.role) }}</span></td>
            <td>{{ item.phone || '-' }}</td>
            <td>
              <span :class="['status-badge', item.is_active ? 'active' : 'inactive']">
                {{ item.is_active ? '启用' : '禁用' }}
              </span>
            </td>
            <td>
              <button class="btn btn-ghost btn-sm" @click="openEdit(item)">编辑</button>
              <button class="btn btn-ghost btn-sm" @click="openReset(item)">重置密码</button>
              <button class="btn btn-ghost btn-sm" @click="handleToggle(item)">
                {{ item.is_active ? '禁用' : '启用' }}
              </button>
              <button v-if="item.username !== 'admin'" class="btn btn-danger btn-sm" @click="handleDelete(item.id)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!usersStore.items.length" style="color: var(--text-muted); text-align: center; padding: 40px;">暂无数据</p>
    </div>

    <!-- 创建/编辑模态框 -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ editItem ? '编辑用户' : '新增用户' }}</h3>
          <button class="modal-close" @click="showModal = false">×</button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>用户名</label>
            <input v-model="form.username" required :disabled="!!editItem">
          </div>
          <div v-if="!editItem" class="form-group">
            <label>密码</label>
            <input v-model="form.password" type="password" required placeholder="请输入密码">
          </div>
          <div class="form-group">
            <label>显示名</label>
            <input v-model="form.display_name" placeholder="如：张三">
          </div>
          <div class="form-group">
            <label>角色</label>
            <select v-model="form.role">
              <option value="user">用户</option>
              <option value="employee">员工</option>
              <option value="admin">管理员</option>
            </select>
          </div>
          <div class="form-group">
            <label>手机号</label>
            <input v-model="form.phone" placeholder="选填">
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%;">保存</button>
        </form>
      </div>
    </div>

    <!-- 重置密码模态框 -->
    <div v-if="showResetModal" class="modal-overlay" @click.self="showResetModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>重置密码 - {{ resetItem?.username }}</h3>
          <button class="modal-close" @click="showResetModal = false">×</button>
        </div>
        <form @submit.prevent="handleResetPassword">
          <div class="form-group">
            <label>新密码</label>
            <input v-model="resetForm.password" type="password" required placeholder="请输入新密码">
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%;">确认重置</button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

@media (max-width: 768px) {
  .header-actions {
    width: 100%;
    flex-direction: column;
  }

  .header-actions .filter-select {
    width: 100%;
  }
}
</style>
