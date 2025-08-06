<script setup lang="ts">
import { TresEvent, TresInstance, useRaycaster, useTresContext, Intersection } from '@tresjs/core'
import { Billboard, Box, Edges, Outline } from '@tresjs/cientos'
import { shallowRef,unref,toRefs,computed } from 'vue'
import { useDataStore } from '~/stores'
import { getAreaCenter, getAreaSize, getAreaColor, getCargoColor } from '~/utils/visualization'
import TextSpirit from '~/components/TextSpirit.vue'
// await new Promise(resolve => setTimeout(resolve, 1000))
// 使用 Pinia store
const dataStore = useDataStore()

// 从 store 获取数据
const { storageAreas, visibleCargos } = toRefs(dataStore)


const context = useTresContext()
const areaMeshes = shallowRef<TresInstance[]>([])
const activeAreaMesh = shallowRef<TresInstance | null>(null)
const cargoMeshes = shallowRef<TresInstance[]>([])
const activeCargoMesh = shallowRef<TresInstance | null>(null)

const allMeshes = computed(() => {
  return [...areaMeshes.value, ...cargoMeshes.value]
})
const { onClick } = useRaycaster(allMeshes, context)
onClick((event: TresEvent) => {
  console.log('🔍 点击:', event)
  const nearestObject = event.intersections.filter(item => unref(allMeshes).includes(item.object as TresInstance)).reduce((acc, currVal) => {
    if (!acc) return currVal
    return acc.distance < currVal.distance ? acc : currVal
  }, null as (Intersection | null))?.object
  console.log('🔍 点击:', nearestObject)
  if(nearestObject){
    if(areaMeshes.value.includes(nearestObject as TresInstance)){
      activeAreaMesh.value = nearestObject as TresInstance
      activeCargoMesh.value = null
    } else if(cargoMeshes.value.includes(nearestObject as TresInstance)){
      activeAreaMesh.value = null
      activeCargoMesh.value = nearestObject as TresInstance
    } else {
      activeAreaMesh.value = null
      activeCargoMesh.value = null
    }
  } else {
    activeAreaMesh.value = null
    activeCargoMesh.value = null
  }
})
</script>
<template>
  <!-- 渲染存储区域 -->
  <template v-for="area in storageAreas" :key="area.id">
    <!-- 区域标签 -->
    <TresMesh ref="areaMeshes" :userData="area" :position="[getAreaCenter(area).x, 0, getAreaCenter(area).z]"
      :rotation="[Math.PI / 2, 0, 0]">
      <TresPlaneGeometry :args="[getAreaSize(area).width, getAreaSize(area).depth]" />
      <TresMeshBasicMaterial :color="getAreaColor(area)" :transparent="true" :opacity="0.8" :side="2" />
    </TresMesh>

    <Billboard v-if="activeAreaMesh?.userData?.id === area.id"
      :position="[getAreaCenter(area).x, getAreaSize(area).height + 1, getAreaCenter(area).z]">
      <!-- <Text3D :text="area.name" font="/fonts/FiraCodeRegular.json" :size="1" :color="0x000000">
        <TresMeshBasicMaterial :color="getAreaColor(area)" />
      </Text3D> -->
      <TextSpirit :text="area.name" :font-size="128" background-color="#fff" />
    </Billboard>
    <Box v-if="activeAreaMesh?.userData?.id === area.id"
      :args="[getAreaSize(area).width, getAreaSize(area).height, getAreaSize(area).depth]"
      :position="[getAreaCenter(area).x, getAreaSize(area).height / 2, getAreaCenter(area).z]">
      <TresMeshBasicMaterial :color="getAreaColor(area)" :transparent="true" :opacity="0.2" />
      <Edges color="#000000" />
    </Box>
  </template>

  <!-- 渲染货物 -->
  <template v-for="cargo in visibleCargos" :key="cargo.id">
    <!-- 货物主体 -->
    <TresMesh ref="cargoMeshes" :userData="cargo"  :position="[cargo.position.x, cargo.position.y + cargo.dimensions.height / 2, cargo.position.z]">
      <TresBoxGeometry :args="[cargo.dimensions.length, cargo.dimensions.height, cargo.dimensions.width]" />
      <TresMeshBasicMaterial :color="getCargoColor(cargo)" :transparent="true" :opacity="0.95" :side="2"/>
      <Edges color="#000000" />
      <Outline :thickness="0.005" color="#ff3030" v-if="activeCargoMesh?.userData?.id === cargo.id" />
    </TresMesh>

    <Billboard v-if="activeCargoMesh?.userData?.id === cargo.id"
      :position="[cargo.position.x, cargo.position.y + cargo.dimensions.height + 1, cargo.position.z]">
      <TextSpirit :text="`${cargo.name} - ${cargo.status}`" :font-size="128" background-color="#fff" />
    </Billboard>

  </template>
</template>
