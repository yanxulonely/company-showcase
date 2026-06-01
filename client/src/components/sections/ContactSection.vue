<script setup>
import { ref } from 'vue'
import { useAppStore } from '../../stores/app'
import { useContactsStore } from '../../stores/contacts'

const appStore = useAppStore()
const contactsStore = useContactsStore()

const form = ref({ name: '', company: '', contact_info: '', message: '' })
const submitting = ref(false)
const submitted = ref(false)

async function handleSubmit() {
  if (!form.value.name) return
  submitting.value = true
  const res = await contactsStore.submit(form.value)
  submitting.value = false
  if (res.code === 200) {
    submitted.value = true
    form.value = { name: '', company: '', contact_info: '', message: '' }
    setTimeout(() => { submitted.value = false }, 3000)
  }
}
</script>

<template>
  <section class="section" id="contact">
    <div class="contact-container">
      <div class="contact-info fade-in-up">
        <h3>开始合作</h3>
        <p>无论是项目咨询还是技术交流，我们都期待与您的对话。通常在 24 小时内回复。</p>
        <ul class="contact-details">
          <li>
            <span>📍</span>
            <span>{{ appStore.settings.contact_address || '北京市朝阳区科技大厦' }}</span>
          </li>
          <li>
            <span>📞</span>
            <span>{{ appStore.settings.contact_phone || '400-888-8888' }}</span>
          </li>
          <li>
            <span>✉️</span>
            <span>{{ appStore.settings.contact_email || 'contact@company.com' }}</span>
          </li>
        </ul>
      </div>
      <form class="contact-form fade-in-up" style="transition-delay: 0.1s" @submit.prevent="handleSubmit">
        <div v-if="submitted" class="form-success">提交成功！我们会尽快与您联系。</div>
        <div class="form-group">
          <label>姓名</label>
          <input v-model="form.name" type="text" placeholder="您的姓名" required>
        </div>
        <div class="form-group">
          <label>公司</label>
          <input v-model="form.company" type="text" placeholder="公司名称">
        </div>
        <div class="form-group">
          <label>联系方式</label>
          <input v-model="form.contact_info" type="text" placeholder="手机号或邮箱">
        </div>
        <div class="form-group">
          <label>需求描述</label>
          <textarea v-model="form.message" placeholder="请简要描述您的需求..."></textarea>
        </div>
        <button type="submit" class="form-submit" :disabled="submitting">
          {{ submitting ? '提交中...' : '提交咨询' }}
        </button>
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
  align-items: center;
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
.form-group textarea {
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
.form-group textarea:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: var(--text-muted);
}

.form-group textarea {
  min-height: 120px;
  resize: vertical;
}

.form-submit {
  width: 100%;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  padding: 16px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all var(--transition);
  position: relative;
  overflow: hidden;
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
</style>
