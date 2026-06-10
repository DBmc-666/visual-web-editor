import { onMounted, onUnmounted } from 'vue'
import { useEditor } from '../stores/editor'

/**
 * 画布交互钩子
 * 处理键盘事件等
 */
export function useCanvasInteraction() {
  const { selectedId, removeComponent, deselectComponent } = useEditor()

  // 处理键盘事件
  function handleKeyDown(event) {
    // Delete 或 Backspace 删除选中的组件
    if ((event.key === 'Delete' || event.key === 'Backspace') && selectedId.value) {
      // 防止在输入框中触发
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return
      }
      event.preventDefault()
      removeComponent(selectedId.value)
    }

    // Escape 取消选择
    if (event.key === 'Escape') {
      deselectComponent()
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })
}
