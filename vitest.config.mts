// Root Vitest composition: one project per workspace package.
// `npm run test` runs packages/engine and packages/content together.
// apps/app is covered by Playwright (`npm run e2e`), not Vitest.
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: ['packages/*'],
  },
})
