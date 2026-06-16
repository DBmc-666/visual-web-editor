# 基于 Vue3 + Vite 打造的轻量级可视化网页编辑器，支持组件拖拽、实时预览与 HTML 导出。
##  项目状态
早期 MVP 原型，整体开发进度约 10%，仅实现核心最小可用功能，大量规划功能仍在迭代中。代码未做全面优化、边界校验及生产环境适配，请勿直接用于线上生产项目。
## 功能特性
- 拖拽式编辑：通过拖拽组件到画布快速搭建页面
- 丰富的组件库：内置文本、图片、按钮、表单、导航等常用组件
- 实时预览：所见即所得，编辑效果即时展示
- 一键导出：打包生成可独立运行的纯 HTML 文件
- 预设模板：内置多套页面模板，快速起步
- 本地图片支持：上传本地图片并随同页面一起导出
- 响应式设计：自动生成适配多终端的页面代码
## 技术栈
- 前端框架：Vue 3 (Composition API)
- 构建工具：Vite
- 状态管理：Vue3 Reactive
- 样式方案：CSS3 + Scoped Styles
- 文件导出：JSZip + FileSaver
## 安装和运行

# 安装项目依赖
npm install

# 启动本地开发服务
npm run dev

# 打包构建生产版本
npm run build

# 本地预览打包产物
npm run preview

快速开始
1. 启动项目后，从左侧组件栏选择组件
2. 拖拽组件至中间画布完成布局
3. 在右侧属性面板修改组件内容、样式
4. 点击预览按钮查看最终效果
5. 点击导出，生成并下载完整 HTML 文件

## 📁 项目结构
- src/
  - assets/ 静态资源
    - styles/ 全局公共样式
  - components/ 通用 Vue 组件
    - canvas/ 画布核心组件
    - layout/ 页面布局组件
    - panels/ 侧边栏、属性面板
    - widgets/ 可拖拽业务组件
  - composables/ 组合式工具函数
  - stores/ 全局状态管理
  - utils/ 通用工具方法
  - App.vue 根组件
  - main.js 项目入口文件

# 组件列表

# 基础组件
- 文本 (Text)
- 图片 (Image)
- 按钮 (Button)
- 链接 (Link)
- 日期时间 (DateTime)
- 纯色背景 (Container)
# 表单组件
- 登录表单 (LoginForm)
- 注册表单 (RegisterForm)
- 联系表单 (ContactForm)
- 搜索表单 (SearchForm)
- 评论表单 (CommentForm)
- 自定义表单 (CustomForm)
## 导航组件
- 导航菜单 (NavMenu)
- 面包屑 (Breadcrumb)
- 标签页 (Tabs)
开发计划（Roadmap）

### ✅ 已完成
- 基础组件开发
- JSON模板导入导出
- 简单的预设页面和布局
- 拖拽吸附辅助线

### 🚧 进行中
- 预设页面和布局优化
- 更多组件库扩展
- HTML代码生成（预览与导出一致性优化）

### 📋 规划中
- 撤销/重做、复制/粘贴
- 快捷键支持
- 组件层级管理
- 响应式预览
- 多页面项目管理
- 历史版本/草稿
- Vue3代码生成
- SEO配置
- 组件仓库
## 开发说明
本项目在开发过程中使用了 AI 工具辅助编写代码、调试与优化文档。
所有核心设计与功能逻辑均由作者独立完成。
## License

This project is licensed under the **MIT License**.

- **Author**: DBmc-666
- **Permission**: 自由使用、复制、修改、合并、发布、分发、再授权及/或销售
- **Conditions**: 必须保留版权声明和本许可声明

See the [LICENSE](./LICENSE) file for full legal text.
