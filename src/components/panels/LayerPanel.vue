<script setup>
import { ref, computed, nextTick } from 'vue'
import { useEditor } from '../../stores/editor'
import { buildLayerTree, computeParentIds, applySiblingReorder } from '../../utils/layerTree'

const {
  page,
  selectedIds,
  selectedId,
  selectComponent,
  selectComponentWithChildren,
  toggleComponentVisible,
  toggleComponentLocked,
  renameComponent,
  removeComponent,
  reorderComponents,
  moveComponentLayer,
  setHoveredId,
  getPaintOrderedComponents
} = useEditor()

// 组件类型图标
const TYPE_ICONS = {
  text: '文',
  image: '图',
  button: '钮',
  container: '块',
  link: '链',
  datetime: '时',
  loginForm: '登',
  registerForm: '注',
  contactForm: '联',
  searchForm: '搜',
  commentForm: '评',
  customForm: '单',
  navMenu: '导',
  breadcrumb: '面',
  tabs: '签',
  divider: '线',
  icon: '标',
  list: '列',
  table: '表',
  video: '视',
  carousel: '播',
  progress: '进',
  accordion: '折',
  badge: '签',
  stat: '计'
}

// 排序模式：'position' 按页面位置（从上往下、从大往小）| 'stack' 按叠放层级（最上层在前）
const sortMode = ref('position')

// 图层树：父子关系由几何包含关系自动推断（与布局修复共用 layerTree 模块）
const tree = computed(() => buildLayerTree(page.value?.components || [], { sortBy: sortMode.value }))
const parentIds = computed(() => computeParentIds(page.value?.components || []))

// 仅「按层级」模式下支持拖拽排序（按位置排序时顺序由坐标决定，拖拽无意义）
const dragEnabled = computed(() => sortMode.value === 'stack')

// 折叠状态（默认全部展开）
const collapsedIds = ref(new Set())

function toggleCollapse(id) {
  const next = new Set(collapsedIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  collapsedIds.value = next
}

function expandAll() {
  collapsedIds.value = new Set()
}

function collapseAll() {
  // 只折叠「有子节点」的容器
  const ids = []
  const walk = (nodes) => {
    for (const node of nodes) {
      if (node.children.length) {
        ids.push(node.comp.id)
        walk(node.children)
      }
    }
  }
  walk(tree.value.roots)
  collapsedIds.value = new Set(ids)
}

/**
 * 拍平成展示行，折叠的子树不展开
 * 每行记录 depth 与 parentId，供缩进与同级排序使用
 *
 * 展示顺序：
 * - 按位置：直接使用树的顺序（页面顶部在前，大块在前、子元素缩进跟随）
 * - 按层级：反转树的顺序（最上层在前）
 */
const rows = computed(() => {
  const out = []
  const walk = (nodes, depth, parentId) => {
    const ordered = sortMode.value === 'stack' ? [...nodes].reverse() : nodes
    for (const node of ordered) {
      const id = node.comp.id
      const hasChildren = node.children.length > 0
      out.push({ node, depth, parentId, hasChildren, childCount: node.children.length })
      if (hasChildren && !collapsedIds.value.has(id)) {
        walk(node.children, depth + 1, id)
      }
    }
  }
  walk(tree.value.roots, 0, null)
  return out
})

// ---------------- 选择 ----------------
function isSelected(id) {
  return selectedIds.value.includes(id)
}

function handleRowClick(event, id) {
  // Ctrl / Cmd 点击 = 多选
  selectComponent(id, event.ctrlKey || event.metaKey)
}

/**
 * 双击图层行：连同「它身上（内部包含）的所有组件」一起选中
 * 与在画布上单击容器的行为一致，便于整体移动 / 对齐 / 微调
 */
function handleRowDoubleClick(id) {
  selectComponentWithChildren(id)
}

// ---------------- 重命名 ----------------
const editingId = ref(null)
const editingName = ref('')
const renameInputs = ref([])

function startRename(comp) {
  editingId.value = comp.id
  editingName.value = comp.name || comp.type
  nextTick(() => {
    const el = Array.isArray(renameInputs.value) ? renameInputs.value[0] : renameInputs.value
    if (el && el.focus) {
      el.focus()
      el.select()
    }
  })
}

function finishRename() {
  if (editingId.value) {
    renameComponent(editingId.value, editingName.value)
  }
  editingId.value = null
}

// ---------------- 拖拽排序（仅限同级之间） ----------------
const draggingId = ref(null)
const dragOverRowId = ref(null)

function parentIdOf(id) {
  return parentIds.value.get(id) || null
}

function handleDragStart(event, id) {
  if (!dragEnabled.value) return
  draggingId.value = id
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', id)
}

function handleDragOver(event, row) {
  if (!dragEnabled.value || !draggingId.value) return
  // 父子关系由位置决定，拖拽只用于调整同一父容器内的叠放顺序
  if (parentIdOf(draggingId.value) !== row.parentId) return
  if (draggingId.value === row.node.comp.id) return
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
  dragOverRowId.value = row.node.comp.id
}

function handleDrop() {
  const fromId = draggingId.value
  const toId = dragOverRowId.value
  draggingId.value = null
  dragOverRowId.value = null

  if (!fromId || !toId || fromId === toId) return
  const parentId = parentIdOf(fromId)
  if (parentId !== parentIdOf(toId)) return

  // 同级序列（自底向顶）
  const siblingNodes = parentId
    ? (tree.value.nodeById.get(parentId)?.children || [])
    : tree.value.roots
  const bottomToTop = siblingNodes.map(n => n.comp.id)
  const display = [...bottomToTop].reverse()

  const fromIndex = display.indexOf(fromId)
  const toIndex = display.indexOf(toId)
  if (fromIndex === -1 || toIndex === -1) return

  const [moved] = display.splice(fromIndex, 1)
  display.splice(toIndex, 0, moved)
  const newBottomToTop = [...display].reverse()

  // 把新顺序填回它们在全局绘制顺序中占据的槽位，保持与非同级组件的相对关系
  const globalOrder = getPaintOrderedComponents().map(c => c.id)
  const newGlobalOrder = applySiblingReorder(globalOrder, bottomToTop, newBottomToTop)

  reorderComponents(newGlobalOrder)
}

function handleDragEnd() {
  draggingId.value = null
  dragOverRowId.value = null
}

// 显式删除（图层面板允许删除锁定组件）
function handleDelete(id) {
  removeComponent(id)
}
</script>

<template>
  <div class="layer-panel">
    <p class="list-hint">
      共 {{ page.components.length }} 个图层 · 子组件由位置自动判定（容器包住的组件即为其子层）
    </p>

    <div v-if="tree.roots.length > 0" class="layer-toolbar">
      <div class="sort-switch">
        <button
          class="sort-btn"
          :class="{ active: sortMode === 'position' }"
          title="按页面位置排列：从上往下、大块在前"
          @click="sortMode = 'position'"
        >按位置</button>
        <button
          class="sort-btn"
          :class="{ active: sortMode === 'stack' }"
          title="按叠放层级排列：最上层在前（此模式可拖拽排序）"
          @click="sortMode = 'stack'"
        >按层级</button>
      </div>
      <div class="layer-toolbar-row">
        <button class="layer-tool-btn" @click="expandAll">全部展开</button>
        <button class="layer-tool-btn" @click="collapseAll">全部折叠</button>
      </div>
    </div>

    <div v-if="rows.length === 0" class="empty-layers">
      画布还没有组件，先添加组件再管理图层
    </div>

    <div v-else class="layer-list" @dragend="handleDragEnd">
      <div
        v-for="row in rows"
        :key="row.node.comp.id"
        class="layer-row"
        :class="{
          selected: isSelected(row.node.comp.id),
          hidden: row.node.comp.visible === false,
          locked: row.node.comp.locked,
          parent: row.hasChildren,
          'drag-over': dragOverRowId === row.node.comp.id
        }"
        :style="{ paddingLeft: (4 + row.depth * 14) + 'px' }"
        :draggable="dragEnabled"
        @dragstart="handleDragStart($event, row.node.comp.id)"
        @dragover="handleDragOver($event, row)"
        @drop="handleDrop"
        @click="handleRowClick($event, row.node.comp.id)"
        @dblclick.stop="handleRowDoubleClick(row.node.comp.id)"
        @mouseenter="setHoveredId(row.node.comp.id)"
        @mouseleave="setHoveredId(null)"
      >
        <!-- 折叠开关 -->
        <span
          v-if="row.hasChildren"
          class="expand-toggle"
          :title="collapsedIds.has(row.node.comp.id) ? '展开子组件' : '折叠子组件'"
          @click.stop="toggleCollapse(row.node.comp.id)"
        >{{ collapsedIds.has(row.node.comp.id) ? '▸' : '▾' }}</span>
        <span v-else class="expand-placeholder"></span>

        <span
          v-if="dragEnabled"
          class="drag-grip"
          title="拖拽调整同级叠放顺序"
        >⋮⋮</span>
        <span class="layer-icon">{{ TYPE_ICONS[row.node.comp.type] || '□' }}</span>

        <input
          v-if="editingId === row.node.comp.id"
          ref="renameInputs"
          v-model="editingName"
          class="layer-name-input"
          @click.stop
          @dblclick.stop
          @keydown.enter="finishRename"
          @keydown.esc="editingId = null"
          @blur="finishRename"
        />
        <span
          v-else
          class="layer-name"
          :title="`${row.node.comp.name || row.node.comp.type}（双击可连同内部组件一起选中）`"
        >{{ row.node.comp.name || row.node.comp.type }}</span>

        <span v-if="row.childCount" class="child-count" :title="`包含 ${row.childCount} 个子组件`">
          {{ row.childCount }}
        </span>

        <span v-if="sortMode === 'stack'" class="layer-z" :title="`层级 ${row.node.comp.zIndex}`">
          {{ row.node.comp.zIndex }}
        </span>

        <button
          class="layer-btn"
          :title="row.node.comp.visible === false ? '显示' : '隐藏'"
          @click.stop="toggleComponentVisible(row.node.comp.id)"
        >{{ row.node.comp.visible === false ? '🚫' : '👁' }}</button>

        <button
          class="layer-btn"
          :title="row.node.comp.locked ? '解锁' : '锁定'"
          @click.stop="toggleComponentLocked(row.node.comp.id)"
        >{{ row.node.comp.locked ? '🔒' : '🔓' }}</button>

        <button
          class="layer-btn"
          title="重命名"
          @click.stop="startRename(row.node.comp)"
        >✎</button>

        <button class="layer-btn danger" title="删除" @click.stop="handleDelete(row.node.comp.id)">✕</button>
      </div>
    </div>

    <div class="layer-footer">
      <div class="layer-actions">
        <button class="layer-action-btn" :disabled="!selectedId" @click="moveComponentLayer(selectedId, 'top')">置顶</button>
        <button class="layer-action-btn" :disabled="!selectedId" @click="moveComponentLayer(selectedId, 'up')">上移</button>
        <button class="layer-action-btn" :disabled="!selectedId" @click="moveComponentLayer(selectedId, 'down')">下移</button>
        <button class="layer-action-btn" :disabled="!selectedId" @click="moveComponentLayer(selectedId, 'bottom')">置底</button>
      </div>
      <div class="layer-tip">
        <template v-if="sortMode === 'position'">
          单击选中单个组件，<b>双击连同它内部的组件一起选中</b>（同画布上单击容器）。<br>
          列表按页面位置排列；调整叠放顺序请用上方按钮，或切到「按层级」模式拖拽。
        </template>
        <template v-else>
          单击选中单个组件，<b>双击连同它内部的组件一起选中</b>。<br>
          拖拽仅在同级之间调整叠放顺序；把组件移出容器范围即可脱离分组。
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.layer-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.list-hint {
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.layer-toolbar {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.layer-toolbar-row {
  display: flex;
  gap: 6px;
}

.sort-switch {
  display: flex;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  overflow: hidden;
}

.sort-btn {
  flex: 1;
  padding: 4px 6px;
  font-size: 11px;
  border: none;
  background-color: var(--color-bg-white);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.sort-btn + .sort-btn {
  border-left: 1px solid var(--color-border);
}

.sort-btn:hover {
  color: var(--color-primary);
  background-color: #e6f7ff;
}

.sort-btn.active {
  background-color: var(--color-primary);
  color: #ffffff;
}

.layer-tool-btn {
  flex: 1;
  padding: 4px 6px;
  font-size: 11px;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  background-color: var(--color-bg-white);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.layer-tool-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background-color: #e6f7ff;
}

.empty-layers {
  padding: 24px 12px;
  text-align: center;
  font-size: 13px;
  color: var(--color-text-secondary);
  background-color: var(--color-bg);
  border-radius: var(--border-radius);
}

.layer-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.layer-row {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 4px 6px;
  border: 1px solid transparent;
  border-radius: var(--border-radius);
  cursor: pointer;
  user-select: none;
  transition: background-color 0.15s, border-color 0.15s;
}

.layer-row:hover {
  background-color: var(--color-bg-hover);
}

.layer-row.selected {
  background-color: #e6f7ff;
  border-color: var(--color-primary);
}

.layer-row.hidden {
  opacity: 0.5;
}

.layer-row.locked .layer-name {
  font-style: italic;
}

/* 容器（有子组件）用稍重的字重区分 */
.layer-row.parent .layer-name {
  font-weight: 600;
}

.layer-row.drag-over {
  border-top: 2px solid var(--color-primary);
}

.expand-toggle {
  flex-shrink: 0;
  width: 12px;
  text-align: center;
  font-size: 10px;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.expand-toggle:hover {
  color: var(--color-primary);
}

.expand-placeholder {
  flex-shrink: 0;
  width: 12px;
}

.drag-grip {
  flex-shrink: 0;
  font-size: 10px;
  color: #bbb;
  cursor: grab;
  letter-spacing: -2px;
}

.layer-icon {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  line-height: 18px;
  text-align: center;
  font-size: 11px;
  color: var(--color-text-secondary);
  background-color: var(--color-bg);
  border-radius: 3px;
}

.layer-name {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.layer-name-input {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  padding: 1px 4px;
  border: 1px solid var(--color-primary);
  border-radius: 3px;
  outline: none;
}

.child-count {
  flex-shrink: 0;
  min-width: 16px;
  padding: 0 4px;
  font-size: 10px;
  line-height: 15px;
  text-align: center;
  color: var(--color-primary);
  background-color: #e6f7ff;
  border-radius: 8px;
}

.layer-z {
  flex-shrink: 0;
  font-size: 10px;
  color: #aaa;
  font-family: 'Courier New', monospace;
  min-width: 14px;
  text-align: right;
}

.layer-btn {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  background: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 11px;
  line-height: 1;
  opacity: 0.75;
  transition: opacity 0.15s, background-color 0.15s;
}

.layer-btn:hover {
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.08);
}

.layer-btn.danger:hover {
  background-color: #fff2f0;
  color: var(--color-danger);
}

.layer-footer {
  margin-top: 4px;
  padding-top: 8px;
  border-top: 1px solid var(--color-border);
}

.layer-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
  margin-bottom: 6px;
}

.layer-action-btn {
  padding: 4px 2px;
  font-size: 11px;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  background-color: var(--color-bg-white);
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.2s;
}

.layer-action-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background-color: #e6f7ff;
}

.layer-action-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.layer-tip {
  font-size: 11px;
  color: var(--color-text-secondary);
  line-height: 1.6;
}
</style>
