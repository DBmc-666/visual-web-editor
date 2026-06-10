import { ref, computed } from 'vue'

// 表单显示状态
const visibleFormId = ref(null)
const displayMode = ref('modal') // modal, inline, slide
const modalTitle = ref('')
const modalWidth = ref('500px')

// 显示表单
export function showForm(formId, mode = 'modal', title = '', width = '500px') {
  visibleFormId.value = formId
  displayMode.value = mode
  modalTitle.value = title
  modalWidth.value = width
}

// 隐藏表单
export function hideForm() {
  visibleFormId.value = null
}

// 切换表单显示状态
export function toggleForm(formId, mode = 'modal', title = '', width = '500px') {
  if (visibleFormId.value === formId) {
    hideForm()
  } else {
    showForm(formId, mode, title, width)
  }
}

// 获取当前显示的表单ID
export function getVisibleFormId() {
  return visibleFormId.value
}

// 获取显示模式
export function getDisplayMode() {
  return displayMode.value
}

// 获取弹窗标题
export function getModalTitle() {
  return modalTitle.value
}

// 获取弹窗宽度
export function getModalWidth() {
  return modalWidth.value
}

// 检查表单是否可见
export function isFormVisible(formId) {
  return visibleFormId.value === formId
}

// 导出组合式函数
export function useFormDisplay() {
  return {
    visibleFormId: computed(() => visibleFormId.value),
    displayMode: computed(() => displayMode.value),
    modalTitle: computed(() => modalTitle.value),
    modalWidth: computed(() => modalWidth.value),
    showForm,
    hideForm,
    toggleForm,
    isFormVisible
  }
}