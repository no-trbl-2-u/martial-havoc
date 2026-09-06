/**
 * A fresh record: San Te as printed, his gold rolled, a region thrown.
 *
 * The preset is the author's sheet (MH p.91-92, R83), loaded through the
 * engine by `./creation.ts` and never corrected. Gold is the social
 * status's dice (R03). The region is seven points on a plane (spec.md,
 * Horizon). All of it is a pure function of the dice passed in.
 *
 * San Te is the record's *default*, not its only Master: the creation
 * screen replaces the sheet with any of Appendix C's eight. A fresh
 * record still opens on one so the app has a playable Master before the
 * player has picked, and so a save from before creation shipped still
 * loads.
 */
import { throwRegion } from '@martial-havoc/engine'
import type { DiceSource } from '@martial-havoc/engine'
import { candidateFor } from './creation'
import type { RecordState, Sheet } from './types'

/** The sheet a fresh record starts on, before the player picks another. */
export const PRESET_ID = 'preset.san-te'

/** The Horizon's region: seven points. */
export const REGION_POINTS = 7

/** The sheet for a preset id, gold rolled from its status (R03). */
export const sheetFor =
  (presetId: string) =>
  (dice: DiceSource): Sheet =>
    candidateFor(presetId)(dice).sheet

/**
 * The same record, played by a different Master.
 *
 * Everything the previous Master earned or wrote is dropped - a new
 * Master is a new campaign, not a re-skin of an old one's ledger - and
 * everything the *world* is keeps its value: the region stays as it was
 * thrown, because the cave and the country do not change when someone
 * else walks into them.
 *
 * Rolls nothing. Creation's only die is the status's gold (R03), and
 * that was thrown when the sheet was read; re-rolling here would spend a
 * queued `?dice=` face on the Master instead of on their first check.
 */
export const withMaster = (state: RecordState, sheet: Sheet): RecordState => ({
  ...state,
  screen: 'beat',
  area: 2,
  sheet,
  result: null,
  manual: [],
  manualOpen: false,
  draft: '',
  passages: [],
  overrides: 0,
  deeds: [],
  held: [],
  combat: null,
  openId: null,
  picked: null,
})

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
  picked: null,
})
