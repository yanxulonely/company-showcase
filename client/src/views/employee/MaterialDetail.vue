<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMaterialsStore } from '../../stores/materials'
import VueOfficePptx from '@vue-office/pptx'

const props = defineProps({
  id: [String, Number]
})

const router = useRouter()
const route = useRoute()
const materialsStore = useMaterialsStore()

const material = ref(null)
const loading = ref(true)
const error = ref('')
const pptData = ref(null)
const previewError = ref('')
const pdfPreviewUrl = ref('')

const materialId = computed(() => props.id || route.params.id)

function resolveAssetUrl(url) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return url.startsWith('/') ? url : `/${url}`
}

const fileUrl = computed(() => resolveAssetUrl(material.value?.file_url))

const fileType = computed(() => material.value?.file_type || 'link')

const isImage = computed(() => ['image', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileType.value))
const isPdf = computed(() => fileType.value === 'pdf')
const isLink = computed(() => fileType.value === 'link')
const isPpt = computed(() => ['ppt', 'pptx'].includes(fileType.value))
const hasPdf = computed(() => material.value?.pdf_url)
const pdfUrl = computed(() => resolveAssetUrl(material.value?.pdf_url))

const galleryIndex = ref(0)
const galleryImages = computed(() => {
  if (!isImage.value) return []
  return fileUrl.value ? [fileUrl.value] : []
})

function getFileIcon(type) {
  const icons = {
    pdf: '📄', image: '🖼️', ppt: '📊', doc: '📝', excel: '📈', link: '🔗'
  }
  return icons[type] || '📁'
}

function getFileTypeName(type) {
  const names = {
    pdf: 'PDF 文档', image: '图片', ppt: 'PPT 演示', doc: 'Word 文档', excel: 'Excel 表格', link: '外部链接'
  }
  return names[type] || '文件'
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function openLink() {
  if (fileUrl.value) {
    window.open(fileUrl.value, '_blank', 'noopener,noreferrer')
  }
}

function releasePdfPreviewUrl() {
  if (pdfPreviewUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(pdfPreviewUrl.value)
  }
  pdfPreviewUrl.value = ''
}

async function loadPdfPreview(url) {
  releasePdfPreviewUrl()
  if (!url) return
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const buffer = await response.arrayBuffer()
    const blob = new Blob([buffer], { type: 'application/pdf' })
    pdfPreviewUrl.value = URL.createObjectURL(blob)
  } catch (e) {
    previewError.value = '预览加载失败，请稍后重试'
    console.error('Failed to load PDF preview:', e)
  }
}

function handleRendered() {
  previewError.value = ''
}

function handlePreviewError(e) {
  previewError.value = '预览加载失败，请尝试下载文件查看'
  console.error('Preview render error:', e)
}

async function loadPptPreview(url) {
  pptData.value = null
  previewError.value = ''
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    pptData.value = await response.arrayBuffer()
  } catch (e) {
    previewError.value = '预览加载失败，请尝试下载文件查看'
    console.error('Failed to load PPT preview:', e)
  }
}

onMounted(async () => {
  try {
    const res = await materialsStore.fetchOne(materialId.value)
    if (res.code === 200) {
      material.value = res.data
      const type = res.data.file_type
      const url = resolveAssetUrl(res.data.file_url)
      const pdf = resolveAssetUrl(res.data.pdf_url)

      if (type === 'pdf' && url) {
        await loadPdfPreview(url)
      } else if (['ppt', 'pptx'].includes(type) && pdf) {
        await loadPdfPreview(pdf)
      } else if (['ppt', 'pptx'].includes(type) && url) {
        await loadPptPreview(url)
      }
    } else {
      error.value = res.message || '资料不存在'
    }
  } catch (e) {
    error.value = '加载失败，请稍后重试'
    console.error('Failed to load material:', e)
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  releasePdfPreviewUrl()
})
</script>

<template>
  <div class="material-detail">
    <!-- 返回按钮 -->
    <button class="back-btn" @click="router.back()">← 返回资料库</button>

    <!-- 加载中 -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 错误 -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">❌</div>
      <p>{{ error }}</p>
      <button class="retry-btn" @click="router.push('/employee/materials')">返回资料库</button>
    </div>

    <!-- 资料详情 -->
    <div v-else-if="material" class="detail-content">
      <!-- 资料信息 -->
      <div class="info-card">
        <div class="info-header">
          <span class="file-icon-large">{{ getFileIcon(material.file_type) }}</span>
          <div class="info-title-area">
            <h1>{{ material.title }}</h1>
            <div class="info-meta">
              <span class="meta-item">
                <span class="meta-label">类型</span>
                <span class="meta-value">{{ getFileTypeName(material.file_type) }}</span>
              </span>
              <span v-if="material.category_name" class="meta-item">
                <span class="meta-label">分类</span>
                <span class="meta-value category-badge">{{ material.category_name }}</span>
              </span>
              <span class="meta-item">
                <span class="meta-label">上传时间</span>
                <span class="meta-value">{{ formatTime(material.created_at) }}</span>
              </span>
            </div>
          </div>
        </div>
        <div v-if="material.tags && material.tags.length" class="info-tags">
          <span class="tags-label">标签</span>
          <span v-for="tag in material.tags" :key="tag" class="tag-chip">{{ tag }}</span>
        </div>
      </div>

      <!-- 在线预览区域 -->
      <div class="preview-section">
        <h2 class="preview-title">在线预览</h2>

        <!-- PDF 预览 -->
        <div v-if="isPdf" class="preview-frame pdf-preview">
          <div v-if="!pdfPreviewUrl && !previewError" class="loading-state inline-loading">
            <div class="spinner"></div>
            <p>正在加载 PDF 预览...</p>
          </div>
          <iframe v-else-if="pdfPreviewUrl" :src="pdfPreviewUrl" frameborder="0" allowfullscreen></iframe>
          <div v-else class="hint-content">
            <p>{{ previewError || '预览加载失败' }}</p>
          </div>
        </div>

        <!-- 图片预览 -->
        <div v-else-if="isImage" class="preview-frame image-preview">
          <div class="image-viewer">
            <img :src="fileUrl" :alt="material.title">
          </div>
        </div>

        <!-- PPT 预览（优先 PDF 预览版） -->
        <div v-else-if="isPpt && hasPdf" class="preview-frame pdf-preview">
          <div v-if="!pdfPreviewUrl && !previewError" class="loading-state inline-loading">
            <div class="spinner"></div>
            <p>正在加载预览...</p>
          </div>
          <iframe v-else-if="pdfPreviewUrl" :src="pdfPreviewUrl" frameborder="0" allowfullscreen></iframe>
          <div v-else class="hint-content">
            <p>{{ previewError || '预览加载失败' }}</p>
          </div>
        </div>
        <div v-else-if="isPpt && fileUrl" class="preview-frame ppt-preview">
          <div v-if="!pptData && !previewError" class="loading-state inline-loading">
            <div class="spinner"></div>
            <p>正在加载 PPT 预览...</p>
          </div>
          <VueOfficePptx
            v-else-if="pptData"
            :src="pptData"
            @rendered="handleRendered"
            @error="handlePreviewError"
          />
          <div v-else class="hint-content">
            <span class="hint-icon">📊</span>
            <h3>PPT 预览不可用</h3>
            <p>{{ previewError || '此文件暂不支持在线预览，请下载后查看。' }}</p>
            <button v-if="fileUrl" class="download-btn" @click="openLink">📥 打开文件</button>
          </div>
        </div>
        <div v-else-if="isPpt" class="preview-frame ppt-hint">
          <div class="hint-content">
            <span class="hint-icon">📊</span>
            <h3>PPT 文件</h3>
            <p>此文件暂不支持在线预览，请下载后查看。</p>
          </div>
        </div>

        <!-- 外部链接 -->
        <div v-else-if="isLink" class="preview-frame link-preview">
          <div class="hint-content">
            <span class="hint-icon">🔗</span>
            <h3>外部链接</h3>
            <p>点击下方按钮在新窗口中打开此链接。</p>
            <button class="download-btn" @click="openLink">🌐 打开链接</button>
          </div>
        </div>

        <!-- 其他文件 -->
        <div v-else class="preview-frame generic-preview">
          <div class="hint-content">
            <span class="hint-icon">{{ getFileIcon(material.file_type) }}</span>
            <h3>{{ getFileTypeName(material.file_type) }}</h3>
            <p>此文件类型暂不支持在线预览，请下载后查看。</p>
            <button v-if="fileUrl" class="download-btn" @click="openLink">📥 打开文件</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.material-detail {
  max-width: 900px;
  margin: 0 auto;
}

/* 返回按钮 */
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all var(--transition);
  margin-bottom: 24px;
  font-family: inherit;
}

.back-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

/* 信息卡片 */
.info-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 28px;
  margin-bottom: 24px;
}

.info-header {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
}

.file-icon-large {
  font-size: 48px;
  flex-shrink: 0;
}

.info-title-area {
  flex: 1;
  min-width: 0;
}

.info-title-area h1 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 12px;
  letter-spacing: -0.5px;
  line-height: 1.3;
}

.info-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.meta-label {
  color: var(--text-muted);
}

.meta-value {
  color: var(--text-primary);
  font-weight: 500;
}

.category-badge {
  color: var(--accent);
  background: rgba(59, 130, 246, 0.1);
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 13px;
}

.info-tags {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

.tags-label {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 500;
}

.tag-chip {
  padding: 4px 14px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 20px;
  font-size: 13px;
  color: var(--text-secondary);
}

/* 预览区域 */
.preview-section {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 28px;
}

.preview-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
}

.preview-frame {
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--border);
  background: var(--bg-secondary);
}

/* PDF 预览 */
.pdf-preview {
  width: 100%;
}

.pdf-preview iframe {
  width: 100%;
  height: 80vh;
  min-height: 500px;
  border: none;
}

/* 图片预览 */
.image-preview {
  background: #000;
}

.image-viewer {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.image-viewer img {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 8px;
}

/* PPT 预览 */
.ppt-preview {
  width: 100%;
  min-height: 600px;
  background: #ffffff;
}

.ppt-preview :deep(.vue-office-pptx),
.ppt-preview :deep(canvas) {
  width: 100% !important;
  min-height: 600px;
  background: #ffffff !important;
}

.inline-loading {
  padding: 80px 20px;
}

/* PPT / 链接 / 通用提示 */
.ppt-hint, .link-preview, .generic-preview {
  padding: 60px 20px;
}

.hint-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
}

.hint-icon {
  font-size: 56px;
  opacity: 0.6;
}

.hint-content h3 {
  font-size: 20px;
  font-weight: 600;
}

.hint-content p {
  color: var(--text-muted);
  font-size: 14px;
  max-width: 400px;
}

.download-btn {
  margin-top: 8px;
  padding: 12px 28px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition);
  font-family: inherit;
}

.download-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
}

/* 加载/错误状态 */
.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 80px 20px;
  color: var(--text-muted);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon {
  font-size: 48px;
  opacity: 0.5;
}

.retry-btn {
  padding: 10px 24px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all var(--transition);
  font-family: inherit;
}

.retry-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

/* 响应式 */
@media (max-width: 768px) {
  .info-header {
    flex-direction: column;
    gap: 12px;
  }

  .file-icon-large {
    font-size: 36px;
  }

  .info-title-area h1 {
    font-size: 20px;
  }

  .pdf-preview iframe {
    height: 60vh;
    min-height: 300px;
  }

  .ppt-hint, .link-preview, .generic-preview {
    padding: 40px 20px;
  }
}
</style>
