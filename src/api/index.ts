// 导出配置相关
export { dataSourceManager, initializeDataSource, getEnvironmentConfig } from './config'
export type { DataSourceConfig } from './config'
export { DataSourceType } from './config'

// 导出客户端相关
export { HttpClient, apiClient, ApiError } from './client'
export type { ApiConfig, ApiResponse } from './client'

// 导出仓库相关
export {
  CargoRepository,
  StorageAreaRepository,
  TransportTaskRepository,
  TransportMachineRepository,
  TrajectoryRepository,
  RepositoryFactory,
} from './repositories'
export type { BaseRepository } from './repositories'

// 导出 Mock 服务相关
export {
  CargoMockService,
  StorageAreaMockService,
  TransportTaskMockService,
  TransportMachineMockService,
  TrajectoryMockService,
  MockServiceFactory,
} from './mock-service'
export type { MockService } from './mock-service'

// 默认导出仓库工厂，方便使用
import { RepositoryFactory } from './repositories'
export default RepositoryFactory
