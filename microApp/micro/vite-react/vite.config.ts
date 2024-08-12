import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  server: {
    port: 4007,
  },
  plugins: [react()],
});
