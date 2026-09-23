/**
 * @file AI 服务层
 * @description 调用 OpenAI 兼容的 /chat/completions 接口。
 * 本地运行时自动经 Vite 代理（/api-proxy/...）转发，避免浏览器 CORS 拦截；
 * 支持超时中断、错误分类（网络 / 鉴权 / 限流 / 服务端 / 解析）。
 */

import { resolveBaseUrl, isLocalDevHost } from '../utils/aiSettings.js'

/**
 * 会话 ID：部分服务商（如 OpenCode Go）建议通过 x-opencode-session 传递稳定的会话标识
 * 每次页面加载生成一个，用于提示词缓存与路由优化
 */
const SESSION_ID = (() => {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID()
    }
  } catch (e) {
    // 忽略，降级到随机字符串
  }
  return `vwe-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
})()

/**
 * 错误分类
 */
export class AiRequestError extends Error {
  /**
   * @param {string} code - network | auth | rate | server | parse | abort | config
   * @param {string} message
   */
  constructor(code, message) {
    super(message)
    this.name = 'AiRequestError'
    this.code = code
  }
}

// 默认超时时间（毫秒）
const DEFAULT_TIMEOUT = 120000

/**
 * 发起一次对话补全请求
 * @param {Object} options
 * @param {string} options.baseUrl - 如 https://api.deepseek.com/v1
 * @param {string} options.apiKey - 可选（无需鉴权的本地/订阅服务可留空）
 * @param {string} options.model - 模型名
 * @param {Array<{role: string, content: string}>} options.messages
 * @param {number} [options.temperature=0.7]
 * @param {number} [options.timeout=120000]
 * @param {boolean} [options.jsonMode=true] - 请求 JSON 输出模式（部分服务商不支持，失败时自动去除重试）
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<string>} - 返回模型回复的文本内容
 */
export async function chatCompletion({
  baseUrl,
  apiKey,
  model,
  messages,
  temperature = 0.7,
  timeout = DEFAULT_TIMEOUT,
  jsonMode = true,
  signal
}) {
  if (!baseUrl) throw new AiRequestError('config', '缺少 API 地址（baseUrl）')
  if (!model) throw new AiRequestError('config', '缺少模型名称')
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new AiRequestError('config', '消息内容为空')
  }

  // 组合外部信号与超时
  const controller = new AbortController()
  const linkAbort = (() => {
    if (!signal) return () => {}
    const onAbort = () => controller.abort()
    if (signal.aborted) controller.abort()
    else signal.addEventListener('abort', onAbort)
    return () => signal.removeEventListener('abort', onAbort)
  })()
  const timer = setTimeout(() => controller.abort(), timeout)

  const buildBody = (json) => ({
    model,
    messages,
    temperature,
    stream: false,
    ...(json ? { response_format: { type: 'json_object' } } : {})
  })

  const headers = {
    'Content-Type': 'application/json',
    'x-opencode-session': SESSION_ID,
    ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {})
  }

  // 本地运行时自动走 Vite 代理路径，规避浏览器 CORS；非本地/自定义地址原样使用
  const requestBaseUrl = resolveBaseUrl(baseUrl)

  const request = async (body) => {
    const resp = await fetch(`${String(requestBaseUrl).replace(/\/+$/, '')}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal
    })

    if (!resp.ok) {
      let detail = ''
      try {
        const data = await resp.json()
        detail = data?.error?.message || data?.message || JSON.stringify(data)
      } catch (e) {
        detail = await resp.text().catch(() => '')
      }

      // 错误分类
      if (resp.status === 401 || resp.status === 403) {
        throw new AiRequestError('auth', `API Key 无效或无权限（HTTP ${resp.status}）：${detail}`)
      }
      if (resp.status === 429 || resp.status === 402) {
        throw new AiRequestError('rate', `请求超限或余额不足（HTTP ${resp.status}）：${detail}`)
      }
      if (resp.status >= 500) {
        throw new AiRequestError('server', `服务端错误（HTTP ${resp.status}）：${detail}`)
      }
      throw new AiRequestError('server', `请求失败（HTTP ${resp.status}）：${detail || resp.statusText}`)
    }

    const data = await resp.json()

    // 提取回复文本（兼容多种字段结构）
    const content = data?.choices?.[0]?.message?.content
      ?? data?.choices?.[0]?.text
      ?? data?.output?.text
    if (typeof content !== 'string' || content.length === 0) {
      throw new AiRequestError('parse', '响应中没有可用的文本内容')
    }
    return content
  }

  try {
    if (jsonMode) {
      try {
        return await request(buildBody(true))
      } catch (error) {
        // 仅当服务端因 response_format 不支持而报错（server 类且非网络/鉴权/限流）时，去掉 JSON 模式重试一次
        if (error instanceof AiRequestError && error.code === 'server') {
          return await request(buildBody(false))
        }
        throw error
      }
    }
    return await request(buildBody(false))
  } catch (error) {
    if (error instanceof AiRequestError) throw error
    if (error?.name === 'AbortError') {
      throw new AiRequestError('abort', `请求超时（${Math.round(timeout / 1000)} 秒）或已取消`)
    }
    const hint = isLocalDevHost()
      ? '请检查网络连接；若为浏览器跨域（CORS）拦截，确认已通过 npm run dev 启动（本地代理会转发请求）'
      : '请检查网络连接；非本地运行环境需自行配置后端代理，第三方接口通常不允许浏览器直连'
    throw new AiRequestError('network', `网络请求失败：${error?.message || '未知错误'}（${hint}）`)
  } finally {
    clearTimeout(timer)
    linkAbort()
  }
}

/**
 * 连接测试：发送一条极短的对话，验证 Key 与连通性
 * @param {Object} settings - { baseUrl, apiKey, model }
 * @param {number} [timeout=15000]
 * @returns {Promise<{ok: boolean, message: string}>}
 */
export async function testConnection(settings, timeout = 15000) {
  try {
    const reply = await chatCompletion({
      baseUrl: settings.baseUrl,
      apiKey: settings.apiKey,
      model: settings.model,
      messages: [{ role: 'user', content: '请只回复两个字：正常' }],
      temperature: 0,
      timeout,
      jsonMode: false
    })
    return { ok: true, message: `连接成功，模型回复：${String(reply).slice(0, 30)}` }
  } catch (error) {
    return { ok: false, message: error?.message || '连接失败' }
  }
}

export default { chatCompletion, testConnection, AiRequestError }