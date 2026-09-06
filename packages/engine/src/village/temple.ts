/**
 * The shrine of the three stars (MH p.47, R58; reading I-58).
 *
 * R58, verbatim: "If you have incense, you can attempt a Spirituality
 * check (SKILL check plus any Martial Proficiency or Technique that
 * may help you) at the three stars of good fortune - Sanxing. If
 * successful, you recover 1 LUCK point."
 *
 * This is the only LUCK recovery in the book (R42 gives LUCK no full
 * restore at all), which makes it the one place a depleting clock can
 * be wound back — and why the gates on it matter more than the roll.
 *
 * Three gates, in the order they are checked:
 *
 * 1. **Incense** (R58, printed). No incense, no attempt. The engine
 *    holds no inventory, so the caller says whether the Master has
 *    the 5 SP stick the Market sells.
 * 2. **Once per day** (reading I-58). The book gives no count; the
 *    estate's reading fixes one check per day, and this module
 *    enforces exactly that and nothing more.
 * 3. **The sealed double six** (spec.md) — inherited from `check`,
 *    which fails a double six whatever the threshold.
 *
 * What it deliberately omits: I-58 also says a second check in a day
 * "risks -1 LUCK", and R58 warns that "abusing the patience of the
 * gods could cause the opposite effect, or worse, bring a curse".
 * Both are *risks*, with no trigger and no die named. Turning a risk
 * into a penalty would be inventing a rule the book declines to give,
 * so a second visit simply does not roll. Recorded as a follow-up in
 * the phase 7 brief.
 */
import { skillCheck } from '../checks/checks'
import type { CheckOutcome } from '../checks/checks'
import type { DiceSource } from '../dice/types'
import { heal } from '../healing/healing'
import type { Heal } from '../healing/healing'

/** Why a Temple visit did not roll at all. */
export type TempleRefusal = 'no-incense' | 'already-visited-today'

/** What a Temple visit is asked for. */
export type TempleVisitInput = {
  /** The Master's SKILL — the Spirituality check is a SKILL check (R58). */
  readonly skill: number
  /**
   * The value of the one relevant Proficiency or Technique, if any
   * (Spirituality is a Proficiency of Shaolin Quan). Zero, or absent,
   * for a Master without it: R12 says it "simply will not add points",
   * it does not forbid the attempt.
   */
  readonly proficiency?: number
  /** The Master's current LUCK. */
  readonly luck: number
  /** The LUCK to recover *to* — the Master's initial value (R05). */
  readonly maxLuck?: number
  /** R58's condition: does the Master have incense? */
  readonly hasIncense: boolean
  /** I-58's condition: has a check already been made today? */
  readonly visitedToday: boolean
}

/** What a Temple visit produced. */
export type TempleVisit = {
  /** False when a gate stopped it before the dice (`reason` says which). */
  readonly attempted: boolean
  readonly reason?: TempleRefusal
  /** The Spirituality check, when one was rolled. */
  readonly outcome?: CheckOutcome
  /** The LUCK recovery. Zero-restore on a failed check, absent on a refusal. */
  readonly heal?: Heal
  /** The LUCK the Master is left with. Unchanged unless the check passed. */
  readonly luck: number
}

/**
 * Attempt the Spirituality check at Sanxing.
 *
 * Curried on the input so the dice arrive last, matching `checks.ts`
 * and `region.ts`: the caller binds a Master once and hands it a
 * `DiceSource`. The engine rolls no dice of its own (agents.md rule 7).
 *
 * A gated visit spends no dice at all — it returns before touching the
 * source — which is what lets a replayed save reproduce a run exactly:
 * a refused visit must not consume a face.
 */
export const templeVisit =
  (input: TempleVisitInput) =>
  (dice: DiceSource): TempleVisit => {
    if (!input.hasIncense) {
      return { attempted: false, reason: 'no-incense', luck: input.luck }
    }
    if (input.visitedToday) {
      return { attempted: false, reason: 'already-visited-today', luck: input.luck }
    }
    // `exactOptionalPropertyTypes` is on: an explicit `proficiency:
    // undefined` is not the same as an absent one, so the key is only
    // spread in when there is a value. R12's "simply will not add
    // points" is the zero case, and the check's own `?? 0` covers it.
    const outcome = skillCheck({
      skill: input.skill,
      ...(input.proficiency === undefined ? {} : { proficiency: input.proficiency }),
    })(dice)
    const recovered = heal({
      attribute: 'LUCK',
      current: input.luck,
      ...(input.maxLuck === undefined ? {} : { max: input.maxLuck }),
    })
    return outcome.success
      ? { attempted: true, outcome, heal: recovered, luck: recovered.after }
      : {
          attempted: true,
          outcome,
          heal: { ...recovered, after: input.luck, restored: 0 },
          luck: input.luck,
        }
  }
