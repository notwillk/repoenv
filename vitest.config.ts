import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node', // switch to "jsdom" for browser-y stuff
    include: ['src/**/*.{test,spec}.ts?(x)'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: 'coverage',
      lines: 90,
      functions: 90,
      branches: 85,
      statements: 90,
    },
    globals: true, // enables describe/it/expect without imports
  },
});
