/**
 * A fresh record: San Te as printed, his gold rolled, a region thrown.
 *
 * The preset is the author's sheet (MH p.91-92, R83) read from the
 * content package and never corrected. Gold is the social status's dice
 * (R03). The region is seven points on a plane (spec.md, Horizon). All
 * of it is a pure function of the dice passed in.
 */
import { COMMON_CLOTHING, beginAdventure, chooseSocialStatus, martialArtBySheetName, rollSpec, throwRegion } from '@martial-havoc/engine'
import type { DiceSource } from '@martial-havoc/engine'
import {
  canonicalIdForSheetName,
  martialArts,
  presetById,
  presetNameResolution,
  ritualByName,
  socialStatuses,
  techniqueByName,
  theFiveTreasures,
} from '@martial-havoc/content'
import { emptyCreation } from './creation'
import type { RecordState, Sheet } from './types'

/** The one sheet the prototype plays. Phase 8 adds creation and the other seven. */
export const PRESET_ID = 'preset.san-te'

/** The Horizon's region: seven points. */
export const REGION_POINTS = 7

/** A printed Technique name to its `technique.*` id, if the tables know it. */
const techniqueId = (onSheet: string): string | undefined =>
  canonicalIdForSheetName(onSheet) ?? techniqueByName(onSheet)?.id

/** The sheet for a preset id, gold rolled from its status (R03). */
export const sheetFor =
  (presetId: string) =>
  (dice: DiceSource): Sheet => {
    const preset = presetById(presetId)
    if (preset === undefined) throw new Error(`unknown preset ${presetId}`)
    const status = chooseSocialStatus(socialStatuses)(preset.status)
    const gold = status === undefined ? 0 : rollSpec(status.goldDice)(dice).sum
    const art = martialArtBySheetName(martialArts, presetNameResolution)(preset.martialArt)
    return {
      name: preset.name,
      age: preset.age,
      martialArtId: art?.id ?? null,
      skill: preset.skill,
      skillInitial: preset.skill + preset.training,
      endurance: preset.endurance,
      enduranceInitial: preset.endurance,
      luck: preset.luck,
      luckInitial: preset.luck,
      gold,
      dishonor: 0,
      proficiencies: preset.proficiencies,
      training: preset.training,
      techniques: preset.techniques
        .map(techniqueId)
        .filter((id): id is string => id !== undefined),
      rituals: preset.rituals
        .map((name) => canonicalIdForSheetName(name) ?? ritualByName(name)?.id)
        .filter((id): id is string => id !== undefined),
      equipment: [COMMON_CLOTHING.name, ...preset.equipment],
      xp: 0,
    }
  }

/**
 * A new record at the cave entrance (area 2), region thrown.
 *
 * The sheet is San Te's until the player makes their own: a record has
 * to have numbers for the strip to draw, and a half-made Master has
 * none. `creation` being non-null is what says "this Master has not
 * begun yet"; the creation screen replaces the sheet when they do.
 */
export const newRecord = (dice: DiceSource): RecordState => ({
  version: 1,
  screen: 'creation',
  // The book's first area: the Flat-top mountain (5T a1, `startArea`).
  cave: beginAdventure(theFiveTreasures),
  pending: [],
  sheet: sheetFor(PRESET_ID)(dice),
  result: null,
  roll: null,
  manual: [],
  manualOpen: false,
  byHand: false,
  draft: '',
  passages: [],
  overrides: 0,
  deeds: [],
  combat: null,
  filter: 'all',
  openId: null,
  region: throwRegion(REGION_POINTS)(dice),
  here: 0,
  creation: emptyCreation(),
  // The purse in silver (MH p.52). The sheet keeps gold for the strip;
  // this is the same money at the resolution prices are printed in.
  silver: 0,
  incense: false,
  templeVisitedToday: false,
  villageNote: null,
  importDraft: '',
  importNote: null,
})
