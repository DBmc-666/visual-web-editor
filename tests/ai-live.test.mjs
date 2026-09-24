/**
 * @file 真实 AI 接口测试（可选，默认不运行）
 *
 * 运行方式：
 *   set VWE_KEY_FILE=E:\0\key\新建文本文档.txt
 *   npm run test:ai
 *
 * 未设置 VWE_KEY_FILE 时自动跳过，不会导致测试失败。
 * 会真实消耗 API 额度，并需要网络（走直连，浏览器里则走 Vite 代理）。
 */

import fs from 'node:fs'
import { importSrc, loadSavedZip, resetSavedFiles } from './helpers.mjs'

export const name = '真实 AI 接口（可选）'

const KEY_FILE = process.env.VWE_KEY_FILE
const MODEL = process.env.VWE_MODEL || 'deepseek-v4.1-flash'
const BASE_URL = process.env.VWE_BASE_URL || 'https://opencode.ai/zen/go/v1'

export default async function run(t) {
  if (!KEY_FILE) {
    t.check('未设置 VWE_KEY_FILE，已跳过真实 AI 测试', true, '（设置后可运行 npm run test:ai）')
    return
  }
  if (!fs.existsSync(KEY_FILE)) {
    t.check('Key 文件不存在，已跳过', true, KEY_FILE)
    return
  }

  const settingsMod = await importSrc('utils/aiSettings.js')
  const svc = await importSrc('services/aiService.js')
  const prompt = await importSrc('utils/aiPromptBuilder.js')
  const parser = await importSrc('utils/aiResponseParser.js')
  const schema = await importSrc('utils/componentSchema.js')
  const gen = await importSrc('utils/htmlGenerator.js')
  const editorMod = await importSrc('stores/editor.js')

  const keyText = fs.readFileSync(KEY_FILE, 'utf8')
  const parsedKey = settingsMod.parseKeyFile(keyText)
  t.check('能从文件解析出 API Key', !!parsedKey && parsedKey.key.length > 10,
    parsedKey ? `长度 ${parsedKey.key.length}` : '未解析到')

  if (!parsedKey) return

  const settings = { provider: 'opencode-go', baseUrl: BASE_URL, model: MODEL, apiKey: parsedKey.key, temperature: 0.7 }
  const ed = editorMod.useEditor()
  const editorState = editorMod.editorState

  // ==================== 连接测试 ====================
  t.group('连接测试')
  const conn = await svc.testConnection(settings, 60000)
  t.check('测试连接成功', conn.ok === true, conn.message)

  if (!conn.ok) return

  // ==================== 单页画布生成 ====================
  t.group('单页画布生成')

  const canvas = ed.addCanvas('AI 测试画布')
  ed.switchCanvas(canvas.id)
  editorState.page.name = 'AI 测试页'
  editorState.page.components = []
  ed.addComponent('text')

  const pageContract = schema.getPageContract(editorState.page)
  const siteContract = schema.getSiteContract(ed.activeCanvas.value, ed.activePageId.value)
  const msgs = prompt.buildGenerateMessages({
    pageContract,
    siteContract,
    instruction: '一个只有导航栏、大标题和一个按钮的极简落地页',
    mode: prompt.AI_MODES.REWRITE,
    styleKey: 'modern',
    pageType: '极简落地页'
  })

  let content = ''
  try {
    content = await svc.chatCompletion({
      baseUrl: settings.baseUrl,
      apiKey: settings.apiKey,
      model: settings.model,
      temperature: settings.temperature,
      timeout: 240000,
      messages: [{ role: 'system', content: msgs.system }, { role: 'user', content: msgs.user }]
    })
  } catch (error) {
    t.check('单页生成请求成功', false, `${error.name}: ${error.message}`)
    return
  }
  t.check('单页生成请求成功', content.length > 0, `${content.length} 字符`)

  const parsedPage = parser.parseAiPageResponse(content)
  t.check('单页结果解析成功', parsedPage.success === true, (parsedPage.errors || []).join('；'))
  if (!parsedPage.success) return

  t.check('生成结果有组件', parsedPage.page.components.length > 0, String(parsedPage.page.components.length))
  t.check('无越界组件', parsedPage.page.components.every(c =>
    c.left >= 0 && c.top >= 0 &&
    c.left + c.width <= parsedPage.page.width + 2 &&
    c.top + c.height <= parsedPage.page.height + 2), '')
  t.check('无真实重叠（同 top 且水平相交）', countRealOverlaps(parsedPage.page.components) === 0,
    String(countRealOverlaps(parsedPage.page.components)))

  // 应用 + 导出
  const applyCount = ed.applyComponents(parsedPage.page.components, { replace: true })
  t.check('能应用到画布', applyCount > 0, String(applyCount))
  const singleHtml = gen.generatePageHTML(editorState.page)
  t.check('能导出为完整 HTML', singleHtml.includes('<html') && singleHtml.length > 2000, `${singleHtml.length} 字符`)

  // ==================== 多页站点生成 ====================
  t.group('多页站点生成')

  const siteCanvas = ed.addCanvas('AI 站点画布')
  ed.switchCanvas(siteCanvas.id)
  const siteContractForSite = schema.getSiteContract(ed.activeCanvas.value, ed.activePageId.value)
  const siteMsgs = prompt.buildSiteMessages({
    siteContract: siteContractForSite,
    instruction: '做一个企业官网，包含首页、产品中心、联系我们三个页面，导航与页脚保持一致并可互相跳转',
    styleKey: 'business',
    pageType: '企业官网',
    pageCount: 3
  })

  let siteContent = ''
  try {
    siteContent = await svc.chatCompletion({
      baseUrl: settings.baseUrl,
      apiKey: settings.apiKey,
      model: settings.model,
      temperature: settings.temperature,
      timeout: 300000,
      messages: [{ role: 'system', content: siteMsgs.system }, { role: 'user', content: siteMsgs.user }]
    })
  } catch (error) {
    t.check('多页生成请求成功', false, `${error.name}: ${error.message}`)
    return
  }
  t.check('多页生成请求成功', siteContent.length > 0, `${siteContent.length} 字符`)

  const parsedSite = parser.parseAiSiteResponse(siteContent)
  t.check('多页结果解析成功', parsedSite.success === true, (parsedSite.errors || []).join('；'))
  if (!parsedSite.success) return

  t.check('生成多个页面', parsedSite.site.pages.length >= 2, String(parsedSite.site.pages.length))
  t.check('每页都有组件', parsedSite.site.pages.every(p => p.components.length > 0))
  t.check('每页无真实重叠',
    parsedSite.site.pages.every(p => countRealOverlaps(p.components) === 0),
    JSON.stringify(parsedSite.stats))
  t.check('AI 给出了英文 slug', parsedSite.site.pages.some(p => !!p.slug),
    parsedSite.site.pages.map(p => p.slug || '(无)').join(','))

  const applied = ed.applySitePages(parsedSite.site.pages, { replace: true })
  t.check('能创建页面到画布', !!applied && applied.created === parsedSite.site.pages.length, JSON.stringify(applied))
  t.check('页面跳转链接被串联', applied.linkStats.total > 0 && applied.linkStats.unresolved === 0,
    JSON.stringify(applied.linkStats))

  resetSavedFiles()
  await gen.exportSiteWithImages(ed.activeCanvas.value, 'ai-live-site')
  const zip = await loadSavedZip()
  t.check('整站导出成功', zip.names.filter(n => n.endsWith('.html')).length >= 2, zip.names.join(','))
  const hasIndex = zip.names.includes('index.html')
  t.check('首页导出为 index.html', hasIndex, zip.names.join(','))
  if (hasIndex) {
    const indexHtml = await zip.read('index.html')
    t.check('导出后无残留 #page:', !indexHtml.includes('#page:'))
  }
}

/**
 * 统计"真实重叠"（排除父子包含关系）
 */
function countRealOverlaps(components) {
  const contains = (p, c) =>
    p.left <= c.left + 2 && p.top <= c.top + 2 &&
    p.left + p.width >= c.left + c.width - 2 && p.top + p.height >= c.top + c.height - 2

  let count = 0
  for (let i = 0; i < components.length; i++) {
    for (let j = i + 1; j < components.length; j++) {
      const a = components[i]
      const b = components[j]
      if (contains(a, b) || contains(b, a)) continue
      const overlapX = a.left < b.left + b.width && b.left < a.left + a.width
      const overlapY = a.top < b.top + b.height && b.top < a.top + a.height
      if (overlapX && overlapY) count++
    }
  }
  return count
}
