import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import electron from 'vite-plugin-electron/simple'

export default defineConfig({
  css: {
    postcss: {} // Disables automatic PostCSS config searching
  },
  plugins: [
    react(),
    tailwindcss(),
    electron({
      main: { entry: 'electron/main.ts' }
    })
  ],
  base: './',
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})