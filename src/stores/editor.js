/**
 * @file 编辑器状态管理模块
 * @description 基于 Vue 3 reactive 的状态管理实现，包含组件配置、页面状态、历史记录等核心功能
 * @note 后期可平滑迁移到 Pinia 状态管理库
 */

import { reactive, computed, watch } from 'vue'
import { generateId, generatePageId } from '../utils/idGenerator'
import { buildPageNameIndex, resolvePagesPageLinks, countPageLinks, sanitizeSlug } from '../utils/pageLinks.js'
import {
  listVersions,
  saveVersion,
  getVersion,
  renameVersion,
  removeVersion,
  clearVersions,
  getVersionsSize
} from '../utils/versionStore.js'

/**
 * 草稿持久化存储键
 */
export const DRAFT_STORAGE_KEY = 'visual-web-editor:draft:v1'

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
  TABS: 'tabs',           // 标签页组件

  // ========== 内容组件（扩展） ==========
  DIVIDER: 'divider',     // 分隔线
  ICON: 'icon',           // 图标
  LIST: 'list',           // 列表
  TABLE: 'table',         // 表格
  VIDEO: 'video',         // 视频
  CAROUSEL: 'carousel'    // 轮播图
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
  },
  content: {
    name: '内容组件',
    icon: '🧩',
    components: ['divider', 'icon', 'list', 'table', 'video', 'carousel']
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
    width: 330,
    height: 45,
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
  },

  // ==================== 内容组件（扩展） ====================

  /**
   * 分隔线组件 - 水平分割线，支持中间带文字
   */
  divider: {
    name: '分隔线',
    width: 400,
    height: 24,
    style: {
      backgroundColor: 'transparent'
    },
    props: {
      lineStyle: 'solid',   // 线条样式: solid | dashed | dotted
      thickness: 1,         // 线宽（px）
      color: '#e8e8e8',     // 线条颜色
      text: '',             // 可选：线中间的文字
      textColor: '#999999',
      textSize: 12,
      textGap: 12           // 文字与线之间的留白
    }
  },

  /**
   * 图标组件 - 使用 emoji / 字符，可选背景形状
   */
  icon: {
    name: '图标',
    width: 48,
    height: 48,
    style: {
      fontSize: 32,
      color: '#1890ff',
      textAlign: 'center'
    },
    props: {
      icon: '⭐',           // 图标字符（emoji 或符号）
      shape: 'none',        // 背景形状: none | circle | square
      shapeColor: '#f0f7ff',
      shapeSize: 48         // 背景形状尺寸（px）
    }
  },

  /**
   * 列表组件 - 无序 / 有序 / 无标记
   */
  list: {
    name: '列表',
    width: 320,
    height: 160,
    style: {
      fontSize: 14,
      color: '#333333',
      lineHeight: '2',
      textAlign: 'left'
    },
    props: {
      items: '第一项内容\n第二项内容\n第三项内容',  // 每行一项
      listType: 'unordered',   // unordered | ordered | none
      marker: '•',             // 无序列表标记符号
      markerColor: '#1890ff',
      itemSpacing: 4           // 项间距（px）
    }
  },

  /**
   * 表格组件 - 表头 + 数据行（用 | 分隔列）
   */
  table: {
    name: '表格',
    width: 600,
    height: 180,
    style: {
      fontSize: 14,
      color: '#333333',
      backgroundColor: '#ffffff'
    },
    props: {
      headers: '姓名|职位|城市',                    // 表头，| 分隔
      rows: '张三|前端工程师|北京\n李四|产品设计师|上海\n王五|后端工程师|深圳',  // 每行一条，| 分隔列
      showHeader: true,
      headerBackground: '#f5f7fa',
      headerColor: '#333333',
      borderColor: '#e8e8e8',
      striped: true,           // 斑马纹
      cellPadding: 10,         // 单元格内边距（px）
      // 单元格链接的打开方式（单元格支持 [文字](链接) 或纯 http(s) 链接）
      linkTarget: '_self'
    }
  },

  /**
   * 视频组件 - 视频直链或 iframe 嵌入
   */
  video: {
    name: '视频',
    width: 560,
    height: 315,
    style: {
      backgroundColor: '#000000',
      borderRadius: 8
    },
    props: {
      src: 'https://www.w3schools.com/html/mov_bbb.mp4',
      videoType: 'file',       // file（视频直链）| iframe（嵌入地址，如 B站/YouTube）
      poster: '',              // 封面图地址
      autoplay: false,
      loop: false,
      muted: true,             // 静音（浏览器要求自动播放必须静音）
      controls: true
    }
  },

  /**
   * 轮播图组件 - 多张图片自动/手动切换
   */
  carousel: {
    name: '轮播图',
    width: 600,
    height: 300,
    style: {
      backgroundColor: '#f0f0f0',
      borderRadius: 8
    },
    props: {
      // 每行一项：图片地址|说明文字
      images: 'https://picsum.photos/seed/slide1/600/300|第一张幻灯片\nhttps://picsum.photos/seed/slide2/600/300|第二张幻灯片\nhttps://picsum.photos/seed/slide3/600/300|第三张幻灯片',
      autoplay: true,
      interval: 3000,          // 自动播放间隔（ms）
      showIndicators: true,    // 显示指示点
      showArrows: true         // 显示左右箭头
    }
  }
}

export const BACKGROUND_TYPES = {
  SOLID: 'solid',
  GRADIENT_LINEAR: 'gradient-linear',
  GRADIENT_RADIAL: 'gradient-radial',
  IMAGE: 'image'
}

// 创建页面状态
function createPageState(name = '未命名页面') {
  return {
    id: generatePageId(),
    name,
    // 导出文件名（英文 slug，如 products → products.html）；留空则按页面名自动生成
    slug: '',
    width: 1200,
    height: 800,
    backgroundColor: '#ffffff',
    backgroundType: 'solid',
    backgroundGradientStart: '#ffffff',
    backgroundGradientEnd: '#f5f5f5',
    backgroundGradientAngle: 180,
    backgroundImage: '',
    backgroundImageSize: 'cover',
    backgroundImagePosition: 'center',
    backgroundImageRepeat: 'no-repeat',
    // SEO / head 配置（导出时注入到 HTML 的 <head>）
    seoTitle: '',          // <title>（留空则用页面名）
    seoDescription: '',    // meta description
    seoKeywords: '',       // meta keywords
    seoFavicon: '',        // favicon 地址（http(s) 或 data URL）
    seoOgImage: '',        // 社交分享配图
    seoLang: 'zh-CN',      // <html lang>
    components: []
  }
}

/**
 * 创建画布状态
 * 一个画布 = 一个独立的设计空间（可理解为"一个站点"），内部包含多个页面，
 * 不同画布之间的页面与组件完全独立，互不影响。
 * @param {string} name - 画布名称
 * @param {string} firstPageName - 首个页面名称
 */
function createCanvasState(name = '未命名画布', firstPageName = '首页') {
  const page = createPageState(firstPageName)
  return {
    id: generateId('canvas'),
    name,
    pages: [page]
  }
}

/**
 * 创建项目状态（项目 = 多个相互独立的画布）
 */
function createProjectState() {
  return {
    id: generatePageId(),
    name: '未命名项目',
    canvases: [createCanvasState('画布 1', '首页')]
  }
}

/**
 * 规范化页面数据（用于导入 / 草稿恢复）
 * 逐字段校验，组件经 normalizeComponentConfig 清洗，未知类型会被过滤
 * @param {Object} p - 原始页面数据
 * @returns {Object} 规范化后的页面对象
 */
function normalizePageData(p) {
  const source = p && typeof p === 'object' ? p : {}
  const page = createPageState(typeof source.name === 'string' ? source.name : '未命名页面')

  if (typeof source.id === 'string' && source.id) page.id = source.id
  if (typeof source.slug === 'string' && source.slug.trim()) page.slug = sanitizeSlug(source.slug)
  if (typeof source.width === 'number') page.width = source.width
  if (typeof source.height === 'number') page.height = source.height
  if (typeof source.backgroundColor === 'string') page.backgroundColor = source.backgroundColor
  if (typeof source.backgroundType === 'string') page.backgroundType = source.backgroundType
  if (typeof source.backgroundGradientStart === 'string') page.backgroundGradientStart = source.backgroundGradientStart
  if (typeof source.backgroundGradientEnd === 'string') page.backgroundGradientEnd = source.backgroundGradientEnd
  if (typeof source.backgroundGradientAngle === 'number') page.backgroundGradientAngle = source.backgroundGradientAngle
  if (typeof source.backgroundImage === 'string') page.backgroundImage = source.backgroundImage
  if (typeof source.backgroundImageSize === 'string') page.backgroundImageSize = source.backgroundImageSize
  if (typeof source.backgroundImagePosition === 'string') page.backgroundImagePosition = source.backgroundImagePosition
  if (typeof source.backgroundImageRepeat === 'string') page.backgroundImageRepeat = source.backgroundImageRepeat

  // SEO / head 配置
  const seoKeys = ['seoTitle', 'seoDescription', 'seoKeywords', 'seoFavicon', 'seoOgImage', 'seoLang']
  seoKeys.forEach(key => {
    if (typeof source[key] === 'string') page[key] = source[key]
  })

  page.components = (Array.isArray(source.components) ? source.components : [])
    .map(comp => actions.normalizeComponentConfig(comp))
    .filter(Boolean)

  return page
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
    zIndex: type === 'container' ? 1 : 3,
    // 图层状态：是否可见 / 是否锁定
    visible: true,
    locked: false
  }
}

// 全局状态
const state = reactive({
  // 项目结构：项目 → 多个独立画布 → 每个画布多个页面 → 页面内组件
  project: createProjectState(),

  // 当前激活的画布 / 页面 ID
  activeCanvasId: null,
  activePageId: null,

  // 当前页面数据（直接指向 project 中激活的页面对象，所有既有动作都作用于它）
  page: null,

  // 选中的组件 ID
  selectedId: null,

  // 多选模式下选中的组件 ID 列表
  selectedIds: [],

  // 缩放比例
  zoom: 1,

  // 预览模式
  previewMode: false,

  // 拖拽中的组件类型
  draggingType: null,

  // 当前正在拖拽的组件 ID
  draggingId: null,

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
  },

  // 框选状态
  marqueeSelect: {
    active: false,
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0
  },

  // 草稿状态
  draftRestored: false,     // 是否从本地草稿恢复
  draftSavedAt: null,       // 上次自动保存时间
  draftSaving: false,       // 自动保存进行中

  // 组件剪贴板（内存，用于复制/粘贴）
  clipboard: [],

  // 图层 hover 高亮（图层面板与画布联动）
  hoveredId: null
})

// ==================== 激活指针初始化与同步 ====================

/**
 * 取当前激活的画布对象（响应式引用）
 * @returns {Object|null}
 */
function getActiveCanvas() {
  const canvases = state.project?.canvases || []
  return canvases.find(c => c.id === state.activeCanvasId) || canvases[0] || null
}

/**
 * 把 state.page 指向当前激活的画布 / 页面
 * 页面对象本身位于 project 响应式树内，因此所有既有动作（增删组件、改样式等）
 * 继续直接操作 state.page 即可，无需改动
 */
function syncActivePage() {
  const canvas = getActiveCanvas()
  if (!canvas) {
    state.page = null
    return null
  }

  state.activeCanvasId = canvas.id
  let page = canvas.pages.find(p => p.id === state.activePageId)
  if (!page) {
    page = canvas.pages[0]
    state.activePageId = page ? page.id : null
  }
  state.page = page || null
  return page
}

// 初始激活第一个画布的第一个页面
syncActivePage()

console.log('Initial state:', state)

// ==================== 备忘录模式 - 历史记录管理 ====================

// 生成页面完整快照（包含全部页面与背景字段，保证撤销/重做一致）
function createPageSnapshot() {
  return JSON.parse(JSON.stringify(state.page))
}

// 生成整个项目的快照（用于结构性操作：增删画布/页面、应用整站等）
function createProjectSnapshot() {
  return {
    project: JSON.parse(JSON.stringify(state.project)),
    activeCanvasId: state.activeCanvasId,
    activePageId: state.activePageId
  }
}

/**
 * 在项目里定位某个页面
 * @param {string} pageId
 * @returns {{canvasId: string, canvas: Object}|null}
 */
function findPageLocation(pageId) {
  for (const canvas of state.project?.canvases || []) {
    if ((canvas.pages || []).some(page => page.id === pageId)) {
      return { canvasId: canvas.id, canvas }
    }
  }
  return null
}

/**
 * 保存当前状态到撤销栈
 * @param {string} actionType - 动作名（用于调试/提示）
 * @param {string|null} componentId - 相关组件 id
 * @param {'page'|'project'} scope - 快照范围：
 *   page 只快照当前页面（组件级操作）；
 *   project 快照整个项目（结构性操作：增删画布/页面、应用整站等）
 */
function saveHistory(actionType, componentId = null, scope = 'page') {
  const snapshot = {
    timestamp: Date.now(),
    actionType,
    componentId,
    scope,
    pageId: scope === 'page' ? (state.page ? state.page.id : null) : null,
    page: scope === 'page' ? createPageSnapshot() : null,
    project: scope === 'project' ? createProjectSnapshot() : null,
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

/**
 * 恢复一个历史快照
 * @param {Object} snapshot
 * @returns {boolean} 是否恢复成功
 */
function restoreSnapshot(snapshot) {
  if (!snapshot) return false

  // 项目级快照：整体恢复（画布/页面结构变化）
  if (snapshot.scope === 'project' && snapshot.project) {
    state.project = JSON.parse(JSON.stringify(snapshot.project.project))
    state.activeCanvasId = snapshot.project.activeCanvasId
    state.activePageId = snapshot.project.activePageId
    syncActivePage()
    state.selectedId = snapshot.selectedId
    return true
  }

  // 页面级快照：必要时先切回目标页面（期间可能切换过页面），再恢复内容
  if (snapshot.pageId && state.page?.id !== snapshot.pageId) {
    const location = findPageLocation(snapshot.pageId)
    if (!location) return false
    state.activeCanvasId = location.canvasId
    state.activePageId = snapshot.pageId
    syncActivePage()
  }

  if (!state.page || !snapshot.page) return false

  Object.assign(state.page, snapshot.page)
  state.selectedId = snapshot.selectedId
  return true
}

// 计算属性
const selectedComponent = computed(() => {
  if (!state.selectedId) return null
  return state.page.components.find(c => c.id === state.selectedId)
})

const componentCount = computed(() => state.page.components.length)

// 剪贴板中的组件数量（用于控制"粘贴"可用状态）
const clipboardCount = computed(() => (state.clipboard || []).length)

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

  // 从配置添加组件（保存历史记录）
  addComponentFromConfig(config) {
    const component = actions.normalizeComponentConfig(config)
    if (!component) return null

    saveHistory('addComponentFromConfig', component.id)
    state.page.components.push(component)
    return component
  },

  // 将任意组件配置规范化为编辑器标准组件结构
  // 仅接受已知组件类型；字段缺失时与默认配置合并，坐标/尺寸转为数字
  normalizeComponentConfig(config) {
    if (!config || typeof config !== 'object') return null

    const type = config.type
    const defaults = COMPONENT_DEFAULTS[type]
    if (!defaults) return null

    return {
      id: config.id || generateId(type),
      type,
      name: config.name || defaults.name || type,
      left: Number(config.left) || 0,
      top: Number(config.top) || 0,
      width: Number(config.width) || defaults.width || 100,
      height: Number(config.height) || defaults.height || 50,
      style: { ...defaults.style, ...(config.style || {}) },
      props: { ...defaults.props, ...(config.props || {}) },
      zIndex: config.zIndex || (type === 'container' ? 1 : 3),
      // 图层状态（导入/AI 结果缺省为可见、未锁定）
      visible: config.visible !== false,
      locked: config.locked === true
    }
  },

  // 原子应用完整页面模板（一次历史记录，可整体撤销）
  applyPageTemplate(config) {
    if (!config || !Array.isArray(config.components)) {
      return { success: false, message: '无效的页面模板数据' }
    }

    saveHistory('applyPageTemplate')

    if (config.name) state.page.name = config.name
    if (config.width) state.page.width = config.width
    if (config.height) state.page.height = config.height
    if (config.backgroundColor) state.page.backgroundColor = config.backgroundColor
    if (config.backgroundType) state.page.backgroundType = config.backgroundType
    if (config.backgroundGradientStart) state.page.backgroundGradientStart = config.backgroundGradientStart
    if (config.backgroundGradientEnd) state.page.backgroundGradientEnd = config.backgroundGradientEnd
    if (config.backgroundGradientAngle) state.page.backgroundGradientAngle = config.backgroundGradientAngle
    if (config.backgroundImage) state.page.backgroundImage = config.backgroundImage
    if (config.backgroundImageSize) state.page.backgroundImageSize = config.backgroundImageSize
    if (config.backgroundImagePosition) state.page.backgroundImagePosition = config.backgroundImagePosition
    if (config.backgroundImageRepeat) state.page.backgroundImageRepeat = config.backgroundImageRepeat

    // 规范化并过滤未知组件类型
    const normalized = (config.components || [])
      .map(comp => actions.normalizeComponentConfig(comp))
      .filter(Boolean)

    state.page.components = normalized
    state.selectedId = null
    state.selectedIds = []
    return { success: true, message: `页面模板应用成功（${normalized.length} 个组件）` }
  },

  // 批量添加/替换组件配置（原子操作，一次历史记录）
  applyComponents(configs, { replace = false } = {}) {
    if (!Array.isArray(configs)) return 0

    saveHistory(replace ? 'applyComponents-replace' : 'applyComponents-append')

    const normalized = configs
      .map(comp => actions.normalizeComponentConfig(comp))
      .filter(Boolean)

    if (replace) {
      state.page.components = normalized
    } else {
      state.page.components = state.page.components.concat(normalized)
    }
    state.selectedId = null
    state.selectedIds = []
    return normalized.length
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
  selectComponent(id, multiSelect = false) {
    if (multiSelect) {
      const index = state.selectedIds.indexOf(id)
      if (index > -1) {
        state.selectedIds.splice(index, 1)
      } else {
        state.selectedIds.push(id)
      }
      state.selectedId = id
    } else {
      state.selectedId = id
      state.selectedIds = [id]
    }
  },

  // 取消选择
  deselectComponent() {
    state.selectedId = null
    state.selectedIds = []
  },

  // 批量选择组件
  selectComponents(ids) {
    state.selectedIds = [...ids]
    state.selectedId = ids[0] || null
  },

  // 获取选中的所有组件
  getSelectedComponents() {
    return state.selectedIds.map(id => 
      state.page.components.find(c => c.id === id)
    ).filter(Boolean)
  },

  // 框选组件
  marqueeSelectComponents(startX, startY, endX, zoom) {
    const rect = {
      x: Math.min(startX, endX) / zoom,
      y: Math.min(startY, endY) / zoom,
      width: Math.abs(endX - startX) / zoom,
      height: Math.abs(endY - startY) / zoom
    }

    const selected = state.page.components.filter(comp => {
      return (
        !comp.locked &&
        comp.left >= rect.x &&
        comp.top >= rect.y &&
        comp.left + comp.width <= rect.x + rect.width &&
        comp.top + comp.height <= rect.y + rect.height
      )
    })

    if (selected.length > 0) {
      state.selectedIds = selected.map(c => c.id)
      state.selectedId = selected[0].id
    }
  },

  // 设置框选状态
  setMarqueeSelect(active, startX = 0, startY = 0, endX = 0, endY = 0) {
    state.marqueeSelect = { active, startX, startY, endX, endY }
  },

  // 获取完全包含在某组件矩形内的子组件（锁定的组件不计入，避免被连带移动）
  getChildrenInsideComponent(parentId) {
    const parent = state.page.components.find(c => c.id === parentId)
    if (!parent) return []

    return state.page.components.filter(comp => {
      if (comp.id === parentId) return false
      if (comp.locked) return false
      return (
        comp.left >= parent.left &&
        comp.top >= parent.top &&
        comp.left + comp.width <= parent.left + parent.width &&
        comp.top + comp.height <= parent.top + parent.height
      )
    })
  },

  /**
   * 选中组件及其内部包含的所有组件（与画布上单击容器的行为一致）
   * 用于图层面板双击：把整组组件一起选中，便于整体移动/对齐
   * @param {string} id - 组件 id
   * @returns {number} 选中的组件数量
   */
  selectComponentWithChildren(id) {
    const parent = state.page.components.find(c => c.id === id)
    if (!parent) return 0

    const children = actions.getChildrenInsideComponent(id)
    const ids = [id, ...children.map(c => c.id)]
    actions.selectComponents(ids)
    return ids.length
  },

  // 移动多个组件（锁定的组件会被跳过）
  moveComponents(ids, deltaX, deltaY, originalPositions = {}) {
    ids.forEach(id => {
      const component = state.page.components.find(c => c.id === id)
      if (component && !component.locked) {
        const originalLeft = originalPositions[id]?.left ?? component.left
        const originalTop = originalPositions[id]?.top ?? component.top
        
        const snapResult = state.guides.snapEnabled ? 
          actions.getSnapPosition(
            originalLeft + deltaX,
            originalTop + deltaY,
            component.width,
            component.height,
            originalLeft,
            originalTop
          ) : 
          { x: originalLeft + deltaX, y: originalTop + deltaY }
        
        component.left = snapResult.x
        component.top = snapResult.y
      }
    })
  },

  // ==================== 对齐 / 分布 ====================

  /**
   * 对齐选中的多个组件（需选中 ≥ 2 个）
   * @param {'left'|'right'|'center-h'|'top'|'bottom'|'center-v'} type - 对齐方式
   * @returns {number} 受影响的组件数
   */
  alignComponents(type) {
    // 锁定的组件不参与批量移动
    const comps = actions.getSelectedComponents().filter(c => !c.locked)
    if (comps.length < 2) return 0

    saveHistory('alignComponents')

    const minLeft = Math.min(...comps.map(c => c.left))
    const maxRight = Math.max(...comps.map(c => c.left + c.width))
    const minTop = Math.min(...comps.map(c => c.top))
    const maxBottom = Math.max(...comps.map(c => c.top + c.height))
    const centerX = (minLeft + maxRight) / 2
    const centerY = (minTop + maxBottom) / 2

    comps.forEach(c => {
      switch (type) {
        case 'left':     c.left = minLeft; break
        case 'right':    c.left = maxRight - c.width; break
        case 'center-h': c.left = Math.round(centerX - c.width / 2); break
        case 'top':      c.top = minTop; break
        case 'bottom':   c.top = maxBottom - c.height; break
        case 'center-v': c.top = Math.round(centerY - c.height / 2); break
      }
    })
    return comps.length
  },

  /**
   * 等距分布选中的组件（需选中 ≥ 3 个）
   * 保持首尾组件不动，中间组件按等间距重新排布
   * @param {'h'|'v'} axis - 分布方向
   * @returns {number} 受影响的组件数
   */
  distributeComponents(axis) {
    // 锁定的组件不参与批量移动
    const comps = actions.getSelectedComponents().filter(c => !c.locked)
    if (comps.length < 3) return 0

    saveHistory('distributeComponents')

    if (axis === 'h') {
      const sorted = [...comps].sort((a, b) => a.left - b.left)
      const first = sorted[0]
      const last = sorted[sorted.length - 1]
      const span = (last.left + last.width) - first.left
      const totalWidth = sorted.reduce((sum, c) => sum + c.width, 0)
      const gap = (span - totalWidth) / (sorted.length - 1)
      let cursor = first.left + first.width + gap
      for (let i = 1; i < sorted.length - 1; i++) {
        sorted[i].left = Math.round(cursor)
        cursor = sorted[i].left + sorted[i].width + gap
      }
    } else {
      const sorted = [...comps].sort((a, b) => a.top - b.top)
      const first = sorted[0]
      const last = sorted[sorted.length - 1]
      const span = (last.top + last.height) - first.top
      const totalHeight = sorted.reduce((sum, c) => sum + c.height, 0)
      const gap = (span - totalHeight) / (sorted.length - 1)
      let cursor = first.top + first.height + gap
      for (let i = 1; i < sorted.length - 1; i++) {
        sorted[i].top = Math.round(cursor)
        cursor = sorted[i].top + sorted[i].height + gap
      }
    }
    return comps.length
  },

  // ==================== 复制 / 粘贴 / 微调 ====================

  /**
   * 复制选中的组件到内部剪贴板
   * @returns {number} 复制的组件数
   */
  copySelected() {
    const comps = actions.getSelectedComponents()
    if (comps.length === 0) return 0
    state.clipboard = JSON.parse(JSON.stringify(comps))
    return comps.length
  },

  /**
   * 粘贴剪贴板中的组件（带偏移，生成新 id 并选中）
   * @param {number} offset - 粘贴位置偏移（px）
   * @returns {number} 粘贴的组件数
   */
  pasteClipboard(offset = 20) {
    if (!state.clipboard || state.clipboard.length === 0) return 0

    saveHistory('pasteComponents')

    const pasted = state.clipboard.map(item => {
      const copy = JSON.parse(JSON.stringify(item))
      copy.id = generateId(copy.type)
      copy.left = (copy.left || 0) + offset
      copy.top = (copy.top || 0) + offset
      return copy
    })

    state.page.components.push(...pasted)
    state.selectedIds = pasted.map(c => c.id)
    state.selectedId = pasted[0].id
    return pasted.length
  },

  /**
   * 原地再制选中的组件（复制 + 粘贴）
   * @param {number} offset - 偏移量
   * @returns {number} 新组件数
   */
  duplicateSelected(offset = 20) {
    const count = actions.copySelected()
    if (count === 0) return 0
    return actions.pasteClipboard(offset)
  },

  /**
   * 全选页面组件
   * @returns {number} 选中数量
   */
  selectAll() {
    state.selectedIds = state.page.components.filter(c => !c.locked).map(c => c.id)
    state.selectedId = state.selectedIds[0] || null
    return state.selectedIds.length
  },

  /**
   * 方向键微调选中组件位置
   * @param {number} dx - 水平位移
   * @param {number} dy - 垂直位移
   * @param {boolean} recordHistory - 是否记录历史（连续微调时只在首次记录）
   * @returns {number} 受影响组件数
   */
  nudgeSelected(dx, dy, recordHistory = true) {
    // 锁定的组件不参与微调
    const comps = actions.getSelectedComponents().filter(c => !c.locked)
    if (comps.length === 0) return 0

    if (recordHistory) saveHistory('nudgeComponents')

    comps.forEach(c => {
      c.left = Math.round(c.left + dx)
      c.top = Math.round(c.top + dy)
    })
    return comps.length
  },

  /**
   * 删除当前选中的全部组件（一次撤销即可恢复）
   * @returns {number} 删除的组件数
   */
  removeSelected() {
    // 锁定的组件不会被删除
    const ids = (state.selectedIds.length
      ? [...state.selectedIds]
      : (state.selectedId ? [state.selectedId] : [])
    ).filter(id => {
      const comp = state.page.components.find(c => c.id === id)
      return comp && !comp.locked
    })
    if (ids.length === 0) return 0

    saveHistory('removeComponents')

    state.page.components = state.page.components.filter(c => !ids.includes(c.id))
    state.selectedId = null
    state.selectedIds = []
    return ids.length
  },

  // ==================== 图层管理 ====================

  /**
   * 取按绘制顺序（底 → 顶）排列的组件
   * 规则：zIndex 升序；zIndex 相同时按数组顺序（越靠后越靠上）
   * @returns {Array} 新数组（元素为原组件对象引用）
   */
  getPaintOrderedComponents() {
    return [...state.page.components]
      .map((comp, index) => ({ comp, index }))
      .sort((a, b) => ((a.comp.zIndex || 3) - (b.comp.zIndex || 3)) || (a.index - b.index))
      .map(item => item.comp)
  },

  // 设置组件可见性
  setComponentVisible(id, visible) {
    const comp = state.page.components.find(c => c.id === id)
    if (!comp) return false
    saveHistory('setComponentVisible', id)
    comp.visible = visible !== false
    return true
  },

  // 切换组件可见性
  toggleComponentVisible(id) {
    const comp = state.page.components.find(c => c.id === id)
    if (!comp) return false
    return actions.setComponentVisible(id, comp.visible === false)
  },

  // 设置组件锁定状态（锁定后画布上不可拖动/缩放，也不会被批量操作移动）
  setComponentLocked(id, locked) {
    const comp = state.page.components.find(c => c.id === id)
    if (!comp) return false
    saveHistory('setComponentLocked', id)
    comp.locked = locked === true
    // 锁定后从选中集合中移除，避免误操作
    if (comp.locked) {
      state.selectedIds = state.selectedIds.filter(x => x !== id)
      if (state.selectedId === id) state.selectedId = state.selectedIds[0] || null
    }
    return true
  },

  // 切换组件锁定状态
  toggleComponentLocked(id) {
    const comp = state.page.components.find(c => c.id === id)
    if (!comp) return false
    return actions.setComponentLocked(id, !comp.locked)
  },

  // 重命名组件（图层列表中显示的名称）
  renameComponent(id, name) {
    const comp = state.page.components.find(c => c.id === id)
    if (!comp) return false
    const cleaned = String(name || '').trim()
    if (!cleaned || cleaned === comp.name) return false
    saveHistory('renameComponent', id)
    comp.name = cleaned
    return true
  },

  /**
   * 按给定顺序重排图层，并归一化 zIndex，使「面板顺序 = 最终叠放顺序」
   * @param {string[]} orderedIds - 自底向顶的组件 id 顺序
   * @returns {number} 参与重排的组件数
   */
  reorderComponents(orderedIds) {
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) return 0

    const map = new Map(state.page.components.map(c => [c.id, c]))
    const ordered = orderedIds.map(id => map.get(id)).filter(Boolean)
    if (ordered.length === 0) return 0

    // 未出现在 orderedIds 中的组件保持原相对顺序，追加到最上层
    const rest = state.page.components.filter(c => !orderedIds.includes(c.id))
    const finalList = [...ordered, ...rest]

    saveHistory('reorderComponents')

    // 归一化：最底层 = 1，向上递增
    finalList.forEach((comp, index) => {
      comp.zIndex = index + 1
    })
    state.page.components = finalList
    return finalList.length
  },

  /**
   * 调整单个组件的图层位置
   * @param {string} id - 组件 id
   * @param {'up'|'down'|'top'|'bottom'} direction - 方向
   * @returns {boolean} 是否发生变化
   */
  moveComponentLayer(id, direction) {
    const ordered = actions.getPaintOrderedComponents()
    const index = ordered.findIndex(c => c.id === id)
    if (index === -1) return false

    const targetIndex = {
      up: Math.min(ordered.length - 1, index + 1),
      down: Math.max(0, index - 1),
      top: ordered.length - 1,
      bottom: 0
    }[direction]
    if (targetIndex === index) return false

    const next = [...ordered]
    const [moved] = next.splice(index, 1)
    next.splice(targetIndex, 0, moved)
    actions.reorderComponents(next.map(c => c.id))
    return true
  },

  // 设置图层 hover 高亮（面板 ↔ 画布联动）
  setHoveredId(id) {
    state.hoveredId = id
  },

  // ==================== 画布 / 页面管理 ====================

  // 取当前激活画布
  getActiveCanvas() {
    return getActiveCanvas()
  },

  // 取当前画布的所有页面
  getCanvasPages() {
    const canvas = getActiveCanvas()
    return canvas ? canvas.pages : []
  },

  // 取项目内所有页面（跨画布，用于"跳转到页面"选择器）
  getAllPages() {
    const out = []
    ;(state.project.canvases || []).forEach(canvas => {
      ;(canvas.pages || []).forEach(page => {
        out.push({ canvasId: canvas.id, canvasName: canvas.name, pageId: page.id, pageName: page.name })
      })
    })
    return out
  },

  /**
   * 生成"跳转到页面"的链接值
   * 导出时会被重写为目标页面的文件名（同画布内），因此可以跨组件通用
   * @param {string} pageId - 目标页面 id
   */
  getPageLink(pageId) {
    return `#page:${pageId}`
  },

  // 切换画布
  switchCanvas(canvasId) {
    const canvas = state.project.canvases.find(c => c.id === canvasId)
    if (!canvas) return false
    state.activeCanvasId = canvas.id
    state.activePageId = canvas.pages[0] ? canvas.pages[0].id : null
    actions.deselectComponent()
    syncActivePage()
    return true
  },

  // 新建画布（完全独立的空间，含一个空白首页）
  addCanvas(name) {
    saveHistory('addCanvas', null, 'project')
    const canvas = createCanvasState(name || `画布 ${state.project.canvases.length + 1}`, '首页')
    state.project.canvases.push(canvas)
    actions.switchCanvas(canvas.id)
    return canvas
  },

  // 重命名画布
  renameCanvas(canvasId, name) {
    const canvas = state.project.canvases.find(c => c.id === canvasId)
    const cleaned = String(name || '').trim()
    if (!canvas || !cleaned || canvas.name === cleaned) return false
    saveHistory('renameCanvas', null, 'project')
    canvas.name = cleaned
    return true
  },

  // 删除画布（至少保留一个）
  removeCanvas(canvasId) {
    if (state.project.canvases.length <= 1) return false
    const index = state.project.canvases.findIndex(c => c.id === canvasId)
    if (index === -1) return false

    saveHistory('removeCanvas', null, 'project')
    state.project.canvases.splice(index, 1)

    if (state.activeCanvasId === canvasId) {
      const next = state.project.canvases[Math.max(0, index - 1)]
      state.activeCanvasId = next.id
      state.activePageId = next.pages[0] ? next.pages[0].id : null
      actions.deselectComponent()
      syncActivePage()
    }
    return true
  },

  // 切换页面
  switchPage(pageId) {
    const canvas = getActiveCanvas()
    if (!canvas || !canvas.pages.some(p => p.id === pageId)) return false
    state.activePageId = pageId
    actions.deselectComponent()
    syncActivePage()
    return true
  },

  // 新建页面（加入当前画布并切换过去）
  addPage(name) {
    const canvas = getActiveCanvas()
    if (!canvas) return null
    saveHistory('addPage', null, 'project')
    const page = createPageState(name || `页面 ${canvas.pages.length + 1}`)
    canvas.pages.push(page)
    actions.switchPage(page.id)
    return page
  },

  // 重命名页面
  renamePage(pageId, name) {
    const canvas = getActiveCanvas()
    const page = canvas && canvas.pages.find(p => p.id === pageId)
    const cleaned = String(name || '').trim()
    if (!page || !cleaned || page.name === cleaned) return false
    saveHistory('renamePage', null, 'project')
    page.name = cleaned
    return true
  },

  /**
   * 复制页面（深拷贝页面与组件，重新生成页面与组件 id）
   * @returns {Object|null} 新页面
   */
  duplicatePage(pageId) {
    const canvas = getActiveCanvas()
    if (!canvas) return null
    const index = canvas.pages.findIndex(p => p.id === pageId)
    if (index === -1) return null

    saveHistory('duplicatePage', null, 'project')
    const copy = JSON.parse(JSON.stringify(canvas.pages[index]))
    copy.id = generatePageId()
    copy.name = `${copy.name} 副本`
    copy.components = (copy.components || []).map(comp => ({
      ...comp,
      id: generateId(comp.type)
    }))

    canvas.pages.splice(index + 1, 0, copy)
    actions.switchPage(copy.id)
    return copy
  },

  // 删除页面（每个画布至少保留一页）
  removePage(pageId) {
    const canvas = getActiveCanvas()
    if (!canvas || canvas.pages.length <= 1) return false
    const index = canvas.pages.findIndex(p => p.id === pageId)
    if (index === -1) return false

    saveHistory('removePage', null, 'project')
    canvas.pages.splice(index, 1)

    if (state.activePageId === pageId) {
      const next = canvas.pages[Math.max(0, index - 1)]
      state.activePageId = next.id
      actions.deselectComponent()
      syncActivePage()
    }
    return true
  },

  // 调整页面顺序（'left' | 'right'）
  movePage(pageId, direction) {
    const canvas = getActiveCanvas()
    if (!canvas) return false
    const index = canvas.pages.findIndex(p => p.id === pageId)
    if (index === -1) return false

    const target = direction === 'left' ? index - 1 : index + 1
    if (target < 0 || target >= canvas.pages.length) return false

    saveHistory('movePage', null, 'project')
    const [page] = canvas.pages.splice(index, 1)
    canvas.pages.splice(target, 0, page)
    return true
  },

  /**
   * 应用 AI 生成的多页站点
   * 在当前画布中创建这些页面（分配新 id），并把组件里以页面名书写的
   * 跨页链接（`#page:关于我们`）解析为真实页面 id
   * @param {Array} pages - 页面数据数组（来自 parseAiSiteResponse）
   * @param {Object} [options]
   * @param {boolean} [options.replace=false] - 是否替换当前画布已有页面
   * @returns {{created: number, replaced: boolean, pageNames: string[], linkStats: {total: number, unresolved: number}}|null}
   */
  applySitePages(pages, options = {}) {
    const canvas = getActiveCanvas()
    if (!canvas || !Array.isArray(pages) || pages.length === 0) return null

    saveHistory('applySitePages', null, 'project')

    // 1. 规范化并分配新 id（忽略 AI 传来的 id，避免与已有页面冲突）
    const created = pages.map(pageData => {
      const page = normalizePageData({ ...pageData, id: undefined })
      const name = String(pageData?.name || '').trim()
      if (name) page.name = name
      return page
    })

    // 2. 建立「页面名 → 新 id」索引，并解析组件里的跨页链接
    const nameIndex = buildPageNameIndex(created)
    resolvePagesPageLinks(created, nameIndex)

    // 3. 写入画布
    if (options.replace) {
      canvas.pages = created
    } else {
      canvas.pages.push(...created)
    }

    // 4. 切到第一个新页面
    state.activePageId = created[0].id
    actions.deselectComponent()
    syncActivePage()

    // 5. 统计链接串联情况（未解析的数量会提示用户）
    const validIds = new Set(created.map(p => p.id))
    const linkStats = countPageLinks(created, validIds)

    return {
      created: created.length,
      replaced: !!options.replace,
      pageIds: created.map(p => p.id),
      pageNames: created.map(p => p.name),
      linkStats
    }
  },

  // 更新组件属性
  updateComponent(id, updates) {
    const component = state.page.components.find(c => c.id === id)
    if (component) {
      // 保存历史记录
      saveHistory('updateComponent', id)
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

  // 设置当前拖拽的组件 ID
  setDraggingId(id) {
    state.draggingId = id
  },

  // 清除拖拽状态
  clearDraggingId() {
    state.draggingId = null
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
      const value = Number(zIndex)
      // 非法值（如输入框清空产生的 NaN）直接忽略
      if (!Number.isFinite(value)) return
      // 保存历史记录
      saveHistory('updateZIndex', id)
      // 限制层级范围（图层面板重排后会使用较大的连续值）
      component.zIndex = Math.max(1, Math.min(999, Math.round(value)))
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
    saveHistory('updatePageSize')
    state.page.width = Math.max(320, Math.min(3840, width))
    state.page.height = Math.max(200, Math.min(8000, height))
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
    saveHistory('updatePage')
    Object.assign(state.page, updates)
  },

  // 重置当前页面（清空组件、恢复默认页面设置，保留页面 id 与名称）
  resetPage() {
    saveHistory('resetPage')
    const keepId = state.page.id
    const keepName = state.page.name
    const newPage = createPageState(keepName)
    Object.assign(state.page, newPage)
    // 保留页面 id：页面之间的跳转链接依赖它，不能被重置改掉
    state.page.id = keepId
    state.page.components = []
    state.selectedId = null
    state.selectedIds = []
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
      backgroundType: state.page.backgroundType,
      backgroundGradientStart: state.page.backgroundGradientStart,
      backgroundGradientEnd: state.page.backgroundGradientEnd,
      backgroundGradientAngle: state.page.backgroundGradientAngle,
      backgroundImage: state.page.backgroundImage,
      backgroundImageSize: state.page.backgroundImageSize,
      backgroundImagePosition: state.page.backgroundImagePosition,
      backgroundImageRepeat: state.page.backgroundImageRepeat,
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

      saveHistory('importPageJSON')

      // 更新页面属性
      if (data.name) state.page.name = data.name
      if (data.width) state.page.width = data.width
      if (data.height) state.page.height = data.height
      if (data.backgroundColor) state.page.backgroundColor = data.backgroundColor
      if (data.backgroundType) state.page.backgroundType = data.backgroundType
      if (data.backgroundGradientStart) state.page.backgroundGradientStart = data.backgroundGradientStart
      if (data.backgroundGradientEnd) state.page.backgroundGradientEnd = data.backgroundGradientEnd
      if (data.backgroundGradientAngle) state.page.backgroundGradientAngle = data.backgroundGradientAngle
      if (data.backgroundImage) state.page.backgroundImage = data.backgroundImage
      if (data.backgroundImageSize) state.page.backgroundImageSize = data.backgroundImageSize
      if (data.backgroundImagePosition) state.page.backgroundImagePosition = data.backgroundImagePosition
      if (data.backgroundImageRepeat) state.page.backgroundImageRepeat = data.backgroundImageRepeat
      
      // 规范化并过滤未知组件类型
      const normalized = data.components
        .map(comp => actions.normalizeComponentConfig(comp))
        .filter(Boolean)
      state.page.components = normalized
      
      state.selectedId = null
      return { success: true, message: `页面导入成功（${normalized.length} 个组件）` }
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

      saveHistory('importLayoutJSON')
      
      // 规范化并添加导入的组件（不清空现有组件，未知类型自动剔除）
      data.components.forEach(comp => {
        const normalized = actions.normalizeComponentConfig(comp)
        if (normalized) state.page.components.push(normalized)
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

    // 保存当前状态到重做栈（范围与即将恢复的快照一致）
    const target = state.undoStack[state.undoStack.length - 1]
    const scope = target?.scope === 'project' ? 'project' : 'page'
    state.redoStack.push({
      timestamp: Date.now(),
      actionType: 'undo',
      scope,
      pageId: scope === 'page' ? (state.page ? state.page.id : null) : null,
      page: scope === 'page' ? createPageSnapshot() : null,
      project: scope === 'project' ? createProjectSnapshot() : null,
      selectedId: state.selectedId
    })

    // 从撤销栈弹出上一个状态并恢复
    const previousState = state.undoStack.pop()
    if (!restoreSnapshot(previousState)) {
      state.redoStack.pop()
      return false
    }

    return true
  },

  // 重做
  redo() {
    if (state.redoStack.length === 0) return false

    // 保存当前状态到撤销栈（范围与即将恢复的快照一致）
    const target = state.redoStack[state.redoStack.length - 1]
    const scope = target?.scope === 'project' ? 'project' : 'page'
    state.undoStack.push({
      timestamp: Date.now(),
      actionType: 'redo',
      scope,
      pageId: scope === 'page' ? (state.page ? state.page.id : null) : null,
      page: scope === 'page' ? createPageSnapshot() : null,
      project: scope === 'project' ? createProjectSnapshot() : null,
      selectedId: state.selectedId
    })

    // 从重做栈弹出下一个状态并恢复
    const nextState = state.redoStack.pop()
    if (!restoreSnapshot(nextState)) {
      state.undoStack.pop()
      return false
    }

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

  // ==================== 历史版本快照 ====================

  // 列出已保存的历史版本（不含完整数据）
  listVersionSnapshots() {
    return listVersions()
  },

  /**
   * 把当前项目保存为一个历史版本
   * @param {string} [name] - 版本名称
   * @returns {{ok: boolean, item?: Object, message?: string}}
   */
  saveVersionSnapshot(name) {
    return saveVersion({
      name,
      project: state.project,
      activeCanvasId: state.activeCanvasId,
      activePageId: state.activePageId
    })
  },

  /**
   * 恢复到某个历史版本
   * 恢复前会把当前状态压入撤销栈，因此可以用 Ctrl+Z 退回
   * @param {string} id - 版本 id
   * @returns {{ok: boolean, message?: string}}
   */
  restoreVersionSnapshot(id) {
    const data = getVersion(id)
    if (!data || !data.project || !Array.isArray(data.project.canvases)) {
      return { ok: false, message: '版本不存在或已损坏' }
    }

    saveHistory('restoreVersion', null, 'project')

    state.project = JSON.parse(JSON.stringify(data.project))

    // 容错：版本里的激活画布/页面可能已不存在
    state.activeCanvasId = state.project.canvases.some(c => c.id === data.activeCanvasId)
      ? data.activeCanvasId
      : (state.project.canvases[0] ? state.project.canvases[0].id : null)

    const canvas = state.project.canvases.find(c => c.id === state.activeCanvasId)
    state.activePageId = (canvas?.pages || []).some(p => p.id === data.activePageId)
      ? data.activePageId
      : (canvas?.pages?.[0] ? canvas.pages[0].id : null)

    actions.deselectComponent()
    syncActivePage()
    return { ok: true }
  },

  // 重命名历史版本
  renameVersionSnapshot(id, name) {
    return renameVersion(id, name)
  },

  // 删除历史版本
  removeVersionSnapshot(id) {
    return removeVersion(id)
  },

  // 清空全部历史版本
  clearVersionSnapshots() {
    return clearVersions()
  },

  // 历史版本占用的存储空间（字节）
  getVersionSnapshotsSize() {
    return getVersionsSize()
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

// ==================== 草稿持久化 ====================

// 保存项目草稿（localStorage，含所有画布与页面）
function savePageDraft() {
  try {
    const payload = {
      version: '2.0',
      savedAt: Date.now(),
      project: JSON.parse(JSON.stringify(state.project)),
      activeCanvasId: state.activeCanvasId,
      activePageId: state.activePageId
    }
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload))
    state.draftSavedAt = payload.savedAt
    state.draftSaving = false
    return true
  } catch (error) {
    console.warn('草稿保存失败:', error)
    state.draftSaving = false
    return false
  }
}

// 从本地存储恢复草稿（应用启动时调用；兼容旧版单页草稿）
function loadPageDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY)
    if (!raw) return { found: false }

    const payload = JSON.parse(raw)
    if (!payload) return { found: false }

    // ---------- 旧版单页草稿（version 1.0）→ 迁移为「一个画布 + 一个页面」 ----------
    if (payload.page && !payload.project) {
      const page = normalizePageData(payload.page)
      const canvas = { id: generateId('canvas'), name: '画布 1', pages: [page] }

      state.project = { id: generatePageId(), name: '未命名项目', canvases: [canvas] }
      state.activeCanvasId = canvas.id
      state.activePageId = page.id
      syncActivePage()

      state.selectedId = null
      state.selectedIds = []
      state.draftRestored = true
      state.draftSavedAt = payload.savedAt
      return { found: true, savedAt: payload.savedAt, componentCount: page.components.length, migrated: true }
    }

    if (!payload.project || !Array.isArray(payload.project.canvases) || payload.project.canvases.length === 0) {
      return { found: false }
    }

    // ---------- 规范化项目结构 ----------
    const project = {
      id: typeof payload.project.id === 'string' ? payload.project.id : generatePageId(),
      name: typeof payload.project.name === 'string' ? payload.project.name : '未命名项目',
      canvases: payload.project.canvases.map(canvas => {
        const pages = Array.isArray(canvas.pages) && canvas.pages.length > 0 ? canvas.pages : [{}]
        return {
          id: typeof canvas.id === 'string' ? canvas.id : generateId('canvas'),
          name: typeof canvas.name === 'string' ? canvas.name : '未命名画布',
          pages: pages.map(normalizePageData)
        }
      })
    }

    state.project = project

    // 恢复激活的画布 / 页面（找不到则回退到第一个）
    state.activeCanvasId = project.canvases.some(c => c.id === payload.activeCanvasId)
      ? payload.activeCanvasId
      : project.canvases[0].id

    const canvas = project.canvases.find(c => c.id === state.activeCanvasId)
    state.activePageId = canvas.pages.some(p => p.id === payload.activePageId)
      ? payload.activePageId
      : canvas.pages[0].id

    syncActivePage()

    state.selectedId = null
    state.selectedIds = []
    state.draftRestored = true
    state.draftSavedAt = payload.savedAt
    return {
      found: true,
      savedAt: payload.savedAt,
      componentCount: state.page ? state.page.components.length : 0,
      canvasCount: project.canvases.length,
      pageCount: canvas.pages.length
    }
  } catch (error) {
    console.warn('草稿恢复失败:', error)
    return { found: false }
  }
}

// 清除草稿
function clearPageDraft() {
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY)
  } catch (error) {
    console.warn('清除草稿失败:', error)
  }
  state.draftRestored = false
  state.draftSavedAt = null
}

// ==================== 自动保存（防抖） ====================

let draftSaveTimer = null

// 项目 / 页面数据变化后防抖自动保存草稿
// 注意：监听整个 project（而不只是 state.page），这样切换画布/页面、
// 增删页面、重命名等结构性改动同样会被保存
watch(
  [() => state.project, () => state.activeCanvasId, () => state.activePageId],
  () => {
    state.draftSaving = true
    clearTimeout(draftSaveTimer)
    draftSaveTimer = setTimeout(() => {
      savePageDraft()
    }, 500)
  },
  { deep: true }
)

// 组合式 API 导出
export function useEditor() {
  return {
    // 状态（只读）
    // 注意：page 是 computed，切换画布/页面后会自动指向新页面
    // （模板里会自动解包，脚本里需要用 page.value）
    page: computed(() => state.page),

    // 项目 / 画布 / 页面
    project: computed(() => state.project),
    canvases: computed(() => state.project.canvases || []),
    activeCanvasId: computed(() => state.activeCanvasId),
    activePageId: computed(() => state.activePageId),
    activeCanvas: computed(() => getActiveCanvas()),
    pages: computed(() => {
      const canvas = getActiveCanvas()
      return canvas ? canvas.pages : []
    }),

    selectedId: computed(() => state.selectedId),
    selectedIds: computed(() => state.selectedIds),
    selectedComponent,
    zoom: computed(() => state.zoom),
    previewMode: computed(() => state.previewMode),
    draggingType: computed(() => state.draggingType),
    draggingId: computed(() => state.draggingId),
    componentCount,
    clipboardCount,

    // 图层（自底向顶的绘制顺序）与 hover 高亮
    orderedComponents: computed(() => actions.getPaintOrderedComponents()),
    hoveredId: computed(() => state.hoveredId),

    // 草稿状态
    draftRestored: computed(() => state.draftRestored),
    draftSavedAt: computed(() => state.draftSavedAt),
    draftSaving: computed(() => state.draftSaving),
    
    // 辅助线状态
    guides: computed(() => state.guides),
    guidesVisible: computed(() => state.guides.visible),
    guidesList: computed(() => state.guides.lines),
    snapEnabled: computed(() => state.guides.snapEnabled),
    snapDistance: computed(() => state.guides.snapDistance),
    snapMode: computed(() => state.guides.snapMode),
    snapBlockDistance: computed(() => state.guides.snapBlockDistance),
    selectedGuideId: computed(() => state.guides.selectedGuideId),

    // 框选状态
    marqueeSelect: computed(() => state.marqueeSelect),

    // 方法
    ...actions,
    savePageDraft,
    loadPageDraft,
    clearPageDraft
  }
}

export { state as editorState }
