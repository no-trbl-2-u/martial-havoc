/**
 * One playthrough of the prototype slice, photographed at every stop.
 *
 * Dice are named with `?dice=` so the same run gives the same pictures:
 * the record is fresh per test, the Master is San Te, the foe is the
 * Dexterous Ghost. Frames are 390 x 844 at 2x, written to
 * design/screenshots/ as the visual baseline Phase 8 starts from.
 */
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const shot = (page: Page, name: string) =>
  page.screenshot({ path: `design/screenshots/${name}.png`, fullPage: false })

const button = (page: Page, name: RegExp | string) => page.getByRole('button', { name })
const goIn = async (page: Page) => {
  await button(page, /GO IN, TO THE ATTENDANTS ROOM/).click()
  await button(page, /FACE THE DEXTEROUS GHOST/).click()
}

test('01 the beat, opening', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('place')).toHaveText('AREA 2 OF 8 · CAVE ENTRANCE')
  await shot(page, '01-beat-opening')
})

test('02 the beat, a check passed', async ({ page }) => {
  await page.goto('/?dice=4,6')
  await button(page, /FORCE THE SHUT GATE/).click()
  await expect(page.getByText('SKILL CHECK · PASSED')).toBeVisible()
  await shot(page, '02-beat-check-passed')
})

test('03 the beat, the dice on the table', async ({ page }) => {
  await page.goto('/')
  await button(page, 'MY DICE').click()
  await page.getByRole('button', { name: '6', exact: true }).click()
  await page.getByRole('button', { name: '6', exact: true }).click()
  await expect(button(page, 'USE MY DICE')).toBeVisible()
  await shot(page, '03-beat-manual-dice')
  await button(page, /FORCE THE SHUT GATE/).click()
  await expect(page.getByText('SKILL CHECK · FAILED')).toBeVisible()
  await shot(page, '04-beat-double-six')
})

test('05 the beat, a passage kept and a night’s rest', async ({ page }) => {
  await page.goto('/?dice=1,1,6,6')
  await page.getByPlaceholder("Write it down, or don't.").fill('The willow had grown around the gate before anyone thought to shut it.')
  await button(page, 'KEEP IT').click()
  await button(page, /REST BY THE STREAM/).click()
  await expect(page.getByText("A NIGHT'S REST")).toBeVisible()
  await shot(page, '05-beat-rest-and-passage')
})

test('06 combat, before the round', async ({ page }) => {
  await page.goto('/?dice=6,5,1,1')
  await goIn(page)
  await expect(page.getByTestId('place')).toHaveText('COMBAT · ROUND 1')
  await shot(page, '06-combat-ready')
  await button(page, 'ROLL THE ROUND').click()
  await expect(page.getByText('YOU ARE AHEAD BY')).toBeVisible()
  await shot(page, '07-combat-won-round')
  await page.getByTestId('act-opening').click()
  await shot(page, '08-combat-opening')
})

test('09 combat, the Final Blow lands', async ({ page }) => {
  await page.goto('/?dice=6,5,1,1,3,3')
  await goIn(page)
  await button(page, 'ROLL THE ROUND').click()
  await page.getByTestId('act-opening').click()
  await page.getByTestId('act-blow').click()
  await expect(page.getByText('THE BLOW LANDS')).toBeVisible()
  await shot(page, '09-combat-final-blow')
  await page.getByTestId('act-treasure').click()
  await page.getByTestId('act-go-on').click()
  await expect(page.getByText(/TREASURE ROLL/)).toBeVisible()
  await shot(page, '10-beat-after-the-fight')
})

test('11 combat, a lost round', async ({ page }) => {
  await page.goto('/?dice=1,1,6,6')
  await goIn(page)
  await button(page, 'ROLL THE ROUND').click()
  await expect(page.getByText('IT IS AHEAD BY · END LOST')).toBeVisible()
  await shot(page, '11-combat-lost-round')
})

test('12 combat, a tie and Morale', async ({ page }) => {
  await page.goto('/?dice=3,4,4,4,2,2,2')
  await goIn(page)
  await button(page, 'ROLL THE ROUND').click()
  await expect(page.getByText('UNEXPECTED EVENT · 2d6 = 4')).toBeVisible()
  await shot(page, '12-combat-unexpected-event')
  await page.getByTestId('act-morale').click()
  await expect(page.getByText('ITS MORALE BREAKS · IT FLEES')).toBeVisible()
  await shot(page, '13-combat-morale')
})

test('14 the rules panel', async ({ page }) => {
  await page.goto('/')
  await button(page, 'RULES').click()
  await expect(page.getByText('RULES, READINGS AND INVENTIONS')).toBeVisible()
  await shot(page, '14-rules-panel')
  await page.getByTestId('chip-reading').click()
  await page.getByTestId('behaviour-combat.opponent-proficiency-is-the-higher').getByRole('button').click()
  await expect(page.getByText('THE BOOK SAYS')).toBeVisible()
  await shot(page, '15-rules-reading-open')
})

test('16 the region', async ({ page }) => {
  await page.goto('/')
  await button(page, 'MAP').click()
  await expect(page.getByText('NOT TO SCALE')).toBeVisible()
  await shot(page, '16-region')
})
