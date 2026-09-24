<script setup>
import { computed } from 'vue'

const props = defineProps({
  component: { type: Object, required: true }
})

const p = computed(() => props.component.props || {})

const value = computed(() => p.value.value ?? '1280')
const label = computed(() => p.value.label || '')
const unit = computed(() => p.value.unit || '')
const trend = computed(() => p.value.trend || '')
const trendUp = computed(() => p.value.trendUp !== false)
const icon = computed(() => p.value.icon || '')

const valueColor = computed(() => p.value.valueColor || '#1f2d3d')
const labelColor = computed(() => p.value.labelColor || '#8c8c8c')
const trendColor = computed(() => (trendUp.value
  ? (p.value.trendUpColor || '#52c41a')
  : (p.value.trendDownColor || '#ff4d4f')))

const fontSize = computed(() => Number(props.component.style?.fontSize) || 14)
</script>

<template>
  <div class="stat-widget" :style="{ fontSize: `${fontSize}px` }">
    <div class="stat-top">
      <span v-if="icon" class="stat-icon">{{ icon }}</span>
      <span v-if="label" class="stat-label" :style="{ color: labelColor }">{{ label }}</span>
    </div>
    <div class="stat-value-row">
      <span class="stat-value" :style="{ color: valueColor }">{{ value }}{{ unit }}</span>
      <span v-if="trend" class="stat-trend" :style="{ color: trendColor }">
        {{ trendUp ? '▲' : '▼' }} {{ trend }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.stat-widget {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  box-sizing: border-box;
  overflow: hidden;
}

.stat-top {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9em;
}

.stat-icon {
  font-size: 1.1em;
  line-height: 1;
}

.stat-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stat-value-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}

.stat-value {
  font-size: 1.8em;
  font-weight: 700;
  line-height: 1.2;
}

.stat-trend {
  font-size: 0.85em;
  font-weight: 600;
  white-space: nowrap;
}
</style>
