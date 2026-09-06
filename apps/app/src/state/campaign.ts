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
import { theFiveTreasuresAreaById, theFiveTreasuresMeta } from '@martial-havoc/content'
import type { RecordState, Sheet } from './types'

/** The adventure the app plays. */
export const ADVENTURE_ID = theFiveTreasuresMeta.id

/**
 * The sheet as the record keeps it.
 *
 * `overspent` is false because the prototype plays a printed preset
 * (MH p.91-92, R83), which cannot overspend a creation pool by
 * definition. Phase 8's creation screen is what will set it, from
 * `creationClean`.
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
  // The record's one list holds both kinds by id prefix
  // (`RecordedMaster.techniques`: "Technique and Ritual ids").
  techniques: [...sheet.techniques, ...sheet.rituals],
  overspent: false,
})

/**
 * The cave's state as the session knows it: the engine's own
 * `AdventureState`, carried whole. Every field is real because the beat
 * drives the adventure through the engine's `step` (Phase 8c).
 */
const adventureFrom = (state: RecordState): AdventureState => state.cave

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
 *
 * A restored campaign is a Master who has already begun, so creation is
 * always cleared. The screen is only redirected when the base would
 * strand the player *in* creation — a stale or missing session snapshot
 * falls back to the fresh record, which opens on creation, and dropping
 * a returning player there on top of their own saved campaign would let
 * the first tap roll a new Master over it. A session that names a real
 * screen keeps it; carrying the screen is the session half's job.
 */
export const fromCampaign = (record: CampaignRecord, session: RecordState): RecordState => {
  const saved = record.adventures[ADVENTURE_ID]
  // A save that stands in an area this build does not have opens on the
  // session's cave instead, whole: a half-applied state would be worse.
  const cave =
    saved !== undefined && theFiveTreasuresAreaById(saved.area) !== undefined ? saved : session.cave
  return {
    ...session,
    creation: null,
    screen: session.screen === 'creation' ? 'beat' : session.screen,
    cave,
    pending: [],
    roll: null,
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
      techniques: record.master.techniques.filter((id) => id.startsWith('technique.')),
      rituals: record.master.techniques.filter((id) => id.startsWith('ritual.')),
    },
    deeds: record.deeds.map((deed) => deed.text),
    passages: record.passages,
    overrides: record.overrides,
  }
}
