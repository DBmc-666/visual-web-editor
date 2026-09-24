/**
 * @file 组件 Schema 契约模块
 * @description 编辑器页面 JSON 格式的单一数据契约。
 * 作用：
 * 1. 作为 AI（Prompt 构建器 / 响应校验器）了解每个组件类型合法字段的依据；
 * 2. 校验并清洗 AI 输出或外部导入的组件数据（sanitizeComponent）；
 * 3. 生成 AI 提示词中使用的 Schema 描述（getSchemaForPrompt）。
 * 与 src/stores/editor.js 的 COMPONENT_DEFAULTS / COMPONENT_TYPES 保持一致。
 */

import { generateId } from './idGenerator.js'

// 所有已知组件类型（编辑器渲染管线支持的类型白名单）
export const KNOWN_COMPONENT_TYPES = [
  // 基础组件
  'text', 'image', 'button', 'container', 'link', 'datetime',
  // 预设表单
  'loginForm', 'registerForm', 'contactForm', 'searchForm', 'commentForm', 'customForm',
  // 导航组件
  'navMenu', 'breadcrumb', 'tabs',
  // 内容组件（扩展）
  'divider', 'icon', 'list', 'table', 'video', 'carousel',
  // 展示组件（扩展）
  'progress', 'accordion', 'badge', 'stat'
]

/**
 * 通用样式字段白名单
 * 渲染管线（CanvasItem.vue / htmlGenerator.js）实际读取的 style 键
 * @type {Object<string, {type: string, desc: string, enum?: string[]}>}
 */
export const STYLE_FIELDS = {
  backgroundColor: { type: 'string', desc: '背景颜色，如 #ffffff / transparent' },
  backgroundType: { type: 'string', desc: '背景类型', enum: ['solid', 'gradient-linear', 'gradient-radial'] },
  backgroundGradientStart: { type: 'string', desc: '渐变起始颜色' },
  backgroundGradientEnd: { type: 'string', desc: '渐变结束颜色' },
  backgroundGradientAngle: { type: 'number', desc: '渐变角度（度）' },
  color: { type: 'string', desc: '文字颜色' },
  fontSize: { type: 'number', desc: '字号（px）' },
  fontWeight: { type: 'string', desc: '字重，如 bold / normal / 500' },
  textAlign: { type: 'string', desc: '文字对齐', enum: ['left', 'center', 'right', 'justify'] },
  lineHeight: { type: 'string', desc: '行高（数字或带单位字符串）' },
  letterSpacing: { type: 'number', desc: '字间距（px）' },
  textDecoration: { type: 'string', desc: '文字装饰，如 underline' },
  textTransform: { type: 'string', desc: '文字转换，如 uppercase' },
  borderWidth: { type: 'number', desc: '边框宽度（px）' },
  borderColor: { type: 'string', desc: '边框颜色' },
  borderStyle: { type: 'string', desc: '边框样式', enum: ['none', 'solid', 'dashed', 'dotted'] },
  border: { type: 'string', desc: '边框简写，如 2px solid #ffffff' },
  borderRadius: { type: 'string', desc: '圆角（px 或百分比，如 8、50%）' },
  padding: { type: 'string', desc: '内边距简写（px 或 4px 12px）' },
  paddingTop: { type: 'number', desc: '上内边距（px）' },
  paddingRight: { type: 'number', desc: '右内边距（px）' },
  paddingBottom: { type: 'number', desc: '下内边距（px）' },
  paddingLeft: { type: 'number', desc: '左内边距（px）' },
  opacity: { type: 'number', desc: '透明度 0~1' },
  shadowX: { type: 'number', desc: '阴影水平偏移（px）' },
  shadowY: { type: 'number', desc: '阴影垂直偏移（px）' },
  shadowBlur: { type: 'number', desc: '阴影模糊（px）' },
  shadowColor: { type: 'string', desc: '阴影颜色' },
  rotate: { type: 'number', desc: '旋转角度（deg）' },
  // 按钮交互态
  hoverBackgroundColor: { type: 'string', desc: '按钮悬停背景色' },
  activeBackgroundColor: { type: 'string', desc: '按钮按下背景色' },
  // 文本溢出/布局辅助（预设模板中可见）
  overflow: { type: 'string', desc: '溢出处理' },
  textOverflow: { type: 'string', desc: '文本溢出样式' },
  whiteSpace: { type: 'string', desc: '空白处理' },
  cursor: { type: 'string', desc: '鼠标样式' },
  display: { type: 'string', desc: 'display 属性' },
  alignItems: { type: 'string', desc: 'flex 对齐方式' },
  justifyContent: { type: 'string', desc: 'flex 主轴对齐' },
  flexDirection: { type: 'string', desc: 'flex 方向' }
}

/**
 * 各组件类型的 props 字段白名单
 * @type {Object<string, Object<string, {type: string, desc: string, enum?: string[]}>}
 */
export const PROP_FIELDS = {
  text: {
    content: { type: 'string', desc: '文本内容（支持\n换行）' },
    textAlign: { type: 'string', desc: '对齐', enum: ['left', 'center', 'right', 'justify'] },
    hasLink: { type: 'boolean', desc: '是否带超链接' },
    href: { type: 'string', desc: '链接地址（跳转到本画布的其他页面时使用 #page:页面ID，导出整站时自动转为文件名）' },
    target: { type: 'string', desc: '打开方式', enum: ['_self', '_blank'] }
  },
  image: {
    src: { type: 'string', desc: '图片 URL' },
    alt: { type: 'string', desc: '图片替代文本' },
    objectFit: { type: 'string', desc: '缩放方式', enum: ['cover', 'contain', 'fill', 'none', 'scale-down'] },
    hasLink: { type: 'boolean', desc: '是否带超链接' },
    href: { type: 'string', desc: '链接地址（跳转到本画布的其他页面时使用 #page:页面ID，导出整站时自动转为文件名）' },
    target: { type: 'string', desc: '打开方式', enum: ['_self', '_blank'] }
  },
  button: {
    content: { type: 'string', desc: '按钮文字' },
    textAlign: { type: 'string', desc: '文字对齐', enum: ['left', 'center', 'right'] },
    actionType: { type: 'string', desc: '点击行为', enum: ['link', 'alert', 'api'] },
    href: { type: 'string', desc: '跳转链接（actionType=link）；跳转到本画布其他页面时使用 #page:页面ID' },
    target: { type: 'string', desc: '打开方式', enum: ['_self', '_blank'] },
    alertMessage: { type: 'string', desc: '弹窗提示内容（actionType=alert）' },
    apiUrl: { type: 'string', desc: 'API 地址（actionType=api）' },
    apiMethod: { type: 'string', desc: '请求方法', enum: ['GET', 'POST', 'PUT', 'DELETE'] },
    apiBody: { type: 'string', desc: '请求体 JSON（actionType=api）' },
    apiConfig: {
      type: 'object',
      desc: 'API 配置对象 { url, method, headers, body }（actionType=api 的另一种写法）'
    }
  },
  link: {
    content: { type: 'string', desc: '链接文字' },
    href: { type: 'string', desc: '链接地址（跳转到本画布的其他页面时使用 #page:页面ID，导出整站时自动转为文件名）' },
    textAlign: { type: 'string', desc: '对齐', enum: ['left', 'center', 'right'] }
  },
  datetime: {
    displayType: { type: 'string', desc: '显示内容', enum: ['datetime', 'date', 'time'] },
    styleType: { type: 'string', desc: '样式风格', enum: ['digital', 'traditional', 'compact'] },
    showWeek: { type: 'boolean', desc: '显示星期' },
    showAmPm: { type: 'boolean', desc: '12 小时制' },
    showSeconds: { type: 'boolean', desc: '显示秒数' }
  },
  container: {},
  loginForm: {
    title: { type: 'string', desc: '表单标题' },
    submitText: { type: 'string', desc: '提交按钮文字' },
    showRemember: { type: 'boolean', desc: '显示记住密码' },
    rememberText: { type: 'string', desc: '记住密码文字' },
    showForgot: { type: 'boolean', desc: '显示忘记密码' },
    forgotText: { type: 'string', desc: '忘记密码文字' },
    forgotLink: { type: 'string', desc: '忘记密码链接' },
    apiUrl: { type: 'string', desc: '提交 API 地址' },
    apiMethod: { type: 'string', desc: '提交方法', enum: ['GET', 'POST'] }
  },
  registerForm: {
    title: { type: 'string', desc: '表单标题' },
    submitText: { type: 'string', desc: '提交按钮文字' },
    showAgreement: { type: 'boolean', desc: '显示用户协议' },
    agreementText: { type: 'string', desc: '协议文字' },
    agreementLink: { type: 'string', desc: '协议链接' },
    agreementRequired: { type: 'boolean', desc: '协议是否必选' },
    apiUrl: { type: 'string', desc: '提交 API 地址' },
    apiMethod: { type: 'string', desc: '提交方法', enum: ['GET', 'POST'] }
  },
  contactForm: {
    title: { type: 'string', desc: '表单标题' },
    showName: { type: 'boolean', desc: '显示姓名' },
    nameLabel: { type: 'string', desc: '姓名标签' },
    namePlaceholder: { type: 'string', desc: '姓名占位符' },
    nameRequired: { type: 'boolean', desc: '姓名必填' },
    showEmail: { type: 'boolean', desc: '显示邮箱' },
    emailLabel: { type: 'string', desc: '邮箱标签' },
    emailPlaceholder: { type: 'string', desc: '邮箱占位符' },
    emailRequired: { type: 'boolean', desc: '邮箱必填' },
    showPhone: { type: 'boolean', desc: '显示电话' },
    phoneLabel: { type: 'string', desc: '电话标签' },
    phonePlaceholder: { type: 'string', desc: '电话占位符' },
    phoneRequired: { type: 'boolean', desc: '电话必填' },
    showSubject: { type: 'boolean', desc: '显示主题' },
    subjectLabel: { type: 'string', desc: '主题标签' },
    subjectPlaceholder: { type: 'string', desc: '主题占位符' },
    subjectRequired: { type: 'boolean', desc: '主题必填' },
    showMessage: { type: 'boolean', desc: '显示留言' },
    messageLabel: { type: 'string', desc: '留言标签' },
    messagePlaceholder: { type: 'string', desc: '留言占位符' },
    messageRequired: { type: 'boolean', desc: '留言必填' },
    messageRows: { type: 'number', desc: '留言文本域行数' },
    submitText: { type: 'string', desc: '提交按钮文字' },
    apiUrl: { type: 'string', desc: '提交 API 地址' },
    apiMethod: { type: 'string', desc: '提交方法', enum: ['GET', 'POST'] }
  },
  searchForm: {
    placeholder: { type: 'string', desc: '搜索框占位符' },
    buttonText: { type: 'string', desc: '搜索按钮文字' },
    showCategory: { type: 'boolean', desc: '显示分类选择' },
    categoryLabel: { type: 'string', desc: '分类标签' },
    categoryOptions: { type: 'string', desc: '分类选项，格式 value|label，每行一个' },
    apiUrl: { type: 'string', desc: '搜索 API 地址' },
    apiMethod: { type: 'string', desc: '请求方法', enum: ['GET', 'POST'] }
  },
  commentForm: {
    title: { type: 'string', desc: '表单标题' },
    showRating: { type: 'boolean', desc: '显示评分' },
    ratingLabel: { type: 'string', desc: '评分标签' },
    maxRating: { type: 'number', desc: '最大评分' },
    showAuthor: { type: 'boolean', desc: '显示昵称' },
    authorLabel: { type: 'string', desc: '昵称标签' },
    authorPlaceholder: { type: 'string', desc: '昵称占位符' },
    authorRequired: { type: 'boolean', desc: '昵称必填' },
    showEmail: { type: 'boolean', desc: '显示邮箱' },
    emailLabel: { type: 'string', desc: '邮箱标签' },
    emailPlaceholder: { type: 'string', desc: '邮箱占位符' },
    emailRequired: { type: 'boolean', desc: '邮箱必填' },
    messageLabel: { type: 'string', desc: '评论标签' },
    messagePlaceholder: { type: 'string', desc: '评论占位符' },
    messageRequired: { type: 'boolean', desc: '评论必填' },
    messageRows: { type: 'number', desc: '评论行数' },
    submitText: { type: 'string', desc: '提交按钮文字' },
    apiUrl: { type: 'string', desc: '提交 API 地址' },
    apiMethod: { type: 'string', desc: '提交方法', enum: ['GET', 'POST'] }
  },
  customForm: {
    title: { type: 'string', desc: '表单标题' },
    submitText: { type: 'string', desc: '提交按钮文字' },
    apiUrl: { type: 'string', desc: '提交 API 地址' },
    apiMethod: { type: 'string', desc: '提交方法', enum: ['GET', 'POST'] },
    formItems: {
      type: 'array',
      desc: '表单项数组，每项 { id, type:text|email|tel|password|textarea|select|number|date, label, placeholder, required }'
    }
  },
  navMenu: {
    logo: { type: 'string', desc: 'Logo 文字' },
    logoUrl: { type: 'string', desc: 'Logo 链接' },
    menuItems: { type: 'string', desc: '菜单项，格式 文字|链接，每行一个' },
    activeIndex: { type: 'number', desc: '当前选中菜单项索引' },
    alignment: { type: 'string', desc: '菜单对齐方式', enum: ['left', 'center', 'right'] }
  },
  breadcrumb: {
    items: { type: 'string', desc: '面包屑项，格式 文字|链接，每行一个' },
    separator: { type: 'string', desc: '分隔符，如 /' },
    showHome: { type: 'boolean', desc: '显示首页' },
    homeText: { type: 'string', desc: '首页文字' },
    target: { type: 'string', desc: '链接打开方式', enum: ['_self', '_blank'] }
  },
  tabs: {
    tabs: { type: 'string', desc: '标签配置，格式 标签名|key，每行一个' },
    activeTab: { type: 'string', desc: '当前激活标签的 key' },
    tabPosition: { type: 'string', desc: '标签位置', enum: ['top', 'bottom', 'left', 'right'] },
    type: { type: 'string', desc: '标签类型', enum: ['line', 'card', 'border-card'] }
  },

  // ==================== 内容组件（扩展） ====================
  divider: {
    lineStyle: { type: 'string', desc: '线条样式', enum: ['solid', 'dashed', 'dotted'] },
    thickness: { type: 'number', desc: '线宽（px）' },
    color: { type: 'string', desc: '线条颜色' },
    text: { type: 'string', desc: '线中间的文字（可留空）' },
    textColor: { type: 'string', desc: '中间文字颜色' },
    textSize: { type: 'number', desc: '中间文字大小（px）' },
    textGap: { type: 'number', desc: '文字与线条之间的留白（px）' }
  },
  icon: {
    icon: { type: 'string', desc: '图标字符（emoji 或符号）' },
    shape: { type: 'string', desc: '背景形状', enum: ['none', 'circle', 'square'] },
    shapeColor: { type: 'string', desc: '背景颜色' },
    shapeSize: { type: 'number', desc: '背景形状尺寸（px）' }
  },
  list: {
    items: { type: 'string', desc: '列表项，每行一项，格式：文字|跳转链接（链接可留空）' },
    listType: { type: 'string', desc: '列表类型', enum: ['unordered', 'ordered', 'none'] },
    marker: { type: 'string', desc: '无序列表的标记符号' },
    markerColor: { type: 'string', desc: '标记颜色' },
    itemSpacing: { type: 'number', desc: '项间距（px）' },
    linkTarget: { type: 'string', desc: '列表项链接打开方式', enum: ['_self', '_blank'] }
  },
  table: {
    headers: { type: 'string', desc: '表头，用 | 分隔列' },
    rows: { type: 'string', desc: '数据行，每行一条，用 | 分隔列；单元格可写 [文字](链接) 或纯 http(s) 链接' },
    showHeader: { type: 'boolean', desc: '是否显示表头' },
    headerBackground: { type: 'string', desc: '表头背景色' },
    headerColor: { type: 'string', desc: '表头文字颜色' },
    borderColor: { type: 'string', desc: '边框颜色' },
    striped: { type: 'boolean', desc: '是否显示斑马纹' },
    cellPadding: { type: 'number', desc: '单元格内边距（px）' },
    linkTarget: { type: 'string', desc: '单元格内链接的打开方式', enum: ['_self', '_blank'] }
  },
  video: {
    src: { type: 'string', desc: '视频直链或 iframe 嵌入地址' },
    videoType: { type: 'string', desc: '地址类型', enum: ['file', 'iframe'] },
    poster: { type: 'string', desc: '封面图地址' },
    autoplay: { type: 'boolean', desc: '是否自动播放' },
    loop: { type: 'boolean', desc: '是否循环播放' },
    muted: { type: 'boolean', desc: '是否静音（自动播放需静音）' },
    controls: { type: 'boolean', desc: '是否显示控制条' }
  },
  carousel: {
    images: { type: 'string', desc: '图片列表，每行一张，格式：图片地址|说明文字|跳转链接（后两项可留空）' },
    autoplay: { type: 'boolean', desc: '是否自动播放' },
    interval: { type: 'number', desc: '切换间隔（ms）' },
    showIndicators: { type: 'boolean', desc: '是否显示指示点' },
    showArrows: { type: 'boolean', desc: '是否显示左右箭头' },
    linkTarget: { type: 'string', desc: '图片跳转链接的打开方式', enum: ['_self', '_blank'] }
  },

  // ==================== 展示组件（扩展） ====================
  progress: {
    value: { type: 'number', desc: '当前值' },
    max: { type: 'number', desc: '最大值（默认 100）' },
    barColor: { type: 'string', desc: '进度条颜色' },
    trackColor: { type: 'string', desc: '轨道颜色' },
    barHeight: { type: 'number', desc: '条高（px）' },
    rounded: { type: 'boolean', desc: '是否圆角' },
    showLabel: { type: 'boolean', desc: '是否显示百分比文字' },
    labelColor: { type: 'string', desc: '百分比文字颜色' }
  },
  accordion: {
    items: { type: 'string', desc: '折叠项，每行一条，格式：标题|内容' },
    firstOpen: { type: 'boolean', desc: '是否默认展开第一项' },
    allowMultiple: { type: 'boolean', desc: '是否允许同时展开多项' },
    headerBackground: { type: 'string', desc: '标题栏背景色' },
    activeColor: { type: 'string', desc: '展开时的标题颜色' },
    itemPadding: { type: 'number', desc: '内边距（px）' }
  },
  badge: {
    text: { type: 'string', desc: '徽章文字' },
    backgroundColor: { type: 'string', desc: '背景色' },
    shape: { type: 'string', desc: '形状', enum: ['pill', 'square'] },
    borderColor: { type: 'string', desc: '描边颜色（留空则无描边）' },
    fontWeight: { type: 'number', desc: '字重' }
  },
  stat: {
    value: { type: 'string', desc: '主数值（字符串，可含单位）' },
    label: { type: 'string', desc: '说明文字' },
    unit: { type: 'string', desc: '数值后缀单位' },
    trend: { type: 'string', desc: '趋势文字，如 +12.5%（可留空）' },
    trendUp: { type: 'boolean', desc: '趋势是否上升（决定颜色与箭头）' },
    icon: { type: 'string', desc: '可选图标（emoji）' },
    valueColor: { type: 'string', desc: '数值颜色' },
    labelColor: { type: 'string', desc: '说明文字颜色' },
    trendUpColor: { type: 'string', desc: '上升趋势颜色' },
    trendDownColor: { type: 'string', desc: '下降趋势颜色' }
  }
}

// 基础组件结构字段（所有组件都有）
export const BASE_COMPONENT_FIELDS = [
  { key: 'type', type: 'string', desc: '组件类型，必须是白名单中的类型' },
  { key: 'left', type: 'number', desc: '左上角 X 坐标（px）' },
  { key: 'top', type: 'number', desc: '左上角 Y 坐标（px）' },
  { key: 'width', type: 'number', desc: '宽度（px）' },
  { key: 'height', type: 'number', desc: '高度（px）' },
  { key: 'zIndex', type: 'number', desc: '层级，越大越靠上；容器用较小值，内容用较大值' },
  { key: 'visible', type: 'boolean', desc: '是否可见（false 时画布与导出都不渲染）' },
  { key: 'locked', type: 'boolean', desc: '是否锁定（锁定后画布上不可拖动）' },
  { key: 'name', type: 'string', desc: '图层名称（可省略）' },
  { key: 'style', type: 'object', desc: '样式对象，键必须来自样式白名单' },
  { key: 'props', type: 'object', desc: '属性对象，键必须来自对应类型的 props 白名单' }
]

/**
 * 校验并清洗单个组件数据（AI 输出/外部数据专用，严格模式）
 * - 未知组件类型返回 null
 * - style / props 只保留白名单内的键
 * - left/top/width/height/zIndex 强制转数字并裁剪到安全范围
 * @param {Object} comp - 组件配置
 * @param {Object} [options] - { maxWidth, maxHeight, maxZIndex } 页面边界
 * @returns {Object|null} 清洗后的组件数据
 */
export function sanitizeComponent(comp, options = {}) {
  if (!comp || typeof comp !== 'object') return null

  const type = comp.type
  if (!KNOWN_COMPONENT_TYPES.includes(type)) return null

  const { maxWidth = 3840, maxHeight = 8000, maxZIndex = 999 } = options

  const num = (v, fallback = 0) => {
    const n = parseFloat(v)
    return Number.isFinite(n) ? n : fallback
  }

  const style = {}
  if (comp.style && typeof comp.style === 'object') {
    for (const key of Object.keys(comp.style)) {
      if (STYLE_FIELDS[key]) style[key] = comp.style[key]
    }
  }

  const props = {}
  if (comp.props && typeof comp.props === 'object') {
    const allowed = PROP_FIELDS[type] || {}
    for (const key of Object.keys(comp.props)) {
      if (allowed[key]) props[key] = comp.props[key]
    }
  }

  return {
    id: typeof comp.id === 'string' && comp.id.length > 0 ? comp.id : generateId(type),
    type,
    name: typeof comp.name === 'string' ? comp.name : undefined,
    left: Math.max(-5000, Math.min(maxWidth, num(comp.left))),
    top: Math.max(-5000, Math.min(maxHeight, num(comp.top))),
    width: Math.max(20, Math.min(maxWidth, num(comp.width, 100))),
    height: Math.max(20, Math.min(maxHeight, num(comp.height, 50))),
    zIndex: Math.max(1, Math.min(maxZIndex, num(comp.zIndex, 3) || 3)),
    // 图层状态：缺省可见、未锁定
    visible: comp.visible !== false,
    locked: comp.locked === true,
    style,
    props
  }
}

/**
 * 校验并清洗页面级 AI 输出
 * @param {Object} data - AI 返回的页面数据
 * @param {Object} [options] - 页面边界等选项
 * @returns {{success: boolean, page?: Object, errors?: string[]}}
 */
export function sanitizePageData(data, options = {}) {
  const errors = []

  if (!data || typeof data !== 'object') {
    return { success: false, errors: ['AI 输出不是有效对象'] }
  }

  const components = Array.isArray(data.components) ? data.components : []

  const sanitized = components
    .map(comp => sanitizeComponent(comp, options))
    .filter(comp => {
      if (!comp) {
        errors.push('存在未知组件类型，已忽略')
        return false
      }
      return true
    })

  const page = {
    name: typeof data.name === 'string' ? data.name : 'AI 生成页面',
    width: Math.max(320, Math.min(3840, parseFloat(data.width) || 1200)),
    height: Math.max(200, Math.min(8000, parseFloat(data.height) || 800)),
    backgroundColor: data.backgroundColor || '#ffffff',
    backgroundType: data.backgroundType || 'solid',
    backgroundGradientStart: data.backgroundGradientStart || '#ffffff',
    backgroundGradientEnd: data.backgroundGradientEnd || '#f5f5f5',
    backgroundGradientAngle: parseFloat(data.backgroundGradientAngle) || 180,
    backgroundImage: data.backgroundImage || '',
    backgroundImageSize: data.backgroundImageSize || 'cover',
    backgroundImagePosition: data.backgroundImagePosition || 'center',
    backgroundImageRepeat: data.backgroundImageRepeat || 'no-repeat',
    // SEO / head 配置（AI 可以顺带填写，导出时注入 <head>）
    seoTitle: typeof data.seoTitle === 'string' ? data.seoTitle : '',
    seoDescription: typeof data.seoDescription === 'string' ? data.seoDescription : '',
    seoKeywords: typeof data.seoKeywords === 'string' ? data.seoKeywords : '',
    seoFavicon: typeof data.seoFavicon === 'string' ? data.seoFavicon : '',
    seoOgImage: typeof data.seoOgImage === 'string' ? data.seoOgImage : '',
    seoLang: typeof data.seoLang === 'string' && data.seoLang ? data.seoLang : 'zh-CN',
    components: sanitized
  }

  return { success: true, page, errors }
}

/**
 * 生成给 AI 看的 Schema 描述文本（中文，紧凑）
 * @returns {string}
 */
export function getSchemaForPrompt() {
  const lines = []
  lines.push('可用组件类型（type 必填，只能使用以下类型）：')
  lines.push('  ' + KNOWN_COMPONENT_TYPES.join(', '))
  lines.push('')
  lines.push('每个组件的基础字段：')
  lines.push('  ' + BASE_COMPONENT_FIELDS.map(f => `${f.key}(${f.type})${f.desc ? ':' + f.desc : ''}`).join('；'))
  lines.push('')
  lines.push('style 白名单（只能用这些键）：')
  lines.push('  ' + Object.entries(STYLE_FIELDS)
    .map(([k, v]) => `${k}(${v.type})${v.enum ? '=' + v.enum.join('|') : ''}`)
    .join('、'))
  lines.push('')
  lines.push('各类型的 props 白名单：')
  for (const [type, fields] of Object.entries(PROP_FIELDS)) {
    const desc = Object.entries(fields)
      .map(([k, v]) => `${k}(${v.type})${v.enum ? '=' + v.enum.join('|') : ''}${v.desc ? ':' + v.desc : ''}`)
      .join('、')
    lines.push(`  ${type}: ${desc || '（无 props 字段）'}`)
  }
  lines.push('')
  lines.push('规则：')
  lines.push('- 只使用上述白名单中的类型、style 键和 props 键，禁止使用其他字段')
  lines.push('- left/top/width/height 单位为 px，数值必须为正数，width/height 最小 20')
  lines.push('- 多行内容（文本、菜单项等）使用 \\n 换行')
  lines.push('- 图片资源使用 https:// 开头的公开 URL')
  return lines.join('\n')
}

/**
 * 将当前编辑器的页面状态序列化为与 Schema 契约一致的结构（给 AI 看/用于 diff）
 * @param {Object} page - editor store 的 page 状态
 * @returns {Object} 纯数据对象
 */
export function getPageContract(page) {
  return JSON.parse(JSON.stringify({
    name: page.name,
    width: page.width,
    height: page.height,
    backgroundColor: page.backgroundColor,
    backgroundType: page.backgroundType,
    backgroundGradientStart: page.backgroundGradientStart,
    backgroundGradientEnd: page.backgroundGradientEnd,
    backgroundGradientAngle: page.backgroundGradientAngle,
    backgroundImage: page.backgroundImage,
    backgroundImageSize: page.backgroundImageSize,
    backgroundImagePosition: page.backgroundImagePosition,
    backgroundImageRepeat: page.backgroundImageRepeat,
    seoTitle: page.seoTitle || '',
    seoDescription: page.seoDescription || '',
    seoKeywords: page.seoKeywords || '',
    seoFavicon: page.seoFavicon || '',
    seoOgImage: page.seoOgImage || '',
    seoLang: page.seoLang || 'zh-CN',
    components: (page.components || []).map(comp => ({
      id: comp.id,
      type: comp.type,
      name: comp.name,
      left: comp.left,
      top: comp.top,
      width: comp.width,
      height: comp.height,
      zIndex: comp.zIndex,
      visible: comp.visible !== false,
      locked: comp.locked === true,
      style: comp.style,
      props: comp.props
    }))
  }))
}

/**
 * 将整个画布（站点）的页面清单序列化为给 AI 看的「站点契约」
 * 只包含页面级结构信息（名称 / 是否当前页 / 尺寸 / 组件数），不含组件明细，
 * 用于让 AI 知道"本站有哪些页面"，从而在导航栏、页脚里写出正确的页面跳转链接
 * （链接写法：`#page:<页面名>`，页面创建后会自动解析为真实 ID）
 * @param {Object} canvas - 画布数据 { name, pages }
 * @param {string} activePageId - 当前正在编辑的页面 ID
 * @returns {Object} 站点契约
 */
export function getSiteContract(canvas, activePageId) {
  const pages = (canvas?.pages || []).map(page => ({
    name: page.name,
    isCurrent: page.id === activePageId,
    width: page.width,
    height: page.height,
    componentCount: (page.components || []).length
  }))

  return {
    siteName: canvas?.name || '未命名画布',
    pageCount: pages.length,
    pages
  }
}

export default {
  KNOWN_COMPONENT_TYPES,
  STYLE_FIELDS,
  PROP_FIELDS,
  BASE_COMPONENT_FIELDS,
  sanitizeComponent,
  sanitizePageData,
  getSchemaForPrompt,
  getPageContract,
  getSiteContract
}