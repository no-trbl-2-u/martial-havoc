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
 * not the queue, and taking the trail rolls nothing at all, so a spec's
 * named rolls still reach the rolls it named.
 */
const begin = async (page: Page) => {
  await page.getByTestId('title-start').click()
  await page.getByTestId('preset-preset.san-te').click()
  await page.getByTestId('creation-begin').click()
  // Phase 10b: a made Master wakes in Fen Pass and reads the Call. The
  // trail out of the village is the point of no return and the only way
  // onto the mountain, so every spec about the beat takes it first. It
  // spends no `?dice=` faces.
  await expect(page.getByTestId('village')).toBeVisible()
  await page.getByTestId('village-go').click()
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
  // The book's opening is no longer on the beat at all: it is the
  // village's Call, read before the trail was taken (Phase 10b).
  await expect(page.getByTestId('premise')).toHaveCount(0)
  await expect(button(page, /TO THE CAVE ENTRANCE/)).toBeVisible()
  await expect(button(page, /REST HERE/)).toBeVisible()
  // The mountain's own way off the adventure is the trail it was reached
  // by; the region opens at the ending and not before (Phase 10b).
  await expect(button(page, /BACK DOWN TO FEN PASS/)).toBeVisible()
  await expect(button(page, /LEAVE FOR THE REGION/)).toHaveCount(0)
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
  // The opening lives in the village and under ABOUT, never here.
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
  // The trail is a deed of its own now (Phase 10b), so each count is one higher.
  await expect(page.getByText('DEEDS 3')).toBeVisible()
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
  await expect(page.getByText('DEEDS 2')).toBeVisible()
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

/**
 * Phase 10b, the opening. The brief's first two scenarios: a made
 * Master wakes in Fen Pass with the Call in front of them, and the
 * trail is the point of no return — the only way onto the mountain,
 * and the only way back off it.
 *
 * The header check is the one that matters most. Before the trail there
 * is no beat to return to, so a panel button pressed twice has to come
 * back to the village; if it came back to the beat, the first act would
 * be a thing a player could step over by opening RULES and closing it.
 */
test('the opening: a made Master wakes in Fen Pass, and the trail is the point of no return', async ({
  page,
}) => {
  await page.goto('/?dice=4')
  await page.getByTestId('title-start').click()
  await page.getByTestId('preset-preset.san-te').click()
  await page.getByTestId('creation-begin').click()

  // The Call: the book's premise under a heading of ours, with the
  // narrator naming the Goal, and no beat anywhere.
  await expect(page.getByTestId('village')).toBeVisible()
  const call = page.getByTestId('call')
  await expect(call).toContainText('THE CALL')
  await expect(call).toContainText('On the Flat-top mountain two fiends threaten the travellers')
  await expect(page.getByTestId('call-narrator-name')).toHaveText('OLD PING')
  await expect(page.getByTestId('call-narrator-line')).toContainText('San Te')
  await expect(page.getByTestId('beat')).toHaveCount(0)

  // The header cannot reach the beat before the trail is taken.
  await button(page, 'RULES').click()
  await expect(page.getByTestId('chip-all')).toBeVisible()
  await button(page, 'RULES').click()
  await expect(page.getByTestId('village')).toBeVisible()
  await expect(page.getByTestId('beat')).toHaveCount(0)

  // Taking it is the climax of the first act, and the ledger says so.
  await page.getByTestId('village-go').click()
  await expect(page.getByTestId('beat')).toBeVisible()
  await expect(page.getByTestId('area-name')).toHaveText('FLAT-TOP MOUNTAIN')
  await expect(page.getByText('DEEDS 1')).toBeVisible()

  // The Call has been answered and does not call again; the way back is
  // the trail, and it does not un-begin the adventure.
  await button(page, /BACK DOWN TO FEN PASS/).click()
  await expect(page.getByTestId('village')).toBeVisible()
  await expect(page.getByTestId('call')).toHaveCount(0)
  await button(page, 'RULES').click()
  await button(page, 'RULES').click()
  await expect(page.getByTestId('beat')).toBeVisible()
})

/**
 * Phase 10c, the acts on screen. The brief's first two scenarios.
 *
 * The ladder has existed in `acts.json` since Phase 5 and the engine
 * has computed the current rung since then; until now no screen showed
 * either, so a player could cross the point of no return into the cave
 * and the app would not say anything had changed.
 */
test('the acts: the page turns to act 2 once, and the outline remembers', async ({ page }) => {
  await page.goto('/?dice=4,4')
  await begin(page)

  // Act 1 on the mountain: one square filled of five, no slip yet
  // announced beyond the one the first act brings.
  await expect(page.getByTestId('act-mark')).toBeVisible()
  await page.getByTestId('act-slip').click()
  await expect(page.getByTestId('act-slip')).toHaveCount(0)

  // Into the cave: the page turns.
  await go(page, /TO THE CAVE ENTRANCE/)
  const slip = page.getByTestId('act-slip')
  await expect(page.getByTestId('act-name')).toHaveText('INSIDE THE LOTUS FLOWER')
  await expect(page.getByTestId('act-line')).toContainText('The gate is behind San Te now')
  await expect(page.getByTestId('act-line')).not.toContainText('{name}')

  // Any tap dismisses it, and it does not come back.
  await slip.click()
  await expect(slip).toHaveCount(0)
  await go(page, /TO THE FLAT-TOP MOUNTAIN/)
  await expect(page.getByTestId('act-slip')).toHaveCount(0)
  await expect(page.getByTestId('act-mark')).toBeVisible()
})

/**
 * The boss's door. The book's own example of its own pacing rule: the
 * generals are behind the Master, the door is opening, and a quiet roll
 * here would let the finale down (MH p.84, R82).
 */
test('the paper door: a quiet roll is read as an Encounter, in the open', async ({ page }) => {
  // The proven path to the key: `toGhost` walks 4,4,2,3 to the
  // Attendants room and meets the Dexterous Ghost, whose LOOT line is
  // the private quarter's key. 6,5 wins the round, 1,1 is the strike.
  // The last two faces open the Chieftain quarter on a 4 - Safe
  // exploration on the printed table - and roll its creature.
  await page.goto('/?dice=4,4,2,3,6,5,1,1,4,1')
  await begin(page)
  await toGhost(page)
  await button(page, 'ROLL THE ROUND').click()
  await page.getByTestId('act-strike').click()
  await page.getByTestId('act-loot').click()
  await page.getByTestId('act-go-on').click()

  await go(page, /TO THE CHIEFTAIN QUARTER/)
  // The override is visible and labelled: the book's sentence, the face
  // that was actually rolled, and what it was read as instead.
  const slip = page.getByTestId('momentum')
  await expect(slip).toContainText('ignore the dice')
  await expect(page.getByTestId('momentum-rolled')).toContainText('ROLLED 4')
  await expect(page.getByTestId('momentum-rolled')).toContainText('Safe exploration')
  await expect(page.getByTestId('momentum-rolled')).toContainText('READ AS ENCOUNTER')
})

/**
 * Phase 10d, the fight as a scene. The brief's first three scenarios on
 * the web export: a kill, a flight, and an Ambush.
 *
 * Combat's arithmetic was right and labelled before this phase; what a
 * round meant to the story was never said. These three are the ways a
 * fight most often ends.
 */
test('a kill has its own slip before the loot row', async ({ page }) => {
  await page.goto('/?dice=4,4,2,3,6,5,1,1')
  await begin(page)
  await toGhost(page)
  await button(page, 'ROLL THE ROUND').click()
  await page.getByTestId('act-strike').click()

  // The fall, said as a moment: who, how, and Old Ping's line.
  await expect(page.getByTestId('fallen-title')).toHaveText('DEXTEROUS GHOST FALLS')
  await expect(page.getByTestId('fallen')).toContainText('OFF ITS ENDURANCE')
  await expect(page.getByTestId('fallen-narrator-name')).toHaveText('OLD PING')
  // And the housekeeping sits under it, not over it.
  await expect(page.getByTestId('act-loot')).toBeVisible()
  await expect(page.getByTestId('act-go-on')).toBeVisible()
})

test('fleeing is narrated on the beat, with the blow and the Dishonor', async ({ page }) => {
  await page.goto('/?dice=4,4,2,3')
  await begin(page)
  await toGhost(page)
  // Leave with the Ghost standing: R38's last blow of 2, and I-32's
  // Dishonor Point for not getting away clean.
  await button(page, /FLEE/).click()
  await expect(page.getByTestId('beat')).toBeVisible()
  const slip = page.getByTestId('result')
  await expect(slip).toContainText('FLED DEXTEROUS GHOST')
  await expect(page.getByTestId('result-total')).toHaveText('-2')
  await expect(slip).toContainText('DISHONOR +1')
  await expect(page.getByTestId('attr-endurance')).toHaveText('18')
  // The encounter is left behind: the Ghost is not offered again.
  await expect(button(page, /FACE THE DEXTEROUS GHOST/)).toHaveCount(0)
})

test('an ambush is their round first, and says so', async ({ page }) => {
  // Event 1 is "Ambush!" at the Cave entrance; 2 is the area's creature.
  await page.goto('/?dice=1,2,3,3,3,3,1,1,1,1')
  await begin(page)
  await button(page, /TO THE CAVE ENTRANCE/).click()
  await page.getByTestId('roll-card-continue').click()
  await expect(page.getByTestId('roll-card')).toHaveCount(0)
  await expect(page.getByTestId('result-total')).toContainText('Ambush')

  await page.getByRole('button', { name: /^FACE / }).first().click()
  await expect(page.getByTestId('combat')).toBeVisible()
  // The banner explains the missing winner's options before the roll.
  await expect(page.getByTestId('banner-value')).toBeVisible()
  await expect(page.getByText('AMBUSH, THEIR ROUND')).toBeVisible()
})
