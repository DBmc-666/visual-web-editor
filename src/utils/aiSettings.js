/**
 * @file AI 设置存储模块
 * @description 管理 AI 服务接入配置（Provider、API Key、模型等），持久化到 localStorage。
 * 注意：API Key 只保存在内存（会话级），不会写入 localStorage；生产环境建议后端代理转发。
 */

const AI_SETTINGS_KEY = 'visual-web-editor:ai-settings:v1'

/**
 * 内置 Provider 预设（均为 OpenAI 兼容 /chat/completions 接口）
 * 目前仅保留两家：DeepSeek 官方、OpenCode Go
 */
export const AI_PROVIDERS = [
  {
    id: 'deepseek',
    name: 'DeepSeek 官方',
    baseUrl: 'https://api.deepseek.com/v1',
    // 本地代理路径（与 vite.config.js 的 AI_PROXY_TARGETS 保持一致），用于绕过浏览器 CORS
    proxyPath: '/api-proxy/deepseek/v1',
    // 默认使用 DeepSeek V4.1：官方 API 中 V4.1 Flash 的模型 ID 为 deepseek-flash
    defaultModel: 'deepseek-flash',
    models: ['deepseek-flash', 'deepseek-v4-pro'],
    keyRequired: true,
    hint: 'DeepSeek V4.1 Flash 模型 ID：deepseek-flash；前往 https://platform.deepseek.com 获取 API Key。本地运行时自动经 Vite 代理转发，无需担心跨域'
  },
  {
    id: 'opencode-go',
    name: 'OpenCode Go',
    baseUrl: 'https://opencode.ai/zen/go/v1',
    proxyPath: '/api-proxy/opencode-go/v1',
    // OpenCode Go 订阅下 DeepSeek V4.1 Flash 的模型 ID
    defaultModel: 'deepseek-v4.1-flash',
    models: [
      'deepseek-v4.1-flash',
      'deepseek-v4-pro',
      'glm-5.3-flash',
      'kimi-k3',
      'grok-4.7',
      'qwen3.8-flash'
    ],
    keyRequired: true,
    hint: 'OpenCode Go 是每月 $10 的低成本订阅服务，前往 https://opencode.ai/auth 订阅并复制 API Key。该接口不允许浏览器直连（CORS），本地运行时自动经 Vite 代理转发；模型列表见 https://opencode.ai/docs/zh-cn/go/'
  }
]

/**
 * 是否运行在本地开发/预览服务器上（此时 Vite 代理可用）
 * @returns {boolean}
 */
export function isLocalDevHost() {
  if (typeof location === 'undefined') return false
  const host = location.hostname
  return host === 'localhost' || host === '127.0.0.1' || host === '::1' || host === '[::1]'
}

/**
 * 解析实际请求地址
 * 本地运行时把已知服务商的真实地址替换为同源代理路径，避免浏览器 CORS 拦截；
 * 非本地环境或自定义地址则原样返回。
 * @param {string} baseUrl - 设置里的 API 地址
 * @returns {string} 实际应请求的地址
 */
export function resolveBaseUrl(baseUrl) {
  if (!baseUrl) return baseUrl
  const normalized = String(baseUrl).replace(/\/+$/, '')
  if (!isLocalDevHost()) return normalized
  const provider = AI_PROVIDERS.find(p => String(p.baseUrl).replace(/\/+$/, '') === normalized)
  return provider?.proxyPath || normalized
}

// 默认设置
export const DEFAULT_AI_SETTINGS = {
  provider: 'deepseek',
  baseUrl: 'https://api.deepseek.com/v1',
  apiKey: '',
  // 默认模型：DeepSeek V4.1（官方 API 模型 ID：deepseek-flash）
  model: 'deepseek-flash',
  temperature: 0.7
}

/**
 * 读取 AI 设置
 * 安全策略：API Key 永不从 localStorage 读取/恢复（只存在于会话内存）
 * @returns {typeof DEFAULT_AI_SETTINGS}
 */
export function loadAiSettings() {
  try {
    const raw = localStorage.getItem(AI_SETTINGS_KEY)
    if (!raw) return { ...DEFAULT_AI_SETTINGS }
    const parsed = JSON.parse(raw)
    let cleaned = false
    // 读取时丢弃可能残留的 API Key，并回写清理一次
    if ('apiKey' in parsed && parsed.apiKey) {
      delete parsed.apiKey
      cleaned = true
    }
    const settings = { ...DEFAULT_AI_SETTINGS, ...parsed, apiKey: '' }
    // 服务商已变更：若存的是已移除的服务商，回退到默认（DeepSeek 官方 + V4.1）
    const validProvider = AI_PROVIDERS.some(p => p.id === settings.provider)
    if (!validProvider) {
      settings.provider = DEFAULT_AI_SETTINGS.provider
      settings.baseUrl = DEFAULT_AI_SETTINGS.baseUrl
      settings.model = DEFAULT_AI_SETTINGS.model
      cleaned = true
    }
    if (cleaned) {
      localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(settings))
    }
    return settings
  } catch (error) {
    console.warn('读取 AI 设置失败:', error)
    return { ...DEFAULT_AI_SETTINGS }
  }
}

/**
 * 保存 AI 设置
 * 安全策略：无论传入什么，API Key 都不会被写入 localStorage
 * @param {Partial<typeof DEFAULT_AI_SETTINGS>} settings
 */
export function saveAiSettings(settings) {
  try {
    const merged = { ...loadAiSettings(), ...settings }
    delete merged.apiKey
    merged.apiKey = '' // 显式占位，保证读取方拿到空 Key
    localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(merged))
    return true
  } catch (error) {
    console.warn('保存 AI 设置失败:', error)
    return false
  }
}

/**
 * 从文本文件中解析 API Key（多种格式兼容）
 * 支持的格式：
 * - 单独一行：sk-xxxx
 * - 键值对：DEEPSEEK_API_KEY=sk-xxxx 或 API_KEY="sk-xxxx"、SK=sk-zzz
 * - 允许 # 或 // 注释行、空行、行尾注释、首尾引号
 * 启发式：优先采用键名含 key/token/secret 的行，或值以 sk- 开头/形似长 token 的行；
 * 其他键值对（如 BASE_URL=...）会被跳过，避免取错。
 * @param {string} text - 文件内容
 * @returns {{key: string, line: number}|null} 解析结果
 */
export function parseKeyFile(text) {
  if (typeof text !== 'string') return null
  const looksLikeKey = value => /^sk-|^[A-Za-z0-9_\-.]{16,}$/.test(value)
  const lines = text.split(/\r?\n/)
  let fallback = null
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].trim()
    if (!raw) continue
    if (raw.startsWith('#') || raw.startsWith('//')) continue
    // 去除行尾注释（注释符前需有空白，避免误伤 https:// 这类地址）
    let line = raw.replace(/\s+(#|\/\/).*$/, '').trim()
    let name = ''
    let value = line
    if (line.includes('=')) {
      name = line.slice(0, line.indexOf('=')).trim()
      value = line.slice(line.indexOf('=') + 1)
    }
    // 去掉首尾引号与结尾分号/逗号
    value = value.trim().replace(/^["']|["']$/g, '').replace(/[;,]\s*$/, '').trim()
    if (!value) continue

    if (name) {
      // 键值对：键名含 key/token/secret，或值形似 Key 时采用
      const nameHint = /(api[_-]?key|token|secret|key)/i.test(name)
      if (nameHint || looksLikeKey(value)) {
        return { key: value, line: i + 1 }
      }
      // 其他键值对（如 BASE_URL）跳过
      continue
    }

    // 裸值行：形似 Key 的优先；否则保留首个"形似 token"的非空值作为兜底
    if (looksLikeKey(value)) {
      return { key: value, line: i + 1 }
    }
    // token 特征：含 ASCII 字母/数字且不含空白（排除纯中文说明等非 Key 文本）
    const tokenLike = /[A-Za-z0-9]/.test(value) && !/\s/.test(value)
    if (tokenLike && !fallback) {
      fallback = { key: value, line: i + 1 }
    }
  }
  return fallback
}

/**
 * 切换 Provider 时获取其默认配置
 * @param {string} providerId
 */
export function getProviderPreset(providerId) {
  return AI_PROVIDERS.find(p => p.id === providerId) || AI_PROVIDERS[0]
}

/**
 * 根据当前设置校验配置是否可用
 * @param {Object} settings
 * @returns {{ok: boolean, message: string}}
 */
export function validateAiSettings(settings) {
  if (!settings.baseUrl) return { ok: false, message: '请填写 API 地址' }
  const provider = AI_PROVIDERS.find(p => p.id === settings.provider)
  if (provider?.keyRequired && !settings.apiKey) {
    return { ok: false, message: `缺少 ${provider.name} 的 API Key：请手动输入，或选择包含 Key 的文本文件` }
  }
  if (!settings.model) return { ok: false, message: '请填写模型名称' }
  return { ok: true, message: '' }
}

export default {
  AI_PROVIDERS,
  DEFAULT_AI_SETTINGS,
  loadAiSettings,
  saveAiSettings,
  parseKeyFile,
  getProviderPreset,
  validateAiSettings,
  resolveBaseUrl,
  isLocalDevHost
}