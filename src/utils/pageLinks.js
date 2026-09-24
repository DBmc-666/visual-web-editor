/**
 * @file 页面间跳转链接工具
 * @description 编辑器内部统一使用 `#page:<页面ID>` 表示"跳转到某个页面"，
 * 导出时由 htmlGenerator.rewritePageLinks 重写为目标页面的文件名。
 *
 * AI 生成时无法预知"尚未创建的页面"的 ID，因此允许先用**页面名**书写链接
 * （例如 `#page:关于我们`）；页面真正创建后再由 resolvePagesPageLinks
 * 统一解析为真实 ID。这样 AI 只需要知道站点有哪些页面，不必知道内部 ID。
 */

export const PAGE_LINK_PREFIX = '#page:'

// 匹配 #page: 后面的目标（ID 或页面名），遇到引号/空白/竖线/尖括号即结束
const PAGE_LINK_REGEX = /#page:([^"'\s<>|]+)/g

/**
 * 生成页面跳转链接值
 * @param {string} pageId - 目标页面 ID
 */
export function buildPageLink(pageId) {
  return `${PAGE_LINK_PREFIX}${pageId}`
}

/**
 * 取出页面链接的目标（ID 或名称）
 * @param {string} value - 链接值
 * @returns {string} 非页面链接返回空串
 */
export function parsePageLink(value) {
  const match = String(value || '').match(/^#page:(.+)$/)
  return match ? match[1].trim() : ''
}

/**
 * 判断字符串中是否含页面跳转链接
 */
export function hasPageLink(value) {
  return String(value || '').includes(PAGE_LINK_PREFIX)
}

/**
 * 构建「页面名 → 页面ID」查找表
 * 同时登记原名与小写名，便于大小写不敏感匹配
 * @param {Array} pages - 页面数组
 * @returns {Map<string, string>}
 */
export function buildPageNameIndex(pages) {
  const index = new Map()
  ;(pages || []).forEach(page => {
    const name = String(page.name || '').trim()
    if (!name) return
    index.set(name, page.id)
    index.set(name.toLowerCase(), page.id)
  })
  return index
}

/**
 * 把字符串里的 `#page:<页面名>` 解析为 `#page:<页面ID>`
 * 名称未匹配到时原样保留（导出阶段会降级为 `#`）
 * @param {string} value
 * @param {Map<string, string>} nameIndex
 */
export function resolvePageLinkNames(value, nameIndex) {
  if (typeof value !== 'string' || !value.includes(PAGE_LINK_PREFIX)) return value
  return value.replace(PAGE_LINK_REGEX, (match, rawName) => {
    const name = String(rawName).trim()
    const id = nameIndex.get(name) || nameIndex.get(name.toLowerCase())
    return id ? `${PAGE_LINK_PREFIX}${id}` : match
  })
}

/**
 * 解析单个组件所有字符串属性里的页面链接名称
 * 组件的链接既可能在 href，也可能藏在 menuItems / items / images 这类
 * 以 `|` 分隔的文本属性中，因此对全部字符串属性统一替换，无需逐组件特判
 * @param {Object} component
 * @param {Map<string, string>} nameIndex
 */
export function resolveComponentPageLinks(component, nameIndex) {
  if (!component || !component.props) return component
  Object.keys(component.props).forEach(key => {
    const value = component.props[key]
    if (typeof value === 'string') {
      component.props[key] = resolvePageLinkNames(value, nameIndex)
    }
  })
  return component
}

/**
 * 解析一组页面里所有组件的页面链接名称
 * @param {Array} pages
 * @param {Map<string, string>} nameIndex
 */
export function resolvePagesPageLinks(pages, nameIndex) {
  ;(pages || []).forEach(page => {
    ;(page.components || []).forEach(comp => resolveComponentPageLinks(comp, nameIndex))
  })
  return pages
}

/**
 * 统计页面链接数量与未解析数量（用于应用后的提示）
 * @param {Array} pages
 * @param {Set<string>} validIds - 有效的页面 ID 集合
 * @returns {{total: number, unresolved: number}}
 */
export function countPageLinks(pages, validIds = new Set()) {
  let total = 0
  let unresolved = 0

  ;(pages || []).forEach(page => {
    ;(page.components || []).forEach(comp => {
      Object.values(comp.props || {}).forEach(value => {
        if (typeof value !== 'string' || !value.includes(PAGE_LINK_PREFIX)) return
        const matches = value.match(PAGE_LINK_REGEX) || []
        matches.forEach(m => {
          total += 1
          const target = m.slice(PAGE_LINK_PREFIX.length)
          if (!validIds.has(target)) unresolved += 1
        })
      })
    })
  })

  return { total, unresolved }
}

/**
 * 清洗页面 slug（用于导出文件名）
 * 只保留小写字母、数字与连字符；非法时返回空串
 * @param {string} value
 * @returns {string}
 */
export function sanitizeSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default {
  PAGE_LINK_PREFIX,
  buildPageLink,
  parsePageLink,
  hasPageLink,
  buildPageNameIndex,
  resolvePageLinkNames,
  resolveComponentPageLinks,
  resolvePagesPageLinks,
  countPageLinks,
  sanitizeSlug
}
