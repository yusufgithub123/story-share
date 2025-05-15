import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src/scripts', 
      filename: 'sw.js',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,png,svg,webp}'], // ini daftar file yang akan di-cache
      },
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      }
    })
  ]
});
