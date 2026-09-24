/**
 * @file 测试环境加载钩子
 * @description 让 Node 能直接运行 src/ 下的浏览器代码：
 * - 补全相对导入的 .js 扩展名（源码里写的是 `../utils/xxx` 这种无扩展名形式）
 * - 把 `file-saver` 替换为桩模块，并捕获导出的 ZIP（供测试解开校验）
 * - 注入浏览器环境的最小桩（localStorage / URL / document）
 *
 * 用法：node --import ./tests/loader.mjs tests/run.mjs
 */

import { registerHooks } from 'node:module'

// ==================== 浏览器环境桩（必须在任何源码模块之前生效）====================

const memoryStorage = new Map()

globalThis.localStorage = {
  getItem: (key) => (memoryStorage.has(key) ? memoryStorage.get(key) : null),
  setItem: (key, value) => { memoryStorage.set(key, String(value)) },
  removeItem: (key) => { memoryStorage.delete(key) },
  clear: () => memoryStorage.clear(),
  key: (i) => Array.from(memoryStorage.keys())[i] ?? null,
  get length() { return memoryStorage.size }
}

globalThis.URL.createObjectURL = () => 'blob:test'
globalThis.URL.revokeObjectURL = () => {}

globalThis.document = {
  createElement: () => ({ click() {}, href: '', download: '' }),
  body: { appendChild() {}, removeChild() {} }
}

// 捕获 saveAs 的产物，供测试解开 ZIP 校验内容
globalThis.__savedFiles = []

// ==================== 模块解析钩子 ====================

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'file-saver') {
      return { url: 'vwe:file-saver-stub', shortCircuit: true }
    }

    try {
      return nextResolve(specifier, context)
    } catch (error) {
      // 源码里的相对导入省略了 .js，这里补上重试
      if (specifier.startsWith('./') || specifier.startsWith('../')) {
        return nextResolve(`${specifier}.js`, context)
      }
      throw error
    }
  },

  load(url, context, nextLoad) {
    if (url === 'vwe:file-saver-stub') {
      return {
        format: 'module',
        shortCircuit: true,
        source: `
          export function saveAs(blob, name) {
            globalThis.__savedFiles.push({ blob, name })
            globalThis.__lastSaved = { blob, name }
          }
        `
      }
    }
    return nextLoad(url, context)
  }
})
