<template>
  <div class="legend-panel">
    <div class="legend-header">
      <i class="i-carbon-legend text-white text-lg"></i>
      <h3 class="legend-title">图例</h3>
    </div>
    
    <div class="legend-content">
      <!-- 区域类型 -->
      <CollapsibleRoot class="legend-section">
        <CollapsibleTrigger class="legend-trigger">
          <div class="trigger-content">
            <i class="i-carbon-map text-white"></i>
            <span class="trigger-text">区域类型</span>
          </div>
          <i class="i-carbon-chevron-down chevron-icon" />
        </CollapsibleTrigger>
        <CollapsibleContent class="legend-items">
          <div class="legend-item">
            <div class="color-box bg-area-storage"></div>
            <span class="item-text">存储区</span>
          </div>
          <div class="legend-item">
            <div class="color-box bg-area-transit"></div>
            <span class="item-text">转运区</span>
          </div>
          <div class="legend-item">
            <div class="color-box bg-area-loading"></div>
            <span class="item-text">装卸区</span>
          </div>
          <div class="legend-item">
            <div class="color-box bg-area-maintenance"></div>
            <span class="item-text">维护区</span>
          </div>
        </CollapsibleContent>
      </CollapsibleRoot>

      <!-- 货物状态 -->
      <CollapsibleRoot class="legend-section">
        <CollapsibleTrigger class="legend-trigger">
          <div class="trigger-content">
            <i class="i-carbon-package text-white"></i>
            <span class="trigger-text">货物状态</span>
          </div>
          <i class="i-carbon-chevron-down chevron-icon" />
        </CollapsibleTrigger>
        <CollapsibleContent class="legend-items">
          <div class="legend-item">
            <div class="color-box bg-cargo-stored"></div>
            <span class="item-text">已存储</span>
          </div>
          <div class="legend-item">
            <div class="color-box bg-cargo-in-transit"></div>
            <span class="item-text">转运中</span>
          </div>
          <div class="legend-item">
            <div class="color-box bg-cargo-loading"></div>
            <span class="item-text">装卸中</span>
          </div>
          <div class="legend-item">
            <div class="color-box bg-cargo-maintenance"></div>
            <span class="item-text">维护中</span>
          </div>
          <div class="legend-item">
            <div class="color-box bg-cargo-damaged"></div>
            <span class="item-text">损坏</span>
          </div>
        </CollapsibleContent>
      </CollapsibleRoot>

      <!-- 轨迹类型 -->
      <CollapsibleRoot class="legend-section">
        <CollapsibleTrigger class="legend-trigger">
          <div class="trigger-content">
            <i class="i-carbon-router text-white"></i>
            <span class="trigger-text">轨迹类型</span>
          </div>
          <i class="i-carbon-chevron-down chevron-icon" />
        </CollapsibleTrigger>
        <CollapsibleContent class="legend-items">
          <div class="legend-item">
            <div class="color-box bg-area-storage"></div>
            <span class="item-text">货物移动轨迹</span>
          </div>
          <div class="legend-item">
            <div class="color-box bg-area-transit"></div>
            <span class="item-text">机械操作轨迹</span>
          </div>
          <div class="legend-item">
            <div class="color-box bg-area-loading"></div>
            <span class="item-text">转运路径轨迹</span>
          </div>
          <div class="legend-item">
            <div class="color-box bg-area-maintenance"></div>
            <span class="item-text">维护路线轨迹</span>
          </div>
          <div class="legend-item">
            <div class="color-box bg-area-special"></div>
            <span class="item-text">紧急疏散轨迹</span>
          </div>
          <div class="legend-item">
            <div class="color-box bg-area-unloading"></div>
            <span class="item-text">优化路径轨迹</span>
          </div>
        </CollapsibleContent>
      </CollapsibleRoot>

      <!-- 轨迹状态 -->
      <CollapsibleRoot class="legend-section">
        <CollapsibleTrigger class="legend-trigger">
          <div class="trigger-content">
            <i class="i-carbon-status-change text-white"></i>
            <span class="trigger-text">轨迹状态</span>
          </div>
          <i class="i-carbon-chevron-down chevron-icon" />
        </CollapsibleTrigger>
        <CollapsibleContent class="legend-items">
          <div class="legend-item">
            <div class="color-box bg-area-buffer"></div>
            <span class="item-text">已规划</span>
          </div>
          <div class="legend-item">
            <div class="color-box bg-area-loading"></div>
            <span class="item-text">执行中</span>
          </div>
          <div class="legend-item">
            <div class="color-box bg-area-storage"></div>
            <span class="item-text">已完成</span>
          </div>
          <div class="legend-item">
            <div class="color-box bg-area-maintenance"></div>
            <span class="item-text">已取消</span>
          </div>
        </CollapsibleContent>
      </CollapsibleRoot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CollapsibleRoot, CollapsibleContent, CollapsibleTrigger } from 'reka-ui'
</script>

<style scoped>
.legend-panel {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  min-width: 250px;
  backdrop-filter: blur(10px);
}

.legend-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
}

.legend-title {
  margin: 0;
  color: white;
  font-size: 18px;
  font-weight: 500;
}

.legend-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.legend-section {
  width: 100%;
}

.legend-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.legend-trigger:hover {
  background: rgba(255, 255, 255, 0.2);
}

.trigger-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.trigger-text {
  font-size: 14px;
  font-weight: 500;
  color: white;
}

.chevron-icon {
  color: #ccc;
  transition: transform 0.2s ease;
}

.legend-items {
  padding-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 0;
}

.color-box {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
}

.item-text {
  font-size: 13px;
  color: #ccc;
  font-weight: 400;
}

/* Collapsible 动画优化 */
:deep([data-state="open"] .chevron-icon) {
  transform: rotate(180deg);
}

:deep([data-state="closed"] .chevron-icon) {
  transform: rotate(0deg);
}
</style> 
