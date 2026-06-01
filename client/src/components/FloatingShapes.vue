<template>
  <div class="floating-shapes">
    <div class="shape shape-1"></div>
    <div class="shape shape-2"></div>
    <div class="shape shape-3"></div>
  </div>
</template>

<style scoped>
.floating-shapes {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.03;
  animation: floatShape 20s infinite ease-in-out;
}

.shape-1 {
  width: 300px;
  height: 300px;
  background: #3b82f6;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 200px;
  height: 200px;
  background: #8b5cf6;
  top: 60%;
  right: 10%;
  animation-delay: -5s;
}

.shape-3 {
  width: 400px;
  height: 400px;
  background: #ec4899;
  bottom: 10%;
  left: 30%;
  animation-delay: -10s;
}

@keyframes floatShape {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(30px, -30px) rotate(90deg); }
  50% { transform: translate(-20px, 20px) rotate(180deg); }
  75% { transform: translate(20px, 30px) rotate(270deg); }
}
</style>
