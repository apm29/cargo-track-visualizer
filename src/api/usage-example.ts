/**
 * 数据持久化层使用示例
 * 
 * 这个文件展示了如何使用我们创建的数据持久化层
 * 包括如何初始化、切换数据源、以及进行各种数据操作
 */

// 导入必要的模块
import { 
  initializeDataSource, 
  RepositoryFactory, 
  dataSourceManager, 
  DataSourceType 
} from './index'

/**
 * 基础使用示例
 */
export async function basicUsageExample() {
  console.log('=== 数据持久化层基础使用示例 ===')
  
  // 1. 初始化数据源配置
  initializeDataSource()
  console.log('✅ 数据源已初始化')
  
  // 2. 获取仓库实例
  const cargoRepo = RepositoryFactory.getCargoRepository()
  const taskRepo = RepositoryFactory.getTransportTaskRepository()
  const machineRepo = RepositoryFactory.getTransportMachineRepository()
  
  console.log('✅ 仓库实例已获取')
  
  try {
    // 3. 获取数据列表
    console.log('\n📋 获取货物列表...')
    const cargosResponse = await cargoRepo.getList({ page: 1, pageSize: 5 })
    console.log(`货物总数: ${cargosResponse.data.pagination.total}`)
    console.log(`当前页货物: ${cargosResponse.data.data.length} 个`)
    
    // 4. 获取任务列表
    console.log('\n📋 获取任务列表...')
    const tasksResponse = await taskRepo.getList({ page: 1, pageSize: 5 })
    console.log(`任务总数: ${tasksResponse.data.pagination.total}`)
    console.log(`当前页任务: ${tasksResponse.data.data.length} 个`)
    
    // 5. 获取机械列表
    console.log('\n📋 获取机械列表...')
    const machinesResponse = await machineRepo.getList({ page: 1, pageSize: 5 })
    console.log(`机械总数: ${machinesResponse.data.pagination.total}`)
    console.log(`当前页机械: ${machinesResponse.data.data.length} 个`)
    
    console.log('\n✅ 基础使用示例完成')
    
  } catch (error) {
    console.error('❌ 操作失败:', error)
  }
}

/**
 * 数据源切换示例
 */
export async function dataSourceSwitchExample() {
  console.log('\n=== 数据源切换示例 ===')
  
  try {
    // 1. 检查当前数据源
    const currentSource = dataSourceManager.getDataSourceType()
    console.log(`当前数据源: ${currentSource}`)
    
    // 2. 切换到 API 模式
    console.log('\n🔄 切换到 API 模式...')
    dataSourceManager.setDataSourceType(DataSourceType.API)
    console.log(`数据源已切换为: ${dataSourceManager.getDataSourceType()}`)
    
    // 3. 切换到 Mock 模式
    console.log('\n🔄 切换到 Mock 模式...')
    dataSourceManager.setDataSourceType(DataSourceType.MOCK)
    console.log(`数据源已切换为: ${dataSourceManager.getDataSourceType()}`)
    
    console.log('\n✅ 数据源切换示例完成')
    
  } catch (error) {
    console.error('❌ 数据源切换失败:', error)
  }
}

/**
 * 业务操作示例
 */
export async function businessOperationsExample() {
  console.log('\n=== 业务操作示例 ===')
  
  const cargoRepo = RepositoryFactory.getCargoRepository()
  const taskRepo = RepositoryFactory.getTransportTaskRepository()
  const machineRepo = RepositoryFactory.getTransportMachineRepository()
  
  try {
    // 1. 按区域获取货物
    console.log('\n📦 按区域获取货物...')
    const areaCargos = await cargoRepo.getCargosByArea('area-123')
    console.log(`区域货物数量: ${areaCargos.data.pagination.total}`)
    
    // 2. 按状态获取任务
    console.log('\n📋 按状态获取任务...')
    const pendingTasks = await taskRepo.getTasksByStatus('pending')
    console.log(`待处理任务数量: ${pendingTasks.data.pagination.total}`)
    
    // 3. 获取可用机械
    console.log('\n🔧 获取可用机械...')
    const availableMachines = await machineRepo.getAvailableMachines()
    console.log(`可用机械数量: ${availableMachines.data.length}`)
    
    // 4. 创建新任务
    console.log('\n➕ 创建新任务...')
    const newTask = await taskRepo.create({
      name: '示例转运任务',
      type: 'move' as any,
      startPosition: { x: 0, y: 0, z: 0 },
      targetPosition: { x: 10, y: 0, z: 10 },
      cargoIds: ['cargo-123'],
      priority: 2
    })
    console.log(`新任务已创建，ID: ${newTask.data.id}`)
    
    // 5. 开始任务
    console.log('\n▶️ 开始任务...')
    const startedTask = await taskRepo.startTask(newTask.data.id)
    console.log(`任务状态: ${startedTask.data.status}`)
    
    console.log('\n✅ 业务操作示例完成')
    
  } catch (error) {
    console.error('❌ 业务操作失败:', error)
  }
}

/**
 * 错误处理示例
 */
export async function errorHandlingExample() {
  console.log('\n=== 错误处理示例 ===')
  
  const cargoRepo = RepositoryFactory.getCargoRepository()
  
  try {
    // 尝试获取不存在的货物
    console.log('\n🔍 尝试获取不存在的货物...')
    await cargoRepo.getById('non-existent-id')
    
  } catch (error: any) {
    console.log('✅ 错误已被正确捕获')
    console.log(`错误类型: ${error.constructor.name}`)
    console.log(`错误信息: ${error.message}`)
    
    if (error.status) {
      console.log(`HTTP 状态码: ${error.status}`)
    }
  }
}

/**
 * 完整示例
 */
export async function runCompleteExample() {
  console.log('🚀 开始运行完整示例...\n')
  
  await basicUsageExample()
  await dataSourceSwitchExample()
  await businessOperationsExample()
  await errorHandlingExample()
  
  console.log('\n🎉 所有示例运行完成！')
}

/**
 * 快速开始示例
 */
export const quickStart = async () => {
  // 初始化
  initializeDataSource()
  
  // 获取仓库
  const cargoRepo = RepositoryFactory.getCargoRepository()
  
  try {
    // 获取数据
    const cargos = await cargoRepo.getList({ page: 1, pageSize: 5 })
    console.log(`成功获取 ${cargos.data.data.length} 个货物`)
    
    // 切换数据源
    dataSourceManager.setDataSourceType(DataSourceType.API)
    console.log('已切换到 API 模式')
    
  } catch (error) {
    console.error('操作失败:', error)
  }
}

// 如果直接运行此文件，执行完整示例
if (typeof window === 'undefined') {
  // Node.js 环境
  runCompleteExample().catch(console.error)
} 
