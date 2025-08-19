import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import { ClassType } from '~/types/base'
import type { Cargo, StorageArea, Trajectory } from '~/types'

export const useUiStore = defineStore('ui', () => {
  // 弹窗状态
  const showDetailModal = ref(false)
  const selectedObjectData = ref<Cargo | StorageArea | Trajectory | null>(null)
  const selectedObjectType = ref<ClassType>(ClassType.CARGO)

  // 相机控制状态
  const cameraState = reactive({
    position: { x: 0, y: 75, z: 75 },
    lookAt: { x: 0, y: 0, z: 0 },
    fov: 75,
    near: 0.1,
    far: 1000,
    aspect: 1
  })

  // 相机控制器状态
  const controlsState = reactive({
    enable: true,
    minDistance: 10,
    maxDistance: 100,
  })

  // 环境光状态
  const lightState = reactive({
    ambientIntensity: 0.8,
    pointLightIntensity: 35,
    pointLightPosition: { x: 0, y: 1080, z: -1920 },
    directionalLightIntensity: 0.5,
    directionalLightPosition: { x: 0, y: 150, z: -100 }
  })

  // 场景状态
  const sceneState = reactive({
    clearColor: '#202020',
    showGrid: false,
    showAxes: false,
    gridSize: 1000,
    gridDivisions: 50,
    sky: false,
    ground: true,
    shadows: false,
  })

  const showDebugUi = ref(false)

  return {
    showDetailModal,
    selectedObjectData,
    selectedObjectType,
    cameraState,
    controlsState,
    lightState,
    sceneState,
    showDebugUi,
  }
})
