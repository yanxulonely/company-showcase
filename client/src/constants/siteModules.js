export const SITE_MODULES = [
  { id: 'hero', label: '首页横幅', navLabel: '首页', anchor: '#home', required: true },
  { id: 'stats', label: '数据概览', required: false },
  { id: 'cases', label: '精选案例', navLabel: '案例', anchor: '#cases', required: false },
  { id: 'activities', label: '精彩活动', navLabel: '活动', anchor: '#activities', required: false },
  { id: 'designers', label: '设计师', navLabel: '设计师', anchor: '#designers', required: false },
  { id: 'capabilities', label: '核心能力', navLabel: '能力', anchor: '#capabilities', required: false },
  { id: 'reviews', label: '客户评价', navLabel: '评价', anchor: '#reviews', required: false },
  { id: 'standards', label: '施工标准', navLabel: '标准', anchor: '#standards', required: false },
  { id: 'contact', label: '联系我们', required: true },
]

export const DEFAULT_MODULE_VISIBILITY = Object.fromEntries(
  SITE_MODULES.map((m) => [m.id, true])
)

export function parseModuleVisibility(settings) {
  try {
    const raw = settings?.module_visibility
    if (!raw) return { ...DEFAULT_MODULE_VISIBILITY }
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    return {
      ...DEFAULT_MODULE_VISIBILITY,
      ...parsed,
      hero: true,
      contact: true,
    }
  } catch {
    return { ...DEFAULT_MODULE_VISIBILITY }
  }
}

export function getModuleMeta(moduleId) {
  return SITE_MODULES.find((m) => m.id === moduleId)
}
