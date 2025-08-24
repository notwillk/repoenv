import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  outExtension: () => ({ js: '.cjs' }),
  platform: 'node',
  target: 'node20',
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  noExternal: ['*'],
  dts: false,
  banner: { js: '#!/usr/bin/env node' },
});
