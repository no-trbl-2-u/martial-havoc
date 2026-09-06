/**
 * A fresh record: San Te as printed, his gold rolled, a region thrown.
 *
 * The preset is the author's sheet (MH p.91-92, R83) read from the
 * content package and never corrected. Gold is the social status's dice
 * (R03). The region is seven points on a plane (spec.md, Horizon). All
 * of it is a pure function of the dice passed in.
 */
import { chooseSocialStatus, rollSpec, throwRegion } from '@martial-havoc/engine'
import type { DiceSource } from '@martial-havoc/engine'
import {
  canonicalIdForSheetName,
  presetById,
  socialStatuses,
  techniqueByName,
} from '@martial-havoc/content'
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
    return {
      name: preset.name,
      skill: preset.skill,
      skillInitial: preset.skill,
      endurance: preset.endurance,
      enduranceInitial: preset.endurance,
      luck: preset.luck,
      gold,
      dishonor: 0,
      proficiencies: preset.proficiencies,
      techniques: preset.techniques
        .map(techniqueId)
        .filter((id): id is string => id !== undefined),
    }
  }

/** A new record at the cave entrance (area 2), region thrown. */
export const newRecord = (dice: DiceSource): RecordState => ({
  version: 1,
  screen: 'beat',
  area: 2,
  sheet: sheetFor(PRESET_ID)(dice),
  result: null,
  manual: [],
  manualOpen: false,
  draft: '',
  passages: [],
  overrides: 0,
  deeds: [],
  held: [],
  combat: null,
  filter: 'all',
  openId: null,
  region: throwRegion(REGION_POINTS)(dice),
  here: 0,
})
