import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { RepositoryFactory } from '../api'
import type { StorageArea, Cargo } from '../types'

export const useDataStore = defineStore('data', () => {
  // 状态
  const storageAreas = ref<StorageArea[]>([])
  const cargos = ref<Cargo[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 获取仓库实例
  const areaRepo = RepositoryFactory.getStorageAreaRepository()
  const cargoRepo = RepositoryFactory.getCargoRepository()

  // 计算属性
  const areasCount = computed(() => storageAreas.value.length)
  const cargosCount = computed(() => cargos.value.length)

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

  // 加载数据
  const loadData = async () => {
    try {
      loading.value = true
      error.value = null

      console.log('🔄 开始加载数据...')

      // 并行加载区域和货物数据
      const [areasResponse, cargosResponse] = await Promise.all([
        areaRepo.getList({ page: 1, pageSize: 500 }),
        cargoRepo.getList({ page: 1, pageSize: 500 }),
      ])

      storageAreas.value = areasResponse.data.data
      cargos.value = cargosResponse.data.data

      console.log('✅ 数据加载成功:', {
        areas: storageAreas.value.length,
        cargos: cargos.value.length,
      })

      // 显示一些调试信息
      if (storageAreas.value.length > 0) {
        console.log('📋 区域示例:', storageAreas.value[0])
      }
      if (cargos.value.length > 0) {
        console.log('📦 货物示例:', cargos.value[0])
      }
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

  // 更新货物位置
  const updateCargoPosition = (cargoId: string, position: Cargo['position']) => {
    const cargo = cargos.value.find(c => c.id === cargoId)
    if (cargo) {
      cargo.position = position
      cargo.updatedAt = new Date().toISOString()
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

  return {
    // 状态
    storageAreas,
    cargos,
    loading,
    error,

    // 计算属性
    areasCount,
    cargosCount,
    visibleCargos,
    getCargosByAreaId,
    getCargosByStatus,
    getAreasByType,

    // 方法
    loadData,
    reloadData,
    clearData,
    getAreaById,
    getCargoById,
    updateCargoPosition,
    updateCargoStatus,
  }
}) 
