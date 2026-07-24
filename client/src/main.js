import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import lazyImgDirective from './directives/lazyImg'
import { useAppStore } from './stores/app'
import './style.css'

async function bootstrap() {
  const app = createApp(App)
  const pinia = createPinia()
  app.use(pinia)
  app.use(router)
  app.directive('lazy-img', lazyImgDirective)

  const appStore = useAppStore()
  await appStore.fetchSettings()

  app.mount('#app')
}

bootstrap()
