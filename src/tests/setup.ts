import { config } from '@vue/test-utils'
import { vi } from 'vitest'

// 全局测试配置
config.global.stubs = {
  // 禁用 TresJS 组件的渲染，避免 Three.js 相关问题
  TresCanvas: true,
  TresPerspectiveCamera: true,
  TresMesh: true,
  TresTorusGeometry: true,
  TresMeshBasicMaterial: true,
  TresAmbientLight: true,
  OrbitControls: true,
}

// Mock Three.js
vi.mock('three', () => ({
  Scene: vi.fn(),
  PerspectiveCamera: vi.fn(),
  WebGLRenderer: vi.fn(),
  BoxGeometry: vi.fn(),
  MeshBasicMaterial: vi.fn(),
  Mesh: vi.fn(),
  AmbientLight: vi.fn(),
  DirectionalLight: vi.fn(),
  Vector3: vi.fn(),
  Euler: vi.fn(),
  Quaternion: vi.fn(),
  Matrix4: vi.fn(),
}))

// Mock TresJS
vi.mock('@tresjs/core', () => ({
  TresCanvas: {
    name: 'TresCanvas',
    template: '<div data-testid="tres-canvas"><slot /></div>',
  },
  useTres: vi.fn(() => ({
    scene: {},
    camera: {},
    renderer: {},
  })),
}))

// 设置全局测试环境
ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
