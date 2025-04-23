import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

// Lire la version depuis le package.json à la racine du projet
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootPackage = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf-8'))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(rootPackage.version),
  },
})
