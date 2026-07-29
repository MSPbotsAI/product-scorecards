import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'service/server.ts',
    'service/schema.ts',
    'service/schemas/*.ts',
  ],
  format: ['esm'],
  platform: 'node',
  target: 'node22',
  bundle: true,
  splitting: false,
  treeshake: true,
  minify: false,
  sourcemap: false,
  clean: false,
  noExternal: [/.*/],
  external: ['bufferutil', 'utf-8-validate'],
  banner: {
    js: "import { createRequire } from 'node:module';\nconst require = createRequire(import.meta.url);",
  },
})
