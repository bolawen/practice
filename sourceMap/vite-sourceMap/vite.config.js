export default {
  mode: "production",
  build: {
    sourcemap: true,
    rollupOptions: {
      input: "./index.js",
      output: {
        dir: "build",
        entryFileNames: "[name]-[hash].js",
      },
    },
  },
};
