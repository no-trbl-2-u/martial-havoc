/**
 * The rules tables: what the book's procedures roll on.
 *
 * Same shape as `../world/index.ts` — the JSON is imported and cast once
 * to its hand-written record type, and each table exports the lookups its
 * own dice use. Nothing here interprets a rule; the engine does that, over
 * tables it is handed (agents.md rule 7).
 */
import socialStatusFile from '../../data/rules/social-status.json'
import finalBlowFile from '../../data/rules/final-blow.json'
import unexpectedEventsFile from '../../data/rules/unexpected-events.json'
import unexpectedEventLinesFile from '../../data/rules/unexpected-event-lines.json'
import healingFile from '../../data/rules/healing.json'
import xpCategoriesFile from '../../data/rules/xp-categories.json'
import xpCostsFile from '../../data/rules/xp-costs.json'
import regionFile from '../../data/rules/region.json'
import monasteryFile from '../../data/rules/monastery.json'
import distancesFile from '../../data/rules/distances.json'
import cityServicesFile from '../../data/rules/city-services.json'
import cityEncountersFile from '../../data/rules/city-encounters.json'
import encountersFile from '../../data/rules/encounters.json'
import treasuresFile from '../../data/rules/treasures.json'
import specialItemsFile from '../../data/rules/special-items.json'
import exceptionalWeaponsFile from '../../data/rules/exceptional-weapons.json'

import { byBanded, byFaces, byId, byTotal, byTotals, inColumn } from '../lookup'
import type {
  AuthoredLine,
  Band,
  CityEncounter,
  CityService,
  ColumnCell,
  EncounterCell,
  ExceptionalWeapon,
  FinalBlow,
  Healing,
  SocialStatus,
  SpecialItem,
  Treasure,
  UnexpectedEvent,
  XpCategory,
  XpCost,
} from '../types'

/** The 5 social-status bands (MH p.5, R03). */
export const socialStatuses: readonly SocialStatus[] = Object.freeze(
  socialStatusFile.records as readonly SocialStatus[],
)
export const socialStatusById = byId(socialStatuses)
/** 1d6 for status and its starting gold. */
export const rollSocialStatus = byFaces(socialStatuses)

/** The 18 Final Blow inspiration rows (MH p.26, R31). */
export const finalBlows: readonly FinalBlow[] = Object.freeze(
  finalBlowFile.records as readonly FinalBlow[],
)
export const finalBlowById = byId(finalBlows)
export const rollFinalBlow = byBanded(finalBlows)

/** The Unexpected Event table (MH p.28, R32). */
export const unexpectedEvents: readonly UnexpectedEvent[] = Object.freeze(
  unexpectedEventsFile.records as readonly UnexpectedEvent[],
)
export const unexpectedEventById = byId(unexpectedEvents)
export const rollUnexpectedEvent = byTotal(unexpectedEvents)
/** The two Enemy-retreat rows; Morale on them is sealed in spec.md. */
export const retreatRows: readonly UnexpectedEvent[] = Object.freeze(
  unexpectedEvents.filter((e) => e.retreatRow),
)

/** The 11 authored Unexpected Event lines (MH p.28), one per row. */
export const unexpectedEventLines: readonly AuthoredLine[] = Object.freeze(
  unexpectedEventLinesFile.records as readonly AuthoredLine[],
)
export const unexpectedEventLineFor = (ref: string): AuthoredLine | undefined =>
  unexpectedEventLines.find((l) => l.ref === ref)

/** The healing summary (MH p.31, R40-R42). */
export const healing: readonly Healing[] = Object.freeze(healingFile.records as readonly Healing[])
export const healingFor = (attribute: Healing['attribute']): Healing | undefined =>
  healing.find((h) => h.attribute === attribute)

/** End-of-adventure scoring (MH p.34, R43-R44). */
export const xpCategories: readonly XpCategory[] = Object.freeze(
  xpCategoriesFile.records as readonly XpCategory[],
)
export const xpCosts: readonly XpCost[] = Object.freeze(xpCostsFile.records as readonly XpCost[])
export const xpCostFor =
  (increase: string) =>
  (band: string): XpCost | undefined =>
    xpCosts.find((c) => c.increase === increase && c.band === band)

/** The Region table (MH p.43, R52) and the Monastery table (MH p.45, R56). */
export const region: readonly ColumnCell[] = Object.freeze(
  regionFile.records as readonly ColumnCell[],
)
export const monastery: readonly ColumnCell[] = Object.freeze(
  monasteryFile.records as readonly ColumnCell[],
)
export const regionColumn = inColumn(region, 'column')
export const monasteryColumn = inColumn(monastery, 'column')
/** One d6 on one named column of a d6-per-column table. */
export const rollColumn =
  (cells: readonly ColumnCell[]) =>
  (column: string) =>
  (face: number): ColumnCell | undefined =>
    cells.find((c) => c.column === column && c.face === face)

/** Route type on 2d6 and road features on 1d6 (MH p.44, R54-R55). */
export const distances: readonly Band[] = Object.freeze(distancesFile.records as readonly Band[])
export const rollRouteType = byTotals(distances.filter((b) => b.table === 'Route type'))
export const rollRoadFeature = byTotals(distances.filter((b) => b.table === 'Road feature'))

/** City Services (MH p.50, R64) and city encounters (MH p.51, R65). */
export const cityServices: readonly CityService[] = Object.freeze(
  cityServicesFile.records as readonly CityService[],
)
export const cityServiceById = byId(cityServices)
export const cityEncounters: readonly CityEncounter[] = Object.freeze(
  cityEncountersFile.records as readonly CityEncounter[],
)
export const rollCityEncounter = byBanded(cityEncounters)

/** The Encounters matrix (MH p.67, R74). */
export const encounters: readonly EncounterCell[] = Object.freeze(
  encountersFile.records as readonly EncounterCell[],
)
export const encounterColumn = inColumn(encounters, 'column')
/** 2d6 on one named column; a cell may redirect instead of naming an opponent. */
export const rollEncounter =
  (column: string) =>
  (total: number): EncounterCell | undefined =>
    encounters.find((c) => c.column === column && c.total === total)

/** Treasures (MH p.68, R78) and Special Items (MH p.69, R79). */
export const treasures: readonly Treasure[] = Object.freeze(
  treasuresFile.records as readonly Treasure[],
)
/** 1d6 against the defeated opponent's ENDURANCE band. */
export const rollTreasure =
  (band: string) =>
  (face: number): Treasure | undefined =>
    treasures.find((t) => t.band === band && t.face === face)
export const specialItems: readonly SpecialItem[] = Object.freeze(
  specialItemsFile.records as readonly SpecialItem[],
)
export const rollSpecialItem = byTotal(specialItems)

/**
 * The three weapons R77's gate opens for (MH p.66, reading I-29).
 *
 * Not a table the book prints: R77 names the category and lists no
 * members, so this is a `reading`-labelled file of our own. Each row
 * points at the record that holds the weapon (`ref`); nothing here
 * re-transcribes a name, and `content.test.ts` asserts every `ref`
 * resolves.
 */
export const exceptionalWeapons: readonly ExceptionalWeapon[] = Object.freeze(
  exceptionalWeaponsFile.records as readonly ExceptionalWeapon[],
)
export const exceptionalWeaponById = byId(exceptionalWeapons)

/**
 * Does the record with this id hold an exceptional weapon (R77)?
 *
 * Total: an id that names nothing, or names an ordinary Market weapon,
 * is `false`. Pair with the engine's `ordinaryBlowsPass`, which takes
 * the answer rather than the id - the engine names no weapon of its own
 * (agents.md standing rule 7).
 */
export const isExceptionalWeapon = (ref: string): boolean =>
  exceptionalWeapons.some((w) => w.ref === ref)
