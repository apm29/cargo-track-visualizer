<script setup lang="ts">
import { TresCanvas, TresInstance } from '@tresjs/core'
import { CameraControls, Stats, Sky, Grid } from '@tresjs/cientos'
import { onMounted, reactive, ref, toRaw, unref } from 'vue'
import { initializeDataSource } from '~/api'
import * as Tweakpane from 'tweakpane'
import { PerspectiveCamera, Vector3, BasicShadowMap, SRGBColorSpace, NoToneMapping } from 'three'
import { CollapsibleRoot, CollapsibleContent, CollapsibleTrigger } from 'reka-ui'
// 初始化数据源
initializeDataSource()

// 使用 Pinia store
const dataStore = useDataStore()

// 相机控制状态
const cameraState = reactive({
  position: { x: 50, y: 30, z: 50 },
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
  ambientIntensity: 0.6,
  pointLightIntensity: 5,
  pointLightPosition: { x: 0, y: 20, z: 0 },
  directionalLightIntensity: 0.8,
  directionalLightPosition: { x: 10, y: 10, z: 5 }
})

// 场景状态
const sceneState = reactive({
  clearColor: '#f0f0f0',
  showGrid: true,
  showAxes: true,
  gridSize: 1000,
  gridDivisions: 50,
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


function initTweakpane() {
  const pane = new Tweakpane.Pane({ title: '3D 场景控制' })

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
    max: 2,
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
    min: -50,
    max: 50,
    step: 1
  })
  pointPosFolder.addInput(lightState.pointLightPosition, 'y', {
    label: 'Y',
    min: -50,
    max: 50,
    step: 1
  })
  pointPosFolder.addInput(lightState.pointLightPosition, 'z', {
    label: 'Z',
    min: -50,
    max: 50,
    step: 1
  })

  // 方向光
  const directionalFolder = lightFolder.addFolder({ title: '方向光', expanded: false })
  directionalFolder.addInput(lightState, 'directionalLightIntensity', {
    label: '强度',
    min: 0,
    max: 2,
    step: 0.1
  })
  const dirPosFolder = directionalFolder.addFolder({ title: '位置', expanded: false })
  dirPosFolder.addInput(lightState.directionalLightPosition, 'x', {
    label: 'X',
    min: -50,
    max: 50,
    step: 1
  })
  dirPosFolder.addInput(lightState.directionalLightPosition, 'y', {
    label: 'Y',
    min: -50,
    max: 50,
    step: 1
  })
  dirPosFolder.addInput(lightState.directionalLightPosition, 'z', {
    label: 'Z',
    min: -50,
    max: 50,
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
  console.log('🔍 点击:', instance)
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


  let tl = gsap.timeline()
  tl.to(cameraState.position, {
    x: instance.position.x + 20,
    y: instance.position.y + 20,
    z: instance.position.z + 20,
    duration: 1,
    ease: 'power2.inOut'
  }, 0)
  tl.to(cameraState.lookAt, {
    x: instance.position.x,
    y: instance.position.y,
    z: instance.position.z,
    duration: 1,
    ease: 'power2.inOut'
  }, 0)
}
function handleOrbitControlChange(event: any) {
  // 获取相机和控制器实例
}
watch([cameraState.lookAt, cameraState.position], ([newLookAt, newPosition]) => {
  const controls = unref(controlsRef)
  controls?.instance?.setPosition(newPosition.x, newPosition.y, newPosition.z, true)
  controls?.instance?.setTarget(newLookAt.x, newLookAt.y, newLookAt.z, true)
})



</script>

<template>
  <div class="app-container">
    <!-- 控制面板 -->
    <Suspense>
      <DataStats></DataStats>
    </Suspense>

    <!-- 3D 场景 -->
    <div class="scene-container">
      <TresCanvas :clear-color="sceneState.clearColor" :alpha="false" :tone-mapping="NoToneMapping"
        :shadow-map-type="BasicShadowMap" :output-color-space="SRGBColorSpace" shadow window-size>

        <Sky />
        <Stats />
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
        <TresPointLight cast-shadow :intensity="lightState.pointLightIntensity"
          :position="[lightState.pointLightPosition.x, lightState.pointLightPosition.y, lightState.pointLightPosition.z]" />

        <!-- 方向光 -->
        <TresDirectionalLight cast-shadow
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
        <Suspense>
          <Main @click="handleClick" />
        </Suspense>

        <!-- 坐标轴辅助 -->
        <TresAxesHelper v-if="sceneState.showAxes" :args="[1000]" />
      </TresCanvas>
    </div>

    

    <!-- 图例 -->
    <div
      class="absolute bottom-5 right-5 bg-white/90 dark:bg-gray-800/90 p-5 rounded-lg shadow-lg z-1000 min-w-60 backdrop-blur-sm">
      <div class="flex items-center gap-2 mb-4">
        <i class="i-carbon-legend text-gray-600 dark:text-gray-400 text-lg"></i>
        <h3 class="m-0 text-gray-900 dark:text-white text-base font-semibold">图例</h3>
      </div>
      <div class="space-y-3">
        <CollapsibleRoot class="w-full">
          <CollapsibleTrigger
            class="w-full flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div class="flex items-center gap-2">
              <i class="i-carbon-map text-gray-600 dark:text-gray-400"></i>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">区域类型</span>
            </div>
            <i class="i-carbon-chevron-down text-gray-500 transition-transform duration-200" />
          </CollapsibleTrigger>
          <CollapsibleContent class="pt-2 space-y-2">
            <div class="flex items-center space-x-3">
              <div class="w-5 h-5 rounded border border-gray-300 bg-area-storage"></div>
              <span class="text-sm text-gray-600 dark:text-gray-400">存储区</span>
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-5 h-5 rounded border border-gray-300 bg-area-transit"></div>
              <span class="text-sm text-gray-600 dark:text-gray-400">转运区</span>
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-5 h-5 rounded border border-gray-300 bg-area-loading"></div>
              <span class="text-sm text-gray-600 dark:text-gray-400">装卸区</span>
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-5 h-5 rounded border border-gray-300 bg-area-maintenance"></div>
              <span class="text-sm text-gray-600 dark:text-gray-400">维护区</span>
            </div>
          </CollapsibleContent>
        </CollapsibleRoot>

        <CollapsibleRoot class="w-full">
          <CollapsibleTrigger
            class="w-full flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div class="flex items-center gap-2">
              <i class="i-carbon-package text-gray-600 dark:text-gray-400"></i>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">货物状态</span>
            </div>
            <i class="i-carbon-chevron-down text-gray-500 transition-transform duration-200" />
          </CollapsibleTrigger>
          <CollapsibleContent class="pt-2 space-y-2">
            <div class="flex items-center space-x-3">
              <div class="w-5 h-5 rounded border border-gray-300 bg-cargo-stored"></div>
              <span class="text-sm text-gray-600 dark:text-gray-400">已存储</span>
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-5 h-5 rounded border border-gray-300 bg-cargo-in-transit"></div>
              <span class="text-sm text-gray-600 dark:text-gray-400">转运中</span>
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-5 h-5 rounded border border-gray-300 bg-cargo-loading"></div>
              <span class="text-sm text-gray-600 dark:text-gray-400">装卸中</span>
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-5 h-5 rounded border border-gray-300 bg-cargo-maintenance"></div>
              <span class="text-sm text-gray-600 dark:text-gray-400">维护中</span>
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-5 h-5 rounded border border-gray-300 bg-cargo-damaged"></div>
              <span class="text-sm text-gray-600 dark:text-gray-400">损坏</span>
            </div>
          </CollapsibleContent>
        </CollapsibleRoot>

        <CollapsibleRoot class="w-full">
          <CollapsibleTrigger
            class="w-full flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div class="flex items-center gap-2">
              <i class="i-carbon:router text-gray-600 dark:text-gray-400"></i>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">轨迹类型</span>
            </div>
            <i class="i-carbon-chevron-down text-gray-500 transition-transform duration-200" />
          </CollapsibleTrigger>
          <CollapsibleContent class="pt-2 space-y-2">
            <div class="flex items-center space-x-3">
              <div class="w-5 h-5 rounded border border-gray-300 bg-area-storage"></div>
              <span class="text-sm text-gray-600 dark:text-gray-400">货物移动轨迹</span>
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-5 h-5 rounded border border-gray-300 bg-area-transit"></div>
              <span class="text-sm text-gray-600 dark:text-gray-400">机械操作轨迹</span>
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-5 h-5 rounded border border-gray-300 bg-area-loading"></div>
              <span class="text-sm text-gray-600 dark:text-gray-400">转运路径轨迹</span>
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-5 h-5 rounded border border-gray-300 bg-area-maintenance"></div>
              <span class="text-sm text-gray-600 dark:text-gray-400">维护路线轨迹</span>
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-5 h-5 rounded border border-gray-300 bg-area-special"></div>
              <span class="text-sm text-gray-600 dark:text-gray-400">紧急疏散轨迹</span>
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-5 h-5 rounded border border-gray-300 bg-area-unloading"></div>
              <span class="text-sm text-gray-600 dark:text-gray-400">优化路径轨迹</span>
            </div>
          </CollapsibleContent>
        </CollapsibleRoot>

        <CollapsibleRoot class="w-full">
          <CollapsibleTrigger
            class="w-full flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div class="flex items-center gap-2">
              <i class="i-carbon-status-change text-gray-600 dark:text-gray-400"></i>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">轨迹状态</span>
            </div>
            <i class="i-carbon-chevron-down text-gray-500 transition-transform duration-200" />
          </CollapsibleTrigger>
          <CollapsibleContent class="pt-2 space-y-2">
            <div class="flex items-center space-x-3">
              <div class="w-5 h-5 rounded border border-gray-300 bg-area-buffer"></div>
              <span class="text-sm text-gray-600 dark:text-gray-400">已规划</span>
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-5 h-5 rounded border border-gray-300 bg-area-loading"></div>
              <span class="text-sm text-gray-600 dark:text-gray-400">执行中</span>
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-5 h-5 rounded border border-gray-300 bg-area-storage"></div>
              <span class="text-sm text-gray-600 dark:text-gray-400">已完成</span>
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-5 h-5 rounded border border-gray-300 bg-area-maintenance"></div>
              <span class="text-sm text-gray-600 dark:text-gray-400">已取消</span>
            </div>
          </CollapsibleContent>
        </CollapsibleRoot>
      </div>
    </div>
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

/* Collapsible 动画优化 */
:deep([data-state="open"] .i-carbon-chevron-down) {
  transform: rotate(180deg);
}

:deep([data-state="closed"] .i-carbon-chevron-down) {
  transform: rotate(0deg);
}

/* 确保 z-index 正确 */
.z-1000 {
  z-index: 1000;
}

</style>
