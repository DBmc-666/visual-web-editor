<script setup>
import { useEditor } from '../../stores/editor'

const { page, componentCount, selectedComponent } = useEditor()
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
    </div>
    <div class="status-right">
      <span v-if="selectedComponent" class="status-item selected-info">
        选中: {{ selectedComponent.name }}
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
</style>
