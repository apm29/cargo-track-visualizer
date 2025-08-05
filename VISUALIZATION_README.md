# 堆场数据可视化系统

这是一个基于 Vue 3 + Three.js 的堆场数据可视化系统，展示通过数据持久化层获取的 StorageArea 和 Cargo 信息的 3D 可视化。

## 🎯 功能特性

- **3D 可视化**: 使用 Three.js 进行实时 3D 渲染
- **数据持久化**: 集成统一的数据持久化层，支持 API 和 Mock 数据
- **交互式界面**: 支持鼠标旋转、缩放和平移视角
- **实时数据**: 支持数据重新加载和实时更新
- **响应式设计**: 适配不同屏幕尺寸
- **类型安全**: 完整的 TypeScript 类型支持

## 🏗️ 系统架构

```
src/
├── api/                    # 数据持久化层
│   ├── client.ts          # HTTP 客户端
│   ├── config.ts          # 数据源配置
│   ├── mock-service.ts    # Mock 数据服务
│   ├── repositories.ts    # 数据仓库
│   └── index.ts          # 主入口
├── types/                 # TypeScript 类型定义
├── mocks/                 # Mock 数据生成器
├── components/            # Vue 组件
└── App.vue               # 主应用组件
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

### 3. 访问应用

打开浏览器访问 `http://localhost:5173`

## 📊 可视化说明

### StorageArea (存储区域)

- **表示方式**: 矩形框表示在堆场地面上
- **颜色编码**:
  - 🟢 绿色: 存储区 (storage)
  - 🔵 蓝色: 转运区 (transit)
  - 🟠 橙色: 装卸区 (loading)
  - 🟣 紫色: 卸载区 (unloading)
  - 🔴 红色: 维护区 (maintenance)
  - ⚫ 蓝灰色: 缓冲区 (buffer)
  - 🟡 粉色: 特殊区 (special)

### Cargo (货物)

- **表示方式**: 半透明的长方体
- **位置**: 根据货物的 position 属性定位
- **旋转**: rpy 都为 0（无旋转）
- **尺寸**: 根据货物的 dimensions 属性设置
- **颜色编码**:
  - 🟢 绿色: 已存储 (stored)
  - 🔵 蓝色: 转运中 (in_transit)
  - 🟠 橙色: 装卸中 (loading)
  - 🟣 紫色: 卸载中 (unloading)
  - 🔴 红色: 维护中 (maintenance)
  - 🟤 棕色: 损坏 (damaged)

## 🎮 交互操作

### 鼠标控制

- **左键拖拽**: 旋转视角
- **右键拖拽**: 平移视角
- **滚轮**: 缩放视角
- **双击**: 重置视角

### 界面控制

- **重新加载数据**: 点击"重新加载"按钮
- **切换数据源**: 点击"切换模式"按钮在 Mock 和 API 之间切换
- **查看统计**: 实时显示区域数量、货物数量等信息

## 🔧 数据源配置

### Mock 模式（默认）

- 使用本地生成的模拟数据
- 适合开发和演示
- 数据加载速度快

### API 模式

- 连接真实的后端 API
- 适合生产环境
- 需要配置正确的 API 端点

### 切换数据源

```typescript
import { dataSourceManager, DataSourceType } from './api'

// 切换到 API 模式
dataSourceManager.setDataSourceType(DataSourceType.API)

// 切换到 Mock 模式
dataSourceManager.setDataSourceType(DataSourceType.MOCK)
```

## 📁 文件结构

### 核心文件

- `App.vue`: 主应用组件，包含 3D 场景和 UI 界面
- `src/api/`: 数据持久化层，处理数据获取和缓存
- `src/types/`: TypeScript 类型定义
- `src/mocks/`: Mock 数据生成器

### 组件文件

- `DataVisualizationDemo.vue`: 演示组件，提供更好的用户体验

## 🎨 自定义配置

### 修改颜色方案

在 `App.vue` 中修改 `getAreaColor` 和 `getCargoColor` 函数：

```typescript
const getAreaColor = (area: StorageArea) => {
  switch (area.type) {
    case 'storage': return '#your-color'
    // ... 其他颜色
  }
}
```

### 调整 3D 场景

修改 `TresCanvas` 的配置：

```vue
<TresCanvas 
  clear-color="#your-background-color" 
  :antialias="true"
  :shadow-map="true"
>
```

### 自定义相机位置

```vue
<TresPerspectiveCamera 
  :position="[x, y, z]" 
  :look-at="[targetX, targetY, targetZ]" 
/>
```

## 🐛 故障排除

### 常见问题

1. **数据加载失败**
   - 检查网络连接
   - 确认 API 端点配置正确
   - 查看浏览器控制台错误信息

2. **3D 场景不显示**
   - 确认 Three.js 依赖已安装
   - 检查 WebGL 支持
   - 查看控制台错误信息

3. **性能问题**
   - 减少同时显示的物体数量
   - 启用 LOD（细节层次）
   - 优化材质和纹理

### 调试模式

启用调试信息：

```typescript
// 在浏览器控制台中查看详细日志
console.log('数据加载状态:', loading.value)
console.log('区域数据:', storageAreas.value)
console.log('货物数据:', cargos.value)
```

## 📈 性能优化

### 渲染优化

- 使用 `TresInstancedMesh` 渲染大量相同物体
- 启用视锥体剔除
- 使用 LOD 系统

### 数据优化

- 实现数据分页加载
- 使用虚拟滚动
- 缓存频繁访问的数据

## 🔮 未来扩展

### 计划功能

- [ ] 实时数据更新
- [ ] 动画效果
- [ ] 更多交互功能
- [ ] 数据导出功能
- [ ] 多用户协作

### 技术改进

- [ ] WebGL 2.0 支持
- [ ] PBR 材质
- [ ] 后处理效果
- [ ] VR/AR 支持

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**注意**: 这是一个演示项目，生产环境使用前请进行充分测试和优化。 
