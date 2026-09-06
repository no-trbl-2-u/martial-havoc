/**
 * The combat round: compare two Attack Strengths and say what follows
 * (MH p.23, R24-R25, R29, R32).
 *
 * The comparison has exactly three outcomes, and the engine's job is to
 * report which one happened and what it makes available — not to choose.
 * That distinction is the whole design of this module:
 *
 * - **Opponent higher (R24)** — one thing happens: the Master loses the
 *   difference from ENDURANCE. The engine applies it.
 * - **Master higher (R25)** — *four* things are now possible, and R25 is
 *   "a choice the UI must present" (`docs/rules/combat.md`, engine
 *   notes). The engine returns all four as offers; the caller picks one
 *   and calls the matching function. Picking here would invent a rule.
 * - **Equal (R32)** — an Unexpected Event, and "after an Unexpected
 *   Event, you are no longer in the combat phase". The phase ends
 *   whatever the event turns out to be; resolving *which* event is
 *   `./unexpected-event.ts`.
 */
import type { AttackStrength } from './attack-strength'

/** The four things a winning Master may do with a won round (R25). */
export type WinnerOption =
  /** (a) Subtract the difference from the opponent's ENDURANCE. */
  | { readonly kind: 'damage'; readonly amount: number }
  /**
   * (b) Use one of the Techniques you know. No roll; costs its value in
   * ENDURANCE (R27). Available **only** here, as the winner's option
   * (I-23) — a Technique cannot be spent on a lost round.
   */
  | { readonly kind: 'technique' }
  /**
   * (c) Change or recover a weapon. Relevant because an armed
   * Proficiency adds nothing without the weapon (R68).
   */
  | { readonly kind: 'weapon' }
  /** (d) Create an Opening: no damage, but a Final Blow becomes possible (R29). */
  | { readonly kind: 'opening' }

/** What the comparison produced. */
export type RoundOutcome =
  /** R24: the Master loses `damage` from ENDURANCE. Nothing to choose. */
  | {
      readonly kind: 'master-hit'
      readonly difference: number
      readonly damage: number
      readonly master: AttackStrength
      readonly opponent: AttackStrength
    }
  /** R25: the Master won by `difference` and may take any one `options` entry. */
  | {
      readonly kind: 'master-wins'
      readonly difference: number
      readonly options: readonly WinnerOption[]
      readonly master: AttackStrength
      readonly opponent: AttackStrength
    }
  /** R32: a draw. An Unexpected Event occurs and the combat phase ends. */
  | {
      readonly kind: 'unexpected-event'
      readonly master: AttackStrength
      readonly opponent: AttackStrength
    }

/**
 * Compare the two Attack Strengths already rolled (R24, R25, R32).
 *
 * Takes rolled strengths rather than dice so that multiple combat can
 * reuse it: I-06 reads a round against several opponents as **one**
 * Master roll compared independently against each attacker's roll, and
 * that is exactly this function called once per attacker.
 */
export const resolveRound = (
  master: AttackStrength,
  opponent: AttackStrength,
): RoundOutcome => {
  const difference = master.total - opponent.total
  if (difference === 0) return { kind: 'unexpected-event', master, opponent }
  if (difference < 0) {
    const damage = -difference
    return { kind: 'master-hit', difference: damage, damage, master, opponent }
  }
  return {
    kind: 'master-wins',
    difference,
    options: Object.freeze([
      { kind: 'damage', amount: difference },
      { kind: 'technique' },
      { kind: 'weapon' },
      { kind: 'opening' },
    ] as const),
    master,
    opponent,
  }
}

/**
 * Spend a Technique in combat (R27): no roll, pay its value in ENDURANCE.
 *
 * "In times of need, the Master can concentrate internal energy and
 * perform a spectacular action without failing" — the second half of R27
 * is narrative, and the mechanical half is this subtraction. R28's advice
 * (do not end a fight with a Technique) is guidance for the table, not a
 * constraint the engine enforces.
 *
 * Returns the Master's ENDURANCE after the cost. Nothing floors it: what
 * ENDURANCE zero means is R06's, not this module's.
 */
export const spendTechnique = (endurance: number, cost: number): number => endurance - cost

/**
 * Why a fight stopped (R26).
 *
 * "Combat continues until: a Final Blow lands; either side's ENDURANCE
 * reaches zero; an Unexpected Event occurs."
 */
export type FightEnd =
  | { readonly ended: false }
  | { readonly ended: true; readonly reason: 'final-blow' }
  | { readonly ended: true; readonly reason: 'master-down' }
  | { readonly ended: true; readonly reason: 'opponent-down' }
  | { readonly ended: true; readonly reason: 'unexpected-event' }

/** The state R26 reads to decide whether the fight continues. */
export type FightState = {
  readonly masterEndurance: number
  readonly opponentEndurance: number
  readonly finalBlowLanded: boolean
  readonly unexpectedEvent: boolean
}

/**
 * Has the fight ended, and why (R26)?
 *
 * The three conditions are checked in the order the book prints them, so
 * a round that both lands a Final Blow and drops the opponent reports the
 * Final Blow — which is the one that carries the R31 consequence.
 */
export const endsFight = (state: FightState): FightEnd => {
  if (state.finalBlowLanded) return { ended: true, reason: 'final-blow' }
  if (state.masterEndurance <= 0) return { ended: true, reason: 'master-down' }
  if (state.opponentEndurance <= 0) return { ended: true, reason: 'opponent-down' }
  if (state.unexpectedEvent) return { ended: true, reason: 'unexpected-event' }
  return { ended: false }
}
