/**
 * After a victory: what the opponent was carrying, and what could hurt it
 * in the first place (MH p.66, 68-69, R77-R79).
 *
 * Two unrelated rules live together here because both are read off a
 * defeated (or undefeatable) opponent:
 *
 * - **R78, Treasures.** "If you believe that your defeated opponents may
 *   be in possession of, or guarding, something of valor, roll 1d6 and
 *   compare it with their ENDURANCE." The *trigger* is the player's
 *   ("if you believe"), and reading I-30b says the roll is always offered
 *   after a victory and always declinable - so this module supplies the
 *   band to read, and never decides whether to roll.
 * - **R77, incorporeal opponents.** "Sometimes you will face spirits or
 *   ghosts, incorporeal beings immune to traditional weapons or blows;
 *   you will need to use a technique, ritual, or exceptional weapon to
 *   defeat them." No opponent in the roster is tagged (A29); reading
 *   I-29 lists which ones the estate would tag. That list is *content*,
 *   not engine (agents.md rule 7), so {@link ordinaryBlowsPass} takes the
 *   tag as an argument and holds no names of its own.
 */

/** The three ENDURANCE bands of the Treasures table, as the data holds them. */
export const TREASURE_BANDS = ['Up to 16', '17-19', '20 or more'] as const

/** One of {@link TREASURE_BANDS}. */
export type TreasureBand = (typeof TREASURE_BANDS)[number]

/**
 * Which row of the Treasures table a defeated opponent is read on (R78).
 *
 * The band comes from the opponent's ENDURANCE - its printed value, since
 * the table is about what the creature *is* worth, not how badly it was
 * beaten. Pair with the content package's `rollTreasure(band)(face)`.
 */
export const treasureBand = (endurance: number): TreasureBand => {
  if (endurance <= 16) return 'Up to 16'
  if (endurance <= 19) return '17-19'
  return '20 or more'
}

/** What is being swung, for R77. */
export type BlowInput = {
  /**
   * The opponent is a spirit or ghost. Supplied by the caller from
   * I-29's tag list, which is content; the engine names no opponent.
   */
  readonly incorporeal: boolean
  /** A Technique or Ritual is being used rather than a plain blow. */
  readonly techniqueOrRitual?: boolean
  /** The weapon is one of I-29's "exceptional" ones. */
  readonly exceptionalWeapon?: boolean
}

/**
 * Can this blow hurt the opponent at all (R77)?
 *
 * True for every corporeal opponent. For a spirit, true only through a
 * Technique, a Ritual or an exceptional weapon. This is a *gate*, not a
 * damage rule: a blow that passes is resolved exactly as R24/R25 already
 * resolve it.
 */
export const ordinaryBlowsPass = (input: BlowInput): boolean =>
  !input.incorporeal ||
  input.techniqueOrRitual === true ||
  input.exceptionalWeapon === true

/**
 * How an opponent's `Martial Arts (n)` value enters a roll (R75, R76).
 *
 * R75: rolling for a Martial Art, "the value in parentheses represents
 * how many points each Martial Proficiency has". R76: rolling for a
 * Technique or Ritual, "add the value in parentheses to the opponent's
 * Attack Strength. Your opponent does not spend ENDURANCE points to
 * perform Techniques or Rituals" - which is why nothing here subtracts.
 *
 * Returns the Proficiency value to hand to `attackStrength`; `null`
 * (no `Martial Arts (n)` on the sheet) adds nothing.
 */
export const opponentProficiencyValue = (martialArtsValue: number | null): number =>
  martialArtsValue ?? 0
