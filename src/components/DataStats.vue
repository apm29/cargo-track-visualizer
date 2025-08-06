<template>
  <div class="control-panel">
      <h2>堆场可视化系统</h2>
      <div class="stats">
        <div class="stat-item">
          <span class="label">区域数量:</span>
          <span class="value">{{ areasCount }}</span>
        </div>
        <div class="stat-item">
          <span class="label">货物数量:</span>
          <span class="value">{{ visibleCargos.length }}</span>
        </div>
        <div class="stat-item">
          <span class="label">总货物:</span>
          <span class="value">{{ cargosCount }}</span>
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
</template>

<script setup lang="ts">
import { useDataStore } from '../stores/dataStore'
import { toRefs } from 'vue'
const dataStore = useDataStore()

const { areasCount, cargosCount, visibleCargos, loading, error, reloadData } = toRefs(dataStore)
</script>

<style scoped>
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
</style> 
