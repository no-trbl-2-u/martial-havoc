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
import { actSatisfied, newCampaign } from '@martial-havoc/engine'
import type {
  AdventureState,
  CampaignRecord,
  ChronicleEntry,
  RecordedMaster,
} from '@martial-havoc/engine'
import {
  theFiveTreasures,
  theFiveTreasuresAreaById,
  theFiveTreasuresMeta,
} from '@martial-havoc/content'
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
  // Both optional on the record and both unversioned: nothing about an
  // older save became wrong when they arrived, and the migration chain
  // is keyed on estate readings that moved, not on fields that did not
  // exist (`CampaignRecord.actsSeen` states the rule).
  age: sheet.age,
  learned: sheet.learned,
  xp: sheet.xp,
  resources: sheet.resources,
})

/**
 * The cave's state as the session knows it: the engine's own
 * `AdventureState`, carried whole. Every field is real because the beat
 * drives the adventure through the engine's `step` (Phase 8c).
 */
const adventureFrom = (state: RecordState): AdventureState => state.cave

/** The durable half of a session, as the engine's record. */
export const toCampaign = (state: RecordState): CampaignRecord => ({
  ...newCampaign({ ...masterFrom(state.sheet), adventureScored: state.scoresBanked }),
  adventures: { [ADVENTURE_ID]: adventureFrom(state) },
  deeds: state.deeds.map((text) => ({ adventure: ADVENTURE_ID, text })),
  passages: state.passages,
  chronicle: state.chronicle,
  overrides: state.overrides,
  actsSeen: { [ADVENTURE_ID]: state.actsSeen },
})

/**
 * The acts a saved record has already announced.
 *
 * A record written by this build says so outright. One written before
 * Phase 10c does not carry the field at all, and the honest answer for
 * it is *not* "none": a Master standing in the Chieftain quarter with
 * Golden Horn dead has plainly passed acts one to four, whatever the
 * save says. So an absent field is filled from the acts the saved cave
 * state already satisfies, which replays nothing and needs no migration
 * step (see `CampaignRecord.actsSeen` for why there is none).
 *
 * The one thing this deliberately does not do is announce the act the
 * Master is *about* to see. `actSatisfied` is asked of the state as
 * saved, so a rung not yet climbed stays unclimbed and its slip still
 * arrives when it is earned.
 */
const actsSeenFrom = (record: CampaignRecord, cave: AdventureState): readonly number[] => {
  const saved = record.actsSeen?.[ADVENTURE_ID]
  if (saved !== undefined) return saved
  return theFiveTreasures.acts.filter((act) => actSatisfied(cave, act)).map((act) => act.act)
}

/**
 * The chronicle a saved record carries, or one built from what it kept.
 *
 * A record written by this build says outright what happened and in
 * what order. One written before Phase 10h kept only the deeds ledger,
 * and the honest reading of it is not "nothing happened": every line in
 * that ledger is a thing this Master did, in the order they did it. So
 * an absent chronicle is rebuilt from the deeds, one entry each, with
 * no room named - because the older record never recorded one, and
 * inventing a room for a line that has none would be putting words in
 * a save's mouth.
 */
const chronicleFrom = (record: CampaignRecord): readonly ChronicleEntry[] =>
  record.chronicle ??
  record.deeds.map((deed, i) => ({ turn: i + 1, area: null, kind: 'deed' as const, text: deed.text }))

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
    // A restored campaign never opens in creation. Where it would, it
    // opens where that Master actually is: the village until they have
    // taken the trail, the beat after (Phase 10b). Sending an
    // un-begun campaign to the beat would step over its own first act.
    screen:
      session.screen === 'creation'
        ? cave.visited.includes(theFiveTreasures.meta.startArea)
          ? 'beat'
          : 'village'
        : session.screen,
    cave,
    pending: [],
    // The weapon is in hand until an Unexpected Event takes it (I-30).
    weaponLost: false,
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
      // A record written before Phase 10f carries neither: it is a
      // Master whose age was never given and who has invented nothing,
      // which is exactly what such a record says.
      age: record.master.age ?? null,
      learned: record.master.learned ?? [],
      xp: record.master.xp ?? 0,
      resources: record.master.resources ?? 0,
    },
    deeds: record.deeds.map((deed) => deed.text),
    passages: record.passages,
    chronicle: chronicleFrom(record),
    scoresBanked: record.master.adventureScored ?? false,
    overrides: record.overrides,
    actsSeen: actsSeenFrom(record, cave),
  }
}
