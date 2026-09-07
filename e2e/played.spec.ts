/**
 * The app plays the book; it does not recite it.
 *
 * The book's own pages are a rulebook of tables and two pages of
 * referee's notes (5T a1-a2). At a table the reader supplies what the
 * pages leave out: "The rulebook gives you the tools, the story comes
 * from your imagination" (MH p.3), "Imagine the two opponents still in
 * the attack position... then something happens" (MH p.27-28), a Call
 * and a Point of No Return (MH p.84), a boss door where "if the result
 * of the dice roll conflicts with the linear development of the story,
 * ignore the dice" (MH p.84), and "a joyful jump and a freeze frame
 * with the closing credits" (MH p.87). The verdict of 2026-09-06 was
 * that the app printed the pages and left all of that to the reader:
 * "the cave read as a referee's notes" (`plan/phases/phase_10a_the_voice.md`).
 * Phases 10a-10j built the tissue in a marked voice of the app's own.
 *
 * Every existing spec proves one of those phases on the walk from the
 * title page. This file proves the property as a whole, from seeded
 * records (`e2e/fixtures`), and proves the negative space the walks
 * never asserted: no citation on the play surface, no word of the
 * table in the narrator's mouth, no narrator where `plan/VOICE.md`
 * says he is silent, and no ending before the five treasures.
 *
 * Nothing here is typed by hand that the content package or the seeded
 * record can supply. Expected copy is read from `@martial-havoc/content`
 * and filled with the seeded Master's name, so a line rewritten in the
 * data is rewritten here on the next run; the one exception is the
 * book's own text, quoted from the PDF with its folio in a comment.
 */
import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'
import { XP_CATEGORIES } from '@martial-havoc/engine'
import {
  adventureHookById,
  narratorLineFor,
  promptFor,
  t,
  theFiveTreasuresActs,
  theFiveTreasuresAreaById,
  theFiveTreasuresMeta,
} from '@martial-havoc/content'
import type { PromptMoment } from '@martial-havoc/content'
import { fill } from '../apps/app/src/lib/fill'
import type { RecordState } from '../apps/app/src/state/types'
import {
  HOOK,
  atThePaperDoor,
  atTheEndingsDoor,
  atTheRecord,
  atTheRules,
  facingTheBeast,
  facingTheGhost,
  facingThreeServants,
  inTheStorageRoom,
  onTheMountain,
  open,
  readingTheCall,
  struckDown,
  withAMotive,
} from './fixtures'

// ------------------------------------------------------------ helpers

/** A button by its accessible name. */
const button = (page: Page, name: RegExp | string) => page.getByRole('button', { name })

/** One move on the beat: tap the exit, let the card land, CONTINUE. */
const go = async (page: Page, name: RegExp) => {
  await button(page, name).click()
  await page.getByTestId('roll-card-continue').click()
  await expect(page.getByTestId('roll-card')).toHaveCount(0)
}

/** The narrator's name as the app prints it, from the one string that holds it. */
const NARRATOR = t('ui.narrator.name')

/**
 * The line the narrator speaks at `moment`, filled for the seeded
 * Master. Reading it from the content package rather than restating it
 * is what lets a rewritten line stay green here and red only if the
 * app stops printing it.
 */
const spoken = (moment: string, state: RecordState): string => {
  const record = narratorLineFor(moment)
  if (record === undefined) throw new Error(`no narrator line for moment ${moment}`)
  return fill(record.line, { name: state.sheet.name })
}

/** The act with number `n`, from the adventure's own ladder. */
const act = (n: number) => {
  const found = theFiveTreasuresActs.find((a) => a.act === n)
  if (found === undefined) throw new Error(`no act ${String(n)}`)
  return found
}

/** The printed name of the area the seeded record stands in, as the beat prints it. */
const areaName = (state: RecordState): string => {
  const area = theFiveTreasuresAreaById(state.cave.area)
  if (area === undefined) throw new Error(`no area ${state.cave.area}`)
  return area.name.toUpperCase()
}

/**
 * The words `plan/VOICE.md` bans from the narrator's mouth, as
 * `packages/content/src/voice.test.ts` spells them. That test proves
 * the data; this proves the render, which is where `{name}` is filled
 * and where a screen could in principle print the wrong record. The
 * two lists are kept identical by hand; a change to one is a change to
 * both.
 */
const BANNED = {
  /** "Never the second person for the Master." */
  secondPerson: /\b(you|your|yours|you're|youre|yourself)\b/iu,
  /** "The listener is in the story, not at the table." */
  table: /\b(roll|rolls|rolled|rolling|dice|die|d6|check|checks|result|results|score|scores|stat|stats|modifier|modifiers)\b/iu,
} as const

/**
 * A rendered narrator line is his: named, italic, and inside the guide.
 *
 * `name` and `line` are the two children the `Narrator` component
 * renders under `<testID>-name` and `<testID>-line`. The text is held
 * to the same edges as the content test and to the one thing only a
 * render can get wrong, an unfilled `{name}`.
 */
const assertSpoken = async (page: Page, testID: string, line: string): Promise<void> => {
  const name = page.getByTestId(`${testID}-name`)
  const said = page.getByTestId(`${testID}-line`)
  await expect(name).toHaveText(NARRATOR)
  await expect(said).toHaveText(line)
  await expect(said).toHaveCSS('font-style', 'italic')
  const text = await said.innerText()
  expect(text, `second person in: ${text}`).not.toMatch(BANNED.secondPerson)
  expect(text, `a word of the table in: ${text}`).not.toMatch(BANNED.table)
  expect(text, `a digit in: ${text}`).not.toMatch(/[0-9]/u)
  expect(text, `an exclamation mark in: ${text}`).not.toContain('!')
  expect(text, `an unfilled name in: ${text}`).not.toContain('{name}')
}

/**
 * The narrator and the book share no sentence: he extends the book's
 * image by one beat and never restates it (`plan/VOICE.md`, "What he
 * may not say"). Sentences are split on a terminator and compared
 * whole, lower-cased.
 */
const assertNoSharedSentence = async (book: Locator, spoken: Locator): Promise<void> => {
  const sentences = (text: string): readonly string[] =>
    text
      .split(/(?<=[.?!])\s+/u)
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.length > 0)
  const printed = sentences(await book.innerText())
  const said = sentences(await spoken.innerText())
  const shared = said.filter((s) => printed.includes(s))
  expect(shared, `restated by the narrator: ${shared.join(' | ')}`).toEqual([])
}

/**
 * A folio, a rule id or a reading id: what a citation looks like, and
 * what the play surface must not show until SOURCE is tapped
 * (`VISION.md`: "Citations exist for everything and sit behind a tap,
 * never on the play surface beside a sentence a player is reading").
 */
const CITATION = /5T a[12]|MH p\.|\bR\d\d\b|\bI-\d\d\b/u

/** Every narrator element on the page, by the suffix the component gives its name. */
const narratorNames = (page: Page) => page.getByTestId(/narrator-name$/)

// ------------------------------------------------------- the opening

/**
 * MH p.84: "Call/Incident: an event that changes the balance of the
 * world and involves the protagonist... Climax: the turning point of
 * the first act, representing the abandonment of the Ordinary World."
 * Phase 10b: the village is the Call, the trail is the Point of No
 * Return and the first deed.
 */
test('the Call comes before the beat, and the trail is the point of no return', async ({ page }) => {
  const state = await open(page, readingTheCall)
  await expect(page.getByTestId('village')).toBeVisible()
  await expect(page.getByTestId('beat')).toHaveCount(0)
  const call = page.getByTestId('call')
  await expect(call).toContainText(t('ui.village.call.title'))
  // The premise as 5T a1 prints it, upright, from the adventure file.
  await expect(call).toContainText(theFiveTreasuresMeta.premise)
  await assertSpoken(page, 'call-narrator', spoken('call', state))
  await assertNoSharedSentence(call.getByText(theFiveTreasuresMeta.premise), page.getByTestId('call-narrator-line'))

  await page.getByTestId('village-go').click()
  await expect(page.getByTestId('beat')).toBeVisible()
  // The trail lands on the start area, which the village record already
  // stands in: the beat is the same area before and after the trail.
  await expect(page.getByTestId('area-name')).toHaveText(areaName(state))
  await expect(page.getByText(fill(t('ui.deeds'), { n: 1 }))).toBeVisible()
})

/**
 * MH p.85: "the Incident can be generated from the 'Adventures' table".
 * Phase 10j: a hook from that table is the Master's own story, printed
 * on RECORD under the Master, and nowhere on the play surface, because
 * a motive is not a result.
 */
test('the Master has a reason to be on the mountain, and it is theirs, not a slip', async ({ page }) => {
  const state = await open(page, withAMotive)
  const hook = adventureHookById(HOOK)
  if (hook === undefined) throw new Error(`no hook ${HOOK}`)
  expect(state.sheet.motive?.text).toBe(hook.text)

  await button(page, /RECORD/).click()
  await expect(page.getByTestId('record-motive')).toHaveText(hook.text)
  // Back to the village, then onto the mountain: the beat does not carry it.
  await button(page, /RECORD/).click()
  await page.getByTestId('village-go').click()
  await expect(page.getByTestId('beat')).toBeVisible()
  await expect(page.getByTestId('beat')).not.toContainText(hook.text)
})

// ---------------------------------------------------- the two voices

/**
 * Every Event the beat can land on, and a flight, each with the book's
 * row upright and the narrator's line italic under his name, the two
 * never sharing a sentence (`VISION.md`, "The two voices").
 *
 * The query names, in order: a 4 (Safe exploration) into the Cave
 * entrance; a 6 (Hint) back onto the mountain; a 1 (Ambush!) into the
 * entrance and its creature on a 2 (Ogre), fled from at once; then a 2
 * (Encounter) onto the mountain and its creature on a 6 (Junior King).
 * The Ambush and the Encounter each leave a foe standing, which is why
 * the Ambush is fled: the exits stay shut while someone is in the room.
 */
test('every result prints the book upright and Old Ping italic, and neither restates the other', async ({
  page,
}) => {
  const state = await open(page, onTheMountain, '?dice=4,6,1,2,2,6')
  const description = page.getByTestId('area-description')
  const line = page.getByTestId('result-narrator-line')

  // The area itself: the description as 5T a1 prints it, and his line
  // for standing in it (`areas.json`, `line`).
  const mountain = theFiveTreasuresAreaById(state.cave.area)
  if (mountain === undefined) throw new Error('no start area')
  await expect(description).toHaveText(mountain.description)
  await expect(description).toHaveCSS('font-style', 'normal')
  await assertSpoken(page, 'area-narrator', fill(mountain.line, { name: state.sheet.name }))
  await assertNoSharedSentence(description, page.getByTestId('area-narrator-line'))

  // Safe exploration.
  await go(page, /TO THE CAVE ENTRANCE/)
  await expect(page.getByTestId('result-total')).toHaveText('Safe exploration') // 5T a1, Event table
  await assertSpoken(page, 'result-narrator', spoken('turn.safe', state))
  await assertNoSharedSentence(description, line)

  // A Hint.
  await go(page, /TO THE FLAT-TOP MOUNTAIN/)
  await expect(page.getByTestId('result-total')).toHaveText('Hint') // 5T a1, Event table
  await assertSpoken(page, 'result-narrator', spoken('turn.hint', state))
  await assertNoSharedSentence(description, line)

  // An Ambush, and the flight from it. The Ogre it brought is what he
  // speaks about, not the row: `lib/narrator.ts` reads who was met
  // before the Event's own name, so `turn.ambush` is only ever spoken
  // for an ambush by nobody (filed in `plan/CRITIQUE.md`).
  await go(page, /TO THE CAVE ENTRANCE/)
  await expect(page.getByTestId('result-total')).toHaveText('Ambush!') // 5T a1, Event table
  await assertSpoken(page, 'result-narrator', spoken('turn.encounter', state))
  await assertNoSharedSentence(description, line)
  await button(page, /^FACE /).first().click()
  await expect(page.getByTestId('combat')).toBeVisible()
  await button(page, t('ui.combat.leave.flee')).click()
  await expect(page.getByTestId('beat')).toBeVisible()
  // MH p.30: "suffer a last blow and subtract 2 points from your
  // ENDURANCE. Score 1 Dishonor Point".
  await expect(page.getByTestId('result')).toContainText(
    fill(t('ui.result.flee.against'), { after: state.sheet.endurance - 2, dishonor: 1 }),
  )
  await assertSpoken(page, 'result-narrator', spoken('flee', state))

  // An Encounter.
  await go(page, /TO THE FLAT-TOP MOUNTAIN/)
  await expect(page.getByTestId('result-total')).toContainText('Encounter') // 5T a1, Event table
  await assertSpoken(page, 'result-narrator', spoken('turn.encounter', state))
  await assertNoSharedSentence(description, line)
})

/**
 * The citation is a promise kept for whoever asks, never noise beside
 * the sentence being read (`VISION.md`; `components/Source.tsx`).
 */
test('the play surface carries no citation until SOURCE is tapped', async ({ page }) => {
  await open(page, onTheMountain, '?dice=4')
  await go(page, /TO THE CAVE ENTRANCE/)
  const beat = page.getByTestId('beat')
  await expect(beat).not.toContainText(CITATION)
  for (const source of ['area-source', 'result-source']) {
    await expect(page.getByTestId(source)).toHaveText(t('ui.source'))
  }
  await page.getByTestId('area-source').click()
  await expect(page.getByTestId('area-source')).toContainText(CITATION)
  await page.getByTestId('area-source').click()
  await expect(page.getByTestId('area-source')).toHaveText(t('ui.source'))
  await expect(beat).not.toContainText(CITATION)
})

// ----------------------------------------------------------- the acts

/**
 * MH p.82: "Each act ends with a climax... a point of no return to a
 * new act." Phase 10c: the slip once per rung, the outline always.
 */
test('the page turns to act 2 once, and the outline remembers', async ({ page }) => {
  const state = await open(page, onTheMountain, '?dice=4,4')
  // A seeded record has announced nothing yet, so act 1 is on the beat.
  await expect(page.getByTestId('act-name')).toHaveText(act(1).name.toUpperCase())
  await page.getByTestId('act-slip').click()
  await expect(page.getByTestId('act-slip')).toHaveCount(0)

  await go(page, /TO THE CAVE ENTRANCE/)
  await expect(page.getByTestId('act-name')).toHaveText(act(2).name.toUpperCase())
  await expect(page.getByTestId('act-line')).toHaveText(fill(act(2).line, { name: state.sheet.name }))
  const said = await page.getByTestId('act-line').innerText()
  expect(said).not.toMatch(BANNED.table)
  expect(said).not.toMatch(BANNED.secondPerson)
  await page.getByTestId('act-slip').click()
  await expect(page.getByTestId('act-slip')).toHaveCount(0)

  await go(page, /TO THE FLAT-TOP MOUNTAIN/)
  await expect(page.getByTestId('act-slip')).toHaveCount(0)
  await expect(page.getByTestId('act-mark')).toBeVisible()
})

/**
 * MH p.84: the book's own example of its own pacing rule, at this very
 * door. Phase 10c reads the quiet roll as an Encounter and says so,
 * with the face that was rolled, beside the book's sentence.
 */
test('at the boss door the story outranks the dice, in the open', async ({ page }) => {
  // A 4 is Safe exploration on the printed table; a 1 is the quarter's
  // creature, the Senior King (5T a1).
  const state = await open(page, atThePaperDoor, '?dice=4,1')
  await go(page, /TO THE CHIEFTAIN QUARTER/)
  await expect(page.getByTestId('momentum')).toContainText(t('ui.momentum.line'))
  await expect(page.getByTestId('momentum-rolled')).toHaveText(
    fill(t('ui.momentum.rolled'), { face: 4, was: 'Safe exploration' }),
  )
  await assertSpoken(page, 'result-narrator', spoken('turn.encounter', state))
})

// ---------------------------------------------------------- the fight

/**
 * MH p.6: "if it reaches zero, the Master dies or becomes unconscious."
 * Phase 10d: the fall is a moment on the screen, not a number reaching
 * zero in a strip.
 */
test('a fall is a scene, not a number', async ({ page }) => {
  const state = await open(page, struckDown)
  expect(state.sheet.endurance).toBe(0)
  await expect(page.getByTestId('combat')).toBeVisible()
  await expect(page.getByTestId('attr-endurance')).toHaveText('0')
  const fallen = page.getByTestId('fallen')
  await expect(page.getByTestId('fallen-title')).toHaveText(t('ui.combat.fallen.master'))
  await expect(fallen).toContainText(t('ui.combat.fallen.master.line'))
  await assertSpoken(page, 'fallen-narrator', spoken('down', state))
})

// -------------------------------------------------- the player's words

/**
 * MH p.3: "the story comes from your imagination". Phase 10j: the app
 * asks at four moments, in its own voice, and never requires an
 * answer; a kept passage stands in the chronicle where it was written.
 */
const prompt = (moment: PromptMoment): string => {
  const found = promptFor(moment)
  if (found === undefined) throw new Error(`no prompt for ${moment}`)
  return found.text
}

test('a treasure in the hand is a question, the answer is optional, and it lands in the story', async ({
  page,
}) => {
  await open(page, inTheStorageRoom)
  await button(page, /TAKE THE GOLD AND RED GOURD/).click()
  await expect(page.getByTestId('passage-prompt')).toHaveText(prompt('treasure'))
  // Nothing waits on the answer: the exits are open.
  await expect(button(page, /TO THE CAVE ENTRANCE/)).toBeEnabled()
  const passage = 'It is heavier than a gourd should be.'
  await page.getByTestId('passage').fill(passage)
  await page.getByText(t('ui.passage.keep')).click()
  await expect(page.getByTestId('passage-prompt')).toHaveCount(0)

  await button(page, /RECORD/).click()
  const chronicle = await page.getByTestId('record-chronicle').innerText()
  const room = theFiveTreasuresAreaById(inTheStorageRoomArea)
  if (room === undefined) throw new Error('no storage room')
  expect(chronicle.indexOf(room.name.toUpperCase())).toBeGreaterThanOrEqual(0)
  expect(chronicle.indexOf(passage)).toBeGreaterThan(chronicle.indexOf(room.name.toUpperCase()))
})

/** The Storage room's id, read off the scene rather than typed twice. */
const inTheStorageRoomArea = (() => {
  const last = [...inTheStorageRoom.actions].reverse().find((a) => a.type === 'cave.go')
  if (last === undefined || last.type !== 'cave.go') throw new Error('inTheStorageRoom makes no move')
  return last.to
})()

test('a kill is a question too, asked on the beat the fight left', async ({ page }) => {
  // Two won rounds on 6,5 against 1,1, each worth 11 against the
  // Beast's printed 13; the Beast's LOOT line names the key and rolls
  // nothing. The Beast rather than the Ghost because R77 closes an
  // ordinary blow against a spirit (MH p.66; Phase 10l).
  await open(page, facingTheBeast, '?dice=6,5,1,1,6,5,1,1')
  await button(page, 'ROLL THE ROUND').click()
  await page.getByTestId('act-strike').click()
  await button(page, 'ROLL THE ROUND').click()
  await page.getByTestId('act-strike').click()
  await page.getByTestId('act-loot').click()
  await page.getByTestId('act-go-on').click()
  await expect(page.getByTestId('beat')).toBeVisible()
  await expect(page.getByTestId('passage-prompt')).toHaveText(prompt('kill'))
})

// ------------------------------------------------------ the chronicle

/**
 * Phase 10h: RECORD tells the adventure so far, a running head per
 * room in the order the rooms were entered.
 */
test('the chronicle tells the whole cave in the order it was walked', async ({ page }) => {
  await open(page, atTheEndingsDoor)
  await button(page, /RECORD/).click()
  const chronicle = await page.getByTestId('record-chronicle').innerText()
  // The rooms in the order the scene entered them, from the scene itself.
  const entered = atTheEndingsDoor.actions
    .filter((a): a is { readonly type: 'cave.go'; readonly to: string } => a.type === 'cave.go')
    .map((a) => theFiveTreasuresAreaById(a.to)?.name.toUpperCase() ?? a.to)
  const positions = entered.map((name) => chronicle.indexOf(name))
  expect(positions.every((p) => p >= 0), `rooms missing from: ${chronicle}`).toBe(true)
  expect(positions).toEqual([...positions].sort((a, b) => a - b))
})

// --------------------------------------------------------- the ending

/**
 * MH p.87: "a joyful jump and a freeze frame with the closing credits";
 * MH p.34: four scores of 1 to 3, Dishonor subtracted; MH p.88: "which
 * figure in the shadows was pulling the strings of the boss you just
 * defeated?" Phase 10i: THE ENDING stands on the beat only once the
 * ending act is satisfied, and the screen it opens is the summing-up.
 */
test('the ending is a freeze frame and a summing-up, reached only with five treasures', async ({
  page,
}) => {
  await open(page, onTheMountain)
  await expect(button(page, t('ui.ending.title'))).toHaveCount(0)
})

test('the ending scores the adventure as arithmetic, banks once, and asks the book’s question', async ({
  page,
}) => {
  const state = await open(page, atTheEndingsDoor)
  expect(state.cave.treasures).toHaveLength(5)
  // The last act is announced on the beat, once, in his voice.
  await expect(page.getByTestId('act-name')).toHaveText(act(5).name.toUpperCase())
  await expect(page.getByTestId('act-line')).toHaveText(fill(act(5).line, { name: state.sheet.name }))
  await page.getByTestId('act-slip').click()

  await button(page, t('ui.ending.title')).click()
  const ending = page.getByTestId('ending')
  await expect(ending).toBeVisible()
  await expect(page.getByTestId('freeze-name')).toHaveText(state.sheet.name.toUpperCase())
  await expect(page.getByTestId('freeze-dishonor')).toHaveText(
    fill(t('ui.ending.freeze.dishonor'), { n: state.sheet.dishonor }),
  )

  // Blank until given: a dash per score, the note, and BANK disabled.
  await expect(page.getByTestId('xp-sum')).toHaveText(
    fill(t('ui.ending.xp.sum'), { a: '-', b: '-', c: '-', d: '-', dishonor: state.sheet.dishonor, total: 0 }),
  )
  await expect(ending).toContainText(t('ui.ending.xp.incomplete'))
  await expect(page.getByTestId('xp-bank')).toBeDisabled()

  // The four scores, given as the book's worked example gives them
  // (MH p.35: 2, 3, 1, 3), addressed by the category's first word as
  // the screen builds its ids.
  const given = [2, 3, 1, 3] as const
  for (const [i, category] of XP_CATEGORIES.entries()) {
    const value = given[i]
    if (value === undefined) throw new Error('four categories, four scores')
    await page.getByTestId(`score-${category.split(' ')[0] ?? ''}-${String(value)}`).click()
  }
  const total = given.reduce((sum, v) => sum + v, 0) - state.sheet.dishonor
  await expect(page.getByTestId('xp-sum')).toHaveText(
    fill(t('ui.ending.xp.sum'), {
      a: given[0],
      b: given[1],
      c: given[2],
      d: given[3],
      dishonor: state.sheet.dishonor,
      total,
    }),
  )

  // Banked once, and then there is nothing to bank.
  await page.getByTestId('xp-bank').click()
  await expect(page.getByTestId('xp-banked')).toHaveText(fill(t('ui.ending.xp.banked'), { n: total }))
  await expect(page.getByTestId('xp-bank')).toHaveCount(0)

  // The book's closing question, verbatim (MH p.88), upright, its
  // citation folded and naming the folio when asked.
  const question = page.getByTestId('ending-question')
  await expect(question).toContainText(
    'Which figure in the shadows was pulling the strings of the boss you just defeated?',
  )
  await expect(question.getByRole('button', { name: t('ui.source') })).toBeVisible()
  await question.getByRole('button', { name: t('ui.source') }).click()
  await expect(question).toContainText(t('ui.ending.question.cite'))

  // His last word was act 5's slip on the beat; the screen after it is
  // not his (plan/VOICE.md, "Where he speaks").
  await expect(narratorNames(page)).toHaveCount(0)
})

/**
 * `VISION.md`, "The two voices": the book's text is upright, always;
 * italic is the narrator's mark. The closing question is the book's
 * (MH p.88) and the ending sets it in italic. Filed in
 * `plan/CRITIQUE.md`; this test turns green when the style does.
 */
test('the book’s closing question is set upright, not in the narrator’s italic', async ({ page }) => {
  test.fail(true, 'plan/CRITIQUE.md: the ending sets the book’s closing question in italic')
  await open(page, atTheEndingsDoor)
  await page.getByTestId('act-slip').click()
  await button(page, t('ui.ending.title')).click()
  await expect(page.getByTestId('ending-question').getByText(t('ui.ending.question'))).toHaveCSS(
    'font-style',
    'normal',
  )
})

// -------------------------------------------------------- his silence

/**
 * plan/VOICE.md, "Where he speaks": "He does not speak on the title
 * page, on ABOUT, on RULES, on RECORD, or in creation."
 */
test('the narrator is silent where the guide says he is silent', async ({ page }) => {
  await open(page, atTheRules)
  await expect(page.getByText('RULES, READINGS AND INVENTIONS')).toBeVisible()
  await expect(narratorNames(page)).toHaveCount(0)
})

test('the narrator is silent on RECORD and ABOUT', async ({ page }) => {
  await open(page, atTheRecord)
  await expect(page.getByTestId('record')).toBeVisible()
  await expect(narratorNames(page)).toHaveCount(0)
  await button(page, /ABOUT/).click()
  await expect(page.getByTestId('about')).toBeVisible()
  await expect(narratorNames(page)).toHaveCount(0)
})

test('the narrator is silent on the title page and in creation', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('title-start')).toBeVisible()
  await expect(narratorNames(page)).toHaveCount(0)
  await page.getByTestId('title-start').click()
  await expect(page.getByTestId('title-start')).toHaveCount(0)
  await expect(narratorNames(page)).toHaveCount(0)
})

// ------------------------------------------------- the fight as the book runs it

/**
 * MH p.23 (R26): "The combat continues until: You succeed in landing a
 * Final Blow; Your opponent's or your ENDURANCE points reach zero; An
 * Unexpected Event occurs." A lost exchange is none of the three, and
 * until Phase 10k the app answered a lost exchange with FLEE alone.
 */
test('a lost exchange is followed by another, not by FLEE alone', async ({ page }) => {
  const state = await open(page, facingTheBeast, '?dice=1,1,6,6,6,6,1,1')
  await button(page, t('ui.combat.primary.roll')).click()
  // The round was lost: the ENDURANCE moved and the banner says behind.
  await expect(page.getByTestId('attr-endurance')).not.toHaveText(String(state.sheet.endurance))
  await expect(page.getByTestId('combat')).toContainText(t('ui.combat.banner.behind'))
  // The two controls the critique row said were the whole menu.
  await expect(button(page, t('ui.combat.leave.flee'))).toBeEnabled()
  await expect(button(page, t('ui.combat.primary.roll'))).toBeEnabled()
  // And the next exchange is rolled, and won.
  await button(page, t('ui.combat.primary.roll')).click()
  await expect(page.getByTestId('combat')).toContainText(t('ui.combat.banner.ahead'))
  await expect(page.getByTestId('act-strike')).toBeEnabled()
})

/**
 * MH p.23: "you can do one of the following: ... Use one of the
 * Techniques you know". One of them, chosen; not the first the sheet
 * happens to list. MH p.24's advice prints under the row, upright,
 * because it is the designer's and not the narrator's (VISION.md).
 */
test('a Master who knows more than one Technique chooses, with the book’s warning beside it', async ({
  page,
}) => {
  await open(page, facingTheGhost, '?dice=6,5,1,1')
  await button(page, t('ui.combat.primary.roll')).click()
  const row = page.getByTestId('act-technique')
  await expect(row).toBeEnabled()
  // MH p.24, transcribed, on the fight's own screen.
  await expect(page.getByTestId('technique-warning')).toHaveText(t('ui.combat.act.technique.warning'))
  // Closed, the row counts what is on offer; opened, it lists them.
  await expect(page.getByTestId('act-technique-0')).toHaveCount(0)
  await row.click()
  const first = page.getByTestId('act-technique-0')
  const second = page.getByTestId('act-technique-1')
  await expect(first).toBeVisible()
  await expect(second).toBeVisible()
  // Each row carries its own cost, so the choice is a priced one.
  await expect(first).not.toHaveText(await second.innerText())
  // Taking one spends its ENDURANCE and closes the round.
  await first.click()
  await expect(page.getByTestId('technique-line')).toBeVisible()
})

/**
 * MH p.28, footnote: "To streamline combat while maintaining the idea
 * of a chaotic scene, you can consider Minions with ENDURANCE=1; if you
 * hit you can remove one minion." The book's one optional rule, and the
 * build's first switch of any kind: offered on a crowd, off until it is
 * taken, and remembered in the ledger once it is.
 */
test('MINIONS AT 1 is offered on a band, off, and the ledger remembers it', async ({ page }) => {
  await open(page, facingThreeServants, '?dice=5,5,2,2,2,2,2,2')
  await expect(page.getByTestId('band')).toBeVisible()
  const row = page.getByTestId('act-minions')
  await expect(row).toContainText(t('ui.combat.act.minions.off'))
  await row.click()
  await expect(row).toContainText(t('ui.combat.act.minions.on'))
  // The cards keep their printed ENDURANCE and say they are read at 1.
  await expect(page.getByTestId('band')).toContainText(t('ui.combat.band.minion'))
  // A won exchange by two removes a body that prints more than two.
  await button(page, t('ui.combat.primary.roll')).click()
  await page.getByTestId('act-strike').click()
  await expect(page.getByTestId('band')).toContainText(t('ui.combat.band.down'))
  await button(page, /RECORD/).click()
  await expect(page.getByTestId('record-deeds')).toContainText(t('ui.deed.minions'))
})

/**
 * A duel offers no such row: the footnote is about crowds, and a rule
 * that appears where it cannot apply is a rule the player has to learn
 * to ignore.
 */
test('MINIONS AT 1 is not offered in a duel', async ({ page }) => {
  await open(page, facingTheGhost)
  await expect(page.getByTestId('combat')).toBeVisible()
  await expect(page.getByTestId('act-minions')).toHaveCount(0)
})

/**
 * MH p.23 has the player subtract the difference from the opponent's
 * ENDURANCE, and MH p.68 (R78) compares a d6 against it; 5T a2 and
 * MH p.70-79 print it on every block. So the number has to be on the
 * card while the round is being read, not only before it is rolled -
 * before this it lived in the card's idle line and the first roll
 * replaced it.
 */
test('an opponent’s card keeps its ENDURANCE through the round, over what it prints', async ({
  page,
}) => {
  const state = await open(page, facingTheBeast, '?dice=6,5,1,1')
  const printed = state.combat?.foes[0]?.endurance
  if (printed === undefined) throw new Error('no body in the seeded fight')
  const card = page.getByTestId('endurance-theirs')
  await expect(card).toHaveText(
    fill(t('ui.combat.theirs.endurance'), { now: printed, printed }),
  )
  // Rolled: the idle line is gone and the number is not.
  await button(page, t('ui.combat.primary.roll')).click()
  await expect(card).toHaveText(
    fill(t('ui.combat.theirs.endurance'), { now: printed, printed }),
  )
  // Struck: what is left moves, what it prints does not.
  await page.getByTestId('act-strike').click()
  await expect(card).not.toHaveText(
    fill(t('ui.combat.theirs.endurance'), { now: printed, printed }),
  )
  await expect(card).toContainText(String(printed))
})

// -------------------------------------------------------- spirits (R77)

/**
 * MH p.66: "Sometimes you will face spirits or ghosts, incorporeal
 * beings immune to traditional weapons or blows; you will need to use a
 * technique, ritual, or exceptional weapon to defeat them." Reading
 * I-29 tags the Dexterous Ghost as one. Phase 10g built this gate and
 * reverted it, because with no Technique doing damage the cave was
 * unfinishable; Phase 10l ships the damage first and the gate second.
 */
test('a spirit refuses an ordinary blow, and says so in the book’s words', async ({ page }) => {
  await open(page, facingTheGhost, '?dice=6,5,1,1')
  await button(page, t('ui.combat.primary.roll')).click()
  // The round was won, so the winner's options are on offer.
  await expect(page.getByTestId('combat')).toContainText(t('ui.combat.banner.ahead'))
  // The rule stands on the screen, not only inside a dead row.
  await expect(page.getByTestId('spirit-banner')).toHaveText(t('ui.combat.spirit.banner'))
  await expect(page.getByTestId('spirit')).toContainText(t('ui.combat.spirit.refused'))
  // The two ordinary blows are closed; everything else is open.
  await expect(page.getByTestId('act-strike')).toBeDisabled()
  await expect(page.getByTestId('act-technique')).toBeEnabled()
  await expect(page.getByTestId('act-opening')).toBeEnabled()
})

/**
 * And the way through: a Technique whose printed effect is a blow does
 * the exchange's difference (I-65), so a bare-handed Master takes the
 * Dexterous Ghost's key and the private quarter opens. This is the
 * scenario the reverted gate could not survive.
 */
test('a Technique is the way through a spirit, bare-handed', async ({ page }) => {
  await open(page, facingTheGhost, '?dice=6,5,1,1')
  await button(page, t('ui.combat.primary.roll')).click()
  // San Te knows two Techniques that work inside a round, so the row is
  // a chooser; Rising Wave Strike is the blow among them.
  await page.getByTestId('act-technique').click()
  const rising = page.getByRole('button', { name: /RISING WAVE STRIKE/ })
  await rising.click()
  // The body is down: the fight is over and the loot row stands.
  await expect(page.getByTestId('fallen-title')).toContainText('DEXTEROUS GHOST')
  await page.getByTestId('act-loot').click()
  await page.getByTestId('act-go-on').click()
  await expect(page.getByTestId('beat')).toBeVisible()
  await button(page, /RECORD/).click()
  await expect(page.getByTestId('record-deeds')).toContainText("private quarter's key")
  await expect(page.getByTestId('record-deeds')).toContainText('killed dexterous ghost')
})
