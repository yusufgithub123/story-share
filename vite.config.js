import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  build: {
    sourcemap: true,
    outDir: 'dist',
  },
  plugins: [
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src/scripts',
      filename: 'sw.js',

      manifest: {
        name: 'StoryShare - Aplikasi Berbagi Cerita',
        short_name: 'StoryShare',
        description: 'Aplikasi berbagi cerita dengan gambar dan lokasi',
        start_url: '/',
        display: 'standalone',
        background_color: '#1E88E5',
        theme_color: '#1E88E5',
        orientation: 'portrait',
        scope: '/',
        icons: [
          {
            src: '/icons/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },

      injectManifest: {
        globPatterns: [
          '**/*.{js,css,html,png,jpg,jpeg,svg,webp,gif,ico,woff,woff2,ttf,eot}'
        ],
        globIgnores: ['**/node_modules/**', '**/sw*.js'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024 // 5MB
      },

      workbox: {
        cacheName: 'storyshare-cache-v1',
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/story-api\.dicoding\.dev\/v1/,
            handler: 'StaleWhileRevalidate'
          }
        ]
      },

      devOptions: {
        enabled: true,
        type: 'module',
      },
    })
  ],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    port: 3000,
    open: true,
    cors: true,
  }
});
