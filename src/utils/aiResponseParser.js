/**
 * @file AI 响应解析器
 * @description 将 LLM 返回的文本容错解析为编辑器页面 JSON：
 * - 剥离 ```json ``` Markdown 代码块与前后杂文
 * - 提取 JSON 对象
 * - 经 componentSchema.sanitizePageData 校验清洗（白名单过滤、类型纠正、越界裁剪）
 * - 经 layoutRepair.repairLayout 自动修复组件重叠（AI 常把绝对定位画布当文档流写，导致堆叠）
 */

import { sanitizePageData } from './componentSchema.js'
import { repairLayout, countOverlaps } from './layoutRepair.js'
import { sanitizeSlug } from './pageLinks.js'

/**
 * 从 LLM 回复文本中提取 JSON 对象（或数组）字符串
 * @param {string} text
 * @returns {{raw: string, error?: string}}
 */
export function extractJSONObject(text) {
  if (typeof text !== 'string') {
    return { raw: '', error: 'AI 返回内容不是文本' }
  }

  let str = text.trim()

  // 剥离 ```json ... ``` / ``` ... ``` 代码块
  const fenceMatch = str.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenceMatch) {
    str = fenceMatch[1].trim()
  }

  // 找到第一个 { 或 [（取更早出现的那个），与对应的最后一个 } 或 ]，之间即主体
  // 支持顶层为数组的回复（例如多页生成时模型直接返回 pages 数组）
  const firstBrace = str.indexOf('{')
  const firstBracket = str.indexOf('[')
  const useArray = firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)
  const start = useArray ? firstBracket : firstBrace
  const end = str.lastIndexOf(useArray ? ']' : '}')

  if (start === -1 || end === -1 || end <= start) {
    return { raw: '', error: '回复中没有找到 JSON 对象，请检查 API Key / 模型是否返回了有效内容' }
  }

  return { raw: str.slice(start, end + 1) }
}

/**
 * 解析 AI 响应并校验为页面数据
 * @param {string} text - LLM 原始回复
 * @param {Object} [options] - 传给 sanitizePageData 的边界选项，如 { maxWidth: page.width, maxHeight: page.height }
 * @param {boolean} [options.repair=true] - 是否自动修复组件重叠
 * @returns {{success: boolean, page?: Object, raw?: string, errors?: string[], repair?: Object, overlapsBefore?: number, overlapsAfter?: number}}
 */
export function parseAiPageResponse(text, options = {}) {
  const { repair = true, ...sanitizeOptions } = options
  const { raw, error } = extractJSONObject(text)
  if (error) return { success: false, errors: [error], raw: text }

  let data
  try {
    data = JSON.parse(raw)
  } catch (e) {
    // JSON.parse 失败时尝试修复常见问题：结尾逗号、单引号等情况由模型修复；这里给出明确报错
    return { success: false, errors: [`JSON 解析失败：${e.message}。建议更换更稳定的模型或稍后重试`], raw: text }
  }

  const result = sanitizePageData(data, sanitizeOptions)
  if (!result.success) {
    return { success: false, errors: result.errors, raw: text }
  }

  // 校验：组件不能为空，否则视为失败
  if (result.page.components.length === 0) {
    return { success: false, errors: ['AI 结果中没有可用组件，请重试'], raw: text }
  }

  // 自动修复重叠：AI 常把绝对定位画布误当文档流，导致多个组件共用同一个 top
  let repairReport = null
  let overlapsBefore = 0
  let overlapsAfter = 0
  if (repair) {
    overlapsBefore = countOverlaps(result.page)
    if (overlapsBefore > 0) {
      repairReport = repairLayout(result.page)
      overlapsAfter = countOverlaps(result.page)
    }
  }

  return {
    success: true,
    page: result.page,
    raw,
    errors: result.errors || [],
    repair: repairReport,
    overlapsBefore,
    overlapsAfter
  }
}

/**
 * 解析 AI 响应并校验为「多页站点」数据
 *
 * 与 parseAiPageResponse 的区别：期望 AI 返回 { siteName, pages: [...] }，
 * 对**每个页面**分别执行 Schema 校验与重叠修复，并汇总统计。
 * 页面里的跨页链接允许先用页面名书写（`#page:关于我们`），
 * 由编辑器在创建页面后解析为真实 ID（见 utils/pageLinks.js）。
 *
 * @param {string} text - LLM 原始回复
 * @param {Object} [options]
 * @param {boolean} [options.repair=true] - 是否逐页自动修复组件重叠
 * @param {number} [options.maxWidth] - 单页最大宽度（越界裁剪）
 * @param {number} [options.maxHeight] - 单页最大高度
 * @param {number} [options.maxPages=12] - 最多接受的页面数
 * @returns {{success: boolean, site?: {name: string, pages: Array}, raw?: string, errors?: string[], stats?: Object, pagesRepair?: Array}}
 */
export function parseAiSiteResponse(text, options = {}) {
  const { repair = true, maxPages = 12, ...sanitizeOptions } = options

  const { raw, error } = extractJSONObject(text)
  if (error) return { success: false, errors: [error], raw: text }

  let data
  try {
    data = JSON.parse(raw)
  } catch (e) {
    return { success: false, errors: [`JSON 解析失败：${e.message}。建议更换更稳定的模型或稍后重试`], raw: text }
  }

  // 兼容两种写法：{ siteName, pages: [...] } 或直接返回页面数组
  const rawPages = Array.isArray(data)
    ? data
    : (Array.isArray(data?.pages) ? data.pages : null)

  if (!rawPages || rawPages.length === 0) {
    return {
      success: false,
      errors: ['AI 结果里没有找到 pages 数组（多页生成需要输出 { siteName, pages: [...] }）'],
      raw: text
    }
  }
  if (rawPages.length > maxPages) {
    return {
      success: false,
      errors: [`AI 返回了 ${rawPages.length} 个页面，超过上限 ${maxPages} 个，请缩小需求范围后重试`],
      raw: text
    }
  }

  const pages = []
  const errors = []
  const pagesRepair = []
  let componentCount = 0
  let overlapsBefore = 0
  let overlapsAfter = 0

  rawPages.forEach((rawPage, index) => {
    const label = (rawPage && typeof rawPage.name === 'string' && rawPage.name.trim())
      ? rawPage.name.trim()
      : `第 ${index + 1} 页`

    const result = sanitizePageData(rawPage, sanitizeOptions)
    if (!result.success) {
      errors.push(`「${label}」校验失败：${(result.errors || []).join('；')}`)
      return
    }
    if (result.page.components.length === 0) {
      errors.push(`「${label}」没有可用组件，已跳过`)
      return
    }

    // 页面名兜底：Schema 默认名没有意义，回退为 AI 输出的名称
    if (!result.page.name || result.page.name === 'AI 生成页面') {
      result.page.name = label
    }

    // AI 给出的英文文件名（slug）：用于导出时的有意义文件名（products.html 而不是 page-3.html）
    const slug = sanitizeSlug(rawPage?.slug)
    if (slug) result.page.slug = slug

    let before = 0
    let after = 0
    let report = null
    if (repair) {
      before = countOverlaps(result.page)
      if (before > 0) {
        report = repairLayout(result.page)
        after = countOverlaps(result.page)
      }
    }

    overlapsBefore += before
    overlapsAfter += after
    componentCount += result.page.components.length
    pages.push(result.page)
    pagesRepair.push({
      name: result.page.name,
      slug: result.page.slug || '',
      componentCount: result.page.components.length,
      overlapsBefore: before,
      overlapsAfter: after,
      repair: report
    })
  })

  if (pages.length === 0) {
    return {
      success: false,
      errors: errors.length ? errors : ['AI 结果中没有可用的页面，请重试'],
      raw: text
    }
  }

  // 页面名去重：AI 偶尔会输出同名页面，同名会让跨页链接产生歧义
  const usedNames = new Set()
  pages.forEach(page => {
    let name = String(page.name || '').trim() || '未命名页面'
    if (usedNames.has(name)) {
      let n = 2
      while (usedNames.has(`${name} ${n}`)) n += 1
      name = `${name} ${n}`
    }
    usedNames.add(name)
    page.name = name
  })

  const siteName = (data && typeof data.siteName === 'string' && data.siteName.trim())
    ? data.siteName.trim()
    : 'AI 生成站点'

  return {
    success: true,
    site: { name: siteName, pages },
    raw,
    errors,
    stats: { pageCount: pages.length, componentCount, overlapsBefore, overlapsAfter },
    pagesRepair
  }
}

export default { extractJSONObject, parseAiPageResponse, parseAiSiteResponse }