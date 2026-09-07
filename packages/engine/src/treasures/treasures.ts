/**
 * What a magical treasure does, as mechanics rather than as names.
 *
 * The 5 Treasures is named for five objects, and the adventure prints
 * what each *is* without printing what to roll. That gap is exactly the
 * shape of a reading, and four of them are settled here - one function
 * each, taking numbers and flags, naming no treasure and no opponent
 * (agents.md standing rule 7). Which object each belongs to is the
 * adventure's content; the reading each stands on is in
 * `docs/rules/readings/the-5-treasures.md`.
 *
 * - **Calling a name** (I-38). "Remove the label and call out a person's
 *   name, if they respond they'll be trapped inside." Whether someone
 *   responds is a closed question, so it is *the* Closed Question: the
 *   Oracle's own row, 1d6, Yes-class trapping them. {@link callsOut}.
 * - **Binding** (I-49). "With a spell it moves to tie a person." A tied
 *   opponent is not defeated and is not damaged; what being tied *is*,
 *   mechanically, is the state R29 already has a word for - an Opening -
 *   and it holds until the fight ends. {@link binds}.
 * - **Magic fire** (I-50). "Waves inextinguishable using conventional
 *   methods." Inextinguishable is the whole of it: damage now, and
 *   damage every round after, that nothing in the fight can stop.
 *   {@link magicFire}.
 * - **Warding** (I-44). "It can block hits from stronger enemies without
 *   any effort from the holder." Without any effort is read as without a
 *   roll, and "stronger" as the round the opponent won. {@link wards}.
 */
import { d6 } from '../dice/rolls'
import type { Die, DiceSource } from '../dice/types'

/**
 * The faces of the Oracle's Closed Question row that answer yes
 * (MH p.58: 4 "Yes, but", 5 "Yes", 6 "Yes, and").
 *
 * The band is the printed table's, not ours; what I-38 adds is only that
 * a Yes-class answer is the one that traps.
 */
export const answersYes = (face: number): boolean => face >= 4

/** Calling a name into the vase: the question, and whether it was answered. */
export type CalledOut = {
  readonly face: Die
  /** True where the Oracle answered Yes-class and the caller is trapped. */
  readonly trapped: boolean
}

/**
 * Call out a name and read the Oracle's answer (I-38, R71).
 *
 * One d6 on the Closed Question row. A yes traps; anything else is a
 * name shouted into a cave, and the caller has just told whoever it was
 * exactly where they are standing.
 */
export const callsOut = (dice: DiceSource): CalledOut => {
  const face = d6(dice)
  return { face, trapped: answersYes(face) }
}

/**
 * What being tied is, as a value rather than a procedure (I-49).
 *
 * Returned as data for the same reason `ambush()` is: it is a modifier
 * to the state of a fight, not a roll of its own. A bound opponent is an
 * Opening that does not close - a missed Final Blow leaves the binding
 * where it was, because the rope did not come loose when the strike
 * missed.
 */
export type Binding = {
  readonly opening: true
  /** A missed Final Blow does not free them (I-49). */
  readonly survivesAMissedBlow: true
}

/** The Cord's tie (I-49). Legal only where the spells are known (I-41). */
export const binds = (): Binding => ({ opening: true, survivesAMissedBlow: true })

/** Fire that cannot be put out: what it costs now, and every round after. */
export type MagicFire = {
  readonly face: Die
  /** ENDURANCE off at once. */
  readonly now: number
  /** ENDURANCE off at the start of every later round, until the fight ends. */
  readonly each: number
}

/**
 * Light the magic fire (I-50).
 *
 * 1d6 now and 1 each round after. The book gives no number at all, and
 * the reading takes the smallest pair that makes "inextinguishable" mean
 * something: a burst, and then a burn nothing in the fight removes. The
 * `each` is a constant rather than a second roll because a fire that
 * rolled every round would be a second fight running beside the first.
 */
export const magicFire = (dice: DiceSource): MagicFire => {
  const face = d6(dice)
  return { face, now: face, each: 1 }
}

/**
 * Does the ward take this hit instead of the Master (I-44)?
 *
 * "Block hits from stronger enemies without any effort from the holder":
 * true exactly when the opponent won the round, and never on a round the
 * Master won - the sword does nothing on the Master's wins. No roll, no
 * limit and no cost, which is what "without any effort" says; a ward
 * that had to be spent would be an invention on top of a reading.
 */
export const wards = (opponentWasAhead: boolean): boolean => opponentWasAhead
