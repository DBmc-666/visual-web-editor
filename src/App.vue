<script setup>
import { computed } from 'vue'
import Toolbar from './components/layout/Toolbar.vue'
import Sidebar from './components/layout/Sidebar.vue'
import Canvas from './components/layout/Canvas.vue'
import PropertyPanel from './components/panels/PropertyPanel.vue'
import StatusBar from './components/layout/StatusBar.vue'
import FormDisplay from './components/FormDisplay.vue'
import { useEditor } from './stores/editor'
import { useCanvasInteraction } from './composables/useCanvasInteraction'

// 使用编辑器状态
const { previewMode, page } = useEditor()

// 启用键盘交互（Delete 删除组件，Escape 取消选择）
useCanvasInteraction()

// 是否显示属性面板
const showPropertyPanel = computed(() => !previewMode.value)
</script>

<template>
  <div class="app-container">
    <!-- 顶部工具栏 -->
    <Toolbar />

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 左侧组件列表 -->
      <Sidebar v-show="!previewMode" />

      <!-- 中间画布区域 -->
      <Canvas />

      <!-- 右侧属性面板 -->
      <PropertyPanel v-show="showPropertyPanel" />
    </div>

    <!-- 底部状态栏 -->
    <StatusBar />

    <!-- 表单显示组件 -->
    <FormDisplay :components="page.components" />
  </div>
</template>

<style scoped>
.app-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}
</style>
