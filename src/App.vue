<script setup lang="ts">
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { onMounted } from 'vue'
import { initializeDataSource } from './api'
import { useDataStore } from './stores'
import Main from '~/components/Main.vue'
import DataStats from '~/components/DataStats.vue'
// 初始化数据源
initializeDataSource()

// 使用 Pinia store
const dataStore = useDataStore()

// 组件挂载时加载数据
onMounted(() => {
  console.log('🚀 App.vue 组件已挂载，开始加载数据...')
  dataStore.loadData()
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
      <TresCanvas clear-color="#f0f0f0" window-size>
        <TresPerspectiveCamera :position="[50, 30, 50]" :look-at="[0, 0, 0]" />
        <OrbitControls :enable-damping="true" :damping-factor="0.05" />

        <!-- 环境光 -->
        <TresAmbientLight :intensity="0.6" />
        <TresPointLight :intensity="50" :position="[2, 2, 0]" />
        <!-- 方向光 -->
        <TresDirectionalLight :position="[10, 10, 5]" :intensity="0.8" />

        <!-- 地面网格 -->
        <TresGridHelper :args="[100, 20]" :position="[0, -0.1, 0]" />

        <Suspense>
          <Main />
        </Suspense>

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
