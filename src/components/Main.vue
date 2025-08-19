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

// 获取正在更新的货物
const updatingCargo = computed(() => {
  if (!updatingCargoId.value) return null
  return visibleCargos.value.find(cargo => cargo.id === updatingCargoId.value)
})

// 起重机模型引用
const craneMainRef = shallowRef<any>(null)
const trolleyBodyRef = shallowRef<any>(null)
const trolleyHookRef = shallowRef<any>(null)
const craneSceneRef = shallowRef<any>(null)

// 坐标转换配置
const useAdvancedCoordinateConversion = shallowRef<boolean>(true)

// 坐标转换函数：将货物坐标转换为起重机场景坐标系
const convertToCraneCoordinates = (cargoPosition: any) => {
  // 获取起重机场景的当前变换矩阵
  const craneMatrix = craneScene.matrixWorld
  
  // 创建货物位置向量
  const cargoVector = new Vector3(cargoPosition.x, cargoPosition.y, cargoPosition.z)
  
  // 应用起重机的逆变换，将世界坐标转换为起重机局部坐标
  const craneInverseMatrix = craneMatrix.clone().invert()
  const localPosition = cargoVector.clone().applyMatrix4(craneInverseMatrix)
  
  // 考虑起重机的缩放
  const scale = craneScene.scale
  localPosition.x /= scale.x
  localPosition.y /= scale.y
  localPosition.z /= scale.z
  
  console.log('🔄 坐标转换:', {
    原始坐标: cargoPosition,
    起重机缩放: scale,
    转换后坐标: localPosition
  })
  
  return localPosition
}

// 高级坐标转换函数：考虑起重机的完整变换
const convertToCraneCoordinatesAdvanced = (cargoPosition: any) => {
  // 获取起重机的世界位置和旋转
  const craneWorldPosition = craneScene.position
  const craneWorldRotation = craneScene.rotation
  const craneWorldScale = craneScene.scale
  
  // 创建货物位置向量
  const cargoVector = new Vector3(cargoPosition.x, cargoPosition.y, cargoPosition.z)
  
  // 计算相对于起重机的位置
  const relativePosition = cargoVector.clone().sub(craneWorldPosition)
  
  // 应用起重机的逆旋转
  const inverseRotation = new Euler(
    -craneWorldRotation.x,
    -craneWorldRotation.y,
    -craneWorldRotation.z,
    craneWorldRotation.order
  )
  const rotatedPosition = relativePosition.clone().applyEuler(inverseRotation)
  
  // 应用起重机的逆缩放
  rotatedPosition.x /= craneWorldScale.x
  rotatedPosition.y /= craneWorldScale.y
  rotatedPosition.z /= craneWorldScale.z
  
  console.log('🔄 高级坐标转换:', {
    原始坐标: cargoPosition,
    起重机世界位置: craneWorldPosition,
    起重机世界旋转: craneWorldRotation,
    起重机世界缩放: craneWorldScale,
    相对位置: relativePosition,
    转换后坐标: rotatedPosition
  })
  
  return rotatedPosition
}

// 货物尺寸转换为龙门吊坐标系尺寸
const convertCargoDimensionsToCraneCoordinates = (cargoDimensions: any) => {
  // 获取起重机的世界旋转和缩放
  const craneWorldRotation = craneScene.rotation
  const craneWorldScale = craneScene.scale
  
  // 创建尺寸向量
  const dimensionVector = new Vector3(cargoDimensions.length, cargoDimensions.height, cargoDimensions.width)
  
  // 应用起重机的逆旋转来转换尺寸方向
  const inverseRotation = new Euler(
    -craneWorldRotation.x,
    -craneWorldRotation.y,
    -craneWorldRotation.z,
    craneWorldRotation.order
  )
  const rotatedDimensions = dimensionVector.clone().applyEuler(inverseRotation)
  
  // 应用起重机的逆缩放（取绝对值，因为尺寸应该是正数）
  const scaledDimensions = {
    length: Math.abs(rotatedDimensions.x / craneWorldScale.x),
    height: Math.abs(rotatedDimensions.y / craneWorldScale.y),
    width: Math.abs(rotatedDimensions.z / craneWorldScale.z)
  }
  
  console.log('📏 货物尺寸转换:', {
    原始尺寸: cargoDimensions,
    起重机世界旋转: craneWorldRotation,
    起重机世界缩放: craneWorldScale,
    旋转后尺寸: rotatedDimensions,
    转换后尺寸: scaledDimensions
  })
  
  return scaledDimensions
}

// 基础尺寸转换函数：仅考虑缩放
const convertCargoDimensionsBasic = (cargoDimensions: any) => {
  // 获取起重机的缩放
  const craneWorldScale = craneScene.scale
  
  // 直接应用逆缩放
  const scaledDimensions = {
    length: cargoDimensions.length / craneWorldScale.x,
    height: cargoDimensions.height / craneWorldScale.y,
    width: cargoDimensions.width / craneWorldScale.z
  }
  
  console.log('📏 基础尺寸转换:', {
    原始尺寸: cargoDimensions,
    起重机缩放: craneWorldScale,
    转换后尺寸: scaledDimensions
  })
  
  return scaledDimensions
}

await dataStore.loadData()
// await new Promise(resolve => setTimeout(resolve, 60_000))
import { useGLTF } from '@tresjs/cientos'
import { Box3, Vector3, Mesh, RepeatWrapping, MeshStandardMaterial, MirroredRepeatWrapping, Euler } from 'three'
const { scene } = await useGLTF("/model/glb/iso_tank.glb", { draco: true })

const { scene: truckScene } = await useGLTF("/model/glb/truck.glb", { draco: true })
const { scene: craneScene,nodes } = await useGLTF("/model/glb/cranes.glb", { draco: true })
console.log(craneScene,nodes);

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

// 监听正在更新的货物位置变化，同步起重机位置
watch(updatingCargo, (cargo) => {
  if (cargo && craneScene) {
    // 使用ref引用获取起重机模型的三个部分
    const main = craneMainRef.value
    const trolleyBody = trolleyBodyRef.value
    const trolleyHook = trolleyHookRef.value
    
    if (main && trolleyBody && trolleyHook) {
      // 根据配置选择坐标转换方法
      const craneCoords = useAdvancedCoordinateConversion.value 
        ? convertToCraneCoordinatesAdvanced(cargo.position)
        : convertToCraneCoordinates(cargo.position)
      
      // 转换货物尺寸到起重机坐标系
      const craneDimensions = useAdvancedCoordinateConversion.value
        ? convertCargoDimensionsToCraneCoordinates(cargo.dimensions)
        : convertCargoDimensionsBasic(cargo.dimensions)
      
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
  // 确保起重机模型正确加载
  if (craneScene) {
    // 遍历起重机场景，找到三个主要部分并设置引用
    craneScene.traverse((child) => {
      if (child.name === 'Main') {
        craneMainRef.value = child
        console.log('✅ 找到起重机Main部分:', child)
      } else if (child.name === 'Trolley_Body') {
        trolleyBodyRef.value = child
        console.log('✅ 找到起重机Trolley_Body部分:', child)
      } else if (child.name === 'Trolley_Hook') {
        trolleyHookRef.value = child
        console.log('✅ 找到起重机Trolley_Hook部分:', child)
      }
    })
    
    console.log('🚁 起重机模型加载完成，场景对象:', craneScene)
    console.log('�� 起重机节点信息:', nodes)
    
    // 输出完整的节点结构用于调试
    console.log('🔍 起重机场景完整结构:')
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
  <primitive :object="craneScene" ref="craneSceneRef" cast-shadow receive-shadow :position="[0, 0, 0]" :scale="2.75" :rotation="[0, 0, 0]">
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
