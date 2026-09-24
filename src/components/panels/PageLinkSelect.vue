<script setup>
import { computed } from 'vue'
import { useEditor } from '../../stores/editor'

const props = defineProps({
  // 当前链接值（可能是 #page:xxx，也可能是普通 URL）
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const { pages, activePageId } = useEditor()

// 可跳转的页面（当前画布内，排除当前页）
const options = computed(() => (pages.value || []).filter(p => p.id !== activePageId.value))

// 当前是否已指向某个页面
const currentPageId = computed(() => {
  const match = String(props.modelValue || '').match(/^#page:(.+)$/)
  return match ? match[1] : ''
})

function handleChange(event) {
  const pageId = event.target.value
  emit('update:modelValue', pageId ? `#page:${pageId}` : '')
}
</script>

<template>
  <select
    class="page-link-select"
    :value="currentPageId"
    title="跳转到本画布的其他页面（导出时会自动转换为对应页面文件名）"
    @change="handleChange"
  >
    <option value="">跳转到页面…</option>
    <option v-for="page in options" :key="page.id" :value="page.id">{{ page.name }}</option>
  </select>
</template>

<style scoped>
.page-link-select {
  width: 100%;
  padding: 5px 8px;
  font-size: 12px;
  border: 1px dashed var(--color-border);
  border-radius: var(--border-radius);
  background-color: var(--color-bg);
  color: var(--color-text);
  outline: none;
  cursor: pointer;
}

.page-link-select:focus {
  border-color: var(--color-primary);
  border-style: solid;
}
</style>
