/**
 * What the result slip prints, for each kind of result.
 *
 * Lifted out of `BeatScreen` unchanged when Phase 8a split the beat
 * into three candidate layouts: all three printed the same result, so
 * the mapping from a `Result` to the things a slip shows had to live
 * somewhere none of them owned. It stays split now the Sheet
 * arrangement has won, because resolving a result and drawing one are
 * different jobs.
 *
 * Every string comes from the content package (`t`); nothing here is
 * copy (agents.md rule 7). Every citation comes from the engine's own
 * behaviour registry via `citeOf` or from the adventure's folio, so a
 * slip can never print a cite the engine does not claim. The citation
 * is folded behind a tap on every surface (`components/Source`): the
 * pill carries the label alone.
 *
 * `passage` is the book's own words for what the roll brought, where
 * it has any: the Hint an Event revealed, or the printed description
 * of whoever was met. It stands where the plate would, so the moment
 * a foe appears the player reads who it is, not a drawing of a door.
 *
 * `narrator` is the one field on this type that is not the book's:
 * Old Ping's line for the moment (Phase 10a, `plan/VOICE.md`), already
 * filled with the Master's name. It is resolved here, beside the
 * book's own words for the same result, precisely so the two can be
 * seen to agree — `lib/narrator.ts` picks the moment from the same
 * fields `brought()` reads. It renders under a dashed rule and never
 * inside the book's text (`components/Narrator`).
 */
import { t, theFiveTreasuresAreas, treasureFoes } from '@martial-havoc/content'
import type { Die as DieFace, Label } from '@martial-havoc/engine'
import { fill } from '../../lib/fill'
import { narrateResult } from '../../lib/narrator'
import { citeOf } from '../../state/reduce'
import type { RecordState, Result } from '../../state/types'

/** The fields a result slip renders, whatever laid it out. */
export type ShownResult = {
  readonly title: string
  readonly label: Label
  /** The citation the label stands on; folded on screen. */
  readonly pill: string
  /** The two dice, where the result had dice. Null renders nothing. */
  readonly a: DieFace | null
  readonly b: DieFace | null
  /** The big number, or the short text that stands in for one. */
  readonly total: string
  /** The line under it: what the roll was against, or what it brought. */
  readonly against: string
  readonly cite: string
  /** The book's words for what was brought, or null where it printed none. */
  readonly passage: string | null
  /** The narrator's line for this moment, filled; null where he keeps quiet. */
  readonly narrator: string | null
}

/** What a turn's Event brought, worded. */
const brought = (r: Extract<Result, { kind: 'turn' }>): string => {
  if (r.foes.length > 0) return fill(t('ui.cave.event.met'), { names: r.foes.join(', ') })
  if (r.hint) return t('ui.cave.event.hint')
  if (r.event === 'safe') return t('ui.cave.event.safe')
  return t('ui.cave.event.nothing')
}

/**
 * The printed words behind a turn: the area's Hint when the Event
 * revealed it, or the stat block's description of each foe met (5T a1,
 * a2). The result carries printed names, so the lookup is by name.
 */
const turnPassage = (r: Extract<Result, { kind: 'turn' }>): string | null => {
  if (r.foes.length > 0) {
    const lines = r.foes
      .map((name) => treasureFoes.find((f) => f.name === name)?.description)
      .filter((d): d is string => d !== undefined && d.length > 0)
    return lines.length === 0 ? null : lines.join('\n')
  }
  if (r.hint) return theFiveTreasuresAreas.find((a) => a.name === r.area)?.hint ?? null
  return null
}

/**
 * Map one result and the sheet it happened to onto what a slip shows.
 *
 * The narrator's line is added once, at the end, rather than in each
 * branch: it depends on the result and the Master's name alone, and
 * putting it in six places would be six places for the slip and the
 * line to drift apart.
 */
export const shown = (r: Result, sheet: RecordState['sheet']): ShownResult => ({
  ...book(r, sheet),
  narrator: narrateResult(r, sheet.name),
})

/** Everything on a slip that comes from the book. Ours is added by {@link shown}. */
const book = (r: Result, sheet: RecordState['sheet']): Omit<ShownResult, 'narrator'> => {
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
        passage: null,
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
        passage: null,
      }
    case 'take':
      return {
        title: t('ui.result.take.title'),
        label: 'reading',
        pill: t('ui.result.take.cite'),
        a: null,
        b: null,
        total: r.treasure,
        against: fill(t('ui.result.take.against'), { n: r.held }),
        cite: t('ui.result.take.cite'),
        passage: null,
      }
    case 'turn':
      return {
        title: fill(t('ui.cave.event.title'), { event: r.eventText.toUpperCase() }),
        label: 'rule',
        pill: t('ui.cave.cite.a1'),
        a: r.eventFace,
        b: r.encounterFace,
        total: r.eventText,
        against: brought(r),
        cite: fill(t('ui.cave.event.cite'), { area: r.area }),
        passage: turnPassage(r),
      }
    case 'loot':
      return {
        title: fill(t(r.gift ? 'ui.cave.gift.title' : 'ui.cave.loot.title'), { name: r.foe.toUpperCase() }),
        label: 'rule',
        pill: t('ui.cave.cite.a2'),
        a: r.face,
        b: null,
        total: r.treasure ?? r.item,
        against: r.hint
          ? t('ui.cave.loot.hint')
          : r.gift
            ? t('ui.cave.loot.gift')
            : r.treasure === null
              ? r.key
                ? t('ui.cave.loot.key')
                : t('ui.cave.loot.item')
              : t('ui.cave.loot.treasure'),
        cite: t('ui.cave.loot.cite'),
        passage: null,
      }
    case 'flee':
      return {
        title: fill(t('ui.result.flee.title'), { name: r.foe.toUpperCase() }),
        // The escape's cost is the book's (R38: a last blow of 2); the
        // Dishonor Point for not getting away clean is I-32's reading
        // of a rule the book states for a different case, so the slip
        // carries the reading's label rather than the rule's.
        label: 'reading',
        pill: citeOf('escape.stratagem-and-the-two-is-damage'),
        a: null,
        b: null,
        total: `-${r.before - r.after}`,
        against: fill(t('ui.result.flee.against'), { after: r.after, dishonor: r.dishonor }),
        cite: t('ui.result.flee.cite'),
        passage: null,
      }
    case 'note':
      return {
        title: r.title,
        label: r.label,
        pill: r.cite,
        a: null,
        b: null,
        total: r.text,
        against: '',
        cite: r.cite,
        passage: null,
      }
  }
}
