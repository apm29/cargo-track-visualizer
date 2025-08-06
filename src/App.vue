<script setup lang="ts">
import { TresCanvas, TresInstance } from '@tresjs/core'
import { OrbitControls, Stats } from '@tresjs/cientos'
import { onMounted, reactive, ref, toRaw, unref } from 'vue'
import { initializeDataSource } from '~/api'
import * as Tweakpane from 'tweakpane'
import { PerspectiveCamera, Vector3 } from 'three'
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
  enableZoom: true,
  enableRotate: true,
  enablePan: true,
  panSpeed: 1,
  rotateSpeed: 1,
  zoomSpeed: 1,
  dampingFactor: 0.05,
  enableDamping: true,
})

// 环境光状态
const lightState = reactive({
  ambientIntensity: 0.6,
  pointLightIntensity: 50,
  pointLightPosition: { x: 2, y: 2, z: 0 },
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
const controlsRef = ref()

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
  controlsFolder.addInput(controlsState, 'enableZoom', {
    label: '启用缩放'
  })
  controlsFolder.addInput(controlsState, 'enableRotate', {
    label: '启用旋转'
  })
  controlsFolder.addInput(controlsState, 'enablePan', {
    label: '启用平移'
  })
  controlsFolder.addInput(controlsState, 'enableDamping', {
    label: '启用阻尼'
  })
  controlsFolder.addInput(controlsState, 'zoomSpeed', {
    label: '缩放速度'
  })
  controlsFolder.addInput(controlsState, 'rotateSpeed', {
    label: '旋转速度'
  })
  controlsFolder.addInput(controlsState, 'panSpeed', {
    label: '平移速度'
  })
  controlsFolder.addInput(controlsState, 'dampingFactor', {
    label: '阻尼系数'
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
  const position = unref(cameraRef)?.position



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
  console.log('🔍 控制器变化:', event)
}
</script>

<template>
  <div class="app-container">
    <!-- 控制面板 -->
    <Suspense>
      <DataStats></DataStats>
    </Suspense>

    <!-- 3D 场景 -->
    <div class="scene-container">
      <TresCanvas :clear-color="sceneState.clearColor" window-size>
        <Stats />
        <!-- <Stats /> -->
        <TresPerspectiveCamera ref="cameraRef"
          :position="[cameraState.position.x, cameraState.position.y, cameraState.position.z]"
          :look-at="[cameraState.lookAt.x, cameraState.lookAt.y, cameraState.lookAt.z]" :fov="cameraState.fov"
          :near="cameraState.near" :far="cameraState.far" />
        <OrbitControls v-if="controlsState.enable" ref="controlsRef" v-bind="controlsState"
          :target="[cameraState.lookAt.x, cameraState.lookAt.y, cameraState.lookAt.z]"
          :position="[cameraState.position.x, cameraState.position.y, cameraState.position.z]"
           make-default />

        <!-- 环境光 -->
        <TresAmbientLight :intensity="lightState.ambientIntensity" />

        <!-- 点光源 -->
        <TresPointLight :intensity="lightState.pointLightIntensity"
          :position="[lightState.pointLightPosition.x, lightState.pointLightPosition.y, lightState.pointLightPosition.z]" />

        <!-- 方向光 -->
        <TresDirectionalLight
          :position="[lightState.directionalLightPosition.x, lightState.directionalLightPosition.y, lightState.directionalLightPosition.z]"
          :intensity="lightState.directionalLightIntensity" />

        <!-- 地面网格 -->
        <TresGridHelper v-if="sceneState.showGrid" :args="[toRaw(sceneState).gridSize, toRaw(sceneState).gridDivisions]"
          :position="[0, 0, 0]" />
        <Suspense>
          <Main @click="handleClick" />
        </Suspense>

        <!-- 坐标轴辅助 -->
        <TresAxesHelper v-if="sceneState.showAxes" :args="[1000]" />
      </TresCanvas>
    </div>

    <!-- 图例 -->
    <div class="legend">
      <h3>图例</h3>
      <div class="legend-section">
        <h4>区域类型</h4>
        <div class="legend-item">
          <div class="color-box" style="background-color: #4CAF50;"></div>
          <span>存储区</span>
        </div>
        <div class="legend-item">
          <div class="color-box" style="background-color: #2196F3;"></div>
          <span>转运区</span>
        </div>
        <div class="legend-item">
          <div class="color-box" style="background-color: #FF9800;"></div>
          <span>装卸区</span>
        </div>
        <div class="legend-item">
          <div class="color-box" style="background-color: #F44336;"></div>
          <span>维护区</span>
        </div>
      </div>
      <div class="legend-section">
        <h4>货物状态</h4>
        <div class="legend-item">
          <div class="color-box" style="background-color: #4CAF50;"></div>
          <span>已存储</span>
        </div>
        <div class="legend-item">
          <div class="color-box" style="background-color: #2196F3;"></div>
          <span>转运中</span>
        </div>
        <div class="legend-item">
          <div class="color-box" style="background-color: #FF9800;"></div>
          <span>装卸中</span>
        </div>
        <div class="legend-item">
          <div class="color-box" style="background-color: #F44336;"></div>
          <span>维护中</span>
        </div>
        <div class="legend-item">
          <div class="color-box" style="background-color: #795548;"></div>
          <span>损坏</span>
        </div>
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

.legend {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.9);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 200px;
}

.legend h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 16px;
}

.legend-section {
  margin-bottom: 20px;
}

.legend-section h4 {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 14px;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.color-box {
  width: 20px;
  height: 20px;
  border-radius: 3px;
  margin-right: 10px;
  border: 1px solid #ddd;
}

.legend-item span {
  font-size: 14px;
  color: #333;
}
</style>
