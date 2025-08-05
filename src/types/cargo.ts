import { Dimensions, Orientation, Position } from './base'
import { TrajectoryPoint } from './trajectory'

/**
 * 货物基础信息
 */
export interface Cargo {
  /** 货物唯一标识 */
  id: string
  /** 货物名称 */
  name: string
  /** 货物类型 */
  type: CargoType
  /** 货物重量 (kg) */
  weight: number
  /** 货物尺寸 (长x宽x高, 单位: 米) */
  dimensions: Dimensions
  /** 当前位置 */
  position: Position
  /** 当前姿态 (俯仰、横滚、偏航) */
  orientation: Orientation
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
  /** 状态 */
  status: CargoStatus
  /** 所属区域ID */
  areaId?: string
  /** 历史轨迹数据 */
  trajectory?: TrajectoryPoint[]
  /** 历史任务记录 */
  taskHistory?: CargoTask[]
}

/**
 * 货物类型枚举
 */
export enum CargoType {
  TANK = 'tank',
}

/**
 * 货物状态枚举
 */
export enum CargoStatus {
  STORED = 'stored', // 已存储
  IN_TRANSIT = 'in_transit', // 转运中
  LOADING = 'loading', // 装载中
  UNLOADING = 'unloading', // 卸载中
  MAINTENANCE = 'maintenance', // 维护中
  DAMAGED = 'damaged', // 损坏
}

/**
 * 货物任务记录
 */
export interface CargoTask {
  /** 任务ID */
  id: string
  /** 任务类型 */
  type: TaskType
  /** 任务状态 */
  status: TaskStatus
  /** 开始时间 */
  startTime: string
  /** 结束时间 */
  endTime?: string
  /** 起始位置 */
  startPosition: Position
  /** 目标位置 */
  targetPosition: Position
  /** 转运机械ID */
  machineId?: string
  /** 操作员ID */
  operatorId?: string
  /** 备注 */
  notes?: string
}

/**
 * 任务类型枚举
 */
export enum TaskType {
  LOAD = 'load', // 装载
  UNLOAD = 'unload', // 卸载
  MOVE = 'move', // 移动
  INSPECT = 'inspect', // 检查
  MAINTENANCE = 'maintenance', // 维护
}

/**
 * 任务状态枚举
 */
export enum TaskStatus {
  PENDING = 'pending', // 待执行
  IN_PROGRESS = 'in_progress', // 执行中
  COMPLETED = 'completed', // 已完成
  FAILED = 'failed', // 失败
  CANCELLED = 'cancelled', // 已取消
}
