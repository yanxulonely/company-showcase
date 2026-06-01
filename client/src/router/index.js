import { createRouter, createWebHashHistory } from 'vue-router'

const HomePage = () => import('../views/HomePage.vue')
const LoginPage = () => import('../views/admin/LoginPage.vue')
const DashboardPage = () => import('../views/admin/DashboardPage.vue')
const CasesManage = () => import('../views/admin/CasesManage.vue')
const CapabilitiesManage = () => import('../views/admin/CapabilitiesManage.vue')
const ReviewsManage = () => import('../views/admin/ReviewsManage.vue')
const StandardsManage = () => import('../views/admin/StandardsManage.vue')
const ContactsManage = () => import('../views/admin/ContactsManage.vue')
const SettingsManage = () => import('../views/admin/SettingsManage.vue')

const routes = [
  { path: '/', name: 'Home', component: HomePage },
  { path: '/admin/login', name: 'Login', component: LoginPage },
  {
    path: '/admin',
    component: DashboardPage,
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'Dashboard', component: () => import('../views/admin/DashboardHome.vue') },
      { path: 'cases', name: 'CasesManage', component: CasesManage },
      { path: 'capabilities', name: 'CapabilitiesManage', component: CapabilitiesManage },
      { path: 'reviews', name: 'ReviewsManage', component: ReviewsManage },
      { path: 'standards', name: 'StandardsManage', component: StandardsManage },
      { path: 'contacts', name: 'ContactsManage', component: ContactsManage },
      { path: 'settings', name: 'SettingsManage', component: SettingsManage },
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token')
    if (!token) {
      next({ name: 'Login' })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
