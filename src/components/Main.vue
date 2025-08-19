<script setup lang="ts">
import { TresEvent, TresInstance, useRaycaster, useTresContext } from '@tresjs/core'
import { Billboard, Box, Edges, Outline } from '@tresjs/cientos'
import { shallowRef, unref, toRefs, computed, watch, onMounted, onUnmounted } from 'vue'
import { getAreaCenter, getAreaSize, getAreaColor, getTrajectoryColor } from '../utils/visualization'
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
// await new Promise(resolve => setTimeout(resolve, 60_000))
import { useGLTF } from '@tresjs/cientos'
import { Box3, Vector3, Mesh, RepeatWrapping, MeshStandardMaterial, MirroredRepeatWrapping } from 'three'
const { scene } = await useGLTF("/model/glb/iso_tank.glb", { draco: true })

const { scene: truckScene } = await useGLTF("/model/glb/truck.glb", { draco: true })
const { scene: craneScene } = await useGLTF("/model/glb/cranes.glb", { draco: true })
console.log(craneScene);

import { useTexture } from '@tresjs/core'
const pbrRustyMetalTexture = await useTexture({
  map: '/texture/rusty_metal/Rusty_Metal_Sheet_tjymdfmfw_1K_BaseColor.jpg',
  displacementMap: '/texture/rusty_metal/Rusty_Metal_Sheet_tjymdfmfw_1K_Displacement.jpg',
  roughnessMap: '/texture/rusty_metal/Rusty_Metal_Sheet_tjymdfmfw_1K_Roughness.jpg',
  normalMap: '/texture/rusty_metal/Rusty_Metal_Sheet_tjymdfmfw_1K_Normal.jpg',
  aoMap: '/texture/rusty_metal/Rusty_Metal_Sheet_tjymdfmfw_1K_AO.jpg',
})
pbrRustyMetalTexture.map.wrapS = RepeatWrapping
pbrRustyMetalTexture.map.wrapT = RepeatWrapping
pbrRustyMetalTexture.map.repeat.set(10, 10)

const pbrScratchedPaintMetalTexture = await useTexture({
  map: '/texture/scratched_painted_metal/Scratched_Painted_Metal_Sheet_vbsieik_1K_BaseColor.jpg',
  roughnessMap: '/texture/scratched_painted_metal/Scratched_Painted_Metal_Sheet_vbsieik_1K_Roughness.jpg',
  normalMap: '/texture/scratched_painted_metal/Scratched_Painted_Metal_Sheet_vbsieik_1K_Normal.jpg',
  aoMap: '/texture/scratched_painted_metal/Scratched_Painted_Metal_Sheet_vbsieik_1K_AO.jpg',
  metalnessMap: '/texture/scratched_painted_metal/Scratched_Painted_Metal_Sheet_vbsieik_1K_Metalness.jpg',
})
pbrScratchedPaintMetalTexture.map.wrapS = MirroredRepeatWrapping
pbrScratchedPaintMetalTexture.map.wrapT = MirroredRepeatWrapping
pbrScratchedPaintMetalTexture.map.repeat.set(15, 8)

const tank = scene;
const bbox = new Box3()
const size = new Vector3()
bbox.setFromObject(tank)
bbox.getSize(size)

const modelScale = new Vector3(
  8 / size.x,
  4 / size.y,
  4 / size.z,
)

// 创建共享的 PBR 材质
const createSharedMaterials = async () => {
  // 起重机材质 - 金属质感
  const craneMaterial = new MeshStandardMaterial({
    map: pbrRustyMetalTexture.map,
    roughnessMap: pbrRustyMetalTexture.roughnessMap,
    normalMap: pbrRustyMetalTexture.normalMap,
    aoMap: pbrRustyMetalTexture.aoMap,
    metalness: 0.6,
  })
  
  // 货物材质 - 涂装金属质感
  const cargoMaterial = new MeshStandardMaterial({
    map: pbrScratchedPaintMetalTexture.map,
    roughnessMap: pbrScratchedPaintMetalTexture.roughnessMap,
    normalMap: pbrScratchedPaintMetalTexture.normalMap,
    aoMap: pbrScratchedPaintMetalTexture.aoMap,
    metalnessMap: pbrScratchedPaintMetalTexture.metalnessMap,
  })
  
  // 区域材质工厂函数 - 根据区域状态动态创建
  const createAreaMaterial = (area: any, isActive: boolean = false) => {
    return new MeshStandardMaterial({
      color: getAreaColor(area),
      transparent: true,
      opacity: isActive ? 0.9 : 0.6,
      side: 2, // DoubleSide
      depthWrite: false,
      blending: 1, // NormalBlending
      roughness: 0.8,
      metalness: 0.1,
    })
  }
  
  return { craneMaterial, cargoMaterial, createAreaMaterial }
}

const { craneMaterial, cargoMaterial } = await createSharedMaterials()

// 设置起重机材质
craneScene.traverse((child) => {
  if (child instanceof Mesh) {
    child.material = craneMaterial
  }
})

const modeledCargos = computed(() => {
  return visibleCargos.value.map((cargo) => {
    const model = tank.clone()
    model.traverse((child) => {
      if (child instanceof Mesh) {
        child.userData = cargo
        // 使用共享材质，避免重复创建
        child.material = cargoMaterial
      }
    })
    return {
      ...cargo,
      model: model,
    }
  })
})

const allMeshes = computed(() => {
  return [...areaMeshes.value, ...cargoMeshes.value, ...trajectoryMeshes.value]
})

const { onClick } = useRaycaster(allMeshes, context)

onClick((event: TresEvent) => {
  console.log('🔍 候选:', event.intersections)
  const nearestObject = event.intersections
    .filter(item => unref(allMeshes).map(item => item.userData.id).includes(item.object.userData.id))
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
    const { cargoId } = update.data

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

// 组件卸载时的清理
onUnmounted(() => {
  // 清理动画定时器
  if (updateAnimation.value) {
    clearTimeout(updateAnimation.value)
    updateAnimation.value = null
  }
  
  // 清理材质资源
  if (craneMaterial) {
    craneMaterial.dispose()
    craneMaterial.map?.dispose()
    craneMaterial.roughnessMap?.dispose()
    craneMaterial.normalMap?.dispose()
    craneMaterial.aoMap?.dispose()
  }
  
  if (cargoMaterial) {
    cargoMaterial.dispose()
    cargoMaterial.map?.dispose()
    cargoMaterial.roughnessMap?.dispose()
    cargoMaterial.normalMap?.dispose()
    cargoMaterial.aoMap?.dispose()
    cargoMaterial.metalnessMap?.dispose()
  }
  
  // 清理纹理资源
  if (pbrRustyMetalTexture) {
    Object.values(pbrRustyMetalTexture).forEach(texture => {
      if (texture && typeof texture.dispose === 'function') {
        texture.dispose()
      }
    })
  }
  
  if (pbrScratchedPaintMetalTexture) {
    Object.values(pbrScratchedPaintMetalTexture).forEach(texture => {
      if (texture && typeof texture.dispose === 'function') {
        texture.dispose()
      }
    })
  }
})
</script>

<template>
  <primitive :object="truckScene" cast-shadow receive-shadow :position="[18, 0, 28]" :scale="2.5"
    :rotation="[0, -Math.PI / 2, 0]">
  </primitive>
  <primitive :object="craneScene" cast-shadow receive-shadow :position="[0, 0, 0]" :scale="2.75" :rotation="[0, 0, 0]">
  </primitive>

  <!-- 渲染存储区域 -->
  <template v-for="area in storageAreas" :key="area.id">
    <!-- 区域标签 -->
    <TresMesh ref="areaMeshes" receive-shadow :userData="area"
      :position="[getAreaCenter(area).x, 0, getAreaCenter(area).z]" :rotation="[Math.PI / 2, 0, 0]">
      <TresPlaneGeometry :args="[getAreaSize(area).width, getAreaSize(area).depth]" />
      <TresMeshPhongMaterial :color="getAreaColor(area)" :transparent="true" :opacity="0.8" :side="2" />
    </TresMesh>

    <Billboard v-if="activeMesh?.userData?.id === area.id"
      :position="[getAreaCenter(area).x, getAreaSize(area).height + 1, getAreaCenter(area).z]">
      <TextSpirit :text="area.name" :fontSize="128" :backgroundColor="'#fff'" />
    </Billboard>

    <Box v-if="activeMesh?.userData?.id === area.id"
      :args="[getAreaSize(area).width, getAreaSize(area).height, getAreaSize(area).depth]"
      :position="[getAreaCenter(area).x, getAreaSize(area).height / 2, getAreaCenter(area).z]">
      <TresMeshBasicMaterial :color="getAreaColor(area)" :transparent="true" :opacity="0.2" />
      <Edges color="#333333" v-if="activeMesh?.userData?.id === area.id" />
    </Box>
  </template>

  <!-- 渲染货物 -->
  <template v-for="cargo in modeledCargos" :key="cargo.id">
    <!-- 货物主体 -->
    <!-- <TresMesh ref="cargoMeshes" receive-shadow cast-shadow :userData="cargo"
      :position="[cargo.position.x, cargo.position.y + cargo.dimensions.height / 2, cargo.position.z]">
      <TresBoxGeometry :args="[cargo.dimensions.length, cargo.dimensions.height, cargo.dimensions.width]" />
      <TresMeshPhongMaterial emissive="#000000" specular="#330000" :color="getCargoColor(cargo)"
        :transparent="false" />
      <Edges :color="'#333333'" />
      <Outline :thickness="updatingCargoId === cargo.id ? 0.002 : 0.002" :color="'#ffffff'"
        v-if="activeMesh?.userData?.id === cargo.id || updatingCargoId === cargo.id" />
    </TresMesh> -->

    <primitive receive-shadow cast-shadow :userData="cargo"
      :position="[cargo.position.x, cargo.position.y + cargo.dimensions.height / 2, cargo.position.z]" ref="cargoMeshes"
      :object="cargo.model" :scale="modelScale">
      <Outline :thickness="0.02" :color="'#ffffff'" v-if="activeMesh?.userData?.id === cargo.id" />
    </primitive>

    <!-- 货物标签 -->
    <Billboard v-if="activeMesh?.userData?.id === cargo.id || updatingCargoId === cargo.id" :depthWrite="false"
      :depthTest="false" :renderOrder="10000"
      :position="[cargo.position.x, cargo.position.y + cargo.dimensions.height + 1, cargo.position.z]">
      <TextSpirit :text="`${cargo.name} - ${cargo.status}`" :fontSize="128"
        :backgroundColor="updatingCargoId === cargo.id ? '#ff6b6b' : '#fff'" />
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
    <TresGroup v-for="(point) in trajectory.points" :key="`${trajectory.id}-${point.id}`">
      <TresMesh :position="[point.position.x, point.position.y, point.position.z]" ref="trajectoryMeshes"
        :userData="trajectory">
        <TresSphereGeometry :args="[0.5, 8, 8]" />
        <TresMeshBasicMaterial :color="getTrajectoryColor(trajectory)" />
        <Outline :thickness="0.005" color="#ffffff" v-if="activeMesh?.userData?.id === trajectory.id" />
      </TresMesh>
    </TresGroup>

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
