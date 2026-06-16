<script setup>
import { computed } from 'vue'

const props = defineProps({
  component: {
    type: Object,
    required: true
  }
})

// 按钮文字和对齐
const content = computed(() => props.component.props?.content || '按钮')
const textAlign = computed(() => props.component.props?.textAlign || 'center')

// 按钮背景颜色状态
const backgroundColor = computed(() => props.component.style?.backgroundColor || '#1890ff')
const hoverBackgroundColor = computed(() => props.component.style?.hoverBackgroundColor || '#40a9ff')
const activeBackgroundColor = computed(() => props.component.style?.activeBackgroundColor || '#096dd9')

// 圆角
const borderRadius = computed(() => props.component.style?.borderRadius ? `${props.component.style.borderRadius}px` : '0')

// 处理按钮点击
function handleClick() {
  const btnProps = props.component.props || {}
  const actionType = btnProps.actionType || 'link'

  switch (actionType) {
    case 'link':
      // 跳转链接
      const href = btnProps.href || '#'
      const target = btnProps.target || '_self'
      if (href !== '#') {
        window.open(href, target)
      }
      break

    case 'alert':
      // 弹窗提示
      const message = btnProps.alertMessage || '点击了按钮'
      alert(message)
      break

    case 'api':
      // 调用 API（预留）
      callAPI(btnProps.apiConfig)
      break
  }
}

// 调用 API
async function callAPI(config) {
  if (!config?.url) {
    alert('请配置 API 地址')
    return
  }

  try {
    const response = await fetch(config.url, {
      method: config.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      },
      body: config.body ? JSON.stringify(config.body) : undefined
    })

    const result = await response.json()
    alert(`API 调用成功!\n${JSON.stringify(result, null, 2)}`)
  } catch (error) {
    alert(`API 调用失败: ${error.message}`)
  }
}
</script>

<template>
  <button 
    class="button-widget" 
    :style="{
      textAlign,
      '--bg-color': backgroundColor,
      '--hover-bg-color': hoverBackgroundColor,
      '--active-bg-color': activeBackgroundColor,
      borderRadius
    }" 
    @click="handleClick"
  >
    {{ content }}
  </button>
</template>

<style scoped>
.button-widget {
  width: 100%;
  height: 100%;
  border: none;
  cursor: pointer;
  font-family: inherit;
  box-sizing: border-box;
  background-color: var(--bg-color);
}
.button-widget:hover {
  background-color: var(--hover-bg-color);
}
.button-widget:active {
  background-color: var(--active-bg-color);
}
</style>