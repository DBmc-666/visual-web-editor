<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  component: {
    type: Object,
    required: true
  }
})

const currentTime = ref(new Date())
let timer = null

function updateTime() {
  currentTime.value = new Date()
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})

const displayType = computed(() => props.component.props?.displayType || 'datetime')
const styleType = computed(() => props.component.props?.styleType || 'digital')
const showWeek = computed(() => props.component.props?.showWeek || false)
const showAmPm = computed(() => props.component.props?.showAmPm || false)
const showSeconds = computed(() => props.component.props?.showSeconds !== false)

const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

function getAmPm(hours) {
  return hours >= 12 ? '下午' : '上午'
}

function get12Hours(hours) {
  const h = hours % 12
  return h === 0 ? 12 : h
}

function padZero(num) {
  return String(num).padStart(2, '0')
}

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

const fontSize = computed(() => {
  const style = props.component.style || {}
  const baseSize = style.fontSize || 16
  const width = props.component.width || 200
  const height = props.component.height || 40
  
  const minDimension = Math.min(width, height)
  const calculatedSize = minDimension * 0.4
  
  const minSize = Math.max(8, baseSize - 25)
  const maxSize = baseSize + 25
  const finalSize = Math.max(minSize, Math.min(calculatedSize, maxSize))
  
  return finalSize + 'px'
})

const wrapperStyle = computed(() => {
  const style = props.component.style || {}
  const baseStyle = {
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
    padding: (style.padding || 0) + 'px',
    whiteSpace: 'nowrap',
    overflow: 'hidden'
  }
  
  if (styleType.value === 'digital') {
    baseStyle.fontFamily = "'Courier New', monospace"
    baseStyle.fontWeight = 'bold'
    baseStyle.letterSpacing = '2px'
  } else if (styleType.value === 'traditional') {
    baseStyle.fontFamily = "'Georgia', serif"
  } else if (styleType.value === 'compact') {
    baseStyle.fontSize = (parseFloat(fontSize.value) * 0.9) + 'px'
  }
  
  return baseStyle
})
</script>

<template>
  <div class="datetime-widget" :class="`datetime-${styleType}`" :style="wrapperStyle">
    <span>{{ displayText }}</span>
  </div>
</template>

<style scoped>
.datetime-widget {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  user-select: none;
}
</style>
