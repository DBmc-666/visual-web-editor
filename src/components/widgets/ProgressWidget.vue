<script setup>
import { computed } from 'vue'

const props = defineProps({
  component: { type: Object, required: true }
})

const p = computed(() => props.component.props || {})

const value = computed(() => Number(p.value.value) || 0)
const max = computed(() => Math.max(1, Number(p.value.max) || 100))
const percent = computed(() => Math.max(0, Math.min(100, Math.round((value.value / max.value) * 100))))
const barColor = computed(() => p.value.barColor || '#1890ff')
const trackColor = computed(() => p.value.trackColor || '#f0f0f0')
const barHeight = computed(() => Math.max(2, Number(p.value.barHeight) || 10))
const rounded = computed(() => p.value.rounded !== false)
const showLabel = computed(() => p.value.showLabel !== false)
const labelColor = computed(() => p.value.labelColor || '#666666')
const fontSize = computed(() => Number(props.component.style?.fontSize) || 13)
</script>

<template>
  <div class="progress-widget">
    <div
      class="progress-track"
      :style="{
        height: `${barHeight}px`,
        backgroundColor: trackColor,
        borderRadius: rounded ? `${barHeight}px` : '0'
      }"
    >
      <div
        class="progress-bar"
        :style="{
          width: `${percent}%`,
          backgroundColor: barColor,
          borderRadius: rounded ? `${barHeight}px` : '0'
        }"
      ></div>
    </div>
    <span
      v-if="showLabel"
      class="progress-label"
      :style="{ color: labelColor, fontSize: `${fontSize}px` }"
    >{{ percent }}%</span>
  </div>
</template>

<style scoped>
.progress-widget {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  box-sizing: border-box;
  overflow: hidden;
}

.progress-track {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  transition: all 0.3s;
}

.progress-bar {
  height: 100%;
  transition: width 0.3s;
}

.progress-label {
  flex-shrink: 0;
  line-height: 1;
}
</style>
