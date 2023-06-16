import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import UnoCSS from 'unocss/vite'

import Components from 'unplugin-vue-components/vite'

import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Components(),
    UnoCSS(),

    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: false
      },
      mode: 'production',
      selfDestroying: false,
      workbox: {
        // maximumFileSizeToCacheInBytes: 20971520,
        
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
            {
              urlPattern: /^https:\/\/pokeapi\.co\/api/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'pokeapi-cache',
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              
              urlPattern: /^https:\/\/pokedex-sprites\.meixuan\.site/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'pokedex-sprites-cache',
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
      },
      manifest: {
        name: 'Pokédex',
        short_name: 'Pokédex',
        description: 'A Pokédex powered by PokeAPI. This web page is built for self-learning only. The intention is to apply learning to practice.',
        theme_color: '#fff',
        icons: [
            {
              src: 'pwa-64x64.png',
              sizes: '64x64',
              type: 'image/png'
            },
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'  
            },
            {
              src: 'maskable-icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
        ]
      }
    
    })
    
    
  ],
  ssgOptions: {
    includedRoutes(paths) {
      return paths.filter(path => !path.includes('pokemon'))
    }
  },

})