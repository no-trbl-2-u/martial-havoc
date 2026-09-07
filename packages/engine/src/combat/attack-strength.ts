/**
 * Attack Strength: the opposed roll a combat round is built on
 * (MH p.23, R23).
 *
 * "Attack Strength for each side = 2d6 + one relevant Martial
 * Proficiency (if any) + SKILL." Three things the concept
 * (`docs/rules/combat.md`) pins down that the sentence alone does not:
 *
 * - **Exactly one** Proficiency enters the sum, never two (D10). Where
 *   an opponent has two, the higher is used unless the narrative picks
 *   the other (I-21) — that selection is {@link relevantProficiency}.
 * - **Training does not add** to Attack Strength, even though R17 calls
 *   it "one of your Martial Proficiency": its value applies to SKILL
 *   checks to perform or resist Techniques and Rituals only (I-22).
 * - The SKILL that enters is the SKILL **for this fight**, already
 *   reduced by the number of opponents in multiple combat (R35). That
 *   reduction is `../multiple/`'s to apply; this module takes the number
 *   it is given.
 */
import { twoD6 } from '../dice/rolls'
import type { TwoD6Roll } from '../dice/rolls'
import type { DiceSource } from '../dice/types'
import type { NamedValue } from '../creation/proficiencies'

/**
 * A Proficiency name with its value. Re-exported from creation rather
 * than redeclared: the Proficiency a Master spent points on at creation
 * and the one an opponent's stat block prints are the same shape, and a
 * second declaration would let the two drift.
 */
export type { NamedValue }

/** One side's Attack Strength, with every term kept visible. */
export type AttackStrength = {
  readonly roll: TwoD6Roll
  /** The SKILL that entered — already reduced for multiple combat (R35). */
  readonly skill: number
  /** The one Proficiency that entered, or null if none was relevant. */
  readonly proficiency: NamedValue | null
  /** `roll.total + skill + (proficiency?.value ?? 0)`. */
  readonly total: number
}

/**
 * Pick the one Proficiency that enters a roll (D10, I-21).
 *
 * Given the Proficiencies a combatant could bring this round, the higher
 * is used. `named` overrides it — that is I-21's escape hatch for "unless
 * the narrative or a Special result selects the other", and it is also
 * how the Oracle's "Special" enemy attack (I-07a) names its Proficiency.
 *
 * Returns `null` for an empty list: a combatant with no relevant
 * Proficiency rolls SKILL + 2d6 and nothing else.
 */
export const relevantProficiency = (
  available: readonly NamedValue[],
  named?: string,
): NamedValue | null => {
  if (named !== undefined) return available.find((p) => p.name === named) ?? null
  return available.reduce<NamedValue | null>(
    (best, candidate) => (best === null || candidate.value > best.value ? candidate : best),
    null,
  )
}

/** What one side brings to the roll. */
export type Combatant = {
  /** SKILL for this fight (R35 already applied, if it applies). */
  readonly skill: number
  /** Every Proficiency that could be relevant; exactly one will be used. */
  readonly proficiencies?: readonly NamedValue[]
  /** Force a particular Proficiency by name (I-21, I-07a). */
  readonly useProficiency?: string
}

/**
 * Roll one side's Attack Strength (R23).
 *
 * Curried on the combatant so a fight can bind the Master once and roll
 * it each round. Draws exactly two dice, in the order the caller's
 * sequence supplies them.
 */
export const attackStrength =
  (combatant: Combatant) =>
  (dice: DiceSource): AttackStrength => {
    const roll = twoD6(dice)
    const proficiency = relevantProficiency(
      combatant.proficiencies ?? [],
      combatant.useProficiency,
    )
    return {
      roll,
      skill: combatant.skill,
      proficiency,
      total: roll.total + combatant.skill + (proficiency?.value ?? 0),
    }
  }

/**
 * The Proficiencies that need a weapon in hand (MH p.53, R68; I-02).
 *
 * R68 is plural — "armed Proficiencies add nothing without a weapon" —
 * and the book never lists which of the forty-six printed Proficiencies
 * are the armed ones. I-02 settles the other half of the question (any
 * item flagged `weapon` satisfies "Armed combat") and names that one; the
 * set below is this build's reading of the rest, and it is deliberately
 * the smallest defensible one: a Proficiency is armed when a weapon is
 * named in the Proficiency itself. "Quick draw" and "Disarm" are about
 * weapons without being one, and are not included.
 *
 * Reopening this is editing this list and nothing else.
 */
export const ARMED_PROFICIENCIES: readonly string[] = Object.freeze([
  'Armed combat',
  'Ranged weapons',
  'Versatile Weapon',
])

/** Is `name` a Proficiency that adds nothing without a weapon (R68, I-02)? */
export const isArmedProficiency = (name: string): boolean =>
  ARMED_PROFICIENCIES.some((armed) => armed.toLowerCase() === name.trim().toLowerCase())

/**
 * The Proficiencies that still add with no weapon in hand (R68).
 *
 * Used when an Unexpected Event took the weapon (row 3, I-30): the
 * armed ones drop out of the round's candidates, so `relevantProficiency`
 * picks the best of what is left — which is exactly R12's "fighting
 * bare-handed ... they simply will not add points". A Master whose only
 * Proficiency was the armed one rolls SKILL and 2d6, and nothing else.
 */
export const withoutArmed = (
  proficiencies: readonly NamedValue[],
): readonly NamedValue[] => proficiencies.filter((p) => !isArmedProficiency(p.name))
