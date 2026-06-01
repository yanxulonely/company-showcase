<script setup>
import { ref, onMounted } from 'vue'
import { useAppStore } from '../../stores/app'

const appStore = useAppStore()
const form = ref({})
const saved = ref(false)

onMounted(() => {
  form.value = { ...appStore.settings }
})

async function handleSave() {
  await appStore.updateSettings(form.value)
  saved.value = true
  setTimeout(() => { saved.value = false }, 2000)
}
</script>

<template>
  <div>
    <div class="admin-header">
      <h1>系统设置</h1>
    </div>
    <div class="admin-card">
      <div v-if="saved" class="save-success">设置已保存！</div>
      <form @submit.prevent="handleSave">
        <div class="form-group">
          <label>公司名称</label>
          <input v-model="form.company_name">
        </div>
        <div class="form-group">
          <label>公司标语</label>
          <input v-model="form.company_slogan">
        </div>
        <div class="form-group">
          <label>Hero 标题 (支持 HTML)</label>
          <textarea v-model="form.hero_title" rows="2"></textarea>
        </div>
        <div class="form-group">
          <label>Hero 描述</label>
          <textarea v-model="form.hero_desc" rows="3"></textarea>
        </div>
        <div class="form-group">
          <label>联系地址</label>
          <input v-model="form.contact_address">
        </div>
        <div class="form-group">
          <label>联系电话</label>
          <input v-model="form.contact_phone">
        </div>
        <div class="form-group">
          <label>联系邮箱</label>
          <input v-model="form.contact_email">
        </div>
        <div class="form-group">
          <label>页脚文字</label>
          <input v-model="form.footer_text">
        </div>
        <button type="submit" class="btn btn-primary">保存设置</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.admin-header { margin-bottom: 32px; }
.admin-header h1 { font-size: 24px; font-weight: 700; }
.admin-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 32px; max-width: 640px; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; font-weight: 500; color: var(--text-secondary); margin-bottom: 8px; font-size: 14px; }
.form-group input, .form-group textarea { width: 100%; padding: 12px 16px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; font-size: 14px; color: var(--text-primary); font-family: inherit; }
.form-group input:focus, .form-group textarea:focus { outline: none; border-color: var(--accent); }
.form-group textarea { resize: vertical; }
.btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 500; border: none; cursor: pointer; transition: all 0.3s ease; }
.btn-primary { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4); }
.save-success { background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.2); color: #22c55e; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; text-align: center; }
</style>
