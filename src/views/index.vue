<script setup lang="ts">
import { TresCanvas, TresInstance } from '@tresjs/core'
import { CameraControls, Stats, Sky, Grid, Html } from '@tresjs/cientos'
import { onMounted, reactive, ref, toRaw, unref } from 'vue'
import { initializeDataSource } from '~/api'
import * as Tweakpane from 'tweakpane'
import { PerspectiveCamera, Vector3, PCFSoftShadowMap, SRGBColorSpace, NoToneMapping, RepeatWrapping } from 'three'
import Legend from '~/components/Legend.vue'
import { ClassType } from '~/types/base'
import type { Cargo, StorageArea, Trajectory } from '~/types'
// 初始化数据源
initializeDataSource()

// 使用 Pinia store
const dataStore = useDataStore()
const showDebugUi = ref(false)

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

// 相机引用
const cameraRef = ref<PerspectiveCamera>()
// CameraControls 只能作为值使用，不能作为类型，需使用 typeof
const controlsRef = ref<InstanceType<typeof CameraControls>>()

// 组件挂载时加载数据和初始化 Tweakpane
onMounted(() => {
  console.log('🚀 App.vue 组件已挂载，开始加载数据...')
  dataStore.loadData()

  // 初始化 Tweakpane
  try {
    initTweakpane()
  } catch (error) {
    console.error('🚨 Tweakpane 初始化失败:', error)
  }
})

const paneContainerRef = ref<HTMLElement>()
function initTweakpane() {
  const pane = new Tweakpane.Pane({ title: '3D 场景控制', container: paneContainerRef.value as HTMLElement })
  // 相机控制面板
  const cameraFolder = pane.addFolder({ title: '相机控制', expanded: false })

  // 相机位置
  const positionFolder = cameraFolder.addFolder({ title: '相机位置', expanded: false })
  positionFolder.addInput(cameraState.position, 'x', {
    label: 'X 坐标',
    min: -200,
    max: 200,
    step: 1
  })
  positionFolder.addInput(cameraState.position, 'y', {
    label: 'Y 坐标',
    min: 0,
    max: 200,
    step: 1
  })
  positionFolder.addInput(cameraState.position, 'z', {
    label: 'Z 坐标',
    min: -200,
    max: 200,
    step: 1
  })

  // 相机视角
  const lookAtFolder = cameraFolder.addFolder({ title: '视角中心', expanded: false })
  lookAtFolder.addInput(cameraState.lookAt, 'x', {
    label: 'X 坐标',
    min: -200,
    max: 200,
    step: 1
  })
  lookAtFolder.addInput(cameraState.lookAt, 'y', {
    label: 'Y 坐标',
    min: -200,
    max: 200,
    step: 1
  })
  lookAtFolder.addInput(cameraState.lookAt, 'z', {
    label: 'Z 坐标',
    min: -200,
    max: 200,
    step: 1
  })

  // 相机控制器面板
  const controlsFolder = pane.addFolder({ title: '控制器设置', expanded: false })
  controlsFolder.addInput(controlsState, 'minDistance', {
    label: '最小距离',
    min: 1,
    max: 50,
    step: 1
  })
  controlsFolder.addInput(controlsState, 'maxDistance', {
    label: '最大距离',
    min: 50,
    max: 500,
    step: 10
  })
  controlsFolder.addInput(controlsState, 'enable', {
    label: '启用控制器'
  })

  // 光照控制面板
  const lightFolder = pane.addFolder({ title: '光照设置', expanded: false })

  // 环境光
  const ambientFolder = lightFolder.addFolder({ title: '环境光', expanded: false })
  ambientFolder.addInput(lightState, 'ambientIntensity', {
    label: '强度',
    min: 0,
    max: 5,
    step: 0.1
  })

  // 点光源
  const pointLightFolder = lightFolder.addFolder({ title: '点光源', expanded: false })
  pointLightFolder.addInput(lightState, 'pointLightIntensity', {
    label: '强度',
    min: 0,
    max: 100,
    step: 1
  })
  const pointPosFolder = pointLightFolder.addFolder({ title: '位置', expanded: false })
  pointPosFolder.addInput(lightState.pointLightPosition, 'x', {
    label: 'X',
    min: -500,
    max: 500,
    step: 1
  })
  pointPosFolder.addInput(lightState.pointLightPosition, 'y', {
    label: 'Y',
    min: -500,
    max: 500,
    step: 1
  })
  pointPosFolder.addInput(lightState.pointLightPosition, 'z', {
    label: 'Z',
    min: -500,
    max: 500,
    step: 1
  })

  // 方向光
  const directionalFolder = lightFolder.addFolder({ title: '方向光', expanded: false })
  directionalFolder.addInput(lightState, 'directionalLightIntensity', {
    label: '强度',
    min: 0,
    max: 5,
    step: 0.1
  })
  const dirPosFolder = directionalFolder.addFolder({ title: '位置', expanded: false })
  dirPosFolder.addInput(lightState.directionalLightPosition, 'x', {
    label: 'X',
    min: -500,
    max: 500,
    step: 1
  })
  dirPosFolder.addInput(lightState.directionalLightPosition, 'y', {
    label: 'Y',
    min: -500,
    max: 500,
    step: 1
  })
  dirPosFolder.addInput(lightState.directionalLightPosition, 'z', {
    label: 'Z',
    min: -500,
    max: 500,
    step: 1
  })

  // 场景设置面板
  const sceneFolder = pane.addFolder({ title: '场景设置', expanded: false })
  sceneFolder.addInput(sceneState, 'clearColor', {
    label: '背景颜色'
  })
  sceneFolder.addInput(sceneState, 'showGrid', {
    label: '显示网格'
  })
  sceneFolder.addInput(sceneState, 'showAxes', {
    label: '显示坐标轴'
  })
  sceneFolder.addInput(sceneState, 'sky', {
    label: '显示天空'
  })
  sceneFolder.addInput(sceneState, 'shadows', {
    label: '显示阴影'
  })
  sceneFolder.addInput(sceneState, 'ground', {
    label: '显示地面'
  })

  // 预设按钮
  const presetFolder = pane.addFolder({ title: '预设视角', expanded: false })
  presetFolder.addButton({ title: '俯视图' }).on('click', () => {
    cameraState.position.x = 0
    cameraState.position.y = 100
    cameraState.position.z = 0
    cameraState.lookAt.x = 0
    cameraState.lookAt.y = 0
    cameraState.lookAt.z = 0
  })
  presetFolder.addButton({ title: '侧视图' }).on('click', () => {
    cameraState.position.x = 100
    cameraState.position.y = 0
    cameraState.position.z = 0
    cameraState.lookAt.x = 0
    cameraState.lookAt.y = 0
    cameraState.lookAt.z = 0
  })
  presetFolder.addButton({ title: '等轴测图' }).on('click', () => {
    cameraState.position.x = 50
    cameraState.position.y = 30
    cameraState.position.z = 50
    cameraState.lookAt.x = 0
    cameraState.lookAt.y = 0
    cameraState.lookAt.z = 0
  })
}
import gsap from 'gsap'
function handleClick(instance: TresInstance) {
  console.log('🔍 点击:', instance, instance.userData)
  const controls = unref(controlsRef)
  const target = new Vector3()
  controls?.instance?.getTarget(target, false)
  const position = new Vector3()
  controls?.instance?.getPosition(position, false)
  console.log('target', target);
  console.log('position', position);
  cameraState.position.x = position.x
  cameraState.position.y = position.y
  cameraState.position.z = position.z
  cameraState.lookAt.x = target.x
  cameraState.lookAt.y = target.y
  cameraState.lookAt.z = target.z

  // 从实例的用户数据中获取对象信息
  const objectId = instance.userData?.id
  const objectType = instance.userData?._type // 'cargo', 'area', 'trajectory'
  let objectData: Cargo | StorageArea | Trajectory | null = null

  if (objectId && objectType) {
    // 根据对象类型获取真实数据
    switch (objectType) {
      case ClassType.CARGO:
        const realCargo = dataStore.getCargoById(objectId)
        if (realCargo) {
          objectData = realCargo
        }
        break

      case ClassType.STORAGE_AREA:
        const realArea = dataStore.getAreaById(objectId)
        if (realArea) {
          objectData = realArea
        }
        break

      case ClassType.TRAJECTORY:
        const realTrajectory = dataStore.getTrajectoryById(objectId)
        if (realTrajectory) {

          objectData = realTrajectory
        }
        break
    }
  }

  selectedObjectData.value = objectData
  selectedObjectType.value = objectType
  const worldPosition = new Vector3()
  instance.getWorldPosition(worldPosition)
  let tl = gsap.timeline()
  tl.to(cameraState.position, {
    x: worldPosition.x + 20,
    y: worldPosition.y + 20,
    z: worldPosition.z + 20,
    duration: 1,
    ease: 'power2.inOut'
  }, 0)
  tl.to(cameraState.lookAt, {
    x: worldPosition.x,
    y: worldPosition.y,
    z: worldPosition.z,
    duration: 1,
    ease: 'power2.inOut'
  }, 0)

  // 动画完成后显示弹窗
  tl.call(() => {
    showDetailModal.value = true
  }, [], 1)
}
function handleOrbitControlChange(event: any) {
  // 获取相机和控制器实例
}
watch([cameraState.lookAt, cameraState.position], ([newLookAt, newPosition]) => {
  const controls = unref(controlsRef)
  controls?.instance?.setPosition(newPosition.x, newPosition.y, newPosition.z, true)
  controls?.instance?.setTarget(newLookAt.x, newLookAt.y, newLookAt.z, true)
})

// 处理弹窗事件
const handleModalEdit = (data: any) => {
  console.log('编辑对象:', data)
  // 这里可以添加编辑逻辑
}

const handleModalTrack = (data: any) => {
  console.log('追踪对象:', data)
  // 这里可以添加追踪逻辑
}

import { useTexture } from '@tresjs/core'
const pbrDirtyConcreteTexture = await useTexture({
  map: '/texture/dirty_concrete/Dirty_Concrete_ueypchdcw_1K_BaseColor.jpg',
  displacementMap: '/texture/dirty_concrete/Dirty_Concrete_ueypchdcw_1K_Displacement.jpg',
  roughnessMap: '/texture/dirty_concrete/Dirty_Concrete_ueypchdcw_1K_Roughness.jpg',
  normalMap: '/texture/dirty_concrete/Dirty_Concrete_ueypchdcw_1K_Normal.jpg',
  aoMap: '/texture/dirty_concrete/Dirty_Concrete_ueypchdcw_1K_AO.jpg',
})
pbrDirtyConcreteTexture.map.wrapS = RepeatWrapping
pbrDirtyConcreteTexture.map.wrapT = RepeatWrapping
pbrDirtyConcreteTexture.map.repeat.set(10,5)

pbrDirtyConcreteTexture.normalMap.wrapS = RepeatWrapping
pbrDirtyConcreteTexture.normalMap.wrapT = RepeatWrapping
pbrDirtyConcreteTexture.normalMap.repeat.set(10,5)

function getTexture(){
  return pbrDirtyConcreteTexture
}


</script>

<template>
  <div class="app-container">


    <!-- 3D 场景 -->
    <div class="scene-container">
      <TresCanvas :clear-color="sceneState.clearColor" :alpha="false" :tone-mapping="NoToneMapping"
        :shadow-map-type="PCFSoftShadowMap" :shadow-map-enabled="true" :output-color-space="SRGBColorSpace"
        :shadows="sceneState.shadows" window-size>

        <Sky v-if="sceneState.sky" />
        <Stats v-if="showDebugUi" />
        <!-- <Stats /> -->
        <TresPerspectiveCamera ref="cameraRef"
          :position="[cameraState.position.x, cameraState.position.y, cameraState.position.z]"
          :look-at="[cameraState.lookAt.x, cameraState.lookAt.y, cameraState.lookAt.z]" :fov="cameraState.fov"
          :near="cameraState.near" :far="cameraState.far" />
        <CameraControls v-if="controlsState.enable" ref="controlsRef" v-bind="controlsState"
          @change="handleOrbitControlChange" make-default />

        <!-- 环境光 -->
        <TresAmbientLight :intensity="lightState.ambientIntensity" />

        <!-- 点光源 -->
        <TresPointLight :decay="0.5" cast-shadow :intensity="lightState.pointLightIntensity"
          :position="[lightState.pointLightPosition.x, lightState.pointLightPosition.y, lightState.pointLightPosition.z]" />

        <!-- 方向光 -->
        <TresDirectionalLight
          :position="[lightState.directionalLightPosition.x, lightState.directionalLightPosition.y, lightState.directionalLightPosition.z]"
          :intensity="lightState.directionalLightIntensity" />

        <!-- 地面网格 -->
        <!-- <TresGridHelper v-if="sceneState.showGrid" :args="[toRaw(sceneState).gridSize, toRaw(sceneState).gridDivisions]"
          :position="[0, 0, 0]" /> -->
        <Grid v-if="sceneState.showGrid"
          :args="[toRaw(sceneState).gridSize, toRaw(sceneState).gridSize, toRaw(sceneState).gridDivisions, toRaw(sceneState).gridDivisions]"
          cell-color="#82dbc5" :cell-size="5" :cell-thickness="0.5" section-color="#fbb03b"
          :section-size="sceneState.gridDivisions" :section-thickness="1.3" :infinite-grid="true" :fade-from="0"
          :fade-distance="100" :fade-strength="1" />
        <TresMesh v-if="sceneState.ground" receive-shadow :position="[0, -0.5, 0]" :rotation="[-Math.PI / 2, 0, 0]">
          <TresPlaneGeometry :args="[300, 150, 10, 10]" />
          <TresMeshStandardMaterial :map="getTexture().map" :displacementMap="getTexture().displacementMap"
            :roughnessMap="getTexture().roughnessMap" :normalMap="getTexture().normalMap"
            :aoMap="getTexture().aoMap"  />
        </TresMesh>

        <Suspense>
          <Main @click="handleClick" />
          <template #fallback>
            <Html>
            <div class="loading-container">
              <i class="i-svg-spinners:blocks-wave text-3xl"></i>
            </div>

            </Html>
          </template>
        </Suspense>

        <!-- 坐标轴辅助 -->
        <TresAxesHelper v-if="sceneState.showAxes" :args="[1000]" />
      </TresCanvas>
    </div>

    <!-- 控制面板 -->
    <Suspense>
      <DataStats @title-dblclick="showDebugUi = !showDebugUi"></DataStats>
    </Suspense>

    <div class="pane-container" ref="paneContainerRef" v-show="showDebugUi"></div>
    <!-- 图例 -->
    <Legend />

    <!-- 详情弹窗 -->
    <DetailModal v-model:is-open="showDetailModal" :object-data="selectedObjectData"
      :object-type="selectedObjectData?._type" @edit="handleModalEdit" @track="handleModalTrack" />
  </div>
</template>

<style scoped>
.app-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.scene-container {
  flex: 1;
  position: relative;
}

.loading-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  align-items: center;
}

.pane-container {
  z-index: 2000;
  position: absolute;
  top: 10px;
  right: 10px;
  width: 300px;
  height: auto;
}
</style>
