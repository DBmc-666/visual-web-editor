<script setup>
/**
 * @file 导航菜单组件
 * @description 顶部导航菜单组件，支持 Logo、菜单项、激活状态显示
 */

import { computed } from 'vue'

/**
 * 组件属性定义
 * @typedef {Object} NavMenuWidgetProps
 * @property {Object} component - 组件配置数据
 * @property {Object} component.style - 样式配置
 * @property {Object} component.props - 属性配置
 */
const props = defineProps({
  component: {
    type: Object,
    required: true
  }
})

/**
 * 组件样式配置
 * @type {ComputedRef<Object>}
 */
const style = computed(() => props.component.style || {})

/**
 * 导航栏容器样式
 * @type {ComputedRef<Object>}
 */
const menuStyle = computed(() => ({
  backgroundColor: style.value.backgroundColor || '#ffffff',
  borderBottom: style.value.borderBottom || '1px solid #e8e8e8',
  boxShadow: style.value.boxShadow || '0 2px 8px rgba(0,0,0,0.05)'
}))

// ==================== 菜单数据配置 ====================

/**
 * Logo文字
 * @type {ComputedRef<string>}
 */
const logo = computed(() => props.component.props?.logo || 'Logo')

/**
 * Logo跳转链接
 * @type {ComputedRef<string>}
 */
const logoUrl = computed(() => props.component.props?.logoUrl || '#')

/**
 * 菜单项列表
 * 解析格式: "文本|链接\n文本|链接"
 * @type {ComputedRef<Array<{text: string, url: string}>>}
 */
const menuItems = computed(() => {
  const itemsStr = props.component.props?.menuItems || '首页|#'
  return itemsStr.split('\n').map(item => {
    const [text, url] = item.split('|')
    return { text: text.trim(), url: url || '#' }
  })
})

/**
 * 当前激活菜单项索引
 * @type {ComputedRef<number>}
 */
const activeIndex = computed(() => props.component.props?.activeIndex || 0)

// ==================== 颜色配置 ====================

/**
 * 导航文字默认颜色
 * @type {ComputedRef<string>}
 */
const navTextColor = computed(() => style.value.color || '#333333')

/**
 * 激活状态颜色
 * @type {ComputedRef<string>}
 */
const navActiveColor = computed(() => style.value.activeColor || '#1890ff')

// ==================== 动态样式 ====================

/**
 * Logo样式
 * @type {ComputedRef<Object>}
 */
const logoStyle = computed(() => ({
  fontSize: '20px',
  fontWeight: 'bold',
  color: navActiveColor.value,
  textDecoration: 'none',
  cursor: 'pointer'
}))

/**
 * 普通菜单项样式
 * @type {ComputedRef<Object>}
 */
const navItemStyle = computed(() => ({
  color: navTextColor.value
}))

/**
 * 激活菜单项样式
 * @type {ComputedRef<Object>}
 */
const navItemActiveStyle = computed(() => ({
  color: navActiveColor.value,
  backgroundColor: `${navActiveColor.value}15` // 透明度15%的激活色背景
}))
</script>

<template>
  <div class="nav-menu-widget" :style="menuStyle">
    <div class="nav-menu-container">
      <a :href="logoUrl" class="nav-logo" :style="logoStyle" @click.prevent>{{ logo }}</a>
      <div class="nav-items">
        <a
          v-for="(item, index) in menuItems"
          :key="index"
          :href="item.url"
          class="nav-item"
          :class="{ active: index === activeIndex }"
          :style="index === activeIndex ? navItemActiveStyle : navItemStyle"
          @click.prevent
        >
          {{ item.text }}
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nav-menu-widget {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
}

.nav-menu-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.nav-logo {
  flex-shrink: 0;
  margin-right: 40px;
}

.nav-items {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.nav-item {
  padding: 8px 16px;
  text-decoration: none;
  border-radius: 4px;
  transition: all 0.3s;
  font-size: 14px;
}

.nav-item.active {
  font-weight: 500;
}
</style>
