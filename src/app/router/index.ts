import { createRouter, createWebHistory } from 'vue-router'
import YearView from '@/pages/YearView/YearView.vue'
import MonthView from '@/pages/MonthView/MonthView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: YearView,
    },
    {
      path: '/month/:index',
      component: MonthView,
    },
  ],
})

export default router
