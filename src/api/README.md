# 数据持久化层

这是一个统一的数据持久化层，支持真实 API 和 Mock 数据的无缝切换。

## 功能特性

- 🔄 **数据源切换**: 支持 API 和 Mock 数据源的动态切换
- 🏗️ **统一接口**: 提供统一的仓库模式接口
- 🎭 **Mock 数据**: 内置丰富的 Mock 数据生成器
- 🔧 **类型安全**: 完整的 TypeScript 类型支持
- ⚡ **性能优化**: 支持请求缓存和错误处理
- 🎯 **业务逻辑**: 内置业务相关的查询方法

## 架构设计

```
src/api/
├── client.ts          # HTTP 客户端
├── config.ts          # 数据源配置管理
├── mock-service.ts    # Mock 数据服务
├── repositories.ts    # 数据仓库层
├── index.ts          # 主入口文件
├── example.ts        # 使用示例
└── README.md         # 文档
```

## 快速开始

### 1. 初始化

```typescript
import { initializeDataSource, RepositoryFactory } from '@/api'

// 在应用启动时初始化
initializeDataSource()
```

### 2. 基本使用

```typescript
// 获取仓库实例
const cargoRepo = RepositoryFactory.getCargoRepository()
const taskRepo = RepositoryFactory.getTransportTaskRepository()

// 获取数据
const cargos = await cargoRepo.getList({ page: 1, pageSize: 10 })
const tasks = await taskRepo.getList({ page: 1, pageSize: 10 })
```

### 3. 切换数据源

```typescript
import { dataSourceManager, DataSourceType } from '@/api'

// 切换到 API 模式
dataSourceManager.setDataSourceType(DataSourceType.API)

// 切换到 Mock 模式
dataSourceManager.setDataSourceType(DataSourceType.MOCK)
```

## 核心组件

### 1. 数据源管理器 (DataSourceManager)

管理数据源配置和切换：

```typescript
import { dataSourceManager } from '@/api'

// 获取当前配置
const config = dataSourceManager.getConfig()

// 更新配置
dataSourceManager.updateConfig({
  type: DataSourceType.MOCK,
  mockConfig: {
    delay: 500,
    enableRandomError: false,
    errorRate: 0.05
  }
})
```

### 2. HTTP 客户端 (HttpClient)

处理 API 请求：

```typescript
import { apiClient } from '@/api'

// GET 请求
const response = await apiClient.get('/cargos', { page: 1 })

// POST 请求
const newCargo = await apiClient.post('/cargos', cargoData)

// PUT 请求
const updatedCargo = await apiClient.put('/cargos/123', updateData)

// DELETE 请求
await apiClient.delete('/cargos/123')
```

### 3. 数据仓库 (Repository)

提供统一的数据访问接口：

```typescript
import { RepositoryFactory } from '@/api'

// 获取各种仓库实例
const cargoRepo = RepositoryFactory.getCargoRepository()
const areaRepo = RepositoryFactory.getStorageAreaRepository()
const taskRepo = RepositoryFactory.getTransportTaskRepository()
const machineRepo = RepositoryFactory.getTransportMachineRepository()
const trajectoryRepo = RepositoryFactory.getTrajectoryRepository()
```

## 仓库方法

所有仓库都提供以下基础方法：

### 基础 CRUD 操作

```typescript
// 获取列表（支持分页和过滤）
const response = await repo.getList({ 
  page: 1, 
  pageSize: 10,
  type: 'tank',
  status: 'stored'
})

// 获取单个项目
const item = await repo.getById('item-id')

// 创建新项目
const newItem = await repo.create(itemData)

// 更新项目
const updatedItem = await repo.update('item-id', updateData)

// 删除项目
await repo.delete('item-id')
```

### 业务特定方法

#### 货物仓库 (CargoRepository)

```typescript
// 按区域获取货物
const areaCargos = await cargoRepo.getCargosByArea('area-id')

// 按类型获取货物
const typeCargos = await cargoRepo.getCargosByType('tank')

// 按状态获取货物
const statusCargos = await cargoRepo.getCargosByStatus('stored')
```

#### 转运任务仓库 (TransportTaskRepository)

```typescript
// 按类型获取任务
const typeTasks = await taskRepo.getTasksByType('move')

// 按状态获取任务
const statusTasks = await taskRepo.getTasksByStatus('pending')

// 按优先级获取任务
const priorityTasks = await taskRepo.getTasksByPriority(3)

// 按机械获取任务
const machineTasks = await taskRepo.getTasksByMachine('machine-id')

// 分配任务
await taskRepo.assignTask('task-id', 'machine-id')

// 开始任务
await taskRepo.startTask('task-id')

// 完成任务
await taskRepo.completeTask('task-id')
```

#### 转运机械仓库 (TransportMachineRepository)

```typescript
// 按类型获取机械
const typeMachines = await machineRepo.getMachinesByType('crane')

// 按状态获取机械
const statusMachines = await machineRepo.getMachinesByStatus('idle')

// 获取可用机械
const availableMachines = await machineRepo.getAvailableMachines()

// 获取机械状态
const machineStatus = await machineRepo.getMachineStatus('machine-id')
```

#### 堆场区域仓库 (StorageAreaRepository)

```typescript
// 按类型获取区域
const typeAreas = await areaRepo.getAreasByType('storage')

// 按状态获取区域
const statusAreas = await areaRepo.getAreasByStatus('active')

// 获取区域层级
const hierarchy = await areaRepo.getAreaHierarchy()
```

#### 轨迹仓库 (TrajectoryRepository)

```typescript
// 按类型获取轨迹
const typeTrajectories = await trajectoryRepo.getTrajectoriesByType('cargo_movement')

// 按状态获取轨迹
const statusTrajectories = await trajectoryRepo.getTrajectoriesByStatus('completed')

// 获取货物轨迹
const cargoTrajectory = await trajectoryRepo.getCargoTrajectory('cargo-id')

// 获取机械轨迹
const machineTrajectory = await trajectoryRepo.getMachineTrajectory('machine-id')
```

## Mock 数据配置

### 环境配置

```typescript
// 开发环境
{
  defaultDataSource: DataSourceType.MOCK,
  apiBaseURL: 'http://localhost:3000/api',
  mockDelay: 300
}

// 生产环境
{
  defaultDataSource: DataSourceType.API,
  apiBaseURL: '/api',
  mockDelay: 0
}
```

### Mock 配置选项

```typescript
{
  delay: 500,              // 模拟网络延迟（毫秒）
  enableRandomError: false, // 是否启用随机错误
  errorRate: 0.05          // 错误率（0-1）
}
```

## 错误处理

```typescript
import { ApiError } from '@/api'

try {
  const response = await cargoRepo.getById('non-existent-id')
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`API 错误: ${error.status} - ${error.message}`)
  } else {
    console.error('未知错误:', error)
  }
}
```

## 响应格式

所有 API 响应都遵循统一格式：

```typescript
interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  code?: number
}

// 分页响应格式
interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}
```

## 完整示例

```typescript
import { 
  initializeDataSource, 
  RepositoryFactory, 
  dataSourceManager, 
  DataSourceType 
} from '@/api'

async function example() {
  // 初始化
  initializeDataSource()
  
  // 获取仓库
  const cargoRepo = RepositoryFactory.getCargoRepository()
  const taskRepo = RepositoryFactory.getTransportTaskRepository()
  
  try {
    // 获取货物列表
    const cargos = await cargoRepo.getList({ page: 1, pageSize: 10 })
    console.log('货物数量:', cargos.data.pagination.total)
    
    // 创建转运任务
    const newTask = await taskRepo.create({
      name: '转运任务',
      type: 'move',
      startPosition: { x: 0, y: 0, z: 0 },
      targetPosition: { x: 10, y: 0, z: 10 },
      cargoIds: ['cargo-123']
    })
    
    // 开始任务
    await taskRepo.startTask(newTask.data.id)
    
    // 切换到 API 模式
    dataSourceManager.setDataSourceType(DataSourceType.API)
    
  } catch (error) {
    console.error('操作失败:', error)
  }
}
```

## 最佳实践

1. **初始化**: 在应用启动时调用 `initializeDataSource()`
2. **错误处理**: 始终使用 try-catch 包装异步操作
3. **类型安全**: 利用 TypeScript 类型检查确保数据正确性
4. **缓存策略**: 对于频繁访问的数据考虑实现缓存
5. **环境配置**: 根据环境自动选择合适的默认数据源

## 扩展指南

### 添加新的仓库

1. 创建新的仓库类继承 `BaseRepositoryImpl`
2. 实现 `getMockService()` 方法
3. 在 `RepositoryFactory` 中添加获取方法
4. 在 `index.ts` 中导出新仓库

### 添加新的 Mock 服务

1. 创建新的 Mock 服务类继承 `MockService`
2. 实现具体的业务方法
3. 在 `MockServiceFactory` 中添加获取方法
4. 在 `index.ts` 中导出新服务 
