import { MockDataGenerator } from '../mocks/data-generator'
import { dataSourceManager } from './config'
import { ApiResponse, ApiError } from './client'
import { Cargo, StorageArea, TransportTask, TransportMachine, Trajectory, Position } from '../types'

/**
 * Mock 服务基类
 */
export abstract class MockService {
  protected mockConfig: any

  constructor() {
    this.mockConfig = dataSourceManager.getMockConfig()
  }

  /**
   * 模拟网络延迟
   */
  protected async simulateDelay(): Promise<void> {
    if (this.mockConfig?.delay) {
      await new Promise(resolve => setTimeout(resolve, this.mockConfig.delay))
    }
  }

  /**
   * 模拟随机错误
   */
  protected simulateRandomError(): void {
    if (this.mockConfig?.enableRandomError && this.mockConfig?.errorRate) {
      if (Math.random() < this.mockConfig.errorRate) {
        throw new ApiError(500, '模拟随机错误')
      }
    }
  }

  /**
   * 创建成功响应
   */
  protected createSuccessResponse<T>(data: T): ApiResponse<T> {
    return {
      success: true,
      data,
      message: '操作成功',
    }
  }

  /**
   * 创建分页响应
   */
  protected createPaginatedResponse<T>(
    data: T[],
    page: number = 1,
    pageSize: number = 10,
    total: number = data.length
  ): ApiResponse<{
    data: T[]
    pagination: {
      page: number
      pageSize: number
      total: number
      totalPages: number
    }
  }> {
    return {
      success: true,
      data: {
        data,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
      message: '查询成功',
    }
  }
}

/**
 * 货物 Mock 服务
 */
export class CargoMockService extends MockService {
  private cargos: Cargo[] = []

  constructor() {
    super()
    // 初始化一些测试数据
    this.cargos = MockDataGenerator.generateBatch(MockDataGenerator.generateCargo, 3, {
      dimensions: {
        length: 10,
        height: 5,
        width: 5,
      },
      orientation: {
        pitch: 0,
        roll: 0,
        yaw: 0,
      },
    }).map(cargo => ({
      ...cargo,
      position: {
        ...cargo.position,
        y: 0,
      },
    }))
  }

  /**
   * 获取货物列表 (统一接口)
   */
  async getList(params?: {
    page?: number
    pageSize?: number
    type?: string
    status?: string
    areaId?: string
  }): Promise<ApiResponse<any>> {
    return this.getCargos(params)
  }

  /**
   * 获取单个货物 (统一接口)
   */
  async getById(id: string): Promise<ApiResponse<Cargo>> {
    return this.getCargo(id)
  }

  /**
   * 创建货物 (统一接口)
   */
  async create(data: Partial<Cargo>): Promise<ApiResponse<Cargo>> {
    return this.createCargo(data)
  }

  /**
   * 更新货物 (统一接口)
   */
  async update(id: string, data: Partial<Cargo>): Promise<ApiResponse<Cargo>> {
    return this.updateCargo(id, data)
  }

  /**
   * 删除货物 (统一接口)
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    return this.deleteCargo(id)
  }

  /**
   * 获取货物列表
   */
  async getCargos(params?: {
    page?: number
    pageSize?: number
    type?: string
    status?: string
    areaId?: string
  }): Promise<ApiResponse<any>> {
    await this.simulateDelay()
    this.simulateRandomError()

    let filteredCargos = [...this.cargos]

    // 应用过滤条件
    if (params?.type) {
      filteredCargos = filteredCargos.filter(cargo => cargo.type === params.type)
    }
    if (params?.status) {
      filteredCargos = filteredCargos.filter(cargo => cargo.status === params.status)
    }
    if (params?.areaId) {
      filteredCargos = filteredCargos.filter(cargo => cargo.areaId === params.areaId)
    }

    const page = params?.page || 1
    const pageSize = params?.pageSize || 10
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedData = filteredCargos.slice(start, end)

    return this.createPaginatedResponse(paginatedData, page, pageSize, filteredCargos.length)
  }

  /**
   * 获取单个货物
   */
  async getCargo(id: string): Promise<ApiResponse<Cargo>> {
    await this.simulateDelay()
    this.simulateRandomError()

    const cargo = this.cargos.find(c => c.id === id)
    if (!cargo) {
      throw new ApiError(404, '货物不存在')
    }

    return this.createSuccessResponse(cargo)
  }

  /**
   * 创建货物
   */
  async createCargo(data: Partial<Cargo>): Promise<ApiResponse<Cargo>> {
    await this.simulateDelay()
    this.simulateRandomError()

    const newCargo = MockDataGenerator.generateCargo(data)
    this.cargos.push(newCargo)

    return this.createSuccessResponse(newCargo)
  }

  /**
   * 更新货物
   */
  async updateCargo(id: string, data: Partial<Cargo>): Promise<ApiResponse<Cargo>> {
    await this.simulateDelay()
    this.simulateRandomError()

    const index = this.cargos.findIndex(c => c.id === id)
    if (index === -1) {
      throw new ApiError(404, '货物不存在')
    }

    this.cargos[index] = { ...this.cargos[index], ...data, updatedAt: new Date().toISOString() }

    return this.createSuccessResponse(this.cargos[index])
  }

  /**
   * 删除货物
   */
  async deleteCargo(id: string): Promise<ApiResponse<void>> {
    await this.simulateDelay()
    this.simulateRandomError()

    const index = this.cargos.findIndex(c => c.id === id)
    if (index === -1) {
      throw new ApiError(404, '货物不存在')
    }

    this.cargos.splice(index, 1)

    return this.createSuccessResponse(undefined)
  }
}

/**
 * 堆场区域 Mock 服务
 */
export class StorageAreaMockService extends MockService {
  private areas: StorageArea[] = []

  constructor() {
    super()
    const row = 8
    const col = 10
    const width = 10
    const depth = 5
    const height = 15
    const gap = 1
    
    // 计算整个区域的边界
    const totalWidth = col * width + (col - 1) * gap
    const totalDepth = row * depth + (row - 1) * gap
    const startX = -totalWidth / 2
    const startZ = -totalDepth / 2
    
    // 生成基础区域数据
    const areas = MockDataGenerator.generateBatch(MockDataGenerator.generateStorageArea, row * col)
    
    this.areas = areas.map((area, index) => {
      const rowIndex = Math.floor(index / col)
      const colIndex = index % col
      
      // 计算当前区域的中心坐标
      const centerX = startX + colIndex * (width + gap) + width / 2
      const centerZ = startZ + rowIndex * (depth + gap) + depth / 2
      
      // 生成矩形的四个边界点（按顺时针顺序）
      const points: Position[] = [
        { x: centerX + width / 2, y: 0, z: centerZ - depth / 2 }, // 右上
        { x: centerX + width / 2, y: 0, z: centerZ + depth / 2 }, // 右下
        { x: centerX - width / 2, y: 0, z: centerZ + depth / 2 }, // 左下
        { x: centerX - width / 2, y: 0, z: centerZ - depth / 2 }, // 左上
      ]
      
      return {
        ...area,
        name: `区域 ${rowIndex + 1}-${colIndex + 1}`,
        boundary: {
          ...area.boundary,
          points,
          height,
        }
      }
    })
  }

  /**
   * 获取区域列表 (统一接口)
   */
  async getList(params?: {
    page?: number
    pageSize?: number
    type?: string
    status?: string
  }): Promise<ApiResponse<any>> {
    return this.getAreas(params)
  }

  /**
   * 获取单个区域 (统一接口)
   */
  async getById(id: string): Promise<ApiResponse<StorageArea>> {
    return this.getArea(id)
  }

  /**
   * 创建区域 (统一接口)
   */
  async create(data: Partial<StorageArea>): Promise<ApiResponse<StorageArea>> {
    await this.simulateDelay()
    this.simulateRandomError()

    const newArea = MockDataGenerator.generateStorageArea(data)
    this.areas.push(newArea)

    return this.createSuccessResponse(newArea)
  }

  /**
   * 更新区域 (统一接口)
   */
  async update(id: string, data: Partial<StorageArea>): Promise<ApiResponse<StorageArea>> {
    await this.simulateDelay()
    this.simulateRandomError()

    const index = this.areas.findIndex(a => a.id === id)
    if (index === -1) {
      throw new ApiError(404, '区域不存在')
    }

    this.areas[index] = { ...this.areas[index], ...data, updatedAt: new Date().toISOString() }

    return this.createSuccessResponse(this.areas[index])
  }

  /**
   * 删除区域 (统一接口)
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    await this.simulateDelay()
    this.simulateRandomError()

    const index = this.areas.findIndex(a => a.id === id)
    if (index === -1) {
      throw new ApiError(404, '区域不存在')
    }

    this.areas.splice(index, 1)

    return this.createSuccessResponse(undefined)
  }

  /**
   * 获取区域列表
   */
  async getAreas(params?: {
    page?: number
    pageSize?: number
    type?: string
    status?: string
  }): Promise<ApiResponse<any>> {
    await this.simulateDelay()
    this.simulateRandomError()

    let filteredAreas = [...this.areas]

    if (params?.type) {
      filteredAreas = filteredAreas.filter(area => area.type === params.type)
    }
    if (params?.status) {
      filteredAreas = filteredAreas.filter(area => area.status === params.status)
    }

    const page = params?.page || 1
    const pageSize = params?.pageSize || 10
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedData = filteredAreas.slice(start, end)

    return this.createPaginatedResponse(paginatedData, page, pageSize, filteredAreas.length)
  }

  /**
   * 获取单个区域
   */
  async getArea(id: string): Promise<ApiResponse<StorageArea>> {
    await this.simulateDelay()
    this.simulateRandomError()

    const area = this.areas.find(a => a.id === id)
    if (!area) {
      throw new ApiError(404, '区域不存在')
    }

    return this.createSuccessResponse(area)
  }
}

/**
 * 转运任务 Mock 服务
 */
export class TransportTaskMockService extends MockService {
  private tasks: TransportTask[] = []

  constructor() {
    super()
    this.tasks = MockDataGenerator.generateBatch(MockDataGenerator.generateTransportTask, 15)
  }

  /**
   * 获取任务列表 (统一接口)
   */
  async getList(params?: {
    page?: number
    pageSize?: number
    type?: string
    status?: string
    priority?: number
  }): Promise<ApiResponse<any>> {
    return this.getTasks(params)
  }

  /**
   * 获取单个任务 (统一接口)
   */
  async getById(id: string): Promise<ApiResponse<TransportTask>> {
    return this.getTask(id)
  }

  /**
   * 创建任务 (统一接口)
   */
  async create(data: Partial<TransportTask>): Promise<ApiResponse<TransportTask>> {
    return this.createTask(data)
  }

  /**
   * 更新任务 (统一接口)
   */
  async update(id: string, data: Partial<TransportTask>): Promise<ApiResponse<TransportTask>> {
    return this.updateTask(id, data)
  }

  /**
   * 删除任务 (统一接口)
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    await this.simulateDelay()
    this.simulateRandomError()

    const index = this.tasks.findIndex(t => t.id === id)
    if (index === -1) {
      throw new ApiError(404, '任务不存在')
    }

    this.tasks.splice(index, 1)

    return this.createSuccessResponse(undefined)
  }

  /**
   * 获取任务列表
   */
  async getTasks(params?: {
    page?: number
    pageSize?: number
    type?: string
    status?: string
    priority?: number
  }): Promise<ApiResponse<any>> {
    await this.simulateDelay()
    this.simulateRandomError()

    let filteredTasks = [...this.tasks]

    if (params?.type) {
      filteredTasks = filteredTasks.filter(task => task.type === params.type)
    }
    if (params?.status) {
      filteredTasks = filteredTasks.filter(task => task.status === params.status)
    }
    if (params?.priority) {
      filteredTasks = filteredTasks.filter(task => task.priority === params.priority)
    }

    const page = params?.page || 1
    const pageSize = params?.pageSize || 10
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedData = filteredTasks.slice(start, end)

    return this.createPaginatedResponse(paginatedData, page, pageSize, filteredTasks.length)
  }

  /**
   * 获取单个任务
   */
  async getTask(id: string): Promise<ApiResponse<TransportTask>> {
    await this.simulateDelay()
    this.simulateRandomError()

    const task = this.tasks.find(t => t.id === id)
    if (!task) {
      throw new ApiError(404, '任务不存在')
    }

    return this.createSuccessResponse(task)
  }

  /**
   * 创建任务
   */
  async createTask(data: Partial<TransportTask>): Promise<ApiResponse<TransportTask>> {
    await this.simulateDelay()
    this.simulateRandomError()

    const newTask = MockDataGenerator.generateTransportTask(data)
    this.tasks.push(newTask)

    return this.createSuccessResponse(newTask)
  }

  /**
   * 更新任务
   */
  async updateTask(id: string, data: Partial<TransportTask>): Promise<ApiResponse<TransportTask>> {
    await this.simulateDelay()
    this.simulateRandomError()

    const index = this.tasks.findIndex(t => t.id === id)
    if (index === -1) {
      throw new ApiError(404, '任务不存在')
    }

    this.tasks[index] = { ...this.tasks[index], ...data, updatedAt: new Date().toISOString() }

    return this.createSuccessResponse(this.tasks[index])
  }
}

/**
 * 转运机械 Mock 服务
 */
export class TransportMachineMockService extends MockService {
  private machines: TransportMachine[] = []

  constructor() {
    super()
    this.machines = MockDataGenerator.generateBatch(MockDataGenerator.generateTransportMachine, 8)
  }

  /**
   * 获取机械列表 (统一接口)
   */
  async getList(params?: {
    page?: number
    pageSize?: number
    type?: string
    status?: string
  }): Promise<ApiResponse<any>> {
    return this.getMachines(params)
  }

  /**
   * 获取单个机械 (统一接口)
   */
  async getById(id: string): Promise<ApiResponse<TransportMachine>> {
    return this.getMachine(id)
  }

  /**
   * 创建机械 (统一接口)
   */
  async create(data: Partial<TransportMachine>): Promise<ApiResponse<TransportMachine>> {
    await this.simulateDelay()
    this.simulateRandomError()

    const newMachine = MockDataGenerator.generateTransportMachine(data)
    this.machines.push(newMachine)

    return this.createSuccessResponse(newMachine)
  }

  /**
   * 更新机械 (统一接口)
   */
  async update(
    id: string,
    data: Partial<TransportMachine>
  ): Promise<ApiResponse<TransportMachine>> {
    await this.simulateDelay()
    this.simulateRandomError()

    const index = this.machines.findIndex(m => m.id === id)
    if (index === -1) {
      throw new ApiError(404, '机械不存在')
    }

    this.machines[index] = { ...this.machines[index], ...data, updatedAt: new Date().toISOString() }

    return this.createSuccessResponse(this.machines[index])
  }

  /**
   * 删除机械 (统一接口)
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    await this.simulateDelay()
    this.simulateRandomError()

    const index = this.machines.findIndex(m => m.id === id)
    if (index === -1) {
      throw new ApiError(404, '机械不存在')
    }

    this.machines.splice(index, 1)

    return this.createSuccessResponse(undefined)
  }

  /**
   * 获取机械列表
   */
  async getMachines(params?: {
    page?: number
    pageSize?: number
    type?: string
    status?: string
  }): Promise<ApiResponse<any>> {
    await this.simulateDelay()
    this.simulateRandomError()

    let filteredMachines = [...this.machines]

    if (params?.type) {
      filteredMachines = filteredMachines.filter(machine => machine.type === params.type)
    }
    if (params?.status) {
      filteredMachines = filteredMachines.filter(machine => machine.status === params.status)
    }

    const page = params?.page || 1
    const pageSize = params?.pageSize || 10
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedData = filteredMachines.slice(start, end)

    return this.createPaginatedResponse(paginatedData, page, pageSize, filteredMachines.length)
  }

  /**
   * 获取单个机械
   */
  async getMachine(id: string): Promise<ApiResponse<TransportMachine>> {
    await this.simulateDelay()
    this.simulateRandomError()

    const machine = this.machines.find(m => m.id === id)
    if (!machine) {
      throw new ApiError(404, '机械不存在')
    }

    return this.createSuccessResponse(machine)
  }
}

/**
 * 轨迹 Mock 服务
 */
export class TrajectoryMockService extends MockService {
  private trajectories: Trajectory[] = []

  constructor() {
    super()
    this.trajectories = MockDataGenerator.generateBatch(MockDataGenerator.generateTrajectory, 12)
  }

  /**
   * 获取轨迹列表 (统一接口)
   */
  async getList(params?: {
    page?: number
    pageSize?: number
    type?: string
    status?: string
  }): Promise<ApiResponse<any>> {
    return this.getTrajectories(params)
  }

  /**
   * 获取单个轨迹 (统一接口)
   */
  async getById(id: string): Promise<ApiResponse<Trajectory>> {
    return this.getTrajectory(id)
  }

  /**
   * 创建轨迹 (统一接口)
   */
  async create(data: Partial<Trajectory>): Promise<ApiResponse<Trajectory>> {
    await this.simulateDelay()
    this.simulateRandomError()

    const newTrajectory = MockDataGenerator.generateTrajectory(data)
    this.trajectories.push(newTrajectory)

    return this.createSuccessResponse(newTrajectory)
  }

  /**
   * 更新轨迹 (统一接口)
   */
  async update(id: string, data: Partial<Trajectory>): Promise<ApiResponse<Trajectory>> {
    await this.simulateDelay()
    this.simulateRandomError()

    const index = this.trajectories.findIndex(t => t.id === id)
    if (index === -1) {
      throw new ApiError(404, '轨迹不存在')
    }

    this.trajectories[index] = {
      ...this.trajectories[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }

    return this.createSuccessResponse(this.trajectories[index])
  }

  /**
   * 删除轨迹 (统一接口)
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    await this.simulateDelay()
    this.simulateRandomError()

    const index = this.trajectories.findIndex(t => t.id === id)
    if (index === -1) {
      throw new ApiError(404, '轨迹不存在')
    }

    this.trajectories.splice(index, 1)

    return this.createSuccessResponse(undefined)
  }

  /**
   * 获取轨迹列表
   */
  async getTrajectories(params?: {
    page?: number
    pageSize?: number
    type?: string
    status?: string
  }): Promise<ApiResponse<any>> {
    await this.simulateDelay()
    this.simulateRandomError()

    let filteredTrajectories = [...this.trajectories]

    if (params?.type) {
      filteredTrajectories = filteredTrajectories.filter(traj => traj.type === params.type)
    }
    if (params?.status) {
      filteredTrajectories = filteredTrajectories.filter(traj => traj.status === params.status)
    }

    const page = params?.page || 1
    const pageSize = params?.pageSize || 10
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedData = filteredTrajectories.slice(start, end)

    return this.createPaginatedResponse(paginatedData, page, pageSize, filteredTrajectories.length)
  }

  /**
   * 获取单个轨迹
   */
  async getTrajectory(id: string): Promise<ApiResponse<Trajectory>> {
    await this.simulateDelay()
    this.simulateRandomError()

    const trajectory = this.trajectories.find(t => t.id === id)
    if (!trajectory) {
      throw new ApiError(404, '轨迹不存在')
    }

    return this.createSuccessResponse(trajectory)
  }
}

/**
 * Mock 服务工厂
 */
export class MockServiceFactory {
  private static services: Map<string, MockService> = new Map()

  static getCargoService(): CargoMockService {
    if (!this.services.has('cargo')) {
      this.services.set('cargo', new CargoMockService())
    }
    return this.services.get('cargo') as CargoMockService
  }

  static getStorageAreaService(): StorageAreaMockService {
    if (!this.services.has('storageArea')) {
      this.services.set('storageArea', new StorageAreaMockService())
    }
    return this.services.get('storageArea') as StorageAreaMockService
  }

  static getTransportTaskService(): TransportTaskMockService {
    if (!this.services.has('transportTask')) {
      this.services.set('transportTask', new TransportTaskMockService())
    }
    return this.services.get('transportTask') as TransportTaskMockService
  }

  static getTransportMachineService(): TransportMachineMockService {
    if (!this.services.has('transportMachine')) {
      this.services.set('transportMachine', new TransportMachineMockService())
    }
    return this.services.get('transportMachine') as TransportMachineMockService
  }

  static getTrajectoryService(): TrajectoryMockService {
    if (!this.services.has('trajectory')) {
      this.services.set('trajectory', new TrajectoryMockService())
    }
    return this.services.get('trajectory') as TrajectoryMockService
  }
}
