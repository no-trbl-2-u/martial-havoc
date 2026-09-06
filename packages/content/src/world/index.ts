/**
 * The world tables: the lists a Master is built from and the tables the
 * sandbox is rolled on.
 *
 * One module, one export per table, each a frozen typed array with the
 * lookups that table's dice actually use. The JSON is imported (the
 * bundler inlines it; there is no I/O at runtime) and cast once to the
 * hand-written record type - see `../types.ts` for why the type is
 * written rather than inferred.
 */
import martialArtsFile from '../../data/world/martial-arts.json'
import techniquesFile from '../../data/world/techniques.json'
import ritualsFile from '../../data/world/rituals.json'
import deitiesFile from '../../data/world/deities.json'
import opponentsFile from '../../data/world/opponents.json'
import marketFile from '../../data/world/market.json'
import villageFile from '../../data/world/village.json'
import oracleFile from '../../data/world/oracle.json'
import inspirationsFile from '../../data/world/inspirations.json'
import sparksFile from '../../data/world/sparks.json'
import presetsFile from '../../data/world/presets.json'
import effectsFile from '../../data/world/effects.json'
import oracleLinesFile from '../../data/world/oracle-lines.json'

import { byBanded, byD66, byId, byName, inColumn } from '../lookup'
import type {
  AuthoredLine,
  Deity,
  Effect,
  Learnable,
  MarketItem,
  VillagePlace,
  MartialArt,
  NameResolution,
  Opponent,
  OracleCell,
  Preset,
  Word,
} from '../types'

/** The 18 Martial Arts (MH p.7-10), banded d6 x d6. */
export const martialArts: readonly MartialArt[] = Object.freeze(
  martialArtsFile.records as readonly MartialArt[],
)
export const martialArtById = byId(martialArts)
export const martialArtByName = byName(martialArts, 'name')
/** First die picks the band, second the row (R09). */
export const rollMartialArt = byBanded(martialArts)

/** The 36 Techniques (MH p.12-15), d66. */
export const techniques: readonly Learnable[] = Object.freeze(
  techniquesFile.records as readonly Learnable[],
)
export const techniqueById = byId(techniques)
export const techniqueByName = byName(techniques, 'name')
export const techniqueByD66 = byD66(techniques)

/** The 36 Rituals (MH p.16-19), d66. */
export const rituals: readonly Learnable[] = Object.freeze(
  ritualsFile.records as readonly Learnable[],
)
export const ritualById = byId(rituals)
export const ritualByName = byName(rituals, 'name')
export const ritualByD66 = byD66(rituals)

/** The 12 Deities (MH p.29), banded d6 x d6 (R34). */
export const deities: readonly Deity[] = Object.freeze(deitiesFile.records as readonly Deity[])
export const deityById = byId(deities)
export const rollDeity = byBanded(deities)

/** The 50 opponent stat blocks (MH p.70-79, R80). */
export const opponents: readonly Opponent[] = Object.freeze(
  opponentsFile.records as readonly Opponent[],
)
export const opponentById = byId(opponents)
export const opponentByName = byName(opponents, 'name')

/** The four Market price lists (MH p.52-55). */
export const market: readonly MarketItem[] = Object.freeze(
  marketFile.records as readonly MarketItem[],
)
export const marketItemById = byId(market)
export const marketItemByName = byName(market, 'item')
export const marketList = inColumn(market, 'list')
/** Everything R02 lets a new Master take as their one starting item. */
export const startingKitItems: readonly MarketItem[] = Object.freeze(
  market.filter((item) => item.flags.includes('underTwentyGp')),
)

/**
 * The trail-head village, as fixed data (spec.md, Horizon).
 *
 * Four records: three locations and the one trail out. Fixed, not
 * rolled - the same doorstep to the cave on every run, which is the
 * whole point of "a City on fixed data".
 */
export const villagePlaces: readonly VillagePlace[] = Object.freeze(
  villageFile.records as readonly VillagePlace[],
)
export const villagePlaceById = byId(villagePlaces)
/** The three places the Master can stand in and act. */
export const villageLocations: readonly VillagePlace[] = Object.freeze(
  villagePlaces.filter((place) => place.kind === 'location'),
)
/** The way out: the trail to the Flat-top mountain. */
export const villageTrail: VillagePlace | undefined = villagePlaces.find(
  (place) => place.kind === 'trail',
)

/** The Oracle's 11 rows x 6 faces (MH p.58, R71). */
export const oracle: readonly OracleCell[] = Object.freeze(
  oracleFile.records as readonly OracleCell[],
)
export const oracleCellById = byId(oracle)
export const oracleRow = inColumn(oracle, 'row')
/** One d6 on a named row; an unknown row or face returns undefined. */
export const consultOracle =
  (row: string) =>
  (face: number): OracleCell | undefined =>
    oracle.find((cell) => cell.row === row && cell.face === face)

/** The two Inspirations tables, `action` and `theme` (MH p.59-60, R72). */
export const inspirations: readonly Word[] = Object.freeze(
  inspirationsFile.records as readonly Word[],
)
export const inspirationById = byId(inspirations)
/** Roll d66 on the named table; `action` or `theme`. */
export const rollInspiration =
  (table: string) =>
  (tens: number, ones: number): Word | undefined =>
    inspirations.find((w) => w.table === table && w.d66 === tens * 10 + ones)

/** The six Sparks tables, 216 words (MH p.60-63, R73). */
export const sparks: readonly Word[] = Object.freeze(sparksFile.records as readonly Word[])
export const sparkById = byId(sparks)
/** 1d6 for the table, then d66 for the word. */
export const rollSpark =
  (table: number) =>
  (tens: number, ones: number): Word | undefined =>
    sparks.find((w) => w.table === String(table) && w.d66 === tens * 10 + ones)

/** Appendix C's eight sheets (MH p.91-92, R83), as printed. */
export const presets: readonly Preset[] = Object.freeze(presetsFile.records as readonly Preset[])
export const presetById = byId(presets)
export const presetByName = byName(presets, 'name')

/**
 * Sheet spelling to canonical table id.
 *
 * The sheets abbreviate and re-capitalise ("Wing Chun" for Red Boat Wing
 * Chun, "Pluck the phoenix's Eye" for Tear out a phoenix's eye). This map
 * is how a preset's free text becomes a table lookup without editing what
 * the sheet prints.
 */
export const presetNameResolution: readonly NameResolution[] = Object.freeze(
  presetsFile.nameResolution as readonly NameResolution[],
)

/** Resolve a name as printed on a sheet to its canonical id, if it differs. */
/**
 * The 72 authored effect records (MH p.12-19; A23), one per Technique
 * and Ritual. `byRef` is the lookup every caller wants: the transcribed
 * record is what a player picks, and this is what it does.
 */
export const effects: readonly Effect[] = Object.freeze(effectsFile.records as readonly Effect[])
export const effectById = byId(effects)
export const effectFor = (ref: string): Effect | undefined => effects.find((e) => e.ref === ref)
/** Every effect of one of A23's five classes, in printed order. */
export const effectsOfClass = inColumn(effects, 'class')

/** The 66 authored Oracle lines (MH p.58), one per cell. */
export const oracleLines: readonly AuthoredLine[] = Object.freeze(
  oracleLinesFile.records as readonly AuthoredLine[],
)
export const oracleLineFor = (ref: string): AuthoredLine | undefined =>
  oracleLines.find((l) => l.ref === ref)

export const canonicalIdForSheetName = (onSheet: string): string | undefined =>
  presetNameResolution.find((r) => r.onSheet.toLowerCase() === onSheet.trim().toLowerCase())
    ?.canonicalId
