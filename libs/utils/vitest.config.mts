import { defineConfig } from "vitest/config";

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: "../../node_modules/.vite/libs/utils",
  test: {
    name: "@katie-portfolio/utils",
    watch: false,
    globals: true,
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
    reporters: ["default"],
    coverage: {
      reportsDirectory: "./test-output/vitest/coverage",
      provider: "v8" as const,
    },
  },
}));
