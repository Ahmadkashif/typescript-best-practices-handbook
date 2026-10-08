import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Explicit imports (`import { describe, it, expect } from 'vitest'`), no globals.
    globals: false,
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/main.ts'],
      thresholds: { lines: 80, functions: 80, branches: 75, statements: 80 },
    },
    projects: [
      {
        extends: true,
        test: { name: 'unit', include: ['src/**/*.test.ts'] },
      },
      {
        extends: true,
        test: { name: 'integration', include: ['test/integration/**/*.test.ts'] },
      },
    ],
  },
});
