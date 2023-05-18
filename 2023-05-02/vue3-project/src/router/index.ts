import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: "/about",
    name: "about",
    component: ()=> import('../views/AboutView.vue'),
    children: [
      {
        path: "",
        name: "content",
        component: ()=> import('../views/AboutContent.vue')
      },
      {
        path: "more",
        name: "more",
        component: ()=> import('../views/MoreView.vue')
      }
    ]
  }
]

const router = createRouter({
  routes,
  history: createWebHistory(import.meta.env.BASE_URL),
})

export default router
