/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.ts'],
    alias: {
      '@renderer': resolve(__dirname, 'src/renderer/src'),
      '@design-system': resolve(__dirname, 'src/renderer/src/design-system'),
      '@shared': resolve(__dirname, 'src/shared')
    },
    setupFiles: './tests/setup.ts'
  }
})