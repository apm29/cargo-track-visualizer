// 导入相关类型
import type { Cargo } from './cargo'
import type { StorageArea } from './storage-area'
import type { TransportTask } from './transport-task'
import type { TransportMachine } from './transport-machine'
import type { Trajectory } from './trajectory'
import type { Position, Orientation } from './base'

/**
 * API 响应基础结构
 */
export interface ApiResponse<T = any> {
  /** 响应状态码 */
  code: number
  /** 响应消息 */
  message: string
  /** 响应数据 */
  data: T
  /** 响应时间戳 */
  timestamp: string
  /** 请求ID */
  requestId: string
}

/**
 * 分页请求参数
 */
export interface PaginationParams {
  /** 页码 (从1开始) */
  page: number
  /** 每页大小 */
  pageSize: number
  /** 排序字段 */
  sortBy?: string
  /** 排序方向 */
  sortOrder?: 'asc' | 'desc'
}

/**
 * 分页响应数据
 */
export interface PaginatedResponse<T> {
  /** 数据列表 */
  list: T[]
  /** 总数量 */
  total: number
  /** 当前页 */
  currentPage: number
  /** 每页大小 */
  pageSize: number
  /** 总页数 */
  totalPages: number
  /** 是否有下一页 */
  hasNext: boolean
  /** 是否有上一页 */
  hasPrev: boolean
}

/**
 * 查询过滤条件
 */
export interface QueryFilter {
  /** 字段名 */
  field: string
  /** 操作符 */
  operator: FilterOperator
  /** 值 */
  value: any
  /** 逻辑连接符 */
  logic?: 'and' | 'or'
}

/**
 * 过滤操作符枚举
 */
export enum FilterOperator {
  EQUAL = 'eq', // 等于
  NOT_EQUAL = 'ne', // 不等于
  GREATER_THAN = 'gt', // 大于
  GREATER_EQUAL = 'ge', // 大于等于
  LESS_THAN = 'lt', // 小于
  LESS_EQUAL = 'le', // 小于等于
  IN = 'in', // 包含在
  NOT_IN = 'nin', // 不包含在
  LIKE = 'like', // 模糊匹配
  NOT_LIKE = 'nlike', // 不模糊匹配
  BETWEEN = 'between', // 在范围内
  IS_NULL = 'isnull', // 为空
  IS_NOT_NULL = 'isnotnull', // 不为空
}

/**
 * 查询请求参数
 */
export interface QueryParams extends PaginationParams {
  /** 搜索关键词 */
  keyword?: string
  /** 过滤条件 */
  filters?: QueryFilter[]
  /** 时间范围 */
  timeRange?: TimeRange
  /** 字段选择 */
  fields?: string[]
  /** 关联数据 */
  includes?: string[]
}

/**
 * 时间范围
 */
export interface TimeRange {
  /** 开始时间 */
  startTime: string
  /** 结束时间 */
  endTime: string
}

/**
 * 货物相关 API 接口
 */

/**
 * 获取货物列表请求
 */
export interface GetCargosRequest extends QueryParams {
  /** 货物类型 */
  type?: string
  /** 货物状态 */
  status?: string
  /** 区域ID */
  areaId?: string
}

/**
 * 获取货物列表响应
 */
export type GetCargosResponse = ApiResponse<PaginatedResponse<Cargo>>

/**
 * 获取货物详情请求
 */
export interface GetCargoRequest {
  /** 货物ID */
  id: string
}

/**
 * 获取货物详情响应
 */
export type GetCargoResponse = ApiResponse<Cargo>

/**
 * 更新货物信息请求
 */
export interface UpdateCargoRequest {
  /** 货物ID */
  id: string
  /** 更新数据 */
  data: Partial<Cargo>
}

/**
 * 更新货物信息响应
 */
export type UpdateCargoResponse = ApiResponse<Cargo>

/**
 * 获取货物轨迹请求
 */
export interface GetCargoTrajectoryRequest {
  /** 货物ID */
  id: string
  /** 时间范围 */
  timeRange?: TimeRange
}

/**
 * 获取货物轨迹响应
 */
export type GetCargoTrajectoryResponse = ApiResponse<Trajectory>

/**
 * 堆场区域相关 API 接口
 */

/**
 * 获取堆场区域列表请求
 */
export interface GetStorageAreasRequest extends QueryParams {
  /** 区域类型 */
  type?: string
  /** 区域状态 */
  status?: string
  /** 父区域ID */
  parentId?: string
}

/**
 * 获取堆场区域列表响应
 */
export type GetStorageAreasResponse = ApiResponse<PaginatedResponse<StorageArea>>

/**
 * 获取堆场区域详情请求
 */
export interface GetStorageAreaRequest {
  /** 区域ID */
  id: string
}

/**
 * 获取堆场区域详情响应
 */
export type GetStorageAreaResponse = ApiResponse<StorageArea>

/**
 * 获取区域货物列表请求
 */
export interface GetAreaCargosRequest extends QueryParams {
  /** 区域ID */
  areaId: string
}

/**
 * 获取区域货物列表响应
 */
export type GetAreaCargosResponse = ApiResponse<PaginatedResponse<Cargo>>

/**
 * 转运任务相关 API 接口
 */

/**
 * 获取转运任务列表请求
 */
export interface GetTransportTasksRequest extends QueryParams {
  /** 任务类型 */
  type?: string
  /** 任务状态 */
  status?: string
  /** 优先级 */
  priority?: number
  /** 机械ID */
  machineId?: string
  /** 操作员ID */
  operatorId?: string
}

/**
 * 获取转运任务列表响应
 */
export type GetTransportTasksResponse = ApiResponse<PaginatedResponse<TransportTask>>

/**
 * 获取转运任务详情请求
 */
export interface GetTransportTaskRequest {
  /** 任务ID */
  id: string
}

/**
 * 获取转运任务详情响应
 */
export type GetTransportTaskResponse = ApiResponse<TransportTask>

/**
 * 创建转运任务请求
 */
export interface CreateTransportTaskRequest {
  /** 任务数据 */
  task: Omit<TransportTask, 'id' | 'createdAt' | 'updatedAt'>
}

/**
 * 创建转运任务响应
 */
export type CreateTransportTaskResponse = ApiResponse<TransportTask>

/**
 * 更新转运任务请求
 */
export interface UpdateTransportTaskRequest {
  /** 任务ID */
  id: string
  /** 更新数据 */
  data: Partial<TransportTask>
}

/**
 * 更新转运任务响应
 */
export type UpdateTransportTaskResponse = ApiResponse<TransportTask>

/**
 * 转运机械相关 API 接口
 */

/**
 * 获取转运机械列表请求
 */
export interface GetTransportMachinesRequest extends QueryParams {
  /** 机械类型 */
  type?: string
  /** 机械状态 */
  status?: string
  /** 操作员ID */
  operatorId?: string
}

/**
 * 获取转运机械列表响应
 */
export type GetTransportMachinesResponse = ApiResponse<PaginatedResponse<TransportMachine>>

/**
 * 获取转运机械详情请求
 */
export interface GetTransportMachineRequest {
  /** 机械ID */
  id: string
}

/**
 * 获取转运机械详情响应
 */
export type GetTransportMachineResponse = ApiResponse<TransportMachine>

/**
 * 实时数据相关 API 接口
 */

/**
 * WebSocket 消息类型
 */
export enum WebSocketMessageType {
  CARGO_UPDATE = 'cargo_update', // 货物更新
  MACHINE_UPDATE = 'machine_update', // 机械更新
  TASK_UPDATE = 'task_update', // 任务更新
  AREA_UPDATE = 'area_update', // 区域更新
  TRAJECTORY_UPDATE = 'trajectory_update', // 轨迹更新
  ALERT = 'alert', // 警报
  SYSTEM_STATUS = 'system_status', // 系统状态
}

/**
 * WebSocket 消息
 */
export interface WebSocketMessage<T = any> {
  /** 消息类型 */
  type: WebSocketMessageType
  /** 消息数据 */
  data: T
  /** 消息时间戳 */
  timestamp: string
  /** 消息ID */
  messageId: string
}

/**
 * 实时货物更新数据
 */
export interface RealTimeCargoUpdate {
  /** 货物ID */
  id: string
  /** 位置更新 */
  position?: Position
  /** 姿态更新 */
  orientation?: Orientation
  /** 状态更新 */
  status?: string
  /** 更新时间 */
  timestamp: string
}

/**
 * 实时机械更新数据
 */
export interface RealTimeMachineUpdate {
  /** 机械ID */
  id: string
  /** 位置更新 */
  position?: Position
  /** 姿态更新 */
  orientation?: Orientation
  /** 状态更新 */
  status?: string
  /** 当前任务ID */
  currentTaskId?: string
  /** 更新时间 */
  timestamp: string
}

/**
 * 实时任务更新数据
 */
export interface RealTimeTaskUpdate {
  /** 任务ID */
  id: string
  /** 状态更新 */
  status?: string
  /** 进度更新 */
  progress?: number
  /** 实际开始时间 */
  actualStartTime?: string
  /** 实际结束时间 */
  actualEndTime?: string
  /** 更新时间 */
  timestamp: string
}

/**
 * 系统警报
 */
export interface SystemAlert {
  /** 警报ID */
  id: string
  /** 警报类型 */
  type: AlertType
  /** 警报级别 */
  level: AlertLevel
  /** 警报标题 */
  title: string
  /** 警报描述 */
  description: string
  /** 警报位置 */
  position?: Position
  /** 相关对象ID */
  relatedObjectId?: string
  /** 警报时间 */
  timestamp: string
  /** 是否已确认 */
  acknowledged: boolean
  /** 确认时间 */
  acknowledgedAt?: string
  /** 确认人员ID */
  acknowledgedBy?: string
}

/**
 * 警报类型枚举
 */
export enum AlertType {
  COLLISION_WARNING = 'collision_warning', // 碰撞警告
  OVERSPEED_WARNING = 'overspeed_warning', // 超速警告
  MAINTENANCE_REMINDER = 'maintenance_reminder', // 维护提醒
  SYSTEM_ERROR = 'system_error', // 系统错误
  SAFETY_VIOLATION = 'safety_violation', // 安全违规
  EQUIPMENT_FAILURE = 'equipment_failure', // 设备故障
}

/**
 * 警报级别枚举
 */
export enum AlertLevel {
  INFO = 'info', // 信息
  WARNING = 'warning', // 警告
  ERROR = 'error', // 错误
  CRITICAL = 'critical', // 严重
}

/**
 * 系统状态
 */
export interface SystemStatus {
  /** 系统运行状态 */
  status: SystemRunningStatus
  /** 在线设备数量 */
  onlineDevices: number
  /** 总设备数量 */
  totalDevices: number
  /** 活跃任务数量 */
  activeTasks: number
  /** 系统负载 */
  systemLoad: number
  /** 内存使用率 */
  memoryUsage: number
  /** CPU使用率 */
  cpuUsage: number
  /** 网络状态 */
  networkStatus: NetworkStatus
  /** 更新时间 */
  timestamp: string
}

/**
 * 系统运行状态枚举
 */
export enum SystemRunningStatus {
  NORMAL = 'normal', // 正常
  WARNING = 'warning', // 警告
  ERROR = 'error', // 错误
  MAINTENANCE = 'maintenance', // 维护
}

/**
 * 网络状态
 */
export interface NetworkStatus {
  /** 连接状态 */
  connected: boolean
  /** 延迟 (毫秒) */
  latency: number
  /** 带宽使用率 */
  bandwidthUsage: number
  /** 丢包率 */
  packetLoss: number
}
