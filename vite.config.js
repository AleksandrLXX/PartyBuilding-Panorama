import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { link } from './src/config/config.js'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  base: link,
  resolve: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, 'src'),
      },
    ],
  },
})
