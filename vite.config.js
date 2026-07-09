import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import obfuscator from 'vite-plugin-javascript-obfuscator'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendTarget = env.VITE_BACKEND_URL || 'http://localhost:8080'
  const isProduction = mode === 'production'

  const proxyOptions = {
    target: backendTarget,
    changeOrigin: true,
    configure: (proxy) => {
      proxy.on('proxyReq', (proxyReq, req) => {
        if (req.headers['authorization']) {
          proxyReq.setHeader('Authorization', req.headers['authorization']);
        }
      });
    },
  }

  const plugins = [react()]

  if (isProduction) {
    plugins.push(
      obfuscator({
        include: ['src/**/*.js', 'src/**/*.jsx'],
        exclude: ['node_modules/**'],
        apply: 'build',
        options: {
          compact: true,
          controlFlowFlattening: false,
          deadCodeInjection: false,
          stringArray: true,
          stringArrayThreshold: 0.75,
          rotateStringArray: true,
          identifierNamesGenerator: 'hexadecimal',
        },
      })
    )
  }

  return {
    plugins,
    server: {
      proxy: {
        '/client': proxyOptions,
        '/v1': proxyOptions,
      },
    },
    build: {
      sourcemap: false,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: isProduction,
          drop_debugger: true,
        },
      },
    },
  }
})
