<script setup>
import { ref, watch, computed } from 'vue'
import QRCode from 'qrcode'
import { generateActivityPoster } from '../utils/poster'
import { useAppStore } from '../stores/app'

const props = defineProps({
  visible: Boolean,
  activity: Object,
})

const emit = defineEmits(['update:visible'])

const appStore = useAppStore()
const qrDataUrl = ref('')
const posterBlob = ref(null)
const generating = ref(false)
const posterUrl = ref('')
const errorMsg = ref('')
const copied = ref(false)

const shareUrl = computed(() => {
  if (!props.activity?.id) return ''
  return `${window.location.origin}/share/activities/${props.activity.id}`
})

const posterOptions = computed(() => ({
  companyName: appStore.settings.company_name || '尚润装饰',
  slogan: appStore.settings.company_slogan || appStore.settings.slogan || '专注品质装修 · 值得信赖',
  qrDataUrl: qrDataUrl.value,
  siteLabel: appStore.settings.footer_text || '尚润装饰 · 品质装修',
}))

watch(
  () => props.visible,
  async (val) => {
    if (val && props.activity) {
      generating.value = true
      errorMsg.value = ''
      copied.value = false
      posterBlob.value = null
      qrDataUrl.value = ''
      if (posterUrl.value) {
        URL.revokeObjectURL(posterUrl.value)
        posterUrl.value = ''
      }
      try {
        qrDataUrl.value = await QRCode.toDataURL(shareUrl.value, {
          width: 280,
          margin: 2,
          color: { dark: '#1e293b', light: '#ffffff' },
        })
        const blob = await generateActivityPoster(props.activity, posterOptions.value)
        posterBlob.value = blob
        posterUrl.value = URL.createObjectURL(blob)
      } catch (e) {
        console.error('Share modal init failed:', e)
        errorMsg.value = '分享内容生成失败，请稍后重试'
      } finally {
        generating.value = false
      }
    } else if (posterUrl.value) {
      URL.revokeObjectURL(posterUrl.value)
      posterUrl.value = ''
      posterBlob.value = null
      qrDataUrl.value = ''
    }
  }
)

async function copyLink() {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    alert('复制失败，请手动复制链接')
  }
}

function downloadQr() {
  if (!qrDataUrl.value) return
  const a = document.createElement('a')
  a.href = qrDataUrl.value
  a.download = `${props.activity?.title || '活动'}-二维码.png`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

function downloadPoster() {
  if (!posterBlob.value) return
  const url = URL.createObjectURL(posterBlob.value)
  const a = document.createElement('a')
  a.href = url
  a.download = `${props.activity?.title || '活动海报'}.png`
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
            <h3>分享活动</h3>
            <button class="poster-close" @click="close">&times;</button>
          </div>

          <div class="poster-body">
            <div v-if="generating" class="poster-loading">
              <div class="poster-spinner"></div>
              <span>生成分享内容中...</span>
            </div>
            <div v-else-if="errorMsg" class="poster-error">{{ errorMsg }}</div>
            <template v-else>
              <div class="share-link-box">
                <label>分享链接</label>
                <div class="share-link-row">
                  <input :value="shareUrl" readonly class="share-link-input">
                  <button class="poster-btn poster-btn-primary poster-btn-sm" @click="copyLink">
                    {{ copied ? '已复制' : '复制' }}
                  </button>
                </div>
              </div>

              <div v-if="qrDataUrl" class="qr-section">
                <label>扫码查看活动</label>
                <img :src="qrDataUrl" alt="活动二维码" class="qr-image">
                <button class="poster-btn poster-btn-ghost poster-btn-sm" @click="downloadQr">保存二维码</button>
              </div>

              <div v-if="posterUrl" class="poster-preview">
                <label>分享海报</label>
                <img :src="posterUrl" alt="活动分享海报" class="poster-image">
              </div>
            </template>
          </div>

          <div class="poster-footer">
            <button class="poster-btn poster-btn-primary" :disabled="generating || !posterBlob" @click="downloadPoster">
              保存海报
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
  flex-direction: column;
  gap: 24px;
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
  min-height: 200px;
  justify-content: center;
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

.share-link-box label,
.qr-section label,
.poster-preview label {
  display: block;
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 8px;
  font-weight: 500;
}

.share-link-row {
  display: flex;
  gap: 8px;
}

.share-link-input {
  flex: 1;
  padding: 10px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 13px;
  color: var(--text-secondary);
  font-family: inherit;
}

.qr-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.qr-image {
  width: 160px;
  height: 160px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: #fff;
}

.poster-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.poster-image {
  width: 100%;
  max-width: 280px;
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

.poster-btn-sm {
  flex: none;
  padding: 10px 16px;
  font-size: 14px;
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
