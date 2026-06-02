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
.save-success {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.2);
  color: #22c55e;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  margin-bottom: 20px;
  font-size: 14px;
  text-align: center;
}

@media (max-width: 768px) {
  .admin-card {
    max-width: 100%;
  }
}
</style>
