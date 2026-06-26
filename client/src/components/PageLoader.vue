<script setup>
import { ref, onMounted } from 'vue'

const hidden = ref(false)

onMounted(() => {
  setTimeout(() => { hidden.value = true }, 500)
})
</script>

<template>
  <div class="page-loader" :class="{ hidden }">
    <div class="loader-spinner"></div>
  </div>
</template>

<style scoped>
.page-loader {
  position: fixed;
  inset: 0;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  transition: opacity 0.5s, visibility 0.5s;
}

.page-loader.hidden {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.loader-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
