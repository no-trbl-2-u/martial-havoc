/**
 * The two Oracle rows that carry a mechanical reading (MH p.58; I-07a,
 * I-08a).
 *
 * The Oracle itself is a lookup, not a rule: choose the row, roll 1d6,
 * read the cell, interpret (R71). The content package owns that
 * (`consultOracle`), and "the book defines none of the cell words ...
 * interpretation is the player's". Two cells are the exception, because
 * the estate's inventory gives them a mechanical reading, and a reading
 * is engine:
 *
 * - **"Enemy attack: Special"** (I-07a) - undefined in the text. Read as:
 *   the opponent uses one of its listed Proficiencies this round, adding
 *   its value (R76). "Normal" is SKILL + 2d6 and nothing else.
 * - **"Encounter Outcome: Ambush" versus "Attack"** (I-08a) - no mechanic
 *   distinguishes them. Read as: an Ambush gives the opponent one
 *   **unopposed** first round; normal rounds follow.
 */
import type { NamedValue } from '../combat/attack-strength'
import type { Combatant } from '../combat/attack-strength'

/** The two values the Oracle's "Enemy attack" row can give. */
export type EnemyAttack = 'Normal' | 'Special'

/**
 * Turn an "Enemy attack" result into the Combatant the round rolls (I-07a).
 *
 * On "Normal" the opponent brings no Proficiency at all - SKILL + 2d6.
 * On "Special" it brings one: the named one if the narrative picked it,
 * otherwise the higher (I-21, applied downstream by `relevantProficiency`).
 */
export const enemyAttack = (
  attack: EnemyAttack,
  opponent: { readonly skill: number; readonly proficiencies: readonly NamedValue[] },
  named?: string,
): Combatant => {
  if (attack === 'Normal') return { skill: opponent.skill }
  const special = { skill: opponent.skill, proficiencies: opponent.proficiencies }
  // `useProficiency` is omitted rather than set to undefined: the field
  // means "the narrative picked this one", and an explicit undefined
  // would claim a choice was made (exactOptionalPropertyTypes).
  return named === undefined ? special : { ...special, useProficiency: named }
}

/** What an "Ambush" costs the Master before normal rounds begin (I-08a). */
export type Ambush = {
  /**
   * The opponent's unopposed first round: the Master's side of the
   * comparison is SKILL + 2d6 with **no** Proficiency.
   */
  readonly masterRollsWithoutProficiency: true
  /** After this round, the fight proceeds as `../combat/round.ts` has it. */
  readonly roundsAfter: 'normal'
}

/**
 * The Ambush reading, as a value rather than a procedure (I-08a).
 *
 * Returned as data because it is a *modifier to how the first round is
 * set up*, not a roll of its own: the caller builds the Master's
 * Combatant without Proficiencies for one round and then stops applying
 * it. Encoding it as a shape keeps the reading citable and testable
 * without inventing a second round loop.
 */
export const ambush = (): Ambush => ({
  masterRollsWithoutProficiency: true,
  roundsAfter: 'normal',
})
