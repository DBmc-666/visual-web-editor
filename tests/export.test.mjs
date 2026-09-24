/**
 * @file 导出管线测试：组件 HTML 生成、隐藏组件过滤、本地图片 ZIP 打包、多页整站导出与链接串联、Vue 导出
 */

import { importSrc, makeComponent, makePage, loadSavedZip, resetSavedFiles } from './helpers.mjs'

export const name = '导出管线（HTML / ZIP / 多页整站 / Vue）'

const DATA_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg=='

export default async function run(t) {
  const gen = await importSrc('utils/htmlGenerator.js')

  const pageWith = (components) => makePage({ components })

  // ==================== 既有组件导出 ====================
  t.group('既有组件导出')

  let html = gen.generatePageHTML(pageWith([
    makeComponent('text', { width: 200, height: 40, props: { content: '文本内容', textAlign: 'center' } }),
    makeComponent('image', { width: 200, height: 150, props: { src: 'https://img/a.png', alt: '图片' } }),
    makeComponent('button', { width: 120, height: 40, props: { content: '点我', actionType: 'alert', alertMessage: '你好' } }),
    makeComponent('container', { width: 300, height: 200, style: { backgroundColor: '#f0f0f0' } }),
    makeComponent('link', { width: 100, height: 30, props: { content: '链接', href: 'https://a.com' } }),
    makeComponent('navMenu', { width: 1200, height: 60, props: { logo: 'LOGO', menuItems: '首页|#' } }),
    makeComponent('breadcrumb', { width: 300, height: 30, props: { items: '首页|#', separator: '>' } }),
    makeComponent('tabs', { width: 600, height: 300, props: { tabs: '甲|a', activeTab: 'a' } }),
    makeComponent('loginForm', { width: 400, height: 320, props: { title: '登录', submitText: '进入' } }),
    makeComponent('datetime', { width: 330, height: 45, props: {} })
  ]))
  t.check('文本/图片/按钮/容器/链接导出',
    html.includes('文本内容') && html.includes('https://img/a.png') && html.includes('点我') &&
    html.includes('#f0f0f0') && html.includes('https://a.com'))
  t.check('导航/面包屑/标签页/表单/日期时间导出',
    html.includes('LOGO') && html.includes('breadcrumb-widget') && html.includes('tabs-header') &&
    html.includes('进入') && html.includes('datetime-widget'))
  t.check('日期时间脚本已注入', html.includes('updateDatetime') || html.includes('setInterval'))
  t.check('输出完整 HTML 文档', html.includes('<html') && html.includes('<body'))

  // ==================== 新增内容组件导出 ====================
  t.group('内容组件导出')

  html = gen.generatePageHTML(pageWith([
    makeComponent('divider', { width: 400, height: 24, props: { lineStyle: 'dashed', thickness: 2, color: '#ff0000', text: '分割' } }),
    makeComponent('icon', { width: 48, height: 48, style: { fontSize: 32, color: '#123456' }, props: { icon: '🚀', shape: 'circle', shapeColor: '#eeeeee', shapeSize: 40 } }),
    makeComponent('list', { width: 320, height: 160, props: { items: '苹果\n香蕉\n橘子', listType: 'ordered', markerColor: '#00ff00' } }),
    makeComponent('table', { width: 600, height: 180, props: { headers: '姓名|职位', rows: '张三|工程师\n李四|设计师', headerBackground: '#cccccc', borderColor: '#000000', striped: true } }),
    makeComponent('video', { width: 560, height: 315, props: { src: 'https://e.com/v.mp4', videoType: 'file', controls: true, muted: true, autoplay: true, loop: true } }),
    makeComponent('carousel', { width: 600, height: 300, props: { images: 'https://i/a.jpg|甲|https://t.com\nhttps://i/b.jpg|乙', autoplay: true, interval: 2000 } })
  ]))

  t.check('分隔线导出虚线边框与文字', html.includes('border-top: 2px dashed #ff0000') && html.includes('分割'))
  t.check('图标导出字符与圆形背景', html.includes('🚀') && html.includes('border-radius: 50%') && html.includes('#123456'))
  t.check('列表导出全部条目与有序编号', html.includes('苹果') && html.includes('橘子') && html.includes('1.') && html.includes('3.'))
  t.check('表格导出表头/数据/配色/斑马纹',
    html.includes('<th') && html.includes('姓名') && html.includes('设计师') &&
    html.includes('#cccccc') && html.includes('#fafafa'))
  t.check('视频导出 video 标签与属性',
    html.includes('<video') && html.includes('https://e.com/v.mp4') &&
    html.includes('controls') && html.includes('autoplay') && html.includes('muted') && html.includes('loop'))
  t.check('轮播导出图片/说明/指示点/箭头/脚本',
    html.includes('https://i/a.jpg') && html.includes('甲') && html.includes('carousel-dot') &&
    html.includes('carousel-arrow-left') && html.includes('setInterval'))

  html = gen.generatePageHTML(pageWith([
    makeComponent('video', { props: { src: 'https://player.example.com/embed/1', videoType: 'iframe' } })
  ]))
  t.check('视频 iframe 模式', html.includes('<iframe') && html.includes('player.example.com/embed/1'))

  html = gen.generatePageHTML(pageWith([makeComponent('carousel', { props: { images: '' } })]))
  t.check('轮播无图时给出提示', html.includes('请填写图片地址'))

  // ==================== 链接与隐藏 ====================
  t.group('链接与隐藏')

  html = gen.generatePageHTML(pageWith([
    makeComponent('carousel', { props: { images: 'https://i/a.jpg|甲|https://target.com/a\nhttps://i/b.jpg|乙', linkTarget: '_blank' } }),
    makeComponent('list', { props: { items: '首页|#home\n关于|https://about.com\n无链接项', linkTarget: '_blank' } })
  ]))
  t.check('轮播带链接的图输出 <a> 且带 target',
    html.includes('<a class="carousel-slide"') && html.includes('href="https://target.com/a"') && html.includes('target="_blank"'))
  t.check('轮播无链接的图不包 <a>', (html.match(/<a class="carousel-slide"/g) || []).length === 1)
  t.check('列表带链接项输出 <a>', html.includes('<a href="#home"') && html.includes('<a href="https://about.com"'))
  t.check('列表无链接项不包 <a>', (html.match(/<a href=/g) || []).length === 2)

  html = gen.generatePageHTML(pageWith([
    makeComponent('text', { props: { content: '可见' } }),
    makeComponent('carousel', { props: { images: 'https://i/x.jpg|隐藏的' }, visible: false }),
    makeComponent('table', { props: { headers: 'A|B', rows: '1|2' }, visible: false })
  ]))
  t.check('隐藏组件不导出', html.includes('可见') && !html.includes('隐藏的') && !html.includes('<th'))

  // ==================== 单页导出 + 本地图片打包 ====================
  t.group('单页导出与本地图片')

  const imgPage = pageWith([
    makeComponent('image', { props: { src: DATA_URL, localImage: true, imageFileName: 'photo.png' } }),
    makeComponent('carousel', { props: { images: `${DATA_URL}|本地图||slide.png` } }),
    makeComponent('tabs', { props: { tabs: '甲|a', activeTab: 'a', tabImages: { a: { url: DATA_URL, isLocalImage: true, fileName: 'tab.png' } } } })
  ])
  t.check('hasLocalImages 能识别图片/轮播/标签页', gen.hasLocalImages(imgPage) === true)

  resetSavedFiles()
  await gen.exportPageWithImages(imgPage, 'mypage')
  const single = await loadSavedZip()
  t.equal('单页导出文件名正确', single.name, 'mypage.zip')
  t.check('ZIP 含页面 HTML', single.names.includes('mypage.html'), single.names.join(','))
  t.check('ZIP 含图片（扩展名不重复）',
    single.names.includes('images/photo.png') && single.names.includes('images/slide.png') && single.names.includes('images/tab.png'),
    single.names.join(','))
  const singleHtml = await single.read('mypage.html')
  t.check('HTML 内路径替换为 images/', singleHtml.includes('images/photo.png') && singleHtml.includes('images/slide.png'))
  t.check('HTML 内不再含 data URL', !singleHtml.includes('data:image/png'))

  // ==================== 多页整站导出 ====================
  t.group('多页整站导出')

  const sitePages = [
    makePage({
      id: 'sp1', name: '首页', slug: 'index', height: 2000,
      components: [
        makeComponent('navMenu', { props: { menuItems: '首页|#page:sp1\n产品|#page:sp2\n关于|#page:sp3' } }),
        makeComponent('button', { props: { content: '去产品', actionType: 'link', href: '#page:sp2' } })
      ]
    }),
    makePage({
      id: 'sp2', name: '产品中心', slug: 'products', height: 1800,
      components: [makeComponent('list', { props: { items: '回首页|#page:sp1' } })]
    }),
    makePage({
      id: 'sp3', name: '关于我们', slug: 'about', height: 1500,
      components: [makeComponent('text', { props: { content: '关于内容' } })]
    })
  ]
  const canvas = { id: 'site-canvas', name: '我的站点', pages: sitePages }

  const fileMap = gen.buildPageFileMap(sitePages)
  t.check('文件名分配：首页固定 index.html，其余用 slug',
    fileMap.sp1 === 'index.html' && fileMap.sp2 === 'products.html' && fileMap.sp3 === 'about.html',
    JSON.stringify(fileMap))

  const nameMap = gen.buildPageNameFileMap(sitePages, fileMap)
  t.equal('名称映射可用于兜底', nameMap['产品中心'], 'products.html')
  t.equal('ID 形式链接重写', gen.rewritePageLinks('<a href="#page:sp2">x</a>', fileMap, nameMap), '<a href="products.html">x</a>')
  t.equal('名称形式链接兜底重写', gen.rewritePageLinks('<a href="#page:产品中心">x</a>', fileMap, nameMap), '<a href="products.html">x</a>')
  t.equal('未知目标降级为 #', gen.rewritePageLinks('<a href="#page:nope">x</a>', fileMap, nameMap), '<a href="#">x</a>')
  t.equal('外部链接不受影响', gen.rewritePageLinks('<a href="https://a.com">x</a>', fileMap, nameMap), '<a href="https://a.com">x</a>')

  resetSavedFiles()
  const siteResult = await gen.exportSiteWithImages(canvas, '我的站点')
  t.check('整站导出返回页面数', siteResult.pageCount === 3, JSON.stringify(siteResult))
  const site = await loadSavedZip()
  t.check('ZIP 含三个页面文件',
    site.names.includes('index.html') && site.names.includes('products.html') && site.names.includes('about.html'),
    site.names.join(','))
  const indexHtml = await site.read('index.html')
  t.check('index.html 内页面跳转已串联为文件名',
    indexHtml.includes('products.html') && indexHtml.includes('about.html') && !indexHtml.includes('#page:'))
  t.check('products.html 内容正确', (await site.read('products.html')).includes('回首页'))
  t.check('about.html 内容正确', (await site.read('about.html')).includes('关于内容'))

  // 中文页面名（无 slug）回退为 page-N
  const fallbackMap = gen.buildPageFileMap([
    makePage({ id: 'f1', name: '首页' }),
    makePage({ id: 'f2', name: '关于我们' }),
    makePage({ id: 'f3', name: 'About Us' }),
    makePage({ id: 'f4', name: 'About Us' })
  ])
  t.check('无 slug 的中文名回退 page-N', fallbackMap.f2 === 'page-2.html', fallbackMap.f2)
  t.check('英文名生成 slug', fallbackMap.f3 === 'about-us.html', fallbackMap.f3)
  t.check('重名自动加序号', fallbackMap.f4 === 'about-us-2.html', fallbackMap.f4)

  // ==================== SEO / head 注入 ====================
  t.group('SEO 与 head 注入')

  const seoHead = gen.buildSeoHead({
    name: '关于我们',
    seoTitle: '关于我们 - 鼎信科技',
    seoDescription: '鼎信科技成立于 2015 年，专注企业数字化解决方案。',
    seoKeywords: '企业官网,数字化,解决方案',
    seoFavicon: 'https://cdn.example.com/favicon.ico',
    seoOgImage: 'https://cdn.example.com/og.png',
    seoLang: 'en'
  })
  t.equal('lang 使用配置值', seoHead.lang, 'en')
  t.includes('title 使用 seoTitle', seoHead.head, '<title>关于我们 - 鼎信科技</title>')
  t.includes('输出 description', seoHead.head, 'name="description"')
  t.includes('输出 keywords', seoHead.head, 'name="keywords"')
  t.includes('输出 favicon', seoHead.head, 'rel="icon"')
  t.includes('输出 og:title', seoHead.head, 'property="og:title"')
  t.includes('输出 og:image', seoHead.head, 'property="og:image"')
  t.includes('默认输出 og:type', seoHead.head, 'property="og:type"')

  const seoFallback = gen.buildSeoHead({ name: '首页' })
  t.equal('未配置时 lang 默认 zh-CN', seoFallback.lang, 'zh-CN')
  t.includes('未配置 title 时回退页面名', seoFallback.head, '<title>首页</title>')
  t.check('未配置 description 时不输出该标签', !seoFallback.head.includes('name="description"'))
  t.check('未配置 favicon 时不输出该标签', !seoFallback.head.includes('rel="icon"'))

  const seoEscaped = gen.buildSeoHead({ name: 'A', seoTitle: '标题 "引号" & <标签>', seoDescription: 'a"b' })
  t.check('SEO 内容被转义（防注入）',
    !seoEscaped.head.includes('<标签>') && seoEscaped.head.includes('&lt;标签&gt;') && seoEscaped.head.includes('&quot;'),
    seoEscaped.head.split('\n')[2])

  const seoPageHtml = gen.generatePageHTML(makePage({
    name: '产品中心',
    seoTitle: '产品中心 - 鼎信科技',
    seoDescription: '云基础设施、数据智能与协同办公',
    seoKeywords: '云,数据,协同',
    seoLang: 'zh-CN'
  }))
  t.includes('导出的 HTML 含 SEO 标题', seoPageHtml, '<title>产品中心 - 鼎信科技</title>')
  t.includes('导出的 HTML 含 description', seoPageHtml, '云基础设施、数据智能与协同办公')
  t.includes('导出的 HTML 含 lang', seoPageHtml, '<html lang="zh-CN">')

  // ==================== 已知小缺口修复 ====================
  t.group('navMenu 对齐 / 视频本地封面 / 表格单元格链接')

  const navLeft = gen.generatePageHTML(pageWith([
    makeComponent('navMenu', { props: { logo: 'L', menuItems: '首页|#', alignment: 'left' } })
  ]))
  const navCenter = gen.generatePageHTML(pageWith([
    makeComponent('navMenu', { props: { logo: 'L', menuItems: '首页|#', alignment: 'center' } })
  ]))
  const navRight = gen.generatePageHTML(pageWith([
    makeComponent('navMenu', { props: { logo: 'L', menuItems: '首页|#', alignment: 'right' } })
  ]))
  t.includes('navMenu 居中对齐生效', navCenter, 'justify-content: center')
  t.includes('navMenu 右对齐生效', navRight, 'justify-content: flex-end')
  t.includes('navMenu 默认左对齐', navLeft, 'justify-content: flex-start')
  t.includes('Vue 导出也支持 navMenu 对齐',
    gen.generateVueComponent({
      name: 'N', width: 1200, height: 800, backgroundColor: '#fff',
      components: [makeComponent('navMenu', { props: { logo: 'L', menuItems: '首页|#', alignment: 'center' } })]
    }),
    "justifyContent: 'center'")

  // 表格单元格链接
  const tableLinks = gen.generatePageHTML(pageWith([
    makeComponent('table', {
      props: {
        headers: '产品|链接',
        rows: '基础版|[查看详情](https://example.com/basic)\n专业版|https://example.com/pro\n旗舰版|无链接',
        linkTarget: '_blank'
      }
    })
  ]))
  t.includes('Markdown 单元格链接渲染为 <a>', tableLinks, '<a href="https://example.com/basic"')
  t.includes('Markdown 链接使用可读文字', tableLinks, '>查看详情</a>')
  t.includes('纯网址单元格自动识别', tableLinks, '<a href="https://example.com/pro"')
  t.includes('单元格链接应用 target', tableLinks, 'target="_blank"')
  t.check('普通文本单元格不生成链接',
    tableLinks.includes('无链接') && (tableLinks.match(/<a href=/g) || []).length === 2,
    String((tableLinks.match(/<a href=/g) || []).length))
  t.includes('表格单元格链接也支持 #page:',
    gen.generatePageHTML(pageWith([
      makeComponent('table', { props: { headers: 'A', rows: '[去关于](#page:about)' } })
    ])),
    'href="#page:about"')

  // 视频本地封面图
  const posterPage = pageWith([
    makeComponent('video', {
      id: 'vid1',
      props: { src: 'https://e.com/v.mp4', videoType: 'file', poster: DATA_URL, posterLocalImage: true, posterFileName: 'cover.jpg' }
    })
  ])
  t.check('hasLocalImages 能识别视频本地封面', gen.hasLocalImages(posterPage) === true)
  const posterHtml = gen.generatePageHTML(posterPage, { vid1_poster: 'images/cover.png' })
  t.check('导出时封面路径被替换', posterHtml.includes('images/cover.png') && !posterHtml.includes('data:image/png'))
  t.check('未提供映射时保留原值（不报错）', gen.generatePageHTML(posterPage).includes('data:image/png'))

  resetSavedFiles()
  await gen.exportPageWithImages(posterPage, 'poster-test')
  const posterZip = await loadSavedZip()
  // 文件名沿用原名但扩展名以图片数据真实类型为准（cover.jpg + png 数据 → cover.png）
  t.check('ZIP 内含视频封面图', posterZip.names.includes('images/cover.png'), posterZip.names.join(','))
  t.check('导出 HTML 引用封面图', (await posterZip.read('poster-test.html')).includes('images/cover.png'))

  // ==================== 展示组件导出 ====================
  t.group('展示组件导出（进度条 / 折叠面板 / 徽章 / 统计卡片）')

  const showcaseHtml = gen.generatePageHTML(pageWith([
    makeComponent('progress', { props: { value: 45, max: 100, barColor: '#ff0000', trackColor: '#eeeeee', barHeight: 12, rounded: true, showLabel: true } }),
    makeComponent('accordion', { props: { items: '问题一|答案一\n问题二|答案二', firstOpen: true, allowMultiple: false, headerBackground: '#fafafa' } }),
    makeComponent('badge', { props: { text: '限时', backgroundColor: '#fff1f0', shape: 'pill', fontWeight: 700 }, style: { color: '#ff4d4f', fontSize: 12 } }),
    makeComponent('stat', { props: { value: '256', label: '订单数', unit: '+', trend: '8.2%', trendUp: true, icon: '📦' } })
  ]))

  t.includes('进度条：输出百分比与颜色', showcaseHtml, 'width: 45%')
  t.includes('进度条：使用配置的条色与轨道色', showcaseHtml, '#ff0000')
  t.includes('进度条：显示百分比文字', showcaseHtml, '45%')
  t.check('进度条：条高生效', showcaseHtml.includes('height: 12px'), '')

  t.includes('折叠面板：使用原生 details', showcaseHtml, '<details')
  t.includes('折叠面板：第一条默认展开', showcaseHtml, '<details open')
  t.includes('折叠面板：标题与内容都输出', showcaseHtml, '问题一')
  t.includes('折叠面板：输出互斥脚本', showcaseHtml, 'other.open = false')

  t.includes('徽章：输出文字与背景', showcaseHtml, '限时')
  t.includes('徽章：胶囊圆角', showcaseHtml, 'border-radius: 999px')
  t.includes('徽章：使用 style 颜色与字号', showcaseHtml, '#ff4d4f')

  t.includes('统计卡片：输出数值与单位', showcaseHtml, '256')
  t.includes('统计卡片：输出说明文字', showcaseHtml, '订单数')
  t.includes('统计卡片：输出趋势与箭头', showcaseHtml, '8.2%')
  t.includes('统计卡片：输出图标', showcaseHtml, '📦')

  // 折叠面板：允许同时展开时不输出互斥脚本
  const accordionMulti = gen.generatePageHTML(pageWith([
    makeComponent('accordion', { props: { items: 'A|a', allowMultiple: true } })
  ]))
  t.check('折叠面板：允许多开时不加互斥脚本', !accordionMulti.includes('other.open = false'))

  // 进度条：超出 max 时按 100% 处理，负值按 0
  const progressClamp = gen.generatePageHTML(pageWith([
    makeComponent('progress', { props: { value: 500, max: 100 } }),
    makeComponent('progress', { props: { value: -20, max: 100 } })
  ]))
  t.check('进度条：数值被裁剪到 0~100%',
    progressClamp.includes('width: 100%') && progressClamp.includes('width: 0%'))

  // Vue 导出
  const showcaseVue = gen.generateVueComponent({
    name: 'S', width: 1200, height: 800, backgroundColor: '#fff',
    components: [
      makeComponent('progress', { props: { value: 30, max: 100, showLabel: true } }),
      makeComponent('accordion', { props: { items: 'Q|A' } }),
      makeComponent('badge', { props: { text: '热' } }),
      makeComponent('stat', { props: { value: '99', label: '总数' } })
    ]
  })
  t.includes('Vue：进度条导出', showcaseVue, 'width: 30%')
  t.includes('Vue：折叠面板导出', showcaseVue, '<details')
  t.includes('Vue：徽章导出', showcaseVue, '热')
  t.includes('Vue：统计卡片导出', showcaseVue, '总数')

  // ==================== 整站 Vue 工程导出 ====================
  t.group('整站 Vue 工程导出')

  const vueSiteCanvas = {
    id: 'vs', name: '我的 Vue 站点',
    pages: [
      makePage({
        id: 'vp1', name: '首页', slug: 'index', seoTitle: '首页 - 鼎信科技', height: 2000,
        components: [
          makeComponent('navMenu', { props: { menuItems: '首页|#page:vp1\n关于|#page:vp2' } }),
          makeComponent('button', { props: { content: '去关于', actionType: 'link', href: '#page:vp2' } })
        ]
      }),
      makePage({
        id: 'vp2', name: '关于我们', slug: 'about-us', seoTitle: '关于我们 - 鼎信科技', height: 1500,
        components: [makeComponent('text', { props: { content: '关于内容' } })]
      })
    ]
  }

  const siteFiles = gen.generateVueSiteFiles(vueSiteCanvas)
  const fileNames = Object.keys(siteFiles)
  t.check('生成工程基础文件',
    ['package.json', 'vite.config.js', 'index.html', 'README.md', 'src/main.js', 'src/App.vue', 'src/router/index.js', 'src/assets/base.css']
      .every(f => fileNames.includes(f)),
    fileNames.join(','))
  t.check('每个页面生成一个视图组件',
    fileNames.includes('src/views/Index.vue') && fileNames.includes('src/views/AboutUs.vue'),
    fileNames.filter(f => f.startsWith('src/views/')).join(','))

  const pkg = JSON.parse(siteFiles['package.json'])
  t.check('package.json 含 vue 与 vue-router',
    !!pkg.dependencies.vue && !!pkg.dependencies['vue-router'] && !!pkg.scripts.dev,
    JSON.stringify(pkg.dependencies))
  t.includes('vite.config.js 使用 vue 插件', siteFiles['vite.config.js'], "@vitejs/plugin-vue")
  t.includes('main.js 挂载路由', siteFiles['src/main.js'], "use(router)")
  t.includes('App.vue 含 router-view', siteFiles['src/App.vue'], '<router-view />')

  const routerCode = siteFiles['src/router/index.js']
  t.includes('路由使用 hash 模式', routerCode, 'createWebHashHistory')
  t.includes('首页路由为 /', routerCode, 'path: "/"')
  t.includes('其余页面用 slug 路由', routerCode, 'path: "/about-us"')
  t.includes('路由带页面标题（来自 SEO）', routerCode, '首页 - 鼎信科技')
  t.includes('路由切换更新 document.title', routerCode, 'document.title')
  t.includes('index.html 标题取首页 SEO', siteFiles['index.html'], '<title>首页 - 鼎信科技</title>')

  const homeView = siteFiles['src/views/Index.vue']
  t.check('页面链接重写为路由路径（hash 形式）',
    homeView.includes('#/about-us') && !homeView.includes('#page:'),
    homeView.match(/href="[^"]*"/g)?.slice(0, 3).join(','))
  t.includes('README 列出页面与路由', siteFiles['README.md'], '/about-us')

  resetSavedFiles()
  const vueSiteResult = await gen.exportVueSiteWithImages(vueSiteCanvas, '我的 Vue 站点')
  t.check('整站 Vue 导出返回页面数', vueSiteResult.pageCount === 2, JSON.stringify(vueSiteResult))
  const vueZip = await loadSavedZip()
  t.check('ZIP 内含工程文件',
    vueZip.names.includes('package.json') && vueZip.names.includes('src/router/index.js') && vueZip.names.includes('src/views/AboutUs.vue'),
    vueZip.names.join(','))
  t.check('ZIP 内 index.html 存在', vueZip.names.includes('index.html'))

  // 带本地图片的整站 Vue 导出
  resetSavedFiles()
  await gen.exportVueSiteWithImages({
    id: 'vs2', name: '带图站点',
    pages: [makePage({
      id: 'vp3', name: '首页', slug: 'index',
      components: [makeComponent('image', { props: { src: DATA_URL, localImage: true, imageFileName: 'hero.png' } })]
    })]
  }, 'vue-with-img')
  const vueImgZip = await loadSavedZip()
  t.check('整站 Vue 也打包本地图片', vueImgZip.names.includes('images/hero.png'), vueImgZip.names.join(','))
  t.includes('视图内图片路径已替换', await vueImgZip.read('src/views/Index.vue'), 'images/hero.png')
  t.includes('README 提示包含本地图片', await vueImgZip.read('README.md'), '本地图片')

  // ==================== Vue 导出 ====================
  t.group('Vue 导出')

  const vue = gen.generateVueComponent({
    name: 'T', width: 1200, height: 800, backgroundColor: '#fff',
    components: [
      makeComponent('datetime', { props: {} }),
      makeComponent('loginForm', { props: {} }),
      makeComponent('carousel', { props: { images: 'https://i/a.jpg|甲', autoplay: true } }),
      makeComponent('table', { props: { headers: 'X|Y', rows: '1|2' } }),
      makeComponent('list', { props: { items: 'A|#a' } }),
      makeComponent('divider', { props: {} }),
      makeComponent('icon', { props: { icon: '⭐' } }),
      makeComponent('video', { props: { src: 'https://e.com/v.mp4', videoType: 'file' } })
    ]
  })
  t.check('Vue 模板含全部组件',
    vue.includes('updateDatetime') && vue.includes('handleLoginSubmit') && vue.includes('carouselShow') &&
    vue.includes('<table') && vue.includes('href="#a"') && vue.includes('⭐') && vue.includes('<video'))
  const scriptMatch = vue.match(/<script setup>([\s\S]*?)<\/script>/)
  if (scriptMatch) {
    const body = scriptMatch[1]
    t.check('Vue script 括号平衡',
      (body.match(/\{/g) || []).length === (body.match(/\}/g) || []).length)
    t.check('Vue 生命周期各生成一次',
      (body.match(/onMounted\(/g) || []).length === 1 && (body.match(/onUnmounted\(/g) || []).length === 1)
  } else {
    t.check('Vue script 段可解析', false, '未匹配到 <script setup>')
  }

  const vueNoCarousel = gen.generateVueComponent({
    name: 'T2', width: 1200, height: 800, backgroundColor: '#fff',
    components: [makeComponent('datetime', { props: {} })]
  })
  t.check('无轮播时不生成 carouselTimers', !vueNoCarousel.includes('carouselTimers'))
  t.check('无日期时间时不生成 datetimeInterval',
    !gen.generateVueComponent({
      name: 'T3', width: 1200, height: 800, backgroundColor: '#fff',
      components: [makeComponent('text', { props: { content: 'x' } })]
    }).includes('datetimeInterval'))
}
