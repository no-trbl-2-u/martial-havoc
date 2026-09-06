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
