import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { templateCompilerOptions } from '@tresjs/core'
import UnoCSS from 'unocss/vite'
import path from 'node:path'

export default defineConfig({
  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, 'src')}/`,
    },
  },
  plugins: [
    vue({
      // Other config
      ...templateCompilerOptions,
    }),
    UnoCSS(),
  ],
})
