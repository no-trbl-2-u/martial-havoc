/**
 * The two resolution rolls outside combat (MH p.22, R20-R22).
 *
 * Every non-combat action in the book resolves with one 2d6 roll-under
 * check against either SKILL or LUCK. Combat does not come through here:
 * it is an *opposed* roll, and it lives in `../combat/`.
 *
 * Two things this module deliberately does not do:
 *
 * 1. **It never classifies.** R22 leaves the choice of which check to
 *    make ("depends directly on the Master's skills" versus "on external
 *    factors") to the player. The engine offers both and picks neither.
 * 2. **It never mutates.** {@link luckCheck} returns the LUCK the Master
 *    is left with; applying it to a sheet is the caller's job.
 *
 * Reads `docs/rules/actions.md` (R20-R22) and `spec.md`'s sealed rule
 * "a double six fails every check".
 */
import { twoD6 } from '../dice/rolls'
import type { TwoD6Roll } from '../dice/rolls'
import type { DiceSource } from '../dice/types'

/**
 * The result of one roll-under check.
 *
 * `roll` is kept whole (both faces) so a UI can show the dice that
 * decided it, and so a replayed save produces the identical record.
 * `doubleSix` is surfaced separately from `success` because the sealed
 * fumble is a *reason*, not just an outcome: "12 against a threshold of
 * 12" and "double six" read differently at the table.
 */
export type CheckOutcome = {
  readonly roll: TwoD6Roll
  /** What the 2d6 had to come in at or under. */
  readonly threshold: number
  readonly success: boolean
  /** The sealed fumble: two sixes, whatever the threshold (spec.md). */
  readonly doubleSix: boolean
}

/**
 * Is this pair of dice the sealed automatic failure?
 *
 * `spec.md`, sealed rules: "a double six fails every check and lands
 * every doubles roll". The second half of that sentence is why this
 * predicate lives here and not in `../dice/` — the Final Blow's 2d6
 * (R30) is a doubles roll, not a check, and a double six *lands* it.
 */
export const isDoubleSix = (roll: TwoD6Roll): boolean => roll.a === 6 && roll.b === 6

/**
 * The bare roll-under check: 2d6, equal or lower succeeds (R20, R21).
 *
 * Curried on the threshold so a caller can bind a Master's SKILL once
 * and roll it repeatedly (the Chaguan's repeated Concentration checks,
 * I-14, are exactly that).
 */
export const check =
  (threshold: number) =>
  (dice: DiceSource): CheckOutcome => {
    const roll = twoD6(dice)
    const doubleSix = isDoubleSix(roll)
    return {
      roll,
      threshold,
      success: !doubleSix && roll.total <= threshold,
      doubleSix,
    }
  }

/** What a SKILL check is rolled against (R20). */
export type SkillCheckInput = {
  readonly skill: number
  /**
   * The value of **one** relevant Martial Proficiency, if any.
   *
   * D10: exactly one Proficiency enters a roll, never two. A Master
   * without the matching Proficiency still attempts the action; the
   * Proficiency "simply will not add points" (R12), which is `0` here.
   * Training counts as a Proficiency for a check (R17) but **not** for
   * Attack Strength (I-22) — that asymmetry is enforced in `../combat/`.
   */
  readonly proficiency?: number
}

/**
 * A SKILL check: threshold = SKILL + one relevant Proficiency (R20).
 *
 * Returns the outcome only. A SKILL check costs nothing — unlike LUCK,
 * SKILL "isn't usually affected" (MH p.31).
 */
export const skillCheck =
  (input: SkillCheckInput) =>
  (dice: DiceSource): CheckOutcome =>
    check(input.skill + (input.proficiency ?? 0))(dice)

/**
 * A LUCK check and the LUCK it leaves behind (R21).
 *
 * "After making a LUCK check, subtract one point from the total LUCK
 * value, regardless of the outcome." The decrement is unconditional, so
 * it is returned alongside the outcome rather than left to a caller who
 * might forget it. LUCK is a depleting resource with no full-restore
 * rule (R42), which is what makes this the book's real clock.
 *
 * Two documented exemptions do **not** come through here: the Gambling
 * House's bet roll (R57) and the Final Blow's roll against LUCK (R31,
 * reading I-12, which is self-contained and pays -1 on failure only).
 * Both call {@link check} directly.
 */
export const luckCheck =
  (luck: number) =>
  (dice: DiceSource): { readonly outcome: CheckOutcome; readonly luck: number } => ({
    outcome: check(luck)(dice),
    luck: luck - 1,
  })
