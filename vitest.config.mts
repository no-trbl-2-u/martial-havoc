// Root Vitest composition: one project per workspace package.
// `npm run test` runs packages/engine, packages/content and the pure
// half of apps/app (its reducer and dice sources) together. The app's
// components are covered by Playwright (`npm run e2e`), not Vitest.
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      'packages/*',
      'apps/*',
      // The docs leg: every concept under docs/ is OKF with a citation
      // (Phase 1b). Lives at the root because it spans the whole tree.
      { test: { name: 'docs', include: ['scripts/docs-check.test.ts'] } },
      // The release leg: the static files the web export is served in
      // (Phase 9). Also at the root, and for the same reason — it reads
      // the filesystem, which the app's Expo tsconfig has no types for.
      { test: { name: 'release', include: ['scripts/release-check.test.ts'] } },
    ],
  },
})
