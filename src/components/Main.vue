<script setup lang="ts">
import { TresEvent, TresInstance, useRaycaster, useTresContext, useTexture, TresObject3D } from '@tresjs/core'
import { Billboard, Box, Edges, Outline, useGLTF } from '@tresjs/cientos'
import { shallowRef, unref, toRefs, computed, watch, onMounted, onUnmounted } from 'vue'
import { getAreaCenter, getAreaSize, getAreaColor, getTrajectoryColor } from '../utils/visualization'
import { useDataStore } from '../stores/dataStore'
import { convertWorldToLocalCoordinates, convertDimensionsToLocal } from '../utils/coordinate-conversion'
import { Box3, Vector3, Mesh, RepeatWrapping, MeshStandardMaterial, MirroredRepeatWrapping, Scene } from 'three'

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

// 获取正在更新的货物
const updatingCargo = computed(() => {
  if (!updatingCargoId.value) return null
  return visibleCargos.value.find(cargo => cargo.id === updatingCargoId.value)
})




await dataStore.loadData()
// await new Promise(resolve => setTimeout(resolve, 60_000))
const { scene } = await useGLTF("/model/glb/iso_tank.glb", { draco: true })

const { scene: truckScene } = await useGLTF("/model/glb/truck.glb", { draco: true })
const { scene: craneScene,nodes: craneNodes } = await useGLTF("/model/glb/cranes.glb", { draco: true })
console.log(craneScene,craneNodes);

// 直接从 `nodes` 对象获取起重机的三个主要部分并赋值给 ref
// 因为 `useGLTF` 是 awaited, 所以在这里 `nodes` 已经可用
// 起重机模型引用
const craneMainRef = shallowRef<TresObject3D>(craneNodes.Main)
const trolleyBodyRef = shallowRef<TresObject3D>(craneNodes.Trolley_Body)
const trolleyHookRef = shallowRef<TresObject3D>(craneNodes.Trolley_Hook)

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

// 监听正在更新的货物位置变化，同步起重机位置
watch(updatingCargo, (cargo) => {
  if (cargo && craneScene) {
    // 使用ref引用获取起重机模型的三个部分
    const main = craneMainRef.value
    const trolleyBody = trolleyBodyRef.value
    const trolleyHook = trolleyHookRef.value
    
    if (main && trolleyBody && trolleyHook) {
      // 转换货物坐标到起重机坐标系
      const craneCoords = convertWorldToLocalCoordinates(cargo.position, craneScene)
      
      // 转换货物尺寸到起重机坐标系
      const craneDimensions = convertDimensionsToLocal(cargo.dimensions, craneScene)
      
      // 记录同步前的位置
      const mainBefore = { x: main.position.x, y: main.position.y, z: main.position.z }
      const trolleyBodyBefore = { x: trolleyBody.position.x, y: trolleyBody.position.y, z: trolleyBody.position.z }
      
      // Main: 只同步x坐标（在起重机坐标系中）
      main.position.x = craneCoords.x
      
      // Trolley_Body: 同步x和z坐标（在起重机坐标系中）
      trolleyBody.position.x = craneCoords.x
      trolleyBody.position.z = craneCoords.z
      
      // Trolley_Hook: 完全同步三个坐标（在起重机坐标系中）
      // y坐标需要加上转换后的货物高度，让吊钩悬停在货物上方
      trolleyHook.position.x = craneCoords.x
      trolleyHook.position.y = craneCoords.y + craneDimensions.height
      trolleyHook.position.z = craneCoords.z
      
      console.log('🚁 起重机位置已同步到货物:', cargo.id)
      console.log('📍 货物原始位置:', cargo.position)
      console.log('📍 转换后坐标:', craneCoords)
      console.log('📏 货物原始尺寸:', cargo.dimensions)
      console.log('📏 转换后尺寸:', craneDimensions)
      console.log('🔧 Main: x从', mainBefore.x, '→', main.position.x)
      console.log('🔧 Trolley_Body: x从', trolleyBodyBefore.x, '→', trolleyBody.position.x, ', z从', trolleyBodyBefore.z, '→', trolleyBody.position.z)
      console.log('🔧 Trolley_Hook: 完全同步到', trolleyHook.position)
    } else {
      console.warn('⚠️ 起重机部分未找到，无法同步位置')
      if (!main) console.warn('Main部分未找到')
      if (!trolleyBody) console.warn('Trolley_Body部分未找到')
      if (!trolleyHook) console.warn('Trolley_Hook部分未找到')
    }
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

// 组件挂载后的初始化
onMounted(() => {
  // onMounted 中只保留日志记录和调试代码
  if (craneScene) {
    console.log('🚁 起重机模型加载完成 (onMounted)，场景对象:', craneScene)
    console.log('⚙️ 起重机节点信息 (onMounted):', craneNodes)
    
    // 输出完整的节点结构用于调试
    console.log('🔍 起重机场景完整结构 (onMounted):')
    const printNodeStructure = (node: any, level = 0) => {
      const indent = '  '.repeat(level)
      console.log(`${indent}${node.name || 'unnamed'} (${node.type})`)
      if (node.children && node.children.length > 0) {
        node.children.forEach((child: any) => printNodeStructure(child, level + 1))
      }
    }
    printNodeStructure(craneScene)
  }
})

</script>

<template>
  <primitive :object="truckScene" cast-shadow receive-shadow :position="[18, 0, 38]" :scale="2.5"
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
