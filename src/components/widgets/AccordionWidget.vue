<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  component: { type: Object, required: true },
  previewMode: { type: Boolean, default: false }
})

const p = computed(() => props.component.props || {})

// 每行一条：标题|内容
const items = computed(() =>
  String(p.value.items || '')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const [title, content] = line.split('|')
      return { title: (title || '').trim(), content: (content || '').trim() }
    })
)

const allowMultiple = computed(() => p.value.allowMultiple === true)
const headerBackground = computed(() => p.value.headerBackground || '#fafafa')
const activeColor = computed(() => p.value.activeColor || '#1890ff')
const itemPadding = computed(() => Number(p.value.itemPadding) || 12)
const borderColor = computed(() => props.component.style?.borderColor || '#e8e8e8')
const fontSize = computed(() => Number(props.component.style?.fontSize) || 14)
const color = computed(() => props.component.style?.color || '#333333')

// 展开状态（编辑态可直接点击预览交互）
const openIndexes = ref([])

function resetOpenState() {
  const list = items.value
  if (list.length === 0) {
    openIndexes.value = []
    return
  }
  openIndexes.value = p.value.firstOpen !== false ? [0] : []
}

watch([items, () => p.value.firstOpen], resetOpenState, { immediate: true, deep: true })

function isOpen(index) {
  return openIndexes.value.includes(index)
}

function toggle(index) {
  if (allowMultiple.value) {
    openIndexes.value = isOpen(index)
      ? openIndexes.value.filter(i => i !== index)
      : [...openIndexes.value, index]
  } else {
    openIndexes.value = isOpen(index) ? [] : [index]
  }
}
</script>

<template>
  <div
    class="accordion-widget"
    :style="{ fontSize: `${fontSize}px`, color, borderColor }"
  >
    <div
      v-for="(item, index) in items"
      :key="index"
      class="accordion-item"
      :style="{ borderColor }"
    >
      <div
        class="accordion-header"
        :style="{
          padding: `${itemPadding}px`,
          backgroundColor: headerBackground,
          color: isOpen(index) ? activeColor : color
        }"
        @click.stop="toggle(index)"
      >
        <span class="accordion-title">{{ item.title }}</span>
        <span class="accordion-arrow" :class="{ open: isOpen(index) }">▾</span>
      </div>
      <div
        v-if="isOpen(index)"
        class="accordion-content"
        :style="{ padding: `${itemPadding}px` }"
      >{{ item.content }}</div>
    </div>
  </div>
</template>

<style scoped>
.accordion-widget {
  width: 100%;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
}

.accordion-item {
  border: 1px solid;
  border-radius: 6px;
  overflow: hidden;
}

.accordion-item + .accordion-item {
  margin-top: -1px;
}

.accordion-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  font-weight: 500;
}

.accordion-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.accordion-arrow {
  flex-shrink: 0;
  transition: transform 0.2s;
  font-size: 12px;
}

.accordion-arrow.open {
  transform: rotate(180deg);
}

.accordion-content {
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
