// Hermetic e2e against the Expo web export (`npm run e2e`).
// Serves apps/app/dist on its own port with the repo's static server
// so the gate never touches a dev server. build:web must run first;
// `npm run verify` orders that.
import { existsSync } from 'node:fs'
import { defineConfig } from '@playwright/test'

const port = 4173

// Which Chromium to drive. Playwright normally downloads its own
// (`npx playwright install chromium`) and finds it through
// PLAYWRIGHT_BROWSERS_PATH; @playwright/test is pinned to the release
// whose Chromium build the cloud runner pre-installs. A runner whose
// build does not match can name a binary with PW_CHROMIUM_PATH instead.
const named = process.env['PW_CHROMIUM_PATH']
const executablePath = named && existsSync(named) ? named : undefined

export default defineConfig({
  testDir: 'e2e',
  // The screenshot playthrough has its own config (playwright.screenshots.config.ts);
  // it is not a gate leg.
  testIgnore: ['**/screenshots/**'],
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: 'retain-on-failure',
    // A phone-width viewport: the spec's target is a phone.
    viewport: { width: 390, height: 844 },
    // No page turn: the leaf (apps/app/src/components/Leaf.tsx) honours
    // prefers-reduced-motion, so every screen change is instant and
    // deterministic here. e2e/turn.spec.ts opts back in to prove the turn.
    // Through `contextOptions`: the 1.56 runner has no `reducedMotion`
    // fixture of its own and drops a top-level one on the floor.
    contextOptions: { reducedMotion: 'reduce' },
  },
  webServer: {
    command: `node scripts/serve-static.mjs apps/app/dist ${port}`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: false,
    timeout: 30_000,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        ...(executablePath ? { launchOptions: { executablePath } } : {}),
      },
    },
  ],
})
