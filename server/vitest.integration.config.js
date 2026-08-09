import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/integration/**/*.test.js'],
    fileParallelism: false,
    setupFiles: ['./tests/integration/setup.js'],
  },
});
