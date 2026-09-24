/**
 * @file AI 状态管理模块
 * @description AI 辅助建站的流程编排：
 * 读取页面 → 构建 Prompt → 调用 AI → 解析校验（含自动修复重叠）→ 差异预览
 * → 应用（回画布继续编辑 / 直接生成成品网页 / 像素布局导出 HTML·Vue）。
 */

import { reactive, computed } from 'vue'
import { editorState, useEditor } from './editor.js'
import {
  loadAiSettings,
  saveAiSettings,
  validateAiSettings,
  parseKeyFile,
  getProviderPreset,
  AI_PROVIDERS
} from '../utils/aiSettings.js'
import { chatCompletion, testConnection, AiRequestError } from '../services/aiService.js'
import {
  buildGenerateMessages,
  buildSiteMessages,
  buildFinalHtmlMessages,
  extractHtmlCode,
  AI_MODES,
  AI_MODE_LABELS,
  GENERATE_SCOPES,
  GENERATE_SCOPE_LABELS,
  GENERATE_SCOPE_HINTS,
  PAGE_STYLE_OPTIONS
} from '../utils/aiPromptBuilder.js'
import { parseAiPageResponse, parseAiSiteResponse } from '../utils/aiResponseParser.js'
import { getPageContract, getSiteContract } from '../utils/componentSchema.js'
import { generatePageHTML, downloadHTML, exportVue } from '../utils/htmlGenerator.js'

/**
 * 结果输出模式
 */
export const OUTPUT_MODES = {
  CANVAS: 'canvas',       // 回到画布继续编辑（绝对坐标 + 自动修复重叠）
  FINAL_HTML: 'final',    // 直接生成成品网页（AI 写语义化 HTML/CSS，流式布局、可响应式）
  HTML: 'html',           // 由画布结构按像素位置导出 HTML（复用现有生成器）
  VUE: 'vue'              // 由画布结构按像素位置导出 Vue 工程
}

export const OUTPUT_MODE_LABELS = {
  [OUTPUT_MODES.CANVAS]: '回到画布继续编辑',
  [OUTPUT_MODES.FINAL_HTML]: '直接生成成品网页（AI 写 HTML/CSS）',
  [OUTPUT_MODES.HTML]: '按画布像素布局导出 HTML',
  [OUTPUT_MODES.VUE]: '按画布像素布局导出 Vue 工程'
}

export const OUTPUT_MODE_HINTS = {
  [OUTPUT_MODES.CANVAS]: 'AI 在画布坐标系内补全页面（左/上为绝对像素），应用后可继续拖拽微调，可 Ctrl+Z 撤销',
  [OUTPUT_MODES.FINAL_HTML]: 'AI 把你的画布当成需求草图，重新输出一份语义化、流式布局、可响应式的完整网页代码（推荐交付使用）',
  [OUTPUT_MODES.HTML]: '把画布上的绝对像素位置原样翻译成 HTML，适合快速还原你摆放的效果',
  [OUTPUT_MODES.VUE]: '把画布上的绝对像素位置原样翻译成 Vue 单文件/工程'
}

// AI 面板状态
const state = reactive({
  // 面板开关
  panelOpen: false,

  // 服务配置
  settings: loadAiSettings(),

  // API Key 来源：'none' 未设置 | 'input' 手动输入 | 'file' 文本文件加载
  // 安全策略：Key 只保存在会话内存中，永不写入 localStorage
  apiKeySource: 'none',
  apiKeyFile: '',

  // 生成选项
  instruction: '',                 // 用户补充说明
  mode: AI_MODES.COMPLETE,         // 生成模式
  scope: GENERATE_SCOPES.PAGE,     // 生成范围：单页 / 整站多页
  sitePageCount: 4,                // 整站生成的期望页面数（提示 AI 用）
  replaceCanvas: false,            // 整站生成时是否替换当前画布已有页面
  styleKey: 'modern',              // 视觉风格
  pageType: '',                    // 页面类型描述
  outputMode: OUTPUT_MODES.CANVAS, // 输出模式

  // 运行状态
  generating: false,
  testing: false,
  error: null,                     // 生成/测试错误信息

  // 生成结果
  result: null,                    // { page, mode, createdAt }
  siteResult: null,                // { site: { name, pages }, stats, pagesRepair, createdAt }
  applied: false,                  // 是否已应用/导出
  resultMessage: '',               // 应用/导出后的提示

  // 布局修复信息（AI 结果自动修复重叠后的统计）
  repairInfo: null,                // { movedBlocks, movedChildren, grownContainers, heightExtended, overlapsBefore, overlapsAfter }

  // 成品网页代码（OUTPUT_MODES.FINAL_HTML 模式）
  finalHtml: ''
})

// 面板开关
function openPanel() {
  state.panelOpen = true
  state.error = null
}
function closePanel() {
  state.panelOpen = false
}

// 更新生成选项
function updateInstruction(value) {
  state.instruction = value
}
function updateMode(mode) {
  state.mode = mode
  resetResult()
}
function updateStyleKey(key) {
  state.styleKey = key
}
function updatePageType(value) {
  state.pageType = value
}
function updateOutputMode(mode) {
  state.outputMode = mode
}
// 切换生成范围（单页 / 整站多页）
function updateScope(scope) {
  state.scope = scope
  resetResult()
}
function updateSitePageCount(count) {
  const n = parseInt(count, 10)
  state.sitePageCount = Number.isFinite(n) ? Math.max(1, Math.min(12, n)) : 4
}
function updateReplaceCanvas(value) {
  state.replaceCanvas = !!value
}

// 清空生成结果（选项变化后要求重新生成）
function resetResult() {
  state.result = null
  state.siteResult = null
  state.applied = false
  state.resultMessage = ''
  state.error = null
  state.repairInfo = null
  state.finalHtml = ''
}

// 更新设置（持久化，API Key 会被 saveAiSettings 剥离，不会落盘）
function updateSettings(patch) {
  state.settings = { ...state.settings, ...patch }
  saveAiSettings(state.settings)
}

/**
 * 从本地文本文件加载 API Key（仅保存在内存，刷新后失效）
 * @param {File|{name: string, text: () => Promise<string>}} file
 * @returns {Promise<{ok: boolean, message: string}>}
 */
async function loadApiKeyFromFile(file) {
  if (!file) return { ok: false, message: '未选择文件' }
  try {
    const text = typeof file.text === 'function' ? await file.text() : String(file)
    const parsed = parseKeyFile(text)
    if (!parsed) {
      state.error = `未在「${file.name}」中找到 API Key。支持格式：单独一行 sk-xxx，或 KEY=sk-xxx，可含 # 注释行`
      return { ok: false, message: state.error }
    }
    state.settings = { ...state.settings, apiKey: parsed.key }
    state.apiKeySource = 'file'
    state.apiKeyFile = file.name
    state.error = null
    return { ok: true, message: `已从 ${file.name}（第 ${parsed.line} 行）加载 API Key，仅本次会话有效` }
  } catch (error) {
    state.error = `读取 Key 文件失败：${error?.message || '未知错误'}`
    return { ok: false, message: state.error }
  }
}

// 手动输入 Key（仅内存，不持久化）
function setApiKeyManually(key) {
  const cleaned = String(key || '').trim()
  state.settings = { ...state.settings, apiKey: cleaned }
  state.apiKeySource = cleaned ? 'input' : 'none'
  if (!cleaned) state.apiKeyFile = ''
}

// 清除当前 Key（内存与文件关联均清空）
function clearApiKey() {
  state.settings = { ...state.settings, apiKey: '' }
  state.apiKeySource = 'none'
  state.apiKeyFile = ''
  state.error = null
}

// 切换 Provider，自动填入默认地址与模型
function selectProvider(providerId) {
  const preset = getProviderPreset(providerId)
  if (!preset) return
  updateSettings({
    provider: preset.id,
    baseUrl: preset.baseUrl,
    model: preset.defaultModel
  })
}

// 测试连接
async function testConnectionAction() {
  const check = validateAiSettings(state.settings)
  if (!check.ok) {
    state.error = check.message
    return false
  }
  state.testing = true
  state.error = null
  try {
    const result = await testConnection(state.settings)
    if (!result.ok) state.error = result.message
    else state.error = null
    return result.ok
  } finally {
    state.testing = false
  }
}

// 执行生成
async function generate() {
  const check = validateAiSettings(state.settings)
  if (!check.ok) {
    state.error = check.message
    return
  }
  if (state.generating) return

  state.generating = true
  state.error = null
  state.result = null
  state.applied = false
  state.resultMessage = ''

  try {
    // 1. 页面契约 + 站点契约
    // 站点契约让 AI 知道"本站有哪些页面"，从而在导航栏/页脚里写出正确的跨页链接
    const pageContract = getPageContract(editorState.page)
    const { activeCanvas, activePageId } = useEditor()
    const siteContract = getSiteContract(activeCanvas.value, activePageId.value)

    // 2. 构建 Prompt
    const { system, user } = buildGenerateMessages({
      pageContract,
      siteContract,
      instruction: state.instruction,
      mode: state.mode,
      styleKey: state.styleKey,
      pageType: state.pageType
    })

    // 3. 调用 AI
    const content = await chatCompletion({
      baseUrl: state.settings.baseUrl,
      apiKey: state.settings.apiKey,
      model: state.settings.model,
      temperature: state.settings.temperature ?? 0.7,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ]
    })

    // 4. 解析并校验（内部会自动修复 AI 造成的组件重叠）
    // 注意：这里**不**传入当前页面尺寸作为裁剪边界。否则 AI 写出的高页面会被压扁到
    // 当前页高度（如 800px）以内，产生大量本可避免的重叠，再由修复逻辑强行摊开；
    // 使用默认边界（3840 × 8000）能保留 AI 原本推算好的坐标，修复量显著更小
    const parsed = parseAiPageResponse(content)

    if (!parsed.success) {
      state.error = (parsed.errors || []).join('；')
      return
    }

    // 5. 记录布局修复统计，供预览提示
    state.repairInfo = parsed.overlapsBefore > 0
      ? {
          ...(parsed.repair || {}),
          overlapsBefore: parsed.overlapsBefore,
          overlapsAfter: parsed.overlapsAfter
        }
      : null

    // 6. 记录结果供差异预览
    state.result = {
      page: parsed.page,
      mode: state.mode,
      createdAt: Date.now()
    }
  } catch (error) {
    if (error instanceof AiRequestError) {
      state.error = error.message
    } else {
      state.error = error?.message || '生成失败，请重试'
    }
  } finally {
    state.generating = false
  }
}

/**
 * 生成整个站点（多页面）
 *
 * 与 generate() 的区别：一次让 AI 输出**多个页面**的画布数据
 * （JSON 顶层为 { siteName, pages: [...] }）。应用时在当前画布创建这些页面，
 * 并把以页面名书写的跨页链接（`#page:关于我们`）解析为真实页面 id。
 */
async function generateSite() {
  const check = validateAiSettings(state.settings)
  if (!check.ok) {
    state.error = check.message
    return
  }
  if (state.generating) return

  state.generating = true
  state.error = null
  state.siteResult = null
  state.result = null
  state.applied = false
  state.resultMessage = ''
  state.repairInfo = null
  state.finalHtml = ''

  try {
    const { activeCanvas, activePageId } = useEditor()
    const siteContract = getSiteContract(activeCanvas.value, activePageId.value)

    const { system, user } = buildSiteMessages({
      siteContract,
      instruction: state.instruction,
      styleKey: state.styleKey,
      pageType: state.pageType,
      pageCount: state.sitePageCount
    })

    const content = await chatCompletion({
      baseUrl: state.settings.baseUrl,
      apiKey: state.settings.apiKey,
      model: state.settings.model,
      temperature: state.settings.temperature ?? 0.7,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ]
    })

    const parsed = parseAiSiteResponse(content, { maxPages: 12 })
    if (!parsed.success) {
      state.error = (parsed.errors || []).join('；')
      return
    }

    state.siteResult = {
      site: parsed.site,
      stats: parsed.stats,
      pagesRepair: parsed.pagesRepair,
      warnings: parsed.errors || [],
      createdAt: Date.now()
    }

    state.repairInfo = parsed.stats.overlapsBefore > 0
      ? {
          overlapsBefore: parsed.stats.overlapsBefore,
          overlapsAfter: parsed.stats.overlapsAfter
        }
      : null
  } catch (error) {
    if (error instanceof AiRequestError) {
      state.error = error.message
    } else {
      state.error = error?.message || '生成失败，请重试'
    }
  } finally {
    state.generating = false
  }
}

/**
 * 生成成品网页：让 AI 基于画布草图重新写一份语义化、流式布局、可响应式的完整 HTML
 * 与 generate() 的区别：不产出画布 JSON，不做坐标修复，而是直接得到可交付的前端页面代码
 */
async function generateFinalHtml() {
  const check = validateAiSettings(state.settings)
  if (!check.ok) {
    state.error = check.message
    return
  }
  if (state.generating) return

  state.generating = true
  state.error = null
  state.finalHtml = ''
  state.applied = false
  state.resultMessage = ''
  state.repairInfo = null

  try {
    const pageContract = getPageContract(editorState.page)
    const { system, user } = buildFinalHtmlMessages({
      pageContract,
      instruction: state.instruction,
      styleKey: state.styleKey,
      pageType: state.pageType
    })

    const content = await chatCompletion({
      baseUrl: state.settings.baseUrl,
      apiKey: state.settings.apiKey,
      model: state.settings.model,
      temperature: state.settings.temperature ?? 0.7,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ],
      jsonMode: false,
      timeout: 180000
    })

    const html = extractHtmlCode(content)
    if (!html) {
      state.error = 'AI 没有返回可用的 HTML 代码，请重试或更换模型'
      return
    }

    state.finalHtml = html
    // 同时保留一份页面数据，便于在画布模式下预览结构
    state.result = {
      page: {
        ...pageContract,
        name: pageContract.name || 'AI 成品网页'
      },
      mode: 'final-html',
      createdAt: Date.now()
    }
  } catch (error) {
    state.error = error instanceof AiRequestError ? error.message : (error?.message || '生成失败，请重试')
  } finally {
    state.generating = false
  }
}

// 差异统计（用于预览）
const resultStats = computed(() => {
  if (!state.result) return null
  const aiComponents = state.result.page.components || []
  const currentComponents = editorState.page.components || []
  const currentIds = new Set(currentComponents.map(c => c.id))
  const aiIds = new Set(aiComponents.map(c => c.id))

  const kept = aiComponents.filter(c => currentIds.has(c.id))
  const added = aiComponents.filter(c => !currentIds.has(c.id))
  const removed = currentComponents.filter(c => !aiIds.has(c.id))

  const byType = {}
  aiComponents.forEach(c => {
    byType[c.type] = (byType[c.type] || 0) + 1
  })

  return {
    total: aiComponents.length,
    currentTotal: currentComponents.length,
    kept: kept.length,
    added: added.length,
    removed: removed.length,
    byType
  }
})

// 应用 / 导出结果
async function applyResult() {
  if (state.applied) return

  // 模式零：成品网页（AI 已直接写好 HTML，直接下载）
  if (state.outputMode === OUTPUT_MODES.FINAL_HTML) {
    if (!state.finalHtml) {
      state.error = '还没有生成成品网页代码，请先点击"开始 AI 生成"'
      return
    }
    state.applied = true
    try {
      downloadHTML(state.finalHtml, 'index.html')
      state.resultMessage = '✅ 成品网页已生成并下载（index.html，语义化流式布局，可直接部署）'
    } catch (error) {
      state.applied = false
      state.error = `下载失败：${error.message}`
    }
    return
  }

  if (!state.result && !state.siteResult) return
  const r = state.result
  state.applied = true

  // 模式：整站多页 → 在当前画布创建页面，并把跨页链接串联起来
  if (state.siteResult) {
    try {
      const { applySitePages } = useEditor()
      const applied = applySitePages(state.siteResult.site.pages, { replace: state.replaceCanvas })
      if (!applied) {
        state.applied = false
        state.error = '应用失败：没有可用的页面数据'
        return
      }

      const { total, unresolved } = applied.linkStats
      const linkText = total > 0
        ? `，已串联 ${total - unresolved} 个页面跳转链接${unresolved > 0 ? `（${unresolved} 个未找到目标页面）` : ''}`
        : ''

      state.resultMessage = applied.replaced
        ? `✅ 已用 ${applied.created} 个页面替换当前画布内容${linkText}`
        : `✅ 已创建 ${applied.created} 个页面：${applied.pageNames.join('、')}${linkText}`
    } catch (error) {
      state.applied = false
      state.error = `应用失败：${error.message}`
    }
    return
  }

  // 模式一：按画布像素布局导出 HTML
  if (state.outputMode === OUTPUT_MODES.HTML) {
    try {
      const html = generatePageHTML(r.page)
      downloadHTML(html, `${r.page.name || 'ai-page'}.html`)
      state.resultMessage = '✅ 完整 HTML 已生成并下载'
    } catch (error) {
      state.applied = false
      state.error = `HTML 生成失败：${error.message}`
    }
    return
  }

  // 模式二：按画布像素布局导出 Vue 工程
  if (state.outputMode === OUTPUT_MODES.VUE) {
    try {
      await exportVue(r.page)
      state.resultMessage = '✅ Vue 工程已生成并下载'
    } catch (error) {
      state.applied = false
      state.error = `Vue 生成失败：${error.message}`
    }
    return
  }

  // 模式三：回到画布继续编辑
  try {
    const { applyPageTemplate, applyComponents } = useEditor()
    if (r.mode === AI_MODES.APPEND) {
      // 追加模式：只添加 AI 新增的组件，避免重复
      const existingIds = new Set((editorState.page.components || []).map(c => c.id))
      const toAdd = (r.page.components || []).filter(c => !existingIds.has(c.id))
      const count = applyComponents(toAdd, { replace: false })
      state.resultMessage = `✅ 已追加 ${count} 个新组件到画布，可继续编辑（Ctrl+Z 可撤销）`
    } else {
      applyPageTemplate(r.page)
      state.resultMessage = '✅ 已应用到画布，可继续编辑（Ctrl+Z 可撤销）'
    }
  } catch (error) {
    state.applied = false
    state.error = `应用失败：${error.message}`
  }
}

// 复制 AI 原始 JSON（调试/复用）
function copyResultJSON() {
  if (!state.result) return false
  const text = JSON.stringify(state.result.page, null, 2)
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).catch(() => {})
  }
  return true
}

// 复制成品网页代码
function copyFinalHtml() {
  if (!state.finalHtml) return false
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(state.finalHtml).catch(() => {})
  }
  return true
}

/**
 * 生成入口：按输出模式与生成范围自动选择链路
 * - FINAL_HTML：走"成品网页"链路（AI 写语义化 HTML/CSS）
 * - scope=site：走"整站多页"链路（AI 一次生成多个页面）
 * - 其他：走"画布数据"链路（绝对坐标 + 自动修复重叠）
 */
async function runGenerate() {
  if (state.outputMode === OUTPUT_MODES.FINAL_HTML) {
    return generateFinalHtml()
  }
  if (state.scope === GENERATE_SCOPES.SITE) {
    return generateSite()
  }
  return generate()
}

// 组合式 API 导出
export function useAi() {
  return {
    // 状态
    panelOpen: computed(() => state.panelOpen),
    settings: computed(() => state.settings),
    apiKeySource: computed(() => state.apiKeySource),
    apiKeyFile: computed(() => state.apiKeyFile),
    instruction: computed(() => state.instruction),
    mode: computed(() => state.mode),
    scope: computed(() => state.scope),
    sitePageCount: computed(() => state.sitePageCount),
    replaceCanvas: computed(() => state.replaceCanvas),
    siteResult: computed(() => state.siteResult),
    styleKey: computed(() => state.styleKey),
    pageType: computed(() => state.pageType),
    outputMode: computed(() => state.outputMode),
    generating: computed(() => state.generating),
    testing: computed(() => state.testing),
    error: computed(() => state.error),
    result: computed(() => state.result),
    resultStats,
    applied: computed(() => state.applied),
    resultMessage: computed(() => state.resultMessage),
    repairInfo: computed(() => state.repairInfo),
    finalHtml: computed(() => state.finalHtml),

    // 常量
    AI_PROVIDERS,
    AI_MODES,
    AI_MODE_LABELS,
    GENERATE_SCOPES,
    GENERATE_SCOPE_LABELS,
    GENERATE_SCOPE_HINTS,
    PAGE_STYLE_OPTIONS,
    OUTPUT_MODES,
    OUTPUT_MODE_LABELS,
    OUTPUT_MODE_HINTS,

    // 方法
    openPanel,
    closePanel,
    updateSettings,
    selectProvider,
    loadApiKeyFromFile,
    setApiKeyManually,
    clearApiKey,
    updateInstruction,
    updateMode,
    updateScope,
    updateSitePageCount,
    updateReplaceCanvas,
    updateStyleKey,
    updatePageType,
    updateOutputMode,
    testConnection: testConnectionAction,
    generate: runGenerate,
    applyResult,
    copyResultJSON,
    copyFinalHtml
  }
}

export { state as aiState }