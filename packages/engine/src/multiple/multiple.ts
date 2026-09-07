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

/** An opponent in a band: what it rolls with, and how many of its kind may swing. */
export type BandMember = Combatant & {
  /**
   * Which kind this opponent is - the id of its stat block.
   *
   * R37 caps simultaneous attackers by ATTACK, and ATTACK is an
   * attribute of a *kind*, not of a crowd. Four Ogres and a Ghost are
   * two caps, not one, so the cap needs to know which of the attackers
   * share a stat block. The id is the only thing that says so, and it
   * is opaque here: the engine never learns what an Ogre is.
   */
  readonly kind: string
  /** The kind's printed ATTACK, already read as a number (`attackOf`). */
  readonly attack: number
}

/**
 * Which members of a band are held back this round (R37, I-09b).
 *
 * "The opponent's ATTACK attribute indicates how many enemies can
 * attack at the same time." Applied per kind, in the order the band is
 * listed: the first `attack` of each kind swing, the rest are held
 * back. A held-back opponent is still in the fight and still on screen -
 * it simply cannot reach the Master this round.
 *
 * Returns one flag per member, positionally, so a caller can zip it
 * against its own list without re-deriving the grouping.
 */
export const heldBackInBand = (band: readonly BandMember[]): readonly boolean[] => {
  const total = band.reduce<Record<string, number>>(
    (counts, member) => ({ ...counts, [member.kind]: (counts[member.kind] ?? 0) + 1 }),
    {},
  )
  // Folded rather than looped with a counter: the running tally of how
  // many of each kind have already been given a slot is the fold's
  // accumulator, so nothing here mutates.
  return band.reduce<{ readonly seen: Record<string, number>; readonly flags: readonly boolean[] }>(
    (acc, member) => {
      const before = acc.seen[member.kind] ?? 0
      const allowed = attackersThisRound(total[member.kind] ?? 1, member.attack)
      return {
        seen: { ...acc.seen, [member.kind]: before + 1 },
        flags: [...acc.flags, before >= allowed],
      }
    },
    { seen: {}, flags: [] },
  ).flags
}

/** One member's roll in a band round, and whether ATTACK let it land. */
export type BandExchange = OpponentExchange & {
  /** True where R37's cap kept this one out of reach this round. */
  readonly heldBack: boolean
}

/** A whole round against a band: {@link ManyRound} with R37 applied. */
export type BandRound = Omit<ManyRound, 'exchanges'> & {
  readonly exchanges: readonly BandExchange[]
}

/**
 * Resolve one round against a band, with ATTACK capping who lands
 * (I-06, R35, R37).
 *
 * Everyone rolls. That is deliberate: the Master's one roll is compared
 * against each opponent's, so a held-back opponent's total is still a
 * fact of the round - it is what the Master beat, and it is what the
 * screen shows beside the one who got through. What ATTACK caps is
 * **damage taken**, not dice thrown; `damageTaken` sums only the
 * exchanges that were not held back.
 *
 * `master.skill` is expected to be {@link skillForFight} already, for
 * the same reason {@link roundAgainstMany} expects it: the number faced
 * (R35) and the number attacking (R37) are different quantities.
 */
export const roundAgainstBand =
  (master: Combatant, band: readonly BandMember[]) =>
  (dice: DiceSource): BandRound => {
    const flags = heldBackInBand(band)
    const round = roundAgainstMany(master, band)(dice)
    const exchanges = round.exchanges.map((exchange, index) => ({
      ...exchange,
      heldBack: flags[index] === true,
    }))
    return {
      ...round,
      exchanges,
      damageTaken: exchanges.reduce(
        (total, e) => total + (!e.heldBack && e.outcome.kind === 'master-hit' ? e.outcome.damage : 0),
        0,
      ),
    }
  }
