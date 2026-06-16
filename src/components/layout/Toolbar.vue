<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useEditor } from '../../stores/editor'
import { generatePageHTML, downloadHTML, exportPageWithImages, hasLocalImages, exportVue } from '../../utils/htmlGenerator'

const { page, previewMode, togglePreviewMode, setZoom, zoom, deselectComponent, exportPageJSON, exportLayoutJSON, importPageJSON, importLayoutJSON, undo, redo, canUndo, canRedo, guidesVisible, guidesList, snapEnabled, toggleGuides, toggleSnap, addHorizontalGuide, addVerticalGuide, addCircleGuide, addCenterGuides, addRotatableLineGuide, clearGuides } = useEditor()

// 将方法转换为计算属性
const canUndoComputed = computed(() => canUndo())
const canRedoComputed = computed(() => canRedo())

// 页面设置面板显示状态
const showPageSettings = ref(false)

// 导入/导出下拉菜单显示状态
const showImportMenu = ref(false)
const showExportMenu = ref(false)

// 辅助线下拉菜单显示状态
const showGuidesMenu = ref(false)

// 导入类型：'page' 或 'layout'
const importType = ref('page')

// 文件输入元素
const fileInput = ref(null)

// 缩放滑块值
const zoomSlider = ref(zoom.value)

// 缩放选项
const zoomOptions = [
  { label: '50%', value: 0.5 },
  { label: '75%', value: 0.75 },
  { label: '100%', value: 1 },
  { label: '150%', value: 1.5 },
  { label: '200%', value: 2 }
]

// 最小和最大缩放比例
const minZoom = 0.1
const maxZoom = 3

// 监听滑块变化
function handleSliderChange() {
  setZoom(zoomSlider.value)
}

// 适应屏幕
function fitToScreen() {
  // 获取画布容器的可用空间
  const toolbarHeight = 60
  const statusbarHeight = 30
  const sidebarWidth = 280
  const propertyPanelWidth = 300
  
  const availableWidth = window.innerWidth - sidebarWidth - propertyPanelWidth - 40
  const availableHeight = window.innerHeight - toolbarHeight - statusbarHeight - 40
  
  // 计算合适的缩放比例
  const scaleX = availableWidth / page.width
  const scaleY = availableHeight / page.height
  
  // 取较小的缩放比例，确保完全显示
  const fitZoom = Math.min(scaleX, scaleY, 1)
  
  // 限制在合理范围内
  const finalZoom = Math.max(minZoom, Math.min(maxZoom, fitZoom))
  
  setZoom(finalZoom)
  zoomSlider.value = finalZoom
}

// 放大
function zoomIn() {
  const newZoom = Math.min(maxZoom, zoom.value + 0.1)
  setZoom(newZoom)
  zoomSlider.value = newZoom
}

// 缩小
function zoomOut() {
  const newZoom = Math.max(minZoom, zoom.value - 0.1)
  setZoom(newZoom)
  zoomSlider.value = newZoom
}

// 重置缩放
function resetZoom() {
  setZoom(1)
  zoomSlider.value = 1
}

// 添加中心辅助线
function addGuideAtCenter() {
  addCenterGuides()
  showGuidesMenu.value = false
}

// 添加参考圆形
function addGuideCircle() {
  const centerX = page.width / 2
  const centerY = page.height / 2
  addCircleGuide(centerX, centerY, 100)
  showGuidesMenu.value = false
}

// 添加水平参考线
function addGuideHorizontal() {
  addHorizontalGuide(page.height / 2)
  showGuidesMenu.value = false
}

// 添加垂直参考线
function addGuideVertical() {
  addVerticalGuide(page.width / 2)
  showGuidesMenu.value = false
}

// 添加可旋转直线参考线
function addGuideRotatableLine() {
  const centerX = page.width / 2
  const centerY = page.height / 2
  addRotatableLineGuide(centerX, centerY, 2000, 0)
  showGuidesMenu.value = false
}

// 快捷键处理
function handleKeydown(event) {
  // Ctrl/Cmd + Plus: 放大
  if ((event.ctrlKey || event.metaKey) && (event.key === '+' || event.key === '=')) {
    event.preventDefault()
    zoomIn()
  }
  // Ctrl/Cmd + Minus: 缩小
  if ((event.ctrlKey || event.metaKey) && event.key === '-') {
    event.preventDefault()
    zoomOut()
  }
  // Ctrl/Cmd + 0: 重置缩放
  if ((event.ctrlKey || event.metaKey) && event.key === '0') {
    event.preventDefault()
    resetZoom()
  }
  // Ctrl/Cmd + Z: 撤销
  if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
    event.preventDefault()
    undo()
  }
  // Shift + Z: 重做
  if (event.shiftKey && event.key === 'z') {
    event.preventDefault()
    redo()
  }
  // Ctrl/Cmd + G: 切换辅助线显示
  if ((event.ctrlKey || event.metaKey) && event.key === 'g') {
    event.preventDefault()
    toggleGuides()
  }
}

// 组件挂载和卸载时监听键盘事件
onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

// 监听外部zoom变化，同步到滑块
watch(zoom, (newVal) => {
  zoomSlider.value = newVal
})

// 导出HTML
async function handleExport() {
  try {
    if (hasLocalImages(page)) {
      await exportPageWithImages(page)
    } else {
      const html = generatePageHTML(page)
      downloadHTML(html, 'page.html')
    }
  } catch (error) {
    console.error('导出失败:', error)
    alert('导出失败，请重试')
  }
}

// 导出Vue组件（自动检测是否包含本地图片）
async function handleExportVue() {
  try {
    await exportVue(page)
  } catch (error) {
    console.error('导出Vue失败:', error)
    alert('导出Vue失败，请重试')
  }
}

// 导出页面JSON
function handleExportPageJSON() {
  const json = exportPageJSON()
  downloadJSON(json, 'page-template.json')
}

// 导出布局JSON
function handleExportLayoutJSON() {
  const json = exportLayoutJSON()
  downloadJSON(json, 'layout-template.json')
}

// 下载JSON文件
function downloadJSON(json, filename) {
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 触发文件输入（页面导入）
function triggerPageImport() {
  importType.value = 'page'
  fileInput.value?.click()
}

// 触发文件输入（布局导入）
function triggerLayoutImport() {
  importType.value = 'layout'
  fileInput.value?.click()
}

// 处理文件导入
function handleFileImport(event) {
  const file = event.target.files?.[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    const jsonString = e.target.result
    let result
    
    if (importType.value === 'page') {
      result = importPageJSON(jsonString)
    } else {
      result = importLayoutJSON(jsonString)
    }
    
    if (result.success) {
      alert(result.message)
    } else {
      alert(result.message)
    }
  }
  reader.readAsText(file)
  
  // 重置文件输入
  event.target.value = ''
}

// 打开页面设置
function openPageSettings() {
  // 清空选中状态，让右侧面板显示页面设置
  deselectComponent()
  showPageSettings.value = true
}

// 关闭页面设置
function closePageSettings() {
  showPageSettings.value = false
}
</script>

<template>
  <header class="toolbar">
    <!-- 左侧 Logo -->
    <div class="toolbar-left">
      <div class="logo">
        <span class="logo-icon">⚡</span>
        <span class="logo-text">可视化编辑器</span>
      </div>
    </div>

    <!-- 中间缩放控制 -->
    <div class="toolbar-center" v-show="!previewMode">
      <div class="zoom-control">
        <button class="zoom-action-btn" @click="zoomOut" title="缩小 (Ctrl+-)">
          -
        </button>
        <div class="zoom-slider-container">
          <input
            type="range"
            class="zoom-slider"
            :min="minZoom"
            :max="maxZoom"
            :step="0.05"
            v-model.number="zoomSlider"
            @input="handleSliderChange"
          />
          <span class="zoom-value">{{ Math.round(zoom * 100) }}%</span>
        </div>
        <button class="zoom-action-btn" @click="zoomIn" title="放大 (Ctrl++)">
          +
        </button>
        <button class="zoom-action-btn" @click="resetZoom" title="重置 (Ctrl+0)">
          100%
        </button>
        <button class="zoom-action-btn" @click="fitToScreen" title="适应屏幕">
          适应
        </button>
      </div>
    </div>

    <!-- 右侧操作按钮 -->
    <div class="toolbar-right">
      <!-- 撤销按钮 -->
      <button 
        class="btn" 
        @click="undo" 
        v-show="!previewMode"
        :disabled="!canUndoComputed"
        :class="{ disabled: !canUndoComputed }"
        title="撤销 (Ctrl+Z)"
      >
        ↩ 撤销
      </button>

      <!-- 重做按钮 -->
      <button 
        class="btn" 
        @click="redo" 
        v-show="!previewMode"
        :disabled="!canRedoComputed"
        :class="{ disabled: !canRedoComputed }"
        title="重做 (Shift+Z)"
      >
        ↪ 重做
      </button>

      <!-- 页面设置按钮 -->
      <button class="btn" @click="openPageSettings" v-show="!previewMode">
        页面设置
      </button>

      <!-- 辅助线下拉菜单 -->
      <div class="dropdown" v-show="!previewMode">
        <button 
          class="btn dropdown-toggle" 
          @click="showGuidesMenu = !showGuidesMenu"
          :class="{ active: guidesVisible }"
        >
          辅助线 ▼
        </button>
        <div class="dropdown-menu" v-show="showGuidesMenu">
          <button class="dropdown-item" @click="() => { toggleGuides(); showGuidesMenu = false }">
            {{ guidesVisible ? '隐藏辅助线' : '显示辅助线' }} (Ctrl+G)
          </button>
          <button class="dropdown-item" @click="() => { toggleSnap(); showGuidesMenu = false }">
            {{ snapEnabled ? '关闭吸附' : '开启吸附' }}
          </button>
          <div class="dropdown-divider"></div>
          <button class="dropdown-item" @click="addGuideAtCenter">
            ➕ 添加中心十字线
          </button>
          <button class="dropdown-item" @click="addGuideCircle">
            ○ 添加参考圆形
          </button>
          <button class="dropdown-item" @click="addGuideHorizontal">
            ─ 添加水平直线
          </button>
          <button class="dropdown-item" @click="addGuideVertical">
            │ 添加垂直直线
          </button>
          <button class="dropdown-item" @click="addGuideRotatableLine">
            ↗ 添加可旋转直线
          </button>
          <div class="dropdown-divider"></div>
          <button class="dropdown-item danger" @click="() => { clearGuides(); showGuidesMenu = false }">
            🗑 清空所有辅助线
          </button>
        </div>
      </div>

      <!-- 导入下拉菜单 -->
      <div class="dropdown" v-show="!previewMode">
        <button class="btn dropdown-toggle" @click="showImportMenu = !showImportMenu">
          导入 ▼
        </button>
        <div class="dropdown-menu" v-show="showImportMenu">
          <button class="dropdown-item" @click="() => { triggerPageImport(); showImportMenu = false }">
            导入页面
          </button>
          <button class="dropdown-item" @click="() => { triggerLayoutImport(); showImportMenu = false }">
            导入布局
          </button>
        </div>
      </div>

      <!-- 导出下拉菜单 -->
      <div class="dropdown" v-show="!previewMode">
        <button class="btn dropdown-toggle" @click="showExportMenu = !showExportMenu">
          导出 ▼
        </button>
        <div class="dropdown-menu" v-show="showExportMenu">
          <button class="dropdown-item" @click="() => { handleExportPageJSON(); showExportMenu = false }">
            导出页面
          </button>
          <button class="dropdown-item" @click="() => { handleExportLayoutJSON(); showExportMenu = false }">
            导出布局
          </button>
          
        </div>
      </div>

      <!-- 预览按钮 -->
      <button class="btn" @click="togglePreviewMode">
        {{ previewMode ? '退出预览' : '预览' }}
      </button>

      <!-- 导出按钮 -->
      <button class="btn btn-primary" @click="handleExport" v-show="!previewMode">
        导出 HTML
      </button>

      <!-- 导出Vue按钮 -->
      <button class="btn btn-secondary" @click="handleExportVue" v-show="!previewMode">
        导出 Vue
      </button>

      <!-- 隐藏的文件输入 -->
      <input
        ref="fileInput"
        type="file"
        accept=".json"
        style="display: none"
        @change="handleFileImport"
      />
    </div>
  </header>
</template>

<style scoped>
.toolbar {
  height: var(--toolbar-height);
  background-color: var(--color-bg-white);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  flex-shrink: 0;
}

.toolbar-left,
.toolbar-center,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
}

.logo-icon {
  font-size: 20px;
}

.zoom-control {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--color-bg);
  padding: 6px 12px;
  border-radius: var(--border-radius);
  border: 1px solid var(--color-border);
}

.zoom-action-btn {
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid var(--color-border);
  background-color: var(--color-bg-white);
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.zoom-action-btn:hover {
  background-color: var(--color-bg-hover);
  border-color: var(--color-primary);
}

.zoom-action-btn:active {
  transform: scale(0.95);
}

.zoom-slider-container {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 180px;
}

.zoom-slider {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  background: var(--color-border);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.zoom-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  background: var(--color-primary);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

.zoom-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.zoom-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  background: var(--color-primary);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

.zoom-slider::-moz-range-thumb:hover {
  transform: scale(1.2);
}

.zoom-value {
  min-width: 45px;
  text-align: right;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  font-family: 'Courier New', monospace;
}

.btn {
  min-width: 80px;
}

/* 下拉菜单样式 */
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-toggle {
  min-width: 90px;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  background-color: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 120px;
  overflow: hidden;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 8px 16px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  color: var(--color-text);
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: var(--color-bg-hover);
  color: var(--color-primary);
}

.dropdown-item.danger:hover {
  background-color: #fff2f0;
  color: #ff4d4f;
}

.dropdown-divider {
  height: 1px;
  background-color: var(--color-border);
  margin: 4px 0;
}

.dropdown-toggle.active {
  background-color: var(--color-primary);
  color: #fff;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-dialog {
  background-color: var(--color-bg-white);
  border-radius: var(--border-radius);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
  width: 500px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  padding: 0;
  line-height: 1;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 20px;
  border-top: 1px solid var(--color-border);
}

/* 表单样式 */
.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
}

.form-select,
.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  font-size: 14px;
  background-color: var(--color-bg-white);
  color: var(--color-text);
}

.form-select:focus,
.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-hint {
  margin-top: 16px;
  padding: 12px;
  background-color: var(--color-bg);
  border-radius: var(--border-radius);
  font-size: 13px;
  color: var(--color-text-secondary);
}

.form-hint p {
  margin: 4px 0;
}

/* 禁用按钮样式 */
.btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
</style>
