<script setup>
import { computed, ref } from 'vue'
import { useEditor } from '../../stores/editor'
import {
  getComponentBackendConfig,
  generateSingleComponentEntity,
  generateSingleComponentController,
  generateAbstractClass,
  generateInterface,
  generateUtilClass,
  generateAllBackendCode,
  downloadTextFile,
  getSupportedFrameworks
} from '../../utils/backendGenerator'

const {
  selectedComponent,
  selectedId,
  page,
  updateComponent,
  updateComponentStyle,
  updateComponentProps,
  updateComponentZIndex,
  removeComponent,
  updatePageSize,
  // 辅助线相关
  guidesVisible,
  guidesList,
  selectedGuideId,
  selectGuide,
  deleteGuide,
  updateGuide,
  snapEnabled,
  snapMode,
  snapDistance,
  snapBlockDistance,
  toggleSnap,
  setSnapMode,
  setSnapDistance,
  setSnapBlockDistance
} = useEditor()

// 后端代码生成对话框
const showBackendDialog = ref(false)
const selectedFramework = ref('springboot')
const selectedCodeType = ref('entity')

// 框架选项
const frameworkOptions = getSupportedFrameworks()

// ==================== 辅助线相关 ====================

// 当前选中的辅助线
const selectedGuide = computed(() => {
  if (!selectedGuideId.value) return null
  return guidesList.value.find(g => g.id === selectedGuideId.value) || null
})

// 辅助线类型名称映射
const guideTypeNames = {
  line: '直线',
  rect: '矩形',
  circle: '圆形',
  triangle: '三角形',
  semicircle: '半圆'
}

// 获取辅助线类型名称
function getGuideTypeName(type) {
  return guideTypeNames[type] || type
}

// 更新辅助线可见性
function updateGuideVisible(visible) {
  if (!selectedGuideId.value) return
  updateGuide(selectedGuideId.value, { visible })
}

// 更新辅助线锁定状态
function updateGuideLocked(locked) {
  if (!selectedGuideId.value) return
  updateGuide(selectedGuideId.value, { locked })
}

// 更新辅助线颜色
function updateGuideColor(color) {
  if (!selectedGuideId.value) return
  updateGuide(selectedGuideId.value, { color })
}

// 更新辅助线旋转角度
function updateGuideRotation(rotation) {
  if (!selectedGuideId.value) return
  updateGuide(selectedGuideId.value, { rotation: parseFloat(rotation) || 0 })
}

// 删除选中辅助线
function deleteSelectedGuide() {
  if (!selectedGuideId.value) return
  deleteGuide(selectedGuideId.value)
}

// 取消选择辅助线
function deselectGuide() {
  selectGuide(null)
}

// 当前组件是否支持后端代码生成（只有确实有后端接口需求时才支持）
const hasBackendSupport = computed(() => {
  if (!selectedComponent.value) return false
  
  const config = getComponentBackendConfig(selectedComponent.value.type)
  if (!config) return false
  
  const componentType = selectedComponent.value.type
  const props = selectedComponent.value.props || {}
  
  // 表单组件：始终支持后端代码生成
  const formTypes = ['loginForm', 'registerForm', 'contactForm', 'searchForm', 'commentForm', 'customForm']
  if (formTypes.includes(componentType)) {
    return true
  }
  
  // 根据组件类型和属性判断是否需要后端支持
  switch (componentType) {
    case 'button':
      return props.actionType === 'api'
    case 'image':
      return props.uploadEnabled === true || props.enableUpload === true
    case 'link':
      return props.dynamic === true || props.useApi === true
    case 'text':
      return props.dynamic === true || props.useApi === true
    case 'container':
      return props.hasBackendData === true
    default:
      return config.requiresBackend === true || (config.fields && Object.keys(config.fields).length > 0)
  }
})

// 预设页面尺寸
const presetSizes = [
  { name: '手机', width: 375, height: 667 },
  { name: '平板', width: 768, height: 1024 },
  { name: '笔记本', width: 1366, height: 768 },
  { name: '桌面', width: 1920, height: 1080 },
  { name: '正方形', width: 800, height: 800 }
]

// 更新页面名称
function updatePageName(name) {
  page.name = name
}

// 更新页面宽度
function updatePageWidth(width) {
  const num = parseInt(width) || 1200
  updatePageSize(num, page.height)
}

// 更新页面高度
function updatePageHeight(height) {
  const num = parseInt(height) || 800
  updatePageSize(page.width, num)
}

// 更新页面背景颜色
function updatePageBgColor(color) {
  page.backgroundColor = color
}

// 应用预设尺寸
function applyPreset(preset) {
  updatePageSize(preset.width, preset.height)
}

// 复制组件ID
function copyComponentId() {
  if (!selectedComponent.value) return
  
  const id = selectedComponent.value.id
  
  // 使用 Clipboard API 复制
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(id).then(() => {
      alert('组件ID已复制到剪贴板')
    }).catch(err => {
      console.error('复制失败:', err)
      fallbackCopy(id)
    })
  } else {
    fallbackCopy(id)
  }
}

// 备用复制方法（兼容旧浏览器）
function fallbackCopy(text) {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  
  try {
    const successful = document.execCommand('copy')
    if (successful) {
      alert('组件ID已复制到剪贴板')
    } else {
      alert('复制失败，请手动复制')
    }
  } catch (err) {
    console.error('复制失败:', err)
    alert('复制失败，请手动复制')
  }
  
  document.body.removeChild(textarea)
}

// 图片文件选择
const imageFileInput = ref(null)

// 选择本地图片
function handleImageSelect(event) {
  const file = event.target.files[0]
  if (!file) return

  // 检查是否是图片文件
  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件')
    return
  }

  // 读取文件为 base64
  const reader = new FileReader()
  reader.onload = (e) => {
    const base64 = e.target.result
    // 存储图片数据（base64）和文件名
    updateComponentProps(selectedId.value, {
      src: base64,
      alt: file.name,
      localImage: true,
      imageFileName: file.name
    })
  }
  reader.readAsDataURL(file)

  // 清空 input，允许再次选择同一文件
  event.target.value = ''
}

// 触发文件选择
function triggerImageSelect() {
  if (imageFileInput.value) {
    imageFileInput.value.click()
  }
}

// 清除本地图片
function clearLocalImage() {
  updateComponentProps(selectedId.value, {
    src: 'https://via.placeholder.com/200x150',
    localImage: false,
    imageFileName: ''
  })
}

// ==================== 样式属性分组 ====================

// 文字样式
const textStyleFields = [
  { key: 'fontSize', label: '字号', type: 'number', min: 12, max: 72 },
  { key: 'color', label: '颜色', type: 'color' },
  { key: 'fontWeight', label: '粗细', type: 'select', options: ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'] },
  { key: 'lineHeight', label: '行高', type: 'number', min: 1, max: 3, step: 0.1 },
  { key: 'letterSpacing', label: '字间距', type: 'number', min: 0, max: 20 },
  { key: 'textDecoration', label: '装饰', type: 'select', options: ['none', 'underline', 'overline', 'line-through'] },
  { key: 'textTransform', label: '转换', type: 'select', options: ['none', 'uppercase', 'lowercase', 'capitalize'] }
]

// 边框样式
const borderStyleFields = [
  { key: 'borderWidth', label: '宽度', type: 'number', min: 0, max: 20 },
  { key: 'borderColor', label: '颜色', type: 'color' },
  { key: 'borderStyle', label: '样式', type: 'select', options: ['none', 'solid', 'dashed', 'dotted', 'double'] },
  { key: 'borderRadius', label: '圆角', type: 'number', min: 0, max: 100 }
]

// 背景样式
const backgroundStyleFields = [
  { key: 'backgroundColor', label: '背景色', type: 'color' },
  { key: 'opacity', label: '透明度', type: 'number', min: 0, max: 1, step: 0.1 }
]

// 间距样式
const spacingStyleFields = [
  { key: 'padding', label: '内边距', type: 'number', min: 0, max: 100 },
  { key: 'paddingTop', label: '上内边距', type: 'number', min: 0, max: 100 },
  { key: 'paddingBottom', label: '下内边距', type: 'number', min: 0, max: 100 },
  { key: 'paddingLeft', label: '左内边距', type: 'number', min: 0, max: 100 },
  { key: 'paddingRight', label: '右内边距', type: 'number', min: 0, max: 100 }
]

// 效果样式
const effectStyleFields = [
  { key: 'shadowX', label: '阴影X', type: 'number', min: -50, max: 50 },
  { key: 'shadowY', label: '阴影Y', type: 'number', min: -50, max: 50 },
  { key: 'shadowBlur', label: '阴影模糊', type: 'number', min: 0, max: 50 },
  { key: 'shadowColor', label: '阴影颜色', type: 'color' },
  { key: 'rotate', label: '旋转(度)', type: 'number', min: -180, max: 180 }
]

// ==================== 组件特有属性配置 ====================
const componentPropsFields = {
  text: [
    { key: 'content', label: '文本内容', type: 'textarea' },
    { key: 'textAlign', label: '对齐', type: 'select', options: ['left', 'center', 'right', 'justify'] },
    { key: 'hasLink', label: '添加超链接', type: 'checkbox' },
    { key: 'href', label: '链接地址', type: 'text', showIf: { hasLink: true } },
    { key: 'target', label: '打开方式', type: 'select', options: [{ value: '_blank', label: '新窗口打开' }, { value: '_self', label: '当前窗口打开' }], showIf: { hasLink: true } }
  ],
  image: [
    { key: 'src', label: '图片地址', type: 'text' },
    { key: 'alt', label: 'alt文本', type: 'text' },
    { key: 'objectFit', label: '填充方式', type: 'select', options: ['cover', 'contain', 'fill', 'none', 'scale-down'] },
    { key: 'hasLink', label: '添加超链接', type: 'checkbox' },
    { key: 'href', label: '链接地址', type: 'text', showIf: { hasLink: true } },
    { key: 'target', label: '打开方式', type: 'select', options: [{ value: '_blank', label: '新窗口打开' }, { value: '_self', label: '当前窗口打开' }], showIf: { hasLink: true } }
  ],
  button: [
    { key: 'content', label: '按钮文字', type: 'text' },
    { key: 'textAlign', label: '对齐', type: 'select', options: ['left', 'center', 'right'] },
    { key: 'actionType', label: '点击行为', type: 'select', options: [
      { value: 'link', label: '跳转链接' },
      { value: 'alert', label: '弹窗提示' },
      { value: 'api', label: '调用API' }
    ] },
    // 跳转链接配置
    { key: 'href', label: '跳转链接', type: 'text', showIf: { actionType: 'link' } },
    { key: 'target', label: '打开方式', type: 'select', options: [
      { value: '_self', label: '当前窗口' },
      { value: '_blank', label: '新窗口' }
    ], showIf: { actionType: 'link' } },
    // 弹窗提示配置
    { key: 'alertMessage', label: '提示内容', type: 'textarea', showIf: { actionType: 'alert' } },
    // API 配置
    { key: 'apiUrl', label: 'API地址', type: 'text', showIf: { actionType: 'api' } },
    { key: 'apiMethod', label: '请求方法', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE'], showIf: { actionType: 'api' } },
    { key: 'apiBody', label: '请求体(JSON)', type: 'textarea', showIf: { actionType: 'api' } },
  ],
  link: [
    { key: 'content', label: '链接文字', type: 'text' },
    { key: 'href', label: '链接地址', type: 'text' },
    { key: 'textAlign', label: '对齐', type: 'select', options: ['left', 'center', 'right'] }
  ],
  datetime: [
    { key: 'displayType', label: '显示内容', type: 'select', options: [{ value: 'datetime', label: '日期+时间' }, { value: 'date', label: '仅日期' }, { value: 'time', label: '仅时间' }] },
    { key: 'styleType', label: '样式风格', type: 'select', options: [{ value: 'digital', label: '数字时钟' }, { value: 'traditional', label: '传统中文' }, { value: 'compact', label: '简洁紧凑' }] },
    { key: 'showWeek', label: '显示星期', type: 'checkbox' },
    { key: 'showAmPm', label: '12小时制', type: 'checkbox' },
    { key: 'showSeconds', label: '显示秒数', type: 'checkbox' }
  ],
  container: [],
  // 预设表单模板属性配置
  loginForm: [
    { key: 'title', label: '表单标题', type: 'text' },
    { key: 'submitText', label: '提交按钮文字', type: 'text' },
    { key: 'showRemember', label: '显示记住密码', type: 'checkbox' },
    { key: 'rememberText', label: '记住密码文字', type: 'text', showIf: { showRemember: true } },
    { key: 'showForgot', label: '显示忘记密码', type: 'checkbox' },
    { key: 'forgotText', label: '忘记密码文字', type: 'text', showIf: { showForgot: true } },
    { key: 'forgotLink', label: '忘记密码链接', type: 'text', showIf: { showForgot: true } },
    { key: 'apiUrl', label: 'API地址', type: 'text' },
    { key: 'apiMethod', label: '请求方法', type: 'select', options: ['GET', 'POST'] }
  ],
  registerForm: [
    { key: 'title', label: '表单标题', type: 'text' },
    { key: 'submitText', label: '提交按钮文字', type: 'text' },
    { key: 'showAgreement', label: '显示用户协议', type: 'checkbox' },
    { key: 'agreementText', label: '协议文字', type: 'text', showIf: { showAgreement: true } },
    { key: 'agreementLink', label: '协议链接', type: 'text', showIf: { showAgreement: true } },
    { key: 'agreementRequired', label: '协议必填', type: 'checkbox', showIf: { showAgreement: true } },
    { key: 'apiUrl', label: 'API地址', type: 'text' },
    { key: 'apiMethod', label: '请求方法', type: 'select', options: ['GET', 'POST'] }
  ],
  contactForm: [
    { key: 'title', label: '表单标题', type: 'text' },
    { key: 'showName', label: '显示姓名', type: 'checkbox' },
    { key: 'nameLabel', label: '姓名标签', type: 'text', showIf: { showName: true } },
    { key: 'namePlaceholder', label: '姓名占位符', type: 'text', showIf: { showName: true } },
    { key: 'nameRequired', label: '姓名必填', type: 'checkbox', showIf: { showName: true } },
    { key: 'showEmail', label: '显示邮箱', type: 'checkbox' },
    { key: 'emailLabel', label: '邮箱标签', type: 'text', showIf: { showEmail: true } },
    { key: 'emailPlaceholder', label: '邮箱占位符', type: 'text', showIf: { showEmail: true } },
    { key: 'emailRequired', label: '邮箱必填', type: 'checkbox', showIf: { showEmail: true } },
    { key: 'showPhone', label: '显示电话', type: 'checkbox' },
    { key: 'phoneLabel', label: '电话标签', type: 'text', showIf: { showPhone: true } },
    { key: 'phonePlaceholder', label: '电话占位符', type: 'text', showIf: { showPhone: true } },
    { key: 'phoneRequired', label: '电话必填', type: 'checkbox', showIf: { showPhone: true } },
    { key: 'showSubject', label: '显示主题', type: 'checkbox' },
    { key: 'subjectLabel', label: '主题标签', type: 'text', showIf: { showSubject: true } },
    { key: 'subjectPlaceholder', label: '主题占位符', type: 'text', showIf: { showSubject: true } },
    { key: 'subjectRequired', label: '主题必填', type: 'checkbox', showIf: { showSubject: true } },
    { key: 'showMessage', label: '显示留言', type: 'checkbox' },
    { key: 'messageLabel', label: '留言标签', type: 'text', showIf: { showMessage: true } },
    { key: 'messagePlaceholder', label: '留言占位符', type: 'text', showIf: { showMessage: true } },
    { key: 'messageRequired', label: '留言必填', type: 'checkbox', showIf: { showMessage: true } },
    { key: 'messageRows', label: '留言行数', type: 'number', min: 2, max: 10, showIf: { showMessage: true } },
    { key: 'submitText', label: '提交按钮文字', type: 'text' },
    { key: 'apiUrl', label: 'API地址', type: 'text' },
    { key: 'apiMethod', label: '请求方法', type: 'select', options: ['GET', 'POST'] }
  ],
  searchForm: [
    { key: 'placeholder', label: '搜索框占位符', type: 'text' },
    { key: 'buttonText', label: '搜索按钮文字', type: 'text' },
    { key: 'showCategory', label: '显示分类选择', type: 'checkbox' },
    { key: 'categoryLabel', label: '分类标签', type: 'text', showIf: { showCategory: true } },
    { key: 'categoryOptions', label: '分类选项', type: 'textarea', showIf: { showCategory: true }, placeholder: '格式: value|label\n如:\nall|全部\nnews|新闻' },
    { key: 'apiUrl', label: 'API地址', type: 'text' },
    { key: 'apiMethod', label: '请求方法', type: 'select', options: ['GET', 'POST'] }
  ],
  commentForm: [
    { key: 'title', label: '表单标题', type: 'text' },
    { key: 'showRating', label: '显示评分', type: 'checkbox' },
    { key: 'ratingLabel', label: '评分标签', type: 'text', showIf: { showRating: true } },
    { key: 'maxRating', label: '最大评分', type: 'number', min: 1, max: 10, showIf: { showRating: true } },
    { key: 'showAuthor', label: '显示昵称', type: 'checkbox' },
    { key: 'authorLabel', label: '昵称标签', type: 'text', showIf: { showAuthor: true } },
    { key: 'authorPlaceholder', label: '昵称占位符', type: 'text', showIf: { showAuthor: true } },
    { key: 'authorRequired', label: '昵称必填', type: 'checkbox', showIf: { showAuthor: true } },
    { key: 'showEmail', label: '显示邮箱', type: 'checkbox' },
    { key: 'emailLabel', label: '邮箱标签', type: 'text', showIf: { showEmail: true } },
    { key: 'emailPlaceholder', label: '邮箱占位符', type: 'text', showIf: { showEmail: true } },
    { key: 'emailRequired', label: '邮箱必填', type: 'checkbox', showIf: { showEmail: true } },
    { key: 'messageLabel', label: '评论标签', type: 'text' },
    { key: 'messagePlaceholder', label: '评论占位符', type: 'text' },
    { key: 'messageRequired', label: '评论必填', type: 'checkbox' },
    { key: 'messageRows', label: '评论行数', type: 'number', min: 2, max: 10 },
    { key: 'submitText', label: '提交按钮文字', type: 'text' },
    { key: 'apiUrl', label: 'API地址', type: 'text' },
    { key: 'apiMethod', label: '请求方法', type: 'select', options: ['GET', 'POST'] }
  ],
  customForm: [
    { key: 'title', label: '表单标题', type: 'text' },
    { key: 'submitText', label: '提交按钮文字', type: 'text' },
    { key: 'apiUrl', label: 'API地址', type: 'text' },
    { key: 'apiMethod', label: '请求方法', type: 'select', options: ['GET', 'POST'] }
  ],
  // 导航组件属性配置
  navMenu: [
    { key: 'logo', label: 'Logo文字', type: 'text' },
    { key: 'logoUrl', label: 'Logo链接', type: 'text' },
    { key: 'activeIndex', label: '当前选中索引', type: 'number', min: 0, max: 100 }
  ],
  breadcrumb: [
    { key: 'separator', label: '分隔符', type: 'text' },
    { key: 'target', label: '链接打开方式', type: 'select', options: [{ value: '_self', label: '当前窗口打开' }, { value: '_blank', label: '新窗口打开' }] }
  ],
  tabs: [
    { key: 'activeTab', label: '当前选中', type: 'text' },
    { key: 'tabPosition', label: '标签位置', type: 'select', options: ['top', 'bottom', 'left', 'right'] },
    { key: 'type', label: '标签类型', type: 'select', options: ['line', 'card', 'border-card'] }
  ],
  
}

// 当前组件的特有属性
const propsFields = computed(() => {
  if (!selectedComponent.value) return []
  return componentPropsFields[selectedComponent.value.type] || []
})

// ==================== 更新方法 ====================

// 更新样式
function updateStyle(key, value) {
  if (!selectedId.value) return
  updateComponentStyle(selectedId.value, { [key]: value })
}

// 更新位置和尺寸
function updatePosition(key, value) {
  if (!selectedId.value) return
  updateComponent(selectedId.value, { [key]: parseFloat(value) || 0 })
}

// 删除组件
function handleDelete() {
  if (!selectedId.value) return
  removeComponent(selectedId.value)
}

// 获取样式值
function getStyleValue(key) {
  return selectedComponent.value?.style?.[key]
}

// 更新组件层级
function updateZIndex(zIndex) {
  if (selectedId.value) {
    updateComponentZIndex(selectedId.value, zIndex)
  }
}

// 获取属性值（支持嵌套属性）
function getPropsValue(key) {
  const props = selectedComponent.value?.props || {}
  
  // 处理特殊属性映射
  if (key === 'apiUrl') return props.apiConfig?.url || ''
  if (key === 'apiMethod') return props.apiConfig?.method || 'POST'
  if (key === 'apiBody') {
    return props.apiConfig?.body ? JSON.stringify(props.apiConfig.body, null, 2) : ''
  }
  
  return props[key]
}

// 判断字段是否应该显示（根据 showIf 条件）
function isFieldVisible(field) {
  if (!field.showIf) return true
  
  const props = selectedComponent.value?.props || {}
  for (const [condKey, condValue] of Object.entries(field.showIf)) {
    if (props[condKey] !== condValue) {
      return false
    }
  }
  return true
}

// 更新属性（支持嵌套属性）
function updateProps(key, value) {
  if (!selectedId.value) return

  const props = { ...selectedComponent.value?.props }

  // 特殊处理列表项（逗号分隔的字符串转数组）
  if (selectedComponent.value.type === 'list' && key === 'items') {
    value = value.split(',').map(s => s.trim()).filter(s => s)
  }

  // 处理 API 配置的嵌套属性
  if (key === 'apiUrl') {
    props.apiConfig = props.apiConfig || {}
    props.apiConfig.url = value
    updateComponentProps(selectedId.value, { apiConfig: props.apiConfig })
    return
  }

  if (key === 'apiMethod') {
    props.apiConfig = props.apiConfig || {}
    props.apiConfig.method = value
    updateComponentProps(selectedId.value, { apiConfig: props.apiConfig })
    return
  }

  if (key === 'apiBody') {
    props.apiConfig = props.apiConfig || {}
    try {
      props.apiConfig.body = value ? JSON.parse(value) : {}
    } catch {
      props.apiConfig.body = {}
    }
    updateComponentProps(selectedId.value, { apiConfig: props.apiConfig })
    return
  }

  updateComponentProps(selectedId.value, { [key]: value })
}

// ==================== 自定义表单管理 ====================

// 辅助函数：将 options 数组转换为 optionsText 字符串
function getOptionsText(item) {
  if (item.optionsText !== undefined) {
    return item.optionsText
  }
  if (item.options && Array.isArray(item.options)) {
    return item.options.map(opt => {
      if (typeof opt === 'object') {
        return `${opt.value || ''}|${opt.label || opt.value || ''}`
      }
      return `${opt}|${opt}`
    }).join('\n')
  }
  return ''
}

// 添加表单项
function addFormItem(type = 'text') {
  if (!selectedId.value) return
  
  const props = { ...selectedComponent.value.props }
  const formItems = [...(props.formItems || [])]
  
  if (type === 'description') {
    formItems.push({
      id: `field${Date.now()}`,
      type: 'description',
      label: '请输入描述文本...',
      color: '#333333',
      fontSize: 14,
      textAlign: 'left',
      bgColor: '#f5f5f5'
    })
  } else {
    formItems.push({
      id: `field${Date.now()}`,
      type: type,
      label: '新字段',
      placeholder: '',
      required: false,
      optionsText: '',
      options: []
    })
  }
  
  updateComponentProps(selectedId.value, { formItems })
}

// 删除表单项
function removeFormItem(index) {
  if (!selectedId.value) return
  
  const props = { ...selectedComponent.value.props }
  const formItems = [...(props.formItems || [])]
  
  formItems.splice(index, 1)
  
  updateComponentProps(selectedId.value, { formItems })
}

// 更新表单项
function updateFormItems() {
  if (!selectedId.value) return
  
  const props = { ...selectedComponent.value.props }
  const formItems = [...(props.formItems || [])]
  
  // 解析选项文本
  formItems.forEach(item => {
    if (item.optionsText) {
      item.options = item.optionsText.split('\n').filter(line => line.trim()).map(line => {
        const [value, label] = line.split('|')
        return {
          value: value?.trim() || '',
          label: label?.trim() || value?.trim() || ''
        }
      })
    }
  })
  
  updateComponentProps(selectedId.value, { formItems })
}

// ==================== 导航组件列表项管理 ====================

// 解析导航菜单项
function getNavMenuItems() {
  if (!selectedComponent.value) return []
  const menuItemsStr = selectedComponent.value.props?.menuItems || '首页|#'
  return menuItemsStr.split('\n').filter(item => item.trim()).map((item, index) => {
    const [text, url] = item.split('|')
    return {
      id: `menu_${index}`,
      text: text?.trim() || '',
      url: url?.trim() || '#'
    }
  })
}

// 添加导航菜单项
function addNavMenuItem() {
  if (!selectedId.value) return
  const items = getNavMenuItems()
  items.push({
    id: `menu_${Date.now()}`,
    text: '新菜单',
    url: '#'
  })
  const menuItemsStr = items.map(item => `${item.text}|${item.url}`).join('\n')
  updateComponentProps(selectedId.value, { menuItems: menuItemsStr })
}

// 删除导航菜单项
function removeNavMenuItem(index) {
  if (!selectedId.value) return
  const items = getNavMenuItems()
  items.splice(index, 1)
  const menuItemsStr = items.map(item => `${item.text}|${item.url}`).join('\n')
  updateComponentProps(selectedId.value, { menuItems: menuItemsStr })
}

// 更新导航菜单项
function updateNavMenuItem(index, field, value) {
  if (!selectedId.value) return
  const items = getNavMenuItems()
  if (items[index]) {
    items[index][field] = value
    const menuItemsStr = items.map(item => `${item.text}|${item.url}`).join('\n')
    updateComponentProps(selectedId.value, { menuItems: menuItemsStr })
  }
}

// 解析面包屑导航项
function getBreadcrumbItems() {
  if (!selectedComponent.value) return []
  const itemsStr = selectedComponent.value.props?.items || '首页|#'
  return itemsStr.split('\n').filter(item => item.trim()).map((item, index) => {
    const [text, url] = item.split('|')
    return {
      id: `crumb_${index}`,
      text: text?.trim() || '',
      url: url?.trim() || '#'
    }
  })
}

// 添加面包屑导航项
function addBreadcrumbItem() {
  if (!selectedId.value) return
  const items = getBreadcrumbItems()
  items.push({
    id: `crumb_${Date.now()}`,
    text: '导航项',
    url: '#'
  })
  const itemsStr = items.map(item => `${item.text}|${item.url}`).join('\n')
  updateComponentProps(selectedId.value, { items: itemsStr })
}

// 删除面包屑导航项
function removeBreadcrumbItem(index) {
  if (!selectedId.value) return
  const items = getBreadcrumbItems()
  items.splice(index, 1)
  const itemsStr = items.map(item => `${item.text}|${item.url}`).join('\n')
  updateComponentProps(selectedId.value, { items: itemsStr })
}

// 更新面包屑导航项
function updateBreadcrumbItem(index, field, value) {
  if (!selectedId.value) return
  const items = getBreadcrumbItems()
  if (items[index]) {
    items[index][field] = value
    const itemsStr = items.map(item => `${item.text}|${item.url}`).join('\n')
    updateComponentProps(selectedId.value, { items: itemsStr })
  }
}

// 解析标签页项
function getTabsItems() {
  if (!selectedComponent.value) return []
  const tabsStr = selectedComponent.value.props?.tabs || '标签一|tab1'
  const tabContents = selectedComponent.value.props?.tabContents || {}
  const tabImages = selectedComponent.value.props?.tabImages || {}
  return tabsStr.split('\n').filter(item => item.trim()).map((item, index) => {
    const [text, key] = item.split('|')
    const tabKey = key?.trim() || `tab${index + 1}`
    const imageConfig = tabImages[tabKey] || {}
    return {
      id: `tab_${index}`,
      text: text?.trim() || '',
      key: tabKey,
      content: tabContents[tabKey] || `${text?.trim() || '标签' + (index + 1)}的内容`,
      imageUrl: imageConfig.url || '',
      imageWidth: imageConfig.width || '',
      imageHeight: imageConfig.height || '',
      imageBorderRadius: imageConfig.borderRadius || '',
      isLocalImage: imageConfig.isLocalImage || false,
      imageFileName: imageConfig.fileName || ''
    }
  })
}

// 添加标签页项
function addTabsItem() {
  if (!selectedId.value) return
  const items = getTabsItems()
  const newKey = `tab${items.length + 1}`
  items.push({
    id: `tab_${Date.now()}`,
    text: '新标签',
    key: newKey,
    content: '新标签的内容'
  })
  const tabsStr = items.map(item => `${item.text}|${item.key}`).join('\n')
  const tabContents = {}
  items.forEach(item => {
    tabContents[item.key] = item.content
  })
  updateComponentProps(selectedId.value, { tabs: tabsStr, tabContents })
}

// 删除标签页项
function removeTabsItem(index) {
  if (!selectedId.value) return
  const items = getTabsItems()
  if (items[index]) {
    const removedKey = items[index].key
    items.splice(index, 1)
    const tabContents = { ...selectedComponent.value.props?.tabContents }
    delete tabContents[removedKey]
    const tabsStr = items.map(item => `${item.text}|${item.key}`).join('\n')
    updateComponentProps(selectedId.value, { tabs: tabsStr, tabContents })
  }
}

// 更新标签页项
function updateTabsItem(index, field, value) {
  if (!selectedId.value) return
  const items = getTabsItems()
  if (items[index]) {
    // 如果更新了key，需要先保存旧的key
    const oldKey = field === 'key' ? items[index].key : null
    
    // 更新字段值
    items[index][field] = value
    
    // 如果更新了key，需要更新tabContents的键名
    if (field === 'key' && oldKey && oldKey !== value) {
      const tabContents = { ...selectedComponent.value.props?.tabContents }
      const content = tabContents[oldKey]
      delete tabContents[oldKey]
      tabContents[value] = content
      const tabsStr = items.map(item => `${item.text}|${item.key}`).join('\n')
      updateComponentProps(selectedId.value, { tabs: tabsStr, tabContents })
    } else if (field === 'text') {
      // 更新text时不需要更新tabContents
      const tabsStr = items.map(item => `${item.text}|${item.key}`).join('\n')
      updateComponentProps(selectedId.value, { tabs: tabsStr })
    }
  }
}

// 更新标签页内容
function updateTabsContent(index, value) {
  if (!selectedId.value) return
  const items = getTabsItems()
  if (items[index]) {
    const tabContents = { ...selectedComponent.value.props?.tabContents }
    tabContents[items[index].key] = value
    updateComponentProps(selectedId.value, { tabContents })
  }
}

// 更新标签页图片URL
function updateTabsImageUrl(index, value) {
  if (!selectedId.value) return
  const items = getTabsItems()
  if (items[index]) {
    const tabImages = { ...selectedComponent.value.props?.tabImages }
    tabImages[items[index].key] = {
      ...(tabImages[items[index].key] || {}),
      url: value
    }
    updateComponentProps(selectedId.value, { tabImages })
  }
}

// 更新标签页图片宽度
function updateTabsImageWidth(index, value) {
  if (!selectedId.value) return
  const items = getTabsItems()
  if (items[index]) {
    const tabImages = { ...selectedComponent.value.props?.tabImages }
    tabImages[items[index].key] = {
      ...(tabImages[items[index].key] || {}),
      width: value
    }
    updateComponentProps(selectedId.value, { tabImages })
  }
}

// 更新标签页图片高度
function updateTabsImageHeight(index, value) {
  if (!selectedId.value) return
  const items = getTabsItems()
  if (items[index]) {
    const tabImages = { ...selectedComponent.value.props?.tabImages }
    tabImages[items[index].key] = {
      ...(tabImages[items[index].key] || {}),
      height: value
    }
    updateComponentProps(selectedId.value, { tabImages })
  }
}

// 更新标签页图片圆角
function updateTabsImageBorderRadius(index, value) {
  if (!selectedId.value) return
  const items = getTabsItems()
  if (items[index]) {
    const tabImages = { ...selectedComponent.value.props?.tabImages }
    tabImages[items[index].key] = {
      ...(tabImages[items[index].key] || {}),
      borderRadius: value
    }
    updateComponentProps(selectedId.value, { tabImages })
  }
}

// 触发标签页图片选择
function triggerTabsImageSelect(index) {
  const input = document.querySelector(`[data-tabs-image-input="${index}"]`)
  if (input) {
    input.click()
  }
}

// 处理标签页图片选择
function handleTabsImageSelect(index, event) {
  const file = event.target.files[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const base64 = e.target.result
    const items = getTabsItems()
    if (items[index]) {
      const tabImages = { ...selectedComponent.value.props?.tabImages }
      tabImages[items[index].key] = {
        ...(tabImages[items[index].key] || {}),
        url: base64,
        isLocalImage: true,
        fileName: file.name
      }
      updateComponentProps(selectedId.value, { tabImages })
    }
  }
  reader.readAsDataURL(file)
  event.target.value = ''
}

// 清除标签页图片
function clearTabsImage(index) {
  const items = getTabsItems()
  if (items[index]) {
    const tabImages = { ...selectedComponent.value.props?.tabImages }
    if (tabImages[items[index].key]) {
      tabImages[items[index].key] = {
        url: '',
        width: '',
        height: '',
        borderRadius: '',
        isLocalImage: false,
        fileName: ''
      }
      updateComponentProps(selectedId.value, { tabImages })
    }
  }
}

// ==================== 后端代码生成 ====================

// 打开后端代码生成对话框
function openBackendDialog() {
  showBackendDialog.value = true
}

// 生成并下载组件后端代码
function generateBackendCode() {
  if (!selectedComponent.value) return
  
  const component = selectedComponent.value
  let code = ''
  let filename = ''
  const config = getComponentBackendConfig(component.type)
  
  if (selectedCodeType.value === 'entity') {
    code = generateSingleComponentEntity(component, selectedFramework.value)
    filename = getEntityFilename(config.className, selectedFramework.value)
  } else if (selectedCodeType.value === 'abstract') {
    code = generateAbstractClass(config.className, selectedFramework.value)
    filename = getAbstractFilename(config.className, selectedFramework.value)
  } else if (selectedCodeType.value === 'interface') {
    code = generateInterface(config.className, selectedFramework.value)
    filename = getInterfaceFilename(config.className, selectedFramework.value)
  } else if (selectedCodeType.value === 'util') {
    code = generateUtilClass(config.className, selectedFramework.value)
    filename = getUtilFilename(config.className, selectedFramework.value)
  } else if (selectedCodeType.value === 'controller') {
    code = generateSingleComponentController(component, selectedFramework.value)
    filename = getControllerFilename(config.className, selectedFramework.value)
  }
  
  downloadTextFile(code, filename, 'text/plain')
  showBackendDialog.value = false
}

// 获取实体类文件名
function getEntityFilename(className, framework) {
  if (framework === 'springboot') return `${className}.java`
  if (framework === 'express') return `${className}.js`
  if (framework === 'flask') return `${className.toLowerCase()}.py`
  return `${className}.txt`
}

// 获取控制器文件名
function getControllerFilename(className, framework) {
  if (framework === 'springboot') return `${className}Controller.java`
  if (framework === 'express') return `${className.toLowerCase()}Controller.js`
  if (framework === 'flask') return `${className.toLowerCase()}_routes.py`
  return `${className}_controller.txt`
}

// 获取抽象类文件名
function getAbstractFilename(className, framework) {
  if (framework === 'springboot') return `Abstract${className}.java`
  if (framework === 'express') return `Abstract${className}.js`
  if (framework === 'flask') return `abstract_${className.toLowerCase()}.py`
  return `Abstract${className}.txt`
}

// 获取接口文件名
function getInterfaceFilename(className, framework) {
  if (framework === 'springboot') return `I${className}Service.java`
  if (framework === 'express') return `I${className}.js`
  if (framework === 'flask') return `i${className.toLowerCase()}_service.py`
  return `I${className}Service.txt`
}

// 一键生成所有后台代码
function generateAllBackendCodeAtOnce() {
  if (!selectedComponent.value) return
  
  const config = getComponentBackendConfig(selectedComponent.value.type)
  const className = config.className
  
  // 生成所有代码
  const allCode = generateAllBackendCode(className, selectedFramework.value)
  
  // 下载每个文件
  Object.values(allCode).forEach(item => {
    if (item && item.filename && item.content) {
      downloadTextFile(item.content, item.filename, 'text/plain')
    }
  })
  
  showBackendDialog.value = false
}
const shadowCSS = computed(() => {
  if (!selectedComponent.value) return ''
  const style = selectedComponent.value.style
  const x = style?.shadowX || 0
  const y = style?.shadowY || 0
  const blur = style?.shadowBlur || 0
  const color = style?.shadowColor || 'rgba(0,0,0,0.1)'
  if (blur === 0 && x === 0 && y === 0) return '无阴影'
  return `${x}px ${y}px ${blur}px ${color}`
})
</script>

<template>
  <aside class="property-panel">
    <!-- 选中辅助线时显示辅助线属性编辑 -->
    <div v-if="selectedGuide" class="panel-content">
      <div class="panel-header">
        <div class="component-info">
          <span class="component-type">
            <span class="type-icon">辅助</span>
            {{ getGuideTypeName(selectedGuide.type) }}
          </span>
          <div class="component-id">
            <label>辅助线ID:</label>
            <span class="id-value">{{ selectedGuide.id }}</span>
          </div>
        </div>
        <button class="btn-delete" @click="deleteSelectedGuide">删除</button>
      </div>

      <!-- 辅助线属性编辑 -->
      <div class="property-section">
        <h4 class="section-title">辅助线设置</h4>
        <div class="property-list">
          <div class="property-row">
            <label>类型</label>
            <input type="text" class="input" :value="getGuideTypeName(selectedGuide.type)" disabled />
          </div>
          <div class="property-row">
            <label>显示</label>
            <label class="switch">
              <input type="checkbox" :checked="selectedGuide.visible" @change="updateGuideVisible($event.target.checked)" />
              <span class="slider"></span>
            </label>
          </div>
          <div class="property-row">
            <label>固定（锁定）</label>
            <label class="switch">
              <input type="checkbox" :checked="selectedGuide.locked" @change="updateGuideLocked($event.target.checked)" />
              <span class="slider"></span>
            </label>
            <span class="hint-text">{{ selectedGuide.locked ? '锁定后无法选中' : '可正常操作' }}</span>
          </div>
          <div class="property-row">
            <label>颜色</label>
            <input type="color" class="input-color" :value="selectedGuide.color" @input="updateGuideColor($event.target.value)" />
          </div>
          <div class="property-row" v-if="selectedGuide.type === 'rect' || selectedGuide.type === 'triangle'">
            <label>旋转角度</label>
            <div class="input-with-unit">
              <input type="number" class="input" :value="selectedGuide.rotation || 0" @input="updateGuideRotation($event.target.value)" step="1" />
              <span class="unit">°</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 吸附设置 -->
      <div class="property-section">
        <h4 class="section-title">吸附设置</h4>
        <div class="property-list">
          <div class="property-row">
            <label>启用吸附</label>
            <label class="switch">
              <input type="checkbox" :checked="snapEnabled" @change="toggleSnap" />
              <span class="slider"></span>
            </label>
          </div>
          <div class="property-row">
            <label>吸附模式</label>
            <select class="input select" :value="snapMode" @change="setSnapMode($event.target.value)">
              <option value="center">中心吸附</option>
              <option value="edge">边缘吸附</option>
              <option value="both">两者都启用</option>
            </select>
          </div>
          <div class="property-row">
            <label>吸附距离</label>
            <div class="input-with-unit">
              <input type="number" class="input" :value="snapDistance" @input="setSnapDistance(parseInt($event.target.value) || 5)" min="1" max="20" />
              <span class="unit">px</span>
            </div>
          </div>
          <div class="property-row" v-if="snapMode === 'edge' || snapMode === 'both'">
            <label>阻挡距离</label>
            <div class="input-with-unit">
              <input type="number" class="input" :value="snapBlockDistance" @input="setSnapBlockDistance(parseInt($event.target.value) || 30)" min="10" max="100" />
              <span class="unit">px</span>
            </div>
            <span class="hint-text">越过辅助线需要的最小距离</span>
          </div>
        </div>
      </div>

      <!-- 锁定提示 -->
      <div v-if="selectedGuide.locked" class="property-section locked-notice">
        <p>🔒 此辅助线已锁定，无法通过画布操作</p>
        <p>如需操作，请先在设置中解除锁定</p>
      </div>

      <!-- 关闭辅助线编辑 -->
      <div class="property-section">
        <button class="btn-secondary" @click="deselectGuide">取消选择</button>
      </div>
    </div>

    <!-- 没有选中辅助线时 -->
    <div v-else-if="!selectedComponent" class="no-selection">
      <h4 class="section-title">📄 页面设置</h4>
      <div class="property-list">
        <div class="property-row">
          <label>页面名称</label>
          <input type="text" class="input" :value="page.name" @input="updatePageName($event.target.value)" />
        </div>
        <div class="property-row">
          <label>页面宽度</label>
          <input type="number" class="input" :value="page.width" @input="updatePageWidth($event.target.value)" min="320" />
        </div>
        <div class="property-row">
          <label>页面高度</label>
          <input type="number" class="input" :value="page.height" @input="updatePageHeight($event.target.value)" min="200" />
        </div>
        <div class="property-row">
          <label>背景颜色</label>
          <input type="color" class="input-color" :value="page.backgroundColor" @input="updatePageBgColor($event.target.value)" />
        </div>
        <div class="preset-sizes">
          <label>预设尺寸</label>
          <div class="preset-buttons">
            <button v-for="preset in presetSizes" :key="preset.name" @click="applyPreset(preset)">
              {{ preset.name }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="panel-content">
      <!-- 组件信息头部 -->
      <div class="panel-header">
        <div class="component-info">
          <span class="component-type">
            <span class="type-icon">{{ selectedComponent.type === 'text' ? 'T' : selectedComponent.type === 'image' ? '图' : selectedComponent.type === 'button' ? '钮' : selectedComponent.type === 'container' ? '框' : selectedComponent.type === 'link' ? '链' : selectedComponent.type === 'loginForm' ? '登' : selectedComponent.type === 'registerForm' ? '注' : selectedComponent.type === 'contactForm' ? '联' : selectedComponent.type === 'searchForm' ? '搜' : selectedComponent.type === 'commentForm' ? '评' : '☰' }}</span>
            {{ selectedComponent.name }}
          </span>
          <div class="component-id">
            <label>组件ID:</label>
            <span class="id-value">{{ selectedComponent.id }}</span>
            <button class="btn-copy" @click="copyComponentId" title="复制ID">复制</button>
          </div>
        </div>
        <button class="btn-delete" @click="handleDelete">删除</button>
      </div>

      <!-- 位置和尺寸 -->
      <div class="property-section">
        <h4 class="section-title">📐 位置和尺寸</h4>
        <div class="property-grid-4">
          <div class="property-item">
            <label>X</label>
            <input type="number" class="input" :value="Math.round(selectedComponent.left)" @input="updatePosition('left', $event.target.value)" />
          </div>
          <div class="property-item">
            <label>Y</label>
            <input type="number" class="input" :value="Math.round(selectedComponent.top)" @input="updatePosition('top', $event.target.value)" />
          </div>
          <div class="property-item">
            <label>宽</label>
            <input type="number" class="input" :value="Math.round(selectedComponent.width)" @input="updatePosition('width', $event.target.value)" />
          </div>
          <div class="property-item">
            <label>高</label>
            <input type="number" class="input" :value="Math.round(selectedComponent.height)" @input="updatePosition('height', $event.target.value)" />
          </div>
        </div>
      </div>

      <!-- 文字样式（仅文本、按钮、链接显示） -->
      <div v-if="['text', 'button', 'link', 'list'].includes(selectedComponent.type)" class="property-section">
        <h4 class="section-title">📝 文字样式</h4>
        <div class="property-list">
          <div v-for="field in textStyleFields" :key="field.key" class="property-row">
            <label>{{ field.label }}</label>
            <select v-if="field.type === 'select'" class="input" :value="getStyleValue(field.key)" @change="updateStyle(field.key, $event.target.value)">
              <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
            </select>
            <input v-else-if="field.type === 'number'" type="number" class="input" :value="getStyleValue(field.key)" :min="field.min" :max="field.max" :step="field.step || 1" @input="updateStyle(field.key, parseFloat($event.target.value))" />
            <input v-else-if="field.type === 'color'" type="color" class="input-color" :value="getStyleValue(field.key) || '#000000'" @input="updateStyle(field.key, $event.target.value)" />
          </div>
        </div>
      </div>

      <!-- 边框样式（容器和图片除外） -->
      <div v-if="selectedComponent.type !== 'container' && selectedComponent.type !== 'image'" class="property-section">
        <h4 class="section-title">🔲 边框样式</h4>
        <div class="property-list">
          <div v-for="field in borderStyleFields" :key="field.key" class="property-row">
            <label>{{ field.label }}</label>
            <select v-if="field.type === 'select'" class="input" :value="getStyleValue(field.key) || 'none'" @change="updateStyle(field.key, $event.target.value)">
              <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
            </select>
            <input v-else-if="field.type === 'number'" type="number" class="input" :value="getStyleValue(field.key) || 0" :min="field.min" :max="field.max" @input="updateStyle(field.key, parseFloat($event.target.value))" />
            <input v-else-if="field.type === 'color'" type="color" class="input-color" :value="getStyleValue(field.key) || '#000000'" @input="updateStyle(field.key, $event.target.value)" />
          </div>
        </div>
      </div>

      <!-- 层级设置 -->
      <div class="property-section">
        <h4 class="section-title">📊 层级设置</h4>
        <div class="property-list">
          <div class="property-row">
            <label>层级（1-5）</label>
            <div class="z-index-selector">
              <button
                v-for="level in 5"
                :key="level"
                :class="{ active: selectedComponent.zIndex === level }"
                @click="updateZIndex(level)"
              >
                {{ level }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 背景样式 -->
      <div class="property-section">
        <h4 class="section-title">🎨 背景样式</h4>
        <div class="property-list">
          <div v-for="field in backgroundStyleFields" :key="field.key" class="property-row">
            <label>{{ field.label }}</label>
            <input v-if="field.type === 'number'" type="number" class="input" :value="getStyleValue(field.key) || 1" :min="field.min" :max="field.max" :step="field.step" @input="updateStyle(field.key, parseFloat($event.target.value))" />
            <input v-else-if="field.type === 'color'" type="color" class="input-color" :value="getStyleValue(field.key) || '#ffffff'" @input="updateStyle(field.key, $event.target.value)" />
          </div>
          <!-- 按钮组件特有的交互状态背景颜色 -->
          <div v-if="selectedComponent.type === 'button'" class="property-row">
            <label>悬停背景色</label>
            <input type="color" class="input-color" :value="getStyleValue('hoverBackgroundColor') || '#40a9ff'" @input="updateStyle('hoverBackgroundColor', $event.target.value)" />
          </div>
          <div v-if="selectedComponent.type === 'button'" class="property-row">
            <label>点击背景色</label>
            <input type="color" class="input-color" :value="getStyleValue('activeBackgroundColor') || '#096dd9'" @input="updateStyle('activeBackgroundColor', $event.target.value)" />
          </div>
        </div>
      </div>

      <!-- 间距样式 -->
      <div class="property-section">
        <h4 class="section-title">↔️ 间距样式</h4>
        <div class="property-list">
          <div v-for="field in spacingStyleFields" :key="field.key" class="property-row">
            <label>{{ field.label }}</label>
            <input type="number" class="input" :value="getStyleValue(field.key) || 0" :min="field.min" :max="field.max" @input="updateStyle(field.key, parseFloat($event.target.value))" />
          </div>
        </div>
      </div>

      <!-- 效果样式（链接除外） -->
      <div v-if="selectedComponent.type !== 'link'" class="property-section">
        <h4 class="section-title">✨ 效果样式</h4>
        <div class="property-list">
          <div v-for="field in effectStyleFields" :key="field.key" class="property-row">
            <label>{{ field.label }}</label>
            <input v-if="field.type === 'number'" type="number" class="input" :value="getStyleValue(field.key) || 0" :min="field.min" :max="field.max" @input="updateStyle(field.key, parseFloat($event.target.value))" />
            <input v-else-if="field.type === 'color'" type="color" class="input-color" :value="getStyleValue(field.key) || 'rgba(0,0,0,0.1)'" @input="updateStyle(field.key, $event.target.value)" />
          </div>
          <div class="shadow-preview">
            <label>阴影预览</label>
            <div class="preview-box" :style="{ boxShadow: shadowCSS.includes('无') ? 'none' : shadowCSS }">
              {{ shadowCSS }}
            </div>
          </div>
        </div>
      </div>

      <!-- 组件特有属性 -->
      <div v-if="propsFields.length > 0" class="property-section">
        <h4 class="section-title">⚙️ 内容设置</h4>
        <div class="property-list">
          <div 
            v-for="field in propsFields" 
            :key="field.key" 
            class="property-row"
            v-show="isFieldVisible(field)"
          >
            <label>{{ field.label }}</label>
            <select v-if="field.type === 'select'" class="input" :value="getPropsValue(field.key)" @change="updateProps(field.key, $event.target.value)">
              <option 
                v-for="opt in field.options" 
                :key="typeof opt === 'object' ? opt.value : opt" 
                :value="typeof opt === 'object' ? opt.value : opt"
              >
                {{ typeof opt === 'object' ? opt.label : opt }}
              </option>
            </select>
            <textarea v-else-if="field.type === 'textarea'" class="input textarea" :value="getPropsValue(field.key)" @input="updateProps(field.key, $event.target.value)" rows="3"></textarea>
            <input v-else-if="field.type === 'text'" type="text" class="input" :value="field.key === 'items' ? (selectedComponent.props?.[field.key] || []).join(', ') : getPropsValue(field.key)" @input="updateProps(field.key, $event.target.value)" />
            <input v-else-if="field.type === 'checkbox'" type="checkbox" class="input-checkbox" :checked="getPropsValue(field.key)" @change="updateProps(field.key, $event.target.checked)" />
          </div>

          <div v-if="selectedComponent.type === 'image'" class="image-upload-section">
            <input
              ref="imageFileInput"
              type="file"
              accept="image/*"
              style="display: none"
              @change="handleImageSelect"
            />
            <button class="btn-upload" @click="triggerImageSelect">
              📁 选择本地图片
            </button>
            <button v-if="selectedComponent.props?.localImage" class="btn-clear" @click="clearLocalImage">
              ✖ 清除
            </button>
            <div v-if="selectedComponent.props?.localImage" class="image-info">
              <span class="image-name">{{ selectedComponent.props?.imageFileName }}</span>
              <span class="image-badge">本地图片</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 自定义表单项管理（仅自定义表单显示） -->
      <div v-if="selectedComponent.type === 'customForm'" class="property-section">
        <h4 class="section-title">📝 表单项配置</h4>
        <div class="custom-form-items">
          <div v-for="(item, index) in selectedComponent.props?.formItems || []" :key="item.id || index" class="form-item-editor">
            <div class="form-item-header">
              <span>{{ item.type === 'description' ? '文字描述 ' : '表单项 ' }}{{ index + 1 }}</span>
              <button class="btn-remove-item" @click="removeFormItem(index)">删除</button>
            </div>
            <div class="form-item-fields">
              <select :value="item.type" class="input" @change="(e) => { item.type = e.target.value; updateFormItems(); }">
                <option value="text">文本框</option>
                <option value="email">邮箱</option>
                <option value="tel">电话</option>
                <option value="password">密码</option>
                <option value="textarea">文本域</option>
                <option value="select">下拉框</option>
                <option value="checkbox">复选框</option>
                <option value="radio">单选框</option>
                <option value="description">文字描述</option>
              </select>
              
              <!-- 表单项配置 -->
              <template v-if="item.type !== 'description'">
                <input type="text" :value="item.label" class="input" placeholder="标签文字" @input="(e) => { item.label = e.target.value; updateFormItems(); }" />
                <input type="text" :value="item.placeholder" class="input" placeholder="占位符" @input="(e) => { item.placeholder = e.target.value; updateFormItems(); }" />
                <label class="checkbox-label">
                  <input type="checkbox" :checked="item.required" @change="(e) => { item.required = e.target.checked; updateFormItems(); }" />
                  必填
                </label>
                <div v-if="item.type === 'select' || item.type === 'radio'" class="options-editor">
                  <label class="form-label">选项（格式：value|label，每行一个）:</label>
                  <textarea 
                    :value="getOptionsText(item)" 
                    class="input textarea" 
                    rows="3"
                    placeholder="选项1|选项1
选项2|选项2"
                    @input="(e) => { item.optionsText = e.target.value; updateFormItems(); }"
                  ></textarea>
                </div>
              </template>
              
              <!-- 文字描述配置 -->
              <template v-else>
                <textarea 
                  :value="item.label" 
                  class="input textarea" 
                  rows="3"
                  placeholder="请输入描述文本..."
                  @input="(e) => { item.label = e.target.value; updateFormItems(); }" 
                ></textarea>
                <input type="text" :value="item.color || '#333333'" class="input color-picker" placeholder="文字颜色" @input="(e) => { item.color = e.target.value; updateFormItems(); }" />
                <input type="number" :value="item.fontSize || 14" class="input" placeholder="字体大小(px)" @input="(e) => { item.fontSize = parseInt(e.target.value) || 14; updateFormItems(); }" />
                <select :value="item.textAlign || 'left'" class="input" @change="(e) => { item.textAlign = e.target.value; updateFormItems(); }">
                  <option value="left">左对齐</option>
                  <option value="center">居中</option>
                  <option value="right">右对齐</option>
                </select>
                <input type="text" :value="item.bgColor || '#f5f5f5'" class="input color-picker" placeholder="背景颜色" @input="(e) => { item.bgColor = e.target.value; updateFormItems(); }" />
              </template>
            </div>
          </div>
          
          <!-- 添加按钮 -->
          <div class="add-item-options">
            <button class="btn-add-item btn-add-form-item" @click="addFormItem('text')">
              + 添加表单项
            </button>
            <button class="btn-add-item btn-add-description" @click="addFormItem('description')">
              + 添加文字描述
            </button>
          </div>
        </div>
      </div>

      <!-- 导航菜单配置 -->
      <div v-if="selectedComponent.type === 'navMenu'" class="property-section">
        <h4 class="section-title">🔗 菜单项配置</h4>
        <div class="custom-form-items">
          <div v-for="(item, index) in getNavMenuItems()" :key="item.id" class="form-item-editor">
            <div class="form-item-header">
              <span>菜单 {{ index + 1 }}</span>
              <button class="btn-remove-item" @click="removeNavMenuItem(index)">删除</button>
            </div>
            <div class="form-item-fields">
              <input type="text" :value="item.text" class="input" placeholder="菜单名称，如：关于我们" @input="(e) => updateNavMenuItem(index, 'text', e.target.value)" />
              <input type="text" :value="item.url" class="input" placeholder="跳转链接，如：#about 或 https://example.com" @input="(e) => updateNavMenuItem(index, 'url', e.target.value)" />
            </div>
          </div>
          <button class="btn-add-item" @click="addNavMenuItem">+ 添加菜单项</button>
        </div>
      </div>

      <!-- 面包屑配置 -->
      <div v-if="selectedComponent.type === 'breadcrumb'" class="property-section">
        <h4 class="section-title">🧭 导航项配置</h4>
        <div class="custom-form-items">
          <div v-for="(item, index) in getBreadcrumbItems()" :key="item.id" class="form-item-editor">
            <div class="form-item-header">
              <span>导航 {{ index + 1 }}</span>
              <button class="btn-remove-item" @click="removeBreadcrumbItem(index)">删除</button>
            </div>
            <div class="form-item-fields">
              <input type="text" :value="item.text" class="input" placeholder="显示文字，如：产品详情" @input="(e) => updateBreadcrumbItem(index, 'text', e.target.value)" />
              <input type="text" :value="item.url" class="input" placeholder="跳转链接，如：#product 或 https://example.com" @input="(e) => updateBreadcrumbItem(index, 'url', e.target.value)" />
            </div>
          </div>
          <button class="btn-add-item" @click="addBreadcrumbItem">+ 添加导航项</button>
        </div>
      </div>

      <!-- 标签页配置 -->
      <div v-if="selectedComponent.type === 'tabs'" class="property-section">
        <h4 class="section-title">📑 标签页配置</h4>
        <div class="custom-form-items">
          <div v-for="(item, index) in getTabsItems()" :key="item.id" class="form-item-editor">
            <div class="form-item-header">
              <span>标签 {{ index + 1 }}</span>
              <button class="btn-remove-item" @click="removeTabsItem(index)">删除</button>
            </div>
            <div class="form-item-fields">
              <input type="text" :value="item.text" class="input" placeholder="标签名称，如：产品介绍" @input="(e) => updateTabsItem(index, 'text', e.target.value)" />
              <input type="text" :value="item.key" class="input" placeholder="标签唯一标识，如：product（英文）" @input="(e) => updateTabsItem(index, 'key', e.target.value)" />
              <textarea :value="item.content" class="input textarea" placeholder="标签内容，如：请输入产品介绍内容" @input="(e) => updateTabsContent(index, e.target.value)" rows="3"></textarea>
            </div>
            <div class="form-item-fields" style="margin-top: 10px; border-top: 1px dashed #eee; padding-top: 10px;">
              <span style="font-size: 12px; color: #999; margin-bottom: 8px; display: block;">🖼️ 图片配置（可选）</span>
              <input type="text" :value="item.imageUrl" class="input" placeholder="图片URL" @input="(e) => updateTabsImageUrl(index, e.target.value)" />
              <div style="display: flex; gap: 8px;">
                <input type="text" :value="item.imageWidth" class="input" placeholder="宽度（如：300px）" @input="(e) => updateTabsImageWidth(index, e.target.value)" style="flex: 1;" />
                <input type="text" :value="item.imageHeight" class="input" placeholder="高度（如：200px）" @input="(e) => updateTabsImageHeight(index, e.target.value)" style="flex: 1;" />
              </div>
              <input type="text" :value="item.imageBorderRadius" class="input" placeholder="圆角（如：8px）" @input="(e) => updateTabsImageBorderRadius(index, e.target.value)" />
              <!-- 本地图片上传 -->
              <div style="display: flex; gap: 8px; margin-top: 8px;">
                <input
                  type="file"
                  accept="image/*"
                  style="display: none"
                  :data-tabs-image-input="index"
                  @change="(e) => handleTabsImageSelect(index, e)"
                />
                <button class="btn-upload" style="flex: 1;" @click="triggerTabsImageSelect(index)">
                  📁 选择本地图片
                </button>
                <button v-if="item.imageUrl && item.isLocalImage" class="btn-clear" @click="clearTabsImage(index)">
                  ✖ 清除
                </button>
              </div>
              <div v-if="item.imageUrl && item.isLocalImage" class="image-info">
                <span class="image-name">{{ item.imageFileName }}</span>
              </div>
            </div>
          </div>
          <button class="btn-add-item" @click="addTabsItem">+ 添加标签页</button>
        </div>
      </div>

      <!-- 后端代码生成 -->
      <div v-if="hasBackendSupport" class="property-section">
        <h4 class="section-title">🔧 后端代码生成</h4>
        <div class="property-list">
          <button class="btn-backend" @click="openBackendDialog">
            ⚙️ 生成后端代码
          </button>
        </div>
      </div>
    </div>

    <!-- 后端代码生成对话框 -->
    <div v-if="showBackendDialog" class="modal-overlay" @click="showBackendDialog = false">
      <div class="modal-dialog" @click.stop>
        <div class="modal-header">
          <h3>⚙️ 生成{{ getComponentBackendConfig(selectedComponent?.type)?.description }}后端代码</h3>
          <button class="modal-close" @click="showBackendDialog = false">×</button>
        </div>
        
        <div class="modal-body">
          <!-- 选择生成类型 -->
          <div class="form-group">
            <label class="form-label">生成类型:</label>
            <select v-model="selectedCodeType" class="form-select">
              <option value="entity">实体类</option>
              <option value="abstract">抽象类</option>
              <option value="interface">接口</option>
              <option value="util">工具类</option>
              <option value="controller">API 控制器</option>
            </select>
          </div>

          <!-- 选择后端框架 -->
          <div class="form-group">
            <label class="form-label">后端框架:</label>
            <select v-model="selectedFramework" class="form-select">
              <option v-for="opt in frameworkOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>

          <!-- 组件信息 -->
          <div class="form-hint">
            <p>组件类型: {{ selectedComponent?.name }}</p>
            <p>生成类名: {{ getComponentBackendConfig(selectedComponent?.type)?.className }}</p>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showBackendDialog = false">
            取消
          </button>
          <button class="btn btn-primary" @click="generateBackendCode">
            生成并下载
          </button>
          <button class="btn btn-success" @click="generateAllBackendCodeAtOnce">
            ⚡ 一键生成所有代码
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.property-panel {
  width: 320px;
  background-color: var(--color-bg-white);
  border-left: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
}

.no-selection {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  font-size: 14px;
  gap: 8px;
}

.hint {
  font-size: 12px;
  color: #999;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 12px;
}

.component-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.component-type {
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.type-icon {
  font-size: 16px;
}

.component-id {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  background-color: var(--color-bg);
  padding: 6px 8px;
  border-radius: 4px;
  border: 1px solid var(--color-border);
}

.component-id label {
  color: var(--color-text-secondary);
  font-weight: 500;
}

.id-value {
  font-family: 'Courier New', monospace;
  color: var(--color-primary);
  font-weight: 600;
  background-color: #f0f0f0;
  padding: 2px 6px;
  border-radius: 3px;
  user-select: all;
}

.btn-copy {
  padding: 2px 8px;
  background-color: var(--color-primary);
  color: #ffffff;
  border: none;
  border-radius: 3px;
  font-size: 11px;
  cursor: pointer;
  transition: opacity 0.2s;
  white-space: nowrap;
}

.btn-copy:hover {
  opacity: 0.85;
}

.btn-delete {
  padding: 6px 14px;
  background-color: var(--color-danger);
  color: #ffffff;
  border: none;
  border-radius: var(--border-radius);
  font-size: 12px;
  cursor: pointer;
  transition: opacity 0.2s;
  white-space: nowrap;
}

.btn-delete:hover {
  opacity: 0.85;
}

.property-section {
  margin-bottom: 16px;
  padding: 10px;
  background-color: #fafafa;
  border-radius: 6px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 10px;
}

.property-grid-4 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.property-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.property-item label {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.property-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.property-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.property-row label {
  font-size: 12px;
  color: var(--color-text-secondary);
  min-width: 70px;
  flex-shrink: 0;
}

.input {
  flex: 1;
  padding: 6px 8px;
  font-size: 13px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  outline: none;
  transition: border-color 0.2s;
}

.input:focus {
  border-color: var(--color-primary);
}

.textarea {
  resize: vertical;
  min-height: 60px;
}

.input-color {
  flex: 1;
  height: 28px;
  padding: 2px;
  cursor: pointer;
  border: 1px solid var(--color-border);
  border-radius: 4px;
}

.input-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.shadow-preview {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
}

.shadow-preview label {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.preview-box {
  padding: 12px;
  background-color: #fff;
  border-radius: 4px;
  font-size: 11px;
  color: #666;
  text-align: center;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 图片上传区域 */
.image-upload-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #ddd;
}

.btn-upload {
  padding: 8px 16px;
  background-color: var(--color-primary);
  color: #ffffff;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-upload:hover {
  opacity: 0.9;
}

.btn-clear {
  padding: 6px 12px;
  background-color: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-clear:hover {
  background-color: #eee;
}

/* 自定义表单项管理 */
.custom-form-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-item-editor {
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  padding: 12px;
  background-color: var(--color-bg);
}

.form-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 500;
  font-size: 14px;
}

.btn-remove-item {
  padding: 4px 12px;
  background-color: var(--color-danger);
  color: #ffffff;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-remove-item:hover {
  opacity: 0.9;
}

.form-item-fields {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text);
  cursor: pointer;
}

.options-editor {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
}

.btn-add-item {
  padding: 10px;
  background-color: var(--color-primary);
  color: #ffffff;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-add-item:hover {
  opacity: 0.9;
}

.image-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.image-name {
  color: var(--color-text-secondary);
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-badge {
  background-color: #e6f7ff;
  color: #1890ff;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
}

/* 层级选择器 */
.z-index-selector {
  display: flex;
  gap: 4px;
}

.z-index-selector button {
  width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.z-index-selector button:hover {
  border-color: var(--color-primary);
  background-color: #e6f7ff;
}

.z-index-selector button.active {
  background-color: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}

/* 预设尺寸按钮 */
.preset-sizes {
  margin-top: 8px;
}

.preset-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.preset-buttons button {
  padding: 4px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
}

.preset-buttons button:hover {
  border-color: var(--color-primary);
  background-color: #e6f7ff;
  color: var(--color-primary);
}

/* 辅助线属性面板样式 */
.locked-notice {
  background-color: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 4px;
  padding: 12px;
}

.locked-notice p {
  margin: 0;
  font-size: 12px;
  color: #ad6800;
  line-height: 1.6;
}

.hint-text {
  font-size: 11px;
  color: #999;
  margin-left: 8px;
}

/* 开关样式 */
.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.3s;
  border-radius: 22px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #1890ff;
}

input:checked + .slider:before {
  transform: translateX(18px);
}

.input-with-unit {
  display: flex;
  align-items: center;
  gap: 4px;
}

.input-with-unit .input {
  flex: 1;
}

.input-with-unit .unit {
  font-size: 12px;
  color: #666;
}

.btn-secondary {
  width: 100%;
  padding: 8px;
  background-color: #f5f5f5;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  color: #666;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background-color: #e6e6e6;
  border-color: #bfbfbf;
}
</style>