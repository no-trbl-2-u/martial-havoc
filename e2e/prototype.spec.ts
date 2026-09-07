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

/**
 * Past creation and into the cave.
 *
 * A fresh record opens on creation (Phase 8), so every spec about the
 * beat or the fight has to make a Master first. Taking San Te's printed
 * sheet is two taps and is what these specs assumed implicitly before
 * creation existed: the same Master, now actually chosen.
 *
 * It spends no `?dice=` faces. Creation rolls on the table's source,
 * not the queue, so a spec's named rolls still reach the rolls it named.
 */
const begin = async (page: Page) => {
  await page.getByTestId('title-start').click()
  await page.getByTestId('preset-preset.san-te').click()
  await page.getByTestId('creation-begin').click()
  await expect(page.getByTestId('beat')).toBeVisible()
}

/** One move: tap the exit, let the card land, CONTINUE. */
const go = async (page: Page, name: RegExp) => {
  await button(page, name).click()
  await page.getByTestId('roll-card-continue').click()
  await expect(page.getByTestId('roll-card')).toHaveCount(0)
}

/**
 * From the mountain to the Attendants room and the Dexterous Ghost, on
 * named dice: Event 4 (safe) into the entrance, 4 into the Dining Hall,
 * then Event 2 (Encounter) and creature 3 (the Ghost) into the
 * Attendants room. Spends `4,4,2,3` of the queue.
 */
const toGhost = async (page: Page) => {
  await go(page, /TO THE CAVE ENTRANCE/)
  await go(page, /TO THE DINING HALL/)
  await go(page, /TO THE ATTENDANTS ROOM/)
  await button(page, /FACE THE DEXTEROUS GHOST/).click()
}

test('the beat opens on the Flat-top mountain, the book’s text word for word', async ({ page }) => {
  await page.goto('/')
  await begin(page)
  await expect(page.getByTestId('attr-skill')).toHaveText('8')
  await expect(page.getByTestId('attr-endurance')).toHaveText('20')
  await expect(page.getByTestId('attr-luck')).toHaveText('9')
  // The printed name over the printed description; the Encounters line
  // folded behind SOURCE with its folio; the Hint hidden (I-60).
  await expect(page.getByTestId('area-name')).toHaveText('FLAT-TOP MOUNTAIN')
  await expect(page.getByTestId('area-description')).toHaveText(
    'A wild and vast territory covered with pines and willow trees, deep valleys and steep rocks, difficult paths for horses. In the distance an axe at work and the animals running on craggy ridges.',
  )
  await expect(page.getByText('Encounters: 1-3 Woodgatherer')).toHaveCount(0)
  await page.getByTestId('area-source').click()
  await expect(page.getByTestId('area-source')).toHaveText('Encounters: 1-3 Woodgatherer; 4-5 Ogre; 6 Junior King · 5T a1')
  await expect(page.getByTestId('hint')).toHaveCount(0)
  // The book's opening is on the first beat, and only there.
  await expect(page.getByTestId('premise')).toContainText('On the Flat-top mountain two fiends threaten the travellers')
  await expect(button(page, /TO THE CAVE ENTRANCE/)).toBeVisible()
  await expect(button(page, /REST HERE/)).toBeVisible()
  await expect(button(page, /LEAVE FOR THE REGION/)).toBeVisible()
  await expect(page.getByPlaceholder("Write it down, or don't.")).toBeVisible()
  await expect(page.getByText('OPTIONAL')).toBeVisible()
  await expect(page.getByText('OVERRIDES 0')).toBeVisible()
  await expect(button(page, 'MY DICE')).toBeVisible()
  await expect(button(page, 'ROLL 2d6')).toHaveCount(0)
})

test('an exit rolls the Event table onto the card: the reason, the die, the printed row, the pill, the citation, the plate', async ({ page }) => {
  await page.goto('/?dice=4')
  await begin(page)
  await button(page, /TO THE CAVE ENTRANCE/).click()
  const card = page.getByTestId('roll-card')
  await expect(card).toBeVisible()
  await expect(page.getByTestId('roll-card-title')).toHaveText('TO THE CAVE ENTRANCE')
  await expect(card.getByText(/EVENT TABLE · 1d6/)).toBeVisible()
  // The die tumbles, then lands on the face the engine rolled: 4, Safe exploration.
  await expect(page.getByText('EVENT · SAFE EXPLORATION')).toBeVisible()
  await expect(page.getByTestId('die-card-a')).toHaveAttribute('aria-label', '4')
  await expect(page.getByTestId('die-card-b')).toHaveCount(0)
  await expect(page.getByTestId('roll-card-total')).toHaveText('Safe exploration')
  await expect(page.getByTestId('pill-rule')).toBeVisible()
  // The citation is there, folded: a tap unfolds it.
  await expect(card.getByText(/5T a1 · Event table/)).toHaveCount(0)
  await page.getByTestId('roll-card-source').click()
  await expect(card.getByText(/5T a1 · Event table, roll every time you enter an area/)).toBeVisible()
  await expect(page.getByTestId('plate-event')).toBeVisible()
  // CONTINUE closes the card; the result slip carries the same on the sheet, in the new area.
  await page.getByTestId('roll-card-continue').click()
  await expect(card).toHaveCount(0)
  await expect(page.getByText('EVENT · SAFE EXPLORATION')).toBeVisible()
  await expect(page.getByTestId('die-result-a')).toHaveAttribute('aria-label', '4')
  await expect(page.getByTestId('result-total')).toHaveText('Safe exploration')
  await expect(page.getByTestId('area-description')).toContainText('A shut wooden gate hidden by a willow tree')
  // Past the first beat, the opening has gone to ABOUT.
  await expect(page.getByTestId('premise')).toHaveCount(0)
})

test('MY DICE: the same card, the face entered by hand, counted as an override; a Hint reveals the grey paragraph', async ({ page }) => {
  await page.goto('/?dice=1,1')
  await begin(page)
  await button(page, 'MY DICE').click()
  await expect(button(page, 'MY DICE · ON')).toBeVisible()
  await button(page, /TO THE CAVE ENTRANCE/).click()
  await expect(page.getByTestId('roll-card')).toBeVisible()
  await expect(page.getByTestId('roll-card-title')).toHaveText('TO THE CAVE ENTRANCE')
  await expect(page.getByText(/TAP THE FACE YOU ROLLED/)).toBeVisible()
  await expect(page.getByTestId('roll-card-continue')).toBeDisabled()
  await page.getByRole('button', { name: '6', exact: true }).click()
  await expect(page.getByText('YOUR DIE: 6')).toBeVisible()
  await page.getByTestId('roll-card-continue').click()
  await expect(page.getByText('EVENT · HINT')).toBeVisible()
  await expect(page.getByTestId('pill-rule')).toBeVisible()
  await page.getByTestId('roll-card-continue').click()
  await expect(page.getByTestId('roll-card')).toHaveCount(0)
  await expect(page.getByTestId('hint')).toContainText('Ogres go out hunting for travellers once a day')
  await expect(page.getByText('OVERRIDES 1')).toBeVisible()
  await page.reload()
  // Every launch opens on the title page, the reload included.
  await page.getByTestId('title-start').click()
  await expect(page.getByText('OVERRIDES 1')).toBeVisible()
  await expect(page.getByText('EVENT · HINT')).toBeVisible()
  await expect(page.getByTestId('hint')).toContainText('Ogres go out hunting')
})

test('a passage is optional and kept when written', async ({ page }) => {
  await page.goto('/')
  await begin(page)
  await expect(page.getByText('YOUR PASSAGE · 0 WRITTEN')).toBeVisible()
  await expect(button(page, 'KEEP IT')).toHaveCount(0)
  await page.getByPlaceholder("Write it down, or don't.").fill('The willow had grown around the gate.')
  await button(page, 'KEEP IT').click()
  await expect(page.getByText('YOUR PASSAGE · 1 WRITTEN')).toBeVisible()
})

test('combat shows both rolls, both Proficiencies, both totals and the difference', async ({ page }) => {
  await page.goto('/?dice=4,4,2,3,6,5,1,1')
  await begin(page)
  await toGhost(page)
  await expect(page.getByTestId('combat')).toBeVisible()
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
  // Its LOOT line, as printed: the private quarter's key, no die.
  await page.getByTestId('act-loot').click()
  await page.getByTestId('act-go-on').click()
  await expect(page.getByTestId('beat')).toBeVisible()
  await expect(page.getByText('LOOT · DEXTEROUS GHOST')).toBeVisible()
  await expect(page.getByTestId('result-total')).toHaveText("private quarter's key")
  await expect(page.getByText('DEEDS 2')).toBeVisible()
  // The key opens the paper door.
  await expect(button(page, /TO THE CHIEFTAIN QUARTER/)).toBeEnabled()
})

test('a tie is an Unexpected Event and the retreat row rolls Morale', async ({ page }) => {
  // Master 3+4+8+4 = 19; Ghost 4+4+7+4 = 19. Event 2d6 = 2+2 = 4 (retreat). Morale d6 = 2 (flee).
  await page.goto('/?dice=4,4,2,3,3,4,4,4,2,2,2')
  await begin(page)
  await toGhost(page)
  await button(page, 'ROLL THE ROUND').click()
  await expect(page.getByText('EQUAL · UNEXPECTED EVENT')).toBeVisible()
  await expect(page.getByText('UNEXPECTED EVENT · 2d6 = 4')).toBeVisible()
  await expect(page.getByTestId('event')).toContainText('Enemy retreat')
  await page.getByTestId('act-morale').click()
  await expect(page.getByText('ITS MORALE BREAKS · IT FLEES')).toBeVisible()
  await expect(page.getByText('1d6 = 2')).toBeVisible()
  await page.getByTestId('act-leave-phase').click()
  await expect(page.getByTestId('beat')).toBeVisible()
})

test('a lost round costs the difference; fleeing costs the last blow and Dishonor', async ({ page }) => {
  // Master 1+1+12 = 14; Ghost 6+6+11 = 23: nine off ENDURANCE, then two more for the escape.
  await page.goto('/?dice=4,4,2,3,1,1,6,6')
  await begin(page)
  await toGhost(page)
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
  await begin(page)
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
  await expect(page.getByTestId('beat')).toBeVisible()
})

test('the region is seven linked points and says it is not to scale', async ({ page }) => {
  await page.goto('/')
  await begin(page)
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
  await expect(page.getByTestId('beat')).toBeVisible()
})

test('an unknown route still serves the app (single-page fallback)', async ({ page }) => {
  await page.goto('/not-a-route')
  await begin(page)
})

test('the frame never scrolls sideways at phone width', async ({ page }) => {
  await page.goto('/')
  await begin(page)
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
  await page.goto('/')
  await begin(page)
  const menuButton = page.getByRole('button', { name: /REST HERE/ })
  const before = await menuButton.boundingBox()
  await menuButton.click()
  await expect(page.getByText("A NIGHT'S REST")).toBeVisible()
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
  await begin(page)
  await expect(page.getByTestId('beat')).toBeVisible()
  await expect(page.getByTestId('area-description')).toBeVisible()
  await expect(page.getByTestId('ledger')).toHaveCount(0)
})

/**
 * Phase 10a, the voice. The brief's first scenario, with the Master
 * these specs actually make: San Te's printed sheet rather than a
 * hand-made Lin Shu, since the name is filled from the record either
 * way and taking a preset is two taps.
 *
 * What it proves is the one thing the phase exists for: a reader can
 * tell the book from the app without reading either. The book's text is
 * upright; Old Ping's line is italic, under a dashed rule with his name
 * at it; and the two are different sentences about the same moment.
 */
test('the voice: the book upright, Old Ping italic under his own rule, told apart at a glance', async ({
  page,
}) => {
  await page.goto('/?dice=4')
  await begin(page)

  // On the mountain: the book describes the place, he says what it is
  // like to stand in it. Neither restates the other.
  const description = page.getByTestId('area-description')
  const line = page.getByTestId('area-narrator-line')
  await expect(description).toContainText('A wild and vast territory covered with pines')
  await expect(page.getByTestId('area-narrator-name')).toHaveText('OLD PING')
  await expect(line).toContainText('Somewhere out of sight an axe keeps time')
  await expect(line).toHaveCSS('font-style', 'italic')
  await expect(description).toHaveCSS('font-style', 'normal')

  // Walking in on a 4: the book's own row for the Event, and his line
  // for it, with the Master named.
  await go(page, /TO THE CAVE ENTRANCE/)
  await expect(page.getByTestId('result-total')).toHaveText('Safe exploration')
  const spoken = page.getByTestId('result-narrator-line')
  await expect(page.getByTestId('result-narrator-name')).toHaveText('OLD PING')
  await expect(spoken).toContainText('San Te')
  await expect(spoken).toContainText('Nothing is waiting in here')
  await expect(spoken).toHaveCSS('font-style', 'italic')
})
