<script setup>
import { ref } from 'vue'
import { useAppStore } from '../../stores/app'
import { useContactsStore } from '../../stores/contacts'

const props = defineProps({
  preferredDesigner: { type: Object, default: null },
  preferredActivity: { type: Object, default: null },
})

const emit = defineEmits(['clear-designer', 'clear-activity'])

const appStore = useAppStore()
const contactsStore = useContactsStore()

const form = ref({ name: '', phone: '', address: '', area: '', budget: '' })
const submitting = ref(false)
const submitted = ref(false)

const budgetOptions = ['5万以内', '5-10万', '10-30万', '30-50万', '50万以上']

async function handleSubmit() {
  if (!form.value.name || !form.value.phone) return
  submitting.value = true
  const payload = { ...form.value }
  if (props.preferredDesigner) {
    payload.designer_id = props.preferredDesigner.id
    payload.designer_name = props.preferredDesigner.name
  }
  if (props.preferredActivity?.title) {
    payload.activity_title = props.preferredActivity.title
  }
  const res = await contactsStore.submit(payload)
  submitting.value = false
  if (res.code === 200) {
    submitted.value = true
    form.value = { name: '', phone: '', address: '', area: '', budget: '' }
    emit('clear-designer')
    emit('clear-activity')
    setTimeout(() => { submitted.value = false }, 3000)
  }
}
</script>

<template>
  <section class="section" id="contact">
    <div class="contact-container">
      <!-- 左侧：联系信息 + 微信二维码 -->
      <div class="contact-info fade-in-up">
        <h3>开始合作</h3>
        <p>无论是装修咨询还是设计方案，我们都期待与您的对话。通常在 24 小时内回复。</p>
        <ul class="contact-details">
          <li>
            <span>📍</span>
            <div>
              <div class="detail-label">公司地址</div>
              <div>{{ appStore.settings.contact_address || '请在后台设置公司地址' }}</div>
            </div>
          </li>
          <li>
            <span>📞</span>
            <div>
              <div class="detail-label">咨询电话</div>
              <div>{{ appStore.settings.contact_phone || '请在后台设置联系电话' }}</div>
            </div>
          </li>
          <li>
            <span>🕐</span>
            <div>
              <div class="detail-label">营业时间</div>
              <div>{{ appStore.settings.business_hours || '周一至周五 9:00 - 18:00' }}</div>
            </div>
          </li>
          <li>
            <span>✉️</span>
            <div>
              <div class="detail-label">电子邮箱</div>
              <div>{{ appStore.settings.contact_email || 'contact@company.com' }}</div>
            </div>
          </li>
        </ul>
        <!-- 官网二维码 -->
        <div class="wechat-section">
          <div class="wechat-label">扫码访问官网</div>
          <div class="wechat-qr">
            <img v-if="appStore.settings.site_qr_url || appStore.settings.wechat_qr_url" :src="appStore.settings.site_qr_url || appStore.settings.wechat_qr_url" alt="官网二维码" class="qr-image">
            <div v-else class="qr-placeholder">
              <span>📱</span>
              <span class="qr-text">请在后台配置官网二维码</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：简化表单 -->
      <form class="contact-form fade-in-up" style="transition-delay: 0.1s" @submit.prevent="handleSubmit">
        <div class="form-header">
          <h4>预约咨询</h4>
          <p>请填写以下信息，我们将尽快与您联系</p>
        </div>
        <div v-if="submitted" class="form-success">✅ 提交成功！我们会尽快与您联系。</div>
        <div v-if="preferredDesigner" class="designer-pick">
          <span>已选择意向设计师：<strong>{{ preferredDesigner.name }}</strong></span>
          <button type="button" class="clear-pick" @click="emit('clear-designer')">取消</button>
        </div>
        <div v-if="preferredActivity" class="designer-pick activity-pick">
          <span>咨询活动：<strong>{{ preferredActivity.title }}</strong></span>
          <button type="button" class="clear-pick" @click="emit('clear-activity')">取消</button>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>姓名 <span class="required">*</span></label>
            <input v-model="form.name" type="text" placeholder="您的姓名" required>
          </div>
          <div class="form-group">
            <label>手机号 <span class="required">*</span></label>
            <input v-model="form.phone" type="tel" placeholder="您的手机号" required>
          </div>
        </div>
        <div class="form-group">
          <label>装修地址</label>
          <input v-model="form.address" type="text" placeholder="房屋地址（选填）">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>面积</label>
            <input v-model="form.area" type="text" placeholder="如：120㎡">
          </div>
          <div class="form-group">
            <label>预算</label>
            <select v-model="form.budget" class="form-select">
              <option value="">请选择预算范围</option>
              <option v-for="opt in budgetOptions" :key="opt" :value="opt">{{ opt }}</option>
            </select>
          </div>
        </div>
        <button type="submit" class="form-submit" :disabled="submitting">
          {{ submitting ? '提交中...' : '立即预约咨询' }}
        </button>
        <p class="form-tip">提交即表示您同意我们的隐私政策，信息仅用于咨询服务</p>
      </form>
    </div>
  </section>
</template>

<style scoped>
.section {
  padding: 120px 40px;
}

.contact-container {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: start;
}

.contact-info h3 {
  font-size: 40px;
  font-weight: 700;
  margin-bottom: 20px;
  letter-spacing: -1px;
}

.contact-info > p {
  color: var(--text-muted);
  margin-bottom: 40px;
  line-height: 1.8;
}

.contact-details {
  list-style: none;
}

.contact-details li {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 0;
  color: var(--text-secondary);
  transition: all var(--transition);
}

.contact-details li:hover {
  padding-left: 8px;
  color: var(--text-primary);
}

.contact-details li span:first-child {
  width: 48px;
  height: 48px;
  min-width: 48px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all var(--transition);
}

.contact-details li:hover span:first-child {
  border-color: var(--accent);
  transform: scale(1.1);
}

.detail-label {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 微信二维码 */
.wechat-section {
  margin-top: 40px;
  padding-top: 32px;
  border-top: 1px solid var(--border);
}

.wechat-label {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 16px;
  font-weight: 500;
}

.wechat-qr {
  width: 160px;
  height: 160px;
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}

.qr-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.qr-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--bg-secondary);
  font-size: 40px;
}

.qr-text {
  font-size: 12px;
  color: var(--text-muted);
}

/* 表单 */
.contact-form {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 40px;
  position: relative;
  overflow: hidden;
}

.contact-form::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--accent), #8b5cf6, #ec4899);
}

.form-header {
  margin-bottom: 28px;
}

.form-header h4 {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 8px;
}

.form-header p {
  color: var(--text-muted);
  font-size: 14px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
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

.required {
  color: #ef4444;
}

.form-group input,
.form-group textarea,
.form-select {
  width: 100%;
  padding: 14px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 15px;
  color: var(--text-primary);
  transition: all var(--transition);
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus,
.form-select:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: var(--text-muted);
}

.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2371717a' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  cursor: pointer;
}

.form-submit {
  width: 100%;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  padding: 16px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all var(--transition);
  position: relative;
  overflow: hidden;
  margin-top: 8px;
}

.form-submit::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.form-submit:hover::before {
  left: 100%;
}

.form-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.4);
}

.form-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.form-tip {
  text-align: center;
  color: var(--text-muted);
  font-size: 12px;
  margin-top: 12px;
}

.designer-pick {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  margin-bottom: 20px;
  border-radius: 10px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.25);
  font-size: 14px;
  color: var(--text-secondary);
}

.designer-pick strong {
  color: var(--accent-light);
}

.clear-pick {
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 13px;
  padding: 4px 8px;
}

.clear-pick:hover {
  color: var(--text-primary);
}

.form-success {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.2);
  color: #22c55e;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  text-align: center;
}

/* Responsive */
@media (max-width: 768px) {
  .section {
    padding: 80px 20px;
  }

  .contact-container {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .contact-info h3 {
    font-size: 28px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .contact-form {
    padding: 24px;
  }

  .wechat-qr {
    width: 120px;
    height: 120px;
  }
}
</style>
