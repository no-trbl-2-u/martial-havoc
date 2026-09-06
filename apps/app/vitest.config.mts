import { defineConfig } from 'vitest/config'

// The app's pure half: the record reducer, the dice sources, the fill
// helper. Components are covered by Playwright (`npm run e2e`).
export default defineConfig({
  test: {
    name: 'app',
    include: ['src/**/*.test.ts'],
  },
})
