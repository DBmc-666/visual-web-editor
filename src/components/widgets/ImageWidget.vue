<script setup>
import { ref, computed } from 'vue'

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

// 图片加载错误状态
const hasError = ref(false)
// 是否已尝试过加载（防止无限循环）
const hasAttemptedLoad = ref(false)

// 占位图（SVG 内嵌）
const placeholderSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmaWxsPSIjOTk5IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7lm77niYfliqDovb3lpLHotKU8L3RleHQ+PC9zdmc+'

// 图片地址和填充方式
const src = computed(() => {
  const url = props.component.props?.src || ''
  // 如果有错误或者URL为空，使用占位图
  if (hasError.value || !url || url.trim() === '') {
    return placeholderSrc
  }
  return url
})
const objectFit = computed(() => props.component.props?.objectFit || 'contain')

// 超链接配置
const hasLink = computed(() => props.component.props?.hasLink || false)
const href = computed(() => props.component.props?.href || '#')
const target = computed(() => props.component.props?.target || '_blank')

// 加载错误处理（只处理一次，防止无限循环）
function handleError() {
  if (!hasAttemptedLoad.value) {
    hasAttemptedLoad.value = true
    hasError.value = true
  }
}

// 图片加载成功处理
function handleLoad() {
  hasError.value = false
  hasAttemptedLoad.value = true
}

// 点击处理（编辑模式下阻止跳转）
function handleClick(event) {
  if (!props.previewMode) {
    event.preventDefault()
  }
}
</script>

<template>
  <a v-if="hasLink" :href="href" :target="target" class="image-link" @click="handleClick">
    <img
      :src="src"
      :style="{ objectFit }"
      class="image-widget"
      @error="handleError"
      @load="handleLoad"
    />
  </a>
  <img
    v-else
    :src="src"
    :style="{ objectFit }"
    class="image-widget"
    @error="handleError"
    @load="handleLoad"
  />
</template>

<style scoped>
.image-widget {
  width: 100%;
  height: 100%;
  display: block;
  box-sizing: border-box;
}

.image-link {
  display: block;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
</style>
