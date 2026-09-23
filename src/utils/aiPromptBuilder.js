/**
 * @file AI Prompt 构建器
 * @description 将"当前页面数据 + 用户意图"组装为发给 LLM 的指令。
 * 依赖 componentSchema 的 Schema 描述，保证模型输出与编辑器 JSON 契约一致。
 */

import { getSchemaForPrompt } from './componentSchema.js'

/**
 * AI 生成模式
 */
export const AI_MODES = {
  COMPLETE: 'complete',   // 补全当前页面：保留用户已有布局，AI 完善整体设计
  REWRITE: 'rewrite',     // 根据当前页面意图，重新生成完整页面
  APPEND: 'append'        // 在现有页面追加新的内容区块
}

export const AI_MODE_LABELS = {
  [AI_MODES.COMPLETE]: '补全当前页面（保留我的布局）',
  [AI_MODES.REWRITE]: '整体重写页面',
  [AI_MODES.APPEND]: '追加新区块'
}

// 常见页面风格选项
export const PAGE_STYLE_OPTIONS = [
  { key: 'modern', label: '现代简约', desc: '大量留白、简洁线条' },
  { key: 'tech', label: '科技感', desc: '深色/渐变、发光点缀' },
  { key: 'business', label: '商务专业', desc: '稳重配色、清晰层级' },
  { key: 'playful', label: '活泼创意', desc: '明快色彩、圆润造型' },
  { key: 'elegant', label: '优雅高级', desc: '低饱和配色、衬线点缀' },
  { key: 'fresh', label: '清新自然', desc: '浅色系、柔和过渡' }
]

/**
 * 构建生成页面的消息
 * @param {Object} options
 * @param {Object} options.pageContract - getPageContract(page) 的结果（当前页面）
 * @param {string} options.instruction - 用户补充说明（期望的页面用途/内容）
 * @param {string} [options.mode=complete]
 * @param {string} [options.styleKey] - PAGE_STYLE_OPTIONS 里的 key
 * @param {string} [options.pageType] - 页面类型描述，如"企业官网首页"
 * @returns {{system: string, user: string}}
 */
export function buildGenerateMessages({
  pageContract,
  instruction,
  mode = AI_MODES.COMPLETE,
  styleKey,
  pageType
}) {
  const system = [
    '你是一名资深的网页设计师与前端工程师，擅长把用户的粗略布局打磨成专业的完整网页。',
    '你的任务：接收"编辑器的当前页面数据"和"用户要求"，输出**修改后的完整页面数据**。',
    '',
    '## 画布坐标模型（必须严格遵守，否则所有组件会叠成一团）',
    '编辑器是「绝对定位画布」：每个组件的 left/top 是它相对页面左上角的**绝对像素坐标**，不是文档流。',
    '系统**不会**自动排布，写出相同的 top 就会**精确重叠**。因此：',
    '1. 同一列中上下相邻的组件，后一个的 top 必须 ≥ 前一个的 top + 前一个的 height（建议再加 16~32px 间距）。',
    '2. **禁止**为了省事给多个组件写同一个 top，所有组件的 top 都要逐个推算。',
    '3. 先在脑中按区块累加：区块1 从 y=0 开始，高度 h1；区块2 的 top = h1 + 间距；依此类推。',
    '4. 并排（同一行）的组件可以共享同一个 top，但它们的 left 区间**不能相交**。',
    '5. 页面 height 必须大于所有组件 (top + height) 的最大值，建议再多留 40px。',
    '',
    '### 坐标推算示例（务必照此方式思考）',
    '  导航栏:   top=0,   height=72  → 下边界 72',
    '  主标题:   top=112, height=58  → 下边界 170',
    '  副标题:   top=186, height=76  → 下边界 262',
    '  按钮行:   top=300, height=48  → 下边界 348',
    '  分隔线:   top=396, height=2   → 下边界 398',
    '  第一行卡片: top=450, height=380 → 下边界 830',
    '  第二行卡片: top=880, height=380 → 下边界 1260（= 上一行下边界 + 50 间距）',
    '  页脚:     top=1320, height=200 → 下边界 1520（页面 height 至少 1560）',
    '',
    '### 容器与子元素',
    '- container 是背景方块，其内部的图片/文字要落在它的矩形范围内（left/top 在容器内）。',
    '- 容器内的多个子元素同样不能互相重叠：例如卡片内「分类 top=860、标题 top=890、简介 top=925、链接 top=1000」逐行累加。',
    '- 容器高度要能装下子元素，子元素最下边界之外再留 8~16px。',
    '',
    '## 输出要求（非常重要）',
    '1. 只输出一个 JSON 对象，不要输出任何解释、注释或 Markdown 代码块标记。',
    '2. JSON 顶层包含：name, width, height, backgroundColor, backgroundType, backgroundGradientStart, backgroundGradientEnd, backgroundGradientAngle, backgroundImage, backgroundImageSize, backgroundImagePosition, backgroundImageRepeat, components。',
    '3. components 是组件数组，每个组件包含：id, type, name, left, top, width, height, zIndex, style, props。',
    `4. 已存在的组件（带有 id）尽量保留其 id、相对布局与用户设置的内容；新补充的组件 id 用 "new-1"、"new-2" 这类字符串。`,
    '5. 必须遵守下面的 Schema 白名单，禁止使用白名单之外的类型、style 键、props 键。',
    '6. 字段归属要正确：textAlign 属于 props（文本/按钮/链接组件）；zIndex 只能是 1~5 的整数（container 用 1，普通内容用 2~3，浮层最多 4~5）。',
    '7. 坐标与尺寸一律用**数字**（不要写 "6px" 这类字符串）；只有 style.borderRadius 允许带单位（如 "10px" 或 "50%"）。',
    '8. 页面必须有完整的结构：导航、主体内容、页脚等；不要让页面看起来空荡。',
    '9. 文本内容用中文书写，专业、贴合页面用途；图片使用 https:// 开头的公开占位图 URL（如 https://picsum.photos/seed/xxx/800/400）。',
    '',
    '## 组件 Schema（唯一合法依据）',
    getSchemaForPrompt()
  ].join('\n')

  const modeInstruction = {
    [AI_MODES.COMPLETE]: '模式：补全当前页面。保留用户已有组件的布局和内容，在其基础上补齐缺失的区块（如页脚、导航、内容区），完善整体设计，使其成为完整的专业网页。',
    [AI_MODES.REWRITE]: '模式：整体重写页面。以用户当前页面的主题意图为基础，重新构思并输出一套完整的页面布局（可以丢弃原有组件的具体位置，但尽量参考其内容主题）。',
    [AI_MODES.APPEND]: '模式：追加新区块。保留现有全部组件不动，在其下方追加 2~4 个与页面主题相符的新内容区块，追加的组件坐标放在当前内容之后。'
  }[mode]

  const styleHint = PAGE_STYLE_OPTIONS.find(s => s.key === styleKey)
    ? `整体视觉风格：${PAGE_STYLE_OPTIONS.find(s => s.key === styleKey)?.label}（${PAGE_STYLE_OPTIONS.find(s => s.key === styleKey)?.desc}）。`
    : ''

  const pageTypeHint = pageType ? `页面类型：${pageType}。` : ''

  const user = [
    `${pageTypeHint}${styleHint}`,
    modeInstruction,
    '',
    '## 用户补充要求',
    instruction || '（无特别要求，按照当前页面内容合理完善即可）',
    '',
    '## 当前页面数据（JSON）',
    JSON.stringify(pageContract)
  ].join('\n')

  return { system, user }
}

/**
 * 构建"直接生成成品网页"的消息（AI 直接写语义化 HTML/CSS）
 *
 * 说明：编辑器画布用绝对坐标只是**可视化草图**，不适合作为交付代码。
 * 此模式让 AI 以画布上的内容与结构为需求来源，重新输出一份**真实的前端页面**：
 * 语义化标签 + 正常文档流 + flex/grid 布局 + 响应式，而不是把绝对坐标翻译成 CSS。
 *
 * @param {Object} options
 * @param {Object} options.pageContract - 当前页面数据（作为内容与结构的需求来源）
 * @param {string} [options.instruction] - 用户补充要求
 * @param {string} [options.styleKey] - 视觉风格
 * @param {string} [options.pageType] - 页面类型
 * @param {boolean} [options.returnFragment=false] - 是否只要 body 片段（不要 <!DOCTYPE html>）
 * @returns {{system: string, user: string}}
 */
export function buildFinalHtmlMessages({
  pageContract,
  instruction,
  styleKey,
  pageType,
  returnFragment = false
}) {
  const styleOption = PAGE_STYLE_OPTIONS.find(s => s.key === styleKey)
  const styleHint = styleOption ? `${styleOption.label}（${styleOption.desc}）` : '现代简约'
  const pageTypeHint = pageType || pageContract?.name || '通用网页'

  const system = [
    '你是一名资深前端工程师与网页设计师。',
    '',
    '## 你的任务',
    '下面会给你一份「可视化编辑器的画布数据」。它只是用户的**布局草图**，其中的 left/top 是画布上的绝对坐标。',
    '请你**不要**翻译这些坐标，而是把它当作需求说明，重新设计并输出一份**可以直接上线的完整前端网页**。',
    '',
    '## 必须遵守的输出形态',
    '1. 输出**一个完整的 HTML 文档**（含 <!DOCTYPE html>、<html lang="zh-CN">、<head>、<body>）。',
    '2. 样式写在 <head> 里的 <style> 标签中，使用**正常文档流**布局（flex / grid），',
    '   **严禁使用 position:absolute 去复刻画布坐标**，也不要给元素写死 left/top。',
    '3. 使用语义化标签：<header> <nav> <main> <section> <article> <aside> <footer> <h1>~<h3> 等。',
    '4. 必须**响应式**：至少包含桌面与移动端两档（@media (max-width: 768px)），容器用 max-width + margin auto 居中。',
    '5. 使用 CSS 变量定义主题色、间距等；按钮、卡片要有 hover 过渡；卡片列表用 grid 自适应（如 repeat(auto-fit, minmax(280px, 1fr))）。',
    '6. 图片用 https:// 开头的公开占位图（如 https://picsum.photos/seed/xxx/800/400），并带 alt 属性。',
    '7. 需要交互的地方用少量原生 JS（如移动端菜单展开、平滑滚动），写在 </body> 前的 <script> 中。',
    '8. 文字内容按画布上的文案整理成通顺的正式文案，风格：' + styleHint + '。',
    '9. 只输出 HTML 代码本身，不要输出解释文字，也不要使用 Markdown 代码块标记。',
    '',
    '## 内容来源',
    '画布中每个组件的内容都要在成品页面中体现（文字、图片、按钮、链接、表单等），',
    '但**排列方式由你按网页设计规范重做**：同类卡片自动成组、导航固定为顶部导航、页脚整理为多列信息等。'
  ].join('\n')

  const user = [
    `页面类型：${pageTypeHint}`,
    `视觉风格：${styleHint}`,
    '',
    '## 用户补充要求',
    instruction || '（无特别要求，按画布内容整理成一个专业的完整网页）',
    '',
    '## 画布草图数据（含绝对坐标，仅作内容与结构参考，不要照搬坐标）',
    JSON.stringify(pageContract)
  ].join('\n')

  return { system, user }
}

/**
 * 从模型回复中提取 HTML 代码（剥离 ```html 代码块与前后杂文）
 * @param {string} text
 * @returns {string} HTML 代码；无法识别时返回空字符串
 */
export function extractHtmlCode(text) {
  if (typeof text !== 'string') return ''
  let str = text.trim()

  const fence = str.match(/```(?:html)?\s*([\s\S]*?)```/i)
  if (fence) {
    str = fence[1].trim()
  }

  const doctypeIndex = str.search(/<!DOCTYPE html>/i)
  if (doctypeIndex > -1) {
    return str.slice(doctypeIndex).trim()
  }

  const htmlIndex = str.search(/<html[\s>]/i)
  if (htmlIndex > -1) {
    return str.slice(htmlIndex).trim()
  }

  // 没有完整文档结构时，若含常见标签则视为片段，交给调用方包裹
  if (/<(body|div|main|section|header|nav)[\s>]/i.test(str)) {
    return str
  }

  return ''
}

export default {
  AI_MODES,
  AI_MODE_LABELS,
  PAGE_STYLE_OPTIONS,
  buildGenerateMessages,
  buildFinalHtmlMessages,
  extractHtmlCode
}