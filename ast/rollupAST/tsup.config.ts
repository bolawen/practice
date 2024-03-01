import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    parser: "src/parser.ts",
    tokenizer: "src/tokenizer.ts",
  },
  format: ["esm", "cjs"],
  target: "es2020",
  sourcemap: true,
  splitting: false,
});
