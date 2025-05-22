import { createRouter, createWebHistory } from 'vue-router'
import YearView from '@/pages/YearView/YearView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: YearView,
    },
  ],
})

export default router
