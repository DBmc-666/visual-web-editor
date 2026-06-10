<script setup>
/**
 * @file 面包屑导航组件
 * @description 用于显示页面层级导航路径
 */

import { computed } from 'vue'

const props = defineProps({
  component: {
    type: Object,
    required: true
  }
})

// 样式配置
const wrapperStyle = computed(() => {
  const style = props.component.style || {}
  return {
    backgroundColor: style.backgroundColor || 'transparent',
    fontSize: (style.fontSize || 14) + 'px',
    color: style.color || '#666666'
  }
})

// 面包屑配置
const items = computed(() => {
  const itemsStr = props.component.props?.items || '首页|#'
  return itemsStr.split('\n').map(item => {
    const [text, url] = item.split('|')
    return { text: text.trim(), url: url || '#' }
  })
})
const separator = computed(() => props.component.props?.separator || '/')
const separatorColor = computed(() => props.component.style?.separatorColor || '#999999')

// 链接打开方式：_self（当前窗口）或 _blank（新建窗口）
const linkTarget = computed(() => props.component.props?.target || '_self')
</script>

<template>
  <div class="breadcrumb-widget" :style="wrapperStyle">
    <span
      v-for="(item, index) in items"
      :key="index"
      class="breadcrumb-item"
    >
      <a :href="item.url" class="breadcrumb-link" :target="linkTarget" @click.prevent>{{ item.text }}</a>
      <span v-if="index < items.length - 1" class="breadcrumb-separator" :style="{ color: separatorColor }">
        {{ separator }}
      </span>
    </span>
  </div>
</template>

<style scoped>
.breadcrumb-widget {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 10px;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
}

.breadcrumb-link {
  color: inherit;
  text-decoration: none;
  transition: color 0.3s;
}

.breadcrumb-link:hover {
  color: #1890ff;
}

.breadcrumb-separator {
  margin: 0 8px;
}
</style>
