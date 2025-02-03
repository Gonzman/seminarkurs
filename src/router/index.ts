import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import MatchTheWire from '../views/minigames/wire/MatchTheWire.vue'
import Level from '@/views/minigames/level'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/wire',
      name: 'wire',
      component: MatchTheWire,
      props: { level: Level.SUPER_HARD },
    },
    {
      path: '/caeser',
      name: 'caeser',
      component: () => import('../views/minigames/encryption/Encryption.vue'),
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

export default router
