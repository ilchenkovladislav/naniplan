import { createRouter, createWebHistory } from 'vue-router'
import YearView from '@/pages/YearView/YearView.vue'
import MyEditor from '@/components/MyEditor/MyEditor.vue'

const router = createRouter({
  history: createWebHistory('/naniplan/'),
  routes: [
    {
      path: '/',
      component: MyEditor,
    },
    {
      path: '/yearView',
      component: YearView,
    },
  ],
})

export default router
