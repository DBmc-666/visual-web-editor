<script setup>
import { useEditor } from '../../stores/editor'

const { page, componentCount, selectedComponent, draftRestored, draftSaving, draftSavedAt } = useEditor()

// 格式化保存时间
function formatSavedAt(timestamp) {
  if (!timestamp) return ''
  const d = new Date(timestamp)
  const pad = n => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}
</script>

<template>
  <footer class="status-bar">
    <div class="status-left">
      <span class="status-item">
        画布尺寸: {{ page.width }} × {{ page.height }}
      </span>
      <span class="status-divider">|</span>
      <span class="status-item">
        组件数量: {{ componentCount }}
      </span>
      <span v-if="draftRestored" class="status-item draft-restored">
        ↺ 已从草稿恢复
      </span>
    </div>
    <div class="status-right">
      <span v-if="selectedComponent" class="status-item selected-info">
        选中: {{ selectedComponent.name }}
      </span>
      <span class="status-item save-status">
        <span class="save-dot" :class="{ saving: draftSaving }"></span>
        {{ draftSaving ? '保存中...' : (draftSavedAt ? `已自动保存 ${formatSavedAt(draftSavedAt)}` : '') }}
      </span>
    </div>
  </footer>
</template>

<style scoped>
.status-bar {
  height: var(--statusbar-height);
  background-color: var(--color-bg-white);
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  font-size: 12px;
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.status-left,
.status-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-divider {
  color: var(--color-border);
}

.selected-info {
  color: var(--color-primary);
}

.draft-restored {
  color: #52c41a;
}

.save-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.save-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #52c41a;
  transition: background-color 0.2s;
}

.save-dot.saving {
  background-color: #faad14;
  animation: save-pulse 0.8s ease-in-out infinite;
}

@keyframes save-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
</style>
