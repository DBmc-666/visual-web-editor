<script setup>
import { ref } from 'vue'
import { useEditor, COMPONENT_DEFAULTS, COMPONENT_CATEGORIES } from '../../stores/editor'
import LayerPanel from './LayerPanel.vue'

const { addComponent, setDraggingType, clearDraggingType, applyPageTemplate, applyComponents, page } = useEditor()

// 当前激活的标签页
const activeTab = ref('components')

// 当前展开的分类
const expandedCategories = ref(['basic'])

// 标签页配置
const tabs = [
  { key: 'components', label: '组件', icon: '📦' },
  { key: 'layers', label: '图层', icon: '🧩' },
  { key: 'pages', label: '页面', icon: '📄' },
  { key: 'layouts', label: '布局', icon: '🧱' }
]

// 获取组件图标
function getIcon(type) {
  const icons = {
    text: 'T',
    image: '图',
    button: '钮',
    container: '框',
    link: '链',
    datetime: '时',
    loginForm: '登',
    registerForm: '注',
    contactForm: '联',
    searchForm: '搜',
    commentForm: '评',
    customForm: '自',
    // 导航组件
    navMenu: '导',
    breadcrumb: '屑',
    tabs: '页',
    // 内容组件（扩展）
    divider: '线',
    icon: '标',
    list: '列',
    table: '表',
    video: '视',
    carousel: '播',
    // 展示组件（扩展）
    progress: '进',
    accordion: '折',
    badge: '签',
    stat: '计'
  }
  return icons[type] || '○'
}

// 切换分类展开状态
function toggleCategory(categoryKey) {
  const index = expandedCategories.value.indexOf(categoryKey)
  if (index > -1) {
    expandedCategories.value.splice(index, 1)
  } else {
    expandedCategories.value.push(categoryKey)
  }
}

// 预设页面（完整网页模板）
import { PRESET_PAGES as presetPages } from '../../utils/presetPages.js'

// 预设布局（模块化容器，可添加到现有页面）
const presetLayouts = [
  { 
    name: '卡片组(3列)', 
    icon: '卡',
    offsetX: 0,
    offsetY: 0,
    components: [
      { type: 'container', left: 0, top: 0, width: 300, height: 220, style: { backgroundColor: '#ffffff', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }, props: {}, zIndex: 1 },
      { type: 'container', left: 320, top: 0, width: 300, height: 220, style: { backgroundColor: '#ffffff', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }, props: {}, zIndex: 1 },
      { type: 'container', left: 640, top: 0, width: 300, height: 220, style: { backgroundColor: '#ffffff', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }, props: {}, zIndex: 1 },
      { type: 'image', left: 20, top: 20, width: 260, height: 100, style: { borderRadius: 4, backgroundColor: '#f0f0f0' }, props: { src: 'https://via.placeholder.com/260x100', alt: '卡片图片' }, zIndex: 2 },
      { type: 'image', left: 340, top: 20, width: 260, height: 100, style: { borderRadius: 4, backgroundColor: '#f0f0f0' }, props: { src: 'https://via.placeholder.com/260x100', alt: '卡片图片' }, zIndex: 2 },
      { type: 'image', left: 660, top: 20, width: 260, height: 100, style: { borderRadius: 4, backgroundColor: '#f0f0f0' }, props: { src: 'https://via.placeholder.com/260x100', alt: '卡片图片' }, zIndex: 2 },
      { type: 'text', left: 20, top: 130, width: 260, height: 28, style: { fontSize: 16, fontWeight: 'bold', color: '#333333' }, props: { content: '卡片标题' }, zIndex: 2 },
      { type: 'text', left: 340, top: 130, width: 260, height: 28, style: { fontSize: 16, fontWeight: 'bold', color: '#333333' }, props: { content: '卡片标题' }, zIndex: 2 },
      { type: 'text', left: 660, top: 130, width: 260, height: 28, style: { fontSize: 16, fontWeight: 'bold', color: '#333333' }, props: { content: '卡片标题' }, zIndex: 2 },
      { type: 'text', left: 20, top: 165, width: 260, height: 50, style: { fontSize: 14, color: '#666666', lineHeight: '1.5' }, props: { content: '卡片内容描述，简短介绍卡片的主要信息。' }, zIndex: 2 },
      { type: 'text', left: 340, top: 165, width: 260, height: 50, style: { fontSize: 14, color: '#666666', lineHeight: '1.5' }, props: { content: '卡片内容描述，简短介绍卡片的主要信息。' }, zIndex: 2 },
      { type: 'text', left: 660, top: 165, width: 260, height: 50, style: { fontSize: 14, color: '#666666', lineHeight: '1.5' }, props: { content: '卡片内容描述，简短介绍卡片的主要信息。' }, zIndex: 2 },
    ]
  },
  { 
    name: '图文展示', 
    icon: '图',
    offsetX: 0,
    offsetY: 0,
    components: [
      { type: 'image', left: 0, top: 0, width: 400, height: 300, style: { borderRadius: 8, backgroundColor: '#f0f0f0' }, props: { src: 'https://via.placeholder.com/400x300', alt: '展示图片' }, zIndex: 1 },
      { type: 'text', left: 420, top: 20, width: 360, height: 36, style: { fontSize: 24, fontWeight: 'bold', color: '#333333' }, props: { content: '标题区域' }, zIndex: 2 },
      { type: 'text', left: 420, top: 70, width: 360, height: 150, style: { fontSize: 15, color: '#555555', lineHeight: '1.8' }, props: { content: '详细描述内容，介绍图片相关的信息和说明。可以是产品介绍、文章摘要或其他内容。' }, zIndex: 2 },
      { type: 'button', left: 420, top: 240, width: 120, height: 40, style: { backgroundColor: '#1890ff', color: '#ffffff', borderRadius: 4, fontSize: 14, textAlign: 'center', lineHeight: '40px' }, props: { content: '了解更多', actionType: 'link', href: '#', target: '_self' }, zIndex: 2 },
    ]
  },
  { 
    name: '功能特性', 
    icon: '功',
    offsetX: 0,
    offsetY: 0,
    components: [
      { type: 'text', left: 0, top: 0, width: 800, height: 40, style: { fontSize: 28, fontWeight: 'bold', color: '#333333', textAlign: 'center' }, props: { content: '核心功能' }, zIndex: 1 },
      { type: 'container', left: 0, top: 60, width: 180, height: 200, style: { backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }, props: {}, zIndex: 1 },
      { type: 'container', left: 200, top: 60, width: 180, height: 200, style: { backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }, props: {}, zIndex: 1 },
      { type: 'container', left: 400, top: 60, width: 180, height: 200, style: { backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }, props: {}, zIndex: 1 },
      { type: 'container', left: 600, top: 60, width: 180, height: 200, style: { backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }, props: {}, zIndex: 1 },
      { type: 'text', left: 50, top: 100, width: 80, height: 40, style: { fontSize: 28, color: '#1890ff', textAlign: 'center' }, props: { content: '⚡' }, zIndex: 2 },
      { type: 'text', left: 250, top: 100, width: 80, height: 40, style: { fontSize: 28, color: '#1890ff', textAlign: 'center' }, props: { content: '🔒' }, zIndex: 2 },
      { type: 'text', left: 450, top: 100, width: 80, height: 40, style: { fontSize: 28, color: '#1890ff', textAlign: 'center' }, props: { content: '📊' }, zIndex: 2 },
      { type: 'text', left: 650, top: 100, width: 80, height: 40, style: { fontSize: 28, color: '#1890ff', textAlign: 'center' }, props: { content: '🛡️' }, zIndex: 2 },
      { type: 'text', left: 20, top: 150, width: 140, height: 28, style: { fontSize: 16, fontWeight: 'bold', color: '#333333', textAlign: 'center' }, props: { content: '高效快捷' }, zIndex: 2 },
      { type: 'text', left: 220, top: 150, width: 140, height: 28, style: { fontSize: 16, fontWeight: 'bold', color: '#333333', textAlign: 'center' }, props: { content: '安全可靠' }, zIndex: 2 },
      { type: 'text', left: 420, top: 150, width: 140, height: 28, style: { fontSize: 16, fontWeight: 'bold', color: '#333333', textAlign: 'center' }, props: { content: '数据可视' }, zIndex: 2 },
      { type: 'text', left: 620, top: 150, width: 140, height: 28, style: { fontSize: 16, fontWeight: 'bold', color: '#333333', textAlign: 'center' }, props: { content: '隐私保护' }, zIndex: 2 },
      { type: 'text', left: 20, top: 185, width: 140, height: 60, style: { fontSize: 14, color: '#666666', textAlign: 'center', lineHeight: '1.4' }, props: { content: '性能卓越\n响应迅速' }, zIndex: 2 },
      { type: 'text', left: 220, top: 185, width: 140, height: 60, style: { fontSize: 14, color: '#666666', textAlign: 'center', lineHeight: '1.4' }, props: { content: '加密传输\n值得信赖' }, zIndex: 2 },
      { type: 'text', left: 420, top: 185, width: 140, height: 60, style: { fontSize: 14, color: '#666666', textAlign: 'center', lineHeight: '1.4' }, props: { content: '图表丰富\n一目了然' }, zIndex: 2 },
      { type: 'text', left: 620, top: 185, width: 140, height: 60, style: { fontSize: 14, color: '#666666', textAlign: 'center', lineHeight: '1.4' }, props: { content: '数据加密\n安全无忧' }, zIndex: 2 },
    ]
  },
  { 
    name: '定价方案', 
    icon: '价',
    offsetX: 0,
    offsetY: 0,
    components: [
      { type: 'container', left: 0, top: 0, width: 260, height: 380, style: { backgroundColor: '#f5f5f5', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }, props: {}, zIndex: 1 },
      { type: 'container', left: 280, top: 0, width: 260, height: 400, style: { backgroundColor: '#1890ff', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }, props: {}, zIndex: 1 },
      { type: 'container', left: 560, top: 0, width: 260, height: 380, style: { backgroundColor: '#ff4d4f', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }, props: {}, zIndex: 1 },
      { type: 'text', left: 80, top: 30, width: 100, height: 28, style: { fontSize: 18, fontWeight: 'bold', color: '#333333', textAlign: 'center' }, props: { content: '基础版' }, zIndex: 2 },
      { type: 'text', left: 100, top: 80, width: 60, height: 40, style: { fontSize: 32, fontWeight: 'bold', color: '#333333', textAlign: 'center' }, props: { content: '¥99' }, zIndex: 2 },
      { type: 'text', left: 50, top: 140, width: 160, height: 100, style: { fontSize: 14, color: '#666666', lineHeight: '2' }, props: { content: '• 基础功能\n• 5GB存储\n• 基础支持\n• 1年使用' }, zIndex: 2 },
      { type: 'button', left: 50, top: 280, width: 160, height: 40, style: { backgroundColor: '#ffffff', color: '#333333', borderRadius: 4, fontSize: 14, textAlign: 'center', lineHeight: '40px' }, props: { content: '选择方案', actionType: 'link', href: '#', target: '_self' }, zIndex: 2 },
      { type: 'text', left: 360, top: 30, width: 100, height: 28, style: { fontSize: 18, fontWeight: 'bold', color: '#ffffff', textAlign: 'center' }, props: { content: '专业版' }, zIndex: 2 },
      { type: 'text', left: 380, top: 80, width: 60, height: 40, style: { fontSize: 32, fontWeight: 'bold', color: '#ffffff', textAlign: 'center' }, props: { content: '¥199' }, zIndex: 2 },
      { type: 'text', left: 330, top: 140, width: 160, height: 120, style: { fontSize: 14, color: '#ffffff', lineHeight: '2' }, props: { content: '• 全部功能\n• 50GB存储\n• 优先支持\n• 无限使用\n• 专属服务' }, zIndex: 2 },
      { type: 'button', left: 330, top: 300, width: 160, height: 40, style: { backgroundColor: '#ffffff', color: '#1890ff', borderRadius: 4, fontSize: 14, fontWeight: 'bold', textAlign: 'center', lineHeight: '40px' }, props: { content: '选择方案', actionType: 'link', href: '#', target: '_self' }, zIndex: 2 },
      { type: 'text', left: 640, top: 30, width: 100, height: 28, style: { fontSize: 18, fontWeight: 'bold', color: '#ffffff', textAlign: 'center' }, props: { content: '企业版' }, zIndex: 2 },
      { type: 'text', left: 660, top: 80, width: 60, height: 40, style: { fontSize: 32, fontWeight: 'bold', color: '#ffffff', textAlign: 'center' }, props: { content: '¥399' }, zIndex: 2 },
      { type: 'text', left: 610, top: 140, width: 160, height: 100, style: { fontSize: 14, color: '#ffffff', lineHeight: '2' }, props: { content: '• 定制功能\n• 无限存储\n• 24/7支持\n• 无限使用' }, zIndex: 2 },
      { type: 'button', left: 610, top: 280, width: 160, height: 40, style: { backgroundColor: '#ffffff', color: '#ff4d4f', borderRadius: 4, fontSize: 14, fontWeight: 'bold', textAlign: 'center', lineHeight: '40px' }, props: { content: '选择方案', actionType: 'link', href: '#', target: '_self' }, zIndex: 2 },
    ]
  },
  { 
    name: '时间轴', 
    icon: '时',
    offsetX: 0,
    offsetY: 0,
    components: [
      { type: 'text', left: 0, top: 0, width: 800, height: 40, style: { fontSize: 28, fontWeight: 'bold', color: '#333333', textAlign: 'center' }, props: { content: '发展历程' }, zIndex: 1 },
      { type: 'container', left: 0, top: 80, width: 800, height: 4, style: { backgroundColor: '#e8e8e8' }, props: {}, zIndex: 1 },
      { type: 'container', left: 0, top: 78, width: 16, height: 8, style: { backgroundColor: '#1890ff', borderRadius: 4 }, props: {}, zIndex: 2 },
      { type: 'container', left: 200, top: 78, width: 16, height: 8, style: { backgroundColor: '#1890ff', borderRadius: 4 }, props: {}, zIndex: 2 },
      { type: 'container', left: 400, top: 78, width: 16, height: 8, style: { backgroundColor: '#1890ff', borderRadius: 4 }, props: {}, zIndex: 2 },
      { type: 'container', left: 600, top: 78, width: 16, height: 8, style: { backgroundColor: '#1890ff', borderRadius: 4 }, props: {}, zIndex: 2 },
      { type: 'container', left: 784, top: 78, width: 16, height: 8, style: { backgroundColor: '#1890ff', borderRadius: 4 }, props: {}, zIndex: 2 },
      { type: 'text', left: 0, top: 100, width: 200, height: 30, style: { fontSize: 16, fontWeight: 'bold', color: '#333333', textAlign: 'center' }, props: { content: '2020' }, zIndex: 2 },
      { type: 'text', left: 200, top: 100, width: 200, height: 30, style: { fontSize: 16, fontWeight: 'bold', color: '#333333', textAlign: 'center' }, props: { content: '2021' }, zIndex: 2 },
      { type: 'text', left: 400, top: 100, width: 200, height: 30, style: { fontSize: 16, fontWeight: 'bold', color: '#333333', textAlign: 'center' }, props: { content: '2022' }, zIndex: 2 },
      { type: 'text', left: 600, top: 100, width: 200, height: 30, style: { fontSize: 16, fontWeight: 'bold', color: '#333333', textAlign: 'center' }, props: { content: '2023' }, zIndex: 2 },
      { type: 'text', left: 0, top: 135, width: 200, height: 60, style: { fontSize: 14, color: '#666666', textAlign: 'center', lineHeight: '1.5' }, props: { content: '公司成立\n开启创业之路' }, zIndex: 2 },
      { type: 'text', left: 200, top: 135, width: 200, height: 60, style: { fontSize: 14, color: '#666666', textAlign: 'center', lineHeight: '1.5' }, props: { content: '产品上线\n获得首批用户' }, zIndex: 2 },
      { type: 'text', left: 400, top: 135, width: 200, height: 60, style: { fontSize: 14, color: '#666666', textAlign: 'center', lineHeight: '1.5' }, props: { content: '快速扩张\n用户突破百万' }, zIndex: 2 },
      { type: 'text', left: 600, top: 135, width: 200, height: 60, style: { fontSize: 14, color: '#666666', textAlign: 'center', lineHeight: '1.5' }, props: { content: '走向国际\n开启全球化' }, zIndex: 2 },
    ]
  },
  { 
    name: '团队展示', 
    icon: '队',
    offsetX: 0,
    offsetY: 0,
    components: [
      { type: 'text', left: 0, top: 0, width: 800, height: 40, style: { fontSize: 28, fontWeight: 'bold', color: '#333333', textAlign: 'center' }, props: { content: '核心团队' }, zIndex: 1 },
      { type: 'container', left: 0, top: 60, width: 180, height: 280, style: { backgroundColor: '#f5f5f5', borderRadius: 8 }, props: {}, zIndex: 1 },
      { type: 'container', left: 200, top: 60, width: 180, height: 280, style: { backgroundColor: '#f5f5f5', borderRadius: 8 }, props: {}, zIndex: 1 },
      { type: 'container', left: 400, top: 60, width: 180, height: 280, style: { backgroundColor: '#f5f5f5', borderRadius: 8 }, props: {}, zIndex: 1 },
      { type: 'container', left: 600, top: 60, width: 180, height: 280, style: { backgroundColor: '#f5f5f5', borderRadius: 8 }, props: {}, zIndex: 1 },
      { type: 'image', left: 30, top: 80, width: 120, height: 120, style: { borderRadius: 60, backgroundColor: '#e0e0e0' }, props: { src: 'https://via.placeholder.com/120', alt: '成员照片' }, zIndex: 2 },
      { type: 'image', left: 230, top: 80, width: 120, height: 120, style: { borderRadius: 60, backgroundColor: '#e0e0e0' }, props: { src: 'https://via.placeholder.com/120', alt: '成员照片' }, zIndex: 2 },
      { type: 'image', left: 430, top: 80, width: 120, height: 120, style: { borderRadius: 60, backgroundColor: '#e0e0e0' }, props: { src: 'https://via.placeholder.com/120', alt: '成员照片' }, zIndex: 2 },
      { type: 'image', left: 630, top: 80, width: 120, height: 120, style: { borderRadius: 60, backgroundColor: '#e0e0e0' }, props: { src: 'https://via.placeholder.com/120', alt: '成员照片' }, zIndex: 2 },
      { type: 'text', left: 0, top: 210, width: 180, height: 28, style: { fontSize: 16, fontWeight: 'bold', color: '#333333', textAlign: 'center' }, props: { content: '张三' }, zIndex: 2 },
      { type: 'text', left: 200, top: 210, width: 180, height: 28, style: { fontSize: 16, fontWeight: 'bold', color: '#333333', textAlign: 'center' }, props: { content: '李四' }, zIndex: 2 },
      { type: 'text', left: 400, top: 210, width: 180, height: 28, style: { fontSize: 16, fontWeight: 'bold', color: '#333333', textAlign: 'center' }, props: { content: '王五' }, zIndex: 2 },
      { type: 'text', left: 600, top: 210, width: 180, height: 28, style: { fontSize: 16, fontWeight: 'bold', color: '#333333', textAlign: 'center' }, props: { content: '赵六' }, zIndex: 2 },
      { type: 'text', left: 0, top: 245, width: 180, height: 60, style: { fontSize: 14, color: '#666666', textAlign: 'center', lineHeight: '1.4' }, props: { content: '创始人 & CEO\n10年行业经验' }, zIndex: 2 },
      { type: 'text', left: 200, top: 245, width: 180, height: 60, style: { fontSize: 14, color: '#666666', textAlign: 'center', lineHeight: '1.4' }, props: { content: '技术总监\n全栈开发专家' }, zIndex: 2 },
      { type: 'text', left: 400, top: 245, width: 180, height: 60, style: { fontSize: 14, color: '#666666', textAlign: 'center', lineHeight: '1.4' }, props: { content: '产品经理\n用户体验专家' }, zIndex: 2 },
      { type: 'text', left: 600, top: 245, width: 180, height: 60, style: { fontSize: 14, color: '#666666', textAlign: 'center', lineHeight: '1.4' }, props: { content: '运营总监\n市场推广专家' }, zIndex: 2 },
    ]
  },
  { 
    name: 'FAQ问答', 
    icon: '问',
    offsetX: 0,
    offsetY: 0,
    components: [
      { type: 'text', left: 0, top: 0, width: 800, height: 40, style: { fontSize: 28, fontWeight: 'bold', color: '#333333', textAlign: 'center' }, props: { content: '常见问题' }, zIndex: 1 },
      { type: 'container', left: 0, top: 60, width: 800, height: 70, style: { backgroundColor: '#f8f9fa', borderRadius: 4, border: '1px solid #e8e8e8' }, props: {}, zIndex: 1 },
      { type: 'container', left: 0, top: 140, width: 800, height: 70, style: { backgroundColor: '#f8f9fa', borderRadius: 4, border: '1px solid #e8e8e8' }, props: {}, zIndex: 1 },
      { type: 'container', left: 0, top: 220, width: 800, height: 70, style: { backgroundColor: '#f8f9fa', borderRadius: 4, border: '1px solid #e8e8e8' }, props: {}, zIndex: 1 },
      { type: 'container', left: 0, top: 300, width: 800, height: 70, style: { backgroundColor: '#f8f9fa', borderRadius: 4, border: '1px solid #e8e8e8' }, props: {}, zIndex: 1 },
      { type: 'text', left: 20, top: 75, width: 760, height: 40, style: { fontSize: 16, fontWeight: 'bold', color: '#333333' }, props: { content: 'Q: 如何注册账户？' }, zIndex: 2 },
      { type: 'text', left: 20, top: 155, width: 760, height: 40, style: { fontSize: 16, fontWeight: 'bold', color: '#333333' }, props: { content: 'Q: 如何重置密码？' }, zIndex: 2 },
      { type: 'text', left: 20, top: 235, width: 760, height: 40, style: { fontSize: 16, fontWeight: 'bold', color: '#333333' }, props: { content: 'Q: 支持哪些支付方式？' }, zIndex: 2 },
      { type: 'text', left: 20, top: 315, width: 760, height: 40, style: { fontSize: 16, fontWeight: 'bold', color: '#333333' }, props: { content: 'Q: 如何联系客服？' }, zIndex: 2 },
      { type: 'text', left: 20, top: 100, width: 760, height: 30, style: { fontSize: 14, color: '#666666' }, props: { content: 'A: 点击注册按钮，填写基本信息即可完成注册。' }, zIndex: 2 },
      { type: 'text', left: 20, top: 180, width: 760, height: 30, style: { fontSize: 14, color: '#666666' }, props: { content: 'A: 在登录页面点击"忘记密码"，通过邮箱或手机验证重置。' }, zIndex: 2 },
      { type: 'text', left: 20, top: 260, width: 760, height: 30, style: { fontSize: 14, color: '#666666' }, props: { content: 'A: 我们支持支付宝、微信支付、信用卡等多种支付方式。' }, zIndex: 2 },
      { type: 'text', left: 20, top: 340, width: 760, height: 30, style: { fontSize: 14, color: '#666666' }, props: { content: 'A: 可以通过在线客服、邮箱或电话联系我们，工作时间随时为您服务。' }, zIndex: 2 },
    ]
  },
  { 
    name: 'CTA行动号召', 
    icon: '召',
    offsetX: 0,
    offsetY: 0,
    components: [
      { type: 'container', left: 0, top: 0, width: 800, height: 200, style: { backgroundColor: '#1890ff', borderRadius: 8 }, props: {}, zIndex: 1 },
      { type: 'text', left: 200, top: 50, width: 400, height: 50, style: { fontSize: 32, fontWeight: 'bold', color: '#ffffff', textAlign: 'center' }, props: { content: '准备好开始了吗？' }, zIndex: 2 },
      { type: 'text', left: 150, top: 110, width: 500, height: 30, style: { fontSize: 16, color: '#ffffff', textAlign: 'center' }, props: { content: '立即注册，享受免费试用，开启您的创作之旅' }, zIndex: 2 },
      { type: 'button', left: 320, top: 150, width: 160, height: 40, style: { backgroundColor: '#ffffff', color: '#1890ff', borderRadius: 4, fontSize: 16, fontWeight: 'bold', textAlign: 'center', lineHeight: '40px' }, props: { content: '立即注册', actionType: 'link', href: '#', target: '_self' }, zIndex: 2 },
    ]
  },
  { 
    name: '统计卡片', 
    icon: '统',
    offsetX: 0,
    offsetY: 0,
    components: [
      { type: 'container', left: 0, top: 0, width: 190, height: 120, style: { backgroundColor: '#ffffff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }, props: {}, zIndex: 1 },
      { type: 'container', left: 205, top: 0, width: 190, height: 120, style: { backgroundColor: '#ffffff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }, props: {}, zIndex: 1 },
      { type: 'container', left: 410, top: 0, width: 190, height: 120, style: { backgroundColor: '#ffffff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }, props: {}, zIndex: 1 },
      { type: 'container', left: 615, top: 0, width: 190, height: 120, style: { backgroundColor: '#ffffff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }, props: {}, zIndex: 1 },
      { type: 'text', left: 20, top: 20, width: 150, height: 24, style: { fontSize: 14, color: '#666666', textAlign: 'center' }, props: { content: '总访问量' }, zIndex: 2 },
      { type: 'text', left: 225, top: 20, width: 150, height: 24, style: { fontSize: 14, color: '#666666', textAlign: 'center' }, props: { content: '注册用户' }, zIndex: 2 },
      { type: 'text', left: 430, top: 20, width: 150, height: 24, style: { fontSize: 14, color: '#666666', textAlign: 'center' }, props: { content: '活跃用户' }, zIndex: 2 },
      { type: 'text', left: 635, top: 20, width: 150, height: 24, style: { fontSize: 14, color: '#666666', textAlign: 'center' }, props: { content: '转化率' }, zIndex: 2 },
      { type: 'text', left: 20, top: 55, width: 150, height: 40, style: { fontSize: 28, fontWeight: 'bold', color: '#1890ff', textAlign: 'center' }, props: { content: '128K' }, zIndex: 2 },
      { type: 'text', left: 225, top: 55, width: 150, height: 40, style: { fontSize: 28, fontWeight: 'bold', color: '#52c41a', textAlign: 'center' }, props: { content: '8.5K' }, zIndex: 2 },
      { type: 'text', left: 430, top: 55, width: 150, height: 40, style: { fontSize: 28, fontWeight: 'bold', color: '#faad14', textAlign: 'center' }, props: { content: '3.2K' }, zIndex: 2 },
      { type: 'text', left: 635, top: 55, width: 150, height: 40, style: { fontSize: 28, fontWeight: 'bold', color: '#f5222d', textAlign: 'center' }, props: { content: '12%' }, zIndex: 2 },
    ]
  }
]

// 点击添加组件
function handleClick(type) {
  addComponent(type)
}

// 拖拽开始
function handleDragStart(event, type) {
  setDraggingType(type)
  event.dataTransfer.setData('componentType', type)
  event.dataTransfer.effectAllowed = 'copy'
}

// 拖拽结束
function handleDragEnd() {
  clearDraggingType()
}

// 应用预设页面（完整网页模板，原子操作：一次撤销可整体回退）
function applyPresetPage(page) {
  console.log('applyPresetPage called with:', page.name)
  applyPageTemplate(page.config)
  console.log('applyPresetPage completed')
}

// 应用预设布局（添加到现有页面，原子操作）
function applyPresetLayout(layout) {
  console.log('applyPresetLayout called with:', layout.name)
  // 计算布局放置位置（页面中心）
  const centerX = Math.max(0, (page.value.width - 800) / 2)
  const centerY = Math.max(0, (page.value.height - 400) / 2)
  
  // 添加组件到现有页面（统一偏移）
  const offsetComponents = layout.components.map(comp => ({
    ...comp,
    left: comp.left + centerX,
    top: comp.top + centerY
  }))
  applyComponents(offsetComponents, { replace: false })
  console.log('applyPresetLayout completed')
}
</script>

<template>
  <div class="component-list">
    <!-- 标签页 -->
    <div class="tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.key"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.icon }} {{ tab.label }}
      </button>
    </div>

    <!-- 组件列表 -->
    <div v-if="activeTab === 'components'" class="tab-content">
      <p class="list-hint">拖拽或点击添加组件到画布</p>
      
      <!-- 组件分类 -->
      <div class="component-categories">
        <div
          v-for="(category, key) in COMPONENT_CATEGORIES"
          :key="key"
          class="category"
        >
          <!-- 分类标题 -->
          <div 
            class="category-header"
            @click="toggleCategory(key)"
          >
            <span class="category-icon">{{ category.icon }}</span>
            <span class="category-name">{{ category.name }}</span>
            <span class="category-arrow">
              {{ expandedCategories.includes(key) ? '▼' : '▶' }}
            </span>
          </div>
          
          <!-- 分类下的组件 -->
          <div v-if="expandedCategories.includes(key)" class="category-components">
            <div
              v-for="compType in category.components"
              :key="compType"
              class="component-item"
              draggable="true"
              @click="handleClick(compType)"
              @dragstart="handleDragStart($event, compType)"
              @dragend="handleDragEnd"
            >
              <span class="component-icon">{{ getIcon(compType) }}</span>
              <span class="component-name">{{ COMPONENT_DEFAULTS[compType].name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图层管理 -->
    <div v-if="activeTab === 'layers'" class="tab-content">
      <LayerPanel />
    </div>

    <!-- 预设页面（完整网页模板） -->
    <div v-if="activeTab === 'pages'" class="tab-content">
      <p class="list-hint">点击应用完整网页模板</p>
      <div class="preset-list">
        <div
          v-for="page in presetPages"
          :key="page.name"
          class="preset-item"
          @click="applyPresetPage(page)"
        >
          <span class="preset-icon">{{ page.icon }}</span>
          <div class="preset-info">
            <span class="preset-name">{{ page.name }}</span>
            <span class="preset-desc">{{ page.config.width }} × {{ page.config.height }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 预设布局（模块化容器） -->
    <div v-if="activeTab === 'layouts'" class="tab-content">
      <p class="list-hint">点击添加模块化布局到页面</p>
      <div class="preset-list">
        <div
          v-for="layout in presetLayouts"
          :key="layout.name"
          class="preset-item"
          @click="applyPresetLayout(layout)"
        >
          <span class="preset-icon">{{ layout.icon }}</span>
          <div class="preset-info">
            <span class="preset-name">{{ layout.name }}</span>
            <span class="preset-desc">点击添加</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.component-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 标签页 */
.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border);
}

.tabs button {
  flex: 1;
  min-width: 46px;
  padding: 6px 2px;
  font-size: 11px;
  white-space: nowrap;
  border: none;
  border-radius: var(--border-radius);
  background-color: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.tabs button:hover {
  background-color: var(--color-bg-hover);
}

.tabs button.active {
  background-color: var(--color-primary);
  color: #ffffff;
}

.tab-content {
  flex: 1;
  overflow-y: auto;
}

.list-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--color-text);
}

.list-hint {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: 16px;
}

.components {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.component-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  cursor: grab;
  transition: all 0.2s;
  user-select: none;
}

.component-item:hover {
  border-color: var(--color-primary);
  background-color: #e6f7ff;
}

.component-item:active {
  cursor: grabbing;
}

.component-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.component-name {
  font-size: 13px;
  color: var(--color-text);
}

/* 预设列表 */
.preset-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preset-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.2s;
}

.preset-item:hover {
  border-color: var(--color-primary);
  background-color: #e6f7ff;
}

.preset-icon {
  font-size: 20px;
  width: 28px;
  text-align: center;
}

.preset-info {
  flex: 1;
}

.preset-name {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
}

.preset-desc {
  display: block;
  font-size: 11px;
  color: var(--color-text-secondary);
  margin-top: 2px;
}

/* 组件分类 */
.component-categories {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category {
  border-radius: var(--border-radius);
  overflow: hidden;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all 0.2s;
}

.category-header:hover {
  background-color: var(--color-bg-hover);
}

.category-icon {
  font-size: 14px;
  width: 18px;
  text-align: center;
}

.category-name {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
}

.category-arrow {
  font-size: 10px;
  color: var(--color-text-secondary);
  transition: transform 0.2s;
}

.category-components {
  padding: 4px;
  background-color: var(--color-bg-white);
  border-left: 2px solid var(--color-primary);
  border-right: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
}

.category-components .component-item {
  border-radius: 4px;
  margin-bottom: 2px;
}
</style>
