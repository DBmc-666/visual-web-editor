/**
 * @file 组件库与 Schema 一致性测试
 * @description 保证「左侧组件分类 / 默认配置 / Schema 白名单 / createComponent」四者始终一致，
 * 新增组件时忘记同步某处会被立刻发现。
 */

import { importSrc } from './helpers.mjs'

export const name = '组件库与 Schema 一致性'

export default async function run(t) {
  const editorMod = await importSrc('stores/editor.js')
  const schema = await importSrc('utils/componentSchema.js')

  const { COMPONENT_DEFAULTS, COMPONENT_CATEGORIES, COMPONENT_TYPES, createComponent } = editorMod

  // ==================== 分类 → 默认配置 ====================
  t.group('分类与默认配置')

  const categorized = Object.values(COMPONENT_CATEGORIES).flatMap(c => c.components)
  t.check('分类里至少包含 21 个组件', categorized.length >= 21, String(categorized.length))
  t.check('存在「内容组件」分类',
    !!COMPONENT_CATEGORIES.content && COMPONENT_CATEGORIES.content.components.length === 6,
    JSON.stringify(COMPONENT_CATEGORIES.content?.components))

  categorized.forEach(type => {
    t.check(`默认配置存在：${type}`, !!COMPONENT_DEFAULTS[type])
  })

  Object.entries(COMPONENT_DEFAULTS).forEach(([type, def]) => {
    t.check(`默认配置字段完整：${type}`,
      typeof def.name === 'string' && def.name.length > 0 &&
      typeof def.width === 'number' && def.width > 0 &&
      typeof def.height === 'number' && def.height > 0 &&
      typeof def.style === 'object' && typeof def.props === 'object')
  })

  // ==================== 默认配置 → Schema 白名单 ====================
  t.group('Schema 一致性')

  Object.keys(COMPONENT_DEFAULTS).forEach(type => {
    t.check(`类型在白名单中：${type}`, schema.KNOWN_COMPONENT_TYPES.includes(type))
    // 有默认 props 的组件必须有非空白名单；本身没有 props 的（如 container）允许为空对象
    const defaultPropKeys = Object.keys(COMPONENT_DEFAULTS[type].props || {})
    const schemaPropKeys = Object.keys(schema.PROP_FIELDS[type] || {})
    t.check(`props 白名单存在：${type}`,
      !!schema.PROP_FIELDS[type] && (defaultPropKeys.length === 0 || schemaPropKeys.length > 0),
      `默认 props ${defaultPropKeys.length} 个 / 白名单 ${schemaPropKeys} 个`)
  })

  t.check('白名单没有多余类型',
    schema.KNOWN_COMPONENT_TYPES.every(type => !!COMPONENT_DEFAULTS[type]),
    schema.KNOWN_COMPONENT_TYPES.filter(type => !COMPONENT_DEFAULTS[type]).join(','))

  // 默认 props 的键必须在白名单内（否则 AI 契约与实际能力脱节）
  Object.entries(COMPONENT_DEFAULTS).forEach(([type, def]) => {
    const allowed = schema.PROP_FIELDS[type] || {}
    const extraKeys = Object.keys(def.props || {}).filter(key => !allowed[key])
    t.check(`默认 props 都在白名单内：${type}`, extraKeys.length === 0, extraKeys.join(','))
  })

  // ==================== createComponent ====================
  t.group('createComponent')

  Object.keys(COMPONENT_DEFAULTS).forEach(type => {
    const comp = createComponent(type)
    t.check(`createComponent 可用：${type}`,
      !!comp && comp.type === type && comp.visible === true && comp.locked === false &&
      typeof comp.id === 'string' && comp.id.length > 0)
  })
  t.check('未知类型返回 null', createComponent('不存在的类型') === null)

  // ==================== Schema 清洗 ====================
  t.group('Schema 清洗')

  Object.keys(COMPONENT_DEFAULTS).forEach(type => {
    const cleaned = schema.sanitizeComponent({
      type, left: 10, top: 20, width: 100, height: 50,
      props: { 未知字段: 1 },
      style: { 未知样式: 'x' }
    })
    t.check(`清洗保留组件并过滤未知字段：${type}`,
      !!cleaned && cleaned.type === type && !('未知字段' in cleaned.props) && !('未知样式' in cleaned.style))
  })

  const noId = schema.sanitizeComponent({ type: 'text', left: 0, top: 0, width: 100, height: 40 })
  t.check('缺失 id 时自动生成', typeof noId.id === 'string' && noId.id.length > 0)

  const clamped = schema.sanitizeComponent({ type: 'text', left: 99999, top: -99999, width: 1, height: 1 })
  t.check('越界坐标被裁剪', clamped.left <= 3840 && clamped.top >= -5000 && clamped.width >= 20)

  // ==================== 6 个内容组件的关键默认值 ====================
  t.group('内容组件默认值')

  t.equal('分隔线默认实线', COMPONENT_DEFAULTS.divider.props.lineStyle, 'solid')
  t.equal('图标默认 emoji', COMPONENT_DEFAULTS.icon.props.icon, '⭐')
  t.equal('列表默认无序', COMPONENT_DEFAULTS.list.props.listType, 'unordered')
  t.check('表格默认有表头与数据行',
    COMPONENT_DEFAULTS.table.props.headers.includes('|') && COMPONENT_DEFAULTS.table.props.rows.includes('\n'))
  t.equal('视频默认直链模式', COMPONENT_DEFAULTS.video.props.videoType, 'file')
  t.check('视频默认静音（浏览器自动播放要求）', COMPONENT_DEFAULTS.video.props.muted === true)
  t.check('轮播默认自动播放与箭头指示点',
    COMPONENT_DEFAULTS.carousel.props.autoplay === true &&
    COMPONENT_DEFAULTS.carousel.props.showArrows === true &&
    COMPONENT_DEFAULTS.carousel.props.showIndicators === true)
  t.check('轮播默认图片格式含说明与链接位',
    COMPONENT_DEFAULTS.carousel.props.images.split('\n')[0].split('|').length >= 2)

  // ==================== Schema 提示文本 ====================
  t.group('Schema 提示')

  const promptText = schema.getSchemaForPrompt()
  t.check('提示包含所有组件类型',
    schema.KNOWN_COMPONENT_TYPES.every(type => promptText.includes(type)),
    schema.KNOWN_COMPONENT_TYPES.filter(type => !promptText.includes(type)).join(','))
  t.check('提示包含 style 白名单', promptText.includes('style 白名单'))
  t.check('提示说明页面跳转链接写法', promptText.includes('#page:'))

  // ==================== 页面契约 ====================
  t.group('页面契约')

  const contract = schema.getPageContract({
    name: '契约页', width: 1200, height: 800, backgroundColor: '#fff',
    components: [
      { id: 'x1', type: 'text', name: '文本', left: 1, top: 2, width: 3, height: 4, zIndex: 5, style: {}, props: { content: 'a' } },
      { id: 'x2', type: '未知类型', left: 0, top: 0, width: 10, height: 10 }
    ]
  })
  t.equal('契约包含页面基本信息', contract.name, '契约页')
  t.equal('契约包含组件', contract.components.length, 2)
  t.check('契约字段齐全',
    ['id', 'type', 'name', 'left', 'top', 'width', 'height', 'zIndex', 'visible', 'locked', 'style', 'props']
      .every(key => key in contract.components[0]),
    Object.keys(contract.components[0]).join(','))
  t.check('契约是纯数据（可 JSON 序列化）', JSON.stringify(contract).length > 0)

  // ==================== SEO 字段贯通 ====================
  t.group('SEO 字段')

  const seoKeys = ['seoTitle', 'seoDescription', 'seoKeywords', 'seoFavicon', 'seoOgImage', 'seoLang']
  t.check('契约包含 SEO 字段', seoKeys.every(key => key in contract), Object.keys(contract).join(','))

  const seoSanitized = schema.sanitizePageData({
    name: 'A', width: 1200, height: 800,
    seoTitle: '标题', seoDescription: '描述', seoKeywords: 'a,b', seoLang: 'en',
    components: [{ id: 'x', type: 'text', left: 0, top: 0, width: 100, height: 40, props: {} }]
  })
  t.check('Schema 清洗保留 SEO 字段',
    seoSanitized.success &&
    seoSanitized.page.seoTitle === '标题' &&
    seoSanitized.page.seoDescription === '描述' &&
    seoSanitized.page.seoLang === 'en',
    JSON.stringify({ t: seoSanitized.page?.seoTitle, l: seoSanitized.page?.seoLang }))
  t.equal('未提供 seoLang 时默认 zh-CN',
    schema.sanitizePageData({ name: 'A', components: [{ id: 'x', type: 'text', left: 0, top: 0, width: 100, height: 40, props: {} }] }).page.seoLang,
    'zh-CN')

  // ==================== 预设页面模板 ====================
  t.group('预设页面模板')

  const { PRESET_PAGES } = await importSrc('utils/presetPages.js')
  t.check('预设模板是数组且不为空', Array.isArray(PRESET_PAGES) && PRESET_PAGES.length >= 5, String(PRESET_PAGES?.length))

  PRESET_PAGES.forEach((preset, index) => {
    const label = preset?.name || `第 ${index + 1} 个`
    t.check(`预设结构完整：${label}`,
      typeof preset.name === 'string' && preset.name.length > 0 &&
      !!preset.config &&
      typeof preset.config.width === 'number' &&
      typeof preset.config.height === 'number' &&
      Array.isArray(preset.config.components) &&
      preset.config.components.length > 0,
      JSON.stringify({ w: preset.config?.width, h: preset.config?.height, n: preset.config?.components?.length }))
  })

  // 预设里不能出现未知组件类型（否则应用后会被静默丢弃）
  const unknownTypes = []
  PRESET_PAGES.forEach(preset => {
    ;(preset.config?.components || []).forEach(comp => {
      if (!schema.KNOWN_COMPONENT_TYPES.includes(comp.type)) {
        unknownTypes.push(`${preset.name}: ${comp.type}`)
      }
    })
  })
  t.check('预设中所有组件类型都是已知类型', unknownTypes.length === 0, unknownTypes.join(', '))

  // 预设组件不能越界
  const outOfBounds = []
  PRESET_PAGES.forEach(preset => {
    const { width, height } = preset.config
    ;(preset.config.components || []).forEach(comp => {
      if (comp.left < 0 || comp.top < 0 || comp.left + comp.width > width || comp.top + comp.height > height) {
        outOfBounds.push(`${preset.name}: ${comp.type}(${comp.left},${comp.top} ${comp.width}x${comp.height})`)
      }
    })
  })
  t.check('预设中组件都在页面范围内', outOfBounds.length === 0, outOfBounds.slice(0, 5).join(', '))

  // 预设里使用的 props 键应在白名单内（避免写了不生效的字段）
  const badProps = []
  PRESET_PAGES.forEach(preset => {
    ;(preset.config?.components || []).forEach(comp => {
      const allowed = schema.PROP_FIELDS[comp.type] || {}
      Object.keys(comp.props || {}).forEach(key => {
        if (!allowed[key]) badProps.push(`${preset.name}: ${comp.type}.${key}`)
      })
    })
  })
  t.check('预设中 props 键都在白名单内', badProps.length === 0, badProps.slice(0, 6).join(', '))

  // 新增的数据看板模板应使用展示组件
  const dashboard = PRESET_PAGES.find(p => p.name === '数据看板页')
  t.check('存在「数据看板页」模板', !!dashboard)
  if (dashboard) {
    const types = dashboard.config.components.map(c => c.type)
    t.check('看板模板用到统计卡片/进度条/折叠面板/徽章',
      ['stat', 'progress', 'accordion', 'badge'].every(type => types.includes(type)),
      [...new Set(types)].join(','))
  }

  // 应用到画布
  const ed = editorMod.useEditor()
  const canvas = ed.addCanvas('预设测试')
  ed.switchCanvas(canvas.id)
  if (dashboard) {
    ed.applyPageTemplate(dashboard.config)
    t.equal('应用预设后组件数一致', ed.page.value.components.length, dashboard.config.components.length)
    t.equal('应用预设后页面尺寸一致', ed.page.value.width, dashboard.config.width)
    t.check('应用预设后组件都有 id', ed.page.value.components.every(c => typeof c.id === 'string' && c.id.length > 0))
    t.check('应用预设后可撤销', ed.canUndo() === true)
  }
}
