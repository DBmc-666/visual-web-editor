<script setup>
import { computed } from 'vue'

const props = defineProps({
  component: {
    type: Object,
    required: true
  }
})

const p = computed(() => props.component.props || {})

const lineStyle = computed(() => p.value.lineStyle || 'solid')
const thickness = computed(() => Number(p.value.thickness) || 1)
const color = computed(() => p.value.color || '#e8e8e8')
const text = computed(() => p.value.text || '')
const textColor = computed(() => p.value.textColor || '#999999')
const textSize = computed(() => Number(p.value.textSize) || 12)
const textGap = computed(() => Number(p.value.textGap) || 12)

const lineStyleObj = computed(() => ({
  borderTopWidth: `${thickness.value}px`,
  borderTopStyle: lineStyle.value,
  borderTopColor: color.value
}))
</script>

<template>
  <div class="divider-widget">
    <template v-if="text">
      <span class="divider-line" :style="{ ...lineStyleObj, marginRight: `${textGap}px` }"></span>
      <span class="divider-text" :style="{ color: textColor, fontSize: `${textSize}px` }">{{ text }}</span>
      <span class="divider-line" :style="{ ...lineStyleObj, marginLeft: `${textGap}px` }"></span>
    </template>
    <span v-else class="divider-line" :style="lineStyleObj"></span>
  </div>
</template>

<style scoped>
.divider-widget {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  overflow: hidden;
}

.divider-line {
  flex: 1;
  height: 0;
  min-width: 0;
}

.divider-text {
  white-space: nowrap;
  flex-shrink: 0;
}
</style>
