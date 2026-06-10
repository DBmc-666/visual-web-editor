<script setup>
import { computed } from 'vue'

const props = defineProps({
  component: {
    type: Object,
    required: true
  }
})

// 文本内容和对齐
const content = computed(() => props.component.props?.content || '文本')
const textAlign = computed(() => props.component.props?.textAlign || 'left')
const hasLink = computed(() => props.component.props?.hasLink || false)
const href = computed(() => props.component.props?.href || '#')
const target = computed(() => props.component.props?.target || '_self')

// 文字颜色
const textColor = computed(() => props.component.style?.color || '#333333')
</script>

<template>
  <div class="text-widget" :style="{ textAlign, color: textColor }">
    <a v-if="hasLink" :href="href" :target="target" class="text-link" :style="{ color: textColor }">
      {{ content }}
    </a>
    <span v-else>{{ content }}</span>
  </div>
</template>

<style scoped>
.text-widget {
  width: 100%;
  height: 100%;
  overflow: hidden;
  word-wrap: break-word;
  white-space: pre-wrap;
  box-sizing: border-box;
}

.text-link {
  text-decoration: underline;
  cursor: pointer;
}

.text-link:hover {
  opacity: 0.8;
}
</style>