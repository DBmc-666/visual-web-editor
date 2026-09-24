/**
 * @file AI 链路测试：页面链接工具、站点契约、Prompt 构建、响应解析、slug
 */

import { importSrc } from './helpers.mjs'

export const name = 'AI 逻辑（链接 / 契约 / Prompt / 解析）'

export default async function run(t) {
  const links = await importSrc('utils/pageLinks.js')
  const prompt = await importSrc('utils/aiPromptBuilder.js')
  const parser = await importSrc('utils/aiResponseParser.js')
  const schema = await importSrc('utils/componentSchema.js')

  // ==================== 页面链接工具 ====================
  t.group('页面链接工具')

  t.equal('buildPageLink 格式正确', links.buildPageLink('p1'), '#page:p1')
  t.equal('parsePageLink 取值', links.parsePageLink('#page:p1'), 'p1')
  t.equal('parsePageLink 非页面链接返回空', links.parsePageLink('https://a.com'), '')

  const nameIndex = links.buildPageNameIndex([
    { id: 'id_home', name: '首页' },
    { id: 'id_about', name: '关于我们' }
  ])
  t.equal('中文页面名可解析', links.resolvePageLinkNames('#page:关于我们', nameIndex), '#page:id_about')
  t.equal(
    '页面名大小写不敏感（英文）',
    links.resolvePageLinkNames('#page:About', links.buildPageNameIndex([{ id: 'a1', name: 'About' }])),
    '#page:a1'
  )
  t.equal('未匹配的名称原样保留', links.resolvePageLinkNames('#page:不存在', nameIndex), '#page:不存在')
  t.equal('普通链接不受影响', links.resolvePageLinkNames('https://a.com/x', nameIndex), 'https://a.com/x')

  // 组件里各种位置的链接都要能解析（href / 导航菜单 / 列表 / 轮播）
  const comp = {
    type: 'navMenu',
    props: {
      href: '#page:关于我们',
      menuItems: '首页|#page:首页\n关于|#page:关于我们',
      items: '甲|#page:关于我们',
      images: 'https://i/a.jpg|图|#page:关于我们|',
      content: '普通文本不受影响'
    }
  }
  links.resolveComponentPageLinks(comp, nameIndex)
  t.equal('href 被解析', comp.props.href, '#page:id_about')
  t.equal('menuItems 里的链接被解析', comp.props.menuItems, '首页|#page:id_home\n关于|#page:id_about')
  t.equal('items 里的链接被解析', comp.props.items, '甲|#page:id_about')
  t.equal('轮播 images 里的链接被解析', comp.props.images, 'https://i/a.jpg|图|#page:id_about|')
  t.equal('普通文本未被破坏', comp.props.content, '普通文本不受影响')

  const statOk = links.countPageLinks([{ components: [{ props: { href: '#page:id_about' } }] }], new Set(['id_about']))
  t.check('countPageLinks 统计正确', statOk.total === 1 && statOk.unresolved === 0, JSON.stringify(statOk))
  const statBad = links.countPageLinks([{ components: [{ props: { href: '#page:不存在' } }] }], new Set(['id_about']))
  t.check('countPageLinks 能识别未解析链接', statBad.total === 1 && statBad.unresolved === 1, JSON.stringify(statBad))

  t.group('slug 清洗')
  t.equal('基本清洗', links.sanitizeSlug('Products Page'), 'products-page')
  t.equal('去非法字符', links.sanitizeSlug('关于我们 about/us!'), 'about-us')
  t.equal('纯中文返回空', links.sanitizeSlug('关于我们'), '')
  t.check('空值返回空', links.sanitizeSlug('') === '' && links.sanitizeSlug(null) === '')

  // ==================== 站点契约 ====================
  t.group('站点契约与 Prompt')

  const siteContract = schema.getSiteContract(
    {
      name: '我的站点',
      pages: [
        { id: 'p1', name: '首页', width: 1200, height: 800, components: [{}, {}] },
        { id: 'p2', name: '关于我们', width: 1200, height: 800, components: [] }
      ]
    },
    'p1'
  )
  t.check('站点契约结构正确',
    siteContract.pageCount === 2 && siteContract.pages[0].isCurrent === true &&
    siteContract.pages[1].isCurrent === false && siteContract.pages[0].componentCount === 2,
    JSON.stringify(siteContract))

  const pageMsgs = prompt.buildGenerateMessages({
    pageContract: { name: '首页', width: 1200, height: 800, components: [] },
    siteContract,
    instruction: '做一个企业首页',
    mode: prompt.AI_MODES.REWRITE,
    styleKey: 'business'
  })
  t.includes('单页 Prompt 含站点页面清单', pageMsgs.system, '本站页面清单')
  t.includes('单页 Prompt 含目标页面名', pageMsgs.system, '关于我们')
  t.includes('单页 Prompt 含跨页链接规则', pageMsgs.system, '#page:<页面名>')
  t.includes('单页 Prompt 标注当前页', pageMsgs.system, '（当前正在编辑的页面）')

  const noSiteMsgs = prompt.buildGenerateMessages({
    pageContract: { name: '首页', width: 1200, height: 800, components: [] },
    instruction: '',
    mode: prompt.AI_MODES.REWRITE
  })
  t.check('只有 1 个页面时不加页面清单', !noSiteMsgs.system.includes('本站页面清单'))

  const siteMsgs = prompt.buildSiteMessages({ siteContract, instruction: '做一个企业站', styleKey: 'business', pageCount: 4 })
  t.includes('多页 Prompt 含多页 JSON 结构', siteMsgs.system, '多页 JSON 结构')
  t.includes('多页 Prompt 含 pages 字段', siteMsgs.system, '"pages"')
  t.includes('多页 Prompt 要求英文 slug', siteMsgs.system, 'slug')
  t.includes('多页 Prompt 含跨页链接规则', siteMsgs.system, '#page:<页面名>')
  t.includes('多页 Prompt 含坐标规则', siteMsgs.system, '画布坐标模型')
  t.includes('多页 Prompt 用户消息含期望页数', siteMsgs.user, '期望页面数量')
  t.includes('多页 Prompt 含已有站点结构', siteMsgs.user, '编辑器已有的站点结构')

  // ==================== JSON 提取 ====================
  t.group('JSON 提取容错')

  const objExtract = parser.extractJSONObject('前面废话 {"a":1} 后面废话')
  t.equal('能从杂文中提取对象', objExtract.raw, '{"a":1}')
  const fenceExtract = parser.extractJSONObject('```json\n{"b":2}\n```')
  t.equal('能剥离 Markdown 代码块', fenceExtract.raw, '{"b":2}')
  const arrExtract = parser.extractJSONObject('说明 [{"c":3}] 结束')
  t.equal('能提取顶层数组（保留方括号）', arrExtract.raw, '[{"c":3}]')
  t.check('无 JSON 时给出错误', !!parser.extractJSONObject('没有 json').error)

  // ==================== 多页响应解析 ====================
  t.group('多页响应解析')

  const mkComp = (id, type, left, top, w, h, props = {}) => ({ id, type, left, top, width: w, height: h, zIndex: 3, style: {}, props })

  const siteJson = JSON.stringify({
    siteName: '测试站点',
    pages: [
      {
        name: '首页', slug: 'index', width: 1200, height: 2000, backgroundColor: '#ffffff',
        components: [
          mkComp('a1', 'navMenu', 0, 0, 1200, 72, { logo: 'L', menuItems: '首页|#page:首页\n关于|#page:关于我们' }),
          mkComp('a2', 'text', 100, 200, 400, 60, { content: '主标题' }),
          mkComp('a3', 'button', 100, 300, 120, 44, { content: '了解', actionType: 'link', href: '#page:关于我们' })
        ]
      },
      {
        name: '关于我们', slug: 'About', width: 1200, height: 1500, backgroundColor: '#ffffff',
        components: [
          mkComp('b1', 'text', 100, 200, 400, 60, { content: '标题' }),
          mkComp('b2', 'text', 100, 200, 400, 60, { content: '重叠的标题' }),
          mkComp('b3', 'list', 100, 400, 300, 120, { items: '回首页|#page:首页' })
        ]
      },
      { name: '空页面', width: 1200, height: 800, components: [] }
    ]
  })

  const parsed = parser.parseAiSiteResponse(siteJson)
  t.check('多页解析成功', parsed.success === true, (parsed.errors || []).join('；'))
  t.equal('页面数正确（空页面被跳过）', parsed.site.pages.length, 2)
  t.equal('站点名解析正确', parsed.site.name, '测试站点')
  t.equal('组件总数统计正确', parsed.stats.componentCount, 6)
  t.check('逐页重叠修复生效', parsed.stats.overlapsBefore > 0 && parsed.stats.overlapsAfter === 0, JSON.stringify(parsed.stats))
  t.check('跳过空页面有警告', (parsed.errors || []).some(e => e.includes('空页面')), JSON.stringify(parsed.errors))
  t.check('页面名保留（中文）', parsed.site.pages[0].name === '首页' && parsed.site.pages[1].name === '关于我们')
  t.check('每页尺寸独立保留', parsed.site.pages[0].height === 2000 && parsed.site.pages[1].height === 1500)
  t.equal('AI 的 slug 被保留并清洗', parsed.site.pages[1].slug, 'about')
  t.equal('pagesRepair 带 slug（供 UI 显示）', parsed.pagesRepair[1].slug, 'about')

  const dupParsed = parser.parseAiSiteResponse(JSON.stringify({
    pages: [
      { name: '首页', width: 1200, height: 900, components: [mkComp('x1', 'text', 0, 0, 100, 40, { content: 'A' })] },
      { name: '首页', width: 1200, height: 900, components: [mkComp('x2', 'text', 0, 0, 100, 40, { content: 'B' })] }
    ]
  }))
  t.equal('同名页面自动去重', dupParsed.site.pages[1].name, '首页 2')

  t.check('缺少 pages 数组报错', parser.parseAiSiteResponse('{"foo":1}').success === false)
  t.check('空页面数组报错', parser.parseAiSiteResponse('{"pages":[]}').success === false)
  const tooMany = JSON.stringify({
    pages: Array.from({ length: 13 }, (_, i) => ({
      name: `P${i}`, width: 1200, height: 900,
      components: [mkComp(`t${i}`, 'text', 0, 0, 100, 40, { content: 'x' })]
    }))
  })
  const tooManyResult = parser.parseAiSiteResponse(tooMany)
  t.check('页面数超限报错', tooManyResult.success === false && (tooManyResult.errors[0] || '').includes('超过上限'), (tooManyResult.errors || []).join('；'))
  t.check('兼容直接返回页面数组', parser.parseAiSiteResponse(JSON.stringify([
    { name: '单页', width: 1200, height: 900, components: [mkComp('y1', 'text', 0, 0, 100, 40, { content: 'A' })] }
  ])).success === true)

  // ==================== 单页响应解析 ====================
  t.group('单页响应解析')

  const single = parser.parseAiPageResponse(JSON.stringify({
    name: '单页', width: 1200, height: 1000,
    components: [
      mkComp('s1', 'text', 100, 100, 400, 60, { content: 'A' }),
      mkComp('s2', 'text', 100, 100, 400, 60, { content: 'B' })
    ]
  }))
  t.check('单页解析成功且修复重叠', single.success === true && single.overlapsBefore > 0 && single.overlapsAfter === 0, JSON.stringify({ b: single.overlapsBefore, a: single.overlapsAfter }))
  t.check('空组件视为失败', parser.parseAiPageResponse('{"components":[]}').success === false)
  t.check('未知组件类型被过滤后为空则失败',
    parser.parseAiPageResponse('{"components":[{"type":"不存在的组件"}]}').success === false)

  // 关键回归：不要用当前页尺寸裁剪 AI 坐标（否则高页面被压扁，产生大量重叠）
  const tallPage = parser.parseAiPageResponse(JSON.stringify({
    name: 'T', width: 1200, height: 4000,
    components: [
      mkComp('t1', 'text', 0, 100, 400, 60, { content: 'A' }),
      mkComp('t2', 'text', 0, 2000, 400, 60, { content: 'B' }),
      mkComp('t3', 'text', 0, 3500, 400, 60, { content: 'C' })
    ]
  }))
  t.check('高页面坐标不被裁剪（保留 AI 原始 top）',
    tallPage.success && tallPage.overlapsBefore === 0 && tallPage.page.components.some(c => c.top > 3000),
    JSON.stringify({ overlaps: tallPage.overlapsBefore, tops: tallPage.page?.components?.map(c => c.top) }))
}
