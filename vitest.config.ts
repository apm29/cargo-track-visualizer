import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { templateCompilerOptions } from '@tresjs/core'

export default defineConfig({
  plugins: [
    vue({
      ...templateCompilerOptions,
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/tests/', '**/*.d.ts', '**/*.config.*', 'dist/'],
    },
  },
})
