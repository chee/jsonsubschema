import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  target: 'es2020',
  platform: 'neutral', // Works in both Node and browser
  treeshake: true,
  minify: false, // Keep readable for debugging initially
})
