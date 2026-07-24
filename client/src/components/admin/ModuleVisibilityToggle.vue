<script setup>
import { ref, computed, watch } from 'vue'
import { useAppStore } from '../../stores/app'
import { getModuleMeta } from '../../constants/siteModules'

const props = defineProps({
  moduleId: { type: String, required: true },
  label: { type: String, default: '在首页展示' },
})

const appStore = useAppStore()
const saving = ref(false)
const visible = ref(true)

const meta = computed(() => getModuleMeta(props.moduleId))
const isRequired = computed(() => meta.value?.required === true)
const moduleLabel = computed(() => meta.value?.label || props.moduleId)

watch(
  () => appStore.moduleVisibility,
  () => {
    visible.value = appStore.isModuleVisible(props.moduleId)
  },
  { immediate: true, deep: true }
)

async function onToggle() {
  if (isRequired.value) return
  saving.value = true
  const next = visible.value
  try {
    const res = await appStore.setModuleVisible(props.moduleId, next)
    if (res.code !== 200) {
      visible.value = !next
      alert(res.message || '保存失败')
    }
  } catch (e) {
    visible.value = !next
    alert(e.response?.data?.message || e.message || '保存失败')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="module-visibility-bar" :class="{ disabled: isRequired }">
    <div class="module-visibility-main">
      <span class="module-visibility-label">{{ label }}</span>
      <label class="toggle-switch">
        <input
          v-model="visible"
          type="checkbox"
          :disabled="isRequired || saving"
          @change="onToggle"
        >
        <span class="toggle-slider"></span>
      </label>
      <span v-if="saving" class="module-visibility-status">保存中...</span>
      <span v-else-if="isRequired" class="module-visibility-hint">首页必备</span>
      <span v-else class="module-visibility-hint">{{ visible ? '已展示' : '已隐藏' }}</span>
    </div>
    <p class="module-visibility-desc">
      控制「{{ moduleLabel }}」是否在营销首页显示；关闭后导航栏同步隐藏，内容仍可在此维护。
      <template v-if="moduleId === 'activities'">活动列表页与分享链接不受影响。</template>
    </p>
  </div>
</template>

<style scoped>
.module-visibility-bar {
  margin-bottom: 20px;
  padding: 16px 20px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
}

.module-visibility-bar.disabled {
  opacity: 0.85;
}

.module-visibility-main {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.module-visibility-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.module-visibility-hint {
  font-size: 13px;
  color: var(--text-muted);
}

.module-visibility-status {
  font-size: 13px;
  color: var(--accent);
}

.module-visibility-desc {
  margin: 10px 0 0;
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.5;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 24px;
  transition: 0.2s;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  height: 18px;
  width: 18px;
  left: 2px;
  bottom: 2px;
  background: var(--text-muted);
  border-radius: 50%;
  transition: 0.2s;
}

.toggle-switch input:checked + .toggle-slider {
  background: rgba(59, 130, 246, 0.25);
  border-color: var(--accent);
}

.toggle-switch input:checked + .toggle-slider::before {
  transform: translateX(20px);
  background: var(--accent);
}

.toggle-switch input:disabled + .toggle-slider {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
