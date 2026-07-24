import { createRouter, createWebHashHistory } from 'vue-router'

const HomePage = () => import('../views/HomePage.vue')
const LoginPage = () => import('../views/admin/LoginPage.vue')
const DashboardPage = () => import('../views/admin/DashboardPage.vue')
const CasesManage = () => import('../views/admin/CasesManage.vue')
const CapabilitiesManage = () => import('../views/admin/CapabilitiesManage.vue')
const ReviewsManage = () => import('../views/admin/ReviewsManage.vue')
const DesignersManage = () => import('../views/admin/DesignersManage.vue')
const StandardsManage = () => import('../views/admin/StandardsManage.vue')
const ContactsManage = () => import('../views/admin/ContactsManage.vue')
const SettingsManage = () => import('../views/admin/SettingsManage.vue')
const UsersManage = () => import('../views/admin/UsersManage.vue')
const BannersManage = () => import('../views/admin/BannersManage.vue')
const MaterialsManage = () => import('../views/admin/MaterialsManage.vue')
const MaterialCategoriesManage = () => import('../views/admin/MaterialCategoriesManage.vue')
const ActivitiesManage = () => import('../views/admin/ActivitiesManage.vue')
const ActivitiesList = () => import('../views/ActivitiesList.vue')
const ActivityDetail = () => import('../views/ActivityDetail.vue')

// Employee views
const EmployeeLayout = () => import('../views/employee/EmployeeLayout.vue')
const EmployeeHome = () => import('../views/employee/EmployeeHome.vue')
const MaterialsList = () => import('../views/employee/MaterialsList.vue')
const MaterialDetail = () => import('../views/employee/MaterialDetail.vue')

const routes = [
  { path: '/', name: 'Home', component: HomePage },
  { path: '/activities', name: 'ActivitiesList', component: ActivitiesList },
  { path: '/activities/:id', name: 'ActivityDetail', component: ActivityDetail, props: true },
  { path: '/admin/login', name: 'Login', component: LoginPage },
  {
    path: '/admin',
    component: DashboardPage,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: '', name: 'Dashboard', component: () => import('../views/admin/DashboardHome.vue') },
      { path: 'cases', name: 'CasesManage', component: CasesManage },
      { path: 'activities', name: 'ActivitiesManage', component: ActivitiesManage },
      { path: 'designers', name: 'DesignersManage', component: DesignersManage },
      { path: 'capabilities', name: 'CapabilitiesManage', component: CapabilitiesManage },
      { path: 'reviews', name: 'ReviewsManage', component: ReviewsManage },
      { path: 'standards', name: 'StandardsManage', component: StandardsManage },
      { path: 'contacts', name: 'ContactsManage', component: ContactsManage },
      { path: 'settings', name: 'SettingsManage', component: SettingsManage },
      { path: 'users', name: 'UsersManage', component: UsersManage, meta: { requiresAdmin: true } },
      { path: 'banners', name: 'BannersManage', component: BannersManage, meta: { requiresAdmin: true } },
      { path: 'materials', name: 'MaterialsManage', component: MaterialsManage, meta: { requiresAdmin: true } },
      { path: 'material-categories', name: 'MaterialCategoriesManage', component: MaterialCategoriesManage, meta: { requiresAdmin: true } },
    ]
  },
  {
    path: '/employee',
    component: EmployeeLayout,
    meta: { requiresAuth: true, requiresEmployee: true },
    children: [
      { path: '', name: 'EmployeeHome', component: EmployeeHome },
      { path: 'materials', name: 'MaterialsList', component: MaterialsList },
      { path: 'materials/:id', name: 'MaterialDetail', component: MaterialDetail, props: true },
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
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  if (to.meta.requiresAuth && !token) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  if (to.meta.requiresAdmin && role !== 'admin') {
    if (role === 'employee') {
      next({ name: 'EmployeeHome' })
    } else {
      next({ name: 'Home' })
    }
    return
  }

  if (to.meta.requiresEmployee && role !== 'admin' && role !== 'employee') {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  next()
})

export default router
