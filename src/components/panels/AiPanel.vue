<script setup>
import { ref, computed } from 'vue'
import { useAi, OUTPUT_MODES } from '../../stores/ai.js'

const ai = useAi()

// 显示/隐藏 API Key
const showKey = ref(false)

// 隐藏的 Key 文件选择输入
const keyFileInput = ref(null)

// 成品网页代码预览展开状态
const showHtmlPreview = ref(false)

// 代码预览（截断，避免面板卡顿）
const htmlPreview = computed(() => {
  const code = ai.finalHtml.value || ''
  if (code.length <= 4000) return code
  return code.slice(0, 4000) + '\n\n... （已截断，完整代码请点"复制代码"或直接下载）'
})

function toggleHtmlPreview() {
  showHtmlPreview.value = !showHtmlPreview.value
}

// 选择 Key 文件后加载（仅内存，不保存）
function handleKeyFileChange(event) {
  const file = event.target.files?.[0]
  if (file) {
    ai.loadApiKeyFromFile(file)
  }
  // 重置输入，允许重复选择同一文件
  event.target.value = ''
}

// 当前 Provider 预设
const currentProvider = computed(() => {
  return ai.AI_PROVIDERS.find(p => p.id === ai.settings.value.provider) || ai.AI_PROVIDERS[0]
})

// 模型建议列表（datalist）
const modelSuggestions = computed(() => currentProvider.value?.models || [])

// 生成按钮文案
const generateButtonText = computed(() => {
  if (ai.generating.value) return '⏳ 生成中...'
  if (ai.outputMode.value === OUTPUT_MODES.FINAL_HTML) return '🌐 生成成品网页（HTML/CSS）'
  if (ai.scope.value === ai.GENERATE_SCOPES.SITE) return '🏗 生成整个站点（多页面）'
  return '✨ 开始 AI 生成'
})

// 应用按钮文案（跟随输出模式与生成范围）
const applyButtonText = computed(() => {
  if (ai.siteResult.value) {
    return ai.replaceCanvas.value
      ? '✅ 替换当前画布（创建这些页面）'
      : '✅ 创建这些页面并回到画布'
  }
  switch (ai.outputMode.value) {
    case OUTPUT_MODES.HTML: return '📄 导出 HTML（像素布局）'
    case OUTPUT_MODES.VUE: return '📦 导出 Vue 工程（像素布局）'
    default: return '✅ 应用并回到画布'
  }
})

// 整站生成结果的页面统计
const siteStats = computed(() => ai.siteResult.value?.stats || null)
const sitePagesRepair = computed(() => ai.siteResult.value?.pagesRepair || [])

// 打开时清空一次错误信息
function handleGenerate() {
  ai.generate()
}
</script>

<template>
  <div v-if="ai.panelOpen.value" class="ai-modal-overlay" @click.self="ai.closePanel()">
    <div class="ai-modal">
      <!-- 头部 -->
      <div class="ai-modal-header">
        <div class="ai-modal-title">
          <span class="ai-logo">🤖</span>
          <span>AI 辅助建站</span>
          <span class="ai-subtitle">把你的布局，交给 AI 完善成完整网页</span>
        </div>
        <button class="ai-close" @click="ai.closePanel()">✕</button>
      </div>

      <div class="ai-modal-body">
        <!-- ============ 服务设置 ============ -->
        <details class="ai-section" open>
          <summary class="ai-section-title">⚙️ 服务设置</summary>
          <div class="ai-section-body">
            <div class="ai-form-grid">
              <!-- Provider -->
              <div class="ai-field">
                <label class="ai-label">服务商</label>
                <select
                  class="ai-input"
                  :value="ai.settings.value.provider"
                  @change="ai.selectProvider($event.target.value)"
                >
                  <option v-for="p in ai.AI_PROVIDERS" :key="p.id" :value="p.id">
                    {{ p.name }}{{ p.keyRequired ? '' : '（无需 Key）' }}
                  </option>
                </select>
              </div>

              <!-- API 地址 -->
              <div class="ai-field">
                <label class="ai-label">API 地址（OpenAI 兼容）</label>
                <input
                  class="ai-input"
                  type="text"
                  :value="ai.settings.value.baseUrl"
                  @input="ai.updateSettings({ baseUrl: $event.target.value })"
                  placeholder="https://api.deepseek.com/v1"
                />
              </div>

              <!-- API Key（优先使用本地文本文件加载，仅保存在内存） -->
              <div class="ai-field" v-if="currentProvider.keyRequired">
                <label class="ai-label">API Key<span class="ai-required">*</span></label>

                <!-- 方式一：选择本地 Key 文件（推荐） -->
                <div class="ai-key-file-row">
                  <input
                    ref="keyFileInput"
                    type="file"
                    accept=".txt,.key,.env,text/plain"
                    style="display: none"
                    @change="handleKeyFileChange"
                  />
                  <button class="btn ai-key-file-btn" type="button" @click="keyFileInput.click()">
                    📄 选择 Key 文件
                  </button>
                  <span v-if="ai.apiKeySource.value === 'file'" class="ai-key-file-info">
                    ✅ {{ ai.apiKeyFile.value }}（仅本次会话，不保存）
                  </span>
                  <span v-if="ai.apiKeySource.value !== 'none'" class="ai-key-clear" @click="ai.clearApiKey()">
                    清除
                  </span>
                </div>

                <!-- 方式二：手动输入（可选，同样只在内存中） -->
                <div class="ai-input-group">
                  <input
                    class="ai-input"
                    :type="showKey ? 'text' : 'password'"
                    :value="ai.settings.value.apiKey"
                    @input="ai.setApiKeyManually($event.target.value)"
                    placeholder="或手动输入 Key（仅内存，刷新后清除）"
                  />
                  <button class="ai-eye-btn" type="button" @click="showKey = !showKey" :title="showKey ? '隐藏' : '显示'">
                    {{ showKey ? '🙈' : '👁' }}
                  </button>
                </div>
                <span class="ai-key-tip">Key 文件格式：一行 sk-xxx，或 KEY=sk-xxx；可含 # 注释、空行</span>
              </div>

              <!-- 无需 Key 的服务商 -->
              <div class="ai-field" v-else>
                <label class="ai-label">API Key</label>
                <span class="ai-key-tip">本地服务（{{ currentProvider.name }}）无需 Key</span>
              </div>

              <!-- 模型 -->
              <div class="ai-field">
                <label class="ai-label">模型</label>
                <input
                  class="ai-input"
                  type="text"
                  list="ai-model-suggestions"
                  :value="ai.settings.value.model"
                  @input="ai.updateSettings({ model: $event.target.value })"
                  placeholder="deepseek-chat"
                />
                <datalist id="ai-model-suggestions">
                  <option v-for="m in modelSuggestions" :key="m" :value="m" />
                </datalist>
              </div>

              <!-- 温度 -->
              <div class="ai-field">
                <label class="ai-label">创造性（温度）：{{ Number(ai.settings.value.temperature ?? 0.7).toFixed(1) }}</label>
                <input
                  class="ai-slider"
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.1"
                  :value="ai.settings.value.temperature ?? 0.7"
                  @input="ai.updateSettings({ temperature: Number($event.target.value) })"
                />
              </div>

              <!-- 测试连接 -->
              <div class="ai-field ai-field-action">
                <button
                  class="btn ai-test-btn"
                  :disabled="ai.testing.value"
                  @click="ai.testConnection()"
                >
                  {{ ai.testing.value ? '测试中...' : '🔌 测试连接' }}
                </button>
              </div>
            </div>

            <div class="ai-hint">
              {{ currentProvider.hint }}
            </div>
          </div>
        </details>

        <!-- ============ 生成设置 ============ -->
        <details class="ai-section" open>
          <summary class="ai-section-title">🎨 生成设置</summary>
          <div class="ai-section-body">
            <!-- 页面类型 -->
            <div class="ai-field">
              <label class="ai-label">页面类型（可选）</label>
              <input
                class="ai-input"
                type="text"
                :value="ai.pageType.value"
                @input="ai.updatePageType($event.target.value)"
                placeholder="如：企业官网首页 / 个人博客 / 产品落地页"
              />
            </div>

            <!-- 用户要求 -->
            <div class="ai-field">
              <label class="ai-label">你的要求</label>
              <textarea
                class="ai-input ai-textarea"
                rows="3"
                :value="ai.instruction.value"
                @input="ai.updateInstruction($event.target.value)"
                placeholder="告诉 AI 你想要什么，比如：这是咖啡店宣传页，帮我补全导航、产品介绍和预约表单，整体用暖色调……"
              ></textarea>
            </div>

            <!-- 风格 -->
            <div class="ai-field">
              <label class="ai-label">视觉风格</label>
              <div class="ai-chips">
                <button
                  v-for="s in ai.PAGE_STYLE_OPTIONS"
                  :key="s.key"
                  class="ai-chip"
                  :class="{ active: ai.styleKey.value === s.key }"
                  @click="ai.updateStyleKey(s.key)"
                  :title="s.desc"
                >
                  {{ s.label }}
                </button>
              </div>
            </div>

            <!-- 生成范围 -->
            <div class="ai-field">
              <label class="ai-label">生成范围</label>
              <div class="ai-radio-list ai-radio-list-vertical">
                <label
                  v-for="(label, key) in ai.GENERATE_SCOPE_LABELS"
                  :key="key"
                  class="ai-radio ai-radio-block"
                  :class="{ active: ai.scope.value === key }"
                >
                  <input type="radio" :value="key" :checked="ai.scope.value === key" @change="ai.updateScope(key)" />
                  <span class="ai-radio-text">
                    <span class="ai-radio-label">{{ label }}</span>
                    <span class="ai-radio-hint">{{ ai.GENERATE_SCOPE_HINTS[key] }}</span>
                  </span>
                </label>
              </div>
            </div>

            <!-- 整站生成选项 -->
            <div v-if="ai.scope.value === ai.GENERATE_SCOPES.SITE" class="ai-field ai-site-options">
              <div class="ai-site-row">
                <label class="ai-label">期望页面数</label>
                <input
                  type="number"
                  class="input ai-site-count"
                  min="1"
                  max="12"
                  :value="ai.sitePageCount.value"
                  @input="ai.updateSitePageCount($event.target.value)"
                />
                <span class="ai-site-hint">AI 会据此规划页面数量（可按内容增减）</span>
              </div>
              <label class="ai-site-row ai-checkbox-row">
                <input
                  type="checkbox"
                  :checked="ai.replaceCanvas.value"
                  @change="ai.updateReplaceCanvas($event.target.checked)"
                />
                <span>替换当前画布已有页面（默认追加为新页面，不删除已有内容）</span>
              </label>
            </div>

            <!-- 生成模式 -->
            <div v-if="ai.scope.value !== ai.GENERATE_SCOPES.SITE" class="ai-field">
              <label class="ai-label">生成模式</label>
              <div class="ai-radio-list">
                <label
                  v-for="(label, key) in ai.AI_MODE_LABELS"
                  :key="key"
                  class="ai-radio"
                  :class="{ active: ai.mode.value === key }"
                >
                  <input type="radio" :value="key" :checked="ai.mode.value === key" @change="ai.updateMode(key)" />
                  <span>{{ label }}</span>
                </label>
              </div>
            </div>

            <!-- 输出模式 -->
            <div class="ai-field">
              <label class="ai-label">结果输出方式</label>
              <div class="ai-radio-list ai-radio-list-vertical">
                <label
                  v-for="(label, key) in ai.OUTPUT_MODE_LABELS"
                  :key="key"
                  class="ai-radio ai-radio-block"
                  :class="{ active: ai.outputMode.value === key }"
                >
                  <input type="radio" :value="key" :checked="ai.outputMode.value === key" @change="ai.updateOutputMode(key)" />
                  <span class="ai-radio-text">
                    <span class="ai-radio-label">{{ label }}</span>
                    <span class="ai-radio-hint">{{ ai.OUTPUT_MODE_HINTS[key] }}</span>
                  </span>
                </label>
              </div>
            </div>
          </div>
        </details>

        <!-- ============ 错误提示 ============ -->
        <div v-if="ai.error.value" class="ai-error">
          <span>❌ {{ ai.error.value }}</span>
        </div>

        <!-- ============ 生成按钮 ============ -->
        <div class="ai-generate-row">
          <button class="btn ai-generate-btn" :disabled="ai.generating.value" @click="handleGenerate">
            {{ generateButtonText }}
          </button>
          <span v-if="ai.generating.value" class="ai-generating-tip">
            <template v-if="ai.outputMode.value === OUTPUT_MODES.FINAL_HTML">
              正在让 AI 根据你的画布草图编写完整前端页面代码，通常需要 20~90 秒……
            </template>
            <template v-else-if="ai.scope.value === ai.GENERATE_SCOPES.SITE">
              正在让 AI 规划整个站点并逐页生成画布数据（页面越多越慢，通常 40~180 秒）……
            </template>
            <template v-else>
              正在让 AI 分析你的布局并生成页面数据（返回后会自动修复组件重叠），通常需要 10~60 秒……
            </template>
          </span>
        </div>

        <!-- ============ 布局修复提示 ============ -->
        <div v-if="ai.repairInfo.value" class="ai-repair-notice">
          <div class="ai-repair-title">🔧 已自动修复布局重叠</div>
          <div class="ai-repair-body">
            AI 把绝对定位画布当成了文档流，检测到 <b>{{ ai.repairInfo.value.overlapsBefore }}</b> 处组件互相重叠，
            已自动调整坐标（修复后剩余 <b>{{ ai.repairInfo.value.overlapsAfter }}</b> 处）：
            <span class="ai-repair-detail">
              下移区块 {{ ai.repairInfo.value.movedBlocks || 0 }} 个 ·
              容器内重排 {{ ai.repairInfo.value.movedChildren || 0 }} 个 ·
              撑高容器 {{ ai.repairInfo.value.grownContainers || 0 }} 个<template
                v-if="ai.repairInfo.value.heightExtended"
              > · 页面高度 +{{ ai.repairInfo.value.heightExtended }}px</template>
            </span>
          </div>
        </div>

        <!-- ============ 成品网页代码预览 ============ -->
        <div v-if="ai.finalHtml.value" class="ai-final">
          <div class="ai-result-header">
            <span class="ai-result-title">🌐 成品网页代码（语义化流式布局，可直接部署）</span>
            <div class="ai-final-actions">
              <button class="btn ai-copy-btn" @click="ai.copyFinalHtml()">复制代码</button>
              <button class="btn ai-copy-btn" @click="toggleHtmlPreview">
                {{ showHtmlPreview ? '收起' : '展开预览' }}
              </button>
            </div>
          </div>
          <pre v-if="showHtmlPreview" class="ai-code-block">{{ htmlPreview }}</pre>
          <div class="ai-final-actions">
            <button
              class="btn btn-primary ai-apply-btn"
              :disabled="ai.applied.value"
              @click="ai.applyResult()"
            >
              📄 下载成品网页 index.html
            </button>
            <button v-if="ai.applied.value" class="btn ai-close-result" @click="ai.closePanel()">
              完成，关闭面板
            </button>
          </div>
          <div v-if="ai.resultMessage.value" class="ai-success">
            {{ ai.resultMessage.value }}
          </div>
        </div>

        <!-- ============ 结果预览（画布链路） ============ -->
        <div v-if="ai.result.value && !ai.finalHtml.value" class="ai-result">
          <div class="ai-result-header">
            <span class="ai-result-title">🧾 生成结果预览</span>
            <button class="btn ai-copy-btn" @click="ai.copyResultJSON()">复制 JSON</button>
          </div>

          <!-- 差异统计 -->
          <div class="ai-stats">
            <div class="ai-stat-item">
              <span class="ai-stat-num">{{ ai.resultStats.value.currentTotal }}</span>
              <span class="ai-stat-label">当前组件</span>
            </div>
            <div class="ai-stat-arrow">→</div>
            <div class="ai-stat-item">
              <span class="ai-stat-num highlight">{{ ai.resultStats.value.total }}</span>
              <span class="ai-stat-label">AI 结果组件</span>
            </div>
            <div class="ai-stat-detail">
              <span v-if="ai.resultStats.value.kept > 0" class="ai-tag keep">保留 {{ ai.resultStats.value.kept }}</span>
              <span v-if="ai.resultStats.value.added > 0" class="ai-tag add">新增 {{ ai.resultStats.value.added }}</span>
              <span v-if="ai.resultStats.value.removed > 0" class="ai-tag remove">移除 {{ ai.resultStats.value.removed }}</span>
            </div>
          </div>

          <!-- 页面信息 -->
          <div class="ai-page-info">
            <span class="ai-tag">{{ ai.result.value.page.name }}</span>
            <span class="ai-tag">{{ ai.result.value.page.width }} × {{ ai.result.value.page.height }}</span>
            <span
              v-for="(count, type) in ai.resultStats.value.byType"
              :key="type"
              class="ai-tag type"
            >{{ type }} ×{{ count }}</span>
          </div>

          <div class="ai-result-actions">
            <button
              class="btn btn-primary ai-apply-btn"
              :disabled="ai.applied.value"
              @click="ai.applyResult()"
            >
              {{ applyButtonText }}
            </button>
            <button v-if="ai.applied.value" class="btn ai-close-result" @click="ai.closePanel()">
              完成，关闭面板
            </button>
          </div>

          <div v-if="ai.resultMessage.value" class="ai-success">
            {{ ai.resultMessage.value }}
          </div>
        </div>

        <!-- ============ 结果预览（整站多页链路） ============ -->
        <div v-if="ai.siteResult.value" class="ai-result">
          <div class="ai-result-header">
            <span class="ai-result-title">🏗 整站生成结果：{{ ai.siteResult.value.site.name }}</span>
          </div>

          <!-- 汇总统计 -->
          <div class="ai-stats">
            <div class="ai-stat-item">
              <span class="ai-stat-num highlight">{{ siteStats.pageCount }}</span>
              <span class="ai-stat-label">个页面</span>
            </div>
            <div class="ai-stat-arrow">·</div>
            <div class="ai-stat-item">
              <span class="ai-stat-num">{{ siteStats.componentCount }}</span>
              <span class="ai-stat-label">个组件</span>
            </div>
            <div class="ai-stat-detail">
              <span v-if="siteStats.overlapsBefore > 0" class="ai-tag keep">
                重叠修复 {{ siteStats.overlapsBefore }} → {{ siteStats.overlapsAfter }}
              </span>
              <span v-else class="ai-tag add">无重叠</span>
            </div>
          </div>

          <!-- 页面清单 -->
          <div class="ai-site-pages">
            <div v-for="(pageRepair, index) in sitePagesRepair" :key="index" class="ai-site-page-item">
              <span class="ai-site-page-index">{{ index + 1 }}</span>
              <span class="ai-site-page-name">{{ pageRepair.name }}</span>
              <span v-if="pageRepair.slug" class="ai-tag">{{ pageRepair.slug }}.html</span>
              <span class="ai-tag type">{{ pageRepair.componentCount }} 组件</span>
              <span v-if="pageRepair.overlapsBefore > 0" class="ai-tag keep">
                修复 {{ pageRepair.overlapsBefore }} → {{ pageRepair.overlapsAfter }}
              </span>
            </div>
          </div>

          <div v-if="ai.siteResult.value.warnings && ai.siteResult.value.warnings.length" class="ai-site-warning">
            ⚠️ {{ ai.siteResult.value.warnings.join('；') }}
          </div>

          <div class="ai-result-actions">
            <button
              class="btn btn-primary ai-apply-btn"
              :disabled="ai.applied.value"
              @click="ai.applyResult()"
            >
              {{ applyButtonText }}
            </button>
            <button v-if="ai.applied.value" class="btn ai-close-result" @click="ai.closePanel()">
              完成，关闭面板
            </button>
          </div>

          <div v-if="ai.resultMessage.value" class="ai-success">
            {{ ai.resultMessage.value }}
          </div>
          <div v-if="!ai.applied.value" class="ai-site-tip">
            应用后会把这些页面创建到当前画布，并自动把导航栏 / 页脚里的「跳转到页面」链接关联到对应页面
            （导出整站时链接会变成真实文件名）。
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ai-modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.ai-modal {
  background-color: var(--color-bg-white);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
  width: 640px;
  max-width: 94vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.ai-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
  background: linear-gradient(135deg, #f0f7ff, #ffffff);
}

.ai-modal-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
}

.ai-logo {
  font-size: 22px;
}

.ai-subtitle {
  font-size: 12px;
  font-weight: 400;
  color: var(--color-text-secondary);
}

.ai-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #999;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.ai-close:hover {
  background-color: var(--color-bg-hover);
  color: var(--color-text);
}

.ai-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ai-section {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
}

.ai-section-title {
  padding: 10px 14px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  background-color: var(--color-bg);
  user-select: none;
}

.ai-section-body {
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ai-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 12px;
}

.ai-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.ai-field-action {
  justify-content: flex-end;
}

.ai-label {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.ai-required {
  color: var(--color-danger);
  margin-left: 2px;
}

.ai-input {
  width: 100%;
  padding: 7px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  font-size: 13px;
  outline: none;
  background-color: var(--color-bg-white);
  color: var(--color-text);
  transition: border-color 0.2s;
}

.ai-input:focus {
  border-color: var(--color-primary);
}

.ai-textarea {
  resize: vertical;
  font-family: inherit;
  line-height: 1.6;
}

.ai-input-group {
  display: flex;
  gap: 6px;
}

.ai-input-group .ai-input {
  flex: 1;
}

.ai-key-file-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.ai-key-file-btn {
  min-width: auto;
  background-color: #f0f5ff;
  border-color: #adc6ff;
  color: var(--color-primary);
  font-size: 13px;
}

.ai-key-file-btn:hover {
  background-color: #e6f7ff;
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.ai-key-file-info {
  font-size: 12px;
  color: var(--color-success);
  word-break: break-all;
}

.ai-key-clear {
  font-size: 12px;
  color: var(--color-text-secondary);
  cursor: pointer;
  text-decoration: underline;
  user-select: none;
}

.ai-key-clear:hover {
  color: var(--color-danger);
}

.ai-key-tip {
  font-size: 12px;
  color: var(--color-text-secondary);
}

/* 输出模式：纵向排列 + 说明文字 */
.ai-radio-list-vertical {
  flex-direction: column;
  align-items: stretch;
}

.ai-radio-block {
  align-items: flex-start;
  gap: 8px;
}

.ai-radio-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ai-radio-label {
  font-weight: 500;
}

.ai-radio-hint {
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.ai-radio-block.active .ai-radio-hint {
  color: #4a8fd4;
}

/* 布局修复提示 */
.ai-repair-notice {
  border: 1px solid #ffe58f;
  background-color: #fffbe6;
  border-radius: 8px;
  padding: 10px 12px;
}

.ai-repair-title {
  font-size: 13px;
  font-weight: 600;
  color: #ad6800;
  margin-bottom: 4px;
}

.ai-repair-body {
  font-size: 12px;
  color: var(--color-text);
  line-height: 1.6;
}

.ai-repair-detail {
  display: block;
  color: var(--color-text-secondary);
  margin-top: 2px;
}

/* 成品网页代码 */
.ai-final {
  border: 1px solid #91caff;
  background-color: #f0f8ff;
  border-radius: 8px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ai-final-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.ai-code-block {
  max-height: 260px;
  overflow: auto;
  background-color: #1e1e1e;
  color: #d4d4d4;
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.5;
  padding: 10px 12px;
  border-radius: 6px;
  white-space: pre-wrap;
  word-break: break-all;
}

.ai-eye-btn {
  border: 1px solid var(--color-border);
  background: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  padding: 0 10px;
  font-size: 14px;
}

.ai-slider {
  width: 100%;
  accent-color: var(--color-primary);
}

.ai-test-btn {
  align-self: flex-end;
  min-width: 120px;
}

.ai-hint {
  font-size: 12px;
  color: var(--color-text-secondary);
  background-color: var(--color-bg);
  border-radius: var(--border-radius);
  padding: 8px 10px;
  line-height: 1.5;
}

.ai-hint-warn {
  color: var(--color-warning);
}

.ai-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.ai-chip {
  padding: 5px 12px;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: none;
  cursor: pointer;
  font-size: 13px;
  color: var(--color-text);
  transition: all 0.2s;
}

.ai-chip:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.ai-chip.active {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

.ai-radio-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ai-radio {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.ai-radio:hover {
  border-color: var(--color-primary);
}

.ai-radio.active {
  border-color: var(--color-primary);
  background-color: #e6f7ff;
  color: var(--color-primary);
}

.ai-error {
  padding: 10px 12px;
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: var(--border-radius);
  color: var(--color-danger);
  font-size: 13px;
  line-height: 1.5;
  word-break: break-all;
}

.ai-generate-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ai-generate-btn {
  min-width: 180px;
  background: linear-gradient(135deg, #1890ff, #096dd9);
  border: none;
  color: #fff;
  font-weight: 600;
  padding: 10px 20px;
}

.ai-generate-btn:hover {
  background: linear-gradient(135deg, #40a9ff, #1890ff);
  color: #fff;
}

.ai-generate-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.ai-generating-tip {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.ai-result {
  border: 1px solid #b7eb8f;
  background-color: #f6ffed;
  border-radius: 8px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ai-result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ai-result-title {
  font-weight: 600;
  font-size: 14px;
}

.ai-copy-btn {
  min-width: auto;
  padding: 4px 10px;
  font-size: 12px;
}

.ai-stats {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.ai-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px 12px;
  background-color: #fff;
  border-radius: 6px;
  border: 1px solid var(--color-border);
}

.ai-stat-num {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text);
}

.ai-stat-num.highlight {
  color: var(--color-primary);
}

.ai-stat-label {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.ai-stat-arrow {
  font-size: 18px;
  color: var(--color-text-secondary);
}

.ai-stat-detail {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.ai-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  background-color: #fff;
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

.ai-tag.keep {
  color: var(--color-success);
  border-color: #b7eb8f;
}

.ai-tag.add {
  color: var(--color-primary);
  border-color: #91caff;
}

.ai-tag.remove {
  color: var(--color-danger);
  border-color: #ffa39e;
}

.ai-tag.type {
  font-family: monospace;
}

.ai-page-info {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.ai-result-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.ai-apply-btn {
  min-width: 180px;
}

.ai-close-result {
  color: var(--color-text-secondary);
}

.ai-success {
  padding: 8px 10px;
  background-color: #fff;
  border: 1px solid #b7eb8f;
  color: var(--color-success);
  border-radius: var(--border-radius);
  font-size: 13px;
}

/* ============ 整站多页生成 ============ */

.ai-site-options {
  padding: 10px;
  background-color: var(--color-bg);
  border: 1px dashed var(--color-border);
  border-radius: var(--border-radius);
}

.ai-site-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--color-text);
}

.ai-site-row + .ai-site-row {
  margin-top: 8px;
}

.ai-site-count {
  width: 64px;
  flex-shrink: 0;
}

.ai-site-hint {
  color: var(--color-text-secondary);
  font-size: 11px;
}

.ai-checkbox-row {
  cursor: pointer;
}

.ai-checkbox-row input {
  flex-shrink: 0;
}

.ai-site-pages {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 220px;
  overflow-y: auto;
}

.ai-site-page-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  font-size: 13px;
}

.ai-site-page-index {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: var(--color-primary);
  color: #fff;
  font-size: 11px;
  flex-shrink: 0;
}

.ai-site-page-name {
  font-weight: 600;
  color: var(--color-text);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ai-site-warning {
  padding: 8px 10px;
  background-color: #fffbe6;
  border: 1px solid #ffe58f;
  color: #ad6800;
  border-radius: var(--border-radius);
  font-size: 12px;
}

.ai-site-tip {
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.6;
}
</style>