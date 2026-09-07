/**
 * How many opponents an encounter actually fields.
 *
 * A row of an adventure's encounter table names *who* is met; it does
 * not always name *how many*. Three shapes exist, and each has its own
 * authority:
 *
 * - **one** — the row is a single opponent (or, where it lists two, one
 *   of each). Nothing is rolled. Arithmetic, not a reading.
 * - **band** — the row is a group that fights together. The 5 Treasures
 *   prints "Woodgatherers" (plural, "They") with ATT 5 and no count;
 *   reading I-05b takes the ATTACK attribute as the size of the band,
 *   which is the same number the rulebook already uses for "how many
 *   enemies can attack at the same time" (R37). {@link bandOf}.
 * - **oracle** — the row's printed text says to ask the Oracle ("use the
 *   Oracle for the number of devils"). That is the Oracle's "No. of
 *   enemies" row, indexed by Enemy Type: Minion 1d6, Subordinate 3,
 *   Warrior 2, Boss 1 (MH p.58). {@link enemyCount}.
 *
 * The Oracle row is a printed table, so {@link enemyCount} is a **rule**.
 * Which of its four cells an adventure's dice-less encounter reads is
 * the reading (I-34: the devils are minions), and that choice is the
 * caller's — this module never names a foe.
 */
import type { Die, DiceSource } from '../dice/types'
import { d6 } from '../dice/rolls'

/** The four cells of the Oracle's "Enemy Type" row (MH p.58). */
export type EnemyType = 'Minion' | 'Subordinate' | 'Warrior' | 'Boss'

/** A headcount and the die that produced it, where one was drawn. */
export type Headcount = {
  readonly count: number
  /** The d6 the Minion row asked for, or null where the cell is a fixed number. */
  readonly face: Die | null
}

/**
 * The Oracle's "No. of enemies" row for an Enemy Type (MH p.58, R70).
 *
 * Only the Minion cell is a roll; the other three are printed numbers
 * and draw no die at all. That asymmetry is the table's, not ours, and
 * it is why the face is nullable rather than always present: a scripted
 * sequence must be able to script exactly the dice the book asks for.
 */
export const enemyCount =
  (type: EnemyType) =>
  (dice: DiceSource): Headcount => {
    if (type === 'Minion') {
      const face = d6(dice)
      return { count: face, face }
    }
    return { count: type === 'Subordinate' ? 3 : type === 'Warrior' ? 2 : 1, face: null }
  }

/**
 * The printed ATTACK attribute as a number (I-09, and the roster's own
 * shapes).
 *
 * A stat block prints ATTACK as an integer, as a range (`2-4`, the
 * Brawler), or blank. The content package keeps it as printed rather
 * than normalising it, so the reading happens here, once: a range is
 * read at its low end (the number the creature is guaranteed to field),
 * and a blank is read as 1 (I-09's roster mode).
 */
export const attackOf = (attack: number | string | null): number => {
  if (typeof attack === 'number') return attack
  if (attack === null) return 1
  const low = Number.parseInt(attack, 10)
  return Number.isNaN(low) ? 1 : low
}

/**
 * How many stand in a band (I-05b).
 *
 * The reading: a plural entry with an ATTACK of n is n of them, "five
 * attacking at once". Never fewer than one — a band of nobody is not a
 * reading of anything.
 */
export const bandOf = (attack: number | string | null): number => Math.max(1, attackOf(attack))
