import { createApp } from 'vue'
import App from './App.vue'

import Vue3DraggableResizable from 'vue3-draggable-resizable'
import 'vue3-draggable-resizable/dist/Vue3DraggableResizable.css'
import Notifications from '@kyvg/vue3-notification'



const app = createApp(App)
    .use(Vue3DraggableResizable)
    .mount('#app')

app.use(Notifications)
