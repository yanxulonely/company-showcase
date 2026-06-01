<script setup>
import { useAppStore } from '../../stores/app'

const appStore = useAppStore()
</script>

<template>
  <section class="hero" id="home">
    <div class="hero-glow"></div>
    <div class="hero-content">
      <div class="hero-badge">
        <span class="hero-badge-dot"></span>
        专业数字化解决方案提供商
      </div>
      <h1 v-html="appStore.settings.hero_title || '为企业构建<br><span class=\'gradient-text\'>下一代数字基础设施</span>'"></h1>
      <p class="hero-desc">{{ appStore.settings.hero_desc || '我们专注于为全球企业提供前沿的技术解决方案，从架构设计到落地交付，助力客户在数字化浪潮中保持领先。' }}</p>
      <div class="hero-buttons">
        <a href="#cases" class="btn-primary" @click.prevent="$el.closest('section').nextElementSibling?.scrollIntoView({ behavior: 'smooth' })">查看案例 →</a>
        <a href="#contact" class="btn-ghost" @click.prevent="document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })">预约咨询</a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 120px 40px 80px;
  position: relative;
}

.hero-glow {
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  width: 800px;
  height: 600px;
  background: radial-gradient(ellipse, var(--glow-color) 0%, transparent 70%);
  pointer-events: none;
  animation: glowPulse 4s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.5; transform: translateX(-50%) scale(1); }
  50% { opacity: 1; transform: translateX(-50%) scale(1.1); }
}

.hero-content {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  position: relative;
  z-index: 2;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  padding: 8px 16px;
  border-radius: 100px;
  font-size: 13px;
  color: var(--accent-light);
  margin-bottom: 32px;
  animation: fadeInUp 0.8s ease;
}

.hero-badge-dot {
  width: 8px;
  height: 8px;
  background: #22c55e;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
  50% { opacity: 0.8; box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); }
}

.hero h1 {
  font-size: 80px;
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -3px;
  margin-bottom: 28px;
  max-width: 900px;
  animation: fadeInUp 0.8s ease 0.1s backwards;
}

:deep(.gradient-text) {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradientShift 4s ease infinite;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% center; }
  50% { background-position: 100% center; }
}

.hero-desc {
  font-size: 18px;
  color: var(--text-secondary);
  max-width: 520px;
  margin-bottom: 48px;
  line-height: 1.8;
  animation: fadeInUp 0.8s ease 0.2s backwards;
}

.hero-buttons {
  display: flex;
  gap: 16px;
  animation: fadeInUp 0.8s ease 0.3s backwards;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  padding: 16px 32px;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  font-size: 15px;
  transition: all var(--transition);
  border: none;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.btn-primary:hover::before {
  left: 100%;
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 40px rgba(59, 130, 246, 0.4);
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  padding: 16px 32px;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 500;
  font-size: 15px;
  border: 1px solid var(--border);
  transition: all var(--transition);
}

.btn-ghost:hover {
  border-color: var(--accent);
  color: var(--accent);
  transform: translateY(-3px);
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
