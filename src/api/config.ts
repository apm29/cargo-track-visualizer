/**
 * 数据源类型
 */
export enum DataSourceType {
  API = 'api',
  MOCK = 'mock',
}

/**
 * 数据源配置
 */
export interface DataSourceConfig {
  type: DataSourceType
  apiConfig?: {
    baseURL: string
    timeout: number
  }
  mockConfig?: {
    delay: number // 模拟网络延迟
    enableRandomError: boolean // 是否启用随机错误
    errorRate: number // 错误率 (0-1)
  }
}

/**
 * 全局配置管理
 */
export class DataSourceManager {
  private static instance: DataSourceManager
  private config: DataSourceConfig

  private constructor() {
    this.config = {
      type: DataSourceType.MOCK, // 默认使用 mock 数据
      apiConfig: {
        baseURL: '/api',
        timeout: 10000,
      },
      mockConfig: {
        delay: 500,
        enableRandomError: false,
        errorRate: 0.1,
      },
    }
  }

  /**
   * 获取单例实例
   */
  static getInstance(): DataSourceManager {
    if (!DataSourceManager.instance) {
      DataSourceManager.instance = new DataSourceManager()
    }
    return DataSourceManager.instance
  }

  /**
   * 获取当前配置
   */
  getConfig(): DataSourceConfig {
    return { ...this.config }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<DataSourceConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * 设置数据源类型
   */
  setDataSourceType(type: DataSourceType): void {
    this.config.type = type
  }

  /**
   * 获取当前数据源类型
   */
  getDataSourceType(): DataSourceType {
    return this.config.type
  }

  /**
   * 是否使用 API 数据源
   */
  isApiMode(): boolean {
    return this.config.type === DataSourceType.API
  }

  /**
   * 是否使用 Mock 数据源
   */
  isMockMode(): boolean {
    return this.config.type === DataSourceType.MOCK
  }

  /**
   * 获取 API 配置
   */
  getApiConfig() {
    return this.config.apiConfig
  }

  /**
   * 获取 Mock 配置
   */
  getMockConfig() {
    return this.config.mockConfig
  }
}

/**
 * 全局数据源管理器实例
 */
export const dataSourceManager = DataSourceManager.getInstance()

/**
 * 环境配置
 */
export const getEnvironmentConfig = () => {
  const env = import.meta.env.MODE

  switch (env) {
    case 'development':
      return {
        defaultDataSource: DataSourceType.MOCK,
        apiBaseURL: 'http://localhost:3000/api',
        mockDelay: 300,
      }
    case 'production':
      return {
        defaultDataSource: DataSourceType.API,
        apiBaseURL: '/api',
        mockDelay: 0,
      }
    default:
      return {
        defaultDataSource: DataSourceType.MOCK,
        apiBaseURL: '/api',
        mockDelay: 500,
      }
  }
}

/**
 * 初始化数据源配置
 */
export const initializeDataSource = () => {
  const envConfig = getEnvironmentConfig()

  dataSourceManager.updateConfig({
    type: envConfig.defaultDataSource,
    apiConfig: {
      baseURL: envConfig.apiBaseURL,
      timeout: 10000,
    },
    mockConfig: {
      delay: envConfig.mockDelay,
      enableRandomError: false,
      errorRate: 0.05,
    },
  })
}
