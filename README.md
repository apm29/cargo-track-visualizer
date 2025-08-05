# Track Sphere Cargo

一个基于 Vue 3 + Vite + TypeScript + Three.js 的3D可视化前端项目，专注于货物追踪和3D场景展示。

## 🎯 项目概述

Track Sphere Cargo 是一个现代化的3D可视化应用，结合了Vue3的响应式框架和Three.js的强大3D渲染能力。项目旨在为货物追踪系统提供直观的3D界面，让用户能够以沉浸式的方式查看和管理货物信息。

## 🛠️ 技术栈

- ⚡️ [Vite 5.0.0](https://vitejs.dev/) - 极速的前端构建工具
- 🖖 [Vue 3.5.18](https://vuejs.org/) - 渐进式JavaScript框架
- 🔧 [TypeScript 5.9.2](https://www.typescriptlang.org/) - 类型安全的JavaScript
- 📦 [TresJS 4.3.6](https://tresjs.org/) - Three.js的Vue组件库
- 🎨 [TresJS Cientos](https://cientos.tresjs.org/) - TresJS的预设组件集合
- 🌐 [Three.js 0.179.1](https://threejs.org/) - 3D图形库
- 🎯 [VueUse 13.6.0](https://vueuse.org/) - Vue组合式API工具集

## ✨ 核心功能

### 🎮 3D场景展示
- **交互式3D环境**：使用TresJS创建的响应式3D场景
- **轨道控制器**：支持鼠标拖拽、缩放和旋转视角
- **实时渲染**：流畅的3D图形渲染和动画效果
- **自适应布局**：响应式设计，适配不同屏幕尺寸

### 🎨 视觉设计
- **现代化UI**：简洁美观的用户界面
- **深色主题**：护眼的深色主题设计
- **流畅动画**：平滑的过渡和交互效果
- **3D元素**：橙色环形几何体作为示例3D对象

### 🔧 开发体验
- **热重载**：开发时实时预览代码更改
- **TypeScript支持**：完整的类型检查和智能提示
- **模块化架构**：清晰的代码组织结构
- **构建优化**：生产环境的代码压缩和优化

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

访问 `http://localhost:5173` 查看应用

### 构建生产版本

```bash
pnpm build
```

### 预览生产版本

```bash
pnpm preview
```

## 📁 项目结构

```
track-sphere-cargo/
├── src/
│   ├── components/     # Vue组件
│   ├── views/         # 页面组件
│   ├── assets/        # 静态资源
│   ├── utils/         # 工具函数
│   ├── App.vue        # 根组件 (包含3D场景)
│   ├── main.ts        # 应用入口
│   ├── style.css      # 全局样式
│   └── vite-env.d.ts  # 类型声明
├── index.html         # HTML模板
├── vite.config.ts     # Vite配置 (集成TresJS)
├── tsconfig.json      # TypeScript配置
├── tsconfig.node.json # Node.js TypeScript配置
├── package.json       # 项目配置
└── README.md          # 项目说明
```

## 🎮 3D场景特性

### 当前实现
- **TresCanvas**：3D渲染画布，支持全屏显示
- **PerspectiveCamera**：透视相机，位置在(3,3,3)，朝向原点
- **OrbitControls**：轨道控制器，支持鼠标交互
- **TorusGeometry**：环形几何体，参数为[1, 0.5, 16, 32]
- **MeshBasicMaterial**：基础材质，橙色
- **AmbientLight**：环境光，强度为1

### 交互功能
- 🖱️ **鼠标拖拽**：旋转3D场景视角
- 🔍 **滚轮缩放**：放大缩小场景
- 📱 **触摸支持**：移动设备触摸交互
- 🎯 **自动聚焦**：相机自动对准场景中心

## 🎨 样式特性

### 全局样式
- **响应式设计**：适配桌面和移动设备
- **深色主题**：护眼的深色背景
- **现代化字体**：Inter字体系统
- **平滑动画**：CSS过渡效果

### 主题支持
- 🌙 **深色模式**：默认深色主题
- ☀️ **浅色模式**：支持系统主题切换
- 🎨 **自定义颜色**：可配置的主题色彩

## 🔧 开发指南

### 添加新的3D组件

```vue
<template>
  <TresCanvas>
    <!-- 添加新的3D对象 -->
    <TresMesh>
      <TresBoxGeometry />
      <TresMeshBasicMaterial color="blue" />
    </TresMesh>
  </TresCanvas>
</template>
```

### 使用TresJS Cientos组件

```vue
<script setup>
import { OrbitControls, Text3D } from '@tresjs/cientos'
</script>

<template>
  <TresCanvas>
    <OrbitControls />
    <Text3D text="Hello World" />
  </TresCanvas>
</template>
```

### 添加交互功能

```vue
<script setup>
import { useRenderLoop } from '@tresjs/core'

const { onLoop } = useRenderLoop()

onLoop(() => {
  // 每帧执行的逻辑
})
</script>
```

## 🚀 部署

### 构建生产版本
```bash
pnpm build
```

### 部署到静态服务器
构建完成后，将 `dist` 目录部署到任何静态文件服务器。

### 环境变量
项目支持环境变量配置，可在 `.env` 文件中设置。

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 ISC 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Vue.js](https://vuejs.org/) - 渐进式JavaScript框架
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [TresJS](https://tresjs.org/) - Three.js的Vue组件
- [Three.js](https://threejs.org/) - 3D图形库 
