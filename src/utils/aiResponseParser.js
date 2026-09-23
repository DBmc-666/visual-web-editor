/**
 * @file AI 响应解析器
 * @description 将 LLM 返回的文本容错解析为编辑器页面 JSON：
 * - 剥离 ```json ``` Markdown 代码块与前后杂文
 * - 提取 JSON 对象
 * - 经 componentSchema.sanitizePageData 校验清洗（白名单过滤、类型纠正、越界裁剪）
 * - 经 layoutRepair.repairLayout 自动修复组件重叠（AI 常把绝对定位画布当文档流写，导致堆叠）
 */

import { sanitizePageData } from './componentSchema.js'
import { repairLayout, countOverlaps } from './layoutRepair.js'

/**
 * 从 LLM 回复文本中提取 JSON 对象字符串
 * @param {string} text
 * @returns {{raw: string, error?: string}}
 */
export function extractJSONObject(text) {
  if (typeof text !== 'string') {
    return { raw: '', error: 'AI 返回内容不是文本' }
  }

  let str = text.trim()

  // 剥离 ```json ... ``` / ``` ... ``` 代码块
  const fenceMatch = str.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenceMatch) {
    str = fenceMatch[1].trim()
  }

  // 找到第一个 { 和与之配对的最后一个 }，之间即对象主体
  const firstBrace = str.indexOf('{')
  const lastBrace = str.lastIndexOf('}')
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return { raw: '', error: '回复中没有找到 JSON 对象，请检查 API Key / 模型是否返回了有效内容' }
  }

  return { raw: str.slice(firstBrace, lastBrace + 1) }
}

/**
 * 解析 AI 响应并校验为页面数据
 * @param {string} text - LLM 原始回复
 * @param {Object} [options] - 传给 sanitizePageData 的边界选项，如 { maxWidth: page.width, maxHeight: page.height }
 * @param {boolean} [options.repair=true] - 是否自动修复组件重叠
 * @returns {{success: boolean, page?: Object, raw?: string, errors?: string[], repair?: Object, overlapsBefore?: number, overlapsAfter?: number}}
 */
export function parseAiPageResponse(text, options = {}) {
  const { repair = true, ...sanitizeOptions } = options
  const { raw, error } = extractJSONObject(text)
  if (error) return { success: false, errors: [error], raw: text }

  let data
  try {
    data = JSON.parse(raw)
  } catch (e) {
    // JSON.parse 失败时尝试修复常见问题：结尾逗号、单引号等情况由模型修复；这里给出明确报错
    return { success: false, errors: [`JSON 解析失败：${e.message}。建议更换更稳定的模型或稍后重试`], raw: text }
  }

  const result = sanitizePageData(data, sanitizeOptions)
  if (!result.success) {
    return { success: false, errors: result.errors, raw: text }
  }

  // 校验：组件不能为空，否则视为失败
  if (result.page.components.length === 0) {
    return { success: false, errors: ['AI 结果中没有可用组件，请重试'], raw: text }
  }

  // 自动修复重叠：AI 常把绝对定位画布误当文档流，导致多个组件共用同一个 top
  let repairReport = null
  let overlapsBefore = 0
  let overlapsAfter = 0
  if (repair) {
    overlapsBefore = countOverlaps(result.page)
    if (overlapsBefore > 0) {
      repairReport = repairLayout(result.page)
      overlapsAfter = countOverlaps(result.page)
    }
  }

  return {
    success: true,
    page: result.page,
    raw,
    errors: result.errors || [],
    repair: repairReport,
    overlapsBefore,
    overlapsAfter
  }
}

export default { extractJSONObject, parseAiPageResponse }