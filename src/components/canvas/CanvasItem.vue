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
import DividerWidget from '../widgets/DividerWidget.vue'
import IconWidget from '../widgets/IconWidget.vue'
import ListWidget from '../widgets/ListWidget.vue'
import TableWidget from '../widgets/TableWidget.vue'
import VideoWidget from '../widgets/VideoWidget.vue'
import CarouselWidget from '../widgets/CarouselWidget.vue'
import ProgressWidget from '../widgets/ProgressWidget.vue'
import AccordionWidget from '../widgets/AccordionWidget.vue'
import BadgeWidget from '../widgets/BadgeWidget.vue'
import StatWidget from '../widgets/StatWidget.vue'

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
  selectComponentWithChildren,
  moveComponent, 
  moveComponents,
  getChildrenInsideComponent,
  previewMode, 
  updateComponentProps,
  saveMoveHistory,
  selectedIds,
  draggingId,
  setDraggingId,
  clearDraggingId,
  hoveredId
} = useEditor()

// 计算阴影样式
function getShadowStyle(style) {
  const x = style?.shadowX || 0
  const y = style?.shadowY || 0
  const blur = style?.shadowBlur || 0
  const color = style?.shadowColor || 'rgba(0,0,0,0)'
  if (blur === 0 && x === 0 && y === 0) return 'none'
  return `${withUnit(x)} ${withUnit(y)} ${withUnit(blur)} ${color}`
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

// 单位感知的尺寸格式化：数字追加'px'，带单位或含空格的字符串原样保留
function withUnit(value, unit = 'px') {
  if (value === undefined || value === null || value === '') return ''
  const str = String(value)
  if (/[a-zA-Z%]/.test(str) || str.includes(' ')) return str
  return `${str}${unit}`
}

// 计算内边距样式
function getPaddingStyle(style) {
  if (style?.paddingTop || style?.paddingBottom || style?.paddingLeft || style?.paddingRight) {
    return `${withUnit(style.paddingTop || style.padding || 0)} ${withUnit(style.paddingRight || style.padding || 0)} ${withUnit(style.paddingBottom || style.padding || 0)} ${withUnit(style.paddingLeft || style.padding || 0)}`
  }
  return withUnit(style?.padding || 0)
}

// 计算组件背景样式
function getBackgroundStyle(style) {
  const bgType = style?.backgroundType || 'solid'
  
  switch (bgType) {
    case 'gradient-linear':
      const angle = style?.backgroundGradientAngle || 180
      const startColor = style?.backgroundGradientStart || '#ffffff'
      const endColor = style?.backgroundGradientEnd || '#f5f5f5'
      return {
        backgroundImage: `linear-gradient(${angle}deg, ${startColor}, ${endColor})`
      }
    case 'gradient-radial':
      const radialStart = style?.backgroundGradientStart || '#ffffff'
      const radialEnd = style?.backgroundGradientEnd || '#f5f5f5'
      return {
        backgroundImage: `radial-gradient(circle, ${radialStart}, ${radialEnd})`
      }
    case 'solid':
    default:
      return {
        backgroundColor: style?.backgroundColor || 'transparent'
      }
  }
}

// 组件样式
const componentStyle = computed(() => {
  const style = props.component.style || {}
  const bgStyle = getBackgroundStyle(style)
  
  return {
    position: 'absolute',
    left: `${props.component.left}px`,
    top: `${props.component.top}px`,
    width: `${props.component.width}px`,
    height: `${props.component.height}px`,
    // 层级
    zIndex: props.component.zIndex || 3,
    // 背景和透明度
    ...bgStyle,
    opacity: style.opacity || 1,
    // 边框
    border: getBorderStyle(style),
    borderRadius: style.borderRadius ? withUnit(style.borderRadius) : 0,
    // 内边距
    padding: getPaddingStyle(style),
    // 阴影
    boxShadow: getShadowStyle(style),
    // 旋转
    transform: style.rotate ? `rotate(${withUnit(style.rotate, 'deg')})` : 'none',
    // 文字样式（datetime组件由内部自己计算字体大小）
    fontSize: props.component.type === 'datetime' ? undefined : (style.fontSize ? withUnit(style.fontSize) : undefined),
    color: style.color || undefined,
    fontWeight: style.fontWeight || undefined,
    lineHeight: style.lineHeight || undefined,
    letterSpacing: style.letterSpacing ? withUnit(style.letterSpacing) : undefined,
    textDecoration: style.textDecoration || undefined,
    textTransform: style.textTransform || undefined,
    // 文本换行处理，确保预览和生成的网页一致
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word'
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
  tabs: TabsWidget,
  // 内容组件（扩展）
  divider: DividerWidget,
  icon: IconWidget,
  list: ListWidget,
  table: TableWidget,
  video: VideoWidget,
  carousel: CarouselWidget,
  // 展示组件（扩展）
  progress: ProgressWidget,
  accordion: AccordionWidget,
  badge: BadgeWidget,
  stat: StatWidget
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

// 选中组件及其内部包含的所有组件（与画布单击容器的行为一致）
// 这里对 store 的组合动作做一次存在性回退：热更新不同步时（组件实例已更新但 store 模块未同步，
// 或反之）直接调用会抛异常，导致选中与拖拽同时失效，回退到基础 API 可保证功能可用
function selectWithChildren(id) {
  if (typeof selectComponentWithChildren === 'function') {
    selectComponentWithChildren(id)
    return
  }
  console.warn('[CanvasItem] selectComponentWithChildren 不可用，已回退到基础 API；如持续出现请刷新页面')
  const children = getChildrenInsideComponent(id)
  selectComponents([id, ...children.map(c => c.id)])
}

// 开始拖拽
function handleMouseDown(event) {
  if (previewMode.value) return
  if (event.button !== 0) return
  // 锁定的组件不允许在画布上拖动（可通过图层面板解锁）
  if (props.component.locked) return

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
    // 正常情况：选中组件及其内部包含的组件（与单击行为一致）
    selectWithChildren(props.component.id)
    const children = getChildrenInsideComponent(props.component.id)
    const allIds = [props.component.id, ...children.map(c => c.id)]
    originalPositions.value = {}
    allIds.forEach(id => {
      const comp = children.find(c => c.id === id) || props.component
      originalPositions.value[id] = { left: comp.left, top: comp.top }
    })
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
    // 选中组件及其内部包含的所有组件（与画布单击容器的行为一致）
    selectWithChildren(props.component.id)
    return
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
  if (props.component.locked) return
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
    v-if="component.visible !== false"
    class="canvas-item"
    :class="{ selected, dragging: isDragging, editing: isEditing, locked: component.locked, hovered: hoveredId === component.id }"
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

    <!-- 选中边框和调整手柄（锁定组件不显示手柄） -->
    <template v-if="(!previewMode && !isEditing) && (props.component.id === draggingId || (selected && !draggingId))">
      <div class="selection-border" :class="{ 'locked-border': component.locked }"></div>
      <ResizeHandle v-if="!component.locked" :component="component" />
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

/* 锁定：不可拖动 */
.canvas-item.locked {
  cursor: not-allowed;
}

/* 图层面板 hover 联动高亮 */
.canvas-item.hovered {
  outline: 1px dashed var(--color-primary);
  outline-offset: 1px;
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

/* 锁定组件的选中边框用虚线区分 */
.selection-border.locked-border {
  border-style: dashed;
  border-color: var(--color-warning);
}
</style>
