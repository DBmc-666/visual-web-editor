<script setup>
import { computed } from 'vue'

const props = defineProps({
  component: {
    type: Object,
    required: true
  }
})

// 链接文字和地址
const content = computed(() => props.component.props?.content || '链接')
const href = computed(() => props.component.props?.href || '#')

// 样式
const linkStyle = computed(() => {
  const style = props.component.style || {}
  return {
    color: style.color || '#1890ff',
    fontSize: style.fontSize ? `${style.fontSize}px` : undefined,
    fontWeight: style.fontWeight || undefined,
    lineHeight: style.lineHeight || undefined,
    textAlign: props.component.props?.textAlign || 'left'
  }
})
</script>

<template>
  <a :href="href" class="link-widget" :style="linkStyle">
    {{ content }}
  </a>
</template>

<style scoped>
.link-widget {
  display: block;
  width: 100%;
  height: 100%;
  text-decoration: underline;
  cursor: pointer;
  box-sizing: border-box;
}
.link-widget:hover {
  opacity: 0.8;
}
</style>
