/**
 * @file 编辑器 store 测试：画布/页面管理、页面隔离、草稿、多页应用、撤销重做、对齐分布、移动与锁定
 */

import { importSrc, makeComponent, makePage } from './helpers.mjs'

export const name = '编辑器 store（画布 / 页面 / 草稿 / 操作）'

export default async function run(t) {
  const editorMod = await importSrc('stores/editor.js')
  const layerTree = await importSrc('utils/layerTree.js')
  const ed = editorMod.useEditor()
  const { editorState } = editorMod

  // 用一个全新画布做隔离，避免与其他测试文件互相影响
  const canvas = ed.addCanvas('测试画布')

  // ==================== 画布 / 页面基础 ====================
  t.group('画布与页面')

  t.check('新建画布后自动切换过去', ed.activeCanvasId.value === canvas.id)
  t.equal('新画布只有 1 个页面', ed.pages.value.length, 1)
  t.equal('新画布是空白的', ed.page.value.components.length, 0)

  const page2 = ed.addPage('第二页')
  t.check('新建页面成功并切换', ed.pages.value.length === 2 && ed.page.value.id === page2.id)

  // 页面隔离
  ed.addComponent('text')
  t.equal('在第二页加组件', ed.page.value.components.length, 1)
  const firstPageId = ed.pages.value[0].id
  ed.switchPage(firstPageId)
  t.equal('切回第一页组件数为 0', ed.page.value.components.length, 0)
  t.check('页面隔离正确（互不影响）',
    ed.pages.value[0].components.length === 0 && ed.pages.value[1].components.length === 1)

  // 页面链接
  t.equal('getPageLink 格式正确', ed.getPageLink(page2.id), `#page:${page2.id}`)
  const allPages = ed.getAllPages()
  t.check('getAllPages 覆盖所有画布', allPages.length >= 2 && allPages.some(p => p.pageId === page2.id))

  // 复制页面
  const dup = ed.duplicatePage(page2.id)
  t.check('复制页面成功', !!dup && ed.pages.value.length === 3)
  t.check('复制页面 id 不同', dup.id !== page2.id)
  const sourceCompId = ed.pages.value.find(p => p.id === page2.id).components[0].id
  t.check('复制页面的组件 id 已重新生成', dup.components[0].id !== sourceCompId)

  // 删除保护
  ed.removePage(dup.id)
  t.equal('删除页面成功', ed.pages.value.length, 2)

  // ==================== 多页站点应用 ====================
  t.group('多页站点应用（applySitePages）')

  const before = ed.pages.value.length
  const applied = ed.applySitePages([
    makePage({
      id: 'ai-1', name: '首页', slug: 'index', height: 2000,
      components: [
        makeComponent('navMenu', { props: { menuItems: '首页|#page:首页\n关于|#page:关于我们' } }),
        makeComponent('button', { props: { content: '去关于', actionType: 'link', href: '#page:关于我们' } })
      ]
    }),
    makePage({
      id: 'ai-2', name: '关于我们', slug: 'about', height: 1500,
      components: [
        makeComponent('list', { props: { items: '回首页|#page:首页' } }),
        makeComponent('carousel', { props: { images: 'https://i/a.jpg|图|#page:首页|' } })
      ]
    })
  ], { replace: false })

  t.check('应用返回统计', !!applied && applied.created === 2 && applied.replaced === false, JSON.stringify(applied))
  t.equal('默认追加到画布', ed.pages.value.length, before + 2)
  t.check('已切换到第一个新页面', ed.activePageId.value === applied.pageIds[0])

  const newHome = ed.pages.value.find(p => p.id === applied.pageIds[0])
  const newAbout = ed.pages.value.find(p => p.id === applied.pageIds[1])
  t.equal('页面名保留', newHome.name, '首页')
  t.equal('slug 保留', newAbout.slug, 'about')
  t.check('AI 传来的页面 id 未被沿用', newHome.id !== 'ai-1' && newAbout.id !== 'ai-2')

  // 页面链接被解析为真实 id
  const nav = newHome.components.find(c => c.type === 'navMenu')
  t.check('导航里的页面名链接解析为 id',
    nav.props.menuItems.includes(`#page:${newAbout.id}`) && !nav.props.menuItems.includes('#page:关于我们'),
    nav.props.menuItems)
  t.equal('按钮 href 解析为 id', newHome.components.find(c => c.type === 'button').props.href, `#page:${newAbout.id}`)
  t.includes('列表项链接解析为 id', newAbout.components.find(c => c.type === 'list').props.items, `#page:${newHome.id}`)
  t.includes('轮播链接解析为 id', newAbout.components.find(c => c.type === 'carousel').props.images, `#page:${newHome.id}`)
  t.check('linkStats 统计正确（导航2 + 按钮1 + 列表1 + 轮播1 = 5）',
    applied.linkStats.total === 5 && applied.linkStats.unresolved === 0, JSON.stringify(applied.linkStats))

  // 替换模式
  const replaced = ed.applySitePages([makePage({ name: '唯一页面', components: [makeComponent('text')] })], { replace: true })
  t.check('替换模式生效', replaced.replaced === true && ed.pages.value.length === 1 && ed.pages.value[0].name === '唯一页面')

  // ==================== 草稿持久化 ====================
  t.group('草稿持久化')

  t.check('保存草稿成功', ed.savePageDraft() === true)
  const raw = JSON.parse(globalThis.localStorage.getItem(editorMod.DRAFT_STORAGE_KEY))
  t.check('草稿为项目级结构（v2）', raw.version === '2.0' && !!raw.project && !raw.page)
  t.check('草稿包含激活位置', typeof raw.activeCanvasId === 'string' && typeof raw.activePageId === 'string')

  const loaded = ed.loadPageDraft()
  t.check('恢复草稿成功', loaded.found === true && loaded.canvasCount >= 1, JSON.stringify(loaded))

  // 旧版单页草稿迁移
  globalThis.localStorage.setItem(editorMod.DRAFT_STORAGE_KEY, JSON.stringify({
    version: '1.0',
    savedAt: Date.now(),
    page: {
      id: 'old-page', name: '旧页面', width: 900, height: 700,
      components: [makeComponent('text', { props: { content: '旧内容' } })]
    }
  }))
  const migrated = ed.loadPageDraft()
  t.check('旧草稿自动迁移', migrated.found === true && migrated.migrated === true, JSON.stringify(migrated))
  t.check('迁移为 1 画布 1 页面', ed.canvases.value.length === 1 && ed.pages.value.length === 1)
  t.check('迁移保留页面内容', ed.page.value.components.length === 1 && ed.page.value.name === '旧页面')

  // ==================== 撤销 / 重做 ====================
  t.group('撤销与重做')

  ed.clearPageDraft()
  const undoCanvas = ed.addCanvas('撤销测试')
  ed.switchCanvas(undoCanvas.id)
  ed.addComponent('text')
  const countAfterAdd = ed.page.value.components.length
  ed.undo()
  t.check('撤销能回退新增组件', ed.page.value.components.length === countAfterAdd - 1,
    `${countAfterAdd} → ${ed.page.value.components.length}`)
  ed.redo()
  t.equal('重做能恢复', ed.page.value.components.length, countAfterAdd)

  // ==================== 对齐 / 分布 ====================
  t.group('对齐与等距分布')

  ed.page.value.components = [
    makeComponent('text', { id: 'c1', left: 100, top: 100, width: 100, height: 40 }),
    makeComponent('text', { id: 'c2', left: 300, top: 200, width: 100, height: 40 }),
    makeComponent('text', { id: 'c3', left: 700, top: 300, width: 100, height: 40 })
  ]
  ed.selectAll()
  t.equal('全选 3 个组件', ed.selectedIds.value.length, 3)

  ed.alignComponents('left')
  t.check('左对齐生效', ed.page.value.components.every(c => c.left === 100),
    JSON.stringify(ed.page.value.components.map(c => c.left)))

  ed.page.value.components.forEach((c, i) => { c.left = 100 + i * 200; c.width = 100 })
  ed.distributeComponents('h')
  const lefts = ed.page.value.components.map(c => c.left).sort((a, b) => a - b)
  t.check('水平等距分布（首尾不动）', lefts[0] === 100 && lefts[2] === 500, JSON.stringify(lefts))
  t.check('中间项位于中点', lefts[1] === 300, JSON.stringify(lefts))

  // 锁定组件不参与批量操作
  ed.setComponentLocked('c2', true)
  ed.page.value.components.forEach(c => { c.left = 100 })
  ed.alignComponents('left')
  ed.page.value.components.forEach(c => { c.left = 100 + Math.random() })
  ed.alignComponents('left')
  const lockedComp = ed.page.value.components.find(c => c.id === 'c2')
  t.check('锁定组件不参与对齐', lockedComp.left !== 100, String(lockedComp.left))

  // ==================== 移动与锁定语义 ====================
  t.group('移动与锁定')

  const moveCanvas = ed.addCanvas('移动测试')
  ed.switchCanvas(moveCanvas.id)
  ed.page.value.components = [
    makeComponent('container', { id: 'box', left: 100, top: 100, width: 400, height: 300, zIndex: 1 }),
    makeComponent('text', { id: 'inner1', left: 120, top: 120, width: 100, height: 40 }),
    makeComponent('text', { id: 'inner2', left: 120, top: 200, width: 100, height: 40 })
  ]

  t.equal('容器能识别内部子组件', ed.getChildrenInsideComponent('box').length, 2)

  ed.selectComponentWithChildren('box')
  t.equal('组选中包含容器 + 2 个子组件', ed.selectedIds.value.length, 3)

  ed.moveComponents(['box', 'inner1', 'inner2'], 50, 30, {
    box: { left: 100, top: 100 },
    inner1: { left: 120, top: 120 },
    inner2: { left: 120, top: 200 }
  })
  t.check('整体移动生效',
    ed.page.value.components.find(c => c.id === 'box').left === 150 &&
    ed.page.value.components.find(c => c.id === 'inner1').top === 150)

  // 锁定子组件不应被容器带动
  ed.setComponentLocked('inner1', true)
  ed.page.value.components = [
    makeComponent('container', { id: 'box', left: 100, top: 100, width: 400, height: 300, zIndex: 1 }),
    makeComponent('text', { id: 'inner1', left: 120, top: 120, width: 100, height: 40, locked: true }),
    makeComponent('text', { id: 'inner2', left: 120, top: 200, width: 100, height: 40 })
  ]
  t.equal('锁定的子组件不进入组选中', ed.getChildrenInsideComponent('box').length, 1)
  ed.moveComponents(['box', 'inner2'], 100, 100, { box: { left: 100, top: 100 }, inner2: { left: 120, top: 200 } })
  t.check('锁定子组件不被带动',
    ed.page.value.components.find(c => c.id === 'inner1').left === 120 &&
    ed.page.value.components.find(c => c.id === 'inner2').left === 220)

  // ==================== 显隐与图层树 ====================
  t.group('显隐与图层树')

  // 复位为干净的几何关系（上面的移动会把子组件移出容器）
  ed.page.value.components = [
    makeComponent('container', { id: 'box', left: 100, top: 100, width: 400, height: 300, zIndex: 1 }),
    makeComponent('text', { id: 'inner1', left: 120, top: 120, width: 100, height: 40 }),
    makeComponent('text', { id: 'inner2', left: 120, top: 200, width: 100, height: 40 })
  ]

  ed.setComponentVisible('inner2', false)
  t.check('隐藏组件 visible=false', ed.page.value.components.find(c => c.id === 'inner2').visible === false)
  ed.setComponentVisible('inner2', true)

  const tree = layerTree.buildLayerTree(ed.page.value.components, { sortBy: 'position' })
  t.check('图层树返回 roots', Array.isArray(tree.roots) && tree.roots.length >= 1)
  const boxNode = tree.roots.find(n => n.comp.id === 'box')
  t.check('容器成为父节点并包含子层', !!boxNode && boxNode.children.length === 2, String(boxNode?.children?.length))
  t.check('parentIds 记录了父子关系', tree.parentIds.get('inner1') === 'box' && tree.parentIds.get('inner2') === 'box',
    JSON.stringify([...tree.parentIds.entries()]))

  // ==================== 结构性操作可撤销 ====================
  t.group('结构性操作撤销（项目级快照）')

  const structCanvas = ed.addCanvas('结构撤销测试')
  ed.switchCanvas(structCanvas.id)
  ed.clearHistory()

  // 新建页面 → 撤销 → 重做
  const beforePages = ed.pages.value.length
  const addedPage = ed.addPage('新增页')
  t.equal('新建页面后页面数 +1', ed.pages.value.length, beforePages + 1)
  ed.undo()
  t.equal('撤销新建页面', ed.pages.value.length, beforePages)
  ed.redo()
  t.equal('重做恢复新建页面', ed.pages.value.length, beforePages + 1)

  // 删除页面 → 撤销（内容应完整恢复）
  ed.clearHistory()
  const pageToDelete = ed.pages.value.find(p => p.id === addedPage.id)
  ed.switchPage(pageToDelete.id)
  ed.addComponent('text')
  const deletedPageComponentCount = ed.page.value.components.length
  t.check('被删页面有内容', deletedPageComponentCount > 0, String(deletedPageComponentCount))

  ed.removePage(pageToDelete.id)
  t.check('删除页面生效', !ed.pages.value.some(p => p.id === pageToDelete.id))
  ed.undo()
  const restored = ed.pages.value.find(p => p.id === pageToDelete.id)
  t.check('撤销删除页面（页面回来了）', !!restored)
  t.equal('撤销后页面内容完整恢复', restored?.components.length, deletedPageComponentCount)

  // 应用整站 → 撤销
  ed.clearHistory()
  const pagesBeforeSite = ed.pages.value.length
  ed.applySitePages([
    makePage({ name: 'AI页1', components: [makeComponent('text')] }),
    makePage({ name: 'AI页2', components: [makeComponent('text')] })
  ], { replace: false })
  t.equal('应用整站后页面数 +2', ed.pages.value.length, pagesBeforeSite + 2)
  ed.undo()
  t.equal('撤销应用整站', ed.pages.value.length, pagesBeforeSite)
  t.check('撤销后 AI 页面已移除', !ed.pages.value.some(p => p.name === 'AI页1'))

  // 替换模式 → 撤销（原页面应回来）
  ed.clearHistory()
  const originalNames = ed.pages.value.map(p => p.name)
  ed.applySitePages([makePage({ name: '替换页', components: [makeComponent('text')] })], { replace: true })
  t.equal('替换后只剩 1 页', ed.pages.value.length, 1)
  ed.undo()
  t.equal('撤销替换恢复原页面数', ed.pages.value.length, originalNames.length)
  t.check('撤销替换恢复原页面名', ed.pages.value.map(p => p.name).join(',') === originalNames.join(','),
    ed.pages.value.map(p => p.name).join(','))

  // 删除画布 → 撤销
  ed.clearHistory()
  const canvasCountBefore = ed.canvases.value.length
  ed.removeCanvas(structCanvas.id)
  t.equal('删除画布生效', ed.canvases.value.length, canvasCountBefore - 1)
  ed.undo()
  t.equal('撤销删除画布', ed.canvases.value.length, canvasCountBefore)

  // 跨页面编辑的撤销：应自动切回被编辑的页面
  ed.clearHistory()
  const crossCanvas = ed.addCanvas('跨页撤销')
  ed.switchCanvas(crossCanvas.id)
  const pageA = ed.pages.value[0]
  const pageB = ed.addPage('页面B')
  ed.clearHistory()

  ed.switchPage(pageA.id)
  ed.addComponent('text')
  const pageACompCount = ed.page.value.components.length

  ed.switchPage(pageB.id)
  ed.addComponent('button')
  const pageBCompCount = ed.page.value.components.length

  ed.undo() // 撤销 B 上的操作
  t.check('撤销后停留在 B 且 B 已回退',
    ed.activePageId.value === pageB.id && ed.page.value.components.length === pageBCompCount - 1,
    `page=${ed.page.value.name} count=${ed.page.value.components.length}`)

  ed.undo() // 撤销 A 上的操作（应自动切回 A）
  t.check('撤销跨页面操作时自动切回目标页面', ed.activePageId.value === pageA.id,
    `当前页=${ed.page.value.name}`)
  t.equal('A 页面的操作已回退', ed.page.value.components.length, pageACompCount - 1)

  // ==================== 历史版本快照 ====================
  t.group('历史版本快照')

  const versionCanvas = ed.addCanvas('版本测试')
  ed.switchCanvas(versionCanvas.id)
  ed.page.value.components = [makeComponent('text', { props: { content: '版本1内容' } })]
  ed.clearVersionSnapshots()

  const saved = ed.saveVersionSnapshot('我的第一个版本')
  t.check('保存版本成功', saved.ok === true && !!saved.item, JSON.stringify(saved))
  t.equal('版本名保留', saved.item.name, '我的第一个版本')

  let versions = ed.listVersionSnapshots()
  t.equal('列表包含 1 个版本', versions.length, 1)
  t.check('列表带规模统计（快照含整个项目）',
    versions[0].stats.canvasCount >= 1 && versions[0].stats.pageCount >= 1 && versions[0].stats.componentCount >= 1,
    JSON.stringify(versions[0].stats))

  // 改动项目后再恢复
  ed.page.value.components = [
    makeComponent('text', { props: { content: '版本1内容' } }),
    makeComponent('button', { props: { content: '新增的按钮' } })
  ]
  ed.renamePage(ed.page.value.id, '改过的页面名')
  t.equal('改动后组件数 2', ed.page.value.components.length, 2)

  const restoreResult = ed.restoreVersionSnapshot(saved.item.id)
  t.check('恢复版本成功', restoreResult.ok === true, JSON.stringify(restoreResult))
  t.equal('恢复后组件数回到 1', ed.page.value.components.length, 1)
  t.equal('恢复后页面名回到保存时', ed.page.value.name, '首页')
  t.check('恢复后可 Ctrl+Z 退回', ed.canUndo() === true)

  ed.undo()
  t.equal('撤销恢复后组件数又变回 2', ed.page.value.components.length, 2)

  // 重命名 / 删除
  t.check('重命名版本成功', ed.renameVersionSnapshot(saved.item.id, '改名后的版本') === true)
  t.equal('重命名生效', ed.listVersionSnapshots()[0].name, '改名后的版本')

  t.check('删除版本成功', ed.removeVersionSnapshot(saved.item.id) === true)
  t.equal('删除后列表为空', ed.listVersionSnapshots().length, 0)

  // 数量上限：最多保留 20 个
  ed.clearVersionSnapshots()
  for (let i = 0; i < 23; i++) {
    ed.saveVersionSnapshot(`版本${i + 1}`)
  }
  const capped = ed.listVersionSnapshots()
  t.equal('超出上限后只保留 20 个', capped.length, 20)
  t.check('保留的是最新的（丢弃最旧的）',
    capped.some(v => v.name === '版本23') && !capped.some(v => v.name === '版本1'),
    capped.map(v => v.name).slice(0, 3).join(','))

  // 单快照体积上限
  ed.clearVersionSnapshots()
  const hugeProjectCanvas = ed.addCanvas('大体积测试')
  ed.switchCanvas(hugeProjectCanvas.id)
  ed.page.value.components = [makeComponent('text', { props: { content: 'x'.repeat(2 * 1024 * 1024 + 1024) } })]
  const tooBig = ed.saveVersionSnapshot('超大版本')
  t.check('超出单快照体积上限时拒绝保存',
    tooBig.ok === false && (tooBig.message || '').includes('上限'),
    JSON.stringify(tooBig))
  ed.page.value.components = []
  ed.clearVersionSnapshots()

  // ==================== 页面尺寸与重置 ====================
  t.group('页面属性')

  ed.updatePage({ name: '改名了', width: 1400 })
  t.check('updatePage 生效', ed.page.value.name === '改名了' && ed.page.value.width === 1400)

  const keepId = ed.page.value.id
  ed.resetPage()
  t.check('重置页面保留 id（不破坏页面跳转）', ed.page.value.id === keepId)
  t.equal('重置后组件清空', ed.page.value.components.length, 0)
}
