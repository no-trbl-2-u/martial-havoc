/**
 * The Unexpected Event, and the Morale roll on its retreat rows
 * (MH p.27-28, R32-R33; spec.md sealed rules).
 *
 * R32 fires on a draw: "When the final result of an attack roll ends in
 * a draw ... an Unexpected Event occurs ... After an Unexpected Event,
 * you are no longer in the combat phase." Two consequences the concept
 * (`docs/rules/combat.md`) is explicit about:
 *
 * - The **trigger** is mechanical; the **resolution** is not. Nine of
 *   the eleven rows have no stated mechanical effect, and reading I-30
 *   supplies the minimum ones the operator may set. This module carries
 *   I-30's readings so a caller can apply them without re-deriving them,
 *   and labels them `reading`.
 * - The 2d6 table is rolled only "if the ongoing narrative does not make
 *   the event clear". So {@link unexpectedEvent} is a roll a caller may
 *   skip, never one the round forces.
 *
 * `spec.md` seals one addition: **the retreat rows roll Morale.** The
 * table is 1-3 flee, 4-5 cautious retreat, 6 rally +1d6. It is an
 * invention of this build, not a printed rule, and reopening it is a
 * `/re-seed`.
 */
import { d6, twoD6 } from '../dice/rolls'
import type { Die, DiceSource } from '../dice/types'

/** Where the 2d6 landed on the Unexpected Event table (R32). */
export type UnexpectedEventRoll = {
  readonly a: Die
  readonly b: Die
  /** 2-12: the address of the row in `rules/unexpected-events.json`. */
  readonly total: number
}

/**
 * Roll the Unexpected Event table (R32).
 *
 * Returns the address, not the row: the text lives in the content
 * package and is looked up with `rollUnexpectedEvent(total)`. That is
 * what lets Phase 5 hand an adventure's own table to the same roll.
 */
export const unexpectedEvent = (dice: DiceSource): UnexpectedEventRoll => {
  const roll = twoD6(dice)
  return { a: roll.a, b: roll.b, total: roll.total }
}

/** What the Morale roll decided (sealed: spec.md). */
export type Morale =
  /** 1-3: the opponent breaks and runs. */
  | { readonly result: 'flee'; readonly face: Die }
  /** 4-5: a fighting withdrawal - the opponent leaves, but on its terms. */
  | { readonly result: 'cautious-retreat'; readonly face: Die }
  /** 6: the opponent rallies, and `reinforcements` more arrive (+1d6). */
  | {
      readonly result: 'rally'
      readonly face: Die
      readonly reinforcements: Die
    }

/**
 * Roll Morale on an Unexpected Event retreat row (sealed: spec.md).
 *
 * Called only for the rows the content package flags `retreatRow` - the
 * two Enemy-retreat rows, totals 4 and 10. Draws one d6, and a second
 * one only on a rally (the +1d6 reinforcements), so a caller scripting
 * dice supplies two faces for a 6 and one otherwise.
 */
export const morale = (dice: DiceSource): Morale => {
  const face = d6(dice)
  if (face <= 3) return { result: 'flee', face }
  if (face <= 5) return { result: 'cautious-retreat', face }
  return { result: 'rally', face, reinforcements: d6(dice) }
}

/**
 * Reading I-30's minimum mechanical effect for a row that states none.
 *
 * "Every one is the operator's to set" - these are the floor, not the
 * ceiling, and the whole set is labelled `reading` in `./behaviours.ts`.
 * Rows 6 and 8 state their own effect; rows 4 and 10 are the retreat
 * rows, which resolve through {@link morale}.
 */
export type EventReading =
  /** 2, 12: divine intervention - narrative, plus an Oracle roll (R34). */
  | { readonly kind: 'divine-intervention'; readonly favourable: boolean }
  /** 3, 11: injury (-1d6 ENDURANCE) or loss of weapon, the operator's pick. */
  | { readonly kind: 'injury-or-weapon-loss'; readonly target: 'master' | 'opponent' }
  /** 5, 9: environmental change - narrative, plus an Oracle roll. */
  | { readonly kind: 'environmental-change' }
  /** 4, 10: the opponent leaves; resolve with {@link morale}. */
  | { readonly kind: 'retreat' }
  /** 7: reinforcements, 1-4 Minions of the same type (R33, I-33). */
  | { readonly kind: 'reinforcements' }
  /** 6, 8: the row says what happens. */
  | { readonly kind: 'fight-resumes' }

/**
 * I-30's reading for a 2d6 total, as a total function.
 *
 * The row's *text* still comes from the content package; this is only
 * the mechanical floor to apply alongside it. An address outside 2-12
 * returns `undefined` rather than throwing - refusing to answer is a
 * flag, never an exception (spec.md, Refusals).
 */
export const eventReading = (total: number): EventReading | undefined => {
  switch (total) {
    case 2:
      return { kind: 'divine-intervention', favourable: false }
    case 3:
      return { kind: 'injury-or-weapon-loss', target: 'master' }
    case 4:
    case 10:
      return { kind: 'retreat' }
    case 5:
    case 9:
      return { kind: 'environmental-change' }
    case 6:
    case 8:
      return { kind: 'fight-resumes' }
    case 7:
      return { kind: 'reinforcements' }
    case 11:
      return { kind: 'injury-or-weapon-loss', target: 'opponent' }
    case 12:
      return { kind: 'divine-intervention', favourable: true }
    default:
      return undefined
  }
}

/**
 * How many Minions row 7's "1-4" means, on a d6 (R33, I-33).
 *
 * There is no d4 in a d6-only game. I-33's reading: 1-2 -> 1, 3 -> 2,
 * 4 -> 3, 5-6 -> 4. The Minions rule itself is optional (R33), so this
 * is called only when the operator has it switched on.
 */
export const minions = (dice: DiceSource): { readonly face: Die; readonly count: number } => {
  const face = d6(dice)
  const count = face <= 2 ? 1 : face === 3 ? 2 : face === 4 ? 3 : 4
  return { face, count }
}

/**
 * The injury reading's damage: -1d6 ENDURANCE (I-30).
 *
 * Separate from {@link eventReading} because the reading names the die
 * but the operator decides whether to apply injury or weapon loss; only
 * the injury branch rolls.
 */
export const injuryDamage = (dice: DiceSource): Die => d6(dice)
