// import { createApp } from 'vue'
import { ViteSSG } from 'vite-ssg'
import './style.css'
import App from './App.vue'

import 'virtual:uno.css'

// import { createRouter, createWebHashHistory } from 'vue-router';
import Home from './components/Home.vue'
import Details from './components/Details.vue'

import { createPinia } from 'pinia'
import { useRootStore } from './store/root'

const routes = [
    { 
        path: '/', 
        component: Home
    },
    { 
        path: '/pokemon/:id', 
        component: Details
    }
]

// const router = createRouter({
//     history: createWebHashHistory(),
//     routes
// })

// const app = createApp(App)

// app.use(router)

// app.mount('#app')

export const createApp = ViteSSG(
    App,
    { routes },
    ({ app, initialState, router }) => {
        app.provide('clickedEntryRects', {
            imageRect: null,
            outlineRect: null,
            imageSrc: null,
            
            initialImageEl: null,
            initialOutlineEl: null
        })

        const pinia = createPinia()
        app.use(pinia)

        if (import.meta.env.SSR) {
            // This will be stringified and set to window.__INITIAL_STATE__
            initialState.pinia = pinia.state.value
        }
        else {
            // On the client side, we restore the state
            pinia.state.value = initialState?.pinia || {}
        }

        router.beforeEach(async (_, __, next) => {
            const store = useRootStore(pinia)
            await store.init()
            next()
        })


    }
)