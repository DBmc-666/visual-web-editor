<script setup>
import { ref, computed } from 'vue'
import { useEditor } from '../../stores/editor'
import CanvasItem from '../canvas/CanvasItem.vue'
import GuideLayer from '../canvas/GuideLayer.vue'

const {
  page,
  zoom,
  selectedId,
  previewMode,
  addComponent,
  deselectComponent,
  draggingType,
  setZoom
} = useEditor()

// 画布 ref
const canvasRef = ref(null)

// 计算画布样式
const canvasStyle = computed(() => ({
  width: `${page.width}px`,
  height: `${page.height}px`,
  backgroundColor: page.backgroundColor
}))

// 画布容器样式
const canvasContainerStyle = computed(() => ({
  transform: `scale(${zoom.value})`
}))

// 按层级排序组件
const sortedComponents = computed(() => {
  return [...page.components].sort((a, b) => (a.zIndex || 3) - (b.zIndex || 3))
})

// 处理拖拽悬停
function handleDragOver(event) {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'copy'
}

// 处理放置
function handleDrop(event) {
  event.preventDefault()
  const type = event.dataTransfer.getData('componentType')
  if (!type) return

  // 获取画布的 bounding rect
  const rect = canvasRef.value.getBoundingClientRect()
  // 计算放置位置（考虑缩放）
  const x = (event.clientX - rect.left) / zoom.value
  const y = (event.clientY - rect.top) / zoom.value

  // 添加到画布
  addComponent(type, { x, y })
}

// 点击画布空白处
function handleCanvasClick(event) {
  // 如果点击的是画布本身（非组件），则取消选择
  if (event.target === canvasRef.value || event.target.classList.contains('canvas-inner')) {
    deselectComponent()
  }
}

// 处理滚轮缩放
function handleWheel(event) {
  // 检查是否按住 Ctrl 键
  if (event.ctrlKey || event.metaKey) {
    event.preventDefault()
    
    // 计算缩放增量
    const delta = event.deltaY > 0 ? -0.1 : 0.1
    const newZoom = Math.max(0.1, Math.min(3, zoom.value + delta))
    
    setZoom(newZoom)
  }
}
</script>

<template>
  <main class="canvas-wrapper" @click="handleCanvasClick" @wheel="handleWheel">
    <div class="canvas-scaler" :style="canvasContainerStyle">
      <div
        ref="canvasRef"
        class="canvas"
        :class="{ 'preview-mode': previewMode }"
        :style="canvasStyle"
        @dragover="handleDragOver"
        @drop="handleDrop"
      >
        <div class="canvas-inner" :style="{ width: '100%', height: '100%', position: 'relative' }">
          <!-- 渲染所有组件（按层级排序） -->
          <CanvasItem
            v-for="component in sortedComponents"
            :key="component.id"
            :component="component"
            :selected="component.id === selectedId"
          />
        </div>

        <!-- 辅助线层 -->
        <GuideLayer />

        <!-- 空状态提示 -->
        <div v-if="page.components.length === 0" class="empty-state">
          <p>👈 从左侧拖拽组件到这里</p>
          <p class="empty-hint">或点击组件列表直接添加</p>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.canvas-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e5e5e5;
  overflow: auto;
  padding: 40px;
}

.canvas-scaler {
  transform-origin: center center;
}

.canvas {
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.canvas.preview-mode {
  box-shadow: none;
  overflow: auto;
}

.canvas-inner {
  position: absolute;
  top: 0;
  left: 0;
}

.empty-state {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #999;
  font-size: 16px;
  pointer-events: none;
}

.empty-hint {
  font-size: 13px;
  margin-top: 8px;
  color: #bbb;
}
</style>
