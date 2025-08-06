# Pinia Store 使用说明

## 概述

本项目使用 Pinia 作为状态管理库，将数据加载和管理逻辑从组件中分离出来，提供更好的代码组织和可维护性。

## Store 结构

### dataStore (`src/stores/dataStore.ts`)

管理堆场可视化系统的核心数据，包括存储区域和货物信息。

#### 状态 (State)

- `storageAreas`: 存储区域列表
- `cargos`: 货物列表
- `loading`: 加载状态
- `error`: 错误信息

#### 计算属性 (Computed)

- `areasCount`: 区域数量
- `cargosCount`: 货物总数
- `visibleCargos`: 可见货物列表
- `getCargosByAreaId`: 根据区域ID获取货物
- `getCargosByStatus`: 根据状态获取货物
- `getAreasByType`: 根据类型获取区域

#### 方法 (Actions)

- `loadData()`: 加载数据
- `reloadData()`: 重新加载数据
- `clearData()`: 清除数据
- `getAreaById(id)`: 根据ID获取区域
- `getCargoById(id)`: 根据ID获取货物
- `updateCargoPosition(cargoId, position)`: 更新货物位置
- `updateCargoStatus(cargoId, status)`: 更新货物状态

## 使用方法

### 在组件中使用 Store

```vue
<script setup lang="ts">
import { useDataStore } from '../stores'

// 获取 store 实例
const dataStore = useDataStore()

// 解构需要的状态和方法
const { 
  storageAreas, 
  cargos, 
  loading, 
  error, 
  visibleCargos, 
  areasCount, 
  cargosCount, 
  reloadData 
} = dataStore

// 在组件挂载时加载数据
onMounted(() => {
  dataStore.loadData()
})
</script>

<template>
  <div>
    <p>区域数量: {{ areasCount }}</p>
    <p>货物数量: {{ cargosCount }}</p>
    <button @click="reloadData" :disabled="loading">
      {{ loading ? '加载中...' : '重新加载' }}
    </button>
  </div>
</template>
```

### 使用计算属性

```vue
<script setup lang="ts">
import { useDataStore } from '../stores'

const dataStore = useDataStore()

// 获取特定状态的货物
const storedCargos = dataStore.getCargosByStatus('stored')
const transitCargos = dataStore.getCargosByStatus('in_transit')

// 获取特定类型的区域
const storageAreas = dataStore.getAreasByType('storage')
const loadingAreas = dataStore.getAreasByType('loading')
</script>
```

### 更新数据

```vue
<script setup lang="ts">
import { useDataStore } from '../stores'

const dataStore = useDataStore()

// 更新货物位置
const updatePosition = (cargoId: string) => {
  dataStore.updateCargoPosition(cargoId, { x: 10, y: 0, z: 20 })
}

// 更新货物状态
const updateStatus = (cargoId: string) => {
  dataStore.updateCargoStatus(cargoId, 'in_transit')
}
</script>
```

## 工具函数

### visualization.ts (`src/utils/visualization.ts`)

提供可视化管理相关的工具函数：

- `getAreaBounds(area)`: 计算区域边界框
- `getAreaCenter(area)`: 计算区域中心点
- `getAreaSize(area)`: 计算区域尺寸
- `getAreaColor(area)`: 获取区域颜色
- `getCargoColor(cargo)`: 获取货物颜色

```vue
<script setup lang="ts">
import { getAreaCenter, getAreaSize, getAreaColor } from '../utils/visualization'

// 在组件中使用工具函数
const areaCenter = getAreaCenter(area)
const areaSize = getAreaSize(area)
const areaColor = getAreaColor(area)
</script>
```

## 优势

1. **状态集中管理**: 所有数据状态都在 store 中统一管理
2. **响应式数据**: 数据变化会自动触发组件更新
3. **代码复用**: 多个组件可以共享同一个 store
4. **类型安全**: 完整的 TypeScript 支持
5. **开发工具**: 支持 Vue DevTools 调试
6. **测试友好**: 可以独立测试 store 逻辑

## 注意事项

1. Store 中的数据是响应式的，直接修改会触发更新
2. 使用 `reloadData()` 方法重新加载数据
3. 错误处理会自动更新 `error` 状态
4. 加载状态可以通过 `loading` 属性控制 UI 显示 
