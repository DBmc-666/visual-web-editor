/**
 * @file 历史版本快照存储
 * @description 把整个项目（所有画布与页面）保存为具名快照，存在 localStorage 中，
 * 支持随时回退。与"草稿"的区别：草稿是自动保存的最新状态（只有一个），
 * 快照是用户主动保存的多个时间点，可用于对比与回退。
 *
 * 存储结构：
 * {
 *   version: '1.0',
 *   items: [
 *     { id, name, createdAt, stats: { canvasCount, pageCount, componentCount }, data: { project, activeCanvasId, activePageId } }
 *   ]
 * }
 */

export const VERSION_STORAGE_KEY = 'visual-web-editor:versions:v1'

/** 最多保留的快照数量（超出后丢弃最旧的） */
export const MAX_VERSIONS = 20

/** 单个快照的体积上限（字节），避免 localStorage 被撑爆 */
export const MAX_SNAPSHOT_BYTES = 2 * 1024 * 1024

/**
 * 生成快照 id
 */
function generateVersionId() {
  return `ver_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

/**
 * 读取全部快照（内部结构，含完整数据）
 * @returns {{version: string, items: Array}}
 */
function readStore() {
  try {
    const raw = localStorage.getItem(VERSION_STORAGE_KEY)
    if (!raw) return { version: '1.0', items: [] }
    const parsed = JSON.parse(raw)
    if (!parsed || !Array.isArray(parsed.items)) return { version: '1.0', items: [] }
    return parsed
  } catch (error) {
    console.warn('读取历史版本失败:', error)
    return { version: '1.0', items: [] }
  }
}

/**
 * 写入快照存储
 */
function writeStore(store) {
  try {
    localStorage.setItem(VERSION_STORAGE_KEY, JSON.stringify(store))
    return true
  } catch (error) {
    console.warn('保存历史版本失败:', error)
    return false
  }
}

/**
 * 统计项目规模（用于列表展示与体积评估）
 * @param {Object} project
 */
export function summarizeProject(project) {
  const canvases = project?.canvases || []
  let pageCount = 0
  let componentCount = 0

  canvases.forEach(canvas => {
    const pages = canvas.pages || []
    pageCount += pages.length
    pages.forEach(page => {
      componentCount += (page.components || []).length
    })
  })

  return { canvasCount: canvases.length, pageCount, componentCount }
}

/**
 * 列出所有快照（不含完整数据，避免列表页加载过慢）
 * @returns {Array<{id, name, createdAt, stats, size}>}
 */
export function listVersions() {
  const store = readStore()
  return store.items
    .map(item => ({
      id: item.id,
      name: item.name,
      createdAt: item.createdAt,
      stats: item.stats || summarizeProject(item.data?.project),
      size: JSON.stringify(item).length
    }))
    .sort((a, b) => b.createdAt - a.createdAt)
}

/**
 * 保存一个快照
 * @param {Object} options
 * @param {string} [options.name] - 快照名称
 * @param {Object} options.project - 项目数据
 * @param {string} options.activeCanvasId
 * @param {string} options.activePageId
 * @returns {{ok: boolean, item?: Object, message?: string}}
 */
export function saveVersion({ name, project, activeCanvasId, activePageId }) {
  if (!project || !Array.isArray(project.canvases)) {
    return { ok: false, message: '没有可保存的项目数据' }
  }

  const data = {
    project: JSON.parse(JSON.stringify(project)),
    activeCanvasId,
    activePageId
  }
  const stats = summarizeProject(data.project)
  const size = JSON.stringify(data).length

  if (size > MAX_SNAPSHOT_BYTES) {
    return {
      ok: false,
      message: `当前项目体积约 ${(size / 1024 / 1024).toFixed(1)}MB，超过单快照上限 ${(MAX_SNAPSHOT_BYTES / 1024 / 1024).toFixed(0)}MB；`
        + '建议先移除较大的本地图片（本地图片以 data URL 存在页面数据里）'
    }
  }

  const store = readStore()
  const item = {
    id: generateVersionId(),
    name: (String(name || '').trim() || `版本 ${listVersions().length + 1}`),
    createdAt: Date.now(),
    stats,
    data
  }

  store.items.push(item)

  // 超出数量上限时丢弃最旧的
  while (store.items.length > MAX_VERSIONS) {
    store.items.shift()
  }

  if (!writeStore(store)) {
    return { ok: false, message: '保存失败：本地存储空间不足（可删除一些旧版本后重试）' }
  }

  return {
    ok: true,
    item: { id: item.id, name: item.name, createdAt: item.createdAt, stats, size }
  }
}

/**
 * 取出某个快照的完整数据
 * @param {string} id
 * @returns {{project: Object, activeCanvasId: string, activePageId: string}|null}
 */
export function getVersion(id) {
  const store = readStore()
  const item = store.items.find(v => v.id === id)
  if (!item) return null
  return JSON.parse(JSON.stringify(item.data))
}

/**
 * 重命名快照
 */
export function renameVersion(id, name) {
  const cleaned = String(name || '').trim()
  if (!cleaned) return false
  const store = readStore()
  const item = store.items.find(v => v.id === id)
  if (!item) return false
  item.name = cleaned
  return writeStore(store)
}

/**
 * 删除快照
 */
export function removeVersion(id) {
  const store = readStore()
  const index = store.items.findIndex(v => v.id === id)
  if (index === -1) return false
  store.items.splice(index, 1)
  return writeStore(store)
}

/**
 * 清空所有快照
 */
export function clearVersions() {
  return writeStore({ version: '1.0', items: [] })
}

/**
 * 当前快照占用的总字节数（用于提示存储压力）
 */
export function getVersionsSize() {
  const store = readStore()
  return JSON.stringify(store).length
}

export default {
  VERSION_STORAGE_KEY,
  MAX_VERSIONS,
  MAX_SNAPSHOT_BYTES,
  listVersions,
  saveVersion,
  getVersion,
  renameVersion,
  removeVersion,
  clearVersions,
  getVersionsSize,
  summarizeProject
}
