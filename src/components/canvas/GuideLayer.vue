<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useEditor } from '../../stores/editor'

const { guidesList, guidesVisible, selectedGuideId, selectGuide, deleteGuide, updateGuide, page } = useEditor()

// 拖拽状态
const isDragging = ref(false)
const dragGuideId = ref(null)
const dragStartPos = ref({ x: 0, y: 0 })
const dragGuideStartPos = ref({ x: 0, y: 0 })

// 旋转状态
const isRotating = ref(false)
const rotateGuideId = ref(null)
const rotateStartAngle = ref(0)
const rotateGuideStartRotation = ref(0)

// 拉伸状态
const isResizing = ref(false)
const resizeGuideId = ref(null)
const resizeHandle = ref('')
const resizeStartPos = ref({ x: 0, y: 0 })
const resizeGuideStart = ref({ x: 0, y: 0, radius: 0 })

// 计算辅助线样式
function getGuideStyle(guide) {
  if (!guide.visible) return { display: 'none' }
  
  const baseStyle = {
    position: 'absolute',
    pointerEvents: guide.locked ? 'none' : 'auto',
    cursor: guide.locked ? 'default' : (isDragging.value ? 'grabbing' : 'grab'),
    transition: isDragging.value || isResizing.value ? 'none' : 'opacity 0.2s'
  }
  
  switch (guide.type) {
    case 'line':
      if (guide.orientation === 'horizontal') {
        return {
          ...baseStyle,
          backgroundColor: guide.color || '#ff4d4f',
          width: page.width + 'px',
          height: '2px',
          left: '0px',
          top: guide.y1 + 'px'
        }
      } else if (guide.orientation === 'vertical') {
        return {
          ...baseStyle,
          backgroundColor: guide.color || '#ff4d4f',
          width: '2px',
          height: page.height + 'px',
          left: guide.x1 + 'px',
          top: '0px'
        }
      } else if (guide.orientation === 'rotatable') {
        // 可旋转直线使用 SVG 路径
        return {
          display: 'none' // 使用 SVG 渲染
        }
      }
      break
    case 'circle':
      return {
        ...baseStyle,
        border: `2px dashed ${guide.color || '#52c41a'}`,
        backgroundColor: 'transparent',
        width: guide.radius * 2 + 'px',
        height: guide.radius * 2 + 'px',
        left: (guide.x - guide.radius) + 'px',
        top: (guide.y - guide.radius) + 'px',
        borderRadius: '50%'
      }
    default:
      return baseStyle
  }
}

// 判断是否选中
function isSelected(guide) {
  return selectedGuideId.value === guide.id
}

// 是否可以拉伸（只有圆形可以拉伸）
function canResize(guide) {
  return guide.type === 'circle'
}

// 是否可以旋转（只有可旋转直线可以旋转）
function canRotate(guide) {
  return guide.type === 'line' && guide.orientation === 'rotatable'
}

// 获取可旋转直线样式
function getRotatableLineStyle(guide) {
  if (!guide.visible) return { display: 'none' }
  
  return {
    position: 'absolute',
    left: '0px',
    top: '0px',
    width: page.width + 'px',
    height: page.height + 'px',
    pointerEvents: guide.locked ? 'none' : 'auto',
    cursor: guide.locked ? 'default' : (isDragging.value ? 'grabbing' : 'grab'),
    opacity: isSelected(guide) ? 1 : 0.8
  }
}

// 获取旋转控制点位置（跟随旋转）
function getRotateHandlePosition(guide) {
  if (!canRotate(guide)) return null
  
  const centerX = guide.centerX || (guide.x1 + (guide.x2 - guide.x1) / 2)
  const centerY = guide.centerY || (guide.y1 + (guide.y2 - guide.y1) / 2)
  const rotation = (guide.rotation || 0) * Math.PI / 180
  const handleOffset = 60 // 距离中心的距离
  
  // 计算旋转后的控制点位置
  const handleX = centerX + Math.sin(rotation) * handleOffset
  const handleY = centerY - Math.cos(rotation) * handleOffset
  
  return { x: handleX, y: handleY }
}

// 获取旋转控制点样式
function getRotateHandleStyle(guide) {
  const pos = getRotateHandlePosition(guide)
  if (!pos) return { display: 'none' }
  
  return {
    position: 'absolute',
    left: (pos.x - 6) + 'px',
    top: (pos.y - 6) + 'px',
    width: '12px',
    height: '12px',
    backgroundColor: '#1890ff',
    border: '2px solid #fff',
    borderRadius: '50%',
    cursor: 'grab',
    zIndex: 10
  }
}

// 获取拉伸控制点位置
function getResizeHandles(guide) {
  if (!canResize(guide)) return []
  
  const handles = []
  const handleSize = 5 // 控制点半尺寸
  
  // 圆形只有右下角一个拉伸点（调整半径）
  const angle = 45 * Math.PI / 180
  handles.push({
    name: 'radius',
    x: guide.x + Math.cos(angle) * guide.radius - handleSize,
    y: guide.y + Math.sin(angle) * guide.radius - handleSize,
    cursor: 'nwse-resize'
  })
  
  return handles
}

// 获取拉伸控制点样式
function getResizeHandleStyle(handle) {
  return {
    position: 'absolute',
    left: handle.x + 'px',
    top: handle.y + 'px',
    width: '10px',
    height: '10px',
    backgroundColor: '#fff',
    border: '2px solid #1890ff',
    borderRadius: '2px',
    cursor: handle.cursor,
    zIndex: 11
  }
}

// 处理点击
function handleClick(event, guide) {
  if (guide.locked) {
    // 锁定辅助线点击时取消选中，但不阻止传播
    selectGuide(null)
    return
  }
  event.stopPropagation()
  selectGuide(guide.id)
}

// 处理删除
function handleDelete(event, guide) {
  if (guide.locked) return
  event.stopPropagation()
  deleteGuide(guide.id)
}

// 开始拖拽（锁定辅助线不可拖拽）
function handleDragStart(event, guide) {
  if (guide.locked) return
  event.preventDefault()
  event.stopPropagation()
  
  isDragging.value = true
  dragGuideId.value = guide.id
  dragStartPos.value = { x: event.clientX, y: event.clientY }
  
  if (guide.type === 'line') {
    if (guide.orientation === 'horizontal') {
      dragGuideStartPos.value = { x: 0, y: guide.y1 }
    } else if (guide.orientation === 'vertical') {
      dragGuideStartPos.value = { x: guide.x1, y: 0 }
    } else if (guide.orientation === 'rotatable') {
      // 可旋转直线保存中心点位置
      const centerX = guide.centerX || (guide.x1 + (guide.x2 - guide.x1) / 2)
      const centerY = guide.centerY || (guide.y1 + (guide.y2 - guide.y1) / 2)
      dragGuideStartPos.value = { x: centerX, y: centerY }
    }
  } else if (guide.type === 'circle') {
    dragGuideStartPos.value = {
      x: guide.x,
      y: guide.y
    }
  }
  
  selectGuide(guide.id)
}

// 开始旋转（锁定辅助线不可旋转）
function handleRotateStart(event, guide) {
  if (guide.locked) return
  event.preventDefault()
  event.stopPropagation()
  
  isRotating.value = true
  rotateGuideId.value = guide.id
  rotateGuideStartRotation.value = guide.rotation || 0
  
  // 计算初始角度（相对于形状中心）
  const centerX = guide.centerX || (guide.x1 + (guide.x2 - guide.x1) / 2)
  const centerY = guide.centerY || (guide.y1 + (guide.y2 - guide.y1) / 2)
  
  rotateStartAngle.value = Math.atan2(
    event.clientY - centerY,
    event.clientX - centerX
  ) * 180 / Math.PI
}

// 开始拉伸（锁定辅助线不可拉伸）
function handleResizeStart(event, guide, handleName) {
  if (guide.locked) return
  event.preventDefault()
  event.stopPropagation()
  
  isResizing.value = true
  resizeGuideId.value = guide.id
  resizeHandle.value = handleName
  resizeStartPos.value = { x: event.clientX, y: event.clientY }
  
  resizeGuideStart.value = {
    x: guide.x,
    y: guide.y,
    radius: guide.radius || 0
  }
  
  selectGuide(guide.id)
}

// 处理鼠标移动
function handleMouseMove(event) {
  if (isDragging.value) {
    const guide = guidesList.value.find(g => g.id === dragGuideId.value)
    if (!guide) return
    
    const deltaX = event.clientX - dragStartPos.value.x
    const deltaY = event.clientY - dragStartPos.value.y
    
    if (guide.type === 'line') {
      if (guide.orientation === 'horizontal') {
        // 更新水平直线的两个端点的 y 坐标
        const newY = guide.y1 + deltaY
        updateGuide(guide.id, { y1: newY, y2: newY })
      } else if (guide.orientation === 'vertical') {
        // 更新垂直直线的两个端点的 x 坐标
        const newX = guide.x1 + deltaX
        updateGuide(guide.id, { x1: newX, x2: newX })
      } else if (guide.orientation === 'rotatable') {
        // 可旋转直线整体移动
        const length = Math.sqrt(Math.pow(guide.x2 - guide.x1, 2) + Math.pow(guide.y2 - guide.y1, 2))
        updateGuide(guide.id, {
          x1: guide.x1 + deltaX,
          y1: guide.y1 + deltaY,
          x2: guide.x2 + deltaX,
          y2: guide.y2 + deltaY,
          centerX: (guide.centerX || (guide.x1 + (guide.x2 - guide.x1) / 2)) + deltaX,
          centerY: (guide.centerY || (guide.y1 + (guide.y2 - guide.y1) / 2)) + deltaY
        })
      }
    } else if (guide.type === 'circle') {
      updateGuide(guide.id, {
        x: guide.x + deltaX,
        y: guide.y + deltaY
      })
    }
    
    dragStartPos.value = { x: event.clientX, y: event.clientY }
  }
  
  // 处理旋转
  if (isRotating.value) {
    const guide = guidesList.value.find(g => g.id === rotateGuideId.value)
    if (!guide) return
    
    // 计算新角度
    const centerX = guide.centerX || (guide.x1 + (guide.x2 - guide.x1) / 2)
    const centerY = guide.centerY || (guide.y1 + (guide.y2 - guide.y1) / 2)
    
    const currentAngle = Math.atan2(
      event.clientY - centerY,
      event.clientX - centerX
    ) * 180 / Math.PI
    
    const deltaRotation = currentAngle - rotateStartAngle.value
    const newRotation = rotateGuideStartRotation.value + deltaRotation
    
    // 计算新的端点位置
    const length = Math.sqrt(Math.pow(guide.x2 - guide.x1, 2) + Math.pow(guide.y2 - guide.y1, 2))
    const halfLength = length / 2
    const angle = newRotation * Math.PI / 180
    
    const x1 = centerX - Math.cos(angle) * halfLength
    const y1 = centerY - Math.sin(angle) * halfLength
    const x2 = centerX + Math.cos(angle) * halfLength
    const y2 = centerY + Math.sin(angle) * halfLength
    
    updateGuide(guide.id, {
      x1,
      y1,
      x2,
      y2,
      rotation: newRotation
    })
  }
  
  if (isResizing.value) {
    const guide = guidesList.value.find(g => g.id === resizeGuideId.value)
    if (!guide) return
    
    const deltaX = event.clientX - resizeStartPos.value.x
    const deltaY = event.clientY - resizeStartPos.value.y
    
    // 圆形调整半径
    if (guide.type === 'circle') {
      const newRadius = Math.max(10, resizeGuideStart.value.radius + (deltaX + deltaY) / 2)
      updateGuide(guide.id, { radius: newRadius })
    }
  }
}

// 处理鼠标释放
function handleMouseUp() {
  isDragging.value = false
  dragGuideId.value = null
  
  isRotating.value = false
  rotateGuideId.value = null
  
  isResizing.value = false
  resizeGuideId.value = null
  resizeHandle.value = ''
}

// 监听全局鼠标事件
onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)
})
</script>

<template>
  <div v-show="guidesVisible" class="guides-layer">
    <!-- 渲染所有辅助线 -->
    <template v-for="guide in guidesList" :key="guide.id">
      <!-- 可旋转直线辅助线 -->
      <template v-if="guide.type === 'line' && guide.orientation === 'rotatable'">
        <svg
          class="guide-line guide-rotatable-line"
          :class="{ selected: isSelected(guide), locked: guide.locked }"
          :style="getRotatableLineStyle(guide)"
          @mousedown="handleDragStart($event, guide)"
          @click="handleClick($event, guide)"
          @contextmenu.prevent="handleDelete($event, guide)"
        >
          <line
            :x1="guide.x1"
            :y1="guide.y1"
            :x2="guide.x2"
            :y2="guide.y2"
            :stroke="guide.color || '#1890ff'"
            stroke-width="2"
          />
        </svg>
        
        <!-- 可旋转直线的旋转控制点 -->
        <template v-if="isSelected(guide) && !guide.locked">
          <div
            class="rotate-handle"
            :style="getRotateHandleStyle(guide)"
            @mousedown="handleRotateStart($event, guide)"
          ></div>
        </template>
      </template>
      
      <!-- 普通直线辅助线 -->
      <div
        v-else-if="guide.type === 'line'"
        class="guide-line"
        :class="{ selected: isSelected(guide), locked: guide.locked }"
        :style="getGuideStyle(guide)"
        @mousedown="handleDragStart($event, guide)"
        @click="handleClick($event, guide)"
        @contextmenu.prevent="handleDelete($event, guide)"
      ></div>
      
      <!-- 圆形辅助线 -->
      <div
        v-else-if="guide.type === 'circle'"
        class="guide-shape guide-circle"
        :class="{ selected: isSelected(guide), locked: guide.locked }"
        :style="getGuideStyle(guide)"
        @mousedown="handleDragStart($event, guide)"
        @click="handleClick($event, guide)"
        @contextmenu.prevent="handleDelete($event, guide)"
      ></div>
      
      <!-- 圆形的控制点（放在形状外部） -->
      <template v-if="guide.type === 'circle' && isSelected(guide) && !guide.locked">
        <div
          v-for="handle in getResizeHandles(guide)"
          :key="handle.name"
          class="resize-handle"
          :style="getResizeHandleStyle(handle)"
          @mousedown="handleResizeStart($event, guide, handle.name)"
        ></div>
      </template>
    </template>
  </div>
</template>

<style scoped>
.guides-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 100;
}

.guides-layer > * {
  pointer-events: auto;
}

.guide-line {
  opacity: 0.8;
  cursor: grab;
  position: relative;
}

.guide-line::before {
  content: '';
  position: absolute;
  top: -8px;
  left: 0;
  right: 0;
  bottom: -8px;
}

.guide-line:hover {
  opacity: 1;
}

.guide-line.selected {
  opacity: 1;
}

/* 只有普通直线（水平/垂直）才有背景色 */
.guide-line:not(.guide-rotatable-line).selected {
  background-color: #1890ff !important;
  box-shadow: 0 0 6px rgba(24, 144, 255, 0.6);
}

/* 锁定状态不拦截事件 */
.guide-line.locked::before {
  pointer-events: none;
}

.guide-line.locked {
  opacity: 0.5;
  cursor: default !important;
  pointer-events: none !important;
}

/* 可旋转直线的 SVG 样式 */
.guide-rotatable-line {
  background-color: transparent !important;
}

.guide-rotatable-line.selected {
  background-color: transparent !important;
  box-shadow: none !important;
}

.guide-shape {
  opacity: 0.8;
  box-sizing: border-box;
}

.guide-shape.selected {
  opacity: 1;
  box-shadow: 0 0 6px rgba(24, 144, 255, 0.6);
}

.guide-shape.locked {
  opacity: 0.5;
  cursor: default !important;
  pointer-events: none !important;
}

.resize-handle {
  position: absolute;
  pointer-events: auto;
}

.resize-handle:hover {
  background-color: #1890ff !important;
  transform: scale(1.3);
}
</style>