import { Vector3, Euler, type Object3D } from 'three'

/**
 * 高级坐标转换函数：将世界坐标转换为给定对象的局部坐标系，考虑位置、旋转和缩放。
 * @param worldPosition - 要转换的世界坐标 { x, y, z }
 * @param targetObject - 目标坐标系对象 (e.g., a crane model)
 * @returns 转换后的局部坐标 (Vector3)
 */
export const convertWorldToLocalCoordinates = (worldPosition: { x: number; y: number; z: number }, targetObject: Object3D): Vector3 => {
  // 获取目标对象的世界变换
  const targetWorldPosition = targetObject.position
  const targetWorldRotation = targetObject.rotation
  const targetWorldScale = targetObject.scale
  
  // 创建世界坐标向量
  const worldVector = new Vector3(worldPosition.x, worldPosition.y, worldPosition.z)
  
  // 1. 计算相对于目标对象的位置
  const relativePosition = worldVector.clone().sub(targetWorldPosition)
  
  // 2. 应用目标对象的逆旋转
  const inverseRotation = new Euler(
    -targetWorldRotation.x,
    -targetWorldRotation.y,
    -targetWorldRotation.z,
    targetWorldRotation.order
  )
  const rotatedPosition = relativePosition.clone().applyEuler(inverseRotation)
  
  // 3. 应用目标对象的逆缩放
  rotatedPosition.x /= targetWorldScale.x
  rotatedPosition.y /= targetWorldScale.y
  rotatedPosition.z /= targetWorldScale.z
  
  console.log('🔄 高级坐标转换:', {
    原始坐标: worldPosition,
    目标对象世界位置: targetWorldPosition,
    目标对象世界旋转: targetWorldRotation,
    目标对象世界缩放: targetWorldScale,
    相对位置: relativePosition,
    转换后坐标: rotatedPosition
  })
  
  return rotatedPosition
}

/**
 * 尺寸转换函数：将世界坐标系中的尺寸转换为给定对象的局部坐标系尺寸。
 * @param dimensions - 世界坐标系中的尺寸 { length, height, width }
 * @param targetObject - 目标坐标系对象 (e.g., a crane model)
 * @returns 转换后的局部坐标系尺寸 { length, height, width }
 */
export const convertDimensionsToLocal = (dimensions: { length: number; height: number; width: number }, targetObject: Object3D) => {
  // 获取目标对象的世界旋转和缩放
  const targetWorldRotation = targetObject.rotation
  const targetWorldScale = targetObject.scale
  
  // 创建尺寸向量
  const dimensionVector = new Vector3(dimensions.length, dimensions.height, dimensions.width)
  
  // 1. 应用目标对象的逆旋转来转换尺寸方向
  const inverseRotation = new Euler(
    -targetWorldRotation.x,
    -targetWorldRotation.y,
    -targetWorldRotation.z,
    targetWorldRotation.order
  )
  const rotatedDimensions = dimensionVector.clone().applyEuler(inverseRotation)
  
  // 2. 应用目标对象的逆缩放（取绝对值，因为尺寸应该是正数）
  const scaledDimensions = {
    length: Math.abs(rotatedDimensions.x / targetWorldScale.x),
    height: Math.abs(rotatedDimensions.y / targetWorldScale.y),
    width: Math.abs(rotatedDimensions.z / targetWorldScale.z)
  }
  
  console.log('📏 货物尺寸转换:', {
    原始尺寸: dimensions,
    目标对象世界旋转: targetWorldRotation,
    目标对象世界缩放: targetWorldScale,
    旋转后尺寸: rotatedDimensions,
    转换后尺寸: scaledDimensions
  })
  
  return scaledDimensions
}
