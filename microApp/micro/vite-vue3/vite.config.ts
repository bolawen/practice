import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  server: {
    port: 4008,
  },
  plugins: [vue()],
});
