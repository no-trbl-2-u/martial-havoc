/**
 * The prototype on the web export: the beat, a check with both dice and
 * its label, the player's own dice as an override, combat with both
 * rolls and the difference, a tie as an Unexpected Event, the rules
 * panel, the region. Rolls are named with `?dice=` (see
 * apps/app/src/dice/random.ts) so every assertion is exact; the record
 * persists in the browser, so each test is a fresh context.
 */
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const button = (page: Page, name: RegExp | string) => page.getByRole('button', { name })

test('the beat opens at the cave entrance with the Master in reach', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('THE 5 TREASURES')).toBeVisible()
  await expect(page.getByTestId('place')).toHaveText('AREA 2 OF 8 · CAVE ENTRANCE')
  await expect(page.getByTestId('attr-skill')).toHaveText('8')
  await expect(page.getByTestId('attr-endurance')).toHaveText('20')
  await expect(page.getByTestId('attr-luck')).toHaveText('9')
  await expect(page.getByTestId('authored-line')).not.toBeEmpty()
  await expect(button(page, /FORCE THE SHUT GATE/)).toBeVisible()
  await expect(button(page, /REST BY THE STREAM/)).toBeVisible()
  await expect(page.getByPlaceholder("Write it down, or don't.")).toBeVisible()
  await expect(page.getByText('OPTIONAL')).toBeVisible()
  await expect(page.getByText('OVERRIDES 0')).toBeVisible()
  await expect(button(page, 'ROLL 2d6')).toBeVisible()
  await expect(button(page, 'MY DICE')).toBeVisible()
})

test('a check shows both dice, the total, the label pill and the citation', async ({ page }) => {
  await page.goto('/?dice=4,6')
  await button(page, /FORCE THE SHUT GATE/).click()
  await expect(page.getByText('SKILL CHECK · PASSED')).toBeVisible()
  await expect(page.getByTestId('die-result-a')).toHaveAttribute('aria-label', '4')
  await expect(page.getByTestId('die-result-b')).toHaveAttribute('aria-label', '6')
  await expect(page.getByTestId('result-total')).toHaveText('10')
  await expect(page.getByText(/against SKILL 8 \+2 \(STAMINA\)/)).toBeVisible()
  await expect(page.getByTestId('pill-rule')).toBeVisible()
  await expect(page.getByText(/MH p\.22 \(R20\) · equal or under passes · 10 <= 10/)).toBeVisible()
})

test('the dice on the table are used, counted as an override, and the record survives a reload', async ({ page }) => {
  await page.goto('/?dice=1,1')
  await button(page, 'MY DICE').click()
  await expect(page.getByText('TAP THE TWO FACES YOU ROLLED')).toBeVisible()
  await page.getByRole('button', { name: '6', exact: true }).click()
  await page.getByRole('button', { name: '6', exact: true }).click()
  await expect(page.getByText(/YOUR DICE: 6 AND 6/)).toBeVisible()
  await expect(button(page, 'USE MY DICE')).toBeVisible()
  await button(page, /FORCE THE SHUT GATE/).click()
  await expect(page.getByText('SKILL CHECK · FAILED')).toBeVisible()
  await expect(page.getByText(/a double six always fails/)).toBeVisible()
  await expect(page.getByTestId('pill-invention')).toBeVisible()
  await expect(page.getByText('OVERRIDES 1')).toBeVisible()
  await page.reload()
  await expect(page.getByText('OVERRIDES 1')).toBeVisible()
  await expect(page.getByText('SKILL CHECK · FAILED')).toBeVisible()
})

test('a passage is optional and kept when written', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('YOUR PASSAGE · 0 WRITTEN')).toBeVisible()
  await expect(button(page, 'KEEP IT')).toHaveCount(0)
  await page.getByPlaceholder("Write it down, or don't.").fill('The willow had grown around the gate.')
  await button(page, 'KEEP IT').click()
  await expect(page.getByText('YOUR PASSAGE · 1 WRITTEN')).toBeVisible()
})

test('combat shows both rolls, both Proficiencies, both totals and the difference', async ({ page }) => {
  await page.goto('/?dice=6,5,1,1')
  await button(page, /GO IN, TO THE ATTENDANTS ROOM/).click()
  await expect(page.getByTestId('place')).toHaveText('AREA 3 OF 8 · ATTENDANTS ROOM')
  await button(page, /FACE THE DEXTEROUS GHOST/).click()
  await expect(page.getByTestId('place')).toHaveText('COMBAT · ROUND 1')
  await expect(page.getByText('DEXTEROUS GHOST', { exact: true })).toBeVisible()
  await button(page, 'ROLL THE ROUND').click()
  await expect(page.getByTestId('die-mine-a')).toHaveAttribute('aria-label', '6')
  await expect(page.getByTestId('die-mine-b')).toHaveAttribute('aria-label', '5')
  await expect(page.getByTestId('die-theirs-a')).toHaveAttribute('aria-label', '1')
  await expect(page.getByTestId('die-theirs-b')).toHaveAttribute('aria-label', '1')
  await expect(page.getByTestId('total-mine')).toHaveText('23')
  await expect(page.getByTestId('total-theirs')).toHaveText('13')
  await expect(page.getByText(/NON LETHAL COMBAT \+4/)).toBeVisible()
  await expect(page.getByText(/IMMATERIAL CHARGE \+4/)).toBeVisible()
  await expect(page.getByText('YOU ARE AHEAD BY')).toBeVisible()
  await expect(page.getByTestId('banner-value')).toHaveText('10')
  await expect(page.getByTestId('act-strike')).toBeEnabled()
  await expect(page.getByTestId('act-strike')).toContainText('Take 10 from its ENDURANCE.')
  await expect(page.getByTestId('act-technique')).toBeEnabled()
  await expect(page.getByTestId('act-opening')).toBeEnabled()
  await page.getByTestId('act-strike').click()
  await expect(button(page, 'FIGHT IS OVER')).toBeVisible()
  await page.getByTestId('act-treasure').click()
  await page.getByTestId('act-go-on').click()
  await expect(page.getByTestId('place')).toHaveText('AREA 3 OF 8 · ATTENDANTS ROOM')
  await expect(page.getByText(/TREASURE ROLL · 1d6 = [1-6]/)).toBeVisible()
  await expect(page.getByText('DEEDS 1')).toBeVisible()
})

test('a tie is an Unexpected Event and the retreat row rolls Morale', async ({ page }) => {
  // Master 3+4+8+4 = 19; Ghost 4+4+7+4 = 19. Event 2d6 = 2+2 = 4 (retreat). Morale d6 = 2 (flee).
  await page.goto('/?dice=3,4,4,4,2,2,2')
  await button(page, /GO IN, TO THE ATTENDANTS ROOM/).click()
  await button(page, /FACE THE DEXTEROUS GHOST/).click()
  await button(page, 'ROLL THE ROUND').click()
  await expect(page.getByText('EQUAL · UNEXPECTED EVENT')).toBeVisible()
  await expect(page.getByText('UNEXPECTED EVENT · 2d6 = 4')).toBeVisible()
  await expect(page.getByTestId('event')).toContainText('Enemy retreat')
  await page.getByTestId('act-morale').click()
  await expect(page.getByText('ITS MORALE BREAKS · IT FLEES')).toBeVisible()
  await expect(page.getByText('1d6 = 2')).toBeVisible()
  await page.getByTestId('act-leave-phase').click()
  await expect(page.getByTestId('place')).toHaveText('AREA 3 OF 8 · ATTENDANTS ROOM')
})

test('a lost round costs the difference; fleeing costs the last blow and Dishonor', async ({ page }) => {
  // Master 1+1+12 = 14; Ghost 6+6+11 = 23: nine off ENDURANCE, then two more for the escape.
  await page.goto('/?dice=1,1,6,6')
  await button(page, /GO IN, TO THE ATTENDANTS ROOM/).click()
  await button(page, /FACE THE DEXTEROUS GHOST/).click()
  await button(page, 'ROLL THE ROUND').click()
  await expect(page.getByText('IT IS AHEAD BY · END LOST')).toBeVisible()
  await expect(page.getByTestId('banner-value')).toHaveText('9')
  await expect(page.getByTestId('attr-endurance')).toHaveText('11')
  await expect(page.getByTestId('act-strike')).toBeDisabled()
  await button(page, 'FLEE · DISHONOR +1').click()
  await expect(page.getByTestId('attr-endurance')).toHaveText('9')
  await expect(page.getByText('DEEDS 1')).toBeVisible()
})

test('the rules panel lists every behaviour with its label and opens one', async ({ page }) => {
  await page.goto('/')
  await button(page, 'RULES').click()
  await expect(page.getByText('RULES, READINGS AND INVENTIONS')).toBeVisible()
  await expect(page.getByText(/^\d+ BEHAVIOURS · 0 UNLABELLED$/)).toBeVisible()
  await expect(page.getByTestId('pill-rule').first()).toBeVisible()
  await page.getByTestId('chip-reading').click()
  await expect(page.getByTestId('pill-rule')).toHaveCount(0)
  await expect(page.getByTestId('pill-reading').first()).toBeVisible()
  await page.getByTestId('behaviour-combat.opponent-proficiency-is-the-higher').getByRole('button').click()
  await expect(page.getByText('THE BOOK SAYS')).toBeVisible()
  await expect(page.getByText('SILENT ON')).toBeVisible()
  await expect(page.getByText(/estate-inventory\.md, I-21/)).toBeVisible()
  await button(page, 'BACK TO PLAY').click()
  await expect(page.getByTestId('place')).toHaveText('AREA 2 OF 8 · CAVE ENTRANCE')
})

test('the region is seven linked points and says it is not to scale', async ({ page }) => {
  await page.goto('/')
  await button(page, 'MAP').click()
  await expect(page.getByText('NOT TO SCALE')).toBeVisible()
  await expect(page.getByText(/7 POINTS · \d+ LINKS/)).toBeVisible()
  await expect(page.getByText('INVENTION · MILES = DICE SUM')).toBeVisible()
  const travel = button(page, /^TRAVEL TO /).first()
  await expect(travel).toBeVisible()
  await expect(travel).toContainText(/\d+ MI/)
  await travel.click()
  await expect(page.getByTestId('here')).not.toBeEmpty()
  await button(page, 'BACK TO PLAY').click()
  await expect(page.getByTestId('place')).toHaveText('AREA 2 OF 8 · CAVE ENTRANCE')
})

test('an unknown route still serves the app (single-page fallback)', async ({ page }) => {
  await page.goto('/not-a-route')
  await expect(page.getByText('THE 5 TREASURES')).toBeVisible()
})

test('the frame never scrolls sideways at phone width', async ({ page }) => {
  await page.goto('/')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(1)
})

/**
 * Phase 8b: the beat is laid out as the Sheet, and only as the Sheet.
 *
 * The operator picked it from the three candidates Phase 8a rendered
 * (design/INDEX.md). What has to hold is the bargain that won: the
 * menu and the roll bar live in the bottom third and stay there when a
 * result lands, so nothing pressable ever scrolls away under a thumb.
 */
test('the beat keeps the menu and the roll bar in reach when a result lands', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/?dice=4,6')
  const menuButton = page.getByRole('button', { name: /FORCE THE SHUT GATE/ })
  const before = await menuButton.boundingBox()
  await menuButton.click()
  await expect(page.getByText('SKILL CHECK · PASSED')).toBeVisible()
  const after = await menuButton.boundingBox()
  expect(before).not.toBeNull()
  expect(after).not.toBeNull()
  // The sheet does not give way: the row a thumb was over is still there.
  expect(Math.abs((after?.y ?? 0) - (before?.y ?? 0))).toBeLessThanOrEqual(2)
  // And it is in the bottom half of the phone, where the thumb is.
  expect(after?.y ?? 0).toBeGreaterThan(844 / 2)
})

test('the unchosen layouts are gone: ?layout= serves the same beat', async ({ page }) => {
  await page.goto('/?layout=c')
  await expect(page.getByTestId('beat')).toBeVisible()
  await expect(page.getByTestId('authored-line')).toBeVisible()
  await expect(page.getByTestId('ledger')).toHaveCount(0)
})
