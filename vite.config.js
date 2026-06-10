import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 后期可扩展：支持原生 HTML 模式
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
