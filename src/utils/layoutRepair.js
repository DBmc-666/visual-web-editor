/**
 * @file 布局修复模块
 * @description 编辑器画布是「绝对定位」模型，而 AI 常把它当成文档流来写，
 * 导致大量组件被写在同一个 top 上互相堆叠（页面上糊成一片）。
 *
 * 本模块在 AI 结果进入画布之前做一次几何修复：
 * 1. 容器内部：修复子元素之间的实际重叠（真正相交才推，同一行的并排元素保持不动）
 * 2. 顶层区块：把互相重叠的区块（连同其内部子元素）整体下移，保证不重叠
 * 3. 页面高度：按修复后的内容自动补足，避免组件超出画布
 *
 * 注意：只处理「矩形真正相交」的情况，不会破坏本来正确的排版
 *（例如同一行里 left 各不相同的页脚链接，top 相同是合法的）。
 */

// 顶层区块之间的最小垂直间距
const BLOCK_GAP = 16
// 容器内部子元素之间的最小垂直间距
const CHILD_GAP = 6
// 判定「被容器包含」时的容差
const CONTAIN_TOLERANCE = 2

/** 取组件矩形 */
function rectOf(c) {
  return {
    l: c.left,
    t: c.top,
    r: c.left + c.width,
    b: c.top + c.height
  }
}

/** 两个矩形是否真正相交（容差内不算相交，避免相邻贴边被误判） */
function isOverlapping(a, b, tol = 1) {
  return a.l < b.r - tol && b.l < a.r - tol && a.t < b.b - tol && b.t < a.b - tol
}

/** outer 是否完全包含 inner */
function isContaining(outer, inner, tol = CONTAIN_TOLERANCE) {
  return inner.l >= outer.l - tol && inner.r <= outer.r + tol && inner.t >= outer.t - tol && inner.b <= outer.b + tol
}

/** 矩形面积 */
function area(r) {
  return Math.max(0, r.r - r.l) * Math.max(0, r.b - r.t)
}

/**
 * 修复页面布局（就地修改传入的组件数组坐标）
 * @param {Object} page - 页面数据（含 width/height/components）
 * @returns {{movedBlocks: number, movedChildren: number, grownContainers: number, heightExtended: number}}
 */
export function repairLayout(page) {
  const components = (page?.components || []).filter(Boolean)
  if (components.length === 0) {
    return { movedBlocks: 0, movedChildren: 0, grownContainers: 0, heightExtended: 0 }
  }

  // 记录原始下标，作为「AI 书写顺序」的稳定依据
  const order = new Map()
  components.forEach((c, i) => order.set(c, i))

  const containers = components.filter(c => c.type === 'container')

  /**
   * 计算每个组件的父容器
   * 判定策略（AI 坐标常常互相压叠，需要更贴近意图地归组）：
   * 1. 候选 = 完全包含该组件的容器
   * 2. 优先选「书写顺序上更晚声明、且声明在该组件之前」的容器
   *    —— 这样写在一整条通栏背景里的页脚元素不会被误判成某张卡片的子元素
   * 3. 若没有满足 2 的候选，则退化为「面积最小」的容器
   */
  const parentOf = new Map()
  for (const comp of components) {
    const rect = rectOf(comp)
    const compOrder = order.get(comp)
    let byOrder = null
    let byOrderIndex = -1
    let byArea = null
    let byAreaValue = Infinity

    for (const container of containers) {
      if (container === comp) continue
      const cRect = rectOf(container)
      if (!isContaining(cRect, rect)) continue

      const cOrder = order.get(container)
      if (cOrder < compOrder && cOrder > byOrderIndex) {
        byOrder = container
        byOrderIndex = cOrder
      }

      const a = area(cRect)
      if (a < byAreaValue) {
        byArea = container
        byAreaValue = a
      }
    }

    parentOf.set(comp, byOrder || byArea)
  }

  const childrenOf = new Map()
  for (const comp of components) {
    const parent = parentOf.get(comp)
    if (!parent) continue
    if (!childrenOf.has(parent)) childrenOf.set(parent, [])
    childrenOf.get(parent).push(comp)
  }

  // ============ 第一步：修复容器内部子元素重叠 ============
  let movedChildren = 0
  let grownContainers = 0

  for (const container of containers) {
    const children = childrenOf.get(container) || []
    if (children.length < 2) continue

    const placed = []
    const sorted = [...children].sort((a, b) => (a.top - b.top) || (order.get(a) - order.get(b)))

    // 1) 按原始 top 分行（容差 2px）
    const rows = []
    for (const child of sorted) {
      const row = rows.find(r => Math.abs(r.top - child.top) <= 2)
      if (row) row.items.push(child)
      else rows.push({ top: child.top, items: [child] })
    }

    // 2) 行内按「高度相同 + 互不重叠」分组：
    //    同一行里高度一致的元素通常是同一组并排内容（如一排页脚链接），
    //    整组同进同退可保持对齐，不会被行内其他高度的元素（如按钮）挤散。
    for (const row of rows) {
      const groups = []
      const byHeight = new Map()
      for (const item of row.items) {
        const key = Math.round(item.height)
        if (!byHeight.has(key)) byHeight.set(key, [])
        byHeight.get(key).push(item)
      }

      for (const bucket of byHeight.values()) {
        const bucketGroups = []
        for (const item of bucket) {
          const rect = rectOf(item)
          const group = bucketGroups.find(g => g.every(m => !isOverlapping(rect, rectOf(m))))
          if (group) group.push(item)
          else bucketGroups.push([item])
        }
        groups.push(...bucketGroups)
      }

      // 组间按最靠左位置排序，保证排布顺序稳定
      groups.sort((a, b) => Math.min(...a.map(m => m.left)) - Math.min(...b.map(m => m.left)))

      for (const group of groups) {
        // 整组统一下移：位移量取组内成员的最大需求，保证并排元素保持对齐。
        // 只有「水平方向有交集」的已放置元素才可能与该成员碰撞，据此算所需下移量。
        let shift = 0
        for (const member of group) {
          const rect = rectOf(member)
          for (const p of placed) {
            const horizontallyOverlapping = p.l < rect.r - 1 && rect.l < p.r - 1
            if (!horizontallyOverlapping) continue
            shift = Math.max(shift, p.b - rect.t + CHILD_GAP)
          }
        }

        if (shift > 0) {
          for (const member of group) {
            member.top = Math.round(member.top + shift)
            movedChildren++
          }
        }
        for (const member of group) placed.push(rectOf(member))
      }
    }

    // 子元素超出容器底部时，撑高容器（保留原有内边距观感）
    const maxChildBottom = Math.max(...placed.map(p => p.b))
    const containerBottom = container.top + container.height
    if (maxChildBottom + 8 > containerBottom) {
      container.height = Math.round(maxChildBottom + 8 - container.top)
      grownContainers++
    }
  }

  // ============ 第二步：修复顶层区块之间的重叠 ============
  // 顶层区块 = 没有父容器的组件；移动区块时，其所有后代一起移动
  const roots = components.filter(c => !parentOf.get(c))

  /** 收集某个区块的全部后代 */
  const descendantsOf = (root) => {
    const out = []
    const stack = [root]
    while (stack.length) {
      const cur = stack.pop()
      for (const child of childrenOf.get(cur) || []) {
        out.push(child)
        stack.push(child)
      }
    }
    return out
  }

  /** 区块的包围盒（含所有后代） */
  const blockBox = (root, descendants) => {
    const rects = [rectOf(root), ...descendants.map(rectOf)]
    return {
      l: Math.min(...rects.map(r => r.l)),
      t: Math.min(...rects.map(r => r.t)),
      r: Math.max(...rects.map(r => r.r)),
      b: Math.max(...rects.map(r => r.b))
    }
  }

  // 排序依据：先按 top，再按 AI 的书写顺序（数组下标）。
  // 同一 top 时不用 left 排序，否则像"整宽横幅(left=0)"会被排到后面的卡片之前，破坏阅读顺序。
  const sortedRoots = [...roots].sort((a, b) => (a.top - b.top) || (order.get(a) - order.get(b)))

  let movedBlocks = 0
  const placedBoxes = []
  const blockTops = new Map() // 记录区块修复前的 top，便于判断是否被移动

  for (const root of sortedRoots) {
    const descendants = descendantsOf(root)
    blockTops.set(root, root.top)
    let box = blockBox(root, descendants)

    // 与已放置区块相交时整体下移，直到不再相交
    let guard = 0
    let shift = 0
    while (guard++ < 200) {
      let needed = 0
      const testBox = { ...box, t: box.t + shift, b: box.b + shift }
      for (const placed of placedBoxes) {
        if (isOverlapping(testBox, placed)) {
          needed = Math.max(needed, placed.b - box.t + BLOCK_GAP)
        }
      }
      if (needed === 0) break
      shift = Math.max(shift, needed)
    }

    if (shift > 0) {
      root.top = Math.round(root.top + shift)
      for (const d of descendants) d.top = Math.round(d.top + shift)
      box = blockBox(root, descendants)
      movedBlocks++
    }

    placedBoxes.push(box)
  }

  // ============ 第三步：按内容补足页面高度 ============
  const maxBottom = Math.max(...placedBoxes.map(b => b.b), 0)
  const originalHeight = page.height || 0
  let heightExtended = 0
  if (maxBottom + 40 > originalHeight) {
    page.height = Math.round(maxBottom + 40)
    heightExtended = page.height - originalHeight
  }

  return { movedBlocks, movedChildren, grownContainers, heightExtended }
}

/**
 * 统计页面中互相重叠的组件对数（用于修复前后对比/提示）
 * @param {Object} page
 * @returns {number}
 */
export function countOverlaps(page) {
  const components = (page?.components || []).filter(Boolean)
  const containers = components.filter(c => c.type === 'container')
  let count = 0
  for (let i = 0; i < components.length; i++) {
    for (let j = i + 1; j < components.length; j++) {
      const a = components[i]
      const b = components[j]
      if (!isOverlapping(rectOf(a), rectOf(b), 2)) continue
      // 父子关系（容器与其内部元素）属于有意叠加，不计入重叠
      const aRect = rectOf(a)
      const bRect = rectOf(b)
      const aIsParent = a.type === 'container' && isContaining(aRect, bRect)
      const bIsParent = b.type === 'container' && isContaining(bRect, aRect)
      if (aIsParent || bIsParent) continue
      count++
    }
  }
  return count
}

export default { repairLayout, countOverlaps }
