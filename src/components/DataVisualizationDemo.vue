<template>
  <div class="demo-container">
    <div class="demo-header">
      <h1>堆场数据可视化演示</h1>
      <p>展示通过数据持久化层获取的 StorageArea 和 Cargo 信息的 3D 可视化</p>
    </div>
    
    <div class="demo-content">
      <div class="info-panel">
        <h3>功能说明</h3>
        <ul>
          <li><strong>StorageArea</strong>: 使用矩形框表示在堆场地面上，不同颜色代表不同区域类型</li>
          <li><strong>Cargo</strong>: 使用半透明的长方体表示，rpy都为0，size都一致</li>
          <li><strong>交互</strong>: 可以使用鼠标旋转、缩放和平移视角</li>
          <li><strong>数据源</strong>: 支持 Mock 数据和真实 API 数据的无缝切换</li>
        </ul>
        
        <h3>数据统计</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">{{ storageAreas.length }}</div>
            <div class="stat-label">存储区域</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ cargos.length }}</div>
            <div class="stat-label">货物总数</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ visibleCargos.length }}</div>
            <div class="stat-label">可见货物</div>
          </div>
        </div>
        
        <div class="controls">
          <button @click="reloadData" :disabled="loading" class="control-btn">
            {{ loading ? '加载中...' : '重新加载数据' }}
          </button>
          <button @click="toggleDataSource" class="control-btn secondary">
            切换到 {{ isMockMode ? 'API' : 'Mock' }} 模式
          </button>
        </div>
        
        <div v-if="error" class="error-message">
          <strong>错误:</strong> {{ error }}
        </div>
      </div>
      
      <div class="visualization-container">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { dataSourceManager, DataSourceType } from '../api'
import type { StorageArea, Cargo } from '../types'

// Props
interface Props {
  storageAreas: StorageArea[]
  cargos: Cargo[]
  visibleCargos: Cargo[]
  loading: boolean
  error: string | null
}

defineProps<Props>()

// Emits
const emit = defineEmits<{
  reload: []
}>()

// 计算属性
const isMockMode = computed(() => dataSourceManager.isMockMode())

// 方法
const reloadData = () => {
  emit('reload')
}

const toggleDataSource = () => {
  const newMode = isMockMode.value ? DataSourceType.API : DataSourceType.MOCK
  dataSourceManager.setDataSourceType(newMode)
  console.log(`🔄 已切换到 ${newMode} 模式`)
  reloadData()
}
</script>

<style scoped>
.demo-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.demo-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  text-align: center;
}

.demo-header h1 {
  margin: 0 0 10px 0;
  font-size: 28px;
  font-weight: 600;
}

.demo-header p {
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
}

.demo-content {
  flex: 1;
  display: flex;
  position: relative;
}

.info-panel {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.95);
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-width: 350px;
  backdrop-filter: blur(10px);
}

.info-panel h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.info-panel ul {
  margin: 0 0 20px 0;
  padding-left: 20px;
}

.info-panel li {
  margin-bottom: 8px;
  color: #555;
  line-height: 1.5;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #2196F3;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
}

.control-btn {
  padding: 12px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #2196F3;
  color: white;
}

.control-btn:hover:not(:disabled) {
  background: #1976D2;
  transform: translateY(-1px);
}

.control-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.control-btn.secondary {
  background: #6c757d;
}

.control-btn.secondary:hover:not(:disabled) {
  background: #5a6268;
}

.error-message {
  padding: 12px;
  background: #ffebee;
  color: #c62828;
  border-radius: 6px;
  font-size: 14px;
  border-left: 4px solid #f44336;
}

.visualization-container {
  flex: 1;
  position: relative;
}

@media (max-width: 768px) {
  .info-panel {
    position: relative;
    max-width: none;
    margin: 20px;
    order: 2;
  }
  
  .demo-content {
    flex-direction: column;
  }
  
  .visualization-container {
    order: 1;
    height: 60vh;
  }
}
</style> 
