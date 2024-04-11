import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import TurboConsole from '../../src/vite'
import inspect from 'vite-plugin-inspect'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    inspect(),
    TurboConsole({
      prefix: '🚀🚀🚀🚀🚀🚀',
      suffix: '💡💡💡💡💡',
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
