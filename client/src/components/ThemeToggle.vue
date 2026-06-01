<script setup>
import { useTheme } from '../composables/useTheme'

const { theme, toggle } = useTheme()
</script>

<template>
  <button class="theme-toggle" @click="toggle" aria-label="切换主题">
    <span class="icon">{{ theme === 'dark' ? '☀️' : '🌙' }}</span>
  </button>
</template>

<style scoped>
.theme-toggle {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all var(--transition);
  position: relative;
  overflow: hidden;
}

.theme-toggle:hover {
  border-color: var(--accent);
  transform: scale(1.05);
}

.theme-toggle .icon {
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

[data-theme="dark"] .theme-toggle .icon {
  transform: rotate(0deg);
}

[data-theme="light"] .theme-toggle .icon {
  transform: rotate(360deg);
}
</style>
