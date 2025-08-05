import { 
  RepositoryFactory, 
  dataSourceManager, 
  DataSourceType,
  initializeDataSource 
} from './index'

/**
 * 数据持久化层使用示例
 */
export class DataServiceExample {
  /**
   * 初始化数据源配置
   */
  static initialize() {
    // 初始化数据源配置（通常在应用启动时调用）
    initializeDataSource()
    
    console.log('当前数据源类型:', dataSourceManager.getDataSourceType())
    console.log('是否使用 Mock 数据:', dataSourceManager.isMockMode())
  }

  /**
   * 切换数据源
   */
  static switchDataSource(type: DataSourceType) {
    dataSourceManager.setDataSourceType(type)
    console.log(`已切换到 ${type} 数据源`)
  }

  /**
   * 货物数据操作示例
   */
  static async cargoExample() {
    const cargoRepo = RepositoryFactory.getCargoRepository()
    
    try {
      // 获取货物列表
      console.log('获取货物列表...')
      const cargosResponse = await cargoRepo.getList({ page: 1, pageSize: 10 })
      console.log('货物列表:', cargosResponse.data)

      // 获取单个货物
      if (cargosResponse.data.data.length > 0) {
        const cargoId = cargosResponse.data.data[0].id
        console.log(`获取货物 ${cargoId}...`)
        const cargoResponse = await cargoRepo.getById(cargoId)
        console.log('货物详情:', cargoResponse.data)
      }

      // 按区域获取货物
      console.log('按区域获取货物...')
      const areaCargosResponse = await cargoRepo.getCargosByArea('area-123')
      console.log('区域货物:', areaCargosResponse.data)

    } catch (error) {
      console.error('货物操作失败:', error)
    }
  }

  /**
   * 转运任务操作示例
   */
  static async taskExample() {
    const taskRepo = RepositoryFactory.getTransportTaskRepository()
    
    try {
      // 获取任务列表
      console.log('获取任务列表...')
      const tasksResponse = await taskRepo.getList({ page: 1, pageSize: 10 })
      console.log('任务列表:', tasksResponse.data)

      // 创建新任务
      console.log('创建新任务...')
      const newTask = {
        name: '测试转运任务',
        type: 'move' as any,
        startPosition: { x: 0, y: 0, z: 0 },
        targetPosition: { x: 10, y: 0, z: 10 },
        cargoIds: ['cargo-123'],
      }
      const createResponse = await taskRepo.create(newTask)
      console.log('创建的任务:', createResponse.data)

      // 开始任务
      if (createResponse.data.id) {
        console.log('开始任务...')
        const startResponse = await taskRepo.startTask(createResponse.data.id)
        console.log('任务状态:', startResponse.data.status)
      }

    } catch (error) {
      console.error('任务操作失败:', error)
    }
  }

  /**
   * 转运机械操作示例
   */
  static async machineExample() {
    const machineRepo = RepositoryFactory.getTransportMachineRepository()
    
    try {
      // 获取机械列表
      console.log('获取机械列表...')
      const machinesResponse = await machineRepo.getList({ page: 1, pageSize: 10 })
      console.log('机械列表:', machinesResponse.data)

      // 获取可用机械
      console.log('获取可用机械...')
      const availableMachinesResponse = await machineRepo.getAvailableMachines()
      console.log('可用机械:', availableMachinesResponse.data)

      // 获取机械状态
      if (machinesResponse.data.data.length > 0) {
        const machineId = machinesResponse.data.data[0].id
        console.log(`获取机械 ${machineId} 状态...`)
        const statusResponse = await machineRepo.getMachineStatus(machineId)
        console.log('机械状态:', statusResponse.data)
      }

    } catch (error) {
      console.error('机械操作失败:', error)
    }
  }

  /**
   * 堆场区域操作示例
   */
  static async areaExample() {
    const areaRepo = RepositoryFactory.getStorageAreaRepository()
    
    try {
      // 获取区域列表
      console.log('获取区域列表...')
      const areasResponse = await areaRepo.getList({ page: 1, pageSize: 10 })
      console.log('区域列表:', areasResponse.data)

      // 获取区域层级
      console.log('获取区域层级...')
      const hierarchyResponse = await areaRepo.getAreaHierarchy()
      console.log('区域层级:', hierarchyResponse.data)

    } catch (error) {
      console.error('区域操作失败:', error)
    }
  }

  /**
   * 轨迹数据操作示例
   */
  static async trajectoryExample() {
    const trajectoryRepo = RepositoryFactory.getTrajectoryRepository()
    
    try {
      // 获取轨迹列表
      console.log('获取轨迹列表...')
      const trajectoriesResponse = await trajectoryRepo.getList({ page: 1, pageSize: 10 })
      console.log('轨迹列表:', trajectoriesResponse.data)

      // 获取货物轨迹
      console.log('获取货物轨迹...')
      const cargoTrajectoryResponse = await trajectoryRepo.getCargoTrajectory('cargo-123')
      console.log('货物轨迹:', cargoTrajectoryResponse.data)

      // 获取机械轨迹
      console.log('获取机械轨迹...')
      const machineTrajectoryResponse = await trajectoryRepo.getMachineTrajectory('machine-123')
      console.log('机械轨迹:', machineTrajectoryResponse.data)

    } catch (error) {
      console.error('轨迹操作失败:', error)
    }
  }

  /**
   * 完整示例
   */
  static async runCompleteExample() {
    console.log('=== 数据持久化层使用示例 ===')
    
    // 初始化
    this.initialize()
    
    // 运行各个示例
    await this.cargoExample()
    await this.taskExample()
    await this.machineExample()
    await this.areaExample()
    await this.trajectoryExample()
    
    console.log('=== 示例完成 ===')
  }
}

/**
 * 快速使用示例
 */
export const quickExample = async () => {
  // 初始化数据源
  initializeDataSource()
  
  // 获取仓库实例
  const cargoRepo = RepositoryFactory.getCargoRepository()
  const taskRepo = RepositoryFactory.getTransportTaskRepository()
  
  try {
    // 获取货物列表
    const cargos = await cargoRepo.getList({ page: 1, pageSize: 5 })
    console.log('货物数量:', cargos.data.pagination.total)
    
    // 获取任务列表
    const tasks = await taskRepo.getList({ page: 1, pageSize: 5 })
    console.log('任务数量:', tasks.data.pagination.total)
    
    // 切换数据源
    dataSourceManager.setDataSourceType(DataSourceType.API)
    console.log('已切换到 API 模式')
    
  } catch (error) {
    console.error('操作失败:', error)
  }
} 
