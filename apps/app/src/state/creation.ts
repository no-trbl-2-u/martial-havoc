/**
 * Creation, as the app performs it: the eight printed sheets (MH p.91-92,
 * R83) loaded through the engine and turned into the `Sheet` the record
 * plays on.
 *
 * Everything mechanical here belongs to `@martial-havoc/engine`; every
 * table belongs to `@martial-havoc/content` (agents.md rule 7). This
 * module is the wiring between them and the screen: it binds the tables
 * once, rolls the one thing a printed sheet does not print, and flattens
 * the engine's `Creation` into the two flat shapes a component can read.
 *
 * Two deliberate calls, both in the book:
 *
 * - **Gold is rolled, not printed.** Appendix C prints a social status
 *   and no gold, so `loadPresetRecord` reports 0. R03 says the status's
 *   dice are thrown at creation, so this module throws them. That is the
 *   same thing `record.ts` did before creation had a screen.
 * - **Nothing refuses.** Yin's sheet spends 10 Proficiency points against
 *   a pool of 9 and 12 Resource points against 8. Both are reported as
 *   flags and Yin loads anyway (spec.md, Refusals: "Creation's pools are
 *   advisory"). The screen shows the flags; it never hides a Master.
 */
import { chooseSocialStatus, creationClean, loadPresetRecord, rollSpec } from '@martial-havoc/engine'
import type { CreationTables, DiceSource, Flag } from '@martial-havoc/engine'
import {
  canonicalIdForSheetName,
  market,
  martialArts,
  presetById,
  presetNameResolution,
  presets,
  rituals,
  socialStatuses,
  techniqueByName,
  techniques,
} from '@martial-havoc/content'
import type { Sheet } from './types'

/**
 * The creation tables, bound once.
 *
 * The engine takes its tables as an argument precisely so it never
 * imports the content package at runtime; this is the one place in the
 * app that hands them over.
 */
export const CREATION_TABLES: CreationTables = {
  martialArts,
  socialStatuses,
  techniques,
  rituals,
  market,
  presets,
  presetNameResolution,
}

/** A printed Technique name to its `technique.*` id, if the tables know it. */
const techniqueId = (onSheet: string): string | undefined =>
  canonicalIdForSheetName(onSheet) ?? techniqueByName(onSheet)?.id

/**
 * One Master a player may start from, as the creation screen shows it.
 *
 * Flat on purpose: the screen renders strings and numbers, and keeping
 * the engine's nested `Creation` out of the component is what lets the
 * engine's shape change without touching a view.
 */
export type Candidate = {
  readonly presetId: string
  /** The sheet the record would play, gold already rolled (R03). */
  readonly sheet: Sheet
  /** The Martial Art's printed name (R09). */
  readonly martialArt: string
  /** The social status's printed name (R02), or '' when the sheet names none. */
  readonly status: string
  readonly age: number
  /** Equipment lines in printed order, common clothing first (R02). */
  readonly equipment: readonly string[]
  /** Technique and Ritual names as the tables spell them (R16). */
  readonly learned: readonly string[]
  /** Proficiency pool: what R10 allowed against what the sheet spent. */
  readonly proficiencyPool: readonly [spent: number, pool: number]
  /** Resource pool: what R16 allowed against what the sheet spent. */
  readonly resourcePool: readonly [spent: number, pool: number]
  /** What the pools raised. Empty when the sheet is arithmetically clean. */
  readonly flags: readonly Flag[]
}

/**
 * Build one candidate from a preset id.
 *
 * Draws the social status's gold dice and nothing else, so a queued
 * `?dice=` run in a test is spent on the rolls the player makes rather
 * than on the Master they picked. Throws on an id the table does not
 * hold: that is a caller bug, the same as everywhere else in the engine.
 */
export const candidateFor =
  (presetId: string) =>
  (dice: DiceSource): Candidate => {
    const preset = presetById(presetId)
    if (preset === undefined) throw new Error(`unknown preset ${presetId}`)
    const { master, flags } = loadPresetRecord(CREATION_TABLES)(preset)
    const status = chooseSocialStatus(socialStatuses)(preset.status)
    const gold = status === undefined ? 0 : rollSpec(status.goldDice)(dice).sum
    return {
      presetId,
      sheet: {
        name: master.name,
        skill: master.attributes.skill.current,
        skillInitial: master.attributes.skill.initial,
        endurance: master.attributes.endurance.current,
        enduranceInitial: master.attributes.endurance.initial,
        luck: master.attributes.luck.current,
        gold,
        dishonor: master.dishonor,
        proficiencies: master.proficiencies,
        techniques: preset.techniques
          .map(techniqueId)
          .filter((id): id is string => id !== undefined),
        overspent: !creationClean(flags),
      },
      martialArt: master.martialArt.name,
      status: status?.status ?? '',
      age: master.age,
      equipment: master.equipment.map((item) => item.name),
      learned: [
        ...flags.resources.learned.techniques.map((l) => l.name),
        ...flags.resources.learned.rituals.map((l) => l.name),
      ],
      proficiencyPool: [flags.proficiencies.spent, flags.proficiencies.pool],
      resourcePool: [flags.resources.spent, flags.resources.pool],
      flags: flags.raised,
    }
  }

/**
 * Every candidate, in printed order, on one shared dice source.
 *
 * The screen builds this once per visit so the gold beside each name is
 * stable while the player reads down the list; picking one does not
 * re-roll it.
 */
export const allCandidates = (dice: DiceSource): readonly Candidate[] =>
  presets.map((preset) => candidateFor(preset.id)(dice))
