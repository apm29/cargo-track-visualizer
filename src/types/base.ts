/**
 * 三维尺寸
 */
export interface Dimensions {
  /** 长度 (米) */
  length: number
  /** 宽度 (米) */
  width: number
  /** 高度 (米) */
  height: number
}

/**
 * 三维位置坐标
 */
export interface Position {
  /** X 坐标 (米) */
  x: number
  /** Y 坐标 (米) */
  y: number
  /** Z 坐标 (米) */
  z: number
}

/**
 * 三维姿态 (欧拉角)
 */
export interface Orientation {
  /** 俯仰角 (Pitch, 弧度) */
  pitch: number
  /** 横滚角 (Roll, 弧度) */
  roll: number
  /** 偏航角 (Yaw, 弧度) */
  yaw: number
}
