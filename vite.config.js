import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

/**
 * AI 服务商本地代理映射
 * 作用：浏览器直连第三方 AI 接口会被 CORS 拦截（对方不返回 Access-Control-Allow-Origin），
 *      因此前端改为请求同源的 /api-proxy/... 路径，由 dev/preview 服务器转发到真实端点。
 * 注意：此映射需与 src/utils/aiSettings.js 中各 provider 的 proxyPath 保持一致。
 */
const AI_PROXY_TARGETS = {
  '/api-proxy/deepseek': 'https://api.deepseek.com',
  '/api-proxy/opencode-go': 'https://opencode.ai/zen/go'
}

// 生成 Vite 代理配置
const aiProxy = Object.fromEntries(
  Object.entries(AI_PROXY_TARGETS).map(([path, target]) => [
    path,
    {
      target,
      changeOrigin: true,
      secure: true,
      // 去掉 /api-proxy/xxx 前缀，其余路径原样转发
      rewrite: (p) => p.replace(new RegExp(`^${path}`), ''),
      // 转发时使用自定义 UA，便于服务商识别流量来源
      headers: {
        'user-agent': 'visual-web-editor/1.0'
      }
    }
  ])
)

// 后期可扩展：支持原生 HTML 模式
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  // 开发服务器代理（npm run dev）
  server: {
    proxy: aiProxy
  },
  // 预览服务器代理（npm run preview，用于验证打包产物）
  preview: {
    proxy: aiProxy
  }
})
