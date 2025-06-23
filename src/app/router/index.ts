import { createRouter, createWebHistory } from 'vue-router'
import YearView from '@/pages/YearView/YearView.vue'
import MonthView from '@/pages/MonthView/MonthView.vue'
import MyEditor from '@/components/MyEditor/MyEditor.vue'

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
    {
      path: '/editor',
      component: MyEditor,
    },
  ],
})

export default router
