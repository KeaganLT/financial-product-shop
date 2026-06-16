import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Tailwind v3 uses PostCSS, not the Vite plugin
// So we just need react plugin here — Tailwind runs through PostCSS automatically
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/client': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})