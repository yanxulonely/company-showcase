import { onMounted, onUnmounted, nextTick } from 'vue'

export function useScrollAnimation() {
  let observer = null
  let mutationObserver = null

  function observeElements(root) {
    root.querySelectorAll('.fade-in-up:not(.observed)').forEach((el) => {
      el.classList.add('observed')
      observer.observe(el)
    })
  }

  onMounted(() => {
    nextTick(() => {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible')
            }
          })
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
      )

      observeElements(document)

      // Watch for dynamically added .fade-in-up elements (async data loading)
      mutationObserver = new MutationObserver(() => {
        observeElements(document)
      })
      mutationObserver.observe(document.body, { childList: true, subtree: true })
    })
  })

  onUnmounted(() => {
    observer?.disconnect()
    mutationObserver?.disconnect()
  })
}
