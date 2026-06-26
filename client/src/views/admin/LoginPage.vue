<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({ username: '', password: '' })
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  const res = await authStore.login(form.value.username, form.value.password)
  loading.value = false
  if (res.code === 200) {
    const role = res.data.role
    const redirect = router.currentRoute.value.query.redirect
    if (typeof redirect === 'string' && redirect.startsWith('/')) {
      router.push(redirect)
    } else if (role === 'admin') {
      router.push('/admin')
    } else if (role === 'employee') {
      router.push('/employee')
    } else {
      router.push('/')
    }
  } else {
    error.value = res.message
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-logo">
        <div class="logo-icon">◆</div>
      </div>
      <h2>登录</h2>
      <p class="login-subtitle">请输入账号密码登录系统</p>
      <form @submit.prevent="handleLogin">
        <div v-if="error" class="login-error">{{ error }}</div>
        <div class="form-group">
          <label>用户名</label>
          <input v-model="form.username" type="text" placeholder="请输入用户名" required>
        </div>
        <div class="form-group">
          <label>密码</label>
          <input v-model="form.password" type="password" placeholder="请输入密码" required>
        </div>
        <button type="submit" class="login-btn" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
      <div class="login-hint">默认账号：admin / admin123</div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 40px;
}

.login-logo {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.logo-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.login-card h2 {
  text-align: center;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
}

.login-subtitle {
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
  margin-bottom: 32px;
}

.login-error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #ef4444;
  padding: 10px 14px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
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

.form-group input {
  width: 100%;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-primary);
  transition: all var(--transition);
  font-family: inherit;
}

.form-group input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.login-btn {
  width: 100%;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  padding: 14px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all var(--transition);
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.4);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-hint {
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
  margin-top: 20px;
}
</style>
