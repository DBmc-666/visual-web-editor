/**
 * @file 编辑器状态管理模块
 * @description 基于 Vue 3 reactive 的状态管理实现，包含组件配置、页面状态、历史记录等核心功能
 * @note 后期可平滑迁移到 Pinia 状态管理库
 */

import { reactive, computed } from 'vue'
import { generateId, generatePageId } from '../utils/idGenerator'

/**
 * 组件类型枚举
 * @enum {string}
 */
export const COMPONENT_TYPES = {
  // ========== 基础组件 ==========
  TEXT: 'text',           // 文本组件
  IMAGE: 'image',         // 图片组件
  BUTTON: 'button',       // 按钮组件
  CONTAINER: 'container', // 容器/背景组件
  LINK: 'link',           // 链接组件
  DATETIME: 'datetime',   // 日期时间组件
  
  // ========== 导航组件 ==========
  NAV_MENU: 'navMenu',    // 导航菜单
  BREADCRUMB: 'breadcrumb',// 面包屑导航
  TABS: 'tabs'            // 标签页组件
}

/**
 * 组件分类配置
 * @type {Object}
 * @property {Object} basic - 基础组件分类
 * @property {Object} form - 预设表单分类
 * @property {Object} navigation - 导航组件分类
 */
export const COMPONENT_CATEGORIES = {
  basic: {
    name: '基础组件',
    icon: '📦',
    components: ['text', 'image', 'button', 'container', 'link', 'datetime']
  },
  form: {
    name: '预设表单',
    icon: '📋',
    components: ['loginForm', 'registerForm', 'contactForm', 'searchForm', 'commentForm', 'customForm']
  },
  navigation: {
    name: '导航组件',
    icon: '🧭',
    components: ['navMenu', 'breadcrumb', 'tabs']
  }
}

/**
 * 组件默认配置
 * 包含所有组件的初始尺寸、样式和属性配置
 * @type {Object<string, ComponentDefaultConfig>}
 */
export const COMPONENT_DEFAULTS = {
  /**
   * 文本组件 - 用于显示和编辑文本内容
   */
  text: {
    name: '文本',
    width: 200,
    height: 40,
    style: {
      fontSize: 16,
      color: '#333333',
      backgroundColor: 'transparent'
    },
    props: {
      content: '双击编辑文本',  // 默认显示文本
      textAlign: 'left',       // 文本对齐方式
      hasLink: false,          // 是否包含链接
      href: '#',               // 链接地址
      target: '_self'          // 链接打开方式
    }
  },

  /**
   * 图片组件 - 用于展示图片内容
   */
  image: {
    name: '图片',
    width: 200,
    height: 150,
    style: {
      backgroundColor: '#f0f0f0'  // 默认背景色（占位时显示）
    },
    props: {
      src: 'https://via.placeholder.com/200x150',  // 默认占位图片
      alt: '图片',          // 图片替代文本
      objectFit: 'contain'  // 图片缩放方式
    }
  },

  /**
   * 按钮组件 - 用于触发交互行为
   */
  button: {
    name: '按钮',
    width: 120,
    height: 40,
    style: {
      backgroundColor: '#1890ff',      // 按钮背景色
      hoverBackgroundColor: '#40a9ff', // 悬停背景色
      activeBackgroundColor: '#096dd9',// 点击背景色
      color: '#ffffff',                // 文字颜色
      fontSize: 14,
      borderRadius: 4,
      textAlign: 'center'
    },
    props: {
      content: '按钮',                    // 按钮文字
      actionType: 'link',                // 点击行为: 'link' | 'alert' | 'api'
      href: '#',                         // 跳转链接（actionType='link'时生效）
      target: '_self',                   // 链接打开方式
      alertMessage: '点击了按钮',         // 弹窗提示内容（actionType='alert'时生效）
      apiConfig: {                       // API配置（actionType='api'时生效）
        url: '',
        method: 'POST',
        headers: {},
        body: {}
      }
    }
  },

  /**
   * 容器组件 - 用于创建纯色背景区域
   */
  container: {
    name: '纯色背景',
    width: 300,
    height: 200,
    style: {
      backgroundColor: '#f5f5f5',
      padding: 20,
      borderRadius: 8
    },
    props: {}
  },

  // ==================== 预设表单组件 ====================

  /**
   * 登录表单组件
   */
  loginForm: {
    name: '登录表单',
    width: 400,
    height: 320,
    style: {
      backgroundColor: '#ffffff',
      padding: 30,
      borderRadius: 12,
      border: '1px solid #e8e8e8',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    },
    props: {
      title: '用户登录',
      submitText: '登录',
      showRemember: true,      // 是否显示"记住我"选项
      rememberText: '记住我',
      showForgot: true,        // 是否显示"忘记密码"链接
      forgotText: '忘记密码？',
      forgotLink: '#',
      apiUrl: '/api/login',
      apiMethod: 'POST'
    }
  },

  /**
   * 注册表单组件
   */
  registerForm: {
    name: '注册表单',
    width: 450,
    height: 450,
    style: {
      backgroundColor: '#ffffff',
      padding: 30,
      borderRadius: 12,
      border: '1px solid #e8e8e8',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    },
    props: {
      title: '用户注册',
      submitText: '注册',
      showAgreement: true,     // 是否显示用户协议
      agreementText: '我已阅读并同意',
      agreementLink: '#',
      agreementRequired: true, // 是否必须同意协议才能提交
      apiUrl: '/api/register',
      apiMethod: 'POST'
    }
  },

  /**
   * 联系表单组件
   */
  contactForm: {
    name: '联系表单',
    width: 500,
    height: 400,
    style: {
      backgroundColor: '#ffffff',
      padding: 30,
      borderRadius: 12,
      border: '1px solid #e8e8e8',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    },
    props: {
      title: '联系我们',
      showName: true, nameLabel: '姓名', namePlaceholder: '请输入您的姓名', nameRequired: true,
      showEmail: true, emailLabel: '邮箱', emailPlaceholder: '请输入您的邮箱', emailRequired: true,
      showPhone: true, phoneLabel: '电话', phonePlaceholder: '请输入您的电话', phoneRequired: false,
      showSubject: true, subjectLabel: '主题', subjectPlaceholder: '请输入主题', subjectRequired: true,
      showMessage: true, messageLabel: '留言', messagePlaceholder: '请输入留言内容', messageRequired: true,
      messageRows: 5,
      submitText: '提交',
      apiUrl: '/api/contact',
      apiMethod: 'POST'
    }
  },

  /**
   * 搜索表单组件
   */
  searchForm: {
    name: '搜索表单',
    width: 500,
    height: 80,
    style: {
      backgroundColor: '#f8f9fa',
      padding: 15,
      borderRadius: 8
    },
    props: {
      placeholder: '搜索...',
      buttonText: '搜索',
      showCategory: true,           // 是否显示分类选择
      categoryLabel: '分类',
      categoryOptions: '全部|全部\n新闻|新闻\n产品|产品\n案例|案例',
      apiUrl: '/api/search',
      apiMethod: 'GET'
    }
  },

  /**
   * 评论表单组件
   */
  commentForm: {
    name: '评论表单',
    width: 600,
    height: 180,
    style: {
      backgroundColor: '#ffffff',
      padding: 20,
      borderRadius: 8,
      border: '1px solid #e8e8e8'
    },
    props: {
      title: '发表评论',
      showRating: true,              // 是否显示评分
      ratingLabel: '评分',
      maxRating: 5,                 // 最大评分
      showAuthor: true, authorLabel: '昵称', authorPlaceholder: '请输入昵称', authorRequired: true,
      showEmail: true, emailLabel: '邮箱', emailPlaceholder: '请输入邮箱（不公开）', emailRequired: false,
      messageLabel: '评论内容',
      messagePlaceholder: '请输入您的评论...',
      messageRequired: true,
      messageRows: 3,
      submitText: '提交评论',
      apiUrl: '/api/comment',
      apiMethod: 'POST'
    }
  },

  /**
   * 自定义表单组件 - 支持动态配置表单项
   */
  customForm: {
    name: '自定义表单',
    width: 500,
    height: 400,
    style: {
      backgroundColor: '#ffffff',
      padding: 30,
      borderRadius: 12,
      border: '1px solid #e8e8e8',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    },
    props: {
      title: '自定义表单',
      submitText: '提交',
      apiUrl: '/api/custom-form',
      apiMethod: 'POST',
      /**
       * 自定义表单项配置数组
       * @type {Array<FormItemConfig>}
       */
      formItems: [
        { id: 'field1', type: 'text', label: '姓名', placeholder: '请输入姓名', required: true },
        { id: 'field2', type: 'email', label: '邮箱', placeholder: '请输入邮箱', required: true },
        { id: 'field3', type: 'textarea', label: '留言', placeholder: '请输入留言', required: false }
      ]
    }
  },

  /**
   * 链接组件
   */
  link: {
    name: '链接',
    width: 100,
    height: 30,
    style: {
      fontSize: 14,
      color: '#1890ff',
      backgroundColor: 'transparent'
    },
    props: {
      content: '链接文字',
      href: '#'
    }
  },

  /**
   * 日期时间组件 - 实时显示当前时间
   */
  datetime: {
    name: '日期时间',
    width: 300,
    height: 60,
    style: {
      fontSize: 16,
      color: '#333333',
      backgroundColor: 'transparent',
      textAlign: 'center',
      borderRadius: 8,
      padding: 10
    },
    props: {
      displayType: 'datetime',  // 显示类型: 'date' | 'time' | 'datetime'
      styleType: 'digital',     // 样式风格: 'digital' | 'traditional' | 'compact'
      showWeek: false,          // 是否显示星期
      showAmPm: false,          // 是否使用12小时制
      showSeconds: true         // 是否显示秒数
    }
  },

  // ==================== 导航组件 ====================

  /**
   * 导航菜单组件
   */
  navMenu: {
    name: '导航菜单',
    width: 800,
    height: 50,
    style: {
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e8e8e8',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    },
    props: {
      logo: 'Logo',                                    // Logo文字
      logoUrl: '#',                                    // Logo链接
      menuItems: '首页|#\n关于我们|#about\n产品中心|#product\n联系我们|#contact',
      activeIndex: 0,                                  // 当前选中菜单项索引
      alignment: 'left'                                // 对齐方式
    }
  },

  /**
   * 面包屑导航组件
   */
  breadcrumb: {
    name: '面包屑',
    width: 500,
    height: 40,
    style: {
      backgroundColor: 'transparent',
      fontSize: 14,
      color: '#666666',
      separatorColor: '#999999'
    },
    props: {
      items: '首页|#\n分类|#category\n详情|#detail',  // 导航项配置
      separator: '/',           // 分隔符
      showHome: true,           // 是否显示首页
      homeText: '首页',         // 首页文字
      target: '_self'           // 链接打开方式: '_self' 当前窗口 | '_blank' 新建窗口
    }
  },

  /**
   * 标签页组件
   */
  tabs: {
    name: '标签页',
    width: 600,
    height: 300,
    style: {
      backgroundColor: '#ffffff',
      borderColor: '#e8e8e8',
      activeColor: '#1890ff',
      textColor: '#666666',
      activeTextColor: '#1890ff'
    },
    props: {
      tabs: '标签一|tab1\n标签二|tab2\n标签三|tab3',  // 标签配置
      activeTab: 'tab1',        // 当前激活标签
      tabPosition: 'top',       // 标签位置: 'top' | 'bottom'
      type: 'line'              // 样式类型: 'line' | 'card'
    }
  }
}

// 创建页面状态
function createPageState() {
  return {
    id: generatePageId(),
    name: '未命名页面',
    width: 1200,
    height: 800,
    backgroundColor: '#ffffff',
    components: []
  }
}

// 创建组件实例
export function createComponent(type) {
  const defaults = COMPONENT_DEFAULTS[type]
  if (!defaults) return null

  return {
    id: generateId(type),
    type,
    name: defaults.name,
    left: 100 + Math.random() * 200,
    top: 100 + Math.random() * 200,
    width: defaults.width,
    height: defaults.height,
    style: { ...defaults.style },
    props: { ...defaults.props },
    // 层级（纯色背景默认1级，其他组件默认3级）
    zIndex: type === 'container' ? 1 : 3
  }
}

// 全局状态
const state = reactive({
  // 当前页面数据
  page: createPageState(),

  // 选中的组件 ID
  selectedId: null,

  // 缩放比例
  zoom: 1,

  // 预览模式
  previewMode: false,

  // 拖拽中的组件类型
  draggingType: null,

  // 撤销栈
  undoStack: [],

  // 重做栈
  redoStack: [],

  // 历史记录最大数量
  maxHistory: 50,

  // 辅助线功能
  guides: {
    // 是否显示辅助线
    visible: false,
    // 辅助线列表
    lines: [],
    // 是否启用吸附
    snapEnabled: true,
    // 吸附距离
    snapDistance: 5,
    // 吸附模式：'center' 中心吸附，'edge' 边缘吸附，'both' 两者都启用
    snapMode: 'both',
    // 边缘吸附阻挡距离（超过此距离才能越过辅助线）
    snapBlockDistance: 30,
    // 选中的辅助线ID
    selectedGuideId: null
  }
})

console.log('Initial state:', state)

// ==================== 备忘录模式 - 历史记录管理 ====================

// 保存当前状态到撤销栈
function saveHistory(actionType, componentId = null) {
  // 创建状态快照
  const snapshot = {
    timestamp: Date.now(),
    actionType,
    componentId,
    page: JSON.parse(JSON.stringify({
      id: state.page.id,
      name: state.page.name,
      width: state.page.width,
      height: state.page.height,
      backgroundColor: state.page.backgroundColor,
      components: state.page.components
    })),
    selectedId: state.selectedId
  }

  // 压入撤销栈
  state.undoStack.push(snapshot)

  // 清空重做栈（执行新操作后，之前的重做历史失效）
  state.redoStack = []

  // 限制历史记录数量
  if (state.undoStack.length > state.maxHistory) {
    state.undoStack.shift()
  }
}

// 计算属性
const selectedComponent = computed(() => {
  if (!state.selectedId) return null
  return state.page.components.find(c => c.id === state.selectedId)
})

const componentCount = computed(() => state.page.components.length)

// 动作方法
const actions = {
  // 添加组件到画布
  addComponent(type, position = null) {
    const component = createComponent(type)
    if (!component) return

    // 如果没有指定位置，放置在画布中心
    if (position) {
      component.left = position.x
      component.top = position.y
    } else {
      component.left = (state.page.width - component.width) / 2
      component.top = (state.page.height - component.height) / 2
    }

    // 保存历史记录（添加组件前的状态，这样撤销可以回到没有组件的状态）
    saveHistory('addComponent', component.id)

    state.page.components.push(component)
    state.selectedId = component.id
    return component
  },

  // 从配置添加组件
  addComponentFromConfig(config) {
    const component = {
      id: config.id || generateId(config.type),
      type: config.type,
      name: config.name || COMPONENT_DEFAULTS[config.type]?.name || config.type,
      left: config.left || 0,
      top: config.top || 0,
      width: config.width || COMPONENT_DEFAULTS[config.type]?.width || 100,
      height: config.height || COMPONENT_DEFAULTS[config.type]?.height || 50,
      style: config.style || {},
      props: config.props || {},
      zIndex: config.zIndex || 3
    }
    state.page.components.push(component)
    return component
  },

  // 删除组件
  removeComponent(id) {
    const index = state.page.components.findIndex(c => c.id === id)
    if (index > -1) {
      // 保存历史记录
      saveHistory('removeComponent', id)

      state.page.components.splice(index, 1)
      if (state.selectedId === id) {
        state.selectedId = null
      }
    }
  },

  // 选择组件
  selectComponent(id) {
    state.selectedId = id
  },

  // 取消选择
  deselectComponent() {
    state.selectedId = null
  },

  // 更新组件属性
  updateComponent(id, updates) {
    const component = state.page.components.find(c => c.id === id)
    if (component) {
      Object.assign(component, updates)
    }
  },

  // 更新组件样式
  updateComponentStyle(id, styleUpdates) {
    const component = state.page.components.find(c => c.id === id)
    if (component) {
      // 保存历史记录
      saveHistory('updateStyle', id)

      // 使用展开运算符确保响应式更新
      component.style = { ...component.style, ...styleUpdates }
    }
  },

  // 保存移动历史记录（用于拖拽开始时调用）
  saveMoveHistory() {
    saveHistory('moveComponent', state.selectedId)
  },

  // 保存拉伸历史记录（用于拉伸开始时调用）
  saveResizeHistory() {
    saveHistory('resizeComponent', state.selectedId)
  },

  // 更新组件 props
  updateComponentProps(id, propsUpdates) {
    const component = state.page.components.find(c => c.id === id)
    if (component) {
      // 保存历史记录
      saveHistory('updateProps', id)

      Object.assign(component.props, propsUpdates)
    }
  },

  // 更新组件层级
  updateComponentZIndex(id, zIndex) {
    const component = state.page.components.find(c => c.id === id)
    if (component) {
      // 限制层级在1-5之间
      component.zIndex = Math.max(1, Math.min(5, zIndex))
    }
  },

  // 移动组件（不保存历史记录，由拖拽开始/结束时统一处理）
  moveComponent(id, left, top, originalLeft = null, originalTop = null) {
    const component = state.page.components.find(c => c.id === id)
    if (component) {
      // 应用辅助线吸附
      const snapResult = state.guides.snapEnabled ? 
        actions.getSnapPosition(left, top, component.width, component.height, originalLeft, originalTop) : 
        { x: left, y: top }
      
      component.left = snapResult.x
      component.top = snapResult.y
    }
  },

  // 调整组件大小
  resizeComponent(id, width, height) {
    const component = state.page.components.find(c => c.id === id)
    if (component) {
      component.width = Math.max(20, width)
      component.height = Math.max(20, height)
    }
  },

  // 设置缩放
  setZoom(zoom) {
    state.zoom = zoom
  },

  // 切换预览模式
  togglePreviewMode() {
    state.previewMode = !state.previewMode
    if (state.previewMode) {
      state.selectedId = null
    }
  },

  // 更新页面尺寸
  updatePageSize(width, height) {
    state.page.width = Math.max(320, width)
    state.page.height = Math.max(200, height)
  },

  // 设置拖拽类型
  setDraggingType(type) {
    state.draggingType = type
  },

  // 清空拖拽类型
  clearDraggingType() {
    state.draggingType = null
  },

  // 更新页面属性
  updatePage(updates) {
    Object.assign(state.page, updates)
  },

  // 重置页面
  resetPage() {
    const newPage = createPageState()
    Object.assign(state.page, newPage)
    state.page.components = []
    state.selectedId = null
  },

  // 导出页面为 JSON（包含页面信息和组件）
  exportPageJSON() {
    const exportData = {
      version: '1.0',
      type: 'page',
      name: state.page.name,
      width: state.page.width,
      height: state.page.height,
      backgroundColor: state.page.backgroundColor,
      components: state.page.components
    }
    return JSON.stringify(exportData, null, 2)
  },

  // 导出布局为 JSON（仅包含组件，不包含页面信息）
  exportLayoutJSON() {
    const exportData = {
      version: '1.0',
      type: 'layout',
      components: state.page.components
    }
    return JSON.stringify(exportData, null, 2)
  },

  // 导入 JSON 页面（替换整个页面）
  importPageJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString)
      
      // 验证数据结构
      if (!data.components || !Array.isArray(data.components)) {
        throw new Error('无效的组件数据')
      }

      // 更新页面属性
      if (data.name) state.page.name = data.name
      if (data.width) state.page.width = data.width
      if (data.height) state.page.height = data.height
      if (data.backgroundColor) state.page.backgroundColor = data.backgroundColor
      
      // 清空现有组件
      state.page.components = []
      
      // 添加导入的组件
      data.components.forEach(comp => {
        state.page.components.push({
          id: generateId(comp.type),
          type: comp.type,
          name: comp.name || COMPONENT_DEFAULTS[comp.type]?.name || comp.type,
          left: comp.left || 0,
          top: comp.top || 0,
          width: comp.width || COMPONENT_DEFAULTS[comp.type]?.width || 100,
          height: comp.height || COMPONENT_DEFAULTS[comp.type]?.height || 50,
          style: comp.style || {},
          props: comp.props || {},
          zIndex: comp.zIndex || 3
        })
      })
      
      state.selectedId = null
      return { success: true, message: '页面导入成功' }
    } catch (error) {
      return { success: false, message: '导入失败: ' + error.message }
    }
  },

  // 导入布局为 JSON（仅添加组件，不替换页面信息）
  importLayoutJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString)
      
      // 验证数据结构
      if (!data.components || !Array.isArray(data.components)) {
        throw new Error('无效的组件数据')
      }
      
      // 添加导入的组件（不清空现有组件）
      data.components.forEach(comp => {
        state.page.components.push({
          id: generateId(comp.type),
          type: comp.type,
          name: comp.name || COMPONENT_DEFAULTS[comp.type]?.name || comp.type,
          left: comp.left || 0,
          top: comp.top || 0,
          width: comp.width || COMPONENT_DEFAULTS[comp.type]?.width || 100,
          height: comp.height || COMPONENT_DEFAULTS[comp.type]?.height || 50,
          style: comp.style || {},
          props: comp.props || {},
          zIndex: comp.zIndex || 3
        })
      })
      
      state.selectedId = null
      return { success: true, message: '布局导入成功' }
    } catch (error) {
      return { success: false, message: '导入失败: ' + error.message }
    }
  },

  // ==================== 备忘录模式 - 撤销/重做 ====================

  // 撤销
  undo() {
    if (state.undoStack.length === 0) return false

    // 保存当前状态到重做栈
    const currentSnapshot = {
      timestamp: Date.now(),
      actionType: 'undo',
      page: JSON.parse(JSON.stringify({
        id: state.page.id,
        name: state.page.name,
        width: state.page.width,
        height: state.page.height,
        backgroundColor: state.page.backgroundColor,
        components: state.page.components
      })),
      selectedId: state.selectedId
    }
    state.redoStack.push(currentSnapshot)

    // 从撤销栈弹出上一个状态
    const previousState = state.undoStack.pop()
    
    // 恢复状态
    Object.assign(state.page, previousState.page)
    state.selectedId = previousState.selectedId

    return true
  },

  // 重做
  redo() {
    if (state.redoStack.length === 0) return false

    // 保存当前状态到撤销栈
    const currentSnapshot = {
      timestamp: Date.now(),
      actionType: 'redo',
      page: JSON.parse(JSON.stringify({
        id: state.page.id,
        name: state.page.name,
        width: state.page.width,
        height: state.page.height,
        backgroundColor: state.page.backgroundColor,
        components: state.page.components
      })),
      selectedId: state.selectedId
    }
    state.undoStack.push(currentSnapshot)

    // 从重做栈弹出下一个状态
    const nextState = state.redoStack.pop()
    
    // 恢复状态
    Object.assign(state.page, nextState.page)
    state.selectedId = nextState.selectedId

    return true
  },

  // 是否可以撤销
  canUndo() {
    return state.undoStack.length > 0
  },

  // 是否可以重做
  canRedo() {
    return state.redoStack.length > 0
  },

  // 清空历史记录
  clearHistory() {
    state.undoStack = []
    state.redoStack = []
  },

  // ==================== 辅助线功能 ====================

  // 切换辅助线显示
  toggleGuides() {
    state.guides.visible = !state.guides.visible
  },

  // 设置辅助线可见性
  setGuidesVisible(visible) {
    state.guides.visible = visible
  },

  // 添加辅助线
  addGuide(type = 'line', options = {}) {
    const id = generateId('guide')
    const guide = {
      id,
      type, // 'line', 'rect', 'circle', 'triangle', 'semicircle'
      ...options
    }
    state.guides.lines.push(guide)
    return id
  },

  // 添加水平参考线
  addHorizontalGuide(y) {
    const id = generateId('guide')
    state.guides.lines.push({
      id,
      type: 'line',
      x1: 0,
      y1: y,
      x2: state.page.width,
      y2: y,
      orientation: 'horizontal',
      color: '#ff4d4f',
      visible: true,
      locked: false
    })
    return id
  },

  // 添加垂直参考线
  addVerticalGuide(x) {
    const id = generateId('guide')
    state.guides.lines.push({
      id,
      type: 'line',
      x1: x,
      y1: 0,
      x2: x,
      y2: state.page.height,
      orientation: 'vertical',
      color: '#ff4d4f',
      visible: true,
      locked: false
    })
    return id
  },

  // 添加可旋转的直线辅助线
  addRotatableLineGuide(x, y, length = 2000, rotation = 0) {
    const id = generateId('guide')
    // 计算直线的两个端点
    const angle = rotation * Math.PI / 180
    const halfLength = length / 2
    const x1 = x - Math.cos(angle) * halfLength
    const y1 = y - Math.sin(angle) * halfLength
    const x2 = x + Math.cos(angle) * halfLength
    const y2 = y + Math.sin(angle) * halfLength
    
    state.guides.lines.push({
      id,
      type: 'line',
      x1,
      y1,
      x2,
      y2,
      orientation: 'rotatable', // 标记为可旋转
      color: '#1890ff',
      visible: true,
      locked: false,
      rotation: rotation,
      centerX: x,
      centerY: y
    })
    return id
  },

  // 添加参考圆形
  addCircleGuide(x, y, radius) {
    const id = generateId('guide')
    state.guides.lines.push({
      id,
      type: 'circle',
      x,
      y,
      radius,
      color: '#52c41a',
      visible: true,
      locked: false
    })
    return id
  },

  // 删除辅助线
  deleteGuide(id) {
    const index = state.guides.lines.findIndex(g => g.id === id)
    if (index !== -1) {
      state.guides.lines.splice(index, 1)
      if (state.guides.selectedGuideId === id) {
        state.guides.selectedGuideId = null
      }
    }
  },

  // 更新辅助线
  updateGuide(id, updates) {
    const guide = state.guides.lines.find(g => g.id === id)
    if (guide) {
      Object.assign(guide, updates)
    }
  },

  // 选择辅助线
  selectGuide(id) {
    state.guides.selectedGuideId = id
  },

  // 取消选择辅助线
  deselectGuide() {
    state.guides.selectedGuideId = null
  },

  // 清空所有辅助线
  clearGuides() {
    state.guides.lines = []
    state.guides.selectedGuideId = null
  },

  // 切换吸附功能
  toggleSnap() {
    state.guides.snapEnabled = !state.guides.snapEnabled
  },

  // 设置吸附距离
  setSnapDistance(distance) {
    state.guides.snapDistance = distance
  },

  // 设置吸附模式
  setSnapMode(mode) {
    state.guides.snapMode = mode
  },

  // 设置边缘阻挡距离
  setSnapBlockDistance(distance) {
    state.guides.snapBlockDistance = distance
  },

  // 获取辅助线吸附位置
  getSnapPosition(x, y, width, height, originalX = null, originalY = null) {
    if (!state.guides.snapEnabled || state.guides.lines.length === 0) {
      return { x, y, snapped: false }
    }

    const snapDist = state.guides.snapDistance
    const snapMode = state.guides.snapMode
    const blockDist = state.guides.snapBlockDistance
    let snappedX = x
    let snappedY = y
    let snapped = false

    // 用于边缘阻挡的逻辑
    const startX = originalX !== null ? originalX : x
    const startY = originalY !== null ? originalY : y

    for (const guide of state.guides.lines) {
      if (!guide.visible) continue

      if (guide.type === 'line') {
        // 处理垂直辅助线（X轴吸附）
        if (guide.orientation === 'vertical') {
          const guideX = guide.x1
          
          // 中心吸附
          if (snapMode === 'center' || snapMode === 'both') {
            const centerX = x + width / 2
            if (Math.abs(centerX - guideX) < snapDist) {
              snappedX = guideX - width / 2
              snapped = true
            }
          }
          
          // 边缘吸附（带阻挡）
          if (snapMode === 'edge' || snapMode === 'both') {
            const leftEdge = x
            const rightEdge = x + width
            
            // 左边缘吸附
            if (Math.abs(leftEdge - guideX) < snapDist) {
              snappedX = guideX
              snapped = true
            }
            // 右边缘吸附
            else if (Math.abs(rightEdge - guideX) < snapDist) {
              snappedX = guideX - width
              snapped = true
            }
            // 边缘阻挡：如果组件试图越过辅助线，但距离不够大，则阻挡
            else {
              const startLeft = startX
              const startRight = startX + width
              
              // 从左往右越过垂直线
              if (startLeft < guideX && x > guideX && x - guideX < blockDist) {
                snappedX = guideX
                snapped = true
              }
              // 从右往左越过垂直线
              else if (startRight > guideX && x + width < guideX && guideX - (x + width) < blockDist) {
                snappedX = guideX - width
                snapped = true
              }
            }
          }
        }
        // 处理水平辅助线（Y轴吸附）
        else if (guide.orientation === 'horizontal') {
          const guideY = guide.y1
          
          // 中心吸附
          if (snapMode === 'center' || snapMode === 'both') {
            const centerY = y + height / 2
            if (Math.abs(centerY - guideY) < snapDist) {
              snappedY = guideY - height / 2
              snapped = true
            }
          }
          
          // 边缘吸附（带阻挡）
          if (snapMode === 'edge' || snapMode === 'both') {
            const topEdge = y
            const bottomEdge = y + height
            
            // 上边缘吸附
            if (Math.abs(topEdge - guideY) < snapDist) {
              snappedY = guideY
              snapped = true
            }
            // 下边缘吸附
            else if (Math.abs(bottomEdge - guideY) < snapDist) {
              snappedY = guideY - height
              snapped = true
            }
            // 边缘阻挡：如果组件试图越过辅助线，但距离不够大，则阻挡
            else {
              const startTop = startY
              const startBottom = startY + height
              
              // 从上往下越过水平线
              if (startTop < guideY && y > guideY && y - guideY < blockDist) {
                snappedY = guideY
                snapped = true
              }
              // 从下往上越过水平线
              else if (startBottom > guideY && y + height < guideY && guideY - (y + height) < blockDist) {
                snappedY = guideY - height
                snapped = true
              }
            }
          }
        }
        // 处理可旋转直线辅助线
        else if (guide.orientation === 'rotatable') {
          // 可旋转直线的吸附：检测组件中心到直线的距离
          const centerX = x + width / 2
          const centerY = y + height / 2
          
          // 计算点到直线的距离
          const lineLength = Math.sqrt(Math.pow(guide.x2 - guide.x1, 2) + Math.pow(guide.y2 - guide.y1, 2))
          if (lineLength === 0) continue
          
          // 直线方程：Ax + By + C = 0
          const A = guide.y1 - guide.y2
          const B = guide.x2 - guide.x1
          const C = guide.x1 * guide.y2 - guide.x2 * guide.y1
          
          // 点到直线距离
          const distance = Math.abs(A * centerX + B * centerY + C) / lineLength
          
          if (distance < snapDist) {
            // 将中心点投影到直线上
            const projX = (B * (B * centerX - A * centerY) - A * C) / (A * A + B * B)
            const projY = (A * (-B * centerX + A * centerY) - B * C) / (A * A + B * B)
            
            snappedX = projX - width / 2
            snappedY = projY - height / 2
            snapped = true
          }
        }
      }
      // 处理圆形辅助线
      else if (guide.type === 'circle') {
        const centerX = x + width / 2
        const centerY = y + height / 2
        
        // 组件中心到圆心的距离
        const distToCenter = Math.sqrt(Math.pow(centerX - guide.x, 2) + Math.pow(centerY - guide.y, 2))
        
        // 吸附到圆的边缘
        if (Math.abs(distToCenter - guide.radius) < snapDist) {
          // 将中心点投影到圆上
          const angle = Math.atan2(centerY - guide.y, centerX - guide.x)
          const projX = guide.x + Math.cos(angle) * guide.radius
          const projY = guide.y + Math.sin(angle) * guide.radius
          
          snappedX = projX - width / 2
          snappedY = projY - height / 2
          snapped = true
        }
      }
    }

    return { x: snappedX, y: snappedY, snapped }
  },

  // 获取画布中心辅助线位置
  getCenterGuides() {
    return {
      vertical: state.page.width / 2,
      horizontal: state.page.height / 2
    }
  },

  // 添加中心辅助线（水平和垂直各一条）
  addCenterGuides() {
    const centerX = state.page.width / 2
    const centerY = state.page.height / 2
    // 直接添加辅助线，不使用 this
    const verticalId = generateId('guide')
    state.guides.lines.push({
      id: verticalId,
      type: 'line',
      x1: centerX,
      y1: 0,
      x2: centerX,
      y2: state.page.height,
      orientation: 'vertical',
      color: '#ff4d4f',
      visible: true
    })
    
    const horizontalId = generateId('guide')
    state.guides.lines.push({
      id: horizontalId,
      type: 'line',
      x1: 0,
      y1: centerY,
      x2: state.page.width,
      y2: centerY,
      orientation: 'horizontal',
      color: '#ff4d4f',
      visible: true
    })
  }
}

// 组合式 API 导出
export function useEditor() {
  return {
    // 状态（只读）
    page: state.page,
    selectedId: computed(() => state.selectedId),
    selectedComponent,
    zoom: computed(() => state.zoom),
    previewMode: computed(() => state.previewMode),
    draggingType: computed(() => state.draggingType),
    componentCount,
    
    // 辅助线状态
    guides: computed(() => state.guides),
    guidesVisible: computed(() => state.guides.visible),
    guidesList: computed(() => state.guides.lines),
    snapEnabled: computed(() => state.guides.snapEnabled),
    snapDistance: computed(() => state.guides.snapDistance),
    snapMode: computed(() => state.guides.snapMode),
    snapBlockDistance: computed(() => state.guides.snapBlockDistance),
    selectedGuideId: computed(() => state.guides.selectedGuideId),

    // 方法
    ...actions
  }
}

export { state as editorState }
