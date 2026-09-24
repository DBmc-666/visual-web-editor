/**
 * @file 测试工具：断言上下文、ZIP 解包、页面构造等公共辅助
 */

import { pathToFileURL, fileURLToPath } from 'node:url'
import path from 'node:path'

/** 仓库根目录（tests/ 的上一级） */
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/** src 目录的 file:// URL 前缀，便于动态 import */
export const SRC = pathToFileURL(path.join(ROOT, 'src')).href + '/'

/**
 * 动态导入 src 下的模块
 * @param {string} relPath - 相对 src 的路径，如 'utils/htmlGenerator.js'
 */
export function importSrc(relPath) {
  return import(`${SRC}${relPath}`)
}

/**
 * 创建断言上下文
 * @param {string} fileName
 */
export function createContext(fileName) {
  const results = []
  let section = ''

  const api = {
    fileName,
    results,

    /** 声明一个分组（仅用于输出可读性） */
    group(title) {
      section = title
    },

    /** 基础断言 */
    check(name, condition, extra = '') {
      results.push({ section, name, ok: !!condition, extra: extra === '' ? '' : String(extra) })
      return !!condition
    },

    /** 相等断言（失败时打印实际值） */
    equal(name, actual, expected) {
      const ok = JSON.stringify(actual) === JSON.stringify(expected)
      return api.check(name, ok, ok ? '' : `实际=${JSON.stringify(actual)} 期望=${JSON.stringify(expected)}`)
    },

    /** 包含断言 */
    includes(name, haystack, needle) {
      const ok = String(haystack).includes(needle)
      return api.check(name, ok, ok ? '' : `未包含 ${JSON.stringify(needle)}`)
    },

    /** 异步抛错断言 */
    async throws(name, fn, codeOrSubstring) {
      try {
        await fn()
        return api.check(name, false, '预期抛错但成功了')
      } catch (error) {
        const ok = codeOrSubstring
          ? (error?.code === codeOrSubstring || String(error?.message || '').includes(codeOrSubstring))
          : true
        return api.check(name, ok, ok ? '' : `错误不匹配：${error?.name}/${error?.code} ${error?.message}`)
      }
    }
  }

  return api
}

/**
 * 取出最近一次 saveAs 捕获的 ZIP 并解包
 * @returns {Promise<{names: string[], read: (name: string) => Promise<string>, zip: Object}>}
 */
export async function loadSavedZip(index = -1) {
  const saved = index === -1
    ? globalThis.__savedFiles[globalThis.__savedFiles.length - 1]
    : globalThis.__savedFiles[index]
  if (!saved || !saved.blob) throw new Error('没有捕获到导出的 ZIP（saveAs 未被调用？）')

  const JSZip = (await import('jszip')).default
  const zip = await JSZip.loadAsync(await saved.blob.arrayBuffer())
  return {
    zip,
    name: saved.name,
    names: Object.keys(zip.files),
    read: (file) => zip.file(file).async('string')
  }
}

/** 清空 saveAs 捕获记录（每个用例前调用，避免串味） */
export function resetSavedFiles() {
  globalThis.__savedFiles = []
  globalThis.__lastSaved = null
}

/**
 * 构造一个组件（测试用，字段齐全）
 */
export function makeComponent(type, overrides = {}) {
  return {
    id: overrides.id || `${type}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    left: 0,
    top: 0,
    width: 100,
    height: 40,
    zIndex: 3,
    style: {},
    props: {},
    visible: true,
    locked: false,
    ...overrides
  }
}

/**
 * 构造一个页面数据对象
 */
export function makePage(overrides = {}) {
  return {
    id: overrides.id || `page-test-${Math.random().toString(36).slice(2, 8)}`,
    name: '测试页面',
    width: 1200,
    height: 800,
    backgroundColor: '#ffffff',
    backgroundType: 'solid',
    components: [],
    ...overrides
  }
}

/** 一行式断言输出 */
export function formatResult(result) {
  const mark = result.ok ? 'PASS' : 'FAIL'
  return result.extra ? `${mark} ${result.name}  ${result.extra}` : `${mark} ${result.name}`
}
