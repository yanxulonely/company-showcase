<script setup>
import { ref } from 'vue'
import { useAppStore } from '../stores/app'
import { useAuthStore } from '../stores/auth'
import ThemeToggle from './ThemeToggle.vue'
import { computed } from 'vue'

const appStore = useAppStore()
const authStore = useAuthStore()
const menuOpen = ref(false)

const isEmployee = computed(() => authStore.isEmployee)

const navLinks = [
  { label: '首页', href: '#home' },
  { label: '案例', href: '#cases' },
  { label: '设计师', href: '#designers' },
  { label: '能力', href: '#capabilities' },
  { label: '评价', href: '#reviews' },
  { label: '标准', href: '#standards' },
]

function scrollTo(hash) {
  menuOpen.value = false
  const el = document.querySelector(hash)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function closeMenu() {
  menuOpen.value = false
}
</script>

<template>
  <nav class="navbar">
    <div class="nav-content">
      <div class="logo">
        <div class="logo-icon">◆</div>
        <span class="logo-text">{{ appStore.settings.company_name || '公司名称' }}</span>
      </div>
      <div class="nav-right">
        <button
          type="button"
          class="menu-toggle"
          :aria-expanded="menuOpen"
          aria-label="打开菜单"
          @click="menuOpen = !menuOpen"
        >
          <span :class="{ open: menuOpen }"></span>
        </button>
        <div class="nav-links" :class="{ open: menuOpen }">
          <a v-for="link in navLinks" :key="link.label" :href="link.href" @click.prevent="scrollTo(link.href)">
            {{ link.label }}
          </a>
          <a href="#contact" class="nav-cta" @click.prevent="scrollTo('#contact')">联系我们</a>
          <router-link
            v-if="isEmployee"
            to="/employee"
            class="nav-employee"
            @click="closeMenu"
          >
            👤 员工入口
          </router-link>
          <router-link
            v-else
            to="/admin/login"
            class="nav-employee"
            @click="closeMenu"
          >
            👤 员工入口
          </router-link>
        </div>
        <ThemeToggle />
      </div>
    </div>
    <div v-if="menuOpen" class="nav-overlay" @click="closeMenu"></div>
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
  min-width: 0;
}

.logo-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logo-icon {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
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

.menu-toggle {
  display: none;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card);
  cursor: pointer;
  align-items: center;
  justify-content: center;
}

.menu-toggle span,
.menu-toggle span::before,
.menu-toggle span::after {
  display: block;
  width: 18px;
  height: 2px;
  background: var(--text-primary);
  border-radius: 2px;
  transition: transform 0.25s ease, opacity 0.25s ease;
  position: relative;
}

.menu-toggle span::before,
.menu-toggle span::after {
  content: '';
  position: absolute;
  left: 0;
}

.menu-toggle span::before { top: -6px; }
.menu-toggle span::after { top: 6px; }

.menu-toggle span.open {
  background: transparent;
}

.menu-toggle span.open::before {
  top: 0;
  transform: rotate(45deg);
}

.menu-toggle span.open::after {
  top: 0;
  transform: rotate(-45deg);
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

.nav-overlay {
  display: none;
}

@media (max-width: 1024px) {
  .navbar {
    padding: 0 16px;
  }

  .menu-toggle {
    display: flex;
  }

  .nav-links {
    position: fixed;
    top: 72px;
    right: 0;
    width: min(320px, 88vw);
    height: calc(100vh - 72px);
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    padding: 16px;
    background: var(--bg-primary);
    border-left: 1px solid var(--border);
    box-shadow: -8px 0 32px rgba(0, 0, 0, 0.15);
    transform: translateX(100%);
    transition: transform 0.3s ease;
    overflow-y: auto;
    z-index: 1001;
  }

  .nav-links.open {
    transform: translateX(0);
  }

  .nav-links a {
    padding: 14px 12px;
    border-radius: 8px;
    font-size: 15px;
  }

  .nav-links a:hover {
    background: var(--bg-secondary);
  }

  .nav-links a::after {
    display: none;
  }

  .nav-cta,
  .nav-employee,
  .nav-login-link {
    text-align: center;
    margin-top: 8px;
  }

  .nav-overlay {
    display: block;
    position: fixed;
    inset: 72px 0 0 0;
    background: rgba(0, 0, 0, 0.45);
    z-index: 1000;
  }

  .nav-right {
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .logo-text {
    max-width: 140px;
  }
}
</style>
