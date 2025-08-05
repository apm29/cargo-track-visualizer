import js from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'
import vue from 'eslint-plugin-vue'
import prettier from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,ts}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        global: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      prettier: prettier,
    },
    rules: {
      ...prettier.configs.recommended.rules,
      'prettier/prettier': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vue.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        parser: tsparser,
      },
      globals: {
        defineProps: 'readonly',
        defineEmits: 'readonly',
        defineExpose: 'readonly',
        withDefaults: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      vue: vue,
      prettier: prettier,
    },
    rules: {
      ...prettier.configs.recommended.rules,
      'prettier/prettier': 'error',
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/component-definition-name-casing': ['error', 'PascalCase'],
      'vue/component-options-name-casing': ['error', 'PascalCase'],
      'vue/custom-event-name-casing': ['error', 'camelCase'],
      'vue/define-macros-order': [
        'error',
        {
          order: ['defineProps', 'defineEmits'],
        },
      ],
      'vue/html-comment-content-spacing': ['error', 'always'],
      'vue/no-unused-refs': 'error',
      'vue/padding-line-between-blocks': ['error', 'always'],
      'vue/prefer-separate-static-class': 'error',
    },
  },
  prettierConfig,
]
