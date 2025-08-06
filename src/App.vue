<script setup lang="ts">
import { TresCanvas } from '@tresjs/core'
import { OrbitControls, Billboard, Box, Edges, Html } from '@tresjs/cientos'
import { ref, onMounted, computed, toRaw } from 'vue'
import { initializeDataSource, RepositoryFactory } from './api'
import type { StorageArea, Cargo } from './types'

// 初始化数据源
initializeDataSource()

// 响应式数据
const storageAreas = ref<StorageArea[]>([])
const cargos = ref<Cargo[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// 获取仓库实例
const areaRepo = RepositoryFactory.getStorageAreaRepository()
const cargoRepo = RepositoryFactory.getCargoRepository()

// 加载数据
const loadData = async () => {
  try {
    loading.value = true
    error.value = null

    console.log('🔄 开始加载数据...')

    // 并行加载区域和货物数据
    const [areasResponse, cargosResponse] = await Promise.all([
      areaRepo.getList({ page: 1, pageSize: 500 }),
      cargoRepo.getList({ page: 1, pageSize: 500 })
    ])

    storageAreas.value = areasResponse.data.data
    cargos.value = cargosResponse.data.data

    console.log('✅ 数据加载成功:', {
      areas: storageAreas.value.length,
      cargos: cargos.value.length
    })

    // 显示一些调试信息
    if (storageAreas.value.length > 0) {
      console.log('📋 区域示例:', toRaw(storageAreas.value))
    }
    if (cargos.value.length > 0) {
      console.log('📦 货物示例:', toRaw(cargos.value))
    }

  } catch (err: any) {
    console.error('❌ 数据加载失败:', err)
    error.value = err.message || '数据加载失败'
  } finally {
    loading.value = false
  }
}

// 计算区域边界框
const getAreaBounds = (area: StorageArea) => {
  if (!area.boundary?.points || area.boundary.points.length === 0) {
    // 如果没有边界点，使用默认值
    return { minX: -10, maxX: 10, minZ: -10, maxZ: 10 }
  }

  const points = area.boundary.points
  const xs = points.map(p => p.x)
  const zs = points.map(p => p.z)

  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minZ: Math.min(...zs),
    maxZ: Math.max(...zs)
  }
}

// 计算区域中心点
const getAreaCenter = (area: StorageArea) => {
  const bounds = getAreaBounds(area)
  return {
    x: (bounds.minX + bounds.maxX) / 2,
    y: 0,
    z: (bounds.minZ + bounds.maxZ) / 2
  }
}

// 计算区域尺寸
const getAreaSize = (area: StorageArea) => {
  const bounds = getAreaBounds(area)
  return {
    width: Math.max(bounds.maxX - bounds.minX, 5), // 最小宽度5
    height: area.boundary?.height || 2,
    depth: Math.max(bounds.maxZ - bounds.minZ, 5)  // 最小深度5
  }
}

// 区域颜色映射
const getAreaColor = (area: StorageArea) => {
  switch (area.type) {
    case 'storage': return '#4CAF50' // 绿色
    case 'transit': return '#2196F3' // 蓝色
    case 'loading': return '#FF9800' // 橙色
    case 'unloading': return '#9C27B0' // 紫色
    case 'maintenance': return '#F44336' // 红色
    case 'buffer': return '#607D8B' // 蓝灰色
    case 'special': return '#E91E63' // 粉色
    default: return '#757575' // 灰色
  }
}

// 货物颜色映射
const getCargoColor = (cargo: Cargo) => {
  switch (cargo.status) {
    case 'stored': return '#4CAF50' // 绿色
    case 'in_transit': return '#2196F3' // 蓝色
    case 'loading': return '#FF9800' // 橙色
    case 'unloading': return '#9C27B0' // 紫色
    case 'maintenance': return '#F44336' // 红色
    case 'damaged': return '#795548' // 棕色
    default: return '#757575' // 灰色
  }
}

// 过滤显示的货物（只显示在区域内的）
const visibleCargos = computed(() => {
  // if (storageAreas.value.length === 0) {
  //   // 如果没有区域，显示所有货物
  //   return cargos.value
  // }

  // return cargos.value.filter(cargo => {
  //   // 检查货物是否在某个区域内
  //   return storageAreas.value.some(area => {
  //     const bounds = getAreaBounds(area)
  //     return cargo.position.x >= bounds.minX && 
  //            cargo.position.x <= bounds.maxX &&
  //            cargo.position.z >= bounds.minZ && 
  //            cargo.position.z <= bounds.maxZ
  //   })
  // })
  return cargos.value
})

// 组件挂载时加载数据
onMounted(() => {
  console.log('🚀 App.vue 组件已挂载，开始加载数据...')
  loadData()
})

// 重新加载数据
const reloadData = () => {
  console.log('🔄 重新加载数据...')
  loadData()
}
</script>

<template>
  <div class="app-container">
    <!-- 控制面板 -->
    <div class="control-panel">
      <h2>堆场可视化系统</h2>
      <div class="stats">
        <div class="stat-item">
          <span class="label">区域数量:</span>
          <span class="value">{{ storageAreas.length }}</span>
        </div>
        <div class="stat-item">
          <span class="label">货物数量:</span>
          <span class="value">{{ visibleCargos.length }}</span>
        </div>
        <div class="stat-item">
          <span class="label">总货物:</span>
          <span class="value">{{ cargos.length }}</span>
        </div>
      </div>
      <button @click="reloadData" :disabled="loading" class="reload-btn">
        {{ loading ? '加载中...' : '重新加载' }}
      </button>
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      <div v-if="loading" class="loading-message">
        正在加载数据...
      </div>
    </div>

    <!-- 3D 场景 -->
    <div class="scene-container">
      <TresCanvas clear-color="#f0f0f0" window-size>
        <TresPerspectiveCamera :position="[50, 30, 50]" :look-at="[0, 0, 0]" />
        <OrbitControls :enable-damping="true" :damping-factor="0.05" />

        <!-- 环境光 -->
        <TresAmbientLight :intensity="0.6" />

        <!-- 方向光 -->
        <TresDirectionalLight :position="[10, 10, 5]" :intensity="0.8" />

        <!-- 地面网格 -->
        <TresGridHelper :args="[100, 20]" :position="[0, -0.1, 0]" />

        <!-- 渲染存储区域 -->
        <template v-for="area in storageAreas" :key="area.id">
          <TresMesh :position="[getAreaCenter(area).x, getAreaSize(area).height / 2, getAreaCenter(area).z]">
            <TresBoxGeometry :args="[getAreaSize(area).width, getAreaSize(area).height, getAreaSize(area).depth]" />
            <TresMeshBasicMaterial :color="getAreaColor(area)" :transparent="true" :opacity="0.05" :wireframe="false" />
          </TresMesh>

          <!-- 区域标签 -->
          <TresMesh :position="[getAreaCenter(area).x, 0, getAreaCenter(area).z]" :rotation="[Math.PI / 2, 0, 0]">
            <TresPlaneGeometry :args="[getAreaSize(area).width, getAreaSize(area).depth]" />
            <TresMeshBasicMaterial :color="getAreaColor(area)" :transparent="true" :opacity="0.8" :side="2" />
          </TresMesh>

          <Billboard v-if="false" :position="[getAreaCenter(area).x, getAreaSize(area).height, getAreaCenter(area).z]">
            <Html center transform :distance-factor="4" :position="[0, 0, 0.65]" :scale="[0.75, 0.75, 0.75]">
            <h1 class="bg-white dark:bg-dark text-xs p-1 rounded">
              {{ area.name }}
            </h1>

            </Html>
          </Billboard>
        </template>

        <!-- 渲染货物 -->
        <template v-for="cargo in visibleCargos" :key="cargo.id">
          <!-- 货物主体 -->
          <!-- <TresMesh :position="[cargo.position.x, cargo.position.y + cargo.dimensions.height / 2, cargo.position.z]">
            <TresBoxGeometry :args="[cargo.dimensions.length, cargo.dimensions.height, cargo.dimensions.width]" />
            <TresMeshBasicMaterial :color="getCargoColor(cargo)" :transparent="true" :opacity="0.95" />
          </TresMesh> -->

          <!-- 货物边框 - 使用 wireframe 材质 -->
          <Box :args="[cargo.dimensions.length, cargo.dimensions.height, cargo.dimensions.width]"
            :position="[cargo.position.x, cargo.position.y + cargo.dimensions.height / 2, cargo.position.z]">
            <TresMeshBasicMaterial :color="getCargoColor(cargo)" />
            <Edges color="#000000" />
          </Box>

          <!-- 货物边框 - 使用 EdgesGeometry (备选方案) -->
          <TresLineSegments
            :position="[cargo.position.x, cargo.position.y + cargo.dimensions.height / 2, cargo.position.z]">
            <TresEdgesGeometry>
              <TresBoxGeometry :args="[cargo.dimensions.length, cargo.dimensions.height, cargo.dimensions.width]" />
            </TresEdgesGeometry>
            <TresLineBasicMaterial :color="0x333333" :linewidth="2" />
          </TresLineSegments>
        </template>

        <!-- 坐标轴辅助 -->
        <TresAxesHelper :args="[100]" />
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

.control-panel {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.9);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 250px;
}

.control-panel h2 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 18px;
}

.stats {
  margin-bottom: 15px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.label {
  font-weight: 500;
  color: #666;
}

.value {
  font-weight: bold;
  color: #333;
}

.reload-btn {
  width: 100%;
  padding: 10px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.reload-btn:hover:not(:disabled) {
  background: #1976D2;
}

.reload-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error-message {
  margin-top: 10px;
  padding: 10px;
  background: #ffebee;
  color: #c62828;
  border-radius: 4px;
  font-size: 14px;
}

.loading-message {
  margin-top: 10px;
  padding: 10px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 4px;
  font-size: 14px;
  text-align: center;
}

.scene-container {
  flex: 1;
  position: relative;
}

.legend {
  position: absolute;
  top: 20px;
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
