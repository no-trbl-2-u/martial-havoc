// The playthrough: drives the web export through every screen and state
// on named dice and writes one PNG per stop to design/screenshots/.
// Not a verify leg: fonts differ between machines, so a pixel diff would
// be a flaky gate. `npm run screenshots` after `npm run build:web`.
import { existsSync } from 'node:fs'
import { defineConfig } from '@playwright/test'

const port = 4174
const named = process.env['PW_CHROMIUM_PATH']
const executablePath = named && existsSync(named) ? named : undefined

export default defineConfig({
  testDir: 'e2e/screenshots',
  fullyParallel: false,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    viewport: { width: 390, height: 844 },
    // No page turn: the leaf (apps/app/src/components/Leaf.tsx) honours
    // prefers-reduced-motion, so every screen change is instant and
    // deterministic here. e2e/turn.spec.ts opts back in to prove the turn.
    // Through `contextOptions`: the 1.56 runner has no `reducedMotion`
    // fixture of its own and drops a top-level one on the floor.
    contextOptions: { reducedMotion: 'reduce' },
    deviceScaleFactor: 2,
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
      use: { browserName: 'chromium', ...(executablePath ? { launchOptions: { executablePath } } : {}) },
    },
  ],
})
