<template>
  <DialogRoot :open="isOpen" @update:open="handleOpenChange">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
      <DialogContent class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 w-full max-w-md mx-4 p-6">
        <div class="flex items-center justify-between mb-4">
          <DialogTitle class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ getModalTitle() }}
          </DialogTitle>
          <DialogClose class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors leading-4">
            <i class="i-carbon-close text-gray-500 dark:text-gray-400 text-lg inline-block"></i>
          </DialogClose>
        </div>

        <div class="space-y-4">
          <!-- 基本信息 -->
          <div class="space-y-3">
            <h3 class="text-subtitle text-gray-700 dark:text-gray-300">基本信息</h3>
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="text-caption text-gray-500 dark:text-gray-400">{{ getObjectTypeText() }}ID</label>
                <p class="text-body font-medium">{{ objectData?.id || 'N/A' }}</p>
              </div>
              <div class="space-y-1">
                <label class="text-caption text-gray-500 dark:text-gray-400">名称</label>
                <p class="text-body font-medium">{{ objectData?.name || 'N/A' }}</p>
              </div>
              <div class="space-y-1">
                <label class="text-caption text-gray-500 dark:text-gray-400">类型</label>
                <p class="text-body font-medium">{{ getTypeText() }}</p>
              </div>
              <div class="space-y-1">
                <label class="text-caption text-gray-500 dark:text-gray-400">状态</label>
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                      :class="getStatusClass(objectData?.status)">
                  {{ getStatusText(objectData?.status) }}
                </span>
              </div>
            </div>
          </div>

          <!-- 位置信息 -->
          <!-- <div class="space-y-3">
            <h3 class="text-subtitle text-gray-700 dark:text-gray-300">位置信息</h3>
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="text-caption text-gray-500 dark:text-gray-400">X 坐标</label>
                <p class="text-body font-mono">{{ objectData?.position?.x?.toFixed(2) || '0.00' }}</p>
              </div>
              <div class="space-y-1">
                <label class="text-caption text-gray-500 dark:text-gray-400">Y 坐标</label>
                <p class="text-body font-mono">{{ objectData?.position?.y?.toFixed(2) || '0.00' }}</p>
              </div>
              <div class="space-y-1">
                <label class="text-caption text-gray-500 dark:text-gray-400">Z 坐标</label>
                <p class="text-body font-mono">{{ objectData?.position?.z?.toFixed(2) || '0.00' }}</p>
              </div>
              <div class="space-y-1">
                <label class="text-caption text-gray-500 dark:text-gray-400">区域</label>
                <p class="text-body font-medium">{{ objectData?.area || 'N/A' }}</p>
              </div>
            </div>
          </div> -->

          <!-- 特定信息 -->
          <div v-if="objectType === ClassType.CARGO" class="space-y-3">
            <h3 class="text-subtitle text-gray-700 dark:text-gray-300">货物信息</h3>
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="text-caption text-gray-500 dark:text-gray-400">重量</label>
                <p class="text-body font-medium">{{ (objectData as Cargo)?.weight ? `${(objectData as Cargo).weight}kg` : 'N/A' }}</p>
              </div>
              <div class="space-y-1">
                <label class="text-caption text-gray-500 dark:text-gray-400">尺寸</label>
                <p class="text-body font-medium">{{ getDimensionsText() }}</p>
              </div>
              <div class="space-y-1">
                <label class="text-caption text-gray-500 dark:text-gray-400">堆叠层级</label>
                <p class="text-body font-medium">{{ (objectData as Cargo)?.stackLevel || '1' }}</p>
              </div>
            </div>
          </div>

          <div v-if="objectType === ClassType.STORAGE_AREA" class="space-y-3">
            <h3 class="text-subtitle text-gray-700 dark:text-gray-300">区域信息</h3>
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="text-caption text-gray-500 dark:text-gray-400">容量</label>
                <p class="text-body font-medium">{{ getCapacityText() }}</p>
              </div>
              <div class="space-y-1">
                <label class="text-caption text-gray-500 dark:text-gray-400">使用率</label>
                <p class="text-body font-medium">{{ getUsageText() }}</p>
              </div>
              <div class="space-y-1">
                <label class="text-caption text-gray-500 dark:text-gray-400">标签</label>
                <div class="flex flex-wrap gap-1">
                  <span v-for="tag in (objectData as StorageArea)?.tags" :key="tag" 
                        class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="objectType === ClassType.TRAJECTORY" class="space-y-3">
            <h3 class="text-subtitle text-gray-700 dark:text-gray-300">轨迹信息</h3>
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="text-caption text-gray-500 dark:text-gray-400">起点</label>
                <p class="text-body font-medium">{{ getStartPointText() }}</p>
              </div>
              <div class="space-y-1">
                <label class="text-caption text-gray-500 dark:text-gray-400">终点</label>
                <p class="text-body font-medium">{{ getEndPointText() }}</p>
              </div>
              <div class="space-y-1">
                <label class="text-caption text-gray-500 dark:text-gray-400">进度</label>
                <p class="text-body font-medium">{{ getProgressText() }}</p>
              </div>
              <div class="space-y-1">
                <label class="text-caption text-gray-500 dark:text-gray-400">总距离</label>
                <p class="text-body font-medium">{{ (objectData as Trajectory)?.metadata?.totalDistance ? `${(objectData as Trajectory).metadata.totalDistance}m` : 'N/A' }}</p>
              </div>
            </div>
          </div>

          <!-- 时间信息 -->
          <div class="space-y-3">
            <h3 class="text-subtitle text-gray-700 dark:text-gray-300">时间信息</h3>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-caption text-gray-500 dark:text-gray-400">创建时间</span>
                <span class="text-body">{{ formatTime(objectData?.createdAt) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-caption text-gray-500 dark:text-gray-400">更新时间</span>
                <span class="text-body">{{ formatTime(objectData?.updatedAt) }}</span>
              </div>
            </div>
          </div>

        </div>

        <!-- 操作按钮 -->
        <div class="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button class="btn-secondary flex-1" @click="handleEdit">
            <i class="i-carbon-edit mr-2"></i>
            编辑
          </button>
          <button class="btn-primary flex-1" @click="handleTrack">
            <i class="i-carbon-location mr-2"></i>
            {{ getTrackButtonText() }}
          </button>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<script setup lang="ts">
import { DialogRoot, DialogPortal, DialogOverlay, DialogContent, DialogTitle, DialogClose } from 'reka-ui'
import type { Cargo } from '~/types/cargo'
import type { StorageArea } from '~/types/storage-area'
import type { Trajectory } from '~/types/trajectory'
import { ClassType } from '~/types/base'
type ObjectData = Cargo | StorageArea | Trajectory

interface Props {
  isOpen: boolean
  objectData?: ObjectData
  objectType?: ClassType
}

interface Emits {
  (e: 'update:isOpen', value: boolean): void
  (e: 'edit', data: ObjectData): void
  (e: 'track', data: ObjectData): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleOpenChange = (open: boolean) => {
  emit('update:isOpen', open)
}

const handleEdit = () => {
  if (props.objectData) {
    emit('edit', props.objectData)
  }
}

const handleTrack = () => {
  if (props.objectData) {
    emit('track', props.objectData)
  }
}

const getModalTitle = () => {
  switch (props.objectType) {
    case ClassType.CARGO: return '货物详情'
    case ClassType.STORAGE_AREA: return '区域详情'
    case ClassType.TRAJECTORY: return '轨迹详情'
    default: return '对象详情'
  }
}

const getObjectTypeText = () => {
  switch (props.objectType) {
    case ClassType.CARGO: return '货物'
    case ClassType.STORAGE_AREA: return '区域'
    case ClassType.TRAJECTORY: return '轨迹'
    default: return '对象'
  }
}

const getTypeText = () => {
  if (!props.objectData?.type) return 'N/A'
  
  const typeMap: Record<string, string> = {
    // 货物类型
    tank: '储罐',
    container: '集装箱',
    bulk: '散货',
    liquid: '液体',
    // 区域类型
    storage: '存储区',
    transit: '运输区',
    loading: '装卸区',
    maintenance: '维护区',
    buffer: '缓冲区',
    special: '特殊区',
    // 轨迹类型
    planned: '已规划',
    active: '执行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  
  return typeMap[props.objectData.type] || props.objectData.type
}

const getStatusClass = (status?: string) => {
  const statusMap: Record<string, string> = {
    // 货物状态
    stored: 'status-success',
    'in_transit': 'status-info',
    loading: 'status-warning',
    unloading: 'status-warning',
    maintenance: 'status-error',
    damaged: 'status-error',
    // 区域状态
    active: 'status-success',
    inactive: 'status-error',
    full: 'status-error',
    reserved: 'status-info',
    // 轨迹状态
    planned: 'status-info',
    in_progress: 'status-warning',
    completed: 'status-success',
    cancelled: 'status-error',
    failed: 'status-error',
    archived: 'status-info'
  }
  return statusMap[status || ''] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
}

const getStatusText = (status?: string) => {
  const statusMap: Record<string, string> = {
    // 货物状态
    stored: '已存储',
    'in_transit': '运输中',
    loading: '装载中',
    unloading: '卸载中',
    maintenance: '维护中',
    damaged: '已损坏',
    // 区域状态
    active: '活跃',
    inactive: '非活跃',
    full: '已满',
    reserved: '已预留',
    // 轨迹状态
    planned: '已规划',
    in_progress: '执行中',
    completed: '已完成',
    cancelled: '已取消',
    failed: '失败',
    archived: '已归档'
  }
  return statusMap[status || ''] || '未知'
}

const getDimensionsText = () => {
  const Cargo = props.objectData as Cargo
  if (Cargo?.dimensions) {
    return `${Cargo.dimensions.length}x${Cargo.dimensions.width}x${Cargo.dimensions.height}m`
  }
  return 'N/A'
}

const getCapacityText = () => {
  const StorageArea = props.objectData as StorageArea
  if (StorageArea?.capacity) {
    return `${StorageArea.capacity.maxCargoCount}个货物, ${StorageArea.capacity.maxWeight}kg`
  }
  return 'N/A'
}

const getUsageText = () => {
  const StorageArea = props.objectData as StorageArea
  if (StorageArea?.usage) {
    return `${Math.round(StorageArea.usage.utilizationRate * 100)}%`
  }
  return 'N/A'
}

const getStartPointText = () => {
  const Trajectory = props.objectData as Trajectory
  if (Trajectory?.startPoint) {
    return `(${Trajectory.startPoint.x.toFixed(1)}, ${Trajectory.startPoint.y.toFixed(1)}, ${Trajectory.startPoint.z.toFixed(1)})`
  }
  return 'N/A'
}

const getEndPointText = () => {
  const Trajectory = props.objectData as Trajectory
  if (Trajectory?.endPoint) {
    return `(${Trajectory.endPoint.x.toFixed(1)}, ${Trajectory.endPoint.y.toFixed(1)}, ${Trajectory.endPoint.z.toFixed(1)})`
  }
  return 'N/A'
}

const getProgressText = () => {
  const Trajectory = props.objectData as Trajectory
  if (Trajectory?.progress !== undefined) {
    return `${Math.round(Trajectory.progress * 100)}%`
  }
  return 'N/A'
}

const getTrackButtonText = () => {
  switch (props.objectType) {
    case ClassType.CARGO: return '追踪'
    case ClassType.STORAGE_AREA: return '查看'
    case ClassType.TRAJECTORY: return '跟踪'
    default: return '追踪'
  }
}

const formatTime = (time?: string) => {
  if (!time) return 'N/A'
  try {
    return new Date(time).toLocaleString('zh-CN')
  } catch {
    return time
  }
}
</script> 