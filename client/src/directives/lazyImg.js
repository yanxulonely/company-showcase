const observerMap = new WeakMap()

const lazyImgDirective = {
  mounted(el, binding) {
    const url = binding.value
    if (!url) return

    el.style.transition = 'opacity 0.5s ease'

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadImage(el, url)
            observer.unobserve(el)
          }
        })
      },
      { rootMargin: '200px 0px' }
    )

    observer.observe(el)
    observerMap.set(el, observer)
  },

  updated(el, binding) {
    const oldUrl = binding.oldValue
    const newUrl = binding.value
    if (oldUrl === newUrl) return

    if (newUrl) {
      loadImage(el, newUrl)
    } else {
      el.style.backgroundImage = 'none'
      el.classList.remove('loaded')
    }
  },

  unmounted(el) {
    const observer = observerMap.get(el)
    if (observer) {
      observer.disconnect()
      observerMap.delete(el)
    }
  },
}

function loadImage(el, url) {
  const img = new Image()
  img.onload = () => {
    el.style.backgroundImage = `url(${url})`
    el.classList.add('loaded')
    el.classList.remove('error')
  }
  img.onerror = () => {
    el.classList.add('error')
    el.classList.remove('loaded')
  }
  img.src = url
}

export default lazyImgDirective
