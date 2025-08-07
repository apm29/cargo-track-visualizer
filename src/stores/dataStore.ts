import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { RepositoryFactory } from '~/api'
import { MockServiceFactory, RealTimeConnectionMockService } from '~/api/mock-service'
import type { StorageArea, Cargo } from '~/types'
import type { Trajectory } from '~/types/trajectory'

export const useDataStore = defineStore('data', () => {
  // 状态
  const storageAreas = ref<StorageArea[]>([])
  const cargos = ref<Cargo[]>([])
  const trajectories = ref<Trajectory[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 实时连接相关状态
  const realTimeConnection = ref<RealTimeConnectionMockService | null>(null)
  const isConnected = ref(false)
  const connectionError = ref<string | null>(null)
  const lastCargoUpdate = ref<any>(null)
  const systemStatus = ref<any>(null)

  // 获取仓库实例
  const areaRepo = RepositoryFactory.getStorageAreaRepository()
  const cargoRepo = RepositoryFactory.getCargoRepository()
  const trajectoryRepo = RepositoryFactory.getTrajectoryRepository()

  // 计算属性
  const areasCount = computed(() => storageAreas.value.length)
  const cargosCount = computed(() => cargos.value.length)
  const trajectoriesCount = computed(() => trajectories.value.length)

  // 过滤显示的货物（只显示在区域内的）
  const visibleCargos = computed(() => {
    // 暂时返回所有货物，后续可以根据需要添加过滤逻辑
    return cargos.value
  })

  // 根据区域ID获取货物
  const getCargosByAreaId = computed(() => {
    return (areaId: string) => {
      return cargos.value.filter(cargo => cargo.areaId === areaId)
    }
  })

  // 根据状态获取货物
  const getCargosByStatus = computed(() => {
    return (status: Cargo['status']) => {
      return cargos.value.filter(cargo => cargo.status === status)
    }
  })

  // 根据类型获取区域
  const getAreasByType = computed(() => {
    return (type: StorageArea['type']) => {
      return storageAreas.value.filter(area => area.type === type)
    }
  })

  // 根据类型获取轨迹
  const getTrajectoriesByType = computed(() => {
    return (type: Trajectory['type']) => {
      return trajectories.value.filter(trajectory => trajectory.type === type)
    }
  })

  // 根据状态获取轨迹
  const getTrajectoriesByStatus = computed(() => {
    return (status: Trajectory['status']) => {
      return trajectories.value.filter(trajectory => trajectory.status === status)
    }
  })

  // 实时连接相关方法
  const connectRealTime = async () => {
    try {
      console.log('🔌 开始连接实时服务...')
      
      // 获取实时连接服务实例
      realTimeConnection.value = MockServiceFactory.getRealTimeConnectionService()
      
      // 订阅消息
      realTimeConnection.value.subscribe('cargo_update', handleCargoUpdate)
      realTimeConnection.value.subscribe('system_status', handleSystemStatus)
      realTimeConnection.value.subscribe('error', handleConnectionError)
      
      // 建立连接
      const connected = await realTimeConnection.value.connect()
      isConnected.value = connected
      connectionError.value = null
      
      console.log('✅ 实时连接成功')
    } catch (err: any) {
      console.error('❌ 实时连接失败:', err)
      connectionError.value = err.message || '连接失败'
      isConnected.value = false
    }
  }

  const disconnectRealTime = async () => {
    try {
      if (realTimeConnection.value) {
        // 取消订阅
        realTimeConnection.value.unsubscribe('cargo_update')
        realTimeConnection.value.unsubscribe('system_status')
        realTimeConnection.value.unsubscribe('error')
        
        // 断开连接
        await realTimeConnection.value.disconnect()
        realTimeConnection.value = null
        isConnected.value = false
        connectionError.value = null
        
        console.log('🔌 实时连接已断开')
      }
    } catch (err: any) {
      console.error('❌ 断开连接失败:', err)
    }
  }

  const handleCargoUpdate = (message: any) => {
    try {
      console.log('📦 收到货物位置更新:', message.data)
      lastCargoUpdate.value = message
      
      // 更新货物位置
      const { cargoId, newPosition } = message.data
      if (cargoId && newPosition) {
        updateCargoPosition(cargoId, newPosition)
      }
    } catch (error) {
      console.error('❌ 处理货物位置更新时出错:', error)
    }
  }

  const handleSystemStatus = (message: any) => {
    try {
      console.log('🖥️ 收到系统状态更新:', message.data)
      systemStatus.value = message.data
    } catch (error) {
      console.error('❌ 处理系统状态更新时出错:', error)
    }
  }

  const handleConnectionError = (message: any) => {
    try {
      console.error('❌ 连接错误:', message.data)
      connectionError.value = message.data.message
      isConnected.value = false
    } catch (error) {
      console.error('❌ 处理连接错误时出错:', error)
    }
  }

  const reconnectRealTime = async () => {
    console.log('🔄 尝试重新连接...')
    await disconnectRealTime()
    await new Promise(resolve => setTimeout(resolve, 1000)) // 等待1秒
    await connectRealTime()
  }

  // 加载数据
  const loadData = async () => {
    try {
      loading.value = true
      error.value = null

      console.log('🔄 开始加载数据...')

      // 并行加载区域、货物和轨迹数据
      const [areasResponse, cargosResponse, trajectoriesResponse] = await Promise.all([
        areaRepo.getList({ page: 1, pageSize: 500 }),
        cargoRepo.getList({ page: 1, pageSize: 500 }),
        trajectoryRepo.getList({ page: 1, pageSize: 500 }),
      ])

      storageAreas.value = areasResponse.data.data
      cargos.value = cargosResponse.data.data
      trajectories.value = trajectoriesResponse.data.data

      console.log('✅ 数据加载成功:', {
        areas: storageAreas.value.length,
        cargos: cargos.value.length,
        trajectories: trajectories.value.length,
      })

      // 显示一些调试信息
      if (storageAreas.value.length > 0) {
        console.log('📋 区域示例:', storageAreas.value[0])
      }
      if (cargos.value.length > 0) {
        console.log('📦 货物示例:', cargos.value[0])
      }
      if (trajectories.value.length > 0) {
        console.log('🛤️ 轨迹示例:', trajectories.value[0])
      }

      // 数据加载完成后，自动连接实时服务
      await connectRealTime()
    } catch (err: any) {
      console.error('❌ 数据加载失败:', err)
      error.value = err.message || '数据加载失败'
    } finally {
      loading.value = false
    }
  }

  // 重新加载数据
  const reloadData = () => {
    console.log('🔄 重新加载数据...')
    loadData()
  }

  // 清除数据
  const clearData = () => {
    storageAreas.value = []
    cargos.value = []
    trajectories.value = []
    error.value = null
  }

  // 获取单个区域
  const getAreaById = (id: string) => {
    return storageAreas.value.find(area => area.id === id)
  }

  // 获取单个货物
  const getCargoById = (id: string) => {
    return cargos.value.find(cargo => cargo.id === id)
  }

  // 获取单个轨迹
  const getTrajectoryById = (id: string) => {
    return trajectories.value.find(trajectory => trajectory.id === id)
  }

  // 更新货物位置
  const updateCargoPosition = (cargoId: string, position: Cargo['position']) => {
    const cargo = cargos.value.find(c => c.id === cargoId)
    if (cargo) {
      cargo.position = position
      cargo.updatedAt = new Date().toISOString()
      console.log(`📦 货物 ${cargo.name} 位置已更新:`, position)
    }
  }

  // 更新货物状态
  const updateCargoStatus = (cargoId: string, status: Cargo['status']) => {
    const cargo = cargos.value.find(c => c.id === cargoId)
    if (cargo) {
      cargo.status = status
      cargo.updatedAt = new Date().toISOString()
    }
  }

  // 更新轨迹状态
  const updateTrajectoryStatus = (trajectoryId: string, status: Trajectory['status']) => {
    const trajectory = trajectories.value.find(t => t.id === trajectoryId)
    if (trajectory) {
      trajectory.status = status
      trajectory.updatedAt = new Date().toISOString()
    }
  }

  return {
    // 状态
    storageAreas,
    cargos,
    trajectories,
    loading,
    error,

    // 实时连接状态
    realTimeConnection,
    isConnected,
    connectionError,
    lastCargoUpdate,
    systemStatus,

    // 计算属性
    areasCount,
    cargosCount,
    trajectoriesCount,
    visibleCargos,
    getCargosByAreaId,
    getCargosByStatus,
    getAreasByType,
    getTrajectoriesByType,
    getTrajectoriesByStatus,

    // 方法
    loadData,
    reloadData,
    clearData,
    getAreaById,
    getCargoById,
    getTrajectoryById,
    updateCargoPosition,
    updateCargoStatus,
    updateTrajectoryStatus,

    // 实时连接方法
    connectRealTime,
    disconnectRealTime,
    reconnectRealTime,
  }
}) 
