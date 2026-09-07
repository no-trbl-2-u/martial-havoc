/**
 * Reaching a screen without walking there (`e2e/fixtures`).
 *
 * Every other spec makes a Master and walks into the cave by tapping,
 * which proves the path exists and is kept. These specs prove the other
 * way in: a record folded through the app's own reducer, written into
 * storage before the page loads, and opened with one tap on START.
 *
 * Four things, each its own test: a seeded record opens where it was
 * left; a fight can be opened directly and `?dice=` still names the
 * round that follows; any panel can be opened directly; and the record
 * the fixture builds is the record the app itself saves after the same
 * actions, so the fixtures cannot quietly diverge from the walk.
 */
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { SESSION_KEY } from '../apps/app/src/state/persist'
import type { RecordState } from '../apps/app/src/state/types'
import { atTheRules, facingTheGhost, fold, madeAMaster, onTheMountain, open } from './fixtures'

const button = (page: Page, name: RegExp | string) => page.getByRole('button', { name })

test('a seeded record opens where it was left, with the sheet it was built from', async ({ page }) => {
  const state = await open(page, onTheMountain)
  expect(state.screen).toBe('beat')
  await expect(page.getByTestId('beat')).toBeVisible()
  // The strip shows the seeded sheet, read from the fixture rather than
  // restated: San Te's 8 / 20 / 9 (R83).
  await expect(page.getByTestId('attr-skill')).toHaveText(String(state.sheet.skill))
  await expect(page.getByTestId('attr-endurance')).toHaveText(String(state.sheet.endurance))
  await expect(page.getByTestId('attr-luck')).toHaveText(String(state.sheet.luck))
  await expect(page.getByTestId('area-name')).toHaveText('FLAT-TOP MOUNTAIN')
  await expect(button(page, /TO THE CAVE ENTRANCE/)).toBeVisible()
})

test('straight into the fight, and ?dice= still names the round', async ({ page }) => {
  // The walk (`prototype.spec.ts`, "combat shows both rolls") spends
  // `4,4,2,3` reaching the Ghost and `6,5,1,1` on the round. Seeding
  // spends none, so the round's faces are the whole query.
  await open(page, facingTheGhost, '?dice=6,5,1,1')
  await expect(page.getByTestId('combat')).toBeVisible()
  await expect(page.getByText('DEXTEROUS GHOST', { exact: true })).toBeVisible()
  await button(page, 'ROLL THE ROUND').click()
  await expect(page.getByTestId('die-mine-a')).toHaveAttribute('aria-label', '6')
  await expect(page.getByTestId('die-mine-b')).toHaveAttribute('aria-label', '5')
  await expect(page.getByTestId('die-theirs-a')).toHaveAttribute('aria-label', '1')
  await expect(page.getByTestId('die-theirs-b')).toHaveAttribute('aria-label', '1')
  await expect(page.getByTestId('total-mine')).toHaveText('23')
  await expect(page.getByTestId('total-theirs')).toHaveText('13')
  await expect(page.getByTestId('banner-value')).toHaveText('10')
})

test('straight to a panel: the rules', async ({ page }) => {
  await open(page, atTheRules)
  await expect(page.getByText('RULES, READINGS AND INVENTIONS')).toBeVisible()
})

test('the fold and the walk agree on the record', async ({ page }) => {
  // The walk, as `madeAMaster` in prototype.spec.ts does it.
  await page.goto('/')
  await page.getByTestId('title-start').click()
  await page.getByTestId('preset-preset.san-te').click()
  await page.getByTestId('creation-begin').click()
  await expect(page.getByTestId('village')).toBeVisible()
  // What the app saved for that walk; the save is an effect, so poll.
  const walked = await expect
    .poll(async () =>
      page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) ?? 'null') as unknown, SESSION_KEY),
    )
    .not.toBeNull()
    .then(() =>
      page.evaluate(
        (key) => JSON.parse(window.localStorage.getItem(key) ?? 'null') as RecordState,
        SESSION_KEY,
      ),
    )
  const built = fold(madeAMaster)
  // The session's shape: a field added to the record is added to the
  // fixture on the next build, and this is where a missing one shows.
  expect(Object.keys(walked).sort()).toEqual(Object.keys(built).sort())
  // The deterministic half. The region and the purse are thrown on the
  // table's random dice in the browser and on a fixed sweep here, so
  // they are the one thing the two are allowed to differ on.
  expect(walked.screen).toBe(built.screen)
  expect(walked.creation).toBe(built.creation)
  expect(walked.cave).toEqual(built.cave)
  expect(walked.pending).toEqual(built.pending)
  const { gold: _walkedGold, ...walkedSheet } = walked.sheet
  const { gold: _builtGold, ...builtSheet } = built.sheet
  expect(walkedSheet).toEqual(builtSheet)
})
