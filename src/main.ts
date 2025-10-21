import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { GesturePlugin } from '@vueuse/gesture'
import '@/style.css'

import App from './App.vue'
import router from '@/app/router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(GesturePlugin)

app.mount('#app')
