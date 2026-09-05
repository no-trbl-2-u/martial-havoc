/**
 * Record types, one per record shape in `schema/content.schema.json`.
 *
 * These are hand-written rather than inferred from the JSON imports on
 * purpose. `resolveJsonModule` widens every string to `string` and every
 * literal to its primitive, so an inferred type would let `list: "wepons"`
 * or `label: "rulle"` through; naming the shape here means the compiler
 * checks the same thing the schema checks at test time, and the two are
 * read side by side when either changes.
 *
 * Everything is `readonly`: content is data the engine reads, never state
 * anything mutates (agents.md rule 7).
 */

/** The spec's three labels. */
export type Label = 'rule' | 'reading' | 'invention'

/** One d6 face. */
export type Die = 1 | 2 | 3 | 4 | 5 | 6

/** What every record carries, whatever its shape. */
export type BaseRecord = {
  readonly id: string
  readonly cite: string
  /** An inventory reading id, present only where a cell is inferred. */
  readonly reading?: string
}

/** A record addressed by a banded first die plus a second die. */
export type BandedRecord = BaseRecord & {
  readonly band: string
  readonly faces: readonly number[]
  readonly row: number
}

/** The file envelope every data file shares. */
export type TableFile<R> = {
  readonly id: string
  readonly kind: string
  readonly title: string
  readonly cite: string
  readonly label: Label
  readonly docs?: string
  readonly records: readonly R[]
}

/** `n` dice of `d` faces plus `plus`; `n: 0` is a flat amount. */
export type DiceSpec = {
  readonly n: number
  readonly d: number
  readonly plus: number
}

/** A Proficiency (or Technique/Ritual) name with its printed value. */
export type NamedValue = {
  readonly name: string
  readonly value: number
}

// ------------------------------------------------------------------ world

/** One of the 18 Martial Arts (MH p.7-10). */
export type MartialArt = BandedRecord & {
  readonly name: string
  readonly styleText: string
  readonly proficiencies: readonly string[]
  /** The style text's own power (R13), verbatim, or null. */
  readonly power: string | null
  readonly powerClass: string | null
}

/** A Technique (MH p.12-15) or a Ritual (MH p.16-19). */
export type Learnable = BaseRecord & {
  readonly d66: number
  readonly name: string
  readonly pinyin: string
  /** Resource points to learn (R16); ENDURANCE to perform (R18). */
  readonly cost: number
  readonly effect: string
}

/** One of the 12 Deities (MH p.29). */
export type Deity = BandedRecord & {
  readonly name: string
  readonly action: string
  readonly object: string
}

/** One of the 50 opponent stat blocks (MH p.70-79). */
export type Opponent = BaseRecord & {
  readonly name: string
  readonly description: string
  readonly skill: number
  readonly endurance: number
  /** As printed: a number, the range `2-4`, or null where blank. */
  readonly attack: number | string | null
  readonly proficiencies: readonly NamedValue[]
  /** The n of a `Martial Arts (n)` Proficiency (R75), else null. */
  readonly martialArtsValue: number | null
  readonly page: string
  readonly notes: string
}

/** Which Market list an item is printed on. */
export type MarketList = 'common' | 'weapons' | 'expedition' | 'armor'

/** A flag computed at data time and read (never recomputed) by the engine. */
export type MarketFlag = 'weapon' | 'alcohol' | 'underTwentyGp'

/** One priced line of the Market (MH p.52-55). */
export type MarketItem = BaseRecord & {
  readonly list: MarketList
  readonly item: string
  readonly priceGp: number | null
  readonly priceSp: number | null
  readonly flags: readonly MarketFlag[]
}

/** One cell of the Oracle (MH p.58). */
export type OracleCell = BaseRecord & {
  readonly row: string
  readonly face: number
  readonly text: string
  /** True where the estate inferred the span rather than the book printing it. */
  readonly spanInferred: boolean
}

/** One word cell of an Inspirations or Sparks table (MH p.59-63). */
export type Word = BaseRecord & {
  readonly table: string
  readonly d66: number
  readonly word: string
}

/** One of Appendix C's eight sheets (MH p.91-92), as printed. */
export type Preset = BaseRecord & {
  readonly name: string
  readonly age: number
  readonly status: string
  readonly equipment: readonly string[]
  readonly skill: number
  readonly endurance: number
  readonly luck: number
  readonly martialArt: string
  readonly proficiencies: readonly NamedValue[]
  readonly training: number
  readonly techniques: readonly string[]
  readonly rituals: readonly string[]
  readonly from: string
}

/** Sheet spelling to canonical table id. */
export type NameResolution = {
  readonly onSheet: string
  readonly canonicalId: string
  readonly canonicalName: string
}

// ------------------------------------------------------------------ rules

/** One of the 5 social-status bands (MH p.5, R03). */
export type SocialStatus = BaseRecord & {
  readonly faces: readonly number[]
  readonly status: string
  readonly goldDice: DiceSpec
}

/** One of the 18 Final Blow inspiration rows (MH p.26, R31). */
export type FinalBlow = BandedRecord & {
  readonly action: string
  readonly attribute: string
  readonly animal: string
}

/** One row of the Unexpected Event table (MH p.28, R32). */
export type UnexpectedEvent = BaseRecord & {
  readonly total: number
  readonly text: string
  /** The two Enemy-retreat rows; the sealed Morale reading sits on them. */
  readonly retreatRow: boolean
}

/** One row of the healing summary (MH p.31, R40-R42). */
export type Healing = BaseRecord & {
  readonly attribute: 'SKILL' | 'ENDURANCE' | 'LUCK'
  readonly partial: string
  readonly amount: number
  /** Null for LUCK: the book gives it no full-restore rule. */
  readonly full: string | null
}

/** One end-of-adventure score category (MH p.34, R43). */
export type XpCategory = BaseRecord & {
  readonly category: string
  readonly min: number
  readonly max: number | null
  readonly subtracted: boolean
}

/** What +1 costs at a current-SKILL band (MH p.34, R44). */
export type XpCost = BaseRecord & {
  readonly increase: string
  readonly band: string
  readonly cost: number
}

/** One cell of a d6-per-column table (Region p.43, Monastery p.45). */
export type ColumnCell = BaseRecord & {
  readonly column: string
  readonly face: number
  readonly text: string
  readonly note?: string
}

/** One band of a banded roll whose content is a single label (MH p.44). */
export type Band = BaseRecord & {
  readonly table: string
  readonly dice: '1d6' | '2d6'
  readonly totals: readonly number[]
  readonly text: string
  readonly note?: string
}

/** One line of the City Services price list (MH p.50, R64). */
export type CityService = BaseRecord & {
  readonly service: string
  /** Verbatim: the list prices per question, per dose, per day and per km. */
  readonly price: string
}

/** One of the 12 city-encounter rows (MH p.51, R65). */
export type CityEncounter = BandedRecord & {
  readonly connection: string
  readonly trait: string
}

/** One cell of the Encounters matrix (MH p.67, R74). */
export type EncounterCell = BaseRecord & {
  readonly total: number
  readonly column: string
  /** The cell verbatim, misspellings and italics included. */
  readonly printed: string
  readonly opponentRef: string | null
  /** Set where the cell redirects to another column instead of naming an opponent. */
  readonly redirectColumn: string | null
}

/** One cell of the Treasure table (MH p.68, R78). */
export type Treasure = BaseRecord & {
  readonly face: number
  readonly band: string
  readonly text: string
}

/** One row of the Special Items table (MH p.69, R79). */
export type SpecialItem = BaseRecord & {
  readonly total: number
  readonly name: string
  readonly effect: string
}

/** A d66 row whose whole content is one passage (the 36 hooks, MH p.36-39). */
export type D66Text = BaseRecord & {
  readonly d66: number
  readonly text: string
}
