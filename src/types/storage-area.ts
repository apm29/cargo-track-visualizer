import { Position } from './base'
import { CargoType } from './cargo'

/**
 * 堆场区域信息
 */
export interface StorageArea {
  /** 区域唯一标识 */
  id: string
  /** 区域名称 */
  name: string
  /** 区域类型 */
  type: AreaType
  /** 区域状态 */
  status: AreaStatus
  /** 区域边界 */
  boundary: AreaBoundary
  /** 区域容量 */
  capacity: AreaCapacity
  /** 当前使用情况 */
  usage: AreaUsage
  /** 区域标签 */
  tags: string[]
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
  /** 父区域ID (用于区域层级) */
  parentId?: string
  /** 子区域列表 */
  children?: StorageArea[]
  /** 区域内的货物列表 */
  cargos?: string[] // Cargo ID 列表
}

/**
 * 区域类型枚举
 */
export enum AreaType {
  STORAGE = 'storage', // 存储区
  TRANSIT = 'transit', // 中转区
  LOADING = 'loading', // 装载区
  UNLOADING = 'unloading', // 卸载区
  MAINTENANCE = 'maintenance', // 维护区
  BUFFER = 'buffer', // 缓冲区
  SPECIAL = 'special', // 特殊区域
}

/**
 * 区域状态枚举
 */
export enum AreaStatus {
  ACTIVE = 'active', // 正常使用
  MAINTENANCE = 'maintenance', // 维护中
  FULL = 'full', // 已满
  RESERVED = 'reserved', // 已预留
  INACTIVE = 'inactive', // 停用
}

/**
 * 区域边界定义
 */
export interface AreaBoundary {
  /** 边界点列表 (按顺时针顺序) */
  points: Position[]
  /** 边界高度 (米) */
  height: number
  /** 边界颜色 */
  color?: string
  /** 边界线宽 */
  lineWidth?: number
  /** 是否显示边界 */
  visible: boolean
}

/**
 * 区域容量信息
 */
export interface AreaCapacity {
  /** 最大货物数量 */
  maxCargoCount: number
  /** 最大重量 (kg) */
  maxWeight: number
  /** 最大体积 (立方米) */
  maxVolume: number
  /** 支持的货物类型 */
  supportedCargoTypes: CargoType[]
}

/**
 * 区域使用情况
 */
export interface AreaUsage {
  /** 当前货物数量 */
  currentCargoCount: number
  /** 当前重量 (kg) */
  currentWeight: number
  /** 当前体积 (立方米) */
  currentVolume: number
  /** 使用率 (0-1) */
  utilizationRate: number
  /** 最后更新时间 */
  lastUpdated: string
}
