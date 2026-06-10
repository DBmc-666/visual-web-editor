<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  component: {
    type: Object,
    required: true
  }
})

// 当前激活的标签
const activeTab = ref('tab1')

// 初始化 activeTab
const initActiveTab = computed(() => {
  const tab = props.component.props?.activeTab || 'tab1'
  activeTab.value = tab
  return tab
})

// 标签配置
const tabs = computed(() => {
  const tabsStr = props.component.props?.tabs || '标签一|tab1\n标签二|tab2\n标签三|tab3'
  const tabContents = props.component.props?.tabContents || {}
  const tabImages = props.component.props?.tabImages || {}
  return tabsStr.split('\n').filter(item => item.trim()).map((item, index) => {
    try {
      const parts = item.split('|')
      const text = parts[0]?.trim() || `标签${index + 1}`
      const key = parts[1]?.trim() || text
      const tabKey = key || `tab${index + 1}`
      const imageConfig = tabImages[tabKey] || {}
      return {
        text: text,
        key: tabKey,
        content: tabContents[tabKey] || tabContents[text] || `${text}的内容`,
        imageUrl: imageConfig.url || '',
        imageWidth: imageConfig.width || '',
        imageHeight: imageConfig.height || '',
        imageBorderRadius: imageConfig.borderRadius || ''
      }
    } catch (e) {
      const tabKey = `tab${index + 1}`
      const tabText = `标签${index + 1}`
      return {
        text: tabText,
        key: tabKey,
        content: `${tabText}的内容`,
        imageUrl: '',
        imageWidth: '',
        imageHeight: '',
        imageBorderRadius: ''
      }
    }
  })
})

// 样式配置
const containerStyle = computed(() => {
  const style = props.component.style || {}
  return {
    backgroundColor: style.backgroundColor || '#ffffff',
    borderColor: style.borderColor || '#e8e8e8'
  }
})

const tabStyle = computed(() => {
  const style = props.component.style || {}
  return {
    color: style.textColor || '#666666',
    activeColor: style.activeColor || '#1890ff',
    activeTextColor: style.activeTextColor || '#1890ff',
    borderColor: style.borderColor || '#e8e8e8'
  }
})

function handleTabClick(key) {
  activeTab.value = key
}
</script>

<template>
  <div class="tabs-widget" :style="containerStyle">
    <div class="tabs-header" :style="{ borderBottom: `1px solid ${tabStyle.borderColor}` }">
      <div
        v-for="(tab, index) in tabs"
        :key="index"
        class="tab-item"
        :class="{ active: activeTab === tab.key }"
        :style="activeTab === tab.key ? { color: tabStyle.activeTextColor, borderBottom: `2px solid ${tabStyle.activeColor}` } : { color: tabStyle.color }"
        @click="handleTabClick(tab.key)"
      >
        {{ tab.text }}
      </div>
    </div>
    <div class="tabs-content">
      <div
          v-for="(tab, index) in tabs"
          :key="index"
          v-show="activeTab === tab.key"
          class="tab-pane"
        >
          <div style="padding: 20px; color: #666666; white-space: pre-wrap;">
            <img v-if="tab.imageUrl" :src="tab.imageUrl" :style="{
              width: tab.imageWidth || '100%',
              height: tab.imageHeight || 'auto',
              borderRadius: tab.imageBorderRadius || '0',
              display: 'block',
              marginBottom: '15px'
            }" alt="" />
            <div v-html="tab.content"></div>
          </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.tabs-widget {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  overflow: hidden;
}

.tabs-header {
  display: flex;
  background-color: #fafafa;
}

.tab-item {
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}

.tab-item:hover {
  color: #1890ff;
}

.tab-item.active {
  font-weight: 500;
}

.tabs-content {
  flex: 1;
  overflow-y: auto;
}

.tab-pane {
  height: 100%;
}
</style>
