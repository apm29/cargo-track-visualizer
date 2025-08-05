// 导入相关类型
import { Dimensions, Orientation, Position } from './base'
import type { CargoType } from './cargo'

/**
 * 转运机械信息
 */
export interface TransportMachine {
  /** 机械唯一标识 */
  id: string
  /** 机械名称 */
  name: string
  /** 机械类型 */
  type: MachineType
  /** 机械状态 */
  status: MachineStatus
  /** 机械型号 */
  model: string
  /** 机械规格 */
  specifications: MachineSpecifications
  /** 当前位置 */
  position: Position
  /** 当前姿态 */
  orientation: Orientation
  /** 机械能力 */
  capabilities: MachineCapabilities
  /** 当前任务ID */
  currentTaskId?: string
  /** 操作员ID */
  operatorId?: string
  /** 维护信息 */
  maintenance: MaintenanceInfo
  /** 机械创建时间 */
  createdAt: string
  /** 机械更新时间 */
  updatedAt: string
  /** 机械标签 */
  tags: string[]
  /** 机械备注 */
  notes?: string
}

/**
 * 机械类型枚举
 */
export enum MachineType {
  CRANE = 'crane', // 起重机
  FORKLIFT = 'forklift', // 叉车
  CONVEYOR = 'conveyor', // 传送带
  ROBOT = 'robot', // 机器人
  AGV = 'agv', // 自动导引车
  HOIST = 'hoist', // 升降机
  TROLLEY = 'trolley', // 小车
}

/**
 * 机械状态枚举
 */
export enum MachineStatus {
  IDLE = 'idle', // 空闲
  WORKING = 'working', // 工作中
  MAINTENANCE = 'maintenance', // 维护中
  ERROR = 'error', // 错误
  OFFLINE = 'offline', // 离线
  EMERGENCY = 'emergency', // 紧急状态
  CHARGING = 'charging', // 充电中
}

/**
 * 机械规格
 */
export interface MachineSpecifications {
  /** 最大载重 (kg) */
  maxLoadCapacity: number
  /** 工作范围 */
  workingRange: WorkingRange
  /** 移动速度 (米/秒) */
  maxSpeed: number
  /** 升降速度 (米/秒) */
  maxLiftSpeed: number
  /** 精度 (毫米) */
  precision: number
  /** 尺寸 */
  dimensions: Dimensions
  /** 重量 (kg) */
  weight: number
  /** 电源类型 */
  powerType: PowerType
  /** 电池容量 (kWh) */
  batteryCapacity?: number
}

/**
 * 工作范围
 */
export interface WorkingRange {
  /** X轴范围 (米) */
  xRange: [number, number]
  /** Y轴范围 (米) */
  yRange: [number, number]
  /** Z轴范围 (米) */
  zRange: [number, number]
  /** 旋转角度范围 (度) */
  rotationRange?: [number, number]
}

/**
 * 电源类型枚举
 */
export enum PowerType {
  ELECTRIC = 'electric', // 电动
  DIESEL = 'diesel', // 柴油
  HYBRID = 'hybrid', // 混合动力
  BATTERY = 'battery', // 电池
  WIRED = 'wired', // 有线
}

/**
 * 机械能力
 */
export interface MachineCapabilities {
  /** 支持的货物类型 */
  supportedCargoTypes: CargoType[]
  /** 支持的货物尺寸范围 */
  supportedCargoSizes: CargoSizeRange
  /** 支持的操作类型 */
  supportedOperations: OperationType[]
  /** 自动化程度 */
  automationLevel: AutomationLevel
  /** 安全功能 */
  safetyFeatures: SafetyFeature[]
}

/**
 * 货物尺寸范围
 */
export interface CargoSizeRange {
  /** 最小尺寸 */
  min: Dimensions
  /** 最大尺寸 */
  max: Dimensions
}

/**
 * 操作类型枚举
 */
export enum OperationType {
  LIFT = 'lift', // 升降
  MOVE = 'move', // 移动
  ROTATE = 'rotate', // 旋转
  GRAB = 'grab', // 抓取
  RELEASE = 'release', // 释放
  PUSH = 'push', // 推
  PULL = 'pull', // 拉
  TRANSPORT = 'transport', // 运输
}

/**
 * 自动化程度枚举
 */
export enum AutomationLevel {
  MANUAL = 'manual', // 手动
  SEMI_AUTO = 'semi_auto', // 半自动
  FULL_AUTO = 'full_auto', // 全自动
  INTELLIGENT = 'intelligent', // 智能
}

/**
 * 安全功能枚举
 */
export enum SafetyFeature {
  COLLISION_DETECTION = 'collision_detection', // 碰撞检测
  EMERGENCY_STOP = 'emergency_stop', // 紧急停止
  OVERLOAD_PROTECTION = 'overload_protection', // 过载保护
  SPEED_LIMIT = 'speed_limit', // 速度限制
  SAFETY_ZONE = 'safety_zone', // 安全区域
  ANTI_SWAY = 'anti_sway', // 防摇摆
}

/**
 * 维护信息
 */
export interface MaintenanceInfo {
  /** 最后维护时间 */
  lastMaintenance: string
  /** 下次维护时间 */
  nextMaintenance: string
  /** 维护周期 (天) */
  maintenanceCycle: number
  /** 维护状态 */
  status: MaintenanceStatus
  /** 维护记录 */
  history: MaintenanceRecord[]
  /** 维护人员ID */
  maintainerId?: string
}

/**
 * 维护状态枚举
 */
export enum MaintenanceStatus {
  NORMAL = 'normal', // 正常
  DUE_SOON = 'due_soon', // 即将到期
  OVERDUE = 'overdue', // 逾期
  IN_PROGRESS = 'in_progress', // 维护中
}

/**
 * 维护记录
 */
export interface MaintenanceRecord {
  /** 记录ID */
  id: string
  /** 维护时间 */
  timestamp: string
  /** 维护类型 */
  type: MaintenanceType
  /** 维护描述 */
  description: string
  /** 维护人员ID */
  maintainerId: string
  /** 维护结果 */
  result: MaintenanceResult
  /** 备注 */
  notes?: string
}

/**
 * 维护类型枚举
 */
export enum MaintenanceType {
  ROUTINE = 'routine', // 例行维护
  PREVENTIVE = 'preventive', // 预防性维护
  CORRECTIVE = 'corrective', // 纠正性维护
  EMERGENCY = 'emergency', // 紧急维护
}

/**
 * 维护结果枚举
 */
export enum MaintenanceResult {
  SUCCESS = 'success', // 成功
  PARTIAL = 'partial', // 部分成功
  FAILED = 'failed', // 失败
  CANCELLED = 'cancelled', // 取消
}
