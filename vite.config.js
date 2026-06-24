import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/client': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // Preserve all request headers including Authorization
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            // Copy Authorization header explicitly so it isn't dropped
            if (req.headers['authorization']) {
              proxyReq.setHeader('Authorization', req.headers['authorization']);
            }
          });
        },
      },
      '/v1': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            if (req.headers['authorization']) {
              proxyReq.setHeader('Authorization', req.headers['authorization']);
            }
          });
        },
      },
    },
  },
})