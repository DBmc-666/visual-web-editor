<script setup>
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'

const props = defineProps({
  component: {
    type: Object,
    required: true
  }
})

// 当前时间
const currentTime = ref(new Date())
let timer = null

// 更新当前时间
function updateTime() {
  currentTime.value = new Date()
}

// 启动定时器
onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

// 组件卸载时清除定时器
onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})

// 显示类型
const displayType = computed(() => props.component.props?.displayType || 'datetime')

// 样式类型（从props中读取）
const styleType = computed(() => props.component.props?.styleType || 'digital')

// 是否显示星期
const showWeek = computed(() => props.component.props?.showWeek || false)

// 是否显示上午/下午
const showAmPm = computed(() => props.component.props?.showAmPm || false)

// 是否显示秒
const showSeconds = computed(() => props.component.props?.showSeconds !== false)

// 星期数组
const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

// 获取上午/下午
function getAmPm(hours) {
  return hours >= 12 ? '下午' : '上午'
}

// 获取12小时制
function get12Hours(hours) {
  const h = hours % 12
  return h === 0 ? 12 : h
}

// 格式化数字（补零）
function padZero(num) {
  return String(num).padStart(2, '0')
}

// 数字时钟样式
const digitalDisplay = computed(() => {
  const date = currentTime.value
  const year = date.getFullYear()
  const month = padZero(date.getMonth() + 1)
  const day = padZero(date.getDate())
  const hours = padZero(date.getHours())
  const minutes = padZero(date.getMinutes())
  const seconds = padZero(date.getSeconds())
  
  let result = ''
  
  if (displayType.value === 'date' || displayType.value === 'datetime') {
    result = `${year}-${month}-${day}`
    if (displayType.value === 'datetime') {
      if (showAmPm.value) {
        result += ` ${getAmPm(date.getHours())} ${get12Hours(date.getHours())}:${minutes}`
      } else {
        result += ` ${hours}:${minutes}`
        if (showSeconds.value) result += `:${seconds}`
      }
    }
  } else {
    if (showAmPm.value) {
      result = `${getAmPm(date.getHours())} ${get12Hours(date.getHours())}:${minutes}`
    } else {
      result = `${hours}:${minutes}`
      if (showSeconds.value) result += `:${seconds}`
    }
  }
  
  if (showWeek.value) {
    result += ` ${weekDays[date.getDay()]}`
  }
  
  return result
})

// 传统样式
const traditionalDisplay = computed(() => {
  const date = currentTime.value
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const seconds = date.getSeconds()
  
  let result = ''
  
  if (displayType.value === 'date' || displayType.value === 'datetime') {
    result = `${year}年${month}月${day}日`
  }
  
  if (displayType.value !== 'date') {
    if (showAmPm.value) {
      result += ` ${getAmPm(hours)} ${get12Hours(hours)}点${minutes}分`
    } else {
      result += ` ${hours}时${minutes}分`
      if (showSeconds.value) result += `${seconds}秒`
    }
  }
  
  if (showWeek.value) {
    result += ` ${weekDays[date.getDay()]}`
  }
  
  return result
})

// 紧凑样式
const compactDisplay = computed(() => {
  const date = currentTime.value
  const month = padZero(date.getMonth() + 1)
  const day = padZero(date.getDate())
  const hours = padZero(date.getHours())
  const minutes = padZero(date.getMinutes())
  
  let result = ''
  
  if (displayType.value === 'date' || displayType.value === 'datetime') {
    result = `${month}/${day}`
    if (displayType.value === 'datetime') {
      result += ` ${hours}:${minutes}`
    }
  } else {
    result = `${hours}:${minutes}`
  }
  
  if (showWeek.value) {
    const week = weekDays[date.getDay()]
    result = `${week} ${result}`
  }
  
  return result
})

// 最终显示文本
const displayText = computed(() => {
  switch (styleType.value) {
    case 'traditional':
      return traditionalDisplay.value
    case 'compact':
      return compactDisplay.value
    case 'digital':
    default:
      return digitalDisplay.value
  }
})

// 计算自适应字体大小
const fontSize = computed(() => {
  const style = props.component.style || {}
  const baseSize = style.fontSize || 16
  const width = props.component.width || 200
  const height = props.component.height || 40
  
  // 根据组件尺寸计算字体大小
  // 使用宽高的较小值来计算，确保文字能完整显示
  const minDimension = Math.min(width, height)
  
  // 字体大小约为最小尺寸的40%，但不小于基础大小的75%，不大于基础大小的400%
  const calculatedSize = minDimension * 0.4
  const finalSize = Math.max(baseSize * 0.75, Math.min(calculatedSize, baseSize * 4))
  
  return finalSize + 'px'
})

// 样式配置
const wrapperStyle = computed(() => {
  const style = props.component.style || {}
  return {
    fontSize: fontSize.value,
    color: style.color || '#333333',
    backgroundColor: style.backgroundColor || 'transparent',
    textAlign: style.textAlign || 'center',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: style.textAlign === 'left' ? 'flex-start' : style.textAlign === 'right' ? 'flex-end' : 'center',
    borderRadius: (style.borderRadius || 0) + 'px',
    padding: (style.padding || 0) + 'px'
  }
})

// 数字时钟样式的额外样式
const digitalExtraStyle = computed(() => {
  if (styleType.value !== 'digital') return {}
  const style = props.component.style || {}
  return {
    fontFamily: style.styleType === 'digital' ? "'Courier New', monospace" : "'Segoe UI', sans-serif",
    fontWeight: 'bold',
    letterSpacing: '2px'
  }
})
</script>

<template>
  <div class="datetime-widget" :style="wrapperStyle">
    <span :style="digitalExtraStyle">{{ displayText }}</span>
  </div>
</template>

<style scoped>
.datetime-widget {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  user-select: none;
}
</style>
