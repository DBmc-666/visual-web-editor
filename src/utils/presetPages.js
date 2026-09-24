/**
 * @file 预设页面模板
 * @description 每个模板是一份完整的页面数据（宽高 + 组件数组），
 * 通过编辑器的 applyPageTemplate 应用到画布。
 * 独立成模块便于测试与扩展。
 */

export const PRESET_PAGES = [
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
        { type: 'container', left: 0, top: 70, width: 1200, height: 450, style: { backgroundType: 'gradient-linear', backgroundGradientStart: '#667eea', backgroundGradientEnd: '#764ba2', backgroundGradientAngle: 135 }, props: {}, zIndex: 1 },
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
        { type: 'container', left: 150, top: 1600, width: 900, height: 200, style: { backgroundType: 'gradient-linear', backgroundGradientStart: '#667eea', backgroundGradientEnd: '#764ba2', backgroundGradientAngle: 135, borderRadius: 16 }, props: {}, zIndex: 1 },
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
        { type: 'button', left: 520, top: 235, width: 80, height: 36, style: { backgroundColor: '#1890ff', color: '#ffffff', borderRadius: 4, fontSize: 13 }, props: { content: '全部' }, zIndex: 3 },
        { type: 'button', left: 610, top: 235, width: 80, height: 36, style: { backgroundColor: '#f5f5f5', color: '#666666', borderRadius: 4, fontSize: 13 }, props: { content: '新品' }, zIndex: 3 },
        { type: 'button', left: 700, top: 235, width: 80, height: 36, style: { backgroundColor: '#f5f5f5', color: '#666666', borderRadius: 4, fontSize: 13 }, props: { content: '热销' }, zIndex: 3 },
        { type: 'button', left: 790, top: 235, width: 80, height: 36, style: { backgroundColor: '#f5f5f5', color: '#666666', borderRadius: 4, fontSize: 13 }, props: { content: '特惠' }, zIndex: 3 },
        
        // 排序选项
        { type: 'text', left: 950, top: 240, width: 60, height: 24, style: { fontSize: 14, color: '#666666', fontWeight: '500' }, props: { content: '排序:' }, zIndex: 3 },
        { type: 'button', left: 1020, top: 235, width: 100, height: 36, style: { backgroundColor: '#f5f5f5', color: '#666666', borderRadius: 4, fontSize: 13 }, props: { content: '综合排序' }, zIndex: 3 },
        
        // 产品卡片网格 - 第一行
        { type: 'container', left: 50, top: 320, width: 260, height: 320, style: { backgroundColor: '#ffffff', borderRadius: 8, padding: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }, props: {}, zIndex: 1 },
        { type: 'image', left: 65, top: 335, width: 230, height: 180, style: { borderRadius: 6 }, props: { src: 'https://via.placeholder.com/230x180', alt: '产品图片' }, zIndex: 2 },
        { type: 'text', left: 65, top: 530, width: 230, height: 24, style: { fontSize: 16, fontWeight: '500', color: '#333333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, props: { content: '无线蓝牙耳机 Pro' }, zIndex: 2 },
        { type: 'text', left: 65, top: 560, width: 230, height: 40, style: { fontSize: 12, color: '#999999', lineHeight: '1.5' }, props: { content: '高品质音效，超长续航，舒适佩戴' }, zIndex: 2 },
        { type: 'text', left: 65, top: 605, width: 100, height: 28, style: { fontSize: 20, fontWeight: 'bold', color: '#ff4d4f' }, props: { content: '¥299' }, zIndex: 2 },
        { type: 'text', left: 180, top: 610, width: 80, height: 20, style: { fontSize: 12, color: '#999999', textDecoration: 'line-through' }, props: { content: '¥399' }, zIndex: 2 },
        { type: 'button', left: 65, top: 640, width: 230, height: 36, style: { backgroundColor: '#1890ff', color: '#ffffff', borderRadius: 4, fontSize: 14 }, props: { content: '立即购买' }, zIndex: 2 },
        
        { type: 'container', left: 330, top: 320, width: 260, height: 320, style: { backgroundColor: '#ffffff', borderRadius: 8, padding: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }, props: {}, zIndex: 1 },
        { type: 'image', left: 345, top: 335, width: 230, height: 180, style: { borderRadius: 6 }, props: { src: 'https://via.placeholder.com/230x180', alt: '产品图片' }, zIndex: 2 },
        { type: 'text', left: 345, top: 530, width: 230, height: 24, style: { fontSize: 16, fontWeight: '500', color: '#333333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, props: { content: '智能手表 Ultra' }, zIndex: 2 },
        { type: 'text', left: 345, top: 560, width: 230, height: 40, style: { fontSize: 12, color: '#999999', lineHeight: '1.5' }, props: { content: '健康监测，运动追踪，防水设计' }, zIndex: 2 },
        { type: 'text', left: 345, top: 605, width: 100, height: 28, style: { fontSize: 20, fontWeight: 'bold', color: '#ff4d4f' }, props: { content: '¥1299' }, zIndex: 2 },
        { type: 'text', left: 460, top: 610, width: 80, height: 20, style: { fontSize: 12, color: '#999999', textDecoration: 'line-through' }, props: { content: '¥1599' }, zIndex: 2 },
        { type: 'button', left: 345, top: 640, width: 230, height: 36, style: { backgroundColor: '#1890ff', color: '#ffffff', borderRadius: 4, fontSize: 14 }, props: { content: '立即购买' }, zIndex: 2 },
        
        { type: 'container', left: 610, top: 320, width: 260, height: 320, style: { backgroundColor: '#ffffff', borderRadius: 8, padding: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }, props: {}, zIndex: 1 },
        { type: 'image', left: 625, top: 335, width: 230, height: 180, style: { borderRadius: 6 }, props: { src: 'https://via.placeholder.com/230x180', alt: '产品图片' }, zIndex: 2 },
        { type: 'text', left: 625, top: 530, width: 230, height: 24, style: { fontSize: 16, fontWeight: '500', color: '#333333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, props: { content: '便携式蓝牙音箱' }, zIndex: 2 },
        { type: 'text', left: 625, top: 560, width: 230, height: 40, style: { fontSize: 12, color: '#999999', lineHeight: '1.5' }, props: { content: '360度环绕音效，便携设计' }, zIndex: 2 },
        { type: 'text', left: 625, top: 605, width: 100, height: 28, style: { fontSize: 20, fontWeight: 'bold', color: '#ff4d4f' }, props: { content: '¥459' }, zIndex: 2 },
        { type: 'text', left: 740, top: 610, width: 80, height: 20, style: { fontSize: 12, color: '#999999', textDecoration: 'line-through' }, props: { content: '¥599' }, zIndex: 2 },
        { type: 'button', left: 625, top: 640, width: 230, height: 36, style: { backgroundColor: '#1890ff', color: '#ffffff', borderRadius: 4, fontSize: 14 }, props: { content: '立即购买' }, zIndex: 2 },
        
        { type: 'container', left: 890, top: 320, width: 260, height: 320, style: { backgroundColor: '#ffffff', borderRadius: 8, padding: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }, props: {}, zIndex: 1 },
        { type: 'image', left: 905, top: 335, width: 230, height: 180, style: { borderRadius: 6 }, props: { src: 'https://via.placeholder.com/230x180', alt: '产品图片' }, zIndex: 2 },
        { type: 'text', left: 905, top: 530, width: 230, height: 24, style: { fontSize: 16, fontWeight: '500', color: '#333333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, props: { content: '机械键盘 RGB' }, zIndex: 2 },
        { type: 'text', left: 905, top: 560, width: 230, height: 40, style: { fontSize: 12, color: '#999999', lineHeight: '1.5' }, props: { content: '热插拔轴体，RGB背光，全键无冲' }, zIndex: 2 },
        { type: 'text', left: 905, top: 605, width: 100, height: 28, style: { fontSize: 20, fontWeight: 'bold', color: '#ff4d4f' }, props: { content: '¥699' }, zIndex: 2 },
        { type: 'text', left: 1020, top: 610, width: 80, height: 20, style: { fontSize: 12, color: '#999999', textDecoration: 'line-through' }, props: { content: '¥899' }, zIndex: 2 },
        { type: 'button', left: 905, top: 640, width: 230, height: 36, style: { backgroundColor: '#1890ff', color: '#ffffff', borderRadius: 4, fontSize: 14 }, props: { content: '立即购买' }, zIndex: 2 },
        
        // 产品卡片网格 - 第二行
        { type: 'container', left: 50, top: 660, width: 260, height: 320, style: { backgroundColor: '#ffffff', borderRadius: 8, padding: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }, props: {}, zIndex: 1 },
        { type: 'image', left: 65, top: 675, width: 230, height: 180, style: { borderRadius: 6 }, props: { src: 'https://via.placeholder.com/230x180', alt: '产品图片' }, zIndex: 2 },
        { type: 'text', left: 65, top: 870, width: 230, height: 24, style: { fontSize: 16, fontWeight: '500', color: '#333333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, props: { content: '无线充电板' }, zIndex: 2 },
        { type: 'text', left: 65, top: 900, width: 230, height: 40, style: { fontSize: 12, color: '#999999', lineHeight: '1.5' }, props: { content: '15W快充，兼容多设备' }, zIndex: 2 },
        { type: 'text', left: 65, top: 945, width: 100, height: 28, style: { fontSize: 20, fontWeight: 'bold', color: '#ff4d4f' }, props: { content: '¥159' }, zIndex: 2 },
        { type: 'text', left: 180, top: 950, width: 80, height: 20, style: { fontSize: 12, color: '#999999', textDecoration: 'line-through' }, props: { content: '¥199' }, zIndex: 2 },
        { type: 'button', left: 65, top: 980, width: 230, height: 36, style: { backgroundColor: '#1890ff', color: '#ffffff', borderRadius: 4, fontSize: 14 }, props: { content: '立即购买' }, zIndex: 2 },
        
        { type: 'container', left: 330, top: 660, width: 260, height: 320, style: { backgroundColor: '#ffffff', borderRadius: 8, padding: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }, props: {}, zIndex: 1 },
        { type: 'image', left: 345, top: 675, width: 230, height: 180, style: { borderRadius: 6 }, props: { src: 'https://via.placeholder.com/230x180', alt: '产品图片' }, zIndex: 2 },
        { type: 'text', left: 345, top: 870, width: 230, height: 24, style: { fontSize: 16, fontWeight: '500', color: '#333333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, props: { content: '降噪耳机 Max' }, zIndex: 2 },
        { type: 'text', left: 345, top: 900, width: 230, height: 40, style: { fontSize: 12, color: '#999999', lineHeight: '1.5' }, props: { content: '主动降噪，Hi-Res认证' }, zIndex: 2 },
        { type: 'text', left: 345, top: 945, width: 100, height: 28, style: { fontSize: 20, fontWeight: 'bold', color: '#ff4d4f' }, props: { content: '¥1599' }, zIndex: 2 },
        { type: 'text', left: 460, top: 950, width: 80, height: 20, style: { fontSize: 12, color: '#999999', textDecoration: 'line-through' }, props: { content: '¥1999' }, zIndex: 2 },
        { type: 'button', left: 345, top: 980, width: 230, height: 36, style: { backgroundColor: '#1890ff', color: '#ffffff', borderRadius: 4, fontSize: 14 }, props: { content: '立即购买' }, zIndex: 2 },
        
        { type: 'container', left: 610, top: 660, width: 260, height: 320, style: { backgroundColor: '#ffffff', borderRadius: 8, padding: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }, props: {}, zIndex: 1 },
        { type: 'image', left: 625, top: 675, width: 230, height: 180, style: { borderRadius: 6 }, props: { src: 'https://via.placeholder.com/230x180', alt: '产品图片' }, zIndex: 2 },
        { type: 'text', left: 625, top: 870, width: 230, height: 24, style: { fontSize: 16, fontWeight: '500', color: '#333333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, props: { content: '游戏鼠标 Pro' }, zIndex: 2 },
        { type: 'text', left: 625, top: 900, width: 230, height: 40, style: { fontSize: 12, color: '#999999', lineHeight: '1.5' }, props: { content: '16000DPI，RGB灯效，人体工学' }, zIndex: 2 },
        { type: 'text', left: 625, top: 945, width: 100, height: 28, style: { fontSize: 20, fontWeight: 'bold', color: '#ff4d4f' }, props: { content: '¥399' }, zIndex: 2 },
        { type: 'text', left: 740, top: 950, width: 80, height: 20, style: { fontSize: 12, color: '#999999', textDecoration: 'line-through' }, props: { content: '¥499' }, zIndex: 2 },
        { type: 'button', left: 625, top: 980, width: 230, height: 36, style: { backgroundColor: '#1890ff', color: '#ffffff', borderRadius: 4, fontSize: 14 }, props: { content: '立即购买' }, zIndex: 2 },
        
        { type: 'container', left: 890, top: 660, width: 260, height: 320, style: { backgroundColor: '#ffffff', borderRadius: 8, padding: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }, props: {}, zIndex: 1 },
        { type: 'image', left: 905, top: 675, width: 230, height: 180, style: { borderRadius: 6 }, props: { src: 'https://via.placeholder.com/230x180', alt: '产品图片' }, zIndex: 2 },
        { type: 'text', left: 905, top: 870, width: 230, height: 24, style: { fontSize: 16, fontWeight: '500', color: '#333333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, props: { content: '平板电脑支架' }, zIndex: 2 },
        { type: 'text', left: 905, top: 900, width: 230, height: 40, style: { fontSize: 12, color: '#999999', lineHeight: '1.5' }, props: { content: '多角度调节，稳固耐用' }, zIndex: 2 },
        { type: 'text', left: 905, top: 945, width: 100, height: 28, style: { fontSize: 20, fontWeight: 'bold', color: '#ff4d4f' }, props: { content: '¥89' }, zIndex: 2 },
        { type: 'text', left: 1020, top: 950, width: 80, height: 20, style: { fontSize: 12, color: '#999999', textDecoration: 'line-through' }, props: { content: '¥119' }, zIndex: 2 },
        { type: 'button', left: 905, top: 980, width: 230, height: 36, style: { backgroundColor: '#1890ff', color: '#ffffff', borderRadius: 4, fontSize: 14 }, props: { content: '立即购买' }, zIndex: 2 },
        
        // 分页区域
        { type: 'container', left: 50, top: 1000, width: 1100, height: 60, style: { backgroundColor: '#ffffff', borderRadius: 8, padding: '10px' }, props: {}, zIndex: 2 },
        { type: 'button', left: 480, top: 1010, width: 60, height: 40, style: { backgroundColor: '#f5f5f5', color: '#666666', borderRadius: 4, fontSize: 14 }, props: { content: '上一页' }, zIndex: 3 },
        { type: 'button', left: 550, top: 1010, width: 40, height: 40, style: { backgroundColor: '#1890ff', color: '#ffffff', borderRadius: 4, fontSize: 14 }, props: { content: '1' }, zIndex: 3 },
        { type: 'button', left: 600, top: 1010, width: 40, height: 40, style: { backgroundColor: '#f5f5f5', color: '#666666', borderRadius: 4, fontSize: 14 }, props: { content: '2' }, zIndex: 3 },
        { type: 'button', left: 650, top: 1010, width: 40, height: 40, style: { backgroundColor: '#f5f5f5', color: '#666666', borderRadius: 4, fontSize: 14 }, props: { content: '3' }, zIndex: 3 },
        { type: 'text', left: 700, top: 1020, width: 40, height: 20, style: { fontSize: 14, color: '#999999' }, props: { content: '...' }, zIndex: 3 },
        { type: 'button', left: 750, top: 1010, width: 40, height: 40, style: { backgroundColor: '#f5f5f5', color: '#666666', borderRadius: 4, fontSize: 14 }, props: { content: '10' }, zIndex: 3 },
        { type: 'button', left: 800, top: 1010, width: 60, height: 40, style: { backgroundColor: '#f5f5f5', color: '#666666', borderRadius: 4, fontSize: 14 }, props: { content: '下一页' }, zIndex: 3 },
        
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
      width: 1200,
      height: 1960,
      backgroundColor: '#f5f7fa',
      components: [
        { type: 'navMenu', left: 0, top: 0, width: 1200, height: 60, style: { backgroundColor: '#ffffff', borderBottom: '1px solid #e8e8e8' }, props: { logo: '我的博客', logoUrl: '#', menuItems: '首页|#\n技术|#tech\n生活|#life\n关于|#about', activeIndex: 0 }, zIndex: 2 },
        { type: 'breadcrumb', left: 50, top: 80, width: 400, height: 30, style: { backgroundColor: 'transparent' }, props: { items: '首页|#\n技术|#tech\n文章详情|#article', showHome: true }, zIndex: 2 },
        { type: 'container', left: 50, top: 130, width: 280, height: 800, style: { backgroundColor: '#ffffff', borderRadius: 12, padding: '24px' }, props: {}, zIndex: 2 },
        { type: 'text', left: 74, top: 145, width: 232, height: 32, style: { fontSize: 18, fontWeight: 'bold', color: '#333333', textAlign: 'left', borderBottom: '2px solid #667eea', paddingBottom: '8px' }, props: { content: '文章分类' }, zIndex: 3 },
        { type: 'text', left: 74, top: 195, width: 232, height: 28, style: { fontSize: 14, color: '#666666', textAlign: 'left', cursor: 'pointer' }, props: { content: '前端开发' }, zIndex: 3 },
        { type: 'text', left: 74, top: 230, width: 232, height: 28, style: { fontSize: 14, color: '#666666', textAlign: 'left', cursor: 'pointer' }, props: { content: '后端技术' }, zIndex: 3 },
        { type: 'text', left: 74, top: 265, width: 232, height: 28, style: { fontSize: 14, color: '#666666', textAlign: 'left', cursor: 'pointer' }, props: { content: '数据库' }, zIndex: 3 },
        { type: 'text', left: 74, top: 300, width: 232, height: 28, style: { fontSize: 14, color: '#666666', textAlign: 'left', cursor: 'pointer' }, props: { content: '人工智能' }, zIndex: 3 },
        { type: 'text', left: 74, top: 335, width: 232, height: 28, style: { fontSize: 14, color: '#666666', textAlign: 'left', cursor: 'pointer' }, props: { content: '运维部署' }, zIndex: 3 },
        { type: 'text', left: 74, top: 385, width: 232, height: 32, style: { fontSize: 18, fontWeight: 'bold', color: '#333333', textAlign: 'left', borderBottom: '2px solid #667eea', paddingBottom: '8px' }, props: { content: '热门标签' }, zIndex: 3 },
        { type: 'text', left: 74, top: 435, width: 60, height: 26, style: { fontSize: 12, color: '#667eea', textAlign: 'center', backgroundColor: '#f0f4ff', borderRadius: '12px', padding: '4px 12px' }, props: { content: 'Vue' }, zIndex: 3 },
        { type: 'text', left: 150, top: 435, width: 60, height: 26, style: { fontSize: 12, color: '#667eea', textAlign: 'center', backgroundColor: '#f0f4ff', borderRadius: '12px', padding: '4px 12px' }, props: { content: 'React' }, zIndex: 3 },
        { type: 'text', left: 226, top: 435, width: 80, height: 26, style: { fontSize: 12, color: '#667eea', textAlign: 'center', backgroundColor: '#f0f4ff', borderRadius: '12px', padding: '4px 12px' }, props: { content: 'TypeScript' }, zIndex: 3 },
        { type: 'text', left: 74, top: 475, width: 60, height: 26, style: { fontSize: 12, color: '#667eea', textAlign: 'center', backgroundColor: '#f0f4ff', borderRadius: '12px', padding: '4px 12px' }, props: { content: 'Node.js' }, zIndex: 3 },
        { type: 'text', left: 150, top: 475, width: 60, height: 26, style: { fontSize: 12, color: '#667eea', textAlign: 'center', backgroundColor: '#f0f4ff', borderRadius: '12px', padding: '4px 12px' }, props: { content: 'Python' }, zIndex: 3 },
        { type: 'text', left: 226, top: 475, width: 70, height: 26, style: { fontSize: 12, color: '#667eea', textAlign: 'center', backgroundColor: '#f0f4ff', borderRadius: '12px', padding: '4px 12px' }, props: { content: 'Docker' }, zIndex: 3 },
        { type: 'text', left: 74, top: 525, width: 232, height: 32, style: { fontSize: 18, fontWeight: 'bold', color: '#333333', textAlign: 'left', borderBottom: '2px solid #667eea', paddingBottom: '8px' }, props: { content: '关于我' }, zIndex: 3 },
        { type: 'container', left: 134, top: 565, width: 60, height: 60, style: { backgroundColor: '#667eea', borderRadius: '50%' }, props: {}, zIndex: 3 },
        { type: 'text', left: 74, top: 640, width: 232, height: 24, style: { fontSize: 16, fontWeight: 'bold', color: '#333333', textAlign: 'center' }, props: { content: '技术博主' }, zIndex: 3 },
        { type: 'text', left: 74, top: 670, width: 232, height: 60, style: { fontSize: 13, color: '#999999', textAlign: 'center', lineHeight: '1.6' }, props: { content: '热爱技术，乐于分享\n专注于前端开发和技术架构' }, zIndex: 3 },
        { type: 'text', left: 360, top: 130, width: 790, height: 70, style: { fontSize: 36, fontWeight: 'bold', color: '#333333', textAlign: 'left', lineHeight: '1.3' }, props: { content: '深入理解 Vue 3 组合式 API 的设计理念' }, zIndex: 1 },
        { type: 'container', left: 360, top: 220, width: 790, height: 48, style: { backgroundColor: '#f8f9fa', borderRadius: '24px', padding: '0 20px', display: 'flex', alignItems: 'center' }, props: {}, zIndex: 1 },
        { type: 'text', left: 380, top: 232, width: 150, height: 24, style: { fontSize: 14, color: '#666666', textAlign: 'left' }, props: { content: '发布时间：2024年1月15日' }, zIndex: 2 },
        { type: 'text', left: 550, top: 232, width: 120, height: 24, style: { fontSize: 14, color: '#666666', textAlign: 'left' }, props: { content: '作者：技术达人' }, zIndex: 2 },
        { type: 'text', left: 690, top: 232, width: 120, height: 24, style: { fontSize: 14, color: '#666666', textAlign: 'left' }, props: { content: '阅读量：2.3k' }, zIndex: 2 },
        { type: 'text', left: 830, top: 232, width: 120, height: 24, style: { fontSize: 14, color: '#667eea', textAlign: 'left', cursor: 'pointer' }, props: { content: '#Vue3 #前端' }, zIndex: 2 },
        { type: 'image', left: 360, top: 280, width: 790, height: 420, style: { borderRadius: 12 }, props: { src: 'https://via.placeholder.com/790x420', alt: '文章配图' }, zIndex: 1 },
        { type: 'container', left: 360, top: 720, width: 790, height: 450, style: { backgroundColor: '#ffffff', borderRadius: 12, padding: '40px' }, props: {}, zIndex: 1 },
        { type: 'text', left: 400, top: 740, width: 710, height: 32, style: { fontSize: 22, fontWeight: 'bold', color: '#333333', textAlign: 'left' }, props: { content: '一、什么是组合式 API' }, zIndex: 2 },
        { type: 'text', left: 400, top: 785, width: 710, height: 80, style: { fontSize: 16, color: '#555555', textAlign: 'justify', lineHeight: '1.8' }, props: { content: 'Vue 3 的组合式 API（Composition API）是一组基于函数的 API，它允许我们使用函数来组织组件逻辑，而不是选项对象。这种方式在处理复杂组件时更加灵活，便于代码复用和逻辑组织。' }, zIndex: 2 },
        { type: 'text', left: 400, top: 880, width: 710, height: 32, style: { fontSize: 22, fontWeight: 'bold', color: '#333333', textAlign: 'left' }, props: { content: '二、为什么需要组合式 API' }, zIndex: 2 },
        { type: 'text', left: 400, top: 925, width: 710, height: 80, style: { fontSize: 16, color: '#555555', textAlign: 'justify', lineHeight: '1.8' }, props: { content: '在 Vue 2 中，我们使用选项式 API（Options API）来组织代码。当组件变得复杂时，相关的逻辑会被分散到不同的选项中，导致代码难以维护。组合式 API 通过将相关逻辑组织在一起，解决了这个问题。' }, zIndex: 2 },
        { type: 'text', left: 400, top: 1020, width: 710, height: 32, style: { fontSize: 22, fontWeight: 'bold', color: '#333333', textAlign: 'left' }, props: { content: '三、核心概念' }, zIndex: 2 },
        { type: 'text', left: 400, top: 1065, width: 710, height: 80, style: { fontSize: 16, color: '#555555', textAlign: 'justify', lineHeight: '1.8' }, props: { content: '组合式 API 的核心概念包括 setup() 函数、响应式系统（ref、reactive）、计算属性（computed）、侦听器（watch）以及生命周期钩子。这些 API 共同构成了 Vue 3 的响应式系统。' }, zIndex: 2 },
        { type: 'text', left: 400, top: 1160, width: 710, height: 80, style: { fontSize: 16, color: '#555555', textAlign: 'justify', lineHeight: '1.8' }, props: { content: '通过组合式 API，我们可以将组件逻辑拆分成可复用的函数，这些函数可以在多个组件之间共享。这种方式不仅提高了代码的可维护性，也使得单元测试变得更加容易。' }, zIndex: 2 },
        { type: 'text', left: 360, top: 1200, width: 790, height: 32, style: { fontSize: 22, fontWeight: 'bold', color: '#333333', textAlign: 'left' }, props: { content: '相关文章推荐' }, zIndex: 1 },
        { type: 'container', left: 360, top: 1250, width: 250, height: 300, style: { backgroundColor: '#ffffff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }, props: {}, zIndex: 1 },
        { type: 'image', left: 360, top: 1250, width: 250, height: 150, style: {}, props: { src: 'https://via.placeholder.com/250x150', alt: '推荐文章1' }, zIndex: 2 },
        { type: 'text', left: 375, top: 1415, width: 220, height: 40, style: { fontSize: 15, color: '#333333', textAlign: 'left', fontWeight: 'bold', lineHeight: '1.4' }, props: { content: 'Vue 3 响应式原理详解' }, zIndex: 2 },
        { type: 'text', left: 375, top: 1465, width: 220, height: 24, style: { fontSize: 13, color: '#999999', textAlign: 'left' }, props: { content: '2024年1月10日' }, zIndex: 2 },
        { type: 'container', left: 630, top: 1250, width: 250, height: 300, style: { backgroundColor: '#ffffff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }, props: {}, zIndex: 1 },
        { type: 'image', left: 630, top: 1250, width: 250, height: 150, style: {}, props: { src: 'https://via.placeholder.com/250x150', alt: '推荐文章2' }, zIndex: 2 },
        { type: 'text', left: 645, top: 1415, width: 220, height: 40, style: { fontSize: 15, color: '#333333', textAlign: 'left', fontWeight: 'bold', lineHeight: '1.4' }, props: { content: 'TypeScript 高级类型技巧' }, zIndex: 2 },
        { type: 'text', left: 645, top: 1465, width: 220, height: 24, style: { fontSize: 13, color: '#999999', textAlign: 'left' }, props: { content: '2024年1月8日' }, zIndex: 2 },
        { type: 'container', left: 900, top: 1250, width: 250, height: 300, style: { backgroundColor: '#ffffff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }, props: {}, zIndex: 1 },
        { type: 'image', left: 900, top: 1250, width: 250, height: 150, style: {}, props: { src: 'https://via.placeholder.com/250x150', alt: '推荐文章3' }, zIndex: 2 },
        { type: 'text', left: 915, top: 1415, width: 220, height: 40, style: { fontSize: 15, color: '#333333', textAlign: 'left', fontWeight: 'bold', lineHeight: '1.4' }, props: { content: 'Vite 构建工具入门指南' }, zIndex: 2 },
        { type: 'text', left: 915, top: 1465, width: 220, height: 24, style: { fontSize: 13, color: '#999999', textAlign: 'left' }, props: { content: '2024年1月5日' }, zIndex: 2 },
        { type: 'commentForm', left: 360, top: 1570, width: 790, height: 280, style: { backgroundColor: '#ffffff', borderRadius: 12, padding: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }, props: { title: '发表评论', showRating: true, ratingLabel: '评分', maxRating: 5, showAuthor: true, authorLabel: '昵称', authorPlaceholder: '请输入您的昵称', authorRequired: true, showEmail: true, emailLabel: '邮箱', emailPlaceholder: '请输入您的邮箱（不公开）', emailRequired: false, messageLabel: '评论内容', messagePlaceholder: '写下您的想法...', messageRequired: true, messageRows: 3, submitText: '提交评论' }, zIndex: 2 },
        { type: 'container', left: 0, top: 1880, width: 1200, height: 80, style: { backgroundColor: '#333333', padding: '25px 50px' }, props: {}, zIndex: 1 },
        { type: 'text', left: 50, top: 1895, width: 500, height: 24, style: { fontSize: 14, color: '#999999', textAlign: 'left' }, props: { content: '© 2024 我的博客. 保留所有权利.' }, zIndex: 2 },
        { type: 'text', left: 1000, top: 1895, width: 150, height: 24, style: { fontSize: 14, color: '#999999', textAlign: 'right' }, props: { content: '京ICP备12345678号' }, zIndex: 2 },
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
  },
  {
    name: '数据看板页',
    icon: '板',
    config: {
      width: 1200,
      height: 1240,
      backgroundColor: '#f0f2f5',
      components: [
        // 顶部导航
        { type: 'navMenu', left: 0, top: 0, width: 1200, height: 64, style: { backgroundColor: '#ffffff', borderBottom: '1px solid #e8e8e8', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }, props: { logo: '运营看板', logoUrl: '#', menuItems: '总览|#\n流量|#traffic\n转化|#convert\n设置|#settings', activeIndex: 0, alignment: 'left' }, zIndex: 5 },
        // 页面标题 + 徽章
        { type: 'text', left: 40, top: 96, width: 400, height: 36, style: { fontSize: 26, fontWeight: 'bold', color: '#1f2d3d' }, props: { content: '今日运营总览' }, zIndex: 3 },
        { type: 'badge', left: 400, top: 100, width: 84, height: 26, style: { fontSize: 12, color: '#52c41a' }, props: { text: '实时', backgroundColor: '#f6ffed', shape: 'pill', borderColor: '#b7eb8f', fontWeight: 600 }, zIndex: 3 },
        { type: 'text', left: 40, top: 140, width: 600, height: 24, style: { fontSize: 14, color: '#8c8c8c' }, props: { content: '数据每 5 分钟自动刷新 · 最后更新 09:30' }, zIndex: 3 },

        // 四张统计卡片（并排）
        { type: 'stat', left: 40, top: 184, width: 264, height: 118, style: { backgroundColor: '#ffffff', borderRadius: 10, padding: 16 }, props: { value: '128,640', label: '今日访问量', unit: '', trend: '+12.5%', trendUp: true, icon: '👁️', valueColor: '#1f2d3d', labelColor: '#8c8c8c', trendUpColor: '#52c41a', trendDownColor: '#ff4d4f' }, zIndex: 3 },
        { type: 'stat', left: 320, top: 184, width: 264, height: 118, style: { backgroundColor: '#ffffff', borderRadius: 10, padding: 16 }, props: { value: '3,182', label: '新增用户', unit: '', trend: '+8.2%', trendUp: true, icon: '👥', valueColor: '#1f2d3d', labelColor: '#8c8c8c', trendUpColor: '#52c41a', trendDownColor: '#ff4d4f' }, zIndex: 3 },
        { type: 'stat', left: 600, top: 184, width: 264, height: 118, style: { backgroundColor: '#ffffff', borderRadius: 10, padding: 16 }, props: { value: '4.6', label: '转化率', unit: '%', trend: '-0.8%', trendUp: false, icon: '🎯', valueColor: '#1f2d3d', labelColor: '#8c8c8c', trendUpColor: '#52c41a', trendDownColor: '#ff4d4f' }, zIndex: 3 },
        { type: 'stat', left: 880, top: 184, width: 264, height: 118, style: { backgroundColor: '#ffffff', borderRadius: 10, padding: 16 }, props: { value: '86', label: '平均停留时长', unit: ' 秒', trend: '+5.1%', trendUp: true, icon: '⏱️', valueColor: '#1f2d3d', labelColor: '#8c8c8c', trendUpColor: '#52c41a', trendDownColor: '#ff4d4f' }, zIndex: 3 },

        // 目标完成度（进度条）
        { type: 'container', left: 40, top: 322, width: 560, height: 268, style: { backgroundColor: '#ffffff', borderRadius: 10, padding: 20, borderColor: '#e8e8e8' }, props: {}, zIndex: 2 },
        { type: 'text', left: 64, top: 346, width: 400, height: 28, style: { fontSize: 17, fontWeight: 'bold', color: '#1f2d3d' }, props: { content: '本月目标完成度' }, zIndex: 3 },
        { type: 'progress', left: 64, top: 392, width: 512, height: 24, style: { backgroundColor: 'transparent' }, props: { value: 78, max: 100, barColor: '#1890ff', trackColor: '#f0f0f0', barHeight: 10, rounded: true, showLabel: true, labelColor: '#595959' }, zIndex: 3 },
        { type: 'progress', left: 64, top: 436, width: 512, height: 24, style: { backgroundColor: 'transparent' }, props: { value: 64, max: 100, barColor: '#52c41a', trackColor: '#f0f0f0', barHeight: 10, rounded: true, showLabel: true, labelColor: '#595959' }, zIndex: 3 },
        { type: 'progress', left: 64, top: 480, width: 512, height: 24, style: { backgroundColor: 'transparent' }, props: { value: 41, max: 100, barColor: '#faad14', trackColor: '#f0f0f0', barHeight: 10, rounded: true, showLabel: true, labelColor: '#595959' }, zIndex: 3 },
        { type: 'divider', left: 64, top: 524, width: 512, height: 20, style: { backgroundColor: 'transparent' }, props: { lineStyle: 'solid', thickness: 1, color: '#f0f0f0', text: '', textColor: '#999999', textSize: 12, textGap: 12 }, zIndex: 3 },
        { type: 'list', left: 64, top: 540, width: 512, height: 40, style: { fontSize: 13, color: '#8c8c8c', lineHeight: '1.6', textAlign: 'left' }, props: { items: '数据每小时同步一次 · 异常会自动告警', listType: 'unordered', marker: '•', markerColor: '#1890ff', itemSpacing: 0 }, zIndex: 3 },

        // 渠道明细（表格）
        { type: 'container', left: 620, top: 322, width: 540, height: 268, style: { backgroundColor: '#ffffff', borderRadius: 10, padding: 20, borderColor: '#e8e8e8' }, props: {}, zIndex: 2 },
        { type: 'text', left: 644, top: 346, width: 400, height: 28, style: { fontSize: 17, fontWeight: 'bold', color: '#1f2d3d' }, props: { content: '渠道来源明细' }, zIndex: 3 },
        { type: 'table', left: 644, top: 386, width: 492, height: 184, style: { fontSize: 13, color: '#595959', backgroundColor: '#ffffff' }, props: { headers: '渠道|访问|转化', rows: '自然搜索|48,210|5.2%\n社交媒体|32,880|4.1%\n直接访问|26,540|6.8%\n广告投放|21,010|2.9%', showHeader: true, headerBackground: '#fafafa', headerColor: '#1f2d3d', borderColor: '#f0f0f0', striped: true, cellPadding: 8, linkTarget: '_self' }, zIndex: 3 },

        // 常见问题（折叠面板）
        { type: 'text', left: 40, top: 626, width: 400, height: 32, style: { fontSize: 20, fontWeight: 'bold', color: '#1f2d3d' }, props: { content: '指标说明与常见问题' }, zIndex: 3 },
        { type: 'accordion', left: 40, top: 674, width: 1120, height: 300, style: { backgroundColor: '#ffffff', borderColor: '#e8e8e8', fontSize: 14, color: '#1f2d3d' }, props: { items: '访问量（UV）是怎么统计的？|按独立访客去重统计，同一设备 24 小时内只计一次。\n转化率的计算口径是什么？|完成目标行为的访客数 ÷ 总访客数，目标行为可在「设置」里配置。\n数据多久刷新一次？|每 5 分钟自动刷新，也可手动点击右上角刷新按钮。\n可以导出报表吗？|支持导出 CSV，点右上角「报告」页即可下载。', firstOpen: true, allowMultiple: false, headerBackground: '#fafafa', activeColor: '#1890ff', itemPadding: 14 }, zIndex: 3 },

        // 页脚
        { type: 'container', left: 0, top: 1020, width: 1200, height: 220, style: { backgroundColor: '#1f2d3d' }, props: {}, zIndex: 1 },
        { type: 'text', left: 60, top: 1064, width: 320, height: 28, style: { fontSize: 18, fontWeight: 'bold', color: '#ffffff' }, props: { content: '运营看板' }, zIndex: 2 },
        { type: 'text', left: 60, top: 1104, width: 420, height: 60, style: { fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: '1.7' }, props: { content: '为运营团队提供实时、可信的数据视图，帮助快速定位问题、验证策略效果。' }, zIndex: 2 },
        { type: 'text', left: 620, top: 1064, width: 200, height: 26, style: { fontSize: 14, fontWeight: 'bold', color: '#ffffff' }, props: { content: '快捷入口' }, zIndex: 2 },
        { type: 'list', left: 620, top: 1100, width: 200, height: 100, style: { fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: '2', textAlign: 'left' }, props: { items: '数据总览|#\n渠道分析|#traffic\n转化漏斗|#convert\n系统设置|#settings', listType: 'none', marker: '•', markerColor: '#1890ff', itemSpacing: 0 }, zIndex: 2 },
        { type: 'text', left: 900, top: 1064, width: 240, height: 26, style: { fontSize: 14, fontWeight: 'bold', color: '#ffffff' }, props: { content: '联系我们' }, zIndex: 2 },
        { type: 'list', left: 900, top: 1100, width: 240, height: 80, style: { fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: '2', textAlign: 'left' }, props: { items: 'data@example.com|[发送邮件](mailto:data@example.com)\n工作日 9:00 - 18:00', listType: 'none', marker: '•', markerColor: '#1890ff', itemSpacing: 0 }, zIndex: 2 },
        { type: 'divider', left: 60, top: 1180, width: 1080, height: 20, style: { backgroundColor: 'transparent' }, props: { lineStyle: 'solid', thickness: 1, color: 'rgba(255,255,255,0.15)', text: '', textColor: '#999999', textSize: 12, textGap: 12 }, zIndex: 2 },
        { type: 'text', left: 60, top: 1204, width: 600, height: 24, style: { fontSize: 12, color: 'rgba(255,255,255,0.45)' }, props: { content: '© 2026 运营看板 · 数据仅供参考' }, zIndex: 2 },
      ]
    }
  }
]

export default PRESET_PAGES