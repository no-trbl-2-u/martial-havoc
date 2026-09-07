/**
 * The event roll: "roll every time you enter an area" (5T a1).
 *
 * The adventure format keeps this table in data, in the same `band`
 * shape the rulebook's own banded tables use, so an adventure that
 * wanted a different spread of faces would say so in its file and not
 * here. What this module fixes is the **vocabulary**: four kinds, named
 * by matching the row's printed text, because an engine that switched on
 * "Ambush!" as a string would break on the first adventure that printed
 * "Ambush" without the exclamation mark.
 */
import type { Band } from '@martial-havoc/content'
import type { Die, DiceSource } from '../dice/types'
import { d6 } from '../dice/rolls'

/**
 * What an event roll can mean.
 *
 * - `ambush`   — the area's encounter, and the enemy strikes first.
 * - `encounter`— the area's encounter, met face to face.
 * - `safe`     — nothing; the area may be explored.
 * - `hint`     — the area's grey paragraph is revealed (I-06b).
 */
export type EventKind = 'ambush' | 'encounter' | 'safe' | 'hint'

/**
 * The order the printed table runs in, lowest face first.
 *
 * The 5 Treasures prints exactly four rows in exactly this order, and
 * the format's own document says the event table is four rows. Matching
 * by position rather than by text is what keeps the engine free of the
 * adventure's wording.
 */
export const EVENT_KINDS: readonly EventKind[] = Object.freeze([
  'ambush',
  'encounter',
  'safe',
  'hint',
])

/** One event roll: the face, the row it landed on, and what it means. */
export type EventRoll = {
  readonly face: Die
  /** The row's printed text, for the screen ("Ambush!"). */
  readonly text: string
  readonly kind: EventKind
}

/** The rows of an event table in ascending order of their lowest face. */
const inOrder = (events: readonly Band[]): readonly Band[] =>
  [...events].sort((a, b) => Math.min(...a.totals) - Math.min(...b.totals))

/**
 * Read one face of an event table without rolling.
 *
 * Total: a face no row covers reads as `safe`, because an area the
 * adventure forgot to fill in is a quiet area, not a crash.
 */
export const eventFor = (events: readonly Band[], face: number): EventRoll => {
  const rows = inOrder(events)
  const index = rows.findIndex((row) => row.totals.includes(face))
  const row = rows[index]
  return {
    face: face as Die,
    text: row?.text ?? '',
    kind: EVENT_KINDS[index] ?? 'safe',
  }
}

/** Roll 1d6 on the adventure's event table (5T a1). */
export const rollEvent =
  (events: readonly Band[]) =>
  (dice: DiceSource): EventRoll =>
    eventFor(events, d6(dice))

/** True where the event brings the area's encounter (Event = 1, 2, 3). */
export const bringsEncounter = (kind: EventKind): boolean =>
  kind === 'ambush' || kind === 'encounter'

/**
 * The book's pacing rule, applied to one roll (MH p.84, R82).
 *
 * "If the result of the dice roll conflicts with the linear development
 * of the story, ignore the dice. Reach the plot point without lowering
 * the tension. For example, at the beginning of the third act, the
 * protagonist has defeated the generals guarding the room where the boss
 * resides and is opening the door; a roll on the Event table with Rest
 * result, although plausible, would slow down the momentum. Instead, let
 * the Encounter happen and prepare for the finale."
 *
 * Two things are deliberate here.
 *
 * **The face is kept.** The roll happened and the screen shows it; what
 * changes is what it is read as. Hiding the die and printing an
 * Encounter would make the book's instruction into a lie about the
 * dice, and the whole point of the rule is that the storyteller is
 * overruling them in the open.
 *
 * **A roll that already brings an encounter is returned untouched**, so
 * the override is only ever visible when it did something. An Ambush at
 * the boss's door is already the finale arriving; there is nothing to
 * force.
 *
 * *Where* the rule applies is not this function's business and not the
 * engine's: it is one adventure's judgement about one of its doors, and
 * it lives in that adventure's content
 * (`campaigns/the-5-treasures/momentum.json`).
 */
export const forMomentum = (event: EventRoll): EventRoll =>
  bringsEncounter(event.kind) ? event : { ...event, kind: 'encounter' }
