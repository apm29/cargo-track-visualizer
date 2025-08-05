import { MockDataGenerator } from '../mocks/data-generator'
import { dataSourceManager } from './config'
import { ApiResponse, ApiError } from './client'
import {
  Cargo,
  StorageArea,
  TransportTask,
  TransportMachine,
  Trajectory,
} from '../types'

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
    this.cargos = MockDataGenerator.generateBatch(
      MockDataGenerator.generateCargo,
      20
    )
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

    return this.createPaginatedResponse(
      paginatedData,
      page,
      pageSize,
      filteredCargos.length
    )
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
    this.areas = MockDataGenerator.generateBatch(
      MockDataGenerator.generateStorageArea,
      10
    )
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

    return this.createPaginatedResponse(
      paginatedData,
      page,
      pageSize,
      filteredAreas.length
    )
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
    this.tasks = MockDataGenerator.generateBatch(
      MockDataGenerator.generateTransportTask,
      15
    )
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

    return this.createPaginatedResponse(
      paginatedData,
      page,
      pageSize,
      filteredTasks.length
    )
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
    this.machines = MockDataGenerator.generateBatch(
      MockDataGenerator.generateTransportMachine,
      8
    )
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

    return this.createPaginatedResponse(
      paginatedData,
      page,
      pageSize,
      filteredMachines.length
    )
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
    this.trajectories = MockDataGenerator.generateBatch(
      MockDataGenerator.generateTrajectory,
      12
    )
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

    return this.createPaginatedResponse(
      paginatedData,
      page,
      pageSize,
      filteredTrajectories.length
    )
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
