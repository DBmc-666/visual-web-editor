<script setup>
import { computed } from 'vue'

const props = defineProps({
  component: {
    type: Object,
    required: true
  }
})

const p = computed(() => props.component.props || {})

// 用 | 分隔列
const parseRow = (line) => String(line).split('|').map(cell => cell.trim())

const headers = computed(() => (p.value.headers ? parseRow(p.value.headers) : []))

const rows = computed(() =>
  String(p.value.rows || '')
    .split('\n')
    .filter(line => line.trim())
    .map(parseRow)
)

const showHeader = computed(() => p.value.showHeader !== false)
const headerBackground = computed(() => p.value.headerBackground || '#f5f7fa')
const headerColor = computed(() => p.value.headerColor || '#333333')
const borderColor = computed(() => p.value.borderColor || '#e8e8e8')
const striped = computed(() => p.value.striped !== false)
const cellPadding = computed(() => Number(p.value.cellPadding) || 8)
const fontSize = computed(() => Number(props.component.style?.fontSize) || 14)
const color = computed(() => props.component.style?.color || '#333333')
</script>

<template>
  <div class="table-widget" :style="{ fontSize: `${fontSize}px`, color }">
    <table :style="{ borderColor }">
      <thead v-if="showHeader && headers.length">
        <tr>
          <th
            v-for="(head, index) in headers"
            :key="index"
            :style="{
              backgroundColor: headerBackground,
              color: headerColor,
              padding: `${cellPadding}px`,
              borderColor
            }"
          >{{ head }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, rowIndex) in rows"
          :key="rowIndex"
          :style="striped && rowIndex % 2 === 1 ? { backgroundColor: '#fafafa' } : {}"
        >
          <td
            v-for="(cell, cellIndex) in row"
            :key="cellIndex"
            :style="{ padding: `${cellPadding}px`, borderColor }"
          >{{ cell }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-widget {
  width: 100%;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
}

table {
  width: 100%;
  border-collapse: collapse;
  table-layout: auto;
}

th,
td {
  border: 1px solid;
  text-align: left;
  font-weight: normal;
}

th {
  font-weight: 600;
}
</style>
