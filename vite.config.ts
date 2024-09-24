import fs from 'node:fs';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import electron from 'vite-plugin-electron/simple';
import pkg from './package.json';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  fs.rmSync('dist-electron', { recursive: true, force: true });

  const isServe = command === 'serve';
  const isBuild = command === 'build';
  const sourcemap = isServe || !!process.env.VSCODE_DEBUG;

  return {
    plugins: [
      vue(),
      electron({
        main: {
          entry: 'electron/main/index.ts',
          onstart({ startup }) {
            if (process.env.VSCODE_DEBUG) {
              console.log('[startup] Electron App');
            } else {
              startup();
            }
          },
          vite: {
            build: {
              sourcemap,
              minify: isBuild,
              outDir: 'dist-electron/main',
              rollupOptions: {
                external: Object.keys(pkg.dependencies),
              },
            },
          },
        },
        preload: {
          input: 'electron/preload/index.ts',
          vite: {
            build: {
              sourcemap: sourcemap ? 'inline' : undefined,
              minify: isBuild,
              outDir: 'dist-electron/preload',
              rollupOptions: {
                external: Object.keys(pkg.dependencies),
              },
            },
          },
        },
        renderer: {},
      }),
    ],
    build: {
      sourcemap: isBuild ? 'hidden' : false,
      outDir: 'dist',
    },
    server: process.env.VSCODE_DEBUG && (() => {
      const url = new URL(pkg.debug.env.VITE_DEV_SERVER_URL);
      return {
        host: url.hostname,
        port: +url.port,
      };
    })(),
    clearScreen: false,
    optimizeDeps: {
      exclude: ['plotly.js-dist', 'hclusterjs', 'about-window'],
    },
    resolve: {
      alias: {
        // Add any custom alias here if needed, like '@': '/src'
      },
    },
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        productName: 'moseq-reports',
        appId: 'edu.rutgers.tischfieldlab.moseq-reports',
        fileAssociations: [
          {
            ext: 'msq',
            name: 'Moseq Data File',
            role: 'Editor',
          },
        ],
        mac: {
          hardenedRuntime: true,
          entitlements: 'buildfiles/entitlements.mac.plist',
          entitlementsInherit: 'buildfiles/entitlements.mac.plist',
          gatekeeperAssess: false,
        },
        linux: {
          target: ['deb', 'AppImage'],
          category: 'Development',
          fileAssociations: [
            {
              ext: 'msq',
            },
          ],
        },
        win: {
          target: ['nsis'],
          icon: 'public/img/icons/winapp256x256.ico',
          certificateSubjectName: 'Rutgers, The State University of New Jersey',
        },
        dmg: {
          contents: [
            {
              x: 120,
              y: 220,
            },
            {
              x: 420,
              y: 220,
              type: 'link',
              path: '/Applications',
            },
          ],
          publish: ['github'],
          sign: false,
        },
        publish: {
          provider: 'github',
          owner: 'tischfieldlab',
          repo: 'moseq-reports',
          private: true,
        },
        afterSign: 'buildfiles/notarize.js',
      },
    },
  };
});
