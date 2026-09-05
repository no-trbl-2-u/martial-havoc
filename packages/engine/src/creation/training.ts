/**
 * Training (MH p.11, R15, R16, R17).
 *
 * Three rules in one step, and they interact in a way worth stating
 * plainly because it is the easiest thing in creation to get wrong:
 *
 * - R15: each Training point costs 1 SKILL, permanently. Final SKILL is
 *   the rolled SKILL minus the Training points.
 * - R16: each Training point gives 4 Resource points to spend on
 *   Techniques and Rituals.
 * - R17: Training is itself a Proficiency, at the value bought.
 *
 * And the part R15 says out loud: the SKILL deduction is "without
 * affecting the total points to be spent during character creation for
 * your Martial Proficiencies". The Proficiency pool stays the **rolled**
 * SKILL. The p. 11 example is the whole rule: roll 9, buy 2 Training,
 * spend 9 on Proficiencies, get 8 Resource points, end at SKILL 7.
 */

/** What buying `points` of Training produces. */
export type Training = {
  readonly points: number
  /** SKILL lost, 1:1 (R15). */
  readonly skillDeduction: number
  /** Resource points to spend on Techniques and Rituals (R16). */
  readonly resourcePool: number
  /** Training used as a Proficiency (R17). */
  readonly asProficiency: { readonly name: string; readonly value: number }
}

/** Resource points granted per Training point (R16). */
export const RESOURCES_PER_TRAINING_POINT = 4

/** The name Training carries when it is used as a Proficiency (R17). */
export const TRAINING_PROFICIENCY = 'Training'

/** Buy `points` of Training. `0` is the common case and costs nothing. */
export const training = (points: number): Training => ({
  points,
  skillDeduction: points,
  resourcePool: points * RESOURCES_PER_TRAINING_POINT,
  asProficiency: { name: TRAINING_PROFICIENCY, value: points },
})

/** Final SKILL after Training is bought (R15). */
export const finalSkill = (rolledSkill: number, trainingPoints: number): number =>
  rolledSkill - trainingPoints

/** The Proficiency pool: the rolled SKILL, untouched by R15 (R10, D06). */
export const proficiencyPool = (rolledSkill: number): number => rolledSkill
