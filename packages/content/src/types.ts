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
  /**
   * A spirit or ghost, immune to ordinary blows (R77).
   *
   * The printed stat block does not say so in any cell; the tag comes
   * from reading I-29, which names the roster, and a tagged record
   * carries `reading: 'I-29'` alongside its `cite`. The engine reads
   * this and never recomputes it: `ordinaryBlowsPass` takes the flag
   * as an argument precisely so no opponent name lives in the engine
   * (agents.md standing rule 7).
   */
  readonly incorporeal: boolean
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

/** Which engine procedure a village location runs, or null for the trail. */
export type VillageProcedure = 'buy' | 'temple' | 'inn'

/**
 * One place in the trail-head village (spec.md, Horizon).
 *
 * The village is this build's invention - "a trail-head village is a
 * City on fixed data" - so every record cites the Horizon. The
 * procedure each location runs is the book's: `buy` is the Market
 * table at printed prices (MH p.52-55), `temple` is the Spirituality
 * check for +1 LUCK (MH p.47, R58), `inn` is a meal and a night's rest
 * (MH p.31, R40, plus spec.md's sealed +4 ENDURANCE).
 */
export type VillagePlace = BaseRecord & {
  /** `location` is somewhere to stand and act; `trail` is the way out. */
  readonly kind: 'location' | 'trail'
  readonly name: string
  /** The authored line a screen reads here. Copy lives in data, never in a component. */
  readonly blurb: string
  /** Null on the trail, which leads somewhere rather than doing something. */
  readonly procedure: VillageProcedure | null
  /** For the trail, the `adventure.*` id it leads to; null for a location. */
  readonly destination: string | null
  /** The inn's bed-and-meal price in silver; null elsewhere. Invented - the book prices no inn. */
  readonly roomPriceSp: number | null
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

/** A23's five-way classification of a Technique or Ritual effect. */
export type EffectClass =
  | 'mechanical'
  | 'combat-narrative'
  | 'exploration'
  | 'oracle-like'
  | 'summoning'

/** When a Technique or Ritual may be used (R14, R25, I-23, I-24). */
export type EffectTiming = 'immediate' | 'combat-winner-option' | 'scene' | 'preparation'

/**
 * One authored effect record for a Technique or a Ritual (MH p.12-19; A23).
 *
 * The printed effect text is not here: it stays verbatim on the
 * {@link Learnable} this record's `ref` names. A23 is the estate's one
 * ambiguity row with no defensible inference, so every record of this
 * shape is an invention of this build and the file carries that label.
 */
export type Effect = BaseRecord & {
  /** The `technique.*` or `ritual.*` id this is the effect of. */
  readonly ref: string
  readonly class: EffectClass
  /** Resource points to learn, ENDURANCE to perform; equals the referenced cost. */
  readonly cost: number
  readonly timing: EffectTiming
  /** The engine call the class implies, or null for a narrative-only effect. */
  readonly operation: string | null
  /** R13's Ritual-timing exception for Wudang, as a flag rather than a branch. */
  readonly wudangException?: boolean
  /** The authored line the table reads when the effect fires. */
  readonly line: string
}

/**
 * One authored line for a transcribed record that prints none: an Oracle
 * cell (MH p.58) or an Unexpected Event row (MH p.28).
 */
export type AuthoredLine = BaseRecord & {
  /** The id of the transcribed record this line belongs to. */
  readonly ref: string
  readonly line: string
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

/**
 * One weapon that passes R77's gate against an incorporeal opponent.
 *
 * R77 names the category ("a technique, ritual, or exceptional weapon")
 * and lists no members; reading I-29 names the three this build counts.
 * `ref` is the id of the record that already holds the weapon - a
 * {@link SpecialItem}, an {@link AdventureTreasure}, or the
 * {@link Preset} sheet that carries it as an equipment line - so the
 * name is transcribed in exactly one place and this record only says
 * that the gate opens for it.
 */
export type ExceptionalWeapon = BaseRecord & {
  readonly name: string
  /** The id of the record that holds this weapon. */
  readonly ref: string
  /** Why this one counts, in one line. */
  readonly note: string
}

/** A d66 row whose whole content is one passage (the 36 hooks, MH p.36-39). */
export type D66Text = BaseRecord & {
  readonly d66: number
  readonly text: string
}

// ------------------------------------------------------------- prototype

/** One area as the beat screen shows it (5T a1; the line is ours). */
export type Beat = BaseRecord & {
  readonly area: number
  /** The area's printed title, verbatim. */
  readonly name: string
  /** The authored line read when the Master stands here. */
  readonly line: string
}

/** The engine action a beat menu entry performs. */
export type MenuAction =
  | 'skill-check'
  | 'luck-check'
  | 'rest'
  | 'go'
  | 'fight'
  | 'take'
  | 'leave-cave'

/** One entry of the beat menu: what the rules allow here, and its line. */
export type MenuOption = BaseRecord & {
  readonly area: number
  readonly title: string
  /** The short mechanical note beside the title (SKILL CHECK, +4 END, AREA 3). */
  readonly note: string
  readonly line: string
  readonly action: MenuAction
  /** An area number for `go`, a foe id for `fight`, a treasure key for `take`. */
  readonly target?: string
  /** For `skill-check`: the one Proficiency that adds to the threshold (R20). */
  readonly proficiency?: string
}

/** The rules panel's note on one engine behaviour, keyed by `ref`. */
export type BehaviourNote = BaseRecord & {
  /** The behaviour id in the engine registry. */
  readonly ref: string
  readonly text: string
  /** The plain-words sentence the rules panel lists it under. */
  readonly title?: string
  readonly says?: string
  readonly silent?: string
  readonly source?: string
  readonly reversed?: string
}

// ------------------------------------------------------- adventure format

/**
 * The adventure format, v1. One record type per file of an adventure
 * directory; the shapes are defined in `schema/content.schema.json` and
 * documented in `schema/adventure-format.md`.
 *
 * Every record but {@link AdventureMeta} carries `adventure`: the id of
 * the meta record it belongs to. That field is what makes a directory
 * one document, and it is what lets a lookup take "the areas of *this*
 * adventure" out of a package that may hold several.
 */

/** What every record of an adventure carries besides {@link BaseRecord}. */
export type AdventureRecord = BaseRecord & {
  /** The {@link AdventureMeta} id this record belongs to. */
  readonly adventure: string
}

/** The header record of one adventure: exactly one per directory. */
export type AdventureMeta = BaseRecord & {
  /** The format version these files are written in; the engine refuses an unknown one. */
  readonly version: string
  readonly title: string
  /** The premise paragraph, verbatim. */
  readonly premise: string
  /** The {@link AdventureArea} id the Master begins in. */
  readonly startArea: string
  /** The licence and credit line, verbatim. */
  readonly credits: string
}

/** A lock on entering an area: the key that opens it, and what the door is. */
export type AreaGate = {
  /** A key id an {@link AdventureLoot} row can drop. */
  readonly key: string
  /** The door as the source describes it, verbatim. */
  readonly text: string
}

/** A stat-blocked NPC who is a rescue rather than an enemy (I-39). */
export type AreaRescue = {
  /** The opponent id of the NPC. */
  readonly foe: string
  /** How the source introduces them, verbatim. */
  readonly text: string
  /** True where attacking them costs the Master honour rather than earning a fight. */
  readonly dishonorOnAttack: boolean
}

/** One area of an adventure: a place, its ways out, its lock and its prizes. */
export type AdventureArea = AdventureRecord & {
  /** The area's printed number. */
  readonly area: number
  readonly name: string
  /** The printed description, verbatim. */
  readonly description: string
  /** The grey Hint paragraph, verbatim; hidden until earned (I-60). */
  readonly hint: string
  /** The authored line the beat screen reads. Ours. */
  readonly line: string
  /** The ids of the areas reachable from here; undirected, so listed both ways. */
  readonly exits: readonly string[]
  readonly gate: AreaGate | null
  /** Treasure ids found here by exploration rather than as loot (I-38). */
  readonly treasures: readonly string[]
  readonly rescue: AreaRescue | null
}

/** How many of a foe an encounter row brings. */
export type EncounterCount = 'one' | 'band' | 'oracle' | 'none'

/** One row of an area's encounter table. */
export type AdventureEncounter = AdventureRecord & {
  /** The printed number of the area whose table this row is in. */
  readonly area: number
  /** The 1d6 faces landing on this row; empty for a fixed encounter (I-34). */
  readonly faces: readonly number[]
  /** The opponent ids met; two ids is a multiple combat (R35). */
  readonly foes: readonly string[]
  readonly count: EncounterCount
  /** True where the row meets nothing and the event degrades (I-36). */
  readonly empty: boolean
}

/** One row of a foe's printed LOOT line. */
export type AdventureLoot = AdventureRecord & {
  /** The opponent id whose LOOT line this row is part of. */
  readonly foe: string
  /** The 1d6 faces landing on this row; empty for a single named drop. */
  readonly faces: readonly number[]
  /** The drop as printed, verbatim. */
  readonly item: string
  /** A treasure id where the drop is one of the adventure's named treasures. */
  readonly treasure: string | null
  /** A key id where the drop opens a gate; two foes may drop the same one (I-07). */
  readonly key: string | null
  /** True where the printed drop is a Hint rather than an object (I-08). */
  readonly hint: boolean
  /** True where the drop exists in one copy only (I-33c). */
  readonly once: boolean
}

/** Where a treasure comes from. */
export type TreasureSource = 'area' | 'loot'

/** One of an adventure's named treasures. */
export type AdventureTreasure = AdventureRecord & {
  readonly name: string
  /** How the treasure works, verbatim; spoiler-gated like a Hint (I-60). */
  readonly effect: string
  readonly source: TreasureSource
  /** The area id or foe id named by {@link source}. */
  readonly sourceRef: string
  /** Ids that reveal the effect short of holding it; empty = on acquiring. */
  readonly knownFrom: readonly string[]
}

/** One per-adventure flag: a named boolean the tables read. */
export type AdventureFlag = AdventureRecord & {
  readonly flag: string
  readonly initial: boolean
  readonly text: string
}

/** "While this flag holds, this foe is not met in this area" (I-45). */
export type AdventureAbsence = AdventureRecord & {
  /** The printed area number, or 0 for every area of the adventure. */
  readonly area: number
  readonly foe: string
  readonly flag: string
  /** The flag value that makes the foe absent. */
  readonly whenTrue: boolean
  readonly text: string
}

/** What advances a Master into an act. */
export type ActCondition = 'start' | 'enter' | 'defeated' | 'treasures'

/** One act marker; the one with `ending` is the ending screen. */
export type AdventureAct = AdventureRecord & {
  /** Ascending from 1; the highest satisfied act is current. */
  readonly act: number
  readonly name: string
  readonly condition: ActCondition
  /** A count for `treasures`, an id for `enter` and `defeated`, null for `start`. */
  readonly threshold: number | string | null
  /** The authored line the marker reads. Ours. */
  readonly line: string
  /** True on exactly one row per adventure. */
  readonly ending: boolean
}

/**
 * Every table of one adventure, in one object.
 *
 * This is the argument the engine's adventure module takes. The engine
 * imports no data: a caller loads an adventure (from this package, or
 * from anywhere else that can produce these shapes) and hands it over.
 */
export type AdventureTables = {
  readonly meta: AdventureMeta
  readonly events: readonly Band[]
  readonly areas: readonly AdventureArea[]
  readonly encounters: readonly AdventureEncounter[]
  readonly loot: readonly AdventureLoot[]
  readonly treasures: readonly AdventureTreasure[]
  readonly flags: readonly AdventureFlag[]
  readonly absences: readonly AdventureAbsence[]
  readonly acts: readonly AdventureAct[]
  /** The foes the encounter and loot rows reference, in the opponent shape. */
  readonly foes: readonly Opponent[]
}
