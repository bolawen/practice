import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      icon: '',
      auth: []
    }
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue'),
    meta: {
      icon: '',
      auth: []
    }
  },
  {
    path: '/list',
    name: 'list',
    component: () => import('../views/ListView.vue')
  },
  {
    path: '/detail/:id',
    name: 'detail',
    component: () => import('../views/DetailView.vue')
  }
]

const router = createRouter({
  routes,
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: (to, from, savedPosition) => {
    console.log(savedPosition)
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 200 }
    }
  }
})

router.afterEach((to, from) => {
  const toDepth = to.path.split('/').length
  const fromDepth = from.path.split('/').length
  to.meta.transition = toDepth < fromDepth ? 'slide-right' : 'slide-left'
})

export default router
