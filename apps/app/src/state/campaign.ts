/**
 * The bridge between the session and the campaign (Phase 6).
 *
 * `RecordState` holds both halves at runtime: the campaign (the Master,
 * the ledger, what was written, what was typed, where in the cave) and
 * the session (which screen is open, the last result slip, the fight in
 * progress, the rules filter). Only the first half is durable, and the
 * engine owns its shape - `CampaignRecord` in
 * `packages/engine/src/campaign/record.ts`, versioned and migratable.
 *
 * These two functions are the only place the two shapes meet. Keeping
 * them here rather than in `persist.ts` means the mapping is testable
 * without touching storage, and keeping them out of the engine means the
 * engine never learns what a screen is.
 */
import { newCampaign } from '@martial-havoc/engine'
import type { AdventureState, CampaignRecord, RecordedMaster } from '@martial-havoc/engine'
import {
  areaByNumber,
  theFiveTreasuresAreas,
  theFiveTreasuresMeta,
  theFiveTreasuresTreasureById,
} from '@martial-havoc/content'
import type { RecordState, Sheet } from './types'

/** The adventure the prototype plays. */
export const ADVENTURE_ID = theFiveTreasuresMeta.id

/** Area id to the printed number the prototype screen indexes areas by. */
const AREA_NUMBER: ReadonlyMap<string, number> = new Map(
  theFiveTreasuresAreas.map((area) => [area.id, area.area]),
)

/** The treasure id prefix the prototype's short keys are missing. */
const TREASURE_PREFIX = 'treasure.the-5-treasures.'

/** A prototype treasure key ("vase-of-muttonfat-jade") to its full id. */
const treasureId = (key: string): string | undefined =>
  theFiveTreasuresTreasureById(`${TREASURE_PREFIX}${key}`)?.id

/**
 * The sheet as the record keeps it.
 *
 * `overspent` comes from the sheet, which the creation screen sets from
 * the engine's `creationClean` (`./creation.ts`). It is advisory and
 * never a refusal: Yin's printed sheet overspends both pools, loads
 * anyway, and the record remembers that it did (spec.md, Refusals).
 */
const masterFrom = (sheet: Sheet): RecordedMaster => ({
  name: sheet.name,
  skill: sheet.skill,
  skillInitial: sheet.skillInitial,
  endurance: sheet.endurance,
  enduranceInitial: sheet.enduranceInitial,
  luck: sheet.luck,
  gold: sheet.gold,
  dishonor: sheet.dishonor,
  proficiencies: sheet.proficiencies,
  techniques: sheet.techniques,
  overspent: sheet.overspent,
})

/**
 * The cave's state as the session knows it.
 *
 * The prototype tracks two of the eleven fields an `AdventureState` has:
 * where the Master stands, and which treasures they picked up. The rest
 * is left at its empty value rather than guessed - a record that claimed
 * a foe was defeated when the session never said so would be worse than
 * one that starts the cave fresh. Phase 8 drives the adventure through
 * the engine's own `step`, and then all eleven are real.
 */
const adventureFrom = (state: RecordState): AdventureState => ({
  adventure: ADVENTURE_ID,
  area: areaByNumber(state.area)?.id ?? theFiveTreasuresMeta.startArea,
  visited: [areaByNumber(state.area)?.id ?? theFiveTreasuresMeta.startArea],
  flags: {},
  defeated: [],
  keys: [],
  items: [],
  treasures: state.held.map(treasureId).filter((id): id is string => id !== undefined),
  hints: [],
  effects: [],
  rescued: [],
  dishonor: 0,
})

/** The durable half of a session, as the engine's record. */
export const toCampaign = (state: RecordState): CampaignRecord => ({
  ...newCampaign(masterFrom(state.sheet)),
  adventures: { [ADVENTURE_ID]: adventureFrom(state) },
  deeds: state.deeds.map((text) => ({ adventure: ADVENTURE_ID, text })),
  passages: state.passages,
  overrides: state.overrides,
})

/**
 * Lay a loaded campaign over a session.
 *
 * `session` is a fresh record (or a restored session snapshot); the
 * campaign's values win for every field it owns. A campaign that names
 * an area this build does not have falls back to the session's, which is
 * how a save from a build with more areas than this one still opens.
 */
export const fromCampaign = (record: CampaignRecord, session: RecordState): RecordState => {
  const cave = record.adventures[ADVENTURE_ID]
  const area = cave === undefined ? session.area : (AREA_NUMBER.get(cave.area) ?? session.area)
  return {
    ...session,
    area,
    sheet: {
      ...session.sheet,
      name: record.master.name,
      skill: record.master.skill,
      skillInitial: record.master.skillInitial,
      endurance: record.master.endurance,
      enduranceInitial: record.master.enduranceInitial,
      luck: record.master.luck,
      gold: record.master.gold,
      dishonor: record.master.dishonor,
      proficiencies: record.master.proficiencies,
      techniques: record.master.techniques,
      overspent: record.master.overspent,
    },
    deeds: record.deeds.map((deed) => deed.text),
    passages: record.passages,
    overrides: record.overrides,
    held: (cave?.treasures ?? [])
      .map((id) => id.slice(TREASURE_PREFIX.length))
      .filter((key) => treasureId(key) !== undefined),
  }
}
