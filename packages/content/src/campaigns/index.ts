/**
 * The campaign layer: what an adventure can be about.
 *
 * Phase 2 shipped the d66 table of hooks the book prints (MH p.36-39,
 * R50). The prototype slice added The 5 Treasures' nine foes as printed
 * (5T a2) and three of its eight areas as the beat screen shows them,
 * with a menu per area.
 *
 * Phase 5 adds the whole cave, written in the adventure format
 * (`schema/adventure-format.md`): nine files under
 * `data/campaigns/the-5-treasures/`, with the foes file unchanged and
 * referenced by id. The prototype's `beats` and `options` stay exported
 * because the shipped screen still reads them; Phase 8 rebuilds that
 * screen on `theFiveTreasures` and retires them. `campaigns.test.ts`
 * asserts the two agree on the three area names they share, so they
 * cannot drift in the meantime.
 */
import hooksFile from '../../data/campaigns/adventure-hooks.json'
import foesFile from '../../data/campaigns/the-5-treasures-foes.json'
import beatsFile from '../../data/campaigns/the-5-treasures-prototype-beats.json'
import optionsFile from '../../data/campaigns/the-5-treasures-prototype-options.json'

import metaFile from '../../data/campaigns/the-5-treasures/adventure.json'
import eventsFile from '../../data/campaigns/the-5-treasures/events.json'
import areasFile from '../../data/campaigns/the-5-treasures/areas.json'
import encountersFile from '../../data/campaigns/the-5-treasures/encounters.json'
import lootFile from '../../data/campaigns/the-5-treasures/loot.json'
import adventureTreasuresFile from '../../data/campaigns/the-5-treasures/treasures.json'
import flagsFile from '../../data/campaigns/the-5-treasures/flags.json'
import absencesFile from '../../data/campaigns/the-5-treasures/absences.json'
import actsFile from '../../data/campaigns/the-5-treasures/acts.json'

import { byD66, byId, inColumn } from '../lookup'
import type {
  AdventureAbsence,
  AdventureAct,
  AdventureArea,
  AdventureEncounter,
  AdventureFlag,
  AdventureLoot,
  AdventureMeta,
  AdventureTables,
  AdventureTreasure,
  Band,
  Beat,
  D66Text,
  MenuOption,
  Opponent,
} from '../types'

/** The 36 adventure hooks (MH p.36-39, R50). */
export const adventureHooks: readonly D66Text[] = Object.freeze(
  hooksFile.records as readonly D66Text[],
)
export const adventureHookById = byId(adventureHooks)
export const rollAdventureHook = byD66(adventureHooks)

/** The nine stat blocks of The 5 Treasures (5T a2), in the opponent shape. */
export const treasureFoes: readonly Opponent[] = Object.freeze(
  foesFile.records as readonly Opponent[],
)
export const treasureFoeById = byId(treasureFoes)

/** The prototype slice's areas: printed name, authored line (5T a1; ours). */
export const prototypeBeats: readonly Beat[] = Object.freeze(beatsFile.records as readonly Beat[])
/** The beat for one printed area number, or undefined outside the slice. */
export const beatForArea = (area: number): Beat | undefined =>
  prototypeBeats.find((b) => b.area === area)

/** The prototype slice's menu, every entry with its action and its line. */
export const prototypeOptions: readonly MenuOption[] = Object.freeze(
  optionsFile.records as readonly MenuOption[],
)
export const optionById = byId(prototypeOptions)
/** Every menu entry offered in one area, in printed order. */
export const optionsForArea = inColumn(prototypeOptions, 'area')

// ------------------------------------------------- The 5 Treasures, in format

/**
 * The cave, written in the adventure format (v1).
 *
 * Nine files under `data/campaigns/the-5-treasures/`, plus the nine
 * stat blocks that already shipped as `treasureFoes` above. The
 * `as` casts are the same deliberate hand-typing the rest of the
 * package uses: `resolveJsonModule` widens every literal, so the
 * shapes in `../types` are what the compiler checks and
 * `content.test.ts` checks the same shapes again against the schema.
 */

/** The header of The 5 Treasures: version, premise, start area, credits. */
export const theFiveTreasuresMeta: AdventureMeta = Object.freeze(
  metaFile.records[0] as AdventureMeta,
)

/** The 1d6 event table rolled every time an area is entered (5T a1). */
export const theFiveTreasuresEvents: readonly Band[] = Object.freeze(
  eventsFile.records as readonly Band[],
)

/** The eight areas, description and Hint verbatim (5T a1). */
export const theFiveTreasuresAreas: readonly AdventureArea[] = Object.freeze(
  areasFile.records as readonly AdventureArea[],
)

/** The per-area encounter tables (5T a1). */
export const theFiveTreasuresEncounters: readonly AdventureEncounter[] = Object.freeze(
  encountersFile.records as readonly AdventureEncounter[],
)

/** Every printed LOOT band of the nine foes (5T a2). */
export const theFiveTreasuresLoot: readonly AdventureLoot[] = Object.freeze(
  lootFile.records as readonly AdventureLoot[],
)

/** The five named treasures, effect verbatim (5T a2). */
export const theFiveTreasuresTreasures: readonly AdventureTreasure[] = Object.freeze(
  adventureTreasuresFile.records as readonly AdventureTreasure[],
)

/** The adventure's own clock and states (I-40, I-45, I-38b, I-41). */
export const theFiveTreasuresFlags: readonly AdventureFlag[] = Object.freeze(
  flagsFile.records as readonly AdventureFlag[],
)

/** Conditional absences: the Cave entrance's Ogres by night (I-45). */
export const theFiveTreasuresAbsences: readonly AdventureAbsence[] = Object.freeze(
  absencesFile.records as readonly AdventureAbsence[],
)

/** The act markers, the last of them the ending screen (ours). */
export const theFiveTreasuresActs: readonly AdventureAct[] = Object.freeze(
  actsFile.records as readonly AdventureAct[],
)

/**
 * Every table of The 5 Treasures in one object, ready to hand to the
 * engine's adventure module.
 *
 * The engine takes this as an argument and imports nothing: that is what
 * keeps a second adventure a matter of writing files (see
 * `schema/adventure-format.md` §4).
 */
export const theFiveTreasures: AdventureTables = Object.freeze({
  meta: theFiveTreasuresMeta,
  events: theFiveTreasuresEvents,
  areas: theFiveTreasuresAreas,
  encounters: theFiveTreasuresEncounters,
  loot: theFiveTreasuresLoot,
  treasures: theFiveTreasuresTreasures,
  flags: theFiveTreasuresFlags,
  absences: theFiveTreasuresAbsences,
  acts: theFiveTreasuresActs,
  foes: treasureFoes,
})

/** One area of the cave by its id. */
export const theFiveTreasuresAreaById = byId(theFiveTreasuresAreas)
/** One area of the cave by its printed number, or undefined. */
export const areaByNumber = (area: number): AdventureArea | undefined =>
  theFiveTreasuresAreas.find((a) => a.area === area)
/** Every encounter row of one printed area number, in printed order. */
export const encountersForArea = inColumn(theFiveTreasuresEncounters, 'area')
/** Every LOOT band of one foe id, in printed order. */
export const lootForFoe = inColumn(theFiveTreasuresLoot, 'foe')
/** One named treasure of the cave by its id. */
export const theFiveTreasuresTreasureById = byId(theFiveTreasuresTreasures)
