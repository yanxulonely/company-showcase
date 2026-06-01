<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

function logout() {
  authStore.logout()
  router.push('/admin/login')
}

const navItems = [
  { path: '/admin', label: '仪表盘', icon: '📊' },
  { path: '/admin/cases', label: '案例管理', icon: '📁' },
  { path: '/admin/capabilities', label: '能力管理', icon: '⚡' },
  { path: '/admin/reviews', label: '评价管理', icon: '💬' },
  { path: '/admin/standards', label: '标准管理', icon: '📋' },
  { path: '/admin/contacts', label: '联系管理', icon: '✉️' },
  { path: '/admin/settings', label: '系统设置', icon: '⚙️' },
]
</script>

<template>
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <div class="sidebar-logo">
        <div class="logo-icon">◆</div>
        后台管理
      </div>
      <nav class="admin-nav">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          :class="{ active: route.path === item.path }"
        >
          <span>{{ item.icon }}</span>
          {{ item.label }}
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <a href="/" target="_blank" class="sidebar-link">🌐 查看前台</a>
        <button @click="logout" class="sidebar-link logout">🚪 退出登录</button>
      </div>
    </aside>
    <main class="admin-main">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.admin-sidebar {
  width: 240px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  padding: 24px 0;
  position: fixed;
  height: 100vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.sidebar-logo {
  padding: 0 24px 24px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}

.sidebar-logo .logo-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
}

.admin-nav {
  flex: 1;
}

.admin-nav a {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 500;
  transition: all var(--transition);
  text-decoration: none;
}

.admin-nav a:hover {
  color: var(--text-primary);
  background: var(--bg-card);
}

.admin-nav a.router-link-exact-active,
.admin-nav a.active {
  color: var(--accent);
  background: rgba(59, 130, 246, 0.1);
  border-right: 3px solid var(--accent);
}

.sidebar-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border);
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  color: var(--text-muted);
  font-size: 13px;
  text-decoration: none;
  transition: color var(--transition);
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  width: 100%;
}

.sidebar-link:hover {
  color: var(--text-primary);
}

.sidebar-link.logout:hover {
  color: #ef4444;
}

.admin-main {
  flex: 1;
  margin-left: 240px;
  padding: 32px;
}
</style>
