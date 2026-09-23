import { onMounted, onUnmounted } from 'vue'
import { useEditor } from '../stores/editor'

/**
 * 画布交互钩子
 * 统一处理画布相关的键盘快捷键（在输入框等编辑控件内不生效）
 *
 * 已支持：
 * - Delete / Backspace：删除选中组件（支持多选，一次撤销可恢复）
 * - Escape：取消选择
 * - Ctrl/Cmd + C / V / D：复制 / 粘贴 / 原地再制
 * - Ctrl/Cmd + A：全选
 * - Ctrl/Cmd + S：立即保存草稿
 * - 方向键：微调位置 1px（按住 Shift 为 10px）
 *
 * 注意：缩放、撤销/重做、辅助线等快捷键在 Toolbar 中处理
 */
export function useCanvasInteraction() {
  const {
    selectedId,
    previewMode,
    removeSelected,
    deselectComponent,
    copySelected,
    pasteClipboard,
    duplicateSelected,
    selectAll,
    nudgeSelected,
    savePageDraft
  } = useEditor()

  // 连续按方向键时只在首次记录历史，避免撤销栈被刷爆
  let lastNudgeAt = 0
  const NUDGE_HISTORY_INTERVAL = 600

  // 事件是否发生在可编辑控件内（此时不劫持快捷键）
  function isTypingContext(event) {
    const el = event.target
    if (!el) return false
    const tag = el.tagName
    return (
      tag === 'INPUT' ||
      tag === 'TEXTAREA' ||
      tag === 'SELECT' ||
      el.isContentEditable === true
    )
  }

  function handleKeyDown(event) {
    const isMod = event.ctrlKey || event.metaKey
    const key = event.key

    // Escape：任何时候都可以取消选择
    if (key === 'Escape') {
      deselectComponent()
      return
    }

    if (isTypingContext(event)) return

    // Ctrl/Cmd + S：保存草稿（同时拦截浏览器"保存网页"）
    if (isMod && (key === 's' || key === 'S')) {
      event.preventDefault()
      savePageDraft()
      return
    }

    // 预览模式下不再处理编辑类快捷键
    if (previewMode.value) return

    // Ctrl/Cmd + C：复制
    if (isMod && (key === 'c' || key === 'C')) {
      if (selectedId.value) {
        event.preventDefault()
        copySelected()
      }
      return
    }

    // Ctrl/Cmd + V：粘贴
    if (isMod && (key === 'v' || key === 'V')) {
      event.preventDefault()
      pasteClipboard()
      return
    }

    // Ctrl/Cmd + D：原地再制
    if (isMod && (key === 'd' || key === 'D')) {
      event.preventDefault()
      duplicateSelected()
      return
    }

    // Ctrl/Cmd + A：全选
    if (isMod && (key === 'a' || key === 'A')) {
      event.preventDefault()
      selectAll()
      return
    }

    // Delete / Backspace：删除选中组件
    if (key === 'Delete' || key === 'Backspace') {
      if (selectedId.value) {
        event.preventDefault()
        removeSelected()
      }
      return
    }

    // 方向键：微调位置
    const arrowMap = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1]
    }
    if (arrowMap[key]) {
      if (!selectedId.value) return
      event.preventDefault()
      const step = event.shiftKey ? 10 : 1
      const [dx, dy] = arrowMap[key]
      const now = Date.now()
      const recordHistory = now - lastNudgeAt > NUDGE_HISTORY_INTERVAL
      lastNudgeAt = now
      nudgeSelected(dx * step, dy * step, recordHistory)
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })
}
