<script setup>
import { computed } from 'vue'

const props = defineProps({
  component: { type: Object, required: true }
})

const p = computed(() => props.component.props || {})

const text = computed(() => p.value.text || 'NEW')
const backgroundColor = computed(() => p.value.backgroundColor || '#e6f7ff')
const shape = computed(() => p.value.shape || 'pill')
const borderColor = computed(() => p.value.borderColor || '')
const fontWeight = computed(() => Number(p.value.fontWeight) || 600)
const color = computed(() => props.component.style?.color || '#1890ff')
const fontSize = computed(() => Number(props.component.style?.fontSize) || 12)

const radius = computed(() => (shape.value === 'square' ? '4px' : '999px'))
</script>

<template>
  <div class="badge-widget">
    <span
      class="badge-body"
      :style="{
        backgroundColor,
        color,
        fontSize: `${fontSize}px`,
        fontWeight,
        borderRadius: radius,
        border: borderColor ? `1px solid ${borderColor}` : 'none'
      }"
    >{{ text }}</span>
  </div>
</template>

<style scoped>
.badge-widget {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  overflow: hidden;
}

.badge-body {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 10px;
  line-height: 1.4;
  white-space: nowrap;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
