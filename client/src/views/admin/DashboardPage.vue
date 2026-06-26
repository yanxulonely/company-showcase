<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const sidebarOpen = ref(false)

function logout() {
  authStore.logout()
  router.push('/admin/login')
}

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

function closeSidebar() {
  sidebarOpen.value = false
}

const navItems = [
  { path: '/admin', label: '仪表盘', icon: '📊' },
  { path: '/admin/users', label: '员工管理', icon: '👥', adminOnly: true },
  { path: '/admin/banners', label: '轮播图管理', icon: '🖼️', adminOnly: true },
  { path: '/admin/material-categories', label: '资料分类', icon: '🏷️', adminOnly: true },
  { path: '/admin/materials', label: '资料库管理', icon: '📚', adminOnly: true },
  { path: '/admin/cases', label: '案例管理', icon: '📁' },
  { path: '/admin/designers', label: '设计师管理', icon: '🎨' },
  { path: '/admin/capabilities', label: '能力管理', icon: '⚡' },
  { path: '/admin/reviews', label: '评价管理', icon: '💬' },
  { path: '/admin/standards', label: '标准管理', icon: '📋' },
  { path: '/admin/contacts', label: '线索管理', icon: '✉️' },
  { path: '/admin/settings', label: '系统设置', icon: '⚙️' },
]
</script>

<template>
  <div class="admin-layout">
    <button class="sidebar-toggle" @click="toggleSidebar">☰</button>
    <div class="sidebar-overlay" :class="{ show: sidebarOpen }" @click="closeSidebar"></div>
    <aside class="admin-sidebar" :class="{ open: sidebarOpen }">
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
          @click="closeSidebar"
        >
          <span>{{ item.icon }}</span>
          {{ item.label }}
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <router-link to="/employee" class="sidebar-link" @click="closeSidebar">👤 员工资料库</router-link>
        <router-link to="/" class="sidebar-link" @click="closeSidebar">🌐 查看前台</router-link>
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
  z-index: 100;
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
  margin-top: auto;
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

/* Mobile */
.sidebar-toggle {
  display: none;
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 201;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 18px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
}

.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 99;
}

@media (max-width: 768px) {
  .admin-sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .admin-sidebar.open {
    transform: translateX(0);
  }

  .sidebar-toggle {
    display: flex;
  }

  .sidebar-overlay.show {
    display: block;
  }

  .admin-main {
    margin-left: 0;
    padding: 72px 16px 16px;
  }
}
</style>
