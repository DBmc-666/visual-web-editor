<script setup>
import { computed } from 'vue'

const props = defineProps({
  component: {
    type: Object,
    required: true
  }
})

const p = computed(() => props.component.props || {})

const icon = computed(() => p.value.icon || '⭐')
const shape = computed(() => p.value.shape || 'none')
const shapeColor = computed(() => p.value.shapeColor || '#f0f7ff')
const shapeSize = computed(() => Number(p.value.shapeSize) || 48)
const fontSize = computed(() => Number(props.component.style?.fontSize) || 32)
const color = computed(() => props.component.style?.color || '#1890ff')

const shapeRadius = computed(() => {
  if (shape.value === 'circle') return '50%'
  if (shape.value === 'square') return '8px'
  return '0'
})
</script>

<template>
  <div class="icon-widget">
    <span
      class="icon-shape"
      :style="{
        width: `${shapeSize}px`,
        height: `${shapeSize}px`,
        backgroundColor: shape === 'none' ? 'transparent' : shapeColor,
        borderRadius: shapeRadius,
        fontSize: `${fontSize}px`,
        color
      }"
    >{{ icon }}</span>
  </div>
</template>

<style scoped>
.icon-widget {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-sizing: border-box;
}

.icon-shape {
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  flex-shrink: 0;
}
</style>
