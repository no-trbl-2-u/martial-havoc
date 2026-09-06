/**
 * The build plan's done-condition for Phase 8, as a test:
 *
 *   "a Playwright run creates a Master and wins a fight on the web
 *    export"
 *
 * Two runs, because there are two ways to get a Master and both have to
 * work: rolling one through the book's order (R02-R19), and taking one
 * of the eight printed sheets (R83). The rolled run is the one that
 * proves creation; the printed run is the one that goes on to win the
 * fight on named dice, because a rolled Master's numbers are not known
 * in advance and a fight that depends on them could not be scripted.
 *
 * Creation rolls on the table's dice, never the `?dice=` queue, so the
 * faces named here reach the rolls they were named for.
 */
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const button = (page: Page, name: RegExp | string) => page.getByRole('button', { name })

test('a Master is made by walking the book’s order', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('creation')).toBeVisible()
  await expect(page.getByTestId('place')).toHaveText('MAKE YOUR MASTER')
  // No Master yet, so the strip claims none: every cell is a dash.
  await expect(page.getByTestId('attr-skill')).toHaveText('-')
  await expect(page.getByTestId('attr-endurance')).toHaveText('-')
  await expect(page.getByTestId('attr-luck')).toHaveText('-')
  await expect(page.getByTestId('attr-gold')).toHaveText('-')

  // R02, R03 — standing and its gold. One tap rolls both.
  await page.getByTestId('creation-roll-master').click()
  await expect(page.getByTestId('creation-standing')).toBeVisible()

  // R04, R05 — the three numbers, in the printed order.
  await page.getByTestId('creation-roll-master').or(button(page, 'ROLL')).first().click()
  await expect(page.getByTestId('creation-skill')).toBeVisible()
  const skill = Number(await page.getByTestId('creation-skill').innerText())
  const endurance = Number(await page.getByTestId('creation-endurance').innerText())
  const luck = Number(await page.getByTestId('creation-luck').innerText())
  expect(skill).toBeGreaterThanOrEqual(7)
  expect(skill).toBeLessThanOrEqual(12)
  expect(endurance).toBeGreaterThanOrEqual(14)
  expect(endurance).toBeLessThanOrEqual(24)
  expect(luck).toBeGreaterThanOrEqual(7)
  expect(luck).toBeLessThanOrEqual(12)

  // R09 — the martial art, rolled off the table.
  await button(page, 'ROLL').first().click()
  await expect(page.getByTestId('creation-art')).toBeVisible()

  // R15-R17 — a Training point costs 1 SKILL and gives 4 resources.
  await expect(page.getByTestId('step-training')).toBeVisible()
  await page.getByTestId('creation-training-plus').click()
  await expect(page.getByTestId('creation-training')).toHaveText('1')
  await expect(page.getByText(/1 OF 3 · SKILL/)).toBeVisible()
  await page.getByTestId('creation-next').click()

  // R10, D06 — the Proficiency pool is the ROLLED SKILL, before Training.
  await expect(page.getByTestId('creation-pool')).toHaveText(`0 OF ${skill} SPENT`)
  await page.getByTestId('creation-next').click() // to the kit
  await page.getByTestId('creation-next').click() // to ready

  await expect(page.getByTestId('step-ready')).toBeVisible()
  await page.getByTestId('creation-begin').click()

  // The made Master is the one now playing.
  await expect(page.getByTestId('beat')).toBeVisible()
  await expect(page.getByTestId('attr-skill')).toHaveText(String(skill - 1))
  await expect(page.getByTestId('attr-endurance')).toHaveText(String(endurance))
})

test('creation reports an overspend and still lets the Master begin', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('creation-roll-master').click()
  await button(page, 'ROLL').first().click()
  await button(page, 'ROLL').first().click()
  await page.getByTestId('creation-next').click() // past training, to the spend

  // Put far more on one Proficiency than the pool holds. spec.md: the
  // engine reports the numbers and never refuses.
  const plus = page.locator('[data-testid$="-plus"]').first()
  for (let i = 0; i < 14; i += 1) await plus.click()
  await expect(page.getByTestId('creation-flags')).toContainText('overspent by')

  await page.getByTestId('creation-next').click()
  await page.getByTestId('creation-next').click()
  await page.getByTestId('creation-begin').click()
  // Reported, not blocked.
  await expect(page.getByTestId('beat')).toBeVisible()
})

test('a made Master wins a fight', async ({ page }) => {
  // The printed sheet, so the fight's numbers are known: San Te at
  // SKILL 8 against the Dexterous Ghost, on named dice.
  await page.goto('/?dice=6,5,1,1')
  await page.getByTestId('preset-preset.san-te').click()
  await expect(page.getByTestId('step-ready')).toBeVisible()
  await page.getByTestId('creation-begin').click()
  await expect(page.getByTestId('beat')).toBeVisible()

  await button(page, /GO IN, TO THE ATTENDANTS ROOM/).click()
  await button(page, /FACE THE DEXTEROUS GHOST/).click()
  await expect(page.getByTestId('place')).toHaveText('COMBAT · ROUND 1')

  await button(page, 'ROLL THE ROUND').click()
  await expect(page.getByTestId('total-mine')).toHaveText('23')
  await expect(page.getByTestId('total-theirs')).toHaveText('13')

  // 10 off its ENDURANCE of 8 ends it.
  await page.getByTestId('act-strike').click()
  await expect(button(page, 'FIGHT IS OVER')).toBeVisible()
  await page.getByTestId('act-treasure').click()
  await page.getByTestId('act-go-on').click()
  await expect(page.getByText('DEEDS 1')).toBeVisible()
})

/**
 * The village (Phase 7's engine module, given a surface in Phase 8).
 *
 * The three procedures the build-plan row names — buy, LUCK recovery
 * and a night's rest — each doing what the folio on screen says.
 */
test('the village buys, recovers LUCK and rests, on the printed terms', async ({ page }) => {
  await page.goto('/')
  // A printed sheet's gold is rolled on the table's dice (R03), and San
  // Te is Poor: 1d6-1, which is 0 GP one time in six and then nothing
  // here can be bought. Golden Swallow is Rich (5d6+6, never under 11
  // GP), so every purchase below is affordable on any roll.
  await page.getByTestId('preset-preset.golden-swallow').click()
  await page.getByTestId('creation-begin').click()
  await button(page, 'VILLAGE').click()
  await expect(page.getByTestId('village')).toBeVisible()
  await expect(page.getByTestId('place')).toHaveText('FEN PASS · THE TRAIL-HEAD')

  // Three locations and the trail, from the fixed data file.
  await expect(page.getByTestId('village.place.market')).toBeVisible()
  await expect(page.getByTestId('village.place.temple')).toBeVisible()
  await expect(page.getByTestId('village.place.inn')).toBeVisible()
  await expect(page.getByTestId('village-trail')).toBeVisible()

  // R58: no incense, no check, and no dice are spent finding that out.
  await page.getByTestId('village-temple').click()
  await expect(page.getByTestId('village-note')).toContainText('No incense')

  // MH p.52-55: a stick of incense at its printed 5 SP.
  await page.getByTestId('buy-market.common.incense').click()
  await expect(page.getByTestId('village-note')).toContainText('Bought Incense')

  // Now the shrine will roll.
  await page.getByTestId('village-temple').click()
  await expect(page.getByTestId('village-note')).toContainText('check')

  // The inn takes its silver and gives the night back.
  await page.getByTestId('village-inn').click()
  await expect(page.getByTestId('village-note')).toContainText('ENDURANCE')

  // And the trail leads out.
  await page.getByTestId('village-go').click()
  await expect(page.getByTestId('beat')).toBeVisible()
})

/**
 * The campaign record, its export and an import that migrates.
 *
 * The round-trip is the point: what the screen shows as JSON is what
 * the screen can read back, on the same build, through the same engine
 * functions Phase 6 shipped.
 */
test('the record shows what was played, and reads its own export back', async ({ page }) => {
  await page.goto('/?dice=6,5,1,1')
  await page.getByTestId('preset-preset.san-te').click()
  await page.getByTestId('creation-begin').click()

  // Do something worth recording: win a fight.
  await button(page, /GO IN, TO THE ATTENDANTS ROOM/).click()
  await button(page, /FACE THE DEXTEROUS GHOST/).click()
  await button(page, 'ROLL THE ROUND').click()
  await page.getByTestId('act-strike').click()
  await page.getByTestId('act-treasure').click()
  await page.getByTestId('act-go-on').click()

  await button(page, 'RECORD').click()
  await expect(page.getByTestId('record')).toBeVisible()
  await expect(page.getByTestId('place')).toHaveText('THE CAMPAIGN RECORD')
  await expect(page.getByTestId('record-counts')).toContainText('1 DEEDS')
  await expect(page.getByTestId('record-deeds')).toContainText('dexterous ghost')

  // The export is the whole campaign, and it reads back.
  const json = await page.getByTestId('record-json').inputValue()
  expect(json).toContain('martial-havoc/campaign')
  await page.getByTestId('record-paste').fill(json)
  await page.getByTestId('record-read').click()
  await expect(page.getByTestId('record-import-note')).toHaveText('Campaign read.')
  await expect(page.getByTestId('record-counts')).toContainText('1 DEEDS')
})

test('an unreadable import says which kind of unreadable it was', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('preset-preset.san-te').click()
  await page.getByTestId('creation-begin').click()
  await button(page, 'RECORD').click()

  await page.getByTestId('record-paste').fill('not json at all')
  await page.getByTestId('record-read').click()
  await expect(page.getByTestId('record-import-note')).toContainText('not JSON')

  await page.getByTestId('record-paste').fill('{"hello":"world"}')
  await page.getByTestId('record-read').click()
  await expect(page.getByTestId('record-import-note')).toContainText('not a Martial Havoc campaign')
})
