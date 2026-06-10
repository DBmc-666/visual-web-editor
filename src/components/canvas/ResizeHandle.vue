<script setup>
import { ref } from 'vue'
import { useEditor } from '../../stores/editor'

const props = defineProps({
  component: {
    type: Object,
    required: true
  }
})

const { resizeComponent, moveComponent, saveResizeHistory, zoom } = useEditor()

// 8 个控制点的位置
const handles = [
  { position: 'nw', cursor: 'nw-resize', left: 0, top: 0 },
  { position: 'n', cursor: 'n-resize', left: '50%', top: 0 },
  { position: 'ne', cursor: 'ne-resize', left: '100%', top: 0 },
  { position: 'e', cursor: 'e-resize', left: '100%', top: '50%' },
  { position: 'se', cursor: 'se-resize', left: '100%', top: '100%' },
  { position: 's', cursor: 's-resize', left: '50%', top: '100%' },
  { position: 'sw', cursor: 'sw-resize', left: 0, top: '100%' },
  { position: 'w', cursor: 'w-resize', left: 0, top: '50%' }
]

// 拖拽状态
const isResizing = ref(false)
const currentHandle = ref(null)
const startX = ref(0)
const startY = ref(0)
const startWidth = ref(0)
const startHeight = ref(0)
const startLeft = ref(0)
const startTop = ref(0)

// 开始调整大小
function handleMouseDown(event, handle) {
  event.stopPropagation()
  event.preventDefault()

  // 保存历史记录（只在拉伸开始时保存一次）
  saveResizeHistory()

  isResizing.value = true
  currentHandle.value = handle.position
  startX.value = event.clientX
  startY.value = event.clientY
  startWidth.value = props.component.width
  startHeight.value = props.component.height
  startLeft.value = props.component.left
  startTop.value = props.component.top

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

// 调整大小中
function handleMouseMove(event) {
  if (!isResizing.value) return

  const deltaX = (event.clientX - startX.value) / zoom.value
  const deltaY = (event.clientY - startY.value) / zoom.value
  const handle = currentHandle.value

  let newWidth = startWidth.value
  let newHeight = startHeight.value
  let newLeft = startLeft.value
  let newTop = startTop.value

  // 根据控制点位置计算新尺寸和位置
  switch (handle) {
    case 'e':
      newWidth = startWidth.value + deltaX
      break
    case 'w':
      newWidth = startWidth.value - deltaX
      newLeft = startLeft.value + deltaX
      break
    case 's':
      newHeight = startHeight.value + deltaY
      break
    case 'n':
      newHeight = startHeight.value - deltaY
      newTop = startTop.value + deltaY
      break
    case 'se':
      newWidth = startWidth.value + deltaX
      newHeight = startHeight.value + deltaY
      break
    case 'sw':
      newWidth = startWidth.value - deltaX
      newHeight = startHeight.value + deltaY
      newLeft = startLeft.value + deltaX
      break
    case 'ne':
      newWidth = startWidth.value + deltaX
      newHeight = startHeight.value - deltaY
      newTop = startTop.value + deltaY
      break
    case 'nw':
      newWidth = startWidth.value - deltaX
      newHeight = startHeight.value - deltaY
      newLeft = startLeft.value + deltaX
      newTop = startTop.value + deltaY
      break
  }

  // 确保最小尺寸
  if (newWidth < 20) {
    newWidth = 20
    if (handle.includes('w')) {
      newLeft = startLeft.value + startWidth.value - 20
    }
  }
  if (newHeight < 20) {
    newHeight = 20
    if (handle.includes('n')) {
      newTop = startTop.value + startHeight.value - 20
    }
  }

  // 更新组件尺寸
  resizeComponent(props.component.id, newWidth, newHeight)

  // 如果是角控制点，同时更新位置
  if (['nw', 'sw', 'ne', 'se'].includes(handle)) {
    moveComponent(props.component.id, newLeft, newTop)
  }
}

// 结束调整
function handleMouseUp() {
  isResizing.value = false
  currentHandle.value = null
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}
</script>

<template>
  <div class="resize-handles">
    <div
      v-for="handle in handles"
      :key="handle.position"
      class="resize-handle"
      :style="{
        left: handle.left,
        top: handle.top,
        cursor: handle.cursor
      }"
      @mousedown="handleMouseDown($event, handle)"
    ></div>
  </div>
</template>

<style scoped>
.resize-handles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1001;
}

.resize-handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: var(--color-primary);
  border: 1px solid #ffffff;
  border-radius: 2px;
  pointer-events: auto;
  transform: translate(-50%, -50%);
}

.resize-handle:hover {
  background-color: #40a9ff;
  transform: translate(-50%, -50%) scale(1.2);
}
</style>
