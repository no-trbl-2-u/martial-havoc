/**
 * Multiple combat: several opponents at once (MH p.30, R35-R37).
 *
 * Three rules, and two of them need a reading before they can be code:
 *
 * - **R35 is arithmetic.** "Reduce your SKILL points by an amount equal
 *   to the number of opponents you face." {@link skillForFight}.
 * - **R36 needs the ability's prose.** An area Technique or Proficiency
 *   distributes "the same amount of damage" to the enemies, but how many
 *   it reaches is nowhere stated; reading I-11 says to read the number
 *   from the prose (Butterfly Palms two, Light Body all, Exploding Qi
 *   all, Double Strike two). So {@link areaDamage} takes the reach as an
 *   argument and never guesses it.
 * - **R37 needs a reading for a lone monster.** "The opponent's ATTACK
 *   attribute indicates how many enemies can attack at the same time."
 *   `spec.md` seals the answer: ATTACK is the number of opponents a
 *   creature can wound at once, and it is **inert against a lone
 *   Master**. {@link attackersThisRound}.
 *
 * How a round against several opponents resolves is I-06: **one** Master
 * roll, each attacking opponent rolls its own, each comparison resolved
 * independently by `../combat/round.ts`. That is {@link roundAgainstMany}.
 */
import type { DiceSource } from '../dice/types'
import { attackStrength } from '../combat/attack-strength'
import type { AttackStrength, Combatant } from '../combat/attack-strength'
import { resolveRound } from '../combat/round'
import type { RoundOutcome } from '../combat/round'

/**
 * SKILL for a fight against `opponents` opponents (R35).
 *
 * Not floored: a Master facing more opponents than they have SKILL rolls
 * a negative modifier, which is the rule as printed. Clamping it would
 * be an invention, and the book's own advice for that situation is to
 * flee (R38).
 */
export const skillForFight = (skill: number, opponents: number): number => skill - opponents

/**
 * How many of `present` opponents may attack this round (R37; sealed).
 *
 * ATTACK caps simultaneous attackers. A creature with ATTACK 5 fighting
 * beside four others still only lets five swing; a lone Master fighting
 * one creature is attacked once, because ATTACK "is inert against a lone
 * Master" (spec.md). `attack` may be null - blank on the sheet - and is
 * read as 1 (I-09's roster mode).
 */
export const attackersThisRound = (present: number, attack: number | null): number => {
  if (present <= 1) return present
  return Math.min(present, Math.max(1, attack ?? 1))
}

/** One opponent's roll in a multi-opponent round, and how it resolved. */
export type OpponentExchange = {
  readonly opponent: AttackStrength
  readonly outcome: RoundOutcome
}

/** A whole round against several opponents (I-06). */
export type ManyRound = {
  /** The single Master roll every attacker is compared against. */
  readonly master: AttackStrength
  readonly exchanges: readonly OpponentExchange[]
  /** Total ENDURANCE the Master lost this round, summed over R24 hits. */
  readonly damageTaken: number
  /** True if any exchange drew: an Unexpected Event ends the phase (R32). */
  readonly unexpectedEvent: boolean
}

/**
 * Resolve one round against several opponents (R35, R37, I-06).
 *
 * The Master rolls **once** and that one Attack Strength is compared
 * against each attacker's roll in turn. Dice are drawn in call order:
 * the Master's two first, then two per attacker, so a scripted sequence
 * reads left to right exactly as the round plays.
 *
 * The Master's `skill` is expected to be {@link skillForFight} already -
 * this function does not apply R35 itself, because the number of
 * opponents *faced* (R35) and the number *attacking this round* (R37)
 * are different quantities and conflating them is the trap.
 */
export const roundAgainstMany =
  (master: Combatant, attackers: readonly Combatant[]) =>
  (dice: DiceSource): ManyRound => {
    const mine = attackStrength(master)(dice)
    const exchanges = attackers.map((attacker) => {
      const opponent = attackStrength(attacker)(dice)
      return { opponent, outcome: resolveRound(mine, opponent) }
    })
    return {
      master: mine,
      exchanges,
      damageTaken: exchanges.reduce(
        (total, e) => total + (e.outcome.kind === 'master-hit' ? e.outcome.damage : 0),
        0,
      ),
      unexpectedEvent: exchanges.some((e) => e.outcome.kind === 'unexpected-event'),
    }
  }

/**
 * Distribute an area ability's damage (R36, I-11).
 *
 * "In case of a successful attack, distribute the same amount of damage
 * to the enemies" - the book's own worked example carries 4 damage to
 * two of three opponents with Double Strike, so the amount is repeated,
 * never divided. `reach` is read from the ability's prose (I-11) and
 * passed in; `Infinity` is how "all opponents surrounding you" is
 * expressed by a caller that does not want to count first.
 *
 * Returns the damage each opponent takes, in order, so a caller can zip
 * it against its own list of enemies.
 */
export const areaDamage = (
  amount: number,
  reach: number,
  enemies: number,
): readonly number[] =>
  Array.from({ length: enemies }, (_, index) => (index < reach ? amount : 0))
