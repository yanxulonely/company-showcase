<script setup>
import { ref, onMounted } from 'vue'
import { useAppStore } from '../../stores/app'
import { uploadFile } from '../../utils/upload'
import ModuleVisibilityToggle from '../../components/admin/ModuleVisibilityToggle.vue'

const appStore = useAppStore()
const form = ref({})
const saved = ref(false)
const uploadingQr = ref(false)

onMounted(() => {
  form.value = { ...appStore.settings }
})

async function handleSave() {
  await appStore.updateSettings(form.value)
  saved.value = true
  setTimeout(() => { saved.value = false }, 2000)
}

async function handleQrUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  uploadingQr.value = true
  try {
    const res = await uploadFile(file)
    if (res.code === 200) {
      form.value.wechat_qr_url = res.data.url
    } else {
      alert(res.message || '上传失败')
    }
  } catch (err) {
    alert(err.response?.data?.message || err.message || '上传失败')
  } finally {
    uploadingQr.value = false
  }
}
</script>

<template>
  <div>
    <div class="admin-header">
      <h1>系统设置</h1>
    </div>
    <ModuleVisibilityToggle module-id="stats" />
    <ModuleVisibilityToggle module-id="contact" />
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
          <label>营业时间</label>
          <input v-model="form.business_hours" placeholder="如：周一至周五 9:00 - 18:00">
        </div>
        <div class="form-group">
          <label>官网二维码（扫码访问网站）</label>
          <input v-model="form.site_qr_url" placeholder="/uploads/seed/site-qr.png">
          <img v-if="form.site_qr_url" :src="form.site_qr_url" class="preview-qr" alt="官网二维码" style="margin-top: 8px;">
        </div>
        <div class="form-group">
          <label>微信二维码</label>
          <div class="upload-area">
            <input type="file" accept="image/*" @change="handleQrUpload" style="display: none;" id="wechat-qr-upload">
            <label for="wechat-qr-upload" class="upload-btn">
              {{ uploadingQr ? '上传中...' : '上传二维码' }}
            </label>
            <img v-if="form.wechat_qr_url" :src="form.wechat_qr_url" class="preview-qr" alt="微信二维码">
          </div>
          <input v-model="form.wechat_qr_url" placeholder="或直接输入图片 URL" style="margin-top: 8px;">
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

.upload-btn:hover {
  border-color: var(--accent);
}

.preview-qr {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--border);
}

@media (max-width: 768px) {
  .admin-card {
    max-width: 100%;
  }
}
</style>
