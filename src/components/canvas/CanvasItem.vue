<script setup>
import { ref, computed, nextTick } from 'vue'
import { useEditor } from '../../stores/editor'
import ResizeHandle from './ResizeHandle.vue'
import TextWidget from '../widgets/TextWidget.vue'
import ImageWidget from '../widgets/ImageWidget.vue'
import ButtonWidget from '../widgets/ButtonWidget.vue'
import ContainerWidget from '../widgets/ContainerWidget.vue'
import LinkWidget from '../widgets/LinkWidget.vue'
import DateTimeWidget from '../widgets/DateTimeWidget.vue'
import FormWidget from '../widgets/FormWidget.vue'
import NavMenuWidget from '../widgets/NavMenuWidget.vue'
import BreadcrumbWidget from '../widgets/BreadcrumbWidget.vue'
import TabsWidget from '../widgets/TabsWidget.vue'

const props = defineProps({
  component: {
    type: Object,
    required: true
  },
  selected: {
    type: Boolean,
    default: false
  }
})

const { 
  selectComponent, 
  selectComponents,
  moveComponent, 
  moveComponents,
  getChildrenInsideComponent,
  previewMode, 
  updateComponentProps,
  saveMoveHistory,
  selectedIds,
  draggingId,
  setDraggingId,
  clearDraggingId
} = useEditor()

// 计算阴影样式
function getShadowStyle(style) {
  const x = style?.shadowX || 0
  const y = style?.shadowY || 0
  const blur = style?.shadowBlur || 0
  const color = style?.shadowColor || 'rgba(0,0,0,0)'
  if (blur === 0 && x === 0 && y === 0) return 'none'
  return `${x}px ${y}px ${blur}px ${color}`
}

// 计算边框样式
function getBorderStyle(style) {
  const width = style?.borderWidth || 0
  const color = style?.borderColor || '#000000'
  const borderStyle = style?.borderStyle || 'none'
  // 处理 NaN 情况，确保边框能被正确删除
  if (width === 0 || borderStyle === 'none' || isNaN(width)) return 'none'
  return `${width}px ${borderStyle} ${color}`
}

// 计算内边距样式
function getPaddingStyle(style) {
  if (style?.paddingTop || style?.paddingBottom || style?.paddingLeft || style?.paddingRight) {
    return `${style.paddingTop || style.padding || 0}px ${style.paddingRight || style.padding || 0}px ${style.paddingBottom || style.padding || 0}px ${style.paddingLeft || style.padding || 0}px`
  }
  return `${style?.padding || 0}px`
}

// 组件样式
const componentStyle = computed(() => {
  const style = props.component.style || {}
  
  return {
    position: 'absolute',
    left: `${props.component.left}px`,
    top: `${props.component.top}px`,
    width: `${props.component.width}px`,
    height: `${props.component.height}px`,
    // 层级
    zIndex: props.component.zIndex || 3,
    // 背景和透明度
    backgroundColor: style.backgroundColor || 'transparent',
    opacity: style.opacity || 1,
    // 边框
    border: getBorderStyle(style),
    borderRadius: style.borderRadius ? `${style.borderRadius}px` : 0,
    // 内边距
    padding: getPaddingStyle(style),
    // 阴影
    boxShadow: getShadowStyle(style),
    // 旋转
    transform: style.rotate ? `rotate(${style.rotate}deg)` : 'none',
    // 文字样式
    fontSize: style.fontSize ? `${style.fontSize}px` : undefined,
    color: style.color || undefined,
    fontWeight: style.fontWeight || undefined,
    lineHeight: style.lineHeight || undefined,
    letterSpacing: style.letterSpacing ? `${style.letterSpacing}px` : undefined,
    textDecoration: style.textDecoration || undefined,
    textTransform: style.textTransform || undefined
  }
})

// 组件类型到组件的映射
const widgetMap = {
  text: TextWidget,
  image: ImageWidget,
  button: ButtonWidget,
  container: ContainerWidget,
  link: LinkWidget,
  datetime: DateTimeWidget,
  // 预设表单
  loginForm: FormWidget,
  registerForm: FormWidget,
  contactForm: FormWidget,
  searchForm: FormWidget,
  commentForm: FormWidget,
  customForm: FormWidget,
  // 导航组件
  navMenu: NavMenuWidget,
  breadcrumb: BreadcrumbWidget,
  tabs: TabsWidget
}

// 当前组件的 Widget
const CurrentWidget = computed(() => widgetMap[props.component.type])

// 拖拽相关
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)
const startLeft = ref(0)
const startTop = ref(0)
const originalLeft = ref(0)
const originalTop = ref(0)
const originalPositions = ref({})
const isCtrlDragging = ref(false) // 记录是否按Ctrl拖拽

// 开始拖拽
function handleMouseDown(event) {
  if (previewMode.value) return
  if (event.button !== 0) return

  event.stopPropagation()

  const multiSelect = event.ctrlKey || event.metaKey
  isCtrlDragging.value = multiSelect // 记录Ctrl状态
  
  isDragging.value = true
  dragStartX.value = event.clientX
  dragStartY.value = event.clientY
  startLeft.value = props.component.left
  startTop.value = props.component.top
  originalLeft.value = props.component.left
  originalTop.value = props.component.top
  
  // 设置当前拖拽的组件 ID
  setDraggingId(props.component.id)
  
  // 如果按了Ctrl，不改变选中状态，只移动当前组件
  if (multiSelect) {
    // 不调用 selectComponent，保持现有选中状态
    originalPositions.value = {
      [props.component.id]: { left: props.component.left, top: props.component.top }
    }
  } else {
    // 正常情况：选择组件及其子组件
    selectComponent(props.component.id, false)
    const children = getChildrenInsideComponent(props.component.id)
    if (children.length > 0) {
      const allChildren = children.map(c => c.id)
      const allIds = [props.component.id, ...allChildren]
      selectComponents(allIds)
      originalPositions.value = {}
      allIds.forEach(id => {
        const comp = children.find(c => c.id === id) || props.component
        originalPositions.value[id] = { left: comp.left, top: comp.top }
      })
    } else {
      originalPositions.value = {
        [props.component.id]: { left: props.component.left, top: props.component.top }
      }
    }
  }

  saveMoveHistory()

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

// 拖拽中
function handleMouseMove(event) {
  if (!isDragging.value) return

  const { zoom } = useEditor()
  const deltaX = (event.clientX - dragStartX.value) / zoom.value
  const deltaY = (event.clientY - dragStartY.value) / zoom.value

  // 如果是Ctrl拖拽，只移动当前组件
  if (isCtrlDragging.value) {
    moveComponent(
      props.component.id,
      originalLeft.value + deltaX,
      originalTop.value + deltaY,
      originalLeft.value,
      originalTop.value
    )
  } else {
    const currentIds = [...selectedIds.value]
    if (currentIds.length > 1) {
      moveComponents(currentIds, deltaX, deltaY, originalPositions.value)
    } else {
      moveComponent(
        props.component.id,
        startLeft.value + deltaX,
        startTop.value + deltaY,
        originalLeft.value,
        originalTop.value
      )
    }
  }
}

// 结束拖拽
function handleMouseUp() {
  isDragging.value = false
  isCtrlDragging.value = false
  clearDraggingId()
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}

// 点击组件
function handleClick(event) {
  if (!previewMode.value) {
    const linkTypes = ['link']
    if (linkTypes.includes(props.component.type)) {
      event.preventDefault()
    }
  }
  event.stopPropagation()
  
  const multiSelect = event.ctrlKey || event.metaKey
  
  if (!multiSelect) {
    const children = getChildrenInsideComponent(props.component.id)
    if (children.length > 0) {
      const allIds = [props.component.id, ...children.map(c => c.id)]
      selectComponents(allIds)
      return
    }
  }
  
  selectComponent(props.component.id, multiSelect)
}

// 双击编辑 - 支持文本、按钮、链接组件
const isEditing = ref(false)
const editInput = ref(null)
const editValue = ref('')

// 可编辑的组件类型
const editableTypes = ['text', 'button', 'link']

// 双击进入编辑模式
function handleDoubleClick(event) {
  if (previewMode.value) return
  if (!editableTypes.includes(props.component.type)) return

  event.stopPropagation()
  selectComponent(props.component.id)

  isEditing.value = true

  // 设置编辑值
  if (props.component.type === 'text') {
    editValue.value = props.component.props?.content || ''
  } else if (props.component.type === 'button') {
    editValue.value = props.component.props?.content || '按钮'
  } else if (props.component.type === 'link') {
    editValue.value = props.component.props?.content || '链接'
  }

  // 等待 DOM 更新后聚焦输入框
  nextTick(() => {
    if (editInput.value) {
      editInput.value.focus()
      editInput.value.select()
    }
  })
}

// 完成编辑
function finishEdit() {
  if (!isEditing.value) return

  isEditing.value = false

  // 更新组件内容
  if (props.component.type === 'text') {
    updateComponentProps(props.component.id, { content: editValue.value })
  } else if (props.component.type === 'button') {
    updateComponentProps(props.component.id, { content: editValue.value })
  } else if (props.component.type === 'link') {
    updateComponentProps(props.component.id, { content: editValue.value })
  }
}

// 取消编辑
function cancelEdit() {
  isEditing.value = false
}
</script>

<template>
  <div
    class="canvas-item"
    :class="{ selected, dragging: isDragging, editing: isEditing }"
    :style="componentStyle"
    @mousedown="handleMouseDown"
    @click="handleClick"
    @dblclick="handleDoubleClick"
  >
    <!-- 编辑模式 -->
    <template v-if="isEditing">
      <textarea
        ref="editInput"
        v-model="editValue"
        class="edit-input"
        :style="{
          width: '100%',
          height: '100%',
          resize: 'none',
          fontSize: componentStyle.fontSize,
          color: componentStyle.color,
          fontWeight: componentStyle.fontWeight,
          lineHeight: componentStyle.lineHeight,
          textAlign: component.props?.textAlign || 'left'
        }"
        @blur="finishEdit"
        @keydown.enter.ctrl="finishEdit"
        @keydown.escape="cancelEdit"
      ></textarea>
    </template>

    <!-- 正常显示 -->
    <template v-else>
      <component :is="CurrentWidget" :component="component" :preview-mode="previewMode" />
    </template>

    <!-- 选中边框和调整手柄 -->
    <template v-if="(!previewMode && !isEditing) && (props.component.id === draggingId || (selected && !draggingId))">
      <div class="selection-border"></div>
      <ResizeHandle :component="component" />
    </template>
  </div>
</template>

<style scoped>
.canvas-item {
  cursor: move;
  user-select: none;
  overflow: hidden;
}

.canvas-item.dragging {
  cursor: grabbing;
  opacity: 0.8;
  z-index: 1000;
}

.canvas-item.editing {
  cursor: text;
}

.edit-input {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  padding: 0;
  margin: 0;
  font-family: inherit;
  box-sizing: border-box;
  overflow: hidden;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.selection-border {
  position: absolute;
  top: -1px;
  left: -1px;
  right: -1px;
  bottom: -1px;
  border: 2px solid var(--color-primary);
  pointer-events: none;
  z-index: 1000;
}
</style>
