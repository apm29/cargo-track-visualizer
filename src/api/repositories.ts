import { apiClient, ApiResponse } from './client'
import { dataSourceManager, DataSourceType } from './config'
import { MockServiceFactory } from './mock-service'
import {
  Cargo,
  StorageArea,
  TransportTask,
  TransportTaskStatus,
  TransportMachine,
  Trajectory,
} from '../types'

/**
 * 基础仓库接口
 */
export interface BaseRepository<T> {
  getList(params?: any): Promise<ApiResponse<any>>
  getById(id: string): Promise<ApiResponse<T>>
  create(data: Partial<T>): Promise<ApiResponse<T>>
  update(id: string, data: Partial<T>): Promise<ApiResponse<T>>
  delete(id: string): Promise<ApiResponse<void>>
}

/**
 * 基础仓库实现
 */
export abstract class BaseRepositoryImpl<T> implements BaseRepository<T> {
  protected abstract endpoint: string

  async getList(params?: any): Promise<ApiResponse<any>> {
    if (dataSourceManager.isMockMode()) {
      return this.getMockService().getList(params)
    }
    return apiClient.get(this.endpoint, params)
  }

  async getById(id: string): Promise<ApiResponse<T>> {
    if (dataSourceManager.isMockMode()) {
      return this.getMockService().getById(id)
    }
    return apiClient.get(`${this.endpoint}/${id}`)
  }

  async create(data: Partial<T>): Promise<ApiResponse<T>> {
    if (dataSourceManager.isMockMode()) {
      return this.getMockService().create(data)
    }
    return apiClient.post(this.endpoint, data)
  }

  async update(id: string, data: Partial<T>): Promise<ApiResponse<T>> {
    if (dataSourceManager.isMockMode()) {
      return this.getMockService().update(id, data)
    }
    return apiClient.put(`${this.endpoint}/${id}`, data)
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    if (dataSourceManager.isMockMode()) {
      return this.getMockService().delete(id)
    }
    return apiClient.delete(`${this.endpoint}/${id}`)
  }

  protected abstract getMockService(): any
}

/**
 * 货物仓库
 */
export class CargoRepository extends BaseRepositoryImpl<Cargo> {
  protected endpoint = '/cargos'

  protected getMockService() {
    return MockServiceFactory.getCargoService()
  }

  // 货物特有的方法
  async getCargosByArea(areaId: string, params?: any): Promise<ApiResponse<any>> {
    if (dataSourceManager.isMockMode()) {
      return this.getMockService().getCargos({ ...params, areaId })
    }
    return apiClient.get(`${this.endpoint}/area/${areaId}`, params)
  }

  async getCargosByType(type: string, params?: any): Promise<ApiResponse<any>> {
    if (dataSourceManager.isMockMode()) {
      return this.getMockService().getCargos({ ...params, type })
    }
    return apiClient.get(`${this.endpoint}/type/${type}`, params)
  }

  async getCargosByStatus(status: string, params?: any): Promise<ApiResponse<any>> {
    if (dataSourceManager.isMockMode()) {
      return this.getMockService().getCargos({ ...params, status })
    }
    return apiClient.get(`${this.endpoint}/status/${status}`, params)
  }
}

/**
 * 堆场区域仓库
 */
export class StorageAreaRepository extends BaseRepositoryImpl<StorageArea> {
  protected endpoint = '/areas'

  protected getMockService() {
    return MockServiceFactory.getStorageAreaService()
  }

  // 区域特有的方法
  async getAreasByType(type: string, params?: any): Promise<ApiResponse<any>> {
    if (dataSourceManager.isMockMode()) {
      return this.getMockService().getAreas({ ...params, type })
    }
    return apiClient.get(`${this.endpoint}/type/${type}`, params)
  }

  async getAreasByStatus(status: string, params?: any): Promise<ApiResponse<any>> {
    if (dataSourceManager.isMockMode()) {
      return this.getMockService().getAreas({ ...params, status })
    }
    return apiClient.get(`${this.endpoint}/status/${status}`, params)
  }

  async getAreaHierarchy(): Promise<ApiResponse<StorageArea[]>> {
    if (dataSourceManager.isMockMode()) {
      // Mock 模式下返回所有区域
      return this.getMockService().getAreas()
    }
    return apiClient.get(`${this.endpoint}/hierarchy`)
  }
}

/**
 * 转运任务仓库
 */
export class TransportTaskRepository extends BaseRepositoryImpl<TransportTask> {
  protected endpoint = '/tasks'

  protected getMockService() {
    return MockServiceFactory.getTransportTaskService()
  }

  // 任务特有的方法
  async getTasksByType(type: string, params?: any): Promise<ApiResponse<any>> {
    if (dataSourceManager.isMockMode()) {
      return this.getMockService().getTasks({ ...params, type })
    }
    return apiClient.get(`${this.endpoint}/type/${type}`, params)
  }

  async getTasksByStatus(status: string, params?: any): Promise<ApiResponse<any>> {
    if (dataSourceManager.isMockMode()) {
      return this.getMockService().getTasks({ ...params, status })
    }
    return apiClient.get(`${this.endpoint}/status/${status}`, params)
  }

  async getTasksByPriority(priority: number, params?: any): Promise<ApiResponse<any>> {
    if (dataSourceManager.isMockMode()) {
      return this.getMockService().getTasks({ ...params, priority })
    }
    return apiClient.get(`${this.endpoint}/priority/${priority}`, params)
  }

  async getTasksByMachine(machineId: string, params?: any): Promise<ApiResponse<any>> {
    if (dataSourceManager.isMockMode()) {
      // Mock 模式下过滤任务
      const response = await this.getMockService().getTasks(params)
      const filteredData = response.data.data.filter((task: TransportTask) => 
        task.machineId === machineId
      )
      return {
        ...response,
        data: {
          ...response.data,
          data: filteredData,
          pagination: {
            ...response.data.pagination,
            total: filteredData.length,
          }
        }
      }
    }
    return apiClient.get(`${this.endpoint}/machine/${machineId}`, params)
  }

  async assignTask(taskId: string, machineId: string): Promise<ApiResponse<TransportTask>> {
    if (dataSourceManager.isMockMode()) {
      return this.getMockService().updateTask(taskId, { machineId })
    }
    return apiClient.put(`${this.endpoint}/${taskId}/assign`, { machineId })
  }

  async startTask(taskId: string): Promise<ApiResponse<TransportTask>> {
    if (dataSourceManager.isMockMode()) {
      return this.getMockService().updateTask(taskId, { 
        status: TransportTaskStatus.IN_PROGRESS,
        actualStartTime: new Date().toISOString()
      })
    }
    return apiClient.put(`${this.endpoint}/${taskId}/start`)
  }

  async completeTask(taskId: string): Promise<ApiResponse<TransportTask>> {
    if (dataSourceManager.isMockMode()) {
      return this.getMockService().updateTask(taskId, { 
        status: TransportTaskStatus.COMPLETED,
        actualEndTime: new Date().toISOString(),
        progress: 1
      })
    }
    return apiClient.put(`${this.endpoint}/${taskId}/complete`)
  }
}

/**
 * 转运机械仓库
 */
export class TransportMachineRepository extends BaseRepositoryImpl<TransportMachine> {
  protected endpoint = '/machines'

  protected getMockService() {
    return MockServiceFactory.getTransportMachineService()
  }

  // 机械特有的方法
  async getMachinesByType(type: string, params?: any): Promise<ApiResponse<any>> {
    if (dataSourceManager.isMockMode()) {
      return this.getMockService().getMachines({ ...params, type })
    }
    return apiClient.get(`${this.endpoint}/type/${type}`, params)
  }

  async getMachinesByStatus(status: string, params?: any): Promise<ApiResponse<any>> {
    if (dataSourceManager.isMockMode()) {
      return this.getMockService().getMachines({ ...params, status })
    }
    return apiClient.get(`${this.endpoint}/status/${status}`, params)
  }

  async getAvailableMachines(): Promise<ApiResponse<TransportMachine[]>> {
    if (dataSourceManager.isMockMode()) {
      return this.getMockService().getMachines({ status: 'idle' })
    }
    return apiClient.get(`${this.endpoint}/available`)
  }

  async getMachineStatus(machineId: string): Promise<ApiResponse<{ status: string; currentTask?: string }>> {
    if (dataSourceManager.isMockMode()) {
      const machine = await this.getMockService().getMachine(machineId)
      return {
        success: true,
        data: {
          status: machine.data.status,
          currentTask: machine.data.currentTaskId,
        }
      }
    }
    return apiClient.get(`${this.endpoint}/${machineId}/status`)
  }
}

/**
 * 轨迹仓库
 */
export class TrajectoryRepository extends BaseRepositoryImpl<Trajectory> {
  protected endpoint = '/trajectories'

  protected getMockService() {
    return MockServiceFactory.getTrajectoryService()
  }

  // 轨迹特有的方法
  async getTrajectoriesByType(type: string, params?: any): Promise<ApiResponse<any>> {
    if (dataSourceManager.isMockMode()) {
      return this.getMockService().getTrajectories({ ...params, type })
    }
    return apiClient.get(`${this.endpoint}/type/${type}`, params)
  }

  async getTrajectoriesByStatus(status: string, params?: any): Promise<ApiResponse<any>> {
    if (dataSourceManager.isMockMode()) {
      return this.getMockService().getTrajectories({ ...params, status })
    }
    return apiClient.get(`${this.endpoint}/status/${status}`, params)
  }

  async getCargoTrajectory(cargoId: string): Promise<ApiResponse<Trajectory[]>> {
    if (dataSourceManager.isMockMode()) {
      // Mock 模式下返回随机轨迹
      const trajectories = MockDataGenerator.generateBatch(
        MockDataGenerator.generateTrajectory,
        3
      )
      return {
        success: true,
        data: trajectories,
        message: '查询成功'
      }
    }
    return apiClient.get(`${this.endpoint}/cargo/${cargoId}`)
  }

  async getMachineTrajectory(machineId: string): Promise<ApiResponse<Trajectory[]>> {
    if (dataSourceManager.isMockMode()) {
      // Mock 模式下返回随机轨迹
      const trajectories = MockDataGenerator.generateBatch(
        MockDataGenerator.generateTrajectory,
        5
      )
      return {
        success: true,
        data: trajectories,
        message: '查询成功'
      }
    }
    return apiClient.get(`${this.endpoint}/machine/${machineId}`)
  }
}

/**
 * 仓库工厂
 */
export class RepositoryFactory {
  private static repositories: Map<string, BaseRepository<any>> = new Map()

  static getCargoRepository(): CargoRepository {
    if (!this.repositories.has('cargo')) {
      this.repositories.set('cargo', new CargoRepository())
    }
    return this.repositories.get('cargo') as CargoRepository
  }

  static getStorageAreaRepository(): StorageAreaRepository {
    if (!this.repositories.has('storageArea')) {
      this.repositories.set('storageArea', new StorageAreaRepository())
    }
    return this.repositories.get('storageArea') as StorageAreaRepository
  }

  static getTransportTaskRepository(): TransportTaskRepository {
    if (!this.repositories.has('transportTask')) {
      this.repositories.set('transportTask', new TransportTaskRepository())
    }
    return this.repositories.get('transportTask') as TransportTaskRepository
  }

  static getTransportMachineRepository(): TransportMachineRepository {
    if (!this.repositories.has('transportMachine')) {
      this.repositories.set('transportMachine', new TransportMachineRepository())
    }
    return this.repositories.get('transportMachine') as TransportMachineRepository
  }

  static getTrajectoryRepository(): TrajectoryRepository {
    if (!this.repositories.has('trajectory')) {
      this.repositories.set('trajectory', new TrajectoryRepository())
    }
    return this.repositories.get('trajectory') as TrajectoryRepository
  }
}

// 导入 MockDataGenerator
import { MockDataGenerator } from '../mocks/data-generator' 
