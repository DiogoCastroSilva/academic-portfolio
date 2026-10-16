import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/libs/content',
  test: {
    name: '@katie-portfolio/content',
    watch: false,
    globals: true,
    environment: 'node',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8' as const,
    },
  },
  resolve: {
    alias: {
      // server-only is a build-time marker that throws at import time.
      // In the Node.js test environment it is a no-op.
      'server-only': fileURLToPath(
        new URL('./test/server-only-shim.ts', import.meta.url),
      ),
    },
  },
}));
