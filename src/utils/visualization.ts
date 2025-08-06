import type { StorageArea, Cargo } from '../types'

// 计算区域边界框
export const getAreaBounds = (area: StorageArea) => {
  if (!area.boundary?.points || area.boundary.points.length === 0) {
    // 如果没有边界点，使用默认值
    return { minX: -10, maxX: 10, minZ: -10, maxZ: 10 }
  }

  const points = area.boundary.points
  const xs = points.map(p => p.x)
  const zs = points.map(p => p.z)

  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minZ: Math.min(...zs),
    maxZ: Math.max(...zs),
  }
}

// 计算区域中心点
export const getAreaCenter = (area: StorageArea) => {
  const bounds = getAreaBounds(area)
  return {
    x: (bounds.minX + bounds.maxX) / 2,
    y: 0,
    z: (bounds.minZ + bounds.maxZ) / 2,
  }
}

// 计算区域尺寸
export const getAreaSize = (area: StorageArea) => {
  const bounds = getAreaBounds(area)
  return {
    width: Math.max(bounds.maxX - bounds.minX, 5), // 最小宽度5
    height: area.boundary?.height || 2,
    depth: Math.max(bounds.maxZ - bounds.minZ, 5), // 最小深度5
  }
}

// 区域颜色映射
export const getAreaColor = (area: StorageArea) => {
  switch (area.type) {
    case 'storage':
      return '#4CAF50' // 绿色
    case 'transit':
      return '#2196F3' // 蓝色
    case 'loading':
      return '#FF9800' // 橙色
    case 'unloading':
      return '#9C27B0' // 紫色
    case 'maintenance':
      return '#F44336' // 红色
    case 'buffer':
      return '#607D8B' // 蓝灰色
    case 'special':
      return '#E91E63' // 粉色
    default:
      return '#757575' // 灰色
  }
}

// 货物颜色映射
export const getCargoColor = (cargo: Cargo) => {
  switch (cargo.status) {
    case 'stored':
      return '#4CAF50' // 绿色
    case 'in_transit':
      return '#2196F3' // 蓝色
    case 'loading':
      return '#FF9800' // 橙色
    case 'unloading':
      return '#9C27B0' // 紫色
    case 'maintenance':
      return '#F44336' // 红色
    case 'damaged':
      return '#795548' // 棕色
    default:
      return '#757575' // 灰色
  }
}
