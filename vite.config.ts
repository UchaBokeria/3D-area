import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [],
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./", import.meta.url)),
      "@": fileURLToPath(new URL("./node_modules/", import.meta.url)),
      "@app": fileURLToPath(new URL("./src/app/", import.meta.url)),
      "@shared": fileURLToPath(new URL("./src/shared/", import.meta.url)),
      "@assets": fileURLToPath(new URL("./src/assets/", import.meta.url)),
    },
    extensions: [".js", ".json", ".tsx", ".ts"],
  },
  css: {
    preprocessorOptions: {
      scss: {
        // additionalData: `@import "@assets/styles/linkin.scss";`
      },
    },
  },
});