import { defineConfig, presetUno, presetAttributify, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
  ],
  shortcuts: [
    // 常用布局
    ['flex-center', 'flex items-center justify-center'],
    ['flex-between', 'flex items-center justify-between'],
    ['flex-col-center', 'flex flex-col items-center justify-center'],
    
    // 常用间距
    ['p-safe', 'p-4 sm:p-6 lg:p-8'],
    ['m-safe', 'm-4 sm:m-6 lg:m-8'],
    
    // 常用卡片样式
    ['card', 'bg-white dark:bg-gray-800 rounded-lg shadow-md p-4'],
    ['card-hover', 'card hover:shadow-lg transition-shadow duration-200'],
    
    // 常用按钮样式
    ['btn', 'px-4 py-2 rounded-md font-medium transition-colors duration-200'],
    ['btn-primary', 'btn bg-blue-500 hover:bg-blue-600 text-white'],
    ['btn-secondary', 'btn bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200'],
    ['btn-danger', 'btn bg-red-500 hover:bg-red-600 text-white'],
    
    // 常用文本样式
    ['text-title', 'text-xl font-bold text-gray-900 dark:text-white'],
    ['text-subtitle', 'text-lg font-semibold text-gray-700 dark:text-gray-300'],
    ['text-body', 'text-base text-gray-600 dark:text-gray-400'],
    ['text-caption', 'text-sm text-gray-500 dark:text-gray-500'],
    
    // 常用状态样式
    ['status-success', 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'],
    ['status-error', 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'],
    ['status-warning', 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'],
    ['status-info', 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'],
  ],
  theme: {
    colors: {
      primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
      },
      // 堆场可视化专用颜色
      cargo: {
        stored: '#4CAF50',
        in_transit: '#2196F3',
        loading: '#FF9800',
        unloading: '#9C27B0',
        maintenance: '#F44336',
        damaged: '#795548',
      },
      area: {
        storage: '#4CAF50',
        transit: '#2196F3',
        loading: '#FF9800',
        unloading: '#9C27B0',
        maintenance: '#F44336',
        buffer: '#607D8B',
        special: '#E91E63',
      },
    },
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
  },
  rules: [
    // 自定义规则
    [/^text-cargo-(.+)$/, ([, status]) => {
      const colors: Record<string, string> = {
        stored: '#4CAF50',
        'in-transit': '#2196F3',
        loading: '#FF9800',
        unloading: '#9C27B0',
        maintenance: '#F44336',
        damaged: '#795548',
      }
      return { color: colors[status] || '#757575' }
    }],
    [/^bg-cargo-(.+)$/, ([, status]) => {
      const colors: Record<string, string> = {
        stored: '#4CAF50',
        'in-transit': '#2196F3',
        loading: '#FF9800',
        unloading: '#9C27B0',
        maintenance: '#F44336',
        damaged: '#795548',
      }
      return { 'background-color': colors[status] || '#757575' }
    }],
    [/^text-area-(.+)$/, ([, type]) => {
      const colors: Record<string, string> = {
        storage: '#4CAF50',
        transit: '#2196F3',
        loading: '#FF9800',
        unloading: '#9C27B0',
        maintenance: '#F44336',
        buffer: '#607D8B',
        special: '#E91E63',
      }
      return { color: colors[type] || '#757575' }
    }],
    [/^bg-area-(.+)$/, ([, type]) => {
      const colors: Record<string, string> = {
        storage: '#4CAF50',
        transit: '#2196F3',
        loading: '#FF9800',
        unloading: '#9C27B0',
        maintenance: '#F44336',
        buffer: '#607D8B',
        special: '#E91E63',
      }
      return { 'background-color': colors[type] || '#757575' }
    }],
  ],
  safelist: [
    // 确保这些类名在生产环境中不会被清除
    'text-cargo-stored',
    'text-cargo-in-transit',
    'text-cargo-loading',
    'text-cargo-unloading',
    'text-cargo-maintenance',
    'text-cargo-damaged',
    'bg-cargo-stored',
    'bg-cargo-in-transit',
    'bg-cargo-loading',
    'bg-cargo-unloading',
    'bg-cargo-maintenance',
    'bg-cargo-damaged',
    'text-area-storage',
    'text-area-transit',
    'text-area-loading',
    'text-area-unloading',
    'text-area-maintenance',
    'text-area-buffer',
    'text-area-special',
    'bg-area-storage',
    'bg-area-transit',
    'bg-area-loading',
    'bg-area-unloading',
    'bg-area-maintenance',
    'bg-area-buffer',
    'bg-area-special',
  ],
}) 
