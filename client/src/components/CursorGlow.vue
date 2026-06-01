<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const glowRef = ref(null)
let mouseX = 0, mouseY = 0
let glowX = 0, glowY = 0
let rafId = null

function onMouseMove(e) {
  mouseX = e.clientX
  mouseY = e.clientY
}

function animate() {
  glowX += (mouseX - glowX) * 0.1
  glowY += (mouseY - glowY) * 0.1
  if (glowRef.value) {
    glowRef.value.style.left = glowX + 'px'
    glowRef.value.style.top = glowY + 'px'
  }
  rafId = requestAnimationFrame(animate)
}

onMounted(() => {
  document.addEventListener('mousemove', onMouseMove)
  animate()
})

onUnmounted(() => {
  document.removeEventListener('mousemove', onMouseMove)
  if (rafId) cancelAnimationFrame(rafId)
})
</script>

<template>
  <div ref="glowRef" class="cursor-glow"></div>
</template>

<style scoped>
.cursor-glow {
  position: fixed;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, var(--glow-color) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
  transform: translate(-50%, -50%);
  transition: opacity 0.3s;
  opacity: 0;
}

body:hover .cursor-glow {
  opacity: 1;
}
</style>
