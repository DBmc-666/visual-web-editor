import { createApp } from 'vue'
import App from './App.vue'
import './assets/styles/global.css'
import { useEditor } from './stores/editor'

// 创建 Vue 应用
const app = createApp(App)

// 启动前恢复本地草稿（避免画布先渲染空页再填充）
const { loadPageDraft } = useEditor()
const draft = loadPageDraft()
if (draft.found) {
  console.log(`已从本地草稿恢复（${draft.componentCount} 个组件）`)
}

app.mount('#app')
