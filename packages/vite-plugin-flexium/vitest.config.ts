import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/__tests__/*.test.ts'],
    exclude: ['**/node_modules/**'],
    globals: true,
    testTimeout: 10000,
  },
});
