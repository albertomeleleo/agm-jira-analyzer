import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node', // Default to node for logic tests
    include: ['tests/**/*.test.ts'],
    alias: {
      '@renderer': resolve(__dirname, 'src/renderer/src'),
      '@design-system': resolve(__dirname, 'src/renderer/src/design-system'),
      '@shared': resolve(__dirname, 'src/shared')
    }
  }
})
