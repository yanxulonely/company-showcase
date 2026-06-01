<script setup>
import { useAppStore } from '../stores/app'
import { useAuthStore } from '../stores/auth'
import ThemeToggle from './ThemeToggle.vue'
import { computed } from 'vue'

const appStore = useAppStore()
const authStore = useAuthStore()

const isLoggedIn = computed(() => authStore.isLoggedIn)
const isEmployee = computed(() => authStore.isEmployee)

const navLinks = [
  { label: '首页', href: '#home' },
  { label: '案例', href: '#cases' },
  { label: '能力', href: '#capabilities' },
  { label: '评价', href: '#reviews' },
  { label: '标准', href: '#standards' },
]

function scrollTo(hash) {
  const el = document.querySelector(hash)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <nav class="navbar">
    <div class="nav-content">
      <div class="logo">
        <div class="logo-icon">◆</div>
        {{ appStore.settings.company_name || '公司名称' }}
      </div>
      <div class="nav-right">
        <div class="nav-links">
          <a v-for="link in navLinks" :key="link.label" :href="link.href" @click.prevent="scrollTo(link.href)">
            {{ link.label }}
          </a>
          <a href="#contact" class="nav-cta" @click.prevent="scrollTo('#contact')">联系我们</a>
          <router-link v-if="isEmployee" to="/employee" class="nav-employee">
            👤 员工入口
          </router-link>
          <router-link v-else-if="!isLoggedIn" to="/admin/login" class="nav-login-link">
            🔑 登录
          </router-link>
        </div>
        <ThemeToggle />
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
  z-index: 1000;
  padding: 0 40px;
  transition: all var(--transition);
}

[data-theme="light"] .navbar {
  background: rgba(255, 255, 255, 0.8);
}

.nav-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 72px;
}

.logo {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  animation: logoFloat 3s ease-in-out infinite;
}

@keyframes logoFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-3px) rotate(5deg); }
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-links {
  display: flex;
  gap: 32px;
  align-items: center;
}

.nav-links a {
  text-decoration: none;
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 500;
  transition: color var(--transition);
  position: relative;
}

.nav-links a:hover {
  color: var(--text-primary);
}

.nav-links a::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  transition: width var(--transition);
}

.nav-links a:hover::after {
  width: 100%;
}

.nav-cta {
  background: var(--text-primary);
  color: var(--bg-primary) !important;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  transition: all var(--transition);
}

.nav-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.nav-cta::after {
  display: none !important;
}

.nav-employee {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white !important;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  transition: all var(--transition);
  font-size: 13px;
}

.nav-employee:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.nav-employee::after {
  display: none !important;
}

.nav-login-link {
  color: var(--text-muted) !important;
  font-size: 14px;
  font-weight: 500;
}

.nav-login-link::after {
  display: none !important;
}
</style>
