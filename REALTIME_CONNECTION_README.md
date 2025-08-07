# 实时连接功能说明

## 概述

本项目实现了模拟WebSocket实时连接功能，用于模拟货物位置的实时更新。该功能包括：

- 🔌 **实时连接管理**: 模拟WebSocket连接和断开
- 📦 **货物位置更新**: 每3秒随机更新一个货物的位置
- 🖥️ **系统状态监控**: 每10秒更新系统状态信息
- 🎨 **可视化效果**: 实时显示连接状态和货物更新动画

## 架构设计

### 1. RealTimeConnectionMockService

位于 `src/api/mock-service.ts`，提供以下功能：

```typescript
class RealTimeConnectionMockService extends MockService {
  // 连接管理
  async connect(): Promise<boolean>
  async disconnect(): Promise<boolean>
  getConnectionStatus(): boolean
  
  // 消息订阅
  subscribe(eventType: string, handler: (message: any) => void): void
  unsubscribe(eventType: string): void
  
  // 消息发送
  send(message: any): void
  sendCustomMessage(type: string, data: any): void
  
  // 错误处理
  simulateConnectionError(): void
  async reconnect(): Promise<boolean>
}
```

### 2. 数据存储集成

在 `src/stores/dataStore.ts` 中集成了实时连接功能：

```typescript
// 实时连接状态
const realTimeConnection = ref<any>(null)
const isConnected = ref(false)
const connectionError = ref<string | null>(null)
const lastCargoUpdate = ref<any>(null)
const systemStatus = ref<any>(null)

// 连接管理方法
const connectRealTime = async () => { /* ... */ }
const disconnectRealTime = async () => { /* ... */ }
const reconnectRealTime = async () => { /* ... */ }
```

### 3. 可视化组件

在 `src/components/Main.vue` 中实现了实时更新的可视化效果：

- 右上角显示连接状态指示器
- 货物位置更新时显示红色高亮效果
- 更新中的货物显示"位置更新中"标签
- 系统状态信息实时显示

## 功能特性

### 1. 自动连接

应用启动时自动建立实时连接：

```typescript
// 在 dataStore.loadData() 中
await dataStore.loadData()
// 数据加载完成后，自动连接实时服务
await connectRealTime()
```

### 2. 货物位置更新

每3秒随机选择一个货物进行位置更新：

```typescript
private sendCargoPositionUpdate(): void {
  // 随机选择货物
  const randomCargo = response.data.data[Math.floor(Math.random() * response.data.data.length)]
  
  // 生成新位置（在当前位置附近随机移动）
  const newPosition = {
    x: randomCargo.position.x + (Math.random() - 0.5) * 2, // ±1米
    y: randomCargo.position.y + (Math.random() - 0.5) * 0.5, // ±0.25米
    z: randomCargo.position.z + (Math.random() - 0.5) * 2, // ±1米
  }
  
  // 发送更新消息
  handler(updateMessage)
}
```

### 3. 系统状态监控

每10秒更新系统状态信息：

```typescript
private sendSystemStatusUpdate(): void {
  const statusMessage = {
    type: 'system_status',
    data: {
      systemHealth: {
        cpu: 20 + Math.random() * 30, // 20-50%
        memory: 40 + Math.random() * 40, // 40-80%
        network: 80 + Math.random() * 20, // 80-100%
        storage: 60 + Math.random() * 30, // 60-90%
      },
      activeConnections: 50 + Math.floor(Math.random() * 100),
      activeTasks: 10 + Math.floor(Math.random() * 20),
      activeMachines: 5 + Math.floor(Math.random() * 10),
      alerts: Math.floor(Math.random() * 5),
    }
  }
}
```

### 4. 错误处理

支持连接错误模拟和自动重连：

```typescript
// 模拟连接错误
realTimeConnection.value.simulateConnectionError()

// 自动重连
await dataStore.reconnectRealTime()
```

## 使用方法

### 1. 启动应用

```bash
npm run dev
```

### 2. 观察实时更新

- 打开浏览器控制台查看连接日志
- 观察右上角的连接状态指示器
- 每3秒会有一个货物位置更新，显示红色高亮效果
- 系统状态信息每10秒更新一次

### 3. 手动控制连接

在浏览器控制台中可以手动控制连接：

```javascript
// 获取数据存储实例
const dataStore = useDataStore()

// 断开连接
await dataStore.disconnectRealTime()

// 重新连接
await dataStore.connectRealTime()

// 模拟连接错误
dataStore.realTimeConnection.simulateConnectionError()
```

## 消息格式

### 货物位置更新消息

```typescript
{
  type: 'cargo_update',
  data: {
    cargoId: string,
    cargoName: string,
    oldPosition: { x: number, y: number, z: number },
    newPosition: { x: number, y: number, z: number },
    timestamp: string,
    speed: number,
    direction: { x: number, y: number, z: number },
    status: string,
    areaId: string,
  },
  messageId: string,
  timestamp: string,
}
```

### 系统状态消息

```typescript
{
  type: 'system_status',
  data: {
    timestamp: string,
    systemHealth: {
      cpu: number,
      memory: number,
      network: number,
      storage: number,
    },
    activeConnections: number,
    activeTasks: number,
    activeMachines: number,
    alerts: number,
    uptime: number,
  },
  messageId: string,
  timestamp: string,
}
```

## 扩展功能

### 1. 添加新的消息类型

```typescript
// 在 RealTimeConnectionMockService 中添加新的消息发送方法
private sendCustomUpdate(): void {
  const handler = this.messageHandlers.get('custom_update')
  if (!handler) return
  
  const message = {
    type: 'custom_update',
    data: { /* 自定义数据 */ },
    messageId: `msg-${Date.now()}`,
    timestamp: new Date().toISOString(),
  }
  
  handler(message)
}
```

### 2. 添加新的订阅处理

```typescript
// 在 dataStore 中添加新的消息处理
const handleCustomUpdate = (message: any) => {
  console.log('收到自定义更新:', message.data)
  // 处理自定义更新逻辑
}

// 订阅新消息类型
realTimeConnection.value.subscribe('custom_update', handleCustomUpdate)
```

## 注意事项

1. **性能考虑**: 实时更新频率可以根据需要调整
2. **错误处理**: 确保在生产环境中添加适当的错误处理机制
3. **数据一致性**: 确保实时更新不会影响数据的一致性
4. **用户体验**: 更新动画持续时间可以根据用户体验需求调整

## 故障排除

### 1. 连接失败

检查控制台错误信息，确保：
- Mock服务正常运行
- 数据源配置正确
- 网络连接正常

### 2. 更新不显示

检查：
- 货物数据是否正确加载
- 实时连接是否建立成功
- 消息处理器是否正确注册

### 3. 性能问题

可以调整：
- 更新频率（当前为3秒）
- 动画持续时间（当前为3秒）
- 同时更新的货物数量 
