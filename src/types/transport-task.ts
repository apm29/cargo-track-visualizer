import { Position } from "./base"

/**
 * 转运任务信息
 */
export interface TransportTask {
  /** 任务唯一标识 */
  id: string
  /** 任务名称 */
  name: string
  /** 任务类型 */
  type: TransportTaskType
  /** 任务状态 */
  status: TransportTaskStatus
  /** 任务优先级 */
  priority: TaskPriority
  /** 任务描述 */
  description?: string
  /** 计划开始时间 */
  plannedStartTime: string
  /** 计划结束时间 */
  plannedEndTime: string
  /** 实际开始时间 */
  actualStartTime?: string
  /** 实际结束时间 */
  actualEndTime?: string
  /** 起始位置 */
  startPosition: Position
  /** 目标位置 */
  targetPosition: Position
  /** 路径规划 */
  path: PathSegment[]
  /** 关联的货物列表 */
  cargoIds: string[]
  /** 分配的转运机械 */
  machineId?: string
  /** 操作员ID */
  operatorId?: string
  /** 任务进度 (0-1) */
  progress: number
  /** 任务创建时间 */
  createdAt: string
  /** 任务更新时间 */
  updatedAt: string
  /** 任务备注 */
  notes?: string
  /** 任务标签 */
  tags: string[]
  /** 依赖任务列表 */
  dependencies?: string[] // 其他任务ID
  /** 任务执行历史 */
  executionHistory?: TaskExecutionEvent[]
}

/**
 * 转运任务类型枚举
 */
export enum TransportTaskType {
  LOAD = 'load', // 装载
  UNLOAD = 'unload', // 卸载
  MOVE = 'move', // 移动
  TRANSFER = 'transfer', // 转运
  REPOSITION = 'reposition', // 重新定位
  EMERGENCY = 'emergency', // 紧急任务
}

/**
 * 转运任务状态枚举
 */
export enum TransportTaskStatus {
  PENDING = 'pending', // 待执行
  SCHEDULED = 'scheduled', // 已调度
  IN_PROGRESS = 'in_progress', // 执行中
  PAUSED = 'paused', // 暂停
  COMPLETED = 'completed', // 已完成
  FAILED = 'failed', // 失败
  CANCELLED = 'cancelled', // 已取消
  TIMEOUT = 'timeout', // 超时
}

/**
 * 任务优先级枚举
 */
export enum TaskPriority {
  LOW = 1, // 低优先级
  NORMAL = 2, // 普通优先级
  HIGH = 3, // 高优先级
  URGENT = 4, // 紧急
  CRITICAL = 5, // 关键
}

/**
 * 路径段
 */
export interface PathSegment {
  /** 段ID */
  id: string
  /** 起始点 */
  startPoint: Position
  /** 结束点 */
  endPoint: Position
  /** 路径类型 */
  type: PathType
  /** 预计耗时 (秒) */
  estimatedDuration: number
  /** 实际耗时 (秒) */
  actualDuration?: number
  /** 路径约束 */
  constraints?: PathConstraint[]
  /** 路径状态 */
  status: PathSegmentStatus
}

/**
 * 路径类型枚举
 */
export enum PathType {
  STRAIGHT = 'straight', // 直线
  CURVE = 'curve', // 曲线
  ELEVATOR = 'elevator', // 升降
  ROTATION = 'rotation', // 旋转
  COMPLEX = 'complex', // 复合路径
}

/**
 * 路径约束
 */
export interface PathConstraint {
  /** 约束类型 */
  type: ConstraintType
  /** 约束值 */
  value: number
  /** 约束单位 */
  unit: string
  /** 约束描述 */
  description?: string
}

/**
 * 约束类型枚举
 */
export enum ConstraintType {
  MAX_SPEED = 'max_speed', // 最大速度
  MAX_ACCELERATION = 'max_acceleration', // 最大加速度
  MAX_LOAD = 'max_load', // 最大负载
  HEIGHT_LIMIT = 'height_limit', // 高度限制
  WIDTH_LIMIT = 'width_limit', // 宽度限制
  SAFETY_DISTANCE = 'safety_distance', // 安全距离
}

/**
 * 路径段状态枚举
 */
export enum PathSegmentStatus {
  PENDING = 'pending', // 待执行
  IN_PROGRESS = 'in_progress', // 执行中
  COMPLETED = 'completed', // 已完成
  FAILED = 'failed', // 失败
  SKIPPED = 'skipped', // 跳过
}

/**
 * 任务执行事件
 */
export interface TaskExecutionEvent {
  /** 事件ID */
  id: string
  /** 事件类型 */
  type: ExecutionEventType
  /** 事件时间 */
  timestamp: string
  /** 事件描述 */
  description: string
  /** 事件数据 */
  data?: Record<string, any>
  /** 操作员ID */
  operatorId?: string
  /** 机械ID */
  machineId?: string
}

/**
 * 执行事件类型枚举
 */
export enum ExecutionEventType {
  TASK_STARTED = 'task_started', // 任务开始
  TASK_PAUSED = 'task_paused', // 任务暂停
  TASK_RESUMED = 'task_resumed', // 任务恢复
  TASK_COMPLETED = 'task_completed', // 任务完成
  TASK_FAILED = 'task_failed', // 任务失败
  TASK_CANCELLED = 'task_cancelled', // 任务取消
  PATH_SEGMENT_STARTED = 'path_segment_started', // 路径段开始
  PATH_SEGMENT_COMPLETED = 'path_segment_completed', // 路径段完成
  CARGO_LOADED = 'cargo_loaded', // 货物装载
  CARGO_UNLOADED = 'cargo_unloaded', // 货物卸载
  MACHINE_ERROR = 'machine_error', // 机械错误
  SAFETY_ALERT = 'safety_alert', // 安全警报
}
