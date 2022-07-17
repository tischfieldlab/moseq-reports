import { rmSync } from "fs";
import { join } from "path";
import { defineConfig } from "vite";
import electron from "vite-plugin-electron";
import { createVuePlugin } from "vite-plugin-vue2";
import pkg from "./package.json";

rmSync("dist", { recursive: true, force: true }); // v14.14.0

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    createVuePlugin(),
    electron({
      main: {
        entry: "src/electron/main/index.ts",
        vite: {
          build: {
            outDir: "dist/electron/main",
          },
        },
      },
      preload: {
        input: {
          // You can configure multiple preload here
          index: join(__dirname, "src/electron/preload/index.ts"),
        },
        vite: {
          build: {
            // For debug
            sourcemap: "inline",
            outDir: "dist/electron/preload",
          },
        },
      },
      // Enables use of Node.js API in the Renderer-process
      renderer: {},
    }),
  ],
  resolve: {
    alias: [
      { find: "@render", replacement: join(__dirname, "src/renderer") },
      { find: "@main", replacement: join(__dirname, "src/electron") },
      { find: "@shared", replacement: join(__dirname, "src/shared") },
    ],
  },
  server: {
    host: pkg.env.VITE_DEV_SERVER_HOST,
    port: pkg.env.VITE_DEV_SERVER_PORT,
  },
});