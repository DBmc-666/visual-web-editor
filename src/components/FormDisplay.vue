<script setup>
import { computed } from 'vue'
import { useFormDisplay, hideForm } from '../composables/useFormDisplay'
import FormWidget from './widgets/FormWidget.vue'

const { visibleFormId, displayMode, modalTitle, modalWidth } = useFormDisplay()

const props = defineProps({
  components: {
    type: Array,
    required: true
  }
})

// 获取当前显示的表单组件
const currentFormComponent = computed(() => {
  if (!visibleFormId.value) return null
  return props.components.find(comp => comp.id === visibleFormId.value)
})

// 检查是否显示弹窗
const showModal = computed(() => {
  return visibleFormId.value && displayMode.value === 'modal'
})

// 检查是否显示侧边滑出
const showSlide = computed(() => {
  return visibleFormId.value && displayMode.value === 'slide'
})

// 检查是否内联显示
const showInline = computed(() => {
  return visibleFormId.value && displayMode.value === 'inline'
})

// 关闭弹窗
function handleClose() {
  hideForm()
}

// 点击遮罩层关闭
function handleOverlayClick(event) {
  if (event.target === event.currentTarget) {
    handleClose()
  }
}
</script>

<template>
  <!-- 弹窗显示模式 -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="showModal" class="modal-overlay" @click="handleOverlayClick">
        <div class="modal-dialog" :style="{ width: modalWidth }">
          <div class="modal-header">
            <h3>{{ modalTitle || '表单' }}</h3>
            <button class="modal-close" @click="handleClose">×</button>
          </div>
          <div class="modal-body">
            <FormWidget v-if="currentFormComponent" :component="currentFormComponent" />
          </div>
        </div>
      </div>
    </Transition>

    <!-- 侧边滑出模式 -->
    <Transition name="slide">
      <div v-if="showSlide" class="slide-panel">
        <div class="slide-header">
          <h3>{{ modalTitle || '表单' }}</h3>
          <button class="slide-close" @click="handleClose">×</button>
        </div>
        <div class="slide-body">
          <FormWidget v-if="currentFormComponent" :component="currentFormComponent" />
        </div>
      </div>
    </Transition>

    <!-- 遮罩层（侧边滑出模式） -->
    <Transition name="fade">
      <div v-if="showSlide" class="slide-overlay" @click="handleClose"></div>
    </Transition>
  </Teleport>

  <!-- 内联显示模式（在画布中显示） -->
  <div v-if="showInline && currentFormComponent" class="inline-form-container">
    <div class="inline-form-header">
      <h3>{{ modalTitle || '表单' }}</h3>
      <button class="inline-close" @click="handleClose">×</button>
    </div>
    <div class="inline-form-body">
      <FormWidget :component="currentFormComponent" />
    </div>
  </div>
</template>

<style scoped>
/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-dialog {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e8e8e8;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  line-height: 1;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

/* 侧边滑出样式 */
.slide-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9998;
}

.slide-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 400px;
  background: white;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  display: flex;
  flex-direction: column;
}

.slide-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e8e8e8;
}

.slide-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.slide-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  line-height: 1;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slide-close:hover {
  color: #333;
}

.slide-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

/* 内联显示样式 */
.inline-form-container {
  border: 2px solid #1890ff;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 10px 0;
}

.inline-form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f0f9ff;
  border-bottom: 1px solid #bae7ff;
  border-radius: 6px 6px 0 0;
}

.inline-form-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #0050b3;
}

.inline-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #0050b3;
  line-height: 1;
  padding: 0;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.inline-close:hover {
  background: rgba(24, 144, 255, 0.1);
  border-radius: 4px;
}

.inline-form-body {
  padding: 16px;
}

/* 动画效果 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-dialog,
.modal-leave-active .modal-dialog {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-dialog,
.modal-leave-to .modal-dialog {
  transform: scale(0.9);
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>