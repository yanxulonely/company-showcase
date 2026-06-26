<script setup>
import { ref, watch, computed } from 'vue'
import { generateCasePoster } from '../utils/poster'
import { useAppStore } from '../stores/app'

const props = defineProps({
  visible: Boolean,
  caseItem: Object,
})

const emit = defineEmits(['update:visible'])

const appStore = useAppStore()
const posterBlob = ref(null)
const generating = ref(false)
const posterUrl = ref('')
const errorMsg = ref('')

const posterOptions = computed(() => ({
  companyName: appStore.settings.company_name || '尚润装饰',
  slogan: appStore.settings.company_slogan || appStore.settings.slogan || '专注品质装修 · 值得信赖',
  wechatQrUrl: appStore.settings.wechat_qr_url || '',
  siteLabel: appStore.settings.footer_text || '尚润装饰 · 品质装修',
}))

watch(
  () => props.visible,
  async (val) => {
    if (val && props.caseItem) {
      generating.value = true
      errorMsg.value = ''
      posterBlob.value = null
      if (posterUrl.value) {
        URL.revokeObjectURL(posterUrl.value)
        posterUrl.value = ''
      }
      try {
        const blob = await generateCasePoster(props.caseItem, posterOptions.value)
        posterBlob.value = blob
        posterUrl.value = URL.createObjectURL(blob)
      } catch (e) {
        console.error('Poster generation failed:', e)
        errorMsg.value = '海报生成失败，请稍后重试'
      } finally {
        generating.value = false
      }
    } else if (posterUrl.value) {
      URL.revokeObjectURL(posterUrl.value)
      posterUrl.value = ''
      posterBlob.value = null
    }
  }
)

function downloadPoster() {
  if (!posterBlob.value) return
  const url = URL.createObjectURL(posterBlob.value)
  const a = document.createElement('a')
  a.href = url
  a.download = `${props.caseItem?.title || '案例海报'}.png`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function close() {
  emit('update:visible', false)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="poster-modal">
      <div v-if="visible" class="poster-overlay" @click.self="close">
        <div class="poster-dialog">
          <div class="poster-header">
            <h3>分享海报</h3>
            <button class="poster-close" @click="close">&times;</button>
          </div>

          <div class="poster-body">
            <div v-if="generating" class="poster-loading">
              <div class="poster-spinner"></div>
              <span>生成海报中...</span>
            </div>
            <div v-else-if="errorMsg" class="poster-error">{{ errorMsg }}</div>
            <div v-else-if="posterUrl" class="poster-preview">
              <img :src="posterUrl" alt="案例分享海报" class="poster-image">
            </div>
          </div>

          <div class="poster-footer">
            <button class="poster-btn poster-btn-primary" :disabled="generating || !posterBlob" @click="downloadPoster">
              保存图片
            </button>
            <button class="poster-btn poster-btn-ghost" @click="close">关闭</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.poster-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  padding: 20px;
}

.poster-dialog {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  width: 100%;
  max-width: 420px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.poster-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
}

.poster-header h3 {
  font-size: 18px;
  font-weight: 600;
}

.poster-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.poster-close:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.poster-body {
  padding: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  overflow-y: auto;
}

.poster-loading,
.poster-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--text-muted);
  text-align: center;
}

.poster-error {
  color: #f87171;
}

.poster-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: poster-spin 0.8s linear infinite;
}

@keyframes poster-spin {
  to { transform: rotate(360deg); }
}

.poster-preview {
  width: 100%;
  display: flex;
  justify-content: center;
}

.poster-image {
  width: 100%;
  max-width: 375px;
  height: auto;
  border-radius: 8px;
  border: 1px solid var(--border);
  display: block;
  background: #09090b;
}

.poster-footer {
  display: flex;
  gap: 12px;
  padding: 16px 24px 24px;
}

.poster-btn {
  flex: 1;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.poster-btn-primary {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border: none;
}

.poster-btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.poster-btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.poster-btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border);
}

.poster-btn-ghost:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.poster-modal-enter-active,
.poster-modal-leave-active {
  transition: opacity 0.3s ease;
}

.poster-modal-enter-active .poster-dialog,
.poster-modal-leave-active .poster-dialog {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.poster-modal-enter-from,
.poster-modal-leave-to {
  opacity: 0;
}

.poster-modal-enter-from .poster-dialog {
  transform: scale(0.9) translateY(20px);
  opacity: 0;
}

.poster-modal-leave-to .poster-dialog {
  transform: scale(0.9) translateY(20px);
  opacity: 0;
}
</style>
