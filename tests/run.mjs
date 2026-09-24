/**
 * @file 测试运行器
 * @description 依次运行 tests/ 下的所有 *.test.mjs，汇总输出 PASS/FAIL。
 *
 * 用法：
 *   npm test            # 纯逻辑测试（不联网，秒级）
 *   npm run test:ai     # 额外包含真实 AI 接口测试（需要 Key 文件，分钟级）
 *
 * 真实 AI 测试需要环境变量 VWE_KEY_FILE 指向包含 API Key 的文本文件。
 */

import { readdirSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'
import { createContext, formatResult } from './helpers.mjs'

const TESTS_DIR = path.dirname(fileURLToPath(import.meta.url))
const live = process.argv.includes('--live') || process.env.VWE_LIVE === '1'

const files = readdirSync(TESTS_DIR)
  .filter(name => name.endsWith('.test.mjs'))
  .filter(name => (name === 'ai-live.test.mjs' ? live : true))
  .sort()

const startedAt = Date.now()
let totalPass = 0
let totalFail = 0
const failedDetails = []

console.log('='.repeat(72))
console.log(`运行测试：${files.length} 个文件${live ? '（含真实 AI 接口测试）' : ''}`)
console.log('='.repeat(72))

for (const file of files) {
  const mod = await import(pathToFileURL(path.join(TESTS_DIR, file)).href)
  const context = createContext(file)
  const label = mod.name || file

  const fileStart = Date.now()
  try {
    await mod.default(context)
  } catch (error) {
    context.check(`${label} 执行异常`, false, `${error?.name}: ${error?.message}`)
  }
  const ms = Date.now() - fileStart

  const pass = context.results.filter(r => r.ok).length
  const fail = context.results.filter(r => !r.ok).length
  totalPass += pass
  totalFail += fail

  console.log(`\n── ${label} ${'─'.repeat(Math.max(0, 56 - label.length))} ${pass} 通过 / ${fail} 失败 (${ms}ms)`)

  // 输出分组明细（只输出失败项 + 每个分组的通过数，避免刷屏）
  let lastSection = null
  for (const r of context.results) {
    if (r.section !== lastSection) {
      lastSection = r.section
      if (r.section) console.log(`   [${r.section}]`)
    }
    if (!r.ok) {
      console.log('   ' + formatResult(r))
      failedDetails.push(`${label} › ${r.section ? r.section + ' › ' : ''}${r.name}${r.extra ? '  ' + r.extra : ''}`)
    }
  }
  if (fail === 0) console.log(`   ✅ 全部通过`)
}

const seconds = ((Date.now() - startedAt) / 1000).toFixed(1)
console.log('\n' + '='.repeat(72))
if (totalFail === 0) {
  console.log(`✅ 全部通过：${totalPass} 项断言，${files.length} 个文件，耗时 ${seconds}s`)
} else {
  console.log(`❌ ${totalFail} 项失败 / 共 ${totalPass + totalFail} 项，耗时 ${seconds}s`)
  console.log('\n失败明细：')
  failedDetails.forEach(d => console.log('  · ' + d))
}
console.log('='.repeat(72))

process.exit(totalFail === 0 ? 0 : 1)
