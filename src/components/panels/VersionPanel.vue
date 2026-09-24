<script setup>
/**
 * @file 历史版本面板
 * @description 把整个项目保存为具名快照，支持恢复 / 重命名 / 删除。
 * 与"草稿"的区别：草稿是自动保存的最新状态，快照是用户主动保存的多个时间点。
 */

import { ref, computed, onMounted } from 'vue'
import { useEditor } from '../../stores/editor'

const emit = defineEmits(['close'])

const {
  listVersionSnapshots,
  saveVersionSnapshot,
  restoreVersionSnapshot,
  renameVersionSnapshot,
  removeVersionSnapshot,
  clearVersionSnapshots,
  getVersionSnapshotsSize
} = useEditor()

const versions = ref([])
const newName = ref('')
const message = ref('')
const error = ref('')

const usedSize = ref(0)

// 体积展示（KB / MB）
const usedSizeText = computed(() => {
  const bytes = usedSize.value
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
})

function refresh() {
  versions.value = listVersionSnapshots()
  usedSize.value = getVersionSnapshotsSize()
}

function formatTime(ts) {
  const d = new Date(ts)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

// 保存当前状态为新版本
function handleSave() {
  message.value = ''
  error.value = ''

  const result = saveVersionSnapshot(newName.value)
  if (!result.ok) {
    error.value = result.message || '保存失败'
    return
  }

  message.value = `✅ 已保存版本「${result.item.name}」`
  newName.value = ''
  refresh()
}

// 恢复到某个版本
function handleRestore(item) {
  message.value = ''
  error.value = ''

  if (!confirm(`确定恢复到「${item.name}」吗？\n当前内容会被替换（可用 Ctrl+Z 退回，或先保存一个版本）。`)) return

  const result = restoreVersionSnapshot(item.id)
  if (!result.ok) {
    error.value = result.message || '恢复失败'
    return
  }

  message.value = `✅ 已恢复到「${item.name}」（Ctrl+Z 可退回）`
  refresh()
}

// 重命名
function handleRename(item) {
  const name = prompt('重命名版本：', item.name)
  if (name === null) return
  if (renameVersionSnapshot(item.id, name)) refresh()
}

// 删除
function handleRemove(item) {
  if (!confirm(`确定删除版本「${item.name}」吗？此操作不可撤销。`)) return
  if (removeVersionSnapshot(item.id)) {
    message.value = `已删除「${item.name}」`
    refresh()
  }
}

// 清空
function handleClearAll() {
  if (versions.value.length === 0) return
  if (!confirm(`确定清空全部 ${versions.value.length} 个历史版本吗？此操作不可撤销。`)) return
  clearVersionSnapshots()
  message.value = '已清空全部历史版本'
  refresh()
}

onMounted(refresh)
</script>

<template>
  <div class="version-overlay" @click.self="emit('close')">
    <div class="version-modal">
      <div class="version-header">
        <span class="version-title">📚 历史版本</span>
        <button class="version-close" title="关闭" @click="emit('close')">✕</button>
      </div>

      <div class="version-body">
        <!-- 保存新版本 -->
        <div class="version-save-row">
          <input
            v-model="newName"
            type="text"
            class="input version-name-input"
            placeholder="版本名称（可留空，自动命名）"
            @keyup.enter="handleSave"
          />
          <button class="btn btn-primary" @click="handleSave">保存当前版本</button>
        </div>

        <div class="version-meta">
          共 {{ versions.length }} 个版本 · 占用 {{ usedSizeText }}
          <span class="version-meta-hint">
            （存在浏览器本地，最多保留 20 个；含本地图片的项目体积较大）
          </span>
        </div>

        <div v-if="message" class="version-success">{{ message }}</div>
        <div v-if="error" class="version-error">{{ error }}</div>

        <!-- 版本列表 -->
        <div v-if="versions.length === 0" class="version-empty">
          还没有保存过版本。点「保存当前版本」记录一个时间点，之后可随时回退。
        </div>

        <div v-else class="version-list">
          <div v-for="item in versions" :key="item.id" class="version-item">
            <div class="version-item-main">
              <div class="version-item-name">{{ item.name }}</div>
              <div class="version-item-info">
                <span>{{ formatTime(item.createdAt) }}</span>
                <span class="version-dot">·</span>
                <span>{{ item.stats.canvasCount }} 画布 / {{ item.stats.pageCount }} 页面 / {{ item.stats.componentCount }} 组件</span>
                <span class="version-dot">·</span>
                <span>{{ formatSize(item.size) }}</span>
              </div>
            </div>
            <div class="version-item-actions">
              <button class="btn version-btn-primary" @click="handleRestore(item)">恢复</button>
              <button class="btn version-btn" @click="handleRename(item)">重命名</button>
              <button class="btn version-btn danger" @click="handleRemove(item)">删除</button>
            </div>
          </div>
        </div>
      </div>

      <div class="version-footer">
        <button class="btn version-btn danger" :disabled="versions.length === 0" @click="handleClearAll">
          清空全部
        </button>
        <button class="btn" @click="emit('close')">关闭</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.version-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.version-modal {
  width: 640px;
  max-width: 92vw;
  max-height: 86vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-white);
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.version-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.version-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
}

.version-close {
  border: none;
  background: transparent;
  font-size: 15px;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
}

.version-close:hover {
  background-color: var(--color-bg);
  color: var(--color-text);
}

.version-body {
  flex: 1;
  overflow-y: auto;
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.version-save-row {
  display: flex;
  gap: 8px;
}

.version-name-input {
  flex: 1;
}

.version-meta {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.version-meta-hint {
  color: var(--color-text-secondary);
  opacity: 0.85;
}

.version-success {
  padding: 8px 10px;
  background-color: #f6ffed;
  border: 1px solid #b7eb8f;
  color: var(--color-success);
  border-radius: var(--border-radius);
  font-size: 13px;
}

.version-error {
  padding: 8px 10px;
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
  color: var(--color-danger);
  border-radius: var(--border-radius);
  font-size: 13px;
}

.version-empty {
  padding: 24px 12px;
  text-align: center;
  font-size: 13px;
  color: var(--color-text-secondary);
  background-color: var(--color-bg);
  border: 1px dashed var(--color-border);
  border-radius: var(--border-radius);
}

.version-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.version-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  background-color: var(--color-bg-white);
}

.version-item:hover {
  border-color: var(--color-primary);
}

.version-item-main {
  flex: 1;
  min-width: 0;
}

.version-item-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.version-item-info {
  margin-top: 3px;
  font-size: 11px;
  color: var(--color-text-secondary);
}

.version-dot {
  margin: 0 5px;
  opacity: 0.6;
}

.version-item-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.version-btn {
  padding: 4px 10px;
  font-size: 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  background-color: var(--color-bg-white);
  color: var(--color-text);
  cursor: pointer;
  white-space: nowrap;
}

.version-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.version-btn.danger:hover {
  border-color: var(--color-danger);
  color: var(--color-danger);
  background-color: #fff2f0;
}

.version-btn-primary {
  padding: 4px 12px;
  font-size: 12px;
  border: 1px solid var(--color-primary);
  border-radius: var(--border-radius);
  background-color: var(--color-primary);
  color: #fff;
  cursor: pointer;
}

.version-btn-primary:hover {
  opacity: 0.9;
}

.version-footer {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 18px;
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
}
</style>
