/**
 * Leaving a fight before it ends (MH p.30, R38-R39).
 *
 * "If you think the enemy is too tough, you can flee. If you have not
 * used a Technique or some other stratagem for a daring escape, suffer a
 * last blow and subtract 2 points from your ENDURANCE" (R38). "Score 1
 * Dishonor Point for each time you fail to escape without suffering
 * damage" (R39).
 *
 * Reading I-32 settles both open halves: what a "stratagem" is (any
 * Technique flagged `escape`, or a player-declared stratagem the Oracle
 * approves), and whether the -2 last blow counts as "suffering damage"
 * for R39 - it does, so **a bare escape always scores Dishonor**.
 *
 * Dishonor is subtracted from the adventure's XP total (R43), which is
 * why it is returned as a number to add to the sheet rather than applied
 * here: the Master record owns its own totals.
 */

/** The last blow a bare escape costs (R38). */
export const ESCAPE_DAMAGE = 2

/** How the Master is getting out. */
export type EscapeInput = {
  readonly endurance: number
  /**
   * A stratagem was used: a Technique flagged `escape` (Monkey Jump,
   * Void Boxing, Unicorn Step, Crane's flight, Somersault clouds ...) or
   * a player-declared one the Oracle approved (I-32). The engine never
   * decides this - it is the player's, and the flag comes in as data.
   */
  readonly stratagem?: boolean
}

/** What the escape cost. */
export type Escape = {
  /** ENDURANCE after the last blow, if there was one. */
  readonly endurance: number
  /** 2 without a stratagem, 0 with one (R38). */
  readonly damage: number
  /** 1 without a stratagem, 0 with one (R39, I-32). */
  readonly dishonor: number
  readonly stratagem: boolean
}

/**
 * Flee a fight (R38, R39, I-32).
 *
 * With a stratagem: no damage, no Dishonor. Without: -2 ENDURANCE and 1
 * Dishonor Point, because I-32 reads the -2 as damage. ENDURANCE is not
 * floored - a Master who flees into unconsciousness is R06's problem,
 * and clamping here would hide it.
 */
export const escape = (input: EscapeInput): Escape => {
  const stratagem = input.stratagem === true
  const damage = stratagem ? 0 : ESCAPE_DAMAGE
  return {
    endurance: input.endurance - damage,
    damage,
    dishonor: stratagem ? 0 : 1,
    stratagem,
  }
}
