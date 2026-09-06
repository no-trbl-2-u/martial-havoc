/**
 * Recovery (MH p.31, R40-R42).
 *
 * Each attribute recovers differently, and the shipped table
 * (`rules/healing.json`) is the transcription:
 *
 * | Attribute | Partial | Amount | Full |
 * |---|---|---|---|
 * | SKILL | spiritual regeneration Techniques | 1 | a full night's rest |
 * | ENDURANCE | healing techniques, regeneration, a meal, a Health Elixir | 4 | a week's rest |
 * | LUCK | a Spirituality check in a Temple, with incense | 1 | - |
 *
 * `spec.md` seals one addition the table does not print: **a night's rest
 * heals +4 ENDURANCE**. The book gives ENDURANCE only "a week's rest" for
 * a full restore and says nothing about a night; the sealed rule fills
 * that silence with the partial amount, so a night is one application of
 * the +4 rather than nothing at all.
 *
 * Nothing here caps ENDURANCE upward, because "nothing in the book caps
 * ENDURANCE" (docs/rules/multiple-combat-escape-healing.md) - except the
 * initial value, which every attribute stores (R05) and which callers who
 * want a ceiling can pass as `max`.
 */

/** Which attribute is recovering. */
export type HealAttribute = 'SKILL' | 'ENDURANCE' | 'LUCK'

/** The partial amount each attribute recovers, as the table prints it. */
export const PARTIAL: Readonly<Record<HealAttribute, number>> = Object.freeze({
  SKILL: 1,
  ENDURANCE: 4,
  LUCK: 1,
})

/** ENDURANCE recovered by a night's rest (sealed: spec.md). */
export const NIGHTS_REST_ENDURANCE = PARTIAL.ENDURANCE

/** What a recovery is asked for. */
export type HealInput = {
  readonly attribute: HealAttribute
  readonly current: number
  /**
   * The ceiling. Pass the attribute's `initial` (R05) to stop a Master
   * healing past where they started; omit it for no ceiling, which is
   * what the book itself states for ENDURANCE.
   */
  readonly max?: number
  /**
   * A full restore rather than the partial amount: a night's rest for
   * SKILL, a week's rest for ENDURANCE (R40, R41). LUCK has no full
   * restore rule (R42), so `full: true` for LUCK still heals 1 - the
   * engine does not invent a rule the book declines to give.
   */
  readonly full?: boolean
}

/** What a recovery produced. */
export type Heal = {
  readonly attribute: HealAttribute
  readonly before: number
  readonly after: number
  readonly restored: number
  /** True when a full restore actually applied (SKILL and ENDURANCE only). */
  readonly wasFull: boolean
}

/**
 * Recover an attribute (R40-R42; spec.md for the night's rest).
 *
 * A full restore needs a ceiling to restore *to*; without a `max` there
 * is nothing to fill, so the partial amount applies and `wasFull` is
 * false. That is deliberate: "recovers completely" is meaningless for an
 * attribute with no stated maximum, and guessing one would be inventing.
 */
export const heal = (input: HealInput): Heal => {
  const ceiling = input.max
  const canFull = input.full === true && input.attribute !== 'LUCK' && ceiling !== undefined
  const target = canFull
    ? ceiling
    : Math.min(input.current + PARTIAL[input.attribute], ceiling ?? Number.POSITIVE_INFINITY)
  const after = Math.max(input.current, target)
  return {
    attribute: input.attribute,
    before: input.current,
    after,
    restored: after - input.current,
    wasFull: canFull,
  }
}

/**
 * A night's rest (R40 for SKILL; spec.md sealed for ENDURANCE).
 *
 * SKILL "recovers completely after a full night's rest" (R40). ENDURANCE
 * gets the sealed +4. LUCK gets nothing: its only recovery is a Temple
 * check (R42), and sleeping through one is not it.
 */
export const nightsRest = (state: {
  readonly skill: { readonly current: number; readonly initial: number }
  readonly endurance: { readonly current: number; readonly initial: number }
}): { readonly skill: Heal; readonly endurance: Heal } => ({
  skill: heal({
    attribute: 'SKILL',
    current: state.skill.current,
    max: state.skill.initial,
    full: true,
  }),
  endurance: heal({
    attribute: 'ENDURANCE',
    current: state.endurance.current,
    max: state.endurance.initial,
  }),
})
