import { createRouter, createWebHashHistory } from 'vue-router'
import YearView from '@/pages/YearView/YearView.vue'
import MainPage from '@/pages/MainPage/MainPage.vue'

const router = createRouter({
  history: createWebHashHistory('/naniplan'),
  routes: [
    {
      path: '/',
      component: MainPage,
    },
    {
      path: '/yearView',
      component: YearView,
    },
  ],
})

export default router
