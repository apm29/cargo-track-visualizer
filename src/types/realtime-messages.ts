import { Position, Orientation } from './base'
import { TrajectoryPoint } from './trajectory'
import { CargoStatus } from './cargo'

/**
 * 实时消息类型枚举
 */
export enum RealtimeMessageType {
  CARGO_UPDATE = 'cargo_update',
  SYSTEM_STATUS = 'system_status',
  ERROR = 'error',
  CUSTOM = 'custom'
}

/**
 * 实时消息基础接口
 */
export interface RealtimeMessage<T = any> {
  /** 消息类型 */
  type: RealtimeMessageType
  /** 消息数据 */
  data: T
  /** 消息ID */
  messageId: string
  /** 消息时间戳 */
  timestamp: string
}

/**
 * 方向向量
 */
export interface Direction {
  /** X方向分量 */
  x: number
  /** Y方向分量 */
  y: number
  /** Z方向分量 */
  z: number
}

/**
 * 轨迹信息
 */
export interface TrajectoryInfo {
  /** 轨迹ID */
  trajectoryId: string
  /** 轨迹名称 */
  trajectoryName: string
  /** 当前点索引 */
  currentPointIndex: number
  /** 总点数 */
  totalPoints: number
  /** 进度 (0-1) */
  progress: number
  /** 当前轨迹点 */
  currentPoint: TrajectoryPoint
  /** 下一个轨迹点 */
  nextPoint: TrajectoryPoint
}

/**
 * 货物更新消息数据
 */
export interface CargoUpdateData {
  /** 货物ID */
  cargoId: string
  /** 货物名称 */
  cargoName: string
  /** 旧位置 */
  oldPosition: Position
  /** 新位置 */
  newPosition: Position
  /** 时间戳 */
  timestamp: string
  /** 速度 (米/秒) */
  speed: number
  /** 移动方向 */
  direction: Direction
  /** 货物状态 */
  status: CargoStatus
  /** 区域ID */
  areaId: string
  /** 轨迹信息 */
  trajectoryInfo: TrajectoryInfo
}

/**
 * 货物更新消息
 */
export type CargoUpdateMessage = RealtimeMessage<CargoUpdateData>

/**
 * 系统健康状态
 */
export interface SystemHealth {
  /** CPU使用率 (%) */
  cpu: number
  /** 内存使用率 (%) */
  memory: number
  /** 网络状态 (%) */
  network: number
  /** 存储使用率 (%) */
  storage: number
}

/**
 * 轨迹移动状态
 */
export interface TrajectoryMovement {
  /** 是否激活 */
  isActive: boolean
  /** 货物名称 */
  cargoName: string
  /** 轨迹名称 */
  trajectoryName: string
  /** 当前点 */
  currentPoint: number
  /** 总点数 */
  totalPoints: number
}

/**
 * 系统状态消息数据
 */
export interface SystemStatusData {
  /** 时间戳 */
  timestamp: string
  /** 系统健康状态 */
  systemHealth: SystemHealth
  /** 活跃连接数 */
  activeConnections: number
  /** 活跃任务数 */
  activeTasks: number
  /** 活跃机械数 */
  activeMachines: number
  /** 警报数量 */
  alerts: number
  /** 系统运行时间 (毫秒) */
  uptime: number
  /** 轨迹移动状态 */
  trajectoryMovement: TrajectoryMovement
}

/**
 * 系统状态消息
 */
export type SystemStatusMessage = RealtimeMessage<SystemStatusData>

/**
 * 错误消息数据
 */
export interface ErrorData {
  /** 错误代码 */
  code: string
  /** 错误消息 */
  message: string
  /** 时间戳 */
  timestamp: string
}

/**
 * 错误消息
 */
export type ErrorMessage = RealtimeMessage<ErrorData>

/**
 * 自定义消息数据
 */
export interface CustomMessageData {
  /** 自定义数据 */
  [key: string]: any
}

/**
 * 自定义消息
 */
export type CustomMessage = RealtimeMessage<CustomMessageData>

/**
 * 所有实时消息的联合类型
 */
export type AnyRealtimeMessage = 
  | CargoUpdateMessage 
  | SystemStatusMessage 
  | ErrorMessage 
  | CustomMessage

/**
 * 消息处理器类型
 */
export type MessageHandler<T = any> = (message: RealtimeMessage<T>) => void

/**
 * 消息处理器映射
 */
export type MessageHandlerMap = Map<string, MessageHandler> 
