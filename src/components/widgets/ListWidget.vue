<script setup>
import { computed } from 'vue'

const props = defineProps({
  component: {
    type: Object,
    required: true
  },
  previewMode: {
    type: Boolean,
    default: false
  }
})

const p = computed(() => props.component.props || {})

// 每行一项：文字|跳转链接
const items = computed(() =>
  String(p.value.items || '')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const [text, link] = line.split('|')
      return {
        text: (text || '').trim(),
        link: (link || '').trim()
      }
    })
)

const listType = computed(() => p.value.listType || 'unordered')
const marker = computed(() => p.value.marker || '•')
const markerColor = computed(() => p.value.markerColor || '#1890ff')
const itemSpacing = computed(() => Number(p.value.itemSpacing) || 0)
const linkTarget = computed(() => p.value.linkTarget || '_self')
const fontSize = computed(() => Number(props.component.style?.fontSize) || 14)
const color = computed(() => props.component.style?.color || '#333333')

/**
 * 编辑态阻止跳转，避免在画布上误点就跳走；预览态正常跳转
 */
function handleLinkClick(event) {
  if (!props.previewMode) {
    event.preventDefault()
  }
}
</script>

<template>
  <div class="list-widget" :style="{ fontSize: `${fontSize}px`, color }">
    <div
      v-for="(item, index) in items"
      :key="index"
      class="list-item"
      :style="{ marginBottom: `${itemSpacing}px` }"
    >
      <span
        v-if="listType === 'unordered'"
        class="list-marker"
        :style="{ color: markerColor }"
      >{{ marker }}</span>
      <span
        v-else-if="listType === 'ordered'"
        class="list-marker list-marker-ordered"
        :style="{ color: markerColor }"
      >{{ index + 1 }}.</span>
      <span class="list-text">
        <a
          v-if="item.link"
          class="list-link"
          :href="item.link"
          :target="linkTarget"
          @click="handleLinkClick"
        >{{ item.text }}</a>
        <template v-else>{{ item.text }}</template>
      </span>
    </div>
  </div>
</template>

<style scoped>
.list-widget {
  width: 100%;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
}

.list-item {
  display: flex;
  align-items: flex-start;
  gap: 6px;
}

.list-marker {
  flex-shrink: 0;
  line-height: inherit;
}

.list-marker-ordered {
  min-width: 18px;
  text-align: right;
}

.list-text {
  flex: 1;
  min-width: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.list-link {
  color: inherit;
  text-decoration: underline;
}

.list-link:hover {
  opacity: 0.8;
}
</style>
