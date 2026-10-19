import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: "../../node_modules/.vite/apps/main",
  esbuild: {
    jsx: "automatic",
  },
  test: {
    name: "@academic-portfolio/main",
    watch: false,
    globals: true,
    environment: "node",
    include: [
      "src/**/*.test.{ts,tsx}",
      "src/**/*.spec.{ts,tsx}",
      "tools/**/*.test.{ts,tsx}",
    ],
    setupFiles: ["./test-setup.ts"],
    reporters: ["default"],
    coverage: {
      reportsDirectory: "./test-output/vitest/coverage",
      provider: "v8" as const,
    },
  },
  resolve: {
    alias: {
      "server-only": fileURLToPath(
        new URL("../../libs/content/test/server-only-shim.ts", import.meta.url),
      ),
    },
  },
}));
