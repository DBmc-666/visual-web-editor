<script setup>
import { useEditor, COMPONENT_TYPES } from '../../stores/editor'
import ComponentList from '../panels/ComponentList.vue'

// 侧边栏折叠状态
const collapsed = false
</script>

<template>
  <aside class="sidebar" :class="{ collapsed }">
    <div class="sidebar-content">
      <ComponentList />
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  background-color: var(--color-bg-white);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
  transition: width 0.3s;
}

.sidebar.collapsed {
  width: 48px;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}
</style>
