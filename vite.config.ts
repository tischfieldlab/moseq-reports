import fs from 'node:fs'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron/simple'
import pkg from './package.json'
import { join } from "path";
import Components from 'unplugin-vue-components/vite'
import {BootstrapVueNextResolver} from 'bootstrap-vue-next'
import vueDevTools from 'vite-plugin-vue-devtools'
import electronRenderer from "vite-plugin-electron-renderer";
// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  fs.rmSync('dist-electron', { recursive: true, force: true })
  
  const isServe = command === 'serve'
  const isBuild = command === 'build'
  const sourcemap = isServe || !!process.env.VSCODE_DEBUG
  return {
    plugins: [
      vue({
        template: {
          compilerOptions: {
            //isCustomElement: (tag) => tag.startsWith("b"),
            compatConfig: {
              MODE: 3
            }
          }
        }
      }),
      Components({
        resolvers: [BootstrapVueNextResolver()],
      }),
      electron({
        main: {
          // Shortcut of `build.lib.entry`
          entry: 'src/electron/main/index.ts',
          onstart({ startup }) {
            if (process.env.VSCODE_DEBUG) {
              console.log(/* For `.vscode/.debug.script.mjs` */'[startup] Electron App')
            } else {
              startup()
            }
          },
          vite: {
            build: {
              sourcemap,
              minify: isBuild,
              outDir: 'dist/electron/main',
              rollupOptions: {
                // Some third-party Node.js libraries may not be built correctly by Vite, especially `C/C++` addons, 
                // we can use `external` to exclude them to ensure they work correctly.
                // Others need to put them in `dependencies` to ensure they are collected into `app.asar` after the app is built.
                // Of course, this is not absolute, just this way is relatively simple. :)
                external: [
                  ...Object.keys(pkg.dependencies || {}),
                  //"@render/util" // Add any specific paths you want to externalize.
                ],                
              },
            },
          },
        },
        preload: {
          // Shortcut of `build.rollupOptions.input`.
          // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
          input: 'src/electron/preload/index.ts',
          onstart(options) {
            // Notify the Renderer-Process to reload the page when the Preload-Scripts build is complete, 
            // instead of restarting the entire Electron App.
            options.reload()
          },
          vite: {
            build: {
              sourcemap: sourcemap ? 'inline' : undefined, // #332
              minify: isBuild,
              outDir: 'dist/electron/preload',
              rollupOptions: {
                external: Object.keys('dependencies' in pkg ? pkg.dependencies : {}),
              },
            },
          },
        },
        // Ployfill the Electron and Node.js API for Renderer process.
        // If you want use Node.js in Renderer process, the `nodeIntegration` needs to be enabled in the Main process.
        // See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
        renderer: {},
      }),
    ],
    resolve: {
      alias: [
        { find: "@render", replacement: join(__dirname, "src/renderer") },
        { find: "@main", replacement: join(__dirname, "src/electron") },
        { find: "@dataserver", replacement: join(__dirname, "src/dataserver") },
        //{ find: "vue", replacement: "@vue/compat" },
        //{ find: "vue$", replacement: "vue/dist/vue.runtime.esm.js" },
        //{ find: "vue3", replacement: "vue" },
      ],
    },
    server: process.env.VSCODE_DEBUG && (() => {
      const url = new URL(pkg.debug.env.VITE_DEV_SERVER_URL)
      return {
        host: url.hostname,
        port: +url.port,
      }
    }
  )(),
    clearScreen: false,
  }
})
