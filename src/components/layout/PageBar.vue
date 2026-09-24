<script setup>
import { computed } from 'vue'
import { useEditor } from '../../stores/editor'

const {
  canvases,
  pages,
  activeCanvasId,
  activePageId,
  activeCanvas,
  switchCanvas,
  addCanvas,
  renameCanvas,
  removeCanvas,
  switchPage,
  addPage,
  renamePage,
  removePage,
  duplicatePage
} = useEditor()

// 当前画布内所有页面的组件总数
const totalComponents = computed(() =>
  pages.value.reduce((sum, page) => sum + (page.components ? page.components.length : 0), 0)
)

// ---------------- 画布操作 ----------------

function handleCanvasChange(canvasId) {
  switchCanvas(canvasId)
}

function handleAddCanvas() {
  const name = prompt('新画布名称（画布之间完全独立）：', `画布 ${canvases.value.length + 1}`)
  if (name === null) return
  addCanvas(name.trim() || undefined)
}

function handleRenameCanvas() {
  const canvas = activeCanvas.value
  if (!canvas) return
  const name = prompt('重命名画布：', canvas.name)
  if (name === null) return
  renameCanvas(canvas.id, name)
}

function handleRemoveCanvas() {
  const canvas = activeCanvas.value
  if (!canvas || canvases.value.length <= 1) return
  const pageCount = canvas.pages.length
  if (!confirm(`确定删除画布「${canvas.name}」吗？\n其中 ${pageCount} 个页面将一并删除，且无法撤销。`)) return
  removeCanvas(canvas.id)
}

// ---------------- 页面操作 ----------------

function handleAddPage() {
  const name = prompt('新页面名称：', `页面 ${pages.value.length + 1}`)
  if (name === null) return
  addPage(name.trim() || undefined)
}

function handleRenamePage(page) {
  const name = prompt('重命名页面：', page.name)
  if (name === null) return
  renamePage(page.id, name)
}

function handleRemovePage(page) {
  if (pages.value.length <= 1) return
  if (!confirm(`确定删除页面「${page.name}」吗？该页面内容将一并删除，且无法撤销。`)) return
  removePage(page.id)
}

function handleDuplicatePage() {
  if (!activePageId.value) return
  duplicatePage(activePageId.value)
}
</script>

<template>
  <div class="page-bar">
    <!-- 画布切换 -->
    <div class="bar-group">
      <span class="bar-label">画布</span>
      <select
        class="canvas-select"
        :value="activeCanvasId"
        title="切换画布（各画布之间的页面与组件完全独立）"
        @change="handleCanvasChange($event.target.value)"
      >
        <option v-for="canvas in canvases" :key="canvas.id" :value="canvas.id">{{ canvas.name }}</option>
      </select>
      <button class="bar-btn" title="新建画布（独立空间）" @click="handleAddCanvas">＋</button>
      <button class="bar-btn" title="重命名当前画布" @click="handleRenameCanvas">✎</button>
      <button
        class="bar-btn danger"
        title="删除当前画布"
        :disabled="canvases.length <= 1"
        @click="handleRemoveCanvas"
      >🗑</button>
    </div>

    <div class="bar-divider"></div>

    <!-- 页面切换 -->
    <div class="bar-group pages-group">
      <span class="bar-label">页面</span>
      <div class="page-tabs">
        <div
          v-for="page in pages"
          :key="page.id"
          class="page-tab"
          :class="{ active: page.id === activePageId }"
          :title="`${page.name}（双击重命名）`"
          @click="switchPage(page.id)"
          @dblclick="handleRenamePage(page)"
        >
          <span class="page-tab-name">{{ page.name }}</span>
          <span
            v-if="pages.length > 1"
            class="page-tab-close"
            title="删除该页面"
            @click.stop="handleRemovePage(page)"
          >×</span>
        </div>
      </div>
      <button class="bar-btn" title="新建页面" @click="handleAddPage">＋ 页面</button>
      <button class="bar-btn" title="复制当前页面（含全部组件）" @click="handleDuplicatePage">⧉ 复制</button>
    </div>

    <div class="bar-info">
      {{ pages.length }} 个页面 · 共 {{ totalComponents }} 个组件
    </div>
  </div>
</template>

<style scoped>
.page-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 38px;
  padding: 0 12px;
  background-color: var(--color-bg-white);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
  overflow-x: auto;
}

.bar-group {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.pages-group {
  min-width: 0;
  flex: 1;
}

.bar-label {
  font-size: 12px;
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.canvas-select {
  max-width: 140px;
  padding: 4px 6px;
  font-size: 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  background-color: var(--color-bg-white);
  color: var(--color-text);
  outline: none;
}

.canvas-select:focus {
  border-color: var(--color-primary);
}

.bar-btn {
  padding: 4px 8px;
  font-size: 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  background-color: var(--color-bg-white);
  color: var(--color-text);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.bar-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background-color: #e6f7ff;
}

.bar-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.bar-btn.danger:hover:not(:disabled) {
  border-color: var(--color-danger);
  color: var(--color-danger);
  background-color: #fff2f0;
}

.bar-divider {
  width: 1px;
  height: 18px;
  background-color: var(--color-border);
  flex-shrink: 0;
}

.page-tabs {
  display: flex;
  align-items: center;
  gap: 4px;
  overflow-x: auto;
  padding-bottom: 2px;
  min-width: 0;
}

.page-tab {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  font-size: 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  background-color: var(--color-bg);
  color: var(--color-text);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  user-select: none;
}

.page-tab:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.page-tab.active {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: #ffffff;
}

.page-tab-close {
  font-size: 13px;
  line-height: 1;
  opacity: 0.6;
  border-radius: 3px;
  padding: 0 2px;
}

.page-tab-close:hover {
  opacity: 1;
  background-color: rgba(255, 255, 255, 0.25);
}

.page-tab:not(.active) .page-tab-close:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.bar-info {
  margin-left: auto;
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  flex-shrink: 0;
}
</style>
