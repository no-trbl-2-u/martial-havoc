/**
 * Experience: earning it and spending it (MH p.34-35, R43-R47).
 *
 * XP is awarded **once per adventure**, not per fight: four self-assessed
 * scores of 1 (poor) to 3 (excellent) - Mission Success, Use of equipment
 * and environment, Combat spectacularity, Lateral thinking - summed and
 * reduced by Dishonor Points (R43). The four scores are the player's own
 * assessment and the book gives no rubric, so {@link xpAward} takes them
 * and does the arithmetic, never the judging.
 *
 * Spending is a cost table whose columns are the Master's SKILL band
 * (R44, `rules/xp-costs.json`). Which SKILL selects the band - current or
 * initial - is not stated; the book's own worked example uses the
 * **current** SKILL 11 (reading I-53), and {@link skillBand} follows it.
 *
 * Caps (R45): SKILL and LUCK may not exceed 12; a Martial Proficiency may
 * exceed creation's maximum of 4. No ENDURANCE cap is stated, so none is
 * enforced. Unspent XP carries over (R47).
 */

/** The four categories, in the order the book prints them (R43). */
export const XP_CATEGORIES = [
  'Mission Success',
  'Use of equipment and environment',
  'Combat spectacularity',
  'Lateral thinking',
] as const

/** One of {@link XP_CATEGORIES}. */
export type XpCategoryName = (typeof XP_CATEGORIES)[number]

/** The four scores and the Dishonor to subtract. */
export type XpScores = {
  /** Each 1-3. Out-of-range values are reported, never corrected. */
  readonly scores: Readonly<Record<XpCategoryName, number>>
  readonly dishonor: number
}

/** What an adventure was worth. */
export type XpAward = {
  /** Sum of the four scores, before Dishonor. Range 4-12 when in range. */
  readonly earned: number
  readonly dishonor: number
  /** `earned - dishonor`, floored at 0: an adventure never costs XP. */
  readonly total: number
  /** Categories whose score fell outside 1-3. Advisory, never a refusal. */
  readonly outOfRange: readonly XpCategoryName[]
}

/**
 * Score one adventure (R43).
 *
 * Follows creation's rule that pools are advisory (spec.md, Refusals): a
 * score of 5 is reported in `outOfRange` and still counted, because the
 * engine flags and never refuses. The total is floored at zero - Dishonor
 * larger than the scores leaves an adventure worth nothing, not a debt,
 * since the book gives no negative-XP rule.
 */
export const xpAward = (input: XpScores): XpAward => {
  const earned = XP_CATEGORIES.reduce((sum, name) => sum + (input.scores[name] ?? 0), 0)
  return {
    earned,
    dishonor: input.dishonor,
    total: Math.max(0, earned - input.dishonor),
    outOfRange: XP_CATEGORIES.filter((name) => {
      const value = input.scores[name]
      return value === undefined || value < 1 || value > 3
    }),
  }
}

/** The three column headings of the cost table, as `rules/xp-costs.json` holds them. */
export const SKILL_BANDS = ['SKILL 6 or less', 'SKILL 7-9', 'SKILL 10-12'] as const

/** One of {@link SKILL_BANDS}. */
export type SkillBand = (typeof SKILL_BANDS)[number]

/**
 * Which column of the cost table a Master reads (R44, I-53).
 *
 * Takes the **current** SKILL, as the book's worked example does. A SKILL
 * above 12 still reads the top band: R45 caps SKILL at 12, so there is no
 * column beyond it, and a legendary sheet (Sun Wukong's 14) is data, not
 * an error to correct.
 */
export const skillBand = (skill: number): SkillBand => {
  if (skill <= 6) return 'SKILL 6 or less'
  if (skill <= 9) return 'SKILL 7-9'
  return 'SKILL 10-12'
}

/** What may be raised with XP, as the cost table's rows name them. */
export const INCREASES = [
  'Martial Proficiency',
  'SKILL',
  'ENDURANCE',
  'LUCK',
  'Training skill',
] as const

/** One of {@link INCREASES}. */
export type Increase = (typeof INCREASES)[number]

/** The caps R45 states. Absent from this map means uncapped. */
export const CAPS: Partial<Readonly<Record<Increase, number>>> = Object.freeze({
  SKILL: 12,
  LUCK: 12,
})

/** Whether one +1 is affordable and legal, and what it leaves. */
export type Purchase = {
  readonly increase: Increase
  readonly cost: number
  readonly affordable: boolean
  /** False when R45's cap forbids it (SKILL and LUCK above 12). */
  readonly allowed: boolean
  /** XP left if the purchase is taken; unchanged if it is not (R47). */
  readonly remaining: number
}

/**
 * Price one +1 against a Master's XP and the cap (R44, R45, R47).
 *
 * `cost` comes from `rules/xp-costs.json` via the content package's
 * `xpCostFor(increase)(band)` - the table is data and is passed in, not
 * duplicated here. A purchase that is unaffordable or capped leaves the
 * XP untouched, which is R47's carry-over.
 *
 * A Martial Proficiency is deliberately uncapped: R45 says it "can exceed
 * the initial maximum value of 4", so creation's cap of 4 ends at
 * creation.
 */
export const purchase = (input: {
  readonly increase: Increase
  readonly cost: number
  readonly xp: number
  /** The attribute's value now, for the R45 cap. Ignored where uncapped. */
  readonly current?: number
}): Purchase => {
  const cap = CAPS[input.increase]
  const allowed = cap === undefined || input.current === undefined || input.current < cap
  const affordable = input.xp >= input.cost
  const taken = allowed && affordable
  return {
    increase: input.increase,
    cost: input.cost,
    affordable,
    allowed,
    remaining: taken ? input.xp - input.cost : input.xp,
  }
}
