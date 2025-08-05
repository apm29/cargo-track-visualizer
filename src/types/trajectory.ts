import { Orientation, Position } from "./base"

/**
 * 轨迹数据
 */
export interface Trajectory {
  /** 轨迹唯一标识 */
  id: string
  /** 轨迹名称 */
  name: string
  /** 轨迹类型 */
  type: TrajectoryType
  /** 轨迹状态 */
  status: TrajectoryStatus
  /** 轨迹点列表 */
  points: TrajectoryPoint[]
  /** 轨迹元数据 */
  metadata: TrajectoryMetadata
  /** 轨迹创建时间 */
  createdAt: string
  /** 轨迹更新时间 */
  updatedAt: string
  /** 轨迹标签 */
  tags: string[]
  /** 轨迹备注 */
  notes?: string
}

/**
 * 轨迹类型枚举
 */
export enum TrajectoryType {
  CARGO_MOVEMENT = 'cargo_movement', // 货物移动轨迹
  MACHINE_OPERATION = 'machine_operation', // 机械操作轨迹
  TRANSPORT_PATH = 'transport_path', // 转运路径轨迹
  MAINTENANCE_ROUTE = 'maintenance_route', // 维护路线轨迹
  EMERGENCY_EVACUATION = 'emergency_evacuation', // 紧急疏散轨迹
  OPTIMIZATION_PATH = 'optimization_path', // 优化路径轨迹
}

/**
 * 轨迹状态枚举
 */
export enum TrajectoryStatus {
  PLANNED = 'planned', // 已规划
  IN_PROGRESS = 'in_progress', // 执行中
  COMPLETED = 'completed', // 已完成
  CANCELLED = 'cancelled', // 已取消
  FAILED = 'failed', // 失败
  ARCHIVED = 'archived', // 已归档
}

/**
 * 轨迹点
 */
export interface TrajectoryPoint {
  /** 点ID */
  id: string
  /** 时间戳 */
  timestamp: string
  /** 位置坐标 */
  position: Position
  /** 姿态信息 */
  orientation: Orientation
  /** 速度信息 */
  velocity: Velocity
  /** 加速度信息 */
  acceleration: Acceleration
  /** 点类型 */
  type: PointType
  /** 点状态 */
  status: PointStatus
  /** 附加数据 */
  data?: Record<string, any>
}

/**
 * 速度信息
 */
export interface Velocity {
  /** 线速度 (米/秒) */
  linear: number
  /** 角速度 (弧度/秒) */
  angular: number
  /** X方向速度分量 */
  x: number
  /** Y方向速度分量 */
  y: number
  /** Z方向速度分量 */
  z: number
}

/**
 * 加速度信息
 */
export interface Acceleration {
  /** 线加速度 (米/秒²) */
  linear: number
  /** 角加速度 (弧度/秒²) */
  angular: number
  /** X方向加速度分量 */
  x: number
  /** Y方向加速度分量 */
  y: number
  /** Z方向加速度分量 */
  z: number
}

/**
 * 轨迹点类型枚举
 */
export enum PointType {
  START = 'start', // 起始点
  WAYPOINT = 'waypoint', // 路径点
  TURN = 'turn', // 转弯点
  STOP = 'stop', // 停止点
  END = 'end', // 结束点
  EMERGENCY = 'emergency', // 紧急点
  CHECKPOINT = 'checkpoint', // 检查点
}

/**
 * 轨迹点状态枚举
 */
export enum PointStatus {
  PENDING = 'pending', // 待执行
  IN_PROGRESS = 'in_progress', // 执行中
  COMPLETED = 'completed', // 已完成
  FAILED = 'failed', // 失败
  SKIPPED = 'skipped', // 跳过
}

/**
 * 轨迹元数据
 */
export interface TrajectoryMetadata {
  /** 总距离 (米) */
  totalDistance: number
  /** 总时间 (秒) */
  totalTime: number
  /** 平均速度 (米/秒) */
  averageSpeed: number
  /** 最大速度 (米/秒) */
  maxSpeed: number
  /** 最小速度 (米/秒) */
  minSpeed: number
  /** 轨迹复杂度 */
  complexity: TrajectoryComplexity
  /** 轨迹质量评分 (0-100) */
  qualityScore: number
  /** 轨迹优化建议 */
  optimizationSuggestions: string[]
  /** 轨迹统计信息 */
  statistics: TrajectoryStatistics
}

/**
 * 轨迹复杂度枚举
 */
export enum TrajectoryComplexity {
  SIMPLE = 'simple', // 简单
  MODERATE = 'moderate', // 中等
  COMPLEX = 'complex', // 复杂
  VERY_COMPLEX = 'very_complex', // 非常复杂
}

/**
 * 轨迹统计信息
 */
export interface TrajectoryStatistics {
  /** 转弯次数 */
  turnCount: number
  /** 停止次数 */
  stopCount: number
  /** 加速次数 */
  accelerationCount: number
  /** 减速次数 */
  decelerationCount: number
  /** 平均转弯半径 (米) */
  averageTurnRadius: number
  /** 最大转弯半径 (米) */
  maxTurnRadius: number
  /** 最小转弯半径 (米) */
  minTurnRadius: number
  /** 轨迹平滑度 (0-1) */
  smoothness: number
}

/**
 * 轨迹分析结果
 */
export interface TrajectoryAnalysis {
  /** 分析ID */
  id: string
  /** 轨迹ID */
  trajectoryId: string
  /** 分析类型 */
  type: AnalysisType
  /** 分析结果 */
  result: AnalysisResult
  /** 分析时间 */
  timestamp: string
  /** 分析参数 */
  parameters: Record<string, any>
}

/**
 * 分析类型枚举
 */
export enum AnalysisType {
  EFFICIENCY = 'efficiency', // 效率分析
  SAFETY = 'safety', // 安全分析
  ENERGY = 'energy', // 能耗分析
  OPTIMIZATION = 'optimization', // 优化分析
  COLLISION = 'collision', // 碰撞分析
  TIMING = 'timing', // 时间分析
}

/**
 * 分析结果
 */
export interface AnalysisResult {
  /** 分析评分 (0-100) */
  score: number
  /** 分析等级 */
  level: AnalysisLevel
  /** 分析详情 */
  details: string
  /** 建议改进 */
  recommendations: string[]
  /** 风险点 */
  risks: RiskPoint[]
}

/**
 * 分析等级枚举
 */
export enum AnalysisLevel {
  EXCELLENT = 'excellent', // 优秀
  GOOD = 'good', // 良好
  AVERAGE = 'average', // 一般
  POOR = 'poor', // 较差
  DANGEROUS = 'dangerous', // 危险
}

/**
 * 风险点
 */
export interface RiskPoint {
  /** 风险点ID */
  id: string
  /** 风险类型 */
  type: RiskType
  /** 风险等级 */
  level: RiskLevel
  /** 风险位置 */
  position: Position
  /** 风险描述 */
  description: string
  /** 风险时间 */
  timestamp: string
  /** 缓解措施 */
  mitigation: string[]
}

/**
 * 风险类型枚举
 */
export enum RiskType {
  COLLISION = 'collision', // 碰撞风险
  OVERSPEED = 'overspeed', // 超速风险
  SHARP_TURN = 'sharp_turn', // 急转弯风险
  NARROW_PASSAGE = 'narrow_passage', // 狭窄通道风险
  OBSTACLE = 'obstacle', // 障碍物风险
  SYSTEM_FAILURE = 'system_failure', // 系统故障风险
}

/**
 * 风险等级枚举
 */
export enum RiskLevel {
  LOW = 'low', // 低风险
  MEDIUM = 'medium', // 中风险
  HIGH = 'high', // 高风险
  CRITICAL = 'critical', // 关键风险
}

