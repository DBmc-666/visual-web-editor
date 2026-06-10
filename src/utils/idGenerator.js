/**
 * 生成唯一 ID
 * @param {string} prefix - ID 前缀
 * @returns {string}
 * 
 * 后期可扩展：使用 nanoid 或 uuid 库
 */
export function generateId(prefix = 'comp') {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `${prefix}_${timestamp}_${random}`
}

/**
 * 生成页面 ID
 * @returns {string}
 */
export function generatePageId() {
  return generateId('page')
}
