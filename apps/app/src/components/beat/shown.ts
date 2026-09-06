/**
 * What the result slip prints, for each kind of result.
 *
 * Lifted out of `BeatScreen` unchanged when Phase 8a split the beat
 * into three candidate layouts: all three print the same result, so
 * the mapping from a `Result` to the eight things a slip shows has to
 * live somewhere none of them owns.
 *
 * Every string comes from the content package (`t`); nothing here is
 * copy (agents.md rule 7). Every citation comes from the engine's own
 * behaviour registry via `citeOf`, so a slip can never print a cite
 * the engine does not claim.
 */
import { t } from '@martial-havoc/content'
import type { Die as DieFace, Label } from '@martial-havoc/engine'
import { fill } from '../../lib/fill'
import { citeOf } from '../../state/reduce'
import type { RecordState, Result } from '../../state/types'

/** The eight fields a result slip renders, whatever laid it out. */
export type ShownResult = {
  readonly title: string
  readonly label: Label
  readonly pill: string
  /** The two dice, where the result had dice. Null renders nothing. */
  readonly a: DieFace | null
  readonly b: DieFace | null
  /** The big number, or the short text that stands in for one. */
  readonly total: string
  /** The line under it: what the roll was against. */
  readonly against: string
  readonly cite: string
}

/** Map one result and the sheet it happened to onto what a slip shows. */
export const shown = (r: Result, sheet: RecordState['sheet']): ShownResult => {
  switch (r.kind) {
    case 'check': {
      const id = r.check === 'skill' ? 'checks.skill-check' : 'checks.luck-check'
      const cite = citeOf(id)
      return {
        title: t(`ui.result.${r.check}.${r.success ? 'passed' : 'failed'}`),
        label: r.doubleSix ? 'invention' : 'rule',
        pill: r.doubleSix ? citeOf('checks.double-six-fails-every-check') : cite,
        a: r.roll.a,
        b: r.roll.b,
        total: String(r.roll.total),
        against:
          r.check === 'luck'
            ? fill(t('ui.result.against.luck'), { luck: r.threshold, after: r.luckAfter ?? '' })
            : r.proficiency === null
              ? fill(t('ui.result.against.skill.bare'), { skill: sheet.skill })
              : fill(t('ui.result.against.skill'), {
                  skill: sheet.skill,
                  value: r.proficiency.value,
                  name: r.proficiency.name.toUpperCase(),
                }),
        cite: r.doubleSix
          ? fill(t('ui.result.cite.double-six'), { cite })
          : fill(t('ui.result.cite.check'), {
              cite,
              total: r.roll.total,
              op: r.success ? '<=' : '>',
              threshold: r.threshold,
            }),
      }
    }
    case 'rest':
      return {
        title: t('ui.result.rest.title'),
        label: 'invention',
        pill: citeOf('healing.nights-rest-heals-four-endurance'),
        a: null,
        b: null,
        total: `+${r.after - r.before}`,
        against: fill(t('ui.result.rest.against'), { before: r.before, after: r.after }),
        cite: t('ui.result.rest.cite'),
      }
    case 'take':
      return {
        title: t('ui.result.take.title'),
        label: 'reading',
        pill: 'I-38',
        a: null,
        b: null,
        total: t(`ui.treasure.${r.treasure}`),
        against: fill(t('ui.result.take.against'), { n: r.held }),
        cite: t('ui.result.take.cite'),
      }
    case 'treasure':
      return {
        title: fill(t('ui.result.treasure.title'), { face: r.face }),
        label: 'rule',
        pill: citeOf('progression.treasure-band-by-endurance'),
        a: r.face,
        b: null,
        total: r.text,
        against: fill(t('ui.result.treasure.against'), { band: r.band }),
        cite: t('ui.result.treasure.cite'),
      }
  }
}

/** One line of the ledger: what a result reads as, in a sentence. */
export const ledgerLine = (s: ShownResult): string =>
  s.a === null ? `${s.title} — ${s.total}` : `${s.title} — ${s.a}+${s.b} = ${s.total}`
