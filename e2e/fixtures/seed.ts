/**
 * Put a built record into the browser before the app loads.
 *
 * The top layer of `e2e/fixtures`. The web export reads its record from
 * `localStorage` on start (`apps/app/src/state/persist.ts`, `load`):
 * the session snapshot under `SESSION_KEY` carries the screen and every
 * transient, the campaign envelope under `CAMPAIGN_KEY` the durable
 * half. {@link seed} writes both, in the same bytes `save` would have
 * written, through Playwright's `addInitScript`, which runs before any
 * page script on every navigation. The app then opens exactly as if the
 * player had closed it at that moment and come back.
 *
 * Nothing in the app knows a test is running: no query flag, no window
 * hook, no build-time switch. The seeded storage is indistinguishable
 * from a player's, so the seeded path *is* the restore path, and a spec
 * on it also proves that `load` accepts what `save` wrote.
 *
 * One tap remains. Every launch opens on the title page and START is
 * component state, never the record's (`apps/app/src/App.tsx`), so
 * {@link open} taps it; START turns the leaf to the seeded screen.
 */
import { expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { CAMPAIGN_KEY, SESSION_KEY, exportText } from '../../apps/app/src/state/persist'
import type { RecordState } from '../../apps/app/src/state/types'
import { fold } from './record'
import type { Scene } from './record'

/**
 * A fixed export timestamp, so a seeded campaign envelope is the same
 * bytes on every run. The app writes `new Date()`; a test wants
 * determinism.
 */
export const SEEDED_AT = '2026-09-07T00:00:00.000Z'

/**
 * Write `state` into the page's storage before it loads.
 *
 * Call before `page.goto`. Both keys are written: the session so the
 * screen and the slip come back, the campaign so the durable half goes
 * through the engine's import and its migrations, as a real restore
 * does.
 */
export const seed = async (page: Page, state: RecordState): Promise<void> => {
  const entries: ReadonlyArray<readonly [string, string]> = [
    [SESSION_KEY, JSON.stringify(state)],
    [CAMPAIGN_KEY, exportText(state, SEEDED_AT)],
  ]
  // The function is serialised into the page; only its argument
  // crosses, so nothing from this module's scope is referenced inside.
  await page.addInitScript((pairs: ReadonlyArray<readonly [string, string]>) => {
    for (const [key, value] of pairs) window.localStorage.setItem(key, value)
  }, entries)
}

/**
 * Seed a scene, load the app, and pass the title page.
 *
 * @param page The Playwright page (a fresh context: the record persists).
 * @param scene What the record should be when the app opens.
 * @param query Anything to put after the `/`, e.g. `?dice=6,1` to name
 *   the rolls the spec will make next. Seeding spends no `?dice=` face:
 *   the record is already built when the page loads.
 * @returns The seeded record, so a spec can assert against the values
 *   it was built from rather than restating them.
 */
export const open = async (page: Page, scene: Scene, query = ''): Promise<RecordState> => {
  const state = fold(scene)
  await seed(page, state)
  await page.goto(`/${query}`)
  await page.getByTestId('title-start').click()
  // The leaf has turned to the seeded screen when the title is gone.
  await expect(page.getByTestId('title-start')).toHaveCount(0)
  return state
}
