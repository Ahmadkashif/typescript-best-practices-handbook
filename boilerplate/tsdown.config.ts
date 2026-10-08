import { defineConfig } from 'tsdown';

/**
 * Production build: bundle our own code (including `#src/*` imports) into one
 * ESM file per entry. npm dependencies stay external and are installed in the
 * runtime image with `npm ci --omit=dev`.
 */
export default defineConfig({
  entry: ['src/main.ts'],
  outDir: 'dist',
  format: 'esm',
  platform: 'node',
  target: 'node24',
  sourcemap: true,
  clean: true,
  dts: false,
  minify: false,
  // package.json has "type": "module", so plain .js is ESM; keep the output name stable.
  fixedExtension: false,
});
