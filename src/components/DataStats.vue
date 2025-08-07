<template>
  <div class="control-panel">

    <!-- 实时连接状态指示器 -->
    <div class="connection-status" :class="{ connected: isConnected, error: connectionError }">
      <div class="status-indicator">
        <div class="status-dot" :class="{ active: isConnected }"></div>
        <span class="status-text">
          {{ isConnected ? '实时连接中' : connectionError ? '连接错误' : '未连接' }}
        </span>
      </div>
      <div v-if="systemStatus && systemStatus.systemHealth" class="system-info">
        <div>CPU: {{ Math.round(systemStatus.systemHealth.cpu || 0) }}%</div>
        <div>内存: {{ Math.round(systemStatus.systemHealth.memory || 0) }}%</div>
        <div>任务: {{ systemStatus.activeTasks || 0 }}</div>
      </div>
    </div>
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
      <div class="stat-item">
        <span class="label">轨迹数量:</span>
        <span class="value">{{ trajectoriesCount }}</span>
      </div>
      <div class="stat-item">
        <span class="label">执行中轨迹:</span>
        <span class="value">{{ inProgressTrajectories }}</span>
      </div>
      <div class="stat-item">
        <span class="label">已完成轨迹:</span>
        <span class="value">{{ completedTrajectories }}</span>
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
import { toRefs, computed } from 'vue'
import { TrajectoryStatus } from '../types/trajectory'

const dataStore = useDataStore()

const { areasCount, cargosCount, trajectoriesCount, visibleCargos, trajectories, loading, error, reloadData } = toRefs(dataStore)
const {
  isConnected,
  connectionError,
  systemStatus
} = toRefs(dataStore)
// 计算执行中的轨迹数量
const inProgressTrajectories = computed(() => {
  return trajectories.value.filter(t => t.status === TrajectoryStatus.IN_PROGRESS).length
})

// 计算已完成的轨迹数量
const completedTrajectories = computed(() => {
  return trajectories.value.filter(t => t.status === TrajectoryStatus.COMPLETED).length
})
</script>

<style scoped>
.control-panel {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  min-width: 250px;
}

.control-panel h2 {
  margin: 0 0 15px 0;
  color: white;
  font-size: 18px;
  font-weight: 500;
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
  color: #ccc;
}

.value {
  font-weight: bold;
  color: white;
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
  background: #555;
  color: #999;
  cursor: not-allowed;
}

.error-message {
  margin-top: 10px;
  padding: 10px;
  background: rgba(244, 67, 54, 0.2);
  color: #ffcdd2;
  border-radius: 4px;
  font-size: 14px;
  border-left: 3px solid #f44336;
}

.loading-message {
  margin-top: 10px;
  padding: 10px;
  background: rgba(33, 150, 243, 0.2);
  color: #bbdefb;
  border-radius: 4px;
  font-size: 14px;
  text-align: center;
  border-left: 3px solid #2196F3;
}

.connection-status {
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 1000;
  min-width: 200px;
  margin-bottom: 15px;
}


.status-indicator {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #666;
  margin-right: 8px;
  transition: background-color 0.3s ease;
}

.status-dot.active {
  background: #4caf50;
  animation: pulse 2s infinite;
}

.status-text {
  font-weight: 500;
}

.system-info {
  font-size: 12px;
  opacity: 0.8;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }

  100% {
    opacity: 1;
  }
}
</style>
