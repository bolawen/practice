import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue')
  },
]

const router = createRouter({
  routes,
  history: createWebHistory(import.meta.env.BASE_URL)
})

function canUserAccess(to: RouteLocationNormalized){
  return new Promise((resolve)=>{
    setTimeout(()=>{
      resolve(true);
    },3000);
  });
}

router.beforeEach(async (to,from)=>{
  const canAccess = await canUserAccess(to);
  if(canAccess){
    return true;
  }
  return '/login'
});

export default router
