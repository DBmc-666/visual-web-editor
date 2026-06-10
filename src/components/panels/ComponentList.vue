<script setup>
import { ref } from 'vue'
import { useEditor, COMPONENT_DEFAULTS, COMPONENT_CATEGORIES } from '../../stores/editor'

const { addComponent, setDraggingType, clearDraggingType, updatePageSize, updatePage, resetPage, addComponentFromConfig: addComponentFromConfigStore, page } = useEditor()

// 当前激活的标签页
const activeTab = ref('components')

// 当前展开的分类
const expandedCategories = ref(['basic'])

// 标签页配置
const tabs = [
  { key: 'components', label: '组件', icon: '组件' },
  { key: 'pages', label: '预设页面', icon: '页面' },
  { key: 'layouts', label: '预设布局', icon: '布局' }
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
    tabs: '页'
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
const presetPages = [
  { 
    name: '企业介绍页', 
    icon: '企',
    config: {
      width: 1200,
      height: 2000,
      backgroundColor: '#f5f7fa',
      components: [
        // 导航栏 - 使用 navMenu 组件
        { type: 'navMenu', left: 0, top: 0, width: 1200, height: 70, style: { backgroundColor: '#ffffff', borderBottom: '1px solid #e8e8e8', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }, props: { logo: '企业名称', logoUrl: '#', menuItems: '首页|#\n关于我们|#about\n产品中心|#product\n新闻动态|#news\n联系我们|#contact', activeIndex: 0 }, zIndex: 2 },
        // Hero区域
        { type: 'container', left: 0, top: 70, width: 1200, height: 450, style: { backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }, props: {}, zIndex: 1 },
        { type: 'container', left: 0, top: 70, width: 1200, height: 450, style: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }, props: {}, zIndex: 1 },
        { type: 'text', left: 300, top: 150, width: 600, height: 90, style: { fontSize: 52, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', lineHeight: '1.3' }, props: { content: '创新科技 引领未来' }, zIndex: 2 },
        { type: 'text', left: 350, top: 260, width: 500, height: 60, style: { fontSize: 18, color: 'rgba(255,255,255,0.9)', textAlign: 'center', lineHeight: '1.8' }, props: { content: '专注于为企业提供创新的数字化解决方案，助力企业转型升级，创造更大价值。' }, zIndex: 2 },
        { type: 'button', left: 440, top: 350, width: 160, height: 50, style: { backgroundColor: '#ffffff', color: '#667eea', borderRadius: 25, fontSize: 16, fontWeight: 'bold', textAlign: 'center', lineHeight: '50px' }, props: { content: '了解更多', actionType: 'link', href: '#about', target: '_self' }, zIndex: 2 },
        { type: 'button', left: 620, top: 350, width: 160, height: 50, style: { backgroundColor: 'transparent', color: '#ffffff', borderRadius: 25, fontSize: 16, border: '2px solid #ffffff', textAlign: 'center', lineHeight: '46px' }, props: { content: '联系我们', actionType: 'link', href: '#contact', target: '_self' }, zIndex: 2 },
        // 统计数据区域
        { type: 'container', left: 100, top: 570, width: 1000, height: 140, style: { backgroundColor: '#ffffff', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }, props: {}, zIndex: 2 },
        { type: 'text', left: 100, top: 590, width: 180, height: 24, style: { fontSize: 14, color: '#999999', textAlign: 'center' }, props: { content: '服务客户' }, zIndex: 3 },
        { type: 'text', left: 300, top: 590, width: 180, height: 24, style: { fontSize: 14, color: '#999999', textAlign: 'center' }, props: { content: '项目经验' }, zIndex: 3 },
        { type: 'text', left: 500, top: 590, width: 180, height: 24, style: { fontSize: 14, color: '#999999', textAlign: 'center' }, props: { content: '专业团队' }, zIndex: 3 },
        { type: 'text', left: 700, top: 590, width: 180, height: 24, style: { fontSize: 14, color: '#999999', textAlign: 'center' }, props: { content: '客户满意度' }, zIndex: 3 },
        { type: 'text', left: 100, top: 625, width: 180, height: 40, style: { fontSize: 36, fontWeight: 'bold', color: '#667eea', textAlign: 'center' }, props: { content: '2000+' }, zIndex: 3 },
        { type: 'text', left: 300, top: 625, width: 180, height: 40, style: { fontSize: 36, fontWeight: 'bold', color: '#667eea', textAlign: 'center' }, props: { content: '500+' }, zIndex: 3 },
        { type: 'text', left: 500, top: 625, width: 180, height: 40, style: { fontSize: 36, fontWeight: 'bold', color: '#667eea', textAlign: 'center' }, props: { content: '150+' }, zIndex: 3 },
        { type: 'text', left: 700, top: 625, width: 180, height: 40, style: { fontSize: 36, fontWeight: 'bold', color: '#667eea', textAlign: 'center' }, props: { content: '98%' }, zIndex: 3 },
        // 企业介绍区域 - 图文展示
        { type: 'text', left: 400, top: 760, width: 400, height: 40, style: { fontSize: 32, fontWeight: 'bold', color: '#333333', textAlign: 'center' }, props: { content: '关于我们' }, zIndex: 1 },
        { type: 'text', left: 350, top: 815, width: 500, height: 40, style: { fontSize: 16, color: '#666666', textAlign: 'center', lineHeight: '1.6' }, props: { content: '我们是一家专注于科技创新的企业，致力于为客户提供最优质的产品和服务。' }, zIndex: 1 },
        { type: 'image', left: 150, top: 880, width: 400, height: 280, style: { borderRadius: 8 }, props: { src: 'https://via.placeholder.com/400x280', alt: '企业展示图片' }, zIndex: 1 },
        { type: 'text', left: 580, top: 880, width: 420, height: 40, style: { fontSize: 24, fontWeight: 'bold', color: '#333333' }, props: { content: '我们的使命' }, zIndex: 1 },
        { type: 'text', left: 580, top: 935, width: 420, height: 100, style: { fontSize: 15, color: '#555555', lineHeight: '1.8' }, props: { content: '以创新技术驱动企业发展，为客户创造可持续价值。我们坚持以人为本，注重团队协作，追求卓越品质，致力于成为行业领先的解决方案提供商。' }, zIndex: 1 },
        { type: 'text', left: 580, top: 1050, width: 420, height: 40, style: { fontSize: 24, fontWeight: 'bold', color: '#333333' }, props: { content: '我们的愿景' }, zIndex: 1 },
        { type: 'text', left: 580, top: 1105, width: 420, height: 80, style: { fontSize: 15, color: '#555555', lineHeight: '1.8' }, props: { content: '成为全球领先的数字化解决方案服务商，帮助更多企业实现数字化转型，共创美好未来。' }, zIndex: 1 },
        { type: 'button', left: 580, top: 1200, width: 140, height: 44, style: { backgroundColor: '#667eea', color: '#ffffff', borderRadius: 6, fontSize: 15, textAlign: 'center', lineHeight: '44px' }, props: { content: '了解详情', actionType: 'link', href: '#about', target: '_self' }, zIndex: 1 },
        // 核心优势区域
        { type: 'text', left: 400, top: 1280, width: 400, height: 40, style: { fontSize: 32, fontWeight: 'bold', color: '#333333', textAlign: 'center' }, props: { content: '核心优势' }, zIndex: 1 },
        { type: 'container', left: 100, top: 1350, width: 280, height: 200, style: { backgroundColor: '#ffffff', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', padding: '24px' }, props: {}, zIndex: 1 },
        { type: 'container', left: 410, top: 1350, width: 280, height: 200, style: { backgroundColor: '#ffffff', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', padding: '24px' }, props: {}, zIndex: 1 },
        { type: 'container', left: 720, top: 1350, width: 280, height: 200, style: { backgroundColor: '#ffffff', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', padding: '24px' }, props: {}, zIndex: 1 },
        { type: 'text', left: 180, top: 1370, width: 100, height: 50, style: { fontSize: 40, textAlign: 'center' }, props: { content: '🚀' }, zIndex: 2 },
        { type: 'text', left: 490, top: 1370, width: 100, height: 50, style: { fontSize: 40, textAlign: 'center' }, props: { content: '🛡️' }, zIndex: 2 },
        { type: 'text', left: 800, top: 1370, width: 100, height: 50, style: { fontSize: 40, textAlign: 'center' }, props: { content: '💡' }, zIndex: 2 },
        { type: 'text', left: 100, top: 1430, width: 280, height: 28, style: { fontSize: 18, fontWeight: 'bold', color: '#333333', textAlign: 'center' }, props: { content: '专业团队' }, zIndex: 2 },
        { type: 'text', left: 410, top: 1430, width: 280, height: 28, style: { fontSize: 18, fontWeight: 'bold', color: '#333333', textAlign: 'center' }, props: { content: '安全可靠' }, zIndex: 2 },
        { type: 'text', left: 720, top: 1430, width: 280, height: 28, style: { fontSize: 18, fontWeight: 'bold', color: '#333333', textAlign: 'center' }, props: { content: '创新理念' }, zIndex: 2 },
        { type: 'text', left: 100, top: 1470, width: 280, height: 60, style: { fontSize: 14, color: '#666666', textAlign: 'center', lineHeight: '1.5', padding: '0 10px' }, props: { content: '拥有专业的技术团队和丰富的行业经验，为您提供最优质的服务。' }, zIndex: 2 },
        { type: 'text', left: 410, top: 1470, width: 280, height: 60, style: { fontSize: 14, color: '#666666', textAlign: 'center', lineHeight: '1.5', padding: '0 10px' }, props: { content: '严格的数据安全措施，保护您的信息安全，让您放心使用。' }, zIndex: 2 },
        { type: 'text', left: 720, top: 1470, width: 280, height: 60, style: { fontSize: 14, color: '#666666', textAlign: 'center', lineHeight: '1.5', padding: '0 10px' }, props: { content: '持续创新，不断探索新技术，为客户提供更优质的解决方案。' }, zIndex: 2 },
        // CTA行动号召区域
        { type: 'container', left: 150, top: 1600, width: 900, height: 200, style: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 16 }, props: {}, zIndex: 1 },
        { type: 'text', left: 250, top: 1640, width: 400, height: 40, style: { fontSize: 32, fontWeight: 'bold', color: '#ffffff', textAlign: 'center' }, props: { content: '准备好开始了吗？' }, zIndex: 2 },
        { type: 'text', left: 200, top: 1700, width: 500, height: 30, style: { fontSize: 16, color: 'rgba(255,255,255,0.9)', textAlign: 'center' }, props: { content: '立即联系我们，开启您的数字化转型之旅' }, zIndex: 2 },
        { type: 'button', left: 370, top: 1745, width: 160, height: 50, style: { backgroundColor: '#ffffff', color: '#667eea', borderRadius: 25, fontSize: 16, fontWeight: 'bold', textAlign: 'center', lineHeight: '50px' }, props: { content: '立即咨询', actionType: 'link', href: '#contact', target: '_self' }, zIndex: 2 },
        { type: 'button', left: 550, top: 1745, width: 160, height: 50, style: { backgroundColor: 'transparent', color: '#ffffff', borderRadius: 25, fontSize: 16, border: '2px solid #ffffff', textAlign: 'center', lineHeight: '46px' }, props: { content: '查看案例', actionType: 'link', href: '#cases', target: '_self' }, zIndex: 2 },
        // 页脚
        { type: 'container', left: 0, top: 1850, width: 1200, height: 120, style: { backgroundColor: '#333333' }, props: {}, zIndex: 1 },
        { type: 'text', left: 500, top: 1890, width: 200, height: 24, style: { fontSize: 14, color: '#999999', textAlign: 'center' }, props: { content: '© 2024 企业名称. 保留所有权利.' }, zIndex: 2 },
      ]
    }
  },
  { 
    name: '产品展示页', 
    icon: '产',
    config: {
      width: 1200,
      height: 1600,
      backgroundColor: '#f5f5f5',
      components: [
        // 导航栏
        { type: 'navMenu', left: 0, top: 0, width: 1200, height: 60, style: { backgroundColor: '#ffffff', borderBottom: '1px solid #e8e8e8' }, props: { logo: '产品中心', logoUrl: '#', menuItems: '首页|#\n全部产品|#all\n新品上市|#new\n限时特惠|#sale', activeIndex: 1 }, zIndex: 2 },
        
        // 页面标题区域
        { type: 'text', left: 50, top: 80, width: 400, height: 48, style: { fontSize: 36, fontWeight: 'bold', color: '#333333' }, props: { content: '精选产品' }, zIndex: 1 },
        { type: 'text', left: 50, top: 135, width: 600, height: 24, style: { fontSize: 14, color: '#666666' }, props: { content: '发现我们精心挑选的优质产品，满足您的各种需求' }, zIndex: 1 },
        
        // 面包屑导航
        { type: 'breadcrumb', left: 50, top: 175, width: 300, height: 30, style: { backgroundColor: 'transparent' }, props: { items: '首页|#\n产品中心|#products\n全部产品|#all' }, zIndex: 2 },
        
        // 搜索和筛选区域
        { type: 'container', left: 50, top: 220, width: 1100, height: 80, style: { backgroundColor: '#ffffff', borderRadius: 8, padding: '15px 20px' }, props: {}, zIndex: 2 },
        { type: 'searchForm', left: 70, top: 230, width: 350, height: 50, style: { backgroundColor: 'transparent' }, props: { placeholder: '搜索产品...', buttonText: '搜索', showCategory: false }, zIndex: 3 },
        
        // 筛选标签
        { type: 'text', left: 450, top: 240, width: 60, height: 24, style: { fontSize: 14, color: '#666666', fontWeight: '500' }, props: { content: '筛选:' }, zIndex: 3 },
        { type: 'button', left: 520, top: 235, width: 80, height: 36, style: { backgroundColor: '#1890ff', color: '#ffffff', borderRadius: 4, fontSize: 13 }, props: { text: '全部' }, zIndex: 3 },
        { type: 'button', left: 610, top: 235, width: 80, height: 36, style: { backgroundColor: '#f5f5f5', color: '#666666', borderRadius: 4, fontSize: 13 }, props: { text: '新品' }, zIndex: 3 },
        { type: 'button', left: 700, top: 235, width: 80, height: 36, style: { backgroundColor: '#f5f5f5', color: '#666666', borderRadius: 4, fontSize: 13 }, props: { text: '热销' }, zIndex: 3 },
        { type: 'button', left: 790, top: 235, width: 80, height: 36, style: { backgroundColor: '#f5f5f5', color: '#666666', borderRadius: 4, fontSize: 13 }, props: { text: '特惠' }, zIndex: 3 },
        
        // 排序选项
        { type: 'text', left: 950, top: 240, width: 60, height: 24, style: { fontSize: 14, color: '#666666', fontWeight: '500' }, props: { content: '排序:' }, zIndex: 3 },
        { type: 'button', left: 1020, top: 235, width: 100, height: 36, style: { backgroundColor: '#f5f5f5', color: '#666666', borderRadius: 4, fontSize: 13 }, props: { text: '综合排序' }, zIndex: 3 },
        
        // 产品卡片网格 - 第一行
        { type: 'container', left: 50, top: 320, width: 260, height: 320, style: { backgroundColor: '#ffffff', borderRadius: 8, padding: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }, props: {}, zIndex: 1 },
        { type: 'image', left: 65, top: 335, width: 230, height: 180, style: { borderRadius: 6 }, props: { src: 'https://via.placeholder.com/230x180', alt: '产品图片' }, zIndex: 2 },
        { type: 'text', left: 65, top: 530, width: 230, height: 24, style: { fontSize: 16, fontWeight: '500', color: '#333333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, props: { content: '无线蓝牙耳机 Pro' }, zIndex: 2 },
        { type: 'text', left: 65, top: 560, width: 230, height: 40, style: { fontSize: 12, color: '#999999', lineHeight: '1.5' }, props: { content: '高品质音效，超长续航，舒适佩戴' }, zIndex: 2 },
        { type: 'text', left: 65, top: 605, width: 100, height: 28, style: { fontSize: 20, fontWeight: 'bold', color: '#ff4d4f' }, props: { content: '¥299' }, zIndex: 2 },
        { type: 'text', left: 180, top: 610, width: 80, height: 20, style: { fontSize: 12, color: '#999999', textDecoration: 'line-through' }, props: { content: '¥399' }, zIndex: 2 },
        { type: 'button', left: 65, top: 640, width: 230, height: 36, style: { backgroundColor: '#1890ff', color: '#ffffff', borderRadius: 4, fontSize: 14 }, props: { text: '立即购买' }, zIndex: 2 },
        
        { type: 'container', left: 330, top: 320, width: 260, height: 320, style: { backgroundColor: '#ffffff', borderRadius: 8, padding: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }, props: {}, zIndex: 1 },
        { type: 'image', left: 345, top: 335, width: 230, height: 180, style: { borderRadius: 6 }, props: { src: 'https://via.placeholder.com/230x180', alt: '产品图片' }, zIndex: 2 },
        { type: 'text', left: 345, top: 530, width: 230, height: 24, style: { fontSize: 16, fontWeight: '500', color: '#333333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, props: { content: '智能手表 Ultra' }, zIndex: 2 },
        { type: 'text', left: 345, top: 560, width: 230, height: 40, style: { fontSize: 12, color: '#999999', lineHeight: '1.5' }, props: { content: '健康监测，运动追踪，防水设计' }, zIndex: 2 },
        { type: 'text', left: 345, top: 605, width: 100, height: 28, style: { fontSize: 20, fontWeight: 'bold', color: '#ff4d4f' }, props: { content: '¥1299' }, zIndex: 2 },
        { type: 'text', left: 460, top: 610, width: 80, height: 20, style: { fontSize: 12, color: '#999999', textDecoration: 'line-through' }, props: { content: '¥1599' }, zIndex: 2 },
        { type: 'button', left: 345, top: 640, width: 230, height: 36, style: { backgroundColor: '#1890ff', color: '#ffffff', borderRadius: 4, fontSize: 14 }, props: { text: '立即购买' }, zIndex: 2 },
        
        { type: 'container', left: 610, top: 320, width: 260, height: 320, style: { backgroundColor: '#ffffff', borderRadius: 8, padding: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }, props: {}, zIndex: 1 },
        { type: 'image', left: 625, top: 335, width: 230, height: 180, style: { borderRadius: 6 }, props: { src: 'https://via.placeholder.com/230x180', alt: '产品图片' }, zIndex: 2 },
        { type: 'text', left: 625, top: 530, width: 230, height: 24, style: { fontSize: 16, fontWeight: '500', color: '#333333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, props: { content: '便携式蓝牙音箱' }, zIndex: 2 },
        { type: 'text', left: 625, top: 560, width: 230, height: 40, style: { fontSize: 12, color: '#999999', lineHeight: '1.5' }, props: { content: '360度环绕音效，便携设计' }, zIndex: 2 },
        { type: 'text', left: 625, top: 605, width: 100, height: 28, style: { fontSize: 20, fontWeight: 'bold', color: '#ff4d4f' }, props: { content: '¥459' }, zIndex: 2 },
        { type: 'text', left: 740, top: 610, width: 80, height: 20, style: { fontSize: 12, color: '#999999', textDecoration: 'line-through' }, props: { content: '¥599' }, zIndex: 2 },
        { type: 'button', left: 625, top: 640, width: 230, height: 36, style: { backgroundColor: '#1890ff', color: '#ffffff', borderRadius: 4, fontSize: 14 }, props: { text: '立即购买' }, zIndex: 2 },
        
        { type: 'container', left: 890, top: 320, width: 260, height: 320, style: { backgroundColor: '#ffffff', borderRadius: 8, padding: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }, props: {}, zIndex: 1 },
        { type: 'image', left: 905, top: 335, width: 230, height: 180, style: { borderRadius: 6 }, props: { src: 'https://via.placeholder.com/230x180', alt: '产品图片' }, zIndex: 2 },
        { type: 'text', left: 905, top: 530, width: 230, height: 24, style: { fontSize: 16, fontWeight: '500', color: '#333333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, props: { content: '机械键盘 RGB' }, zIndex: 2 },
        { type: 'text', left: 905, top: 560, width: 230, height: 40, style: { fontSize: 12, color: '#999999', lineHeight: '1.5' }, props: { content: '热插拔轴体，RGB背光，全键无冲' }, zIndex: 2 },
        { type: 'text', left: 905, top: 605, width: 100, height: 28, style: { fontSize: 20, fontWeight: 'bold', color: '#ff4d4f' }, props: { content: '¥699' }, zIndex: 2 },
        { type: 'text', left: 1020, top: 610, width: 80, height: 20, style: { fontSize: 12, color: '#999999', textDecoration: 'line-through' }, props: { content: '¥899' }, zIndex: 2 },
        { type: 'button', left: 905, top: 640, width: 230, height: 36, style: { backgroundColor: '#1890ff', color: '#ffffff', borderRadius: 4, fontSize: 14 }, props: { text: '立即购买' }, zIndex: 2 },
        
        // 产品卡片网格 - 第二行
        { type: 'container', left: 50, top: 660, width: 260, height: 320, style: { backgroundColor: '#ffffff', borderRadius: 8, padding: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }, props: {}, zIndex: 1 },
        { type: 'image', left: 65, top: 675, width: 230, height: 180, style: { borderRadius: 6 }, props: { src: 'https://via.placeholder.com/230x180', alt: '产品图片' }, zIndex: 2 },
        { type: 'text', left: 65, top: 870, width: 230, height: 24, style: { fontSize: 16, fontWeight: '500', color: '#333333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, props: { content: '无线充电板' }, zIndex: 2 },
        { type: 'text', left: 65, top: 900, width: 230, height: 40, style: { fontSize: 12, color: '#999999', lineHeight: '1.5' }, props: { content: '15W快充，兼容多设备' }, zIndex: 2 },
        { type: 'text', left: 65, top: 945, width: 100, height: 28, style: { fontSize: 20, fontWeight: 'bold', color: '#ff4d4f' }, props: { content: '¥159' }, zIndex: 2 },
        { type: 'text', left: 180, top: 950, width: 80, height: 20, style: { fontSize: 12, color: '#999999', textDecoration: 'line-through' }, props: { content: '¥199' }, zIndex: 2 },
        { type: 'button', left: 65, top: 980, width: 230, height: 36, style: { backgroundColor: '#1890ff', color: '#ffffff', borderRadius: 4, fontSize: 14 }, props: { text: '立即购买' }, zIndex: 2 },
        
        { type: 'container', left: 330, top: 660, width: 260, height: 320, style: { backgroundColor: '#ffffff', borderRadius: 8, padding: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }, props: {}, zIndex: 1 },
        { type: 'image', left: 345, top: 675, width: 230, height: 180, style: { borderRadius: 6 }, props: { src: 'https://via.placeholder.com/230x180', alt: '产品图片' }, zIndex: 2 },
        { type: 'text', left: 345, top: 870, width: 230, height: 24, style: { fontSize: 16, fontWeight: '500', color: '#333333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, props: { content: '降噪耳机 Max' }, zIndex: 2 },
        { type: 'text', left: 345, top: 900, width: 230, height: 40, style: { fontSize: 12, color: '#999999', lineHeight: '1.5' }, props: { content: '主动降噪，Hi-Res认证' }, zIndex: 2 },
        { type: 'text', left: 345, top: 945, width: 100, height: 28, style: { fontSize: 20, fontWeight: 'bold', color: '#ff4d4f' }, props: { content: '¥1599' }, zIndex: 2 },
        { type: 'text', left: 460, top: 950, width: 80, height: 20, style: { fontSize: 12, color: '#999999', textDecoration: 'line-through' }, props: { content: '¥1999' }, zIndex: 2 },
        { type: 'button', left: 345, top: 980, width: 230, height: 36, style: { backgroundColor: '#1890ff', color: '#ffffff', borderRadius: 4, fontSize: 14 }, props: { text: '立即购买' }, zIndex: 2 },
        
        { type: 'container', left: 610, top: 660, width: 260, height: 320, style: { backgroundColor: '#ffffff', borderRadius: 8, padding: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }, props: {}, zIndex: 1 },
        { type: 'image', left: 625, top: 675, width: 230, height: 180, style: { borderRadius: 6 }, props: { src: 'https://via.placeholder.com/230x180', alt: '产品图片' }, zIndex: 2 },
        { type: 'text', left: 625, top: 870, width: 230, height: 24, style: { fontSize: 16, fontWeight: '500', color: '#333333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, props: { content: '游戏鼠标 Pro' }, zIndex: 2 },
        { type: 'text', left: 625, top: 900, width: 230, height: 40, style: { fontSize: 12, color: '#999999', lineHeight: '1.5' }, props: { content: '16000DPI，RGB灯效，人体工学' }, zIndex: 2 },
        { type: 'text', left: 625, top: 945, width: 100, height: 28, style: { fontSize: 20, fontWeight: 'bold', color: '#ff4d4f' }, props: { content: '¥399' }, zIndex: 2 },
        { type: 'text', left: 740, top: 950, width: 80, height: 20, style: { fontSize: 12, color: '#999999', textDecoration: 'line-through' }, props: { content: '¥499' }, zIndex: 2 },
        { type: 'button', left: 625, top: 980, width: 230, height: 36, style: { backgroundColor: '#1890ff', color: '#ffffff', borderRadius: 4, fontSize: 14 }, props: { text: '立即购买' }, zIndex: 2 },
        
        { type: 'container', left: 890, top: 660, width: 260, height: 320, style: { backgroundColor: '#ffffff', borderRadius: 8, padding: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }, props: {}, zIndex: 1 },
        { type: 'image', left: 905, top: 675, width: 230, height: 180, style: { borderRadius: 6 }, props: { src: 'https://via.placeholder.com/230x180', alt: '产品图片' }, zIndex: 2 },
        { type: 'text', left: 905, top: 870, width: 230, height: 24, style: { fontSize: 16, fontWeight: '500', color: '#333333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, props: { content: '平板电脑支架' }, zIndex: 2 },
        { type: 'text', left: 905, top: 900, width: 230, height: 40, style: { fontSize: 12, color: '#999999', lineHeight: '1.5' }, props: { content: '多角度调节，稳固耐用' }, zIndex: 2 },
        { type: 'text', left: 905, top: 945, width: 100, height: 28, style: { fontSize: 20, fontWeight: 'bold', color: '#ff4d4f' }, props: { content: '¥89' }, zIndex: 2 },
        { type: 'text', left: 1020, top: 950, width: 80, height: 20, style: { fontSize: 12, color: '#999999', textDecoration: 'line-through' }, props: { content: '¥119' }, zIndex: 2 },
        { type: 'button', left: 905, top: 980, width: 230, height: 36, style: { backgroundColor: '#1890ff', color: '#ffffff', borderRadius: 4, fontSize: 14 }, props: { text: '立即购买' }, zIndex: 2 },
        
        // 分页区域
        { type: 'container', left: 50, top: 1000, width: 1100, height: 60, style: { backgroundColor: '#ffffff', borderRadius: 8, padding: '10px' }, props: {}, zIndex: 2 },
        { type: 'button', left: 480, top: 1010, width: 60, height: 40, style: { backgroundColor: '#f5f5f5', color: '#666666', borderRadius: 4, fontSize: 14 }, props: { text: '上一页' }, zIndex: 3 },
        { type: 'button', left: 550, top: 1010, width: 40, height: 40, style: { backgroundColor: '#1890ff', color: '#ffffff', borderRadius: 4, fontSize: 14 }, props: { text: '1' }, zIndex: 3 },
        { type: 'button', left: 600, top: 1010, width: 40, height: 40, style: { backgroundColor: '#f5f5f5', color: '#666666', borderRadius: 4, fontSize: 14 }, props: { text: '2' }, zIndex: 3 },
        { type: 'button', left: 650, top: 1010, width: 40, height: 40, style: { backgroundColor: '#f5f5f5', color: '#666666', borderRadius: 4, fontSize: 14 }, props: { text: '3' }, zIndex: 3 },
        { type: 'text', left: 700, top: 1020, width: 40, height: 20, style: { fontSize: 14, color: '#999999' }, props: { content: '...' }, zIndex: 3 },
        { type: 'button', left: 750, top: 1010, width: 40, height: 40, style: { backgroundColor: '#f5f5f5', color: '#666666', borderRadius: 4, fontSize: 14 }, props: { text: '10' }, zIndex: 3 },
        { type: 'button', left: 800, top: 1010, width: 60, height: 40, style: { backgroundColor: '#f5f5f5', color: '#666666', borderRadius: 4, fontSize: 14 }, props: { text: '下一页' }, zIndex: 3 },
        
        // 页脚
        { type: 'container', left: 0, top: 1100, width: 1200, height: 200, style: { backgroundColor: '#2c3e50', padding: '40px 50px' }, props: {}, zIndex: 1 },
        { type: 'text', left: 50, top: 1120, width: 200, height: 36, style: { fontSize: 24, fontWeight: 'bold', color: '#ffffff' }, props: { content: '产品中心' }, zIndex: 2 },
        { type: 'text', left: 50, top: 1165, width: 300, height: 40, style: { fontSize: 14, color: '#a0aec0', lineHeight: '1.6' }, props: { content: '为您提供优质的数码产品和配件\n品质保证，售后无忧' }, zIndex: 2 },
        
        { type: 'text', left: 400, top: 1120, width: 100, height: 24, style: { fontSize: 16, fontWeight: '500', color: '#ffffff' }, props: { content: '快速链接' }, zIndex: 2 },
        { type: 'text', left: 400, top: 1150, width: 150, height: 60, style: { fontSize: 14, color: '#a0aec0', lineHeight: '1.8' }, props: { content: '首页\n全部产品\n新品上市\n限时特惠' }, zIndex: 2 },
        
        { type: 'text', left: 600, top: 1120, width: 100, height: 24, style: { fontSize: 16, fontWeight: '500', color: '#ffffff' }, props: { content: '客户服务' }, zIndex: 2 },
        { type: 'text', left: 600, top: 1150, width: 150, height: 60, style: { fontSize: 14, color: '#a0aec0', lineHeight: '1.8' }, props: { content: '帮助中心\n退换货政策\n配送说明\n联系我们' }, zIndex: 2 },
        
        { type: 'text', left: 800, top: 1120, width: 100, height: 24, style: { fontSize: 16, fontWeight: '500', color: '#ffffff' }, props: { content: '联系我们' }, zIndex: 2 },
        { type: 'text', left: 800, top: 1150, width: 150, height: 60, style: { fontSize: 14, color: '#a0aec0', lineHeight: '1.8' }, props: { content: '电话: 400-123-4567\n邮箱: service@example.com\n地址: 北京市朝阳区xxx路' }, zIndex: 2 },
        
        { type: 'container', left: 0, top: 1300, width: 1200, height: 60, style: { backgroundColor: '#1a252f', padding: '20px 50px' }, props: {}, zIndex: 1 },
        { type: 'text', left: 50, top: 1310, width: 400, height: 24, style: { fontSize: 14, color: '#718096', textAlign: 'left' }, props: { content: '© 2024 产品中心. 保留所有权利.' }, zIndex: 2 },
        { type: 'text', left: 1000, top: 1310, width: 150, height: 24, style: { fontSize: 14, color: '#718096', textAlign: 'right' }, props: { content: '京ICP备12345678号' }, zIndex: 2 },
      ]
    }
  },
  { 
    name: '博客文章页', 
    icon: '博',
    config: {
      width: 1000,
      height: 1200,
      backgroundColor: '#ffffff',
      components: [
        // 导航栏
        { type: 'navMenu', left: 0, top: 0, width: 1000, height: 50, style: { backgroundColor: '#ffffff', borderBottom: '1px solid #e8e8e8' }, props: { logo: '我的博客', logoUrl: '#', menuItems: '首页|#\n技术|#tech\n生活|#life\n关于|#about', activeIndex: 0 }, zIndex: 2 },
        // 面包屑导航
        { type: 'breadcrumb', left: 30, top: 70, width: 300, height: 30, style: { backgroundColor: 'transparent' }, props: { items: '首页|#\n技术|#tech\n文章详情|#article', showHome: true }, zIndex: 2 },
        // 侧边栏 - 使用 tabs 组件
        { type: 'tabs', left: 30, top: 120, width: 220, height: 500, style: { backgroundColor: '#f8f9fa', borderRadius: 8 }, props: { tabs: '文章分类|categories\n热门标签|tags\n关于我|about', activeTab: 'categories', type: 'line' }, zIndex: 2 },
        { type: 'text', left: 280, top: 120, width: 690, height: 60, style: { fontSize: 32, fontWeight: 'bold', color: '#333333' }, props: { content: '文章标题示例' }, zIndex: 1 },
        { type: 'text', left: 280, top: 320, width: 690, height: 24, style: { fontSize: 14, color: '#999999' }, props: { content: '发布时间：2024年1月1日 | 作者：管理员' }, zIndex: 1 },
        { type: 'image', left: 280, top: 370, width: 690, height: 350, style: { borderRadius: 8 }, props: { src: 'https://via.placeholder.com/690x350', alt: '文章配图' }, zIndex: 1 },
        // 评论表单
        { type: 'commentForm', left: 280, top: 900, width: 690, height: 250, style: { backgroundColor: '#f8f9fa', borderRadius: 8, border: '1px solid #e8e8e8' }, props: { title: '发表评论', showRating: true, ratingLabel: '评分', maxRating: 5, showAuthor: true, authorLabel: '昵称', authorPlaceholder: '请输入您的昵称', authorRequired: true, showEmail: true, emailLabel: '邮箱', emailPlaceholder: '请输入您的邮箱（不公开）', emailRequired: false, messageLabel: '评论内容', messagePlaceholder: '写下您的想法...', messageRequired: true, messageRows: 3, submitText: '提交评论' }, zIndex: 2 },
      ]
    }
  },
  { 
    name: '联系我们页', 
    icon: '联',
    config: {
      width: 1200,
      height: 800,
      backgroundColor: '#ffffff',
      components: [
        // 导航栏
        { type: 'navMenu', left: 0, top: 0, width: 1200, height: 50, style: { backgroundColor: '#ffffff', borderBottom: '1px solid #e8e8e8' }, props: { logo: '联系我们', logoUrl: '#', menuItems: '首页|#\n产品|#product\n关于|#about\n联系|#contact', activeIndex: 3 }, zIndex: 2 },
        // 面包屑导航
        { type: 'breadcrumb', left: 50, top: 70, width: 300, height: 30, style: { backgroundColor: 'transparent' }, props: { items: '首页|#\n联系我们|#contact', showHome: true }, zIndex: 2 },
        // 标题区域
        { type: 'text', left: 400, top: 120, width: 400, height: 40, style: { fontSize: 32, fontWeight: 'bold', color: '#333333', textAlign: 'center' }, props: { content: '联系我们' }, zIndex: 1 },
        { type: 'text', left: 350, top: 180, width: 500, height: 30, style: { fontSize: 16, color: '#666666', textAlign: 'center' }, props: { content: '有任何问题或建议，欢迎随时与我们联系' }, zIndex: 1 },
        // 联系信息 - 使用 tabs 组件
        { type: 'tabs', left: 100, top: 260, width: 1000, height: 200, style: { backgroundColor: '#f8f9fa', borderRadius: 8 }, props: { tabs: '地址信息|address\n电话咨询|phone\n邮件联系|email', activeTab: 'address', type: 'card' }, zIndex: 2 },
        // 联系表单 - 使用 contactForm 组件
        { type: 'contactForm', left: 250, top: 500, width: 700, height: 260, style: { backgroundColor: '#ffffff', padding: 30, borderRadius: 12, border: '1px solid #e8e8e8', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }, props: { title: '在线留言', showName: true, nameLabel: '您的姓名', namePlaceholder: '请输入您的姓名', nameRequired: true, showEmail: true, emailLabel: '电子邮箱', emailPlaceholder: '请输入您的邮箱', emailRequired: true, showPhone: true, phoneLabel: '联系电话', phonePlaceholder: '请输入您的电话', phoneRequired: false, showSubject: true, subjectLabel: '留言主题', subjectPlaceholder: '请选择留言主题', subjectRequired: true, showMessage: true, messageLabel: '留言内容', messagePlaceholder: '请详细描述您的问题或建议...', messageRequired: true, messageRows: 4, submitText: '提交留言' }, zIndex: 2 },
      ]
    }
  },
  { 
    name: '用户登录页', 
    icon: '登',
    config: {
      width: 1200,
      height: 800,
      backgroundColor: '#f0f2f5',
      components: [
        // 背景装饰
        { type: 'container', left: 0, top: 0, width: 600, height: 800, style: { backgroundColor: '#1890ff' }, props: {}, zIndex: 1 },
        { type: 'text', left: 100, top: 300, width: 400, height: 80, style: { fontSize: 48, fontWeight: 'bold', color: '#ffffff', textAlign: 'center' }, props: { content: '欢迎回来' }, zIndex: 2 },
        { type: 'text', left: 150, top: 400, width: 300, height: 60, style: { fontSize: 18, color: '#ffffff', textAlign: 'center', lineHeight: '1.8' }, props: { content: '登录您的账户\n继续使用我们的服务' }, zIndex: 2 },
        // 登录表单 - 使用 loginForm 组件
        { type: 'loginForm', left: 700, top: 150, width: 400, height: 500, style: { backgroundColor: '#ffffff', borderRadius: 12, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)' }, props: { title: '用户登录', submitText: '登录', showRemember: true, rememberText: '记住我', showForgot: true, forgotText: '忘记密码？', forgotLink: '#forgot-password' }, zIndex: 2 },
      ]
    }
  },
  { 
    name: '数据统计页', 
    icon: '数',
    config: {
      width: 1200,
      height: 900,
      backgroundColor: '#f5f5f5',
      components: [
        // 导航栏
        { type: 'navMenu', left: 0, top: 0, width: 1200, height: 50, style: { backgroundColor: '#ffffff', borderBottom: '1px solid #e8e8e8' }, props: { logo: '数据统计', logoUrl: '#', menuItems: '概览|#overview\n分析|#analytics\n报告|#reports', activeIndex: 0 }, zIndex: 2 },
        // 面包屑导航
        { type: 'breadcrumb', left: 30, top: 65, width: 300, height: 30, style: { backgroundColor: 'transparent' }, props: { items: '首页|#\n数据|#data\n概览|#overview', showHome: true }, zIndex: 2 },
        // 数据展示 - 使用 tabs 组件
        { type: 'tabs', left: 30, top: 110, width: 1140, height: 650, style: { backgroundColor: '#ffffff', borderRadius: 8 }, props: { tabs: '统计概览|overview\n趋势分析|trends\n实时数据|realtime', activeTab: 'overview', type: 'card' }, zIndex: 2 },
      ]
    }
  }
]

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

// 应用预设页面（完整网页模板）
function applyPresetPage(page) {
  console.log('applyPresetPage called with:', page.name)
  resetPage()
  updatePage({
    width: page.config.width,
    height: page.config.height,
    backgroundColor: page.config.backgroundColor
  })
  // 添加组件
  page.config.components.forEach(comp => {
    const newComp = {
      id: generateId(comp.type),
      type: comp.type,
      name: COMPONENT_DEFAULTS[comp.type]?.name || comp.type,
      left: comp.left,
      top: comp.top,
      width: comp.width,
      height: comp.height,
      style: { ...comp.style },
      props: { ...comp.props },
      zIndex: comp.zIndex || 3
    }
    addComponentFromConfig(newComp)
  })
  console.log('applyPresetPage completed')
}

// 应用预设布局（添加到现有页面）
function applyPresetLayout(layout) {
  console.log('applyPresetLayout called with:', layout.name)
  // 计算布局放置位置（页面中心）
  const centerX = Math.max(0, (page.width - 800) / 2)
  const centerY = Math.max(0, (page.height - 400) / 2)
  
  // 添加组件到现有页面
  layout.components.forEach(comp => {
    const newComp = {
      id: generateId(comp.type),
      type: comp.type,
      name: COMPONENT_DEFAULTS[comp.type]?.name || comp.type,
      left: comp.left + centerX,
      top: comp.top + centerY,
      width: comp.width,
      height: comp.height,
      style: { ...comp.style },
      props: { ...comp.props },
      zIndex: comp.zIndex || 3
    }
    addComponentFromConfig(newComp)
  })
  console.log('applyPresetLayout completed')
}

// 从配置添加组件
function addComponentFromConfig(config) {
  // 直接使用解构出的方法
  addComponentFromConfigStore(config)
}

// 生成ID
function generateId(type) {
  return `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
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
  gap: 4px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border);
}

.tabs button {
  flex: 1;
  padding: 8px 10px;
  font-size: 12px;
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
