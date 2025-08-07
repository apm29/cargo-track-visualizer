import { MockDataGenerator } from '~/mocks/data-generator'
import { dataSourceManager } from './config'
import { ApiResponse, ApiError } from '~/api'
import { Cargo, StorageArea, TransportTask, TransportMachine, Trajectory, Position } from '~/types'
import { 
  TrajectoryType, 
  TrajectoryStatus, 
  TrajectoryComplexity, 
  PointType, 
  PointStatus 
} from '~/types/trajectory'
import { CargoStatus } from '~/types/cargo'

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
    
    // 定义货物网格布局参数（与StorageAreaMockService保持一致）
    const row = 8
    const col = 10
    const cargoWidth = 8  // 货物宽度，略小于区域宽度
    const cargoDepth = 4  // 货物深度，略小于区域深度
    const cargoHeight = 3 // 单个货物高度
    const gap = 1
    
    // 计算整个区域的边界（与StorageAreaMockService保持一致）
    const totalWidth = col * 10 + (col - 1) * gap  // 使用区域宽度10
    const totalDepth = row * 5 + (row - 1) * gap   // 使用区域深度5
    const startX = -totalWidth / 2
    const startZ = -totalDepth / 2
    
    // 生成货物数据
    this.cargos = []
    
    for (let rowIndex = 0; rowIndex < row; rowIndex++) {
      for (let colIndex = 0; colIndex < col; colIndex++) {
        // 计算当前网格的中心坐标
        const centerX = startX + colIndex * (10 + gap) + 10 / 2
        const centerZ = startZ + rowIndex * (5 + gap) + 5 / 2
        
        // 随机决定是否在此位置放置货物（70%概率）
        if (Math.random() < 0.7) {
          // 随机决定堆叠层数（1-3层）
          const stackLayers = Math.floor(Math.random() * 3) + 1
          
          for (let layer = 0; layer < stackLayers; layer++) {
            // 计算当前层货物的Y坐标
            const yPosition = layer * cargoHeight
            
            // 在网格内随机偏移，避免完全重叠
            const offsetX = 0 //(Math.random() - 0.5) * 2  // ±1米的随机偏移
            const offsetZ = 0 //(Math.random() - 0.5) * 2  // ±1米的随机偏移
            
            // 生成货物数据
            const cargo = MockDataGenerator.generateCargo({
              dimensions: {
                length: cargoWidth,
                height: cargoHeight,
                width: cargoDepth,
              },
              orientation: {
                pitch: 0,
                roll: 0,
                yaw: 0,
              },
              position: {
                x: centerX + offsetX,
                y: yPosition,
                z: centerZ + offsetZ,
              },
              areaId: `area-${rowIndex + 1}-${colIndex + 1}`, // 关联到对应的区域
              status: CargoStatus.STORED, // 所有货物都设为已存储状态
              stackLevel: layer + 1, // 堆叠层级
              stackId: `stack-${rowIndex}-${colIndex}`, // 堆叠组ID
            })
            
            // 为堆叠的货物添加特殊属性
            if (layer > 0) {
              cargo.metadata = {
                ...cargo.metadata,
                stackInfo: {
                  totalLayers: stackLayers,
                  currentLayer: layer + 1,
                  baseCargoId: this.cargos[this.cargos.length - stackLayers]?.id,
                  weight: cargo.weight * (1 + layer * 0.1), // 上层货物稍微重一些
                }
              }
            }
            
            this.cargos.push(cargo)
          }
        }
      }
    }
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
    // 使用我们之前创建的示例轨迹数据
    this.trajectories = this.generateSampleTrajectories()
  }

  /**
   * 生成示例轨迹数据
   */
  private generateSampleTrajectories(): Trajectory[] {
    const trajectories: Trajectory[] = []
    
    // 计算区域中心坐标
    // 区域布局：8行 × 10列，每个区域宽度10米，深度5米，间隔1米
    const row = 8
    const col = 10
    const width = 10
    const depth = 5
    const gap = 1
    
    // 计算整个区域的边界
    const totalWidth = col * width + (col - 1) * gap
    const totalDepth = row * depth + (row - 1) * gap
    const startX = -totalWidth / 2
    const startZ = -totalDepth / 2
    
    // 计算目标区域的中心坐标
    // 区域6-9：第5行（rowIndex=4），第8列（colIndex=7）
    const area6_9_centerX = startX + 8 * (width + gap) + width / 2
    const area6_9_centerZ = startZ + 5 * (depth + gap) + depth / 2
    
    // 区域6-5：第5行（rowIndex=4），第4列（colIndex=3）
    const area6_5_centerX = startX + 4 * (width + gap) + width / 2
    const area6_5_centerZ = startZ + 5 * (depth + gap) + depth / 2
    
    // 区域3-5：第2行（rowIndex=1），第4列（colIndex=3）
    const area3_5_centerX = startX + 4 * (width + gap) + width / 2
    const area3_5_centerZ = startZ + 2 * (depth + gap) + depth / 2
    
    // 创建固定轨迹：区域6-9 -> 区域6-5 -> 区域3-5
    trajectories.push({
      id: 'traj-001',
      name: '固定转运轨迹：6-9 -> 6-5 -> 3-5',
      type: TrajectoryType.TRANSPORT_PATH,
      status: TrajectoryStatus.IN_PROGRESS,
      points: this.generateTrajectoryPoints([
        { x: area6_9_centerX, y: 20, z: area6_9_centerZ }, // 起点：区域6-9中心
        { x: area6_9_centerX - 5, y: 20, z: area6_9_centerZ }, // 向上移动
        { x: area6_9_centerX - 10, y: 20, z: area6_9_centerZ }, // 水平移动到区域6-5上方
        { x: area6_9_centerX - 15, y: 20, z: area6_9_centerZ }, // 水平移动到区域6-5上方
        { x: area6_9_centerX - 20, y: 20, z: area6_9_centerZ }, // 水平移动到区域6-5上方
        { x: area6_9_centerX - 25, y: 20, z: area6_9_centerZ }, // 水平移动到区域6-5上方
        { x: area6_9_centerX - 30, y: 20, z: area6_9_centerZ }, // 水平移动到区域6-5上方
        { x: area6_9_centerX - 35, y: 20, z: area6_9_centerZ }, // 水平移动到区域6-5上方
        { x: area6_9_centerX - 40, y: 20, z: area6_9_centerZ }, // 水平移动到区域6-5上方
        { x: area6_5_centerX, y: 20, z: area6_5_centerZ }, // 下降到区域6-5中心
        { x: area6_5_centerX, y: 20, z: area6_5_centerZ - 5 }, // 向上移动
        { x: area3_5_centerX, y: 20, z: area6_5_centerZ - 10 }, // 水平移动到区域3-5上方
        { x: area3_5_centerX, y: 20, z: area6_5_centerZ - 15 }, // 水平移动到区域3-5上方
        { x: area3_5_centerX, y: 20, z: area3_5_centerZ } // 终点：区域3-5中心
      ], TrajectoryType.TRANSPORT_PATH),
      metadata: {
        totalDistance: 35.2,
        totalTime: 120,
        averageSpeed: 0.29,
        maxSpeed: 0.5,
        minSpeed: 0.2,
        complexity: TrajectoryComplexity.MODERATE,
        qualityScore: 85,
        optimizationSuggestions: ['优化转弯路径', '减少垂直移动'],
        statistics: {
          turnCount: 4,
          stopCount: 2,
          accelerationCount: 6,
          decelerationCount: 6,
          averageTurnRadius: 2.5,
          maxTurnRadius: 3.0,
          minTurnRadius: 2.0,
          smoothness: 0.8
        }
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['固定轨迹', '转运路径', '执行中'],
      notes: '从区域6-9中心到区域6-5中心，再到区域3-5中心的固定转运轨迹'
    })

    return trajectories
  }

  /**
   * 生成轨迹点
   */
  private generateTrajectoryPoints(positions: Array<{x: number, y: number, z: number}>, type: TrajectoryType): any[] {
    return positions.map((pos, index) => {
      const isStart = index === 0
      const isEnd = index === positions.length - 1

      return {
        id: `point-${index}`,
        timestamp: new Date(Date.now() + index * 5000).toISOString(), // 每5秒一个点
        position: pos,
        orientation: { pitch: 0, roll: 0, yaw: 0 },
        velocity: {
          linear: 0.3 + Math.random() * 0.2,
          angular: 0,
          x: 0.1 + Math.random() * 0.1,
          y: 0,
          z: 0.1 + Math.random() * 0.1
        },
        acceleration: {
          linear: 0.05 + Math.random() * 0.05,
          angular: 0,
          x: 0.02 + Math.random() * 0.02,
          y: 0,
          z: 0.02 + Math.random() * 0.02
        },
        type: isStart ? PointType.START : isEnd ? PointType.END : PointType.WAYPOINT,
        status: isStart ? PointStatus.COMPLETED : isEnd ? PointStatus.PENDING : PointStatus.COMPLETED,
        data: {
          speed: 0.3 + Math.random() * 0.2,
          battery: 80 + Math.random() * 20,
          temperature: 20 + Math.random() * 10
        }
      }
    })
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

    // 生成新的轨迹ID
    const newId = `traj-${Date.now()}`
    
    // 创建新的轨迹数据
    const newTrajectory: Trajectory = {
      id: newId,
      name: data.name || `轨迹 ${newId}`,
      type: data.type || TrajectoryType.CARGO_MOVEMENT,
      status: data.status || TrajectoryStatus.PLANNED,
      points: data.points || this.generateTrajectoryPoints([
        { x: 0, y: 20, z: 0 },
        { x: 5, y: 20, z: 5 },
        { x: 10, y: 20, z: 10 }
      ], data.type || TrajectoryType.CARGO_MOVEMENT),
      metadata: data.metadata || {
        totalDistance: 10.0,
        totalTime: 30,
        averageSpeed: 0.33,
        maxSpeed: 0.5,
        minSpeed: 0.2,
        complexity: TrajectoryComplexity.SIMPLE,
        qualityScore: 80,
        optimizationSuggestions: ['优化路径'],
        statistics: {
          turnCount: 0,
          stopCount: 0,
          accelerationCount: 1,
          decelerationCount: 1,
          averageTurnRadius: 0,
          maxTurnRadius: 0,
          minTurnRadius: 0,
          smoothness: 1.0
        }
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: data.tags || ['新建轨迹'],
      notes: data.notes || '新创建的轨迹'
    }

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
