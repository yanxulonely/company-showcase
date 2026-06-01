<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useAppStore } from '../../stores/app'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const appStore = useAppStore()

const sidebarOpen = ref(false)

function logout() {
  authStore.logout()
  router.push('/admin/login')
}

function closeSidebar() {
  sidebarOpen.value = false
}

const navItems = [
  { path: '/employee', label: '工作台', icon: '🏠', exact: true },
  { path: '/employee/materials', label: '资料库', icon: '📚', exact: false },
]
</script>

<template>
  <div class="employee-layout">
    <!-- 移动端顶部栏 -->
    <div class="emp-topbar">
      <button class="emp-menu-btn" @click="sidebarOpen = !sidebarOpen">
        <span v-if="!sidebarOpen">☰</span>
        <span v-else>✕</span>
      </button>
      <div class="emp-topbar-logo">
        <div class="logo-icon">◆</div>
        <span>{{ appStore.settings.company_name || '公司' }}</span>
      </div>
      <div class="emp-topbar-right">
        <span class="emp-user-name">{{ authStore.displayName || authStore.username }}</span>
      </div>
    </div>

    <!-- 侧边栏遮罩 -->
    <div v-if="sidebarOpen" class="sidebar-overlay" @click="closeSidebar"></div>

    <!-- 侧边栏 -->
    <aside class="emp-sidebar" :class="{ open: sidebarOpen }">
      <div class="sidebar-logo">
        <div class="logo-icon">◆</div>
        <span class="sidebar-title">员工专区</span>
      </div>
      <nav class="emp-nav">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          :class="{ active: item.exact ? route.path === item.path : route.path.startsWith(item.path) }"
          @click="closeSidebar"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label">{{ item.label }}</span>
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <a href="/" class="sidebar-link">🌐 返回首页</a>
        <button @click="logout" class="sidebar-link logout-btn">🚪 退出登录</button>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="emp-main">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.employee-layout {
  display: flex;
  min-height: 100vh;
}

/* 侧边栏 */
.emp-sidebar {
  width: 240px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  position: fixed;
  height: 100vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  z-index: 100;
}

.sidebar-logo {
  padding: 24px 24px 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 12px;
}

.sidebar-logo .logo-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  flex-shrink: 0;
}

.sidebar-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.emp-nav {
  flex: 1;
  padding: 12px 0;
}

.emp-nav a {
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

.emp-nav a:hover {
  color: var(--text-primary);
  background: var(--bg-card);
}

.emp-nav a.active {
  color: var(--accent);
  background: rgba(59, 130, 246, 0.1);
  border-right: 3px solid var(--accent);
}

.nav-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
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

.logout-btn:hover {
  color: #ef4444;
}

/* 主内容区 */
.emp-main {
  flex: 1;
  margin-left: 240px;
  padding: 32px;
  min-height: 100vh;
}

/* 移动端顶部栏 - 默认隐藏 */
.emp-topbar {
  display: none;
}

/* 侧边栏遮罩 - 默认隐藏 */
.sidebar-overlay {
  display: none;
}

/* 响应式 */
@media (max-width: 768px) {
  .emp-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 56px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border);
    padding: 0 16px;
    z-index: 200;
  }

  .emp-menu-btn {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--bg-card);
    color: var(--text-primary);
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .emp-topbar-logo {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .emp-topbar-logo .logo-icon {
    width: 28px;
    height: 28px;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    border-radius: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 13px;
  }

  .emp-topbar-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .emp-user-name {
    font-size: 13px;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .emp-sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .emp-sidebar.open {
    transform: translateX(0);
  }

  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 99;
  }

  .emp-main {
    margin-left: 0;
    padding: 72px 16px 16px;
  }
}
</style>
