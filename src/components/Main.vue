<script setup lang="ts">
import { TresEvent, TresInstance, useRaycaster, useTresContext } from '@tresjs/core'
import { Billboard, Box, Edges, Outline } from '@tresjs/cientos'
import { shallowRef, unref, toRefs, computed, watch, onMounted, onUnmounted } from 'vue'
import { getAreaCenter, getAreaSize, getAreaColor, getCargoColor, getTrajectoryColor } from '../utils/visualization'
import { useDataStore } from '../stores/dataStore'

const emit = defineEmits<{
  click: [instance: TresInstance]
}>()

// 使用 Pinia store
const dataStore = useDataStore()

// 从 store 获取数据
const {
  storageAreas,
  visibleCargos,
  trajectories,
  isConnected,
  connectionError,
  lastCargoUpdate,
} = toRefs(dataStore)

const context = useTresContext()
const areaMeshes = shallowRef<TresInstance[]>([])
const cargoMeshes = shallowRef<TresInstance[]>([])
const trajectoryMeshes = shallowRef<TresInstance[]>([])
const activeMesh = shallowRef<TresInstance | null>(null)

// 实时更新相关
const updatingCargoId = shallowRef<string | null>(null)
const updateAnimation = shallowRef<any>(null)

await dataStore.loadData()

const allMeshes = computed(() => {
  return [...areaMeshes.value, ...cargoMeshes.value, ...trajectoryMeshes.value]
})

const { onClick } = useRaycaster(allMeshes, context)

onClick((event: TresEvent) => {
  console.log('🔍 候选:', event.intersections)
  const nearestObject = event.intersections
    .filter(item => unref(allMeshes).map(item => item.userData.id).includes(item.object.userData.id))
    // .reduce((acc, currVal) => {
    //   if (!acc) return currVal
    //   return acc.distance < currVal.distance ? acc : currVal
    // }, null as (Intersection | null))?.object as TresInstance | null
    ?.[0]?.object as TresInstance | null
  console.log('🔍 点击:', nearestObject, event.intersections)

  if (nearestObject) {
    activeMesh.value = nearestObject
    emit('click', nearestObject)
    console.log('🚀发送点击事件:', nearestObject)
  } else {
    activeMesh.value = null
  }
})

// 监听货物位置更新
watch(lastCargoUpdate, (update) => {
  if (update && update.data) {
    const { cargoId, newPosition } = update.data

    // 设置正在更新的货物ID
    updatingCargoId.value = cargoId

    // 清除之前的动画
    if (updateAnimation.value) {
      clearTimeout(updateAnimation.value)
    }

    // 3秒后清除更新状态
    updateAnimation.value = setTimeout(() => {
      updatingCargoId.value = null
      updateAnimation.value = null
    }, 3000)

    console.log(`🎬 货物 ${cargoId} 位置更新动画开始`)
  }
}, { deep: true })

// 监听连接状态变化
watch(isConnected, (connected) => {
  if (connected) {
    console.log('✅ 实时连接已建立')
  } else {
    console.log('❌ 实时连接已断开')
  }
})

// 监听连接错误
watch(connectionError, (error) => {
  if (error) {
    console.error('❌ 连接错误:', error)
  }
})

// 组件挂载时的错误处理
onMounted(() => {
  // 添加全局错误处理
  const originalErrorHandler = window.onerror
  window.onerror = (message, source, lineno, colno, error) => {
    console.error('🌐 全局错误:', { message, source, lineno, colno, error })
    if (originalErrorHandler) {
      return originalErrorHandler(message, source, lineno, colno, error)
    }
    return false
  }

  // 添加未处理的Promise错误处理
  const originalUnhandledRejectionHandler = window.onunhandledrejection
  window.onunhandledrejection = (event) => {
    console.error('🌐 未处理的Promise错误:', event.reason)
    if (originalUnhandledRejectionHandler) {
      // 以 window 作为 this 上下文调用原始处理器，避免类型错误
      return originalUnhandledRejectionHandler.call(window, event)
    }
  }
})
// 组件卸载时的清理
onUnmounted(() => {
  // 清理动画定时器
  if (updateAnimation.value) {
    clearTimeout(updateAnimation.value)
    updateAnimation.value = null
  }
})
</script>

<template>

  <!-- 渲染存储区域 -->
  <template v-for="area in storageAreas" :key="area.id">
    <!-- 区域标签 -->
    <TresMesh ref="areaMeshes" :userData="area" :position="[getAreaCenter(area).x, -0.005, getAreaCenter(area).z]"
      :rotation="[Math.PI / 2, 0, 0]">
      <TresPlaneGeometry :args="[getAreaSize(area).width, getAreaSize(area).depth]" />
      <TresMeshBasicMaterial :color="getAreaColor(area)" :transparent="true" :opacity="0.8" :side="2" />
    </TresMesh>

    <Billboard v-if="activeMesh?.userData?.id === area.id"
      :position="[getAreaCenter(area).x, getAreaSize(area).height + 1, getAreaCenter(area).z]">
      <TextSpirit :text="area.name" :fontSize="128" :backgroundColor="'#fff'" />
    </Billboard>

    <Box v-if="activeMesh?.userData?.id === area.id"
      :args="[getAreaSize(area).width, getAreaSize(area).height, getAreaSize(area).depth]"
      :position="[getAreaCenter(area).x, getAreaSize(area).height / 2, getAreaCenter(area).z]">
      <TresMeshBasicMaterial :color="getAreaColor(area)" :transparent="true" :opacity="0.2" />
      <Edges color="#000000" />
    </Box>
  </template>

  <!-- 渲染货物 -->
  <template v-for="cargo in visibleCargos" :key="cargo.id">
    <!-- 货物主体 -->
    <TresMesh ref="cargoMeshes" :userData="cargo"
      :position="[cargo.position.x, cargo.position.y + cargo.dimensions.height / 2, cargo.position.z]">
      <TresBoxGeometry :args="[cargo.dimensions.length, cargo.dimensions.height, cargo.dimensions.width]" />
      <TresMeshBasicMaterial :color="updatingCargoId === cargo.id ? '#ff6b6b' : getCargoColor(cargo)"
        :transparent="true" :opacity="updatingCargoId === cargo.id ? 0.8 : 0.95" :side="2" />
      <Edges :color="updatingCargoId === cargo.id ? '#ff0000' : '#000000'" />
      <Outline :thickness="updatingCargoId === cargo.id ? 0.01 : 0.005"
        :color="updatingCargoId === cargo.id ? '#ff0000' : '#ff3030'"
        v-if="activeMesh?.userData?.id === cargo.id || updatingCargoId === cargo.id" />
    </TresMesh>

    <!-- 货物标签 -->
    <Billboard v-if="activeMesh?.userData?.id === cargo.id || updatingCargoId === cargo.id" :depthWrite="false"
      :depthTest="false" :renderOrder="10000"
      :position="[cargo.position.x, cargo.position.y + cargo.dimensions.height + 1, cargo.position.z]">
      <TextSpirit :text="`${cargo.name} - ${cargo.status}${updatingCargoId === cargo.id ? ' (更新中...)' : ''}`"
        :fontSize="128" :backgroundColor="updatingCargoId === cargo.id ? '#ff6b6b' : '#fff'" />
    </Billboard>

    <!-- 位置更新指示器 -->
    <Billboard v-if="updatingCargoId === cargo.id"
      :position="[cargo.position.x, cargo.position.y + cargo.dimensions.height + 2.5, cargo.position.z]">
      <TextSpirit :text="'📍 位置更新中'" :fontSize="96" :backgroundColor="'#ff6b6b'" :fontColor="'#ffffff'" />
    </Billboard>
  </template>

  <!-- 渲染轨迹 -->
  <template v-for="trajectory in trajectories" :key="trajectory.id">
    <!-- 轨迹线条 - 使用简单的线条连接 -->
    <template v-for="(point, pointIndex) in trajectory.points" :key="`${trajectory.id}-line-${pointIndex}`">
      <TresLineSegments v-if="pointIndex < trajectory.points.length - 1" :userData="trajectory">
        <TresBufferGeometry>
          <TresFloat32BufferAttribute :args="[
            [
              point.position.x, point.position.y, point.position.z,
              trajectory.points[pointIndex + 1].position.x, trajectory.points[pointIndex + 1].position.y, trajectory.points[pointIndex + 1].position.z
            ],
            3
          ]" attach="attributes-position" />
        </TresBufferGeometry>
        <TresLineBasicMaterial :color="getTrajectoryColor(trajectory)" :linewidth="2" />
      </TresLineSegments>
    </template>

    <!-- 轨迹点 -->
    <template v-for="(point) in trajectory.points" :key="`${trajectory.id}-${point.id}`">
      <TresMesh :position="[point.position.x, point.position.y, point.position.z]" ref="trajectoryMeshes"
        :userData="{ ...trajectory, point }">
        <TresSphereGeometry :args="[0.5, 8, 8]" />
        <TresMeshBasicMaterial :color="getTrajectoryColor(trajectory)" />
        <Outline :thickness="0.005" color="#ffffff" v-if="activeMesh?.userData?.id === trajectory.id" />
      </TresMesh>
    </template>

    <!-- 轨迹标签 -->
    <Billboard v-if="activeMesh?.userData?.id === trajectory.id && trajectory.points && trajectory.points.length > 0"
      :position="[trajectory.points[0].position.x, trajectory.points[0].position.y + 2, trajectory.points[0].position.z]">
      <TextSpirit :text="`${trajectory.name} - ${trajectory.status}`" :fontSize="128"
        :backgroundColor="getTrajectoryColor(trajectory)" />
    </Billboard>

    <!-- 轨迹信息面板 -->
    <Billboard
      v-if="activeMesh?.userData?.id === trajectory.id && trajectory.points && trajectory.points.length > 0 && trajectory.metadata"
      :position="[trajectory.points[0].position.x + 3, trajectory.points[0].position.y + 1, trajectory.points[0].position.z]">
      <TextSpirit
        :text="`距离: ${trajectory.metadata.totalDistance || 0}m\n时间: ${trajectory.metadata.totalTime || 0}s\n速度: ${trajectory.metadata.averageSpeed || 0}m/s`"
        :fontSize="64" :backgroundColor="'#ffffff'" />
    </Billboard>
  </template>
</template>
