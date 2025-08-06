import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { templateCompilerOptions } from '@tresjs/core'
import UnoCSS from 'unocss/vite'
import path from 'node:path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
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

    // https://github.com/antfu/unplugin-auto-import
    // AutoImport({
    //   include: [/\.[jt]sx?$/, /\.vue$/, /\.vue\?vue/, /\.md$/],
    //   imports: [
    //     'vue',
    //     '@vueuse/core',
    //   ],
    //   dts: 'src/auto-imports.d.ts',
    //   dirs: [
    //     'src/composables',
    //     'src/stores',
    //   ],
    //   vueTemplate: true,
    // }),
    Components({
      // allow auto load markdown components under `./src/components/`
      extensions: ['vue', 'md'],
      dirs: [
        'src/components',
      ],
      // allow auto import and register components used in markdown
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      dts: 'src/components.d.ts',
    }),
  ],
})
