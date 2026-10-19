import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: "../../node_modules/.vite/libs/navigation",
  test: {
    name: "@academic-portfolio/navigation",
    watch: false,
    globals: true,
    environment: "node",
    include: ["{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    reporters: ["default"],
    setupFiles: ["./test-setup.ts"],
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
