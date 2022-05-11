import { defineConfig } from "vite";
import { createVuePlugin } from "vite-plugin-vue2";
import electron from "vite-plugin-electron/renderer";
import pkg from "../../package.json";

// https://vitejs.dev/config/
export default defineConfig({
    mode: process.env.NODE_ENV,
    root: __dirname,
    plugins: [createVuePlugin(), electron()],
    base: "./",
    publicDir: "./public",
    build: {
        outDir: "../../dist/renderer",
        emptyOutDir: true,
        sourcemap: true,
    },
    server: {
        host: pkg.env.VITE_DEV_SERVER_HOST,
        port: pkg.env.VITE_DEV_SERVER_PORT,
    },
});
