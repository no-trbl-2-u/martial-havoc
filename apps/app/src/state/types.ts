/**
 * The record the prototype plays on, and the actions that move it.
 *
 * One immutable value holds everything the screens show: the Master's
 * sheet, the area, the last result, the fight in progress, the region,
 * the player's passages and the override count (spec.md, Horizon: "one
 * campaign record"). `reduce` in `./reduce.ts` is the only thing that
 * makes a new one. Nothing here is a class and nothing is mutated.
 */
import type {
  AdventureState,
  AttackStrength,
  Die,
  EventKind,
  FightEnd,
  FinalBlowRoll,
  Label,
  Morale,
  NamedValue,
  Region,
  RoundOutcome,
  TwoD6Roll,
  UnexpectedEventRoll,
} from '@martial-havoc/engine'

/** The screens of the frame. */
export type Screen =
  | 'creation'
  | 'beat'
  | 'combat'
  | 'rules'
  | 'region'
  | 'village'
  | 'record'
  | 'about'

/**
 * Where creation has got to, in the book's own order (R02-R19).
 *
 * `who` asks the one question the book does not — a name, and whether
 * to take a printed sheet (R83) or roll one — and every step after it
 * is a rule. `ready` is a made Master who has not yet begun.
 */
export type CreationStep =
  | 'who'
  | 'standing'
  | 'numbers'
  | 'art'
  | 'training'
  | 'spend'
  | 'kit'
  | 'ready'

/** The order the steps run in, which is the order the book prints them. */
export const CREATION_STEPS: readonly CreationStep[] = [
  'who',
  'standing',
  'numbers',
  'art',
  'training',
  'spend',
  'kit',
  'ready',
]

/** A rolled attribute as creation holds it, before it reaches a sheet. */
export type RolledAttribute = { readonly current: number; readonly initial: number }

/**
 * A Master part-way through being made.
 *
 * Nothing here is a `Sheet` yet: a half-made Master has no ENDURANCE to
 * be hit in, and pretending otherwise would let the rest of the app
 * read a number that has not been rolled. `finishCreation` in
 * `./creation.ts` is the one place this becomes a sheet.
 */
export type CreationState = {
  readonly step: CreationStep
  readonly name: string
  /** Set when the player took one of the eight printed sheets (R83). */
  readonly presetId: string | null
  /** R02, R03: the social band and the gold its dice gave. */
  readonly status: { readonly id: string; readonly name: string; readonly gold: number } | null
  /** R04, R05. */
  readonly skill: RolledAttribute | null
  readonly endurance: RolledAttribute | null
  readonly luck: RolledAttribute | null
  /** R09. */
  readonly martialArtId: string | null
  /** R15-R17: points bought, each costing 1 SKILL and giving 4 resources. */
  readonly training: number
  /** R10: Proficiency name to the points put on it. */
  readonly proficiencies: Readonly<Record<string, number>>
  /** R16: the `technique.*` ids learned. */
  readonly techniqueIds: readonly string[]
  /** R02: the one starting item, a `market.*` id. */
  readonly kitItemId: string | null
}

/** The Master's numbers as the strip shows them, with the initial values R05 asks us to keep. */
export type Sheet = {
  readonly name: string
  readonly skill: number
  readonly skillInitial: number
  readonly endurance: number
  readonly enduranceInitial: number
  readonly luck: number
  /** R05: what LUCK started at — the ceiling the shrine restores toward. */
  readonly luckInitial: number
  readonly gold: number
  readonly dishonor: number
  readonly proficiencies: readonly NamedValue[]
  /** Technique ids (`technique.*`), resolved from the sheet's printed names. */
  readonly techniques: readonly string[]
}

/** A check resolved on the beat screen (R20, R21). */
export type CheckResult = {
  readonly kind: 'check'
  readonly check: 'skill' | 'luck'
  readonly roll: TwoD6Roll
  readonly threshold: number
  readonly success: boolean
  readonly doubleSix: boolean
  /** The one Proficiency that entered a SKILL check, or null. */
  readonly proficiency: NamedValue | null
  /** LUCK after a LUCK check's unconditional decrement (R21). */
  readonly luckAfter: number | null
}

/** A night's rest (R40; spec.md sealed for ENDURANCE). */
export type RestResult = {
  readonly kind: 'rest'
  readonly before: number
  readonly after: number
}

/** A treasure picked up by exploration (5T a2, I-38). */
export type TakeResult = {
  readonly kind: 'take'
  /** The treasure's printed name. */
  readonly treasure: string
  readonly held: number
}

/**
 * One turn of the adventure's own procedure (5T a1): the area walked
 * into, the Event rolled on entering, and what it brought.
 */
export type TurnResult = {
  readonly kind: 'turn'
  /** The printed name of the area entered. */
  readonly area: string
  readonly eventFace: Die
  readonly event: EventKind
  /** The Event row's printed text ("Ambush!", "Encounter", ...). */
  readonly eventText: string
  /** The face rolled on the area's creature table, or null where none was drawn. */
  readonly encounterFace: Die | null
  /** The printed names of the foes met; empty where nothing was. */
  readonly foes: readonly string[]
  /** True where the Event revealed this area's Hint. */
  readonly hint: boolean
}

/** A foe's LOOT line read after a victory or a rescue (5T a2). */
export type LootResult = {
  readonly kind: 'loot'
  /** The printed name of who carried it. */
  readonly foe: string
  /** The face rolled, or null where the line names one drop. */
  readonly face: Die | null
  /** The printed item text. */
  readonly item: string
  /** The treasure's printed name where the drop was one of the five. */
  readonly treasure: string | null
  readonly key: boolean
  /** Read from a rescue's line rather than a body's: given, not taken. */
  readonly gift: boolean
  /** The row was a Hint (I-08): the area's grey paragraph, revealed. */
  readonly hint: boolean
}

/** A line of feedback that is not a roll: a rescue, what the sheets taught. */
export type NoteResult = {
  readonly kind: 'note'
  readonly title: string
  readonly text: string
  readonly label: Label
  readonly cite: string
}

/**
 * Something the village did (MH p.47, p.52-55; spec.md, Horizon).
 *
 * Not a `Result`: the village's outcomes are not all rolls, and the
 * result slip is built to show a roll. This is the village's own line
 * of feedback, held separately so neither has to pretend to be the
 * other.
 */
export type VillageNote = {
  readonly text: string
  /** The check, when the shrine rolled one. */
  readonly roll: TwoD6Roll | null
  readonly cite: string
}

/** What the result slip shows, when it shows anything. */
export type Result = CheckResult | RestResult | TakeResult | TurnResult | LootResult | NoteResult

/**
 * The roll card over the beat (design/roll-modal, reading A; the
 * operator's pick and notes of 2026-09-06).
 *
 * The beat's one roll is the adventure's: the Event table on entering
 * an area (5T a1). Tapping an exit rolls at once and the card opens
 * landed: the result, the dice, the plate, one CONTINUE. With MY DICE
 * on, the same tap opens the card not yet landed: the picker for the
 * face on the table, and CONTINUE resolves the move on it. `to` names
 * the area either way. Null is the resting state: no card.
 */
export type RollCard = { readonly to: string; readonly landed: boolean }

/** The last round rolled, both sides kept whole so both dice can be shown. */
export type RoundShown = {
  readonly master: AttackStrength
  readonly opponent: AttackStrength
  readonly outcome: RoundOutcome['kind']
  /** Master minus opponent; negative when the Master was hit. */
  readonly difference: number
}

/** The Unexpected Event a tie produced (R32), with its row and line. */
export type EventShown = {
  readonly roll: UnexpectedEventRoll
  readonly text: string
  readonly line: string
  readonly retreatRow: boolean
}

/** A fight in progress or just finished. */
export type Combat = {
  readonly foeId: string
  readonly foeEndurance: number
  readonly round: number
  readonly last: RoundShown | null
  readonly event: EventShown | null
  readonly morale: Morale | null
  readonly opening: boolean
  readonly blow: FinalBlowRoll | null
  /** The authored line of the Technique last used, if one was. */
  readonly techniqueLine: string | null
  /** The LOOT line has been read (once per victory). */
  readonly looted: boolean
  readonly over: FightEnd
}

/** The rules panel's filter: every label, or one. */
export type Filter = 'all' | Label

/**
 * The whole record: the campaign and the session together, at runtime.
 *
 * Only the campaign half is durable, and the engine owns its shape and
 * its migrations (`CampaignRecord`); `./campaign.ts` maps between the
 * two and `./persist.ts` writes them under separate keys. `version` is
 * this runtime shape's own tag, not the save format's - a saved
 * campaign's version lives on the record the engine wrote.
 */
export type RecordState = {
  readonly version: 1
  readonly screen: Screen
  /**
   * The cave as the engine keeps it: where the Master stands, what they
   * hold, who is gone (`packages/engine/src/adventure`). The beat is
   * derived from this and the adventure's tables, never from a number.
   */
  readonly cave: AdventureState
  /** Foe ids the last Event brought and the Master has not yet fought or fled. */
  readonly pending: readonly string[]
  readonly sheet: Sheet
  readonly result: Result | null
  /** The roll card over the beat, or null. */
  readonly roll: RollCard | null
  /** Faces the player tapped for the next roll; read in order. */
  readonly manual: readonly Die[]
  /** The fight's inline picker is open. */
  readonly manualOpen: boolean
  /** MY DICE on the beat: the next move's Event die is entered by hand. */
  readonly byHand: boolean
  readonly draft: string
  readonly passages: readonly string[]
  /** How many rolls were typed instead of rolled (spec.md, Horizon). */
  readonly overrides: number
  readonly deeds: readonly string[]
  readonly combat: Combat | null
  readonly filter: Filter
  readonly openId: string | null
  readonly region: Region
  /** The region point the Master stands at. */
  readonly here: number
  /**
   * The Master being made, or null once one has begun.
   *
   * Null is the resting state: a record that is being played has a
   * sheet, not a creation. A record that has never been played has a
   * creation and a placeholder sheet.
   */
  readonly creation: CreationState | null
  /** The Master's purse in silver (1 GP = 10 SP, MH p.52). */
  readonly silver: number
  /** Whether a stick of incense is carried (R58's condition). */
  readonly incense: boolean
  /** Whether the shrine has already been visited today (I-58). */
  readonly templeVisitedToday: boolean
  /** The last thing the village said, or null. */
  readonly villageNote: VillageNote | null
  /** What has been pasted into the import field, unread. */
  readonly importDraft: string
  /** What the last import attempt said, or null. Already worded. */
  readonly importNote: string | null
}

/** Everything a screen may ask the record to do. */
export type Action =
  | { readonly type: 'nav'; readonly screen: Screen }
  /** Walk into an adjacent area: the Event roll, and the card (5T a1). */
  | { readonly type: 'cave.go'; readonly to: string }
  /** Pick up a treasure lying here (I-38). */
  | { readonly type: 'cave.take'; readonly treasure: string }
  /** Free the rescue here; the reward is their LOOT line (I-39). */
  | { readonly type: 'cave.rescue' }
  /** Attack the rescue instead: Dishonor, then the fight (I-39). */
  | { readonly type: 'cave.attack' }
  /** Learn what this area teaches about the treasures (I-38b, I-41). */
  | { readonly type: 'cave.learn' }
  /** Face one of the foes the Event brought. */
  | { readonly type: 'cave.fight'; readonly foe: string }
  /** A night's rest here (R40; spec.md sealed). */
  | { readonly type: 'cave.rest' }
  /** Open the gourd, or close it again: the night flag (I-45). */
  | { readonly type: 'cave.gourd' }
  /** Out of the adventure and into the region (spec.md, Horizon). */
  | { readonly type: 'cave.leave' }
  /** MY DICE on the beat: toggle entering the next move's die by hand. */
  | { readonly type: 'roll.manual' }
  /** CONTINUE on a picker card: resolve the move on the tapped face. */
  | { readonly type: 'roll' }
  /** CONTINUE on a landed card, or a tap outside a picker: close it. The result stays. */
  | { readonly type: 'roll.close' }
  | { readonly type: 'manual.toggle' }
  | { readonly type: 'manual.cancel' }
  | { readonly type: 'manual.face'; readonly face: Die }
  | { readonly type: 'draft'; readonly text: string }
  | { readonly type: 'passage.keep' }
  | { readonly type: 'combat.round' }
  | { readonly type: 'combat.strike' }
  | { readonly type: 'combat.technique'; readonly id: string }
  | { readonly type: 'combat.weapon' }
  | { readonly type: 'combat.opening' }
  | { readonly type: 'combat.blow' }
  | { readonly type: 'combat.morale' }
  /** After a victory: the foe's LOOT line (5T a2). */
  | { readonly type: 'combat.loot' }
  | { readonly type: 'combat.leave' }
  | { readonly type: 'rules.filter'; readonly filter: Filter }
  | { readonly type: 'rules.open'; readonly id: string | null }
  | { readonly type: 'region.travel'; readonly to: number }
  | { readonly type: 'record.new' }
  | { readonly type: 'creation.name'; readonly name: string }
  | { readonly type: 'creation.preset'; readonly id: string }
  | { readonly type: 'creation.roll' }
  | { readonly type: 'creation.art'; readonly id: string }
  | { readonly type: 'creation.training'; readonly points: number }
  | { readonly type: 'creation.proficiency'; readonly name: string; readonly delta: number }
  | { readonly type: 'creation.technique'; readonly id: string }
  | { readonly type: 'creation.kit'; readonly id: string }
  | { readonly type: 'creation.step'; readonly step: CreationStep }
  | { readonly type: 'creation.begin' }
  | { readonly type: 'village.buy'; readonly id: string }
  | { readonly type: 'village.temple' }
  | { readonly type: 'village.inn' }
  | { readonly type: 'village.trail' }
  | { readonly type: 'record.draft'; readonly text: string }
  | { readonly type: 'record.import' }
