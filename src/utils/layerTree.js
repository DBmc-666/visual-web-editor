/**
 * @file 图层树构建模块
 * @description 通过几何包含关系自动推断组件的父子层级。
 *
 * 编辑器画布是绝对定位模型，组件数据里没有显式的父子字段，但容器（container）
 * 通常作为背景块包住若干子组件。本模块用矩形包含关系推断父子结构，
 * 供图层面板折叠展示，并与布局修复（layoutRepair）复用同一套判定规则。
 */

// 判定「被容器包含」时的容差（px）
export const CONTAIN_TOLERANCE = 2

/** 取组件矩形 */
export function rectOf(comp) {
  return {
    l: comp.left,
    t: comp.top,
    r: comp.left + comp.width,
    b: comp.top + comp.height
  }
}

/** 两个矩形是否真正相交（容差内不算相交，避免相邻贴边被误判） */
export function isOverlapping(a, b, tol = 1) {
  return a.l < b.r - tol && b.l < a.r - tol && a.t < b.b - tol && b.t < a.b - tol
}

/** outer 是否完全包含 inner */
export function isContaining(outer, inner, tol = CONTAIN_TOLERANCE) {
  return (
    inner.l >= outer.l - tol &&
    inner.r <= outer.r + tol &&
    inner.t >= outer.t - tol &&
    inner.b <= outer.b + tol
  )
}

/** 矩形面积 */
export function area(r) {
  return Math.max(0, r.r - r.l) * Math.max(0, r.b - r.t)
}

/**
 * 计算每个组件的父容器 id
 *
 * 规则：
 * 1. 只有 `container` 类型可以作为父容器（其他组件是内容，不作为容器）
 * 2. 父容器必须完全包含该组件（允许 CONTAIN_TOLERANCE 容差）
 * 3. 优先选「数组顺序上更晚声明、且声明在该组件之前」的容器
 *    —— 这样写在一整条通栏背景里的页脚元素，不会被误判成某张卡片的子元素
 * 4. 没有满足 3 的候选时，退化为「面积最小」的容器（即最贴近的内层容器）
 *
 * @param {Array} components - 组件数组
 * @returns {Map<string, string|null>} 子组件 id → 父容器 id（无父为 null）
 */
export function computeParentIds(components) {
  const list = (components || []).filter(Boolean)
  const order = new Map(list.map((c, i) => [c.id, i]))
  const containers = list.filter(c => c.type === 'container')
  const result = new Map()

  for (const comp of list) {
    const rect = rectOf(comp)
    const compOrder = order.get(comp.id)
    let byOrder = null
    let byOrderIndex = -1
    let byArea = null
    let byAreaValue = Infinity

    for (const container of containers) {
      if (container.id === comp.id) continue
      const cRect = rectOf(container)
      if (!isContaining(cRect, rect)) continue

      const cOrder = order.get(container.id)
      if (cOrder < compOrder && cOrder > byOrderIndex) {
        byOrder = container.id
        byOrderIndex = cOrder
      }

      const a = area(cRect)
      if (a < byAreaValue) {
        byArea = container.id
        byAreaValue = a
      }
    }

    result.set(comp.id, byOrder || byArea || null)
  }

  return result
}

/**
 * 构建图层树
 *
 * 同级排序由 sortBy 决定（两种模式都是**升序**，调用方按需反转）：
 * - 'paint'：按绘制顺序（zIndex 升序，同值按数组顺序），即自底向顶；
 *            面板反转后展示为「最上层在前」
 * - 'position'：按页面位置（top 升序 → 面积大的在前 → left 升序），即"从上往下、从大往小"；
 *            面板直接按此顺序展示（页面顶部在前）
 *
 * @param {Array} components - 组件数组
 * @param {Object} [options]
 * @param {'paint'|'position'} [options.sortBy='paint'] - 同级排序方式
 * @returns {{roots: Array, nodeById: Map<string, Object>, parentIds: Map<string, string|null>}}
 *          roots：根节点数组；节点结构 { comp, children: [] }
 */
export function buildLayerTree(components, options = {}) {
  const { sortBy = 'paint' } = options
  const list = (components || []).filter(Boolean)
  const order = new Map(list.map((c, i) => [c.id, i]))
  const parentIds = computeParentIds(list)

  // 防环：容器矩形完全重合时可能出现互相包含，这里把成环的节点提升为根节点
  const createsCycle = (childId, parentId) => {
    const seen = new Set([childId])
    let cur = parentId
    while (cur) {
      if (seen.has(cur)) return true
      seen.add(cur)
      cur = parentIds.get(cur) || null
    }
    return false
  }
  for (const [childId, parentId] of parentIds) {
    if (parentId && createsCycle(childId, parentId)) {
      parentIds.set(childId, null)
    }
  }

  const nodeById = new Map(list.map(c => [c.id, { comp: c, children: [] }]))
  const roots = []

  for (const comp of list) {
    const node = nodeById.get(comp.id)
    const parentId = parentIds.get(comp.id)
    const parentNode = parentId ? nodeById.get(parentId) : null
    if (parentNode) parentNode.children.push(node)
    else roots.push(node)
  }

  // 同级排序
  // - 'paint'（默认）：按绘制顺序（zIndex 升序，同值按数组顺序），自底向顶
  // - 'position'：按页面位置（top 升序 → 面积大的在前 → left 升序），即"从上往下、从大往小"
  const sortNodes = (nodes) => {
    if (sortBy === 'position') {
      nodes.sort((a, b) => {
        const ca = a.comp
        const cb = b.comp
        const ta = Number(ca.top) || 0
        const tb = Number(cb.top) || 0
        if (ta !== tb) return ta - tb
        // 同一水平位置时，大块（面积大）排在前面
        const aa = (Number(ca.width) || 0) * (Number(ca.height) || 0)
        const ab = (Number(cb.width) || 0) * (Number(cb.height) || 0)
        if (aa !== ab) return ab - aa
        const la = Number(ca.left) || 0
        const lb = Number(cb.left) || 0
        if (la !== lb) return la - lb
        return (order.get(ca.id) || 0) - (order.get(cb.id) || 0)
      })
    } else {
      nodes.sort((a, b) => {
        const za = a.comp.zIndex || 3
        const zb = b.comp.zIndex || 3
        if (za !== zb) return za - zb
        return (order.get(a.comp.id) || 0) - (order.get(b.comp.id) || 0)
      })
    }
    nodes.forEach(n => sortNodes(n.children))
  }
  sortNodes(roots)

  return { roots, nodeById, parentIds }
}

/**
 * 把「同级新顺序」映射回全局绘制顺序
 *
 * 同级组件在全局绘制顺序中占据若干槽位，这里按新顺序依次填回这些槽位，
 * 从而保持它们与非同级组件之间的相对叠放关系不变。
 *
 * @param {string[]} globalOrderIds - 当前全局绘制顺序（自底向顶）
 * @param {string[]} siblingIds - 被重排的同级组件 id 集合
 * @param {string[]} newSiblingBottomToTop - 同级新顺序（自底向顶）
 * @returns {string[]} 新的全局绘制顺序
 */
export function applySiblingReorder(globalOrderIds, siblingIds, newSiblingBottomToTop) {
  const siblingSet = new Set(siblingIds)
  const queue = [...newSiblingBottomToTop]
  return globalOrderIds.map(id => (siblingSet.has(id) ? (queue.shift() ?? id) : id))
}

/**
 * 统计每个容器的直接子组件数量
 * @param {Array} components
 * @returns {Map<string, number>} 容器 id → 子组件数
 */
export function countChildren(components) {
  const parentIds = computeParentIds(components)
  const counts = new Map()
  for (const parentId of parentIds.values()) {
    if (!parentId) continue
    counts.set(parentId, (counts.get(parentId) || 0) + 1)
  }
  return counts
}

export default {
  CONTAIN_TOLERANCE,
  rectOf,
  isOverlapping,
  isContaining,
  area,
  computeParentIds,
  buildLayerTree,
  applySiblingReorder,
  countChildren
}
