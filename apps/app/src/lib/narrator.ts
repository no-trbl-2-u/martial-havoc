/**
 * Which line the narrator speaks, and when he says nothing.
 *
 * Phase 10a. `packages/content` holds *what* Old Ping says
 * (`data/app/result-lines.json`, one record per moment) and
 * `plan/VOICE.md` holds *how*. This module holds the third thing:
 * **which moment a given result is**. It is pure — a `Result` and a
 * name in, a string or null out — so the mapping is unit-testable
 * without rendering anything, and so a screen can never grow its own
 * private idea of when the narrator speaks.
 *
 * Two rules shape it:
 *
 * 1. **The moment vocabulary is closed.** {@link NARRATOR_MOMENTS} is
 *    the exhaustive list, and `narrator.test.ts` asserts it matches the
 *    content file exactly in both directions. A line with no moment is
 *    content that can never print; a moment with no line is a screen
 *    that would fall silent without anyone noticing. Both are red.
 * 2. **Silence is a real answer.** `null` means the narrator does not
 *    speak here, and it is the honest result for a `note` — a note is
 *    already the app in its own words, and VOICE.md forbids him
 *    restating a line that has just been printed.
 */
import { narratorLineFor } from '@martial-havoc/content'
import { fill } from './fill'
import type { Result } from '../state/types'

/**
 * Every moment the app can narrate, in the order a playthrough meets
 * them: the Call in the village (Phase 10b), the two checks, the Event
 * on entering an area, what a body or a rescue gave, a treasure lifted,
 * a night's rest, and the three ways a fight ends.
 *
 * `call` is the one moment that is not a `Result`. It belongs to a
 * screen rather than to something that happened, so `momentOf` never
 * returns it and the village screen names it directly.
 *
 * This constant is the contract between the screens and the content
 * package. Adding a moment means adding it here *and* writing its line;
 * the test refuses either one alone.
 */
export const NARRATOR_MOMENTS: readonly string[] = Object.freeze([
  'call',
  'check.skill.passed',
  'check.skill.failed',
  'check.luck.passed',
  'check.luck.failed',
  'turn.safe',
  'turn.nothing',
  'turn.hint',
  'turn.encounter',
  'turn.ambush',
  'take',
  'rest',
  'loot.item',
  'loot.treasure',
  'loot.key',
  'loot.hint',
  'loot.gift',
  'kill',
  'flee',
  'down',
])

/**
 * How a fight ended, as a moment.
 *
 * `final-blow` and `opponent-down` are the same moment to a listener —
 * the thing stops moving — and the difference between them is a rule,
 * which VOICE.md forbids him from mentioning anyway. A fight that has
 * not ended, or that ended on an Unexpected Event (the tie the table
 * resolves, which prints its own line already), is silence.
 */
export const momentOfFightEnd = (
  reason: 'final-blow' | 'master-down' | 'opponent-down' | 'unexpected-event',
): string | null => {
  switch (reason) {
    case 'final-blow':
    case 'opponent-down':
      return 'kill'
    case 'master-down':
      return 'down'
    case 'unexpected-event':
      return null
  }
}

/**
 * Which moment a beat result is, or null where he keeps quiet.
 *
 * The `turn` and `loot` branches mirror `components/beat/shown.ts`'s
 * own wording of the same result, deliberately and in the same order:
 * the slip's headline and the narrator's line must never disagree about
 * what happened. If one changes, the other is wrong.
 */
export const momentOf = (result: Result): string | null => {
  switch (result.kind) {
    case 'check':
      return `check.${result.check}.${result.success ? 'passed' : 'failed'}`
    case 'rest':
      return 'rest'
    case 'take':
      return 'take'
    case 'turn':
      // Mirrors `brought()`: who was met outranks the Event's own name,
      // because an Encounter row that brought nobody is, to a listener,
      // an empty room.
      if (result.foes.length > 0) return 'turn.encounter'
      if (result.hint) return 'turn.hint'
      if (result.event === 'ambush') return 'turn.ambush'
      if (result.event === 'safe') return 'turn.safe'
      return 'turn.nothing'
    case 'loot':
      // Mirrors `shown()`'s loot branch, in its order: a Hint is not an
      // object, a gift is not a body's, and a treasure is not an item.
      if (result.hint) return 'loot.hint'
      if (result.gift) return 'loot.gift'
      if (result.treasure !== null) return 'loot.treasure'
      if (result.key) return 'loot.key'
      return 'loot.item'
    case 'note':
      // A note is already the app speaking in its own words. He does not
      // say the same thing twice (VOICE.md, "What he may not say").
      return null
  }
}

/**
 * The narrator's line for a moment, with the Master's name filled in.
 *
 * Total in both directions: an unknown moment and a moment with no
 * record both give `null`, which every caller renders as nothing at
 * all. Never a placeholder, never a bracketed id — an unspoken line is
 * indistinguishable from a moment he was never given, and on screen
 * both should look like the same silence.
 */
export const narrate = (moment: string | null, name: string): string | null => {
  if (moment === null) return null
  const record = narratorLineFor(moment)
  return record === undefined ? null : fill(record.line, { name })
}

/** {@link narrate} for a beat result: the common case, in one call. */
export const narrateResult = (result: Result, name: string): string | null =>
  narrate(momentOf(result), name)
