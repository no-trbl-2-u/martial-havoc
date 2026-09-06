/**
 * The Final Blow and the Technique it may become (MH p.25-26, R30-R31).
 *
 * Two rolls, and they are not the same kind of roll:
 *
 * 1. **The blow (R30).** After an Opening, 2d6; **doubles land it**
 *    (6 of 36). This is a doubles roll, not a check — so `spec.md`'s
 *    sealed rule cuts the other way here: a double six *lands* the blow
 *    rather than fumbling it.
 * 2. **The naming (R31).** A landed blow may be added to the Master's
 *    knowledge: roll against current LUCK; **on a failure lose 1 LUCK;
 *    on success assign it a value 1-4 and a description**. Reading I-12
 *    settles the ambiguity: R31 is self-contained, so there is **no**
 *    R21 decrement on success. `spec.md` seals that reading.
 *
 * The inspiration table (MH p.26) is exactly that — inspiration. The
 * book prints three orderings of one roll ("Destroying Palm of the
 * Turtle", "Palm of the Destroyer Turtle", "Deadly Palm of the
 * Destroyer Turtle"), so composing a name is the caller's. This module
 * returns the three words and stops.
 */
import { check, isDoubleSix } from '../checks/checks'
import type { CheckOutcome } from '../checks/checks'
import { twoD6 } from '../dice/rolls'
import type { TwoD6Roll } from '../dice/rolls'
import type { DiceSource } from '../dice/types'

/** The result of the 2d6 that decides whether the blow lands (R30). */
export type FinalBlowRoll = {
  readonly roll: TwoD6Roll
  /** Doubles land it — including double six (spec.md, sealed). */
  readonly landed: boolean
  /**
   * A Praying Mantis Master's landed blow kills (R13, I-25).
   *
   * Outcome only: the doubles roll itself is unchanged, which is what
   * I-25 settles. False on a blow that did not land.
   */
  readonly lethal: boolean
}

/** Who is throwing the blow, for the one style rule that changes its result. */
export type FinalBlowInput = {
  /**
   * True for a Praying Mantis Master, whose "finishing blow is always
   * lethal" (R13). Read from the style's `power`, never inferred here.
   */
  readonly alwaysLethal?: boolean
}

/**
 * Roll the Final Blow (R30). Only legal after an Opening (R29).
 *
 * The engine does not police the precondition — a caller that rolls
 * without an Opening has a bug in its round loop, and refusing here
 * would hide it behind a rule that the book does not state as a check.
 */
export const finalBlow =
  (input: FinalBlowInput = {}) =>
  (dice: DiceSource): FinalBlowRoll => {
    const roll = twoD6(dice)
    const landed = roll.doubles
    return {
      roll,
      landed,
      lethal: landed && input.alwaysLethal === true,
    }
  }

/** Whether a landed blow became a Technique, and what it cost (R31). */
export type NewTechnique = {
  readonly outcome: CheckOutcome
  readonly learned: boolean
  /**
   * LUCK after the roll: **-1 on failure only** (I-12, sealed in
   * spec.md). A success costs nothing, which is why this does not go
   * through `luckCheck`.
   */
  readonly luck: number
}

/**
 * Roll to keep a landed Final Blow as a new Technique (R31, I-12).
 *
 * On success the caller assigns the Technique a value of 1-4 and a brief
 * description; the engine has no opinion about either, because the book
 * has none. The 2d6 inspiration roll is a separate call to
 * {@link namingRoll}, since R31 makes it optional ("for inspiration").
 */
export const newTechnique =
  (luck: number) =>
  (dice: DiceSource): NewTechnique => {
    const outcome = check(luck)(dice)
    return {
      outcome,
      learned: outcome.success,
      luck: outcome.success ? luck : luck - 1,
    }
  }

/** The address the inspiration table is read at (MH p.26). */
export type NamingRoll = {
  readonly roll: TwoD6Roll
  /** First d6 — pass to the content package's `rollFinalBlow(first, second)`. */
  readonly first: number
  /** Second d6, the row within the band. */
  readonly second: number
  /** The band the first die falls in, as the printed table lays it out. */
  readonly band: string
  /** A double six here is neither a fumble nor a landing — it is a row. */
  readonly doubleSix: boolean
}

/** The band label for a first d6, matching `rules/final-blow.json`. */
const bandFor = (face: number): string => {
  if (face <= 2) return '1-2'
  if (face <= 4) return '3-4'
  return '5-6'
}

/**
 * Roll the inspiration table's address (R31, "for inspiration").
 *
 * Returns where to look, not what was found: the three words live in
 * `rules/final-blow.json` and are looked up by the content package's
 * `rollFinalBlow`. Keeping the roll and the table apart is what lets an
 * adventure in Phase 5 supply its own table for the same roll.
 */
export const namingRoll = (dice: DiceSource): NamingRoll => {
  const roll = twoD6(dice)
  return {
    roll,
    first: roll.a,
    second: roll.b,
    band: bandFor(roll.a),
    doubleSix: isDoubleSix(roll),
  }
}
