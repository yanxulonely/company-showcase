import { ref, onMounted } from 'vue'

export function useTheme() {
  const theme = ref(localStorage.getItem('theme') || 'dark')

  function toggle() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', theme.value)
    localStorage.setItem('theme', theme.value)
  }

  onMounted(() => {
    document.documentElement.setAttribute('data-theme', theme.value)
  })

  return { theme, toggle }
}
