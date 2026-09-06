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
  AttackStrength,
  Die,
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

/** The four screens of the prototype frame. */
export type Screen = 'beat' | 'combat' | 'rules' | 'region'

/** The Master's numbers as the strip shows them, with the initial values R05 asks us to keep. */
export type Sheet = {
  readonly name: string
  readonly skill: number
  readonly skillInitial: number
  readonly endurance: number
  readonly enduranceInitial: number
  readonly luck: number
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
  readonly treasure: string
  readonly held: number
}

/** The R78 treasure roll after a victory. */
export type TreasureResult = {
  readonly kind: 'treasure'
  readonly face: Die
  readonly band: string
  readonly text: string
}

/** What the result slip shows, when it shows anything. */
export type Result = CheckResult | RestResult | TakeResult | TreasureResult

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
  readonly treasureRolled: boolean
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
  readonly area: number
  readonly sheet: Sheet
  readonly result: Result | null
  /** Faces the player tapped for the next roll; used when two are present. */
  readonly manual: readonly Die[]
  readonly manualOpen: boolean
  readonly draft: string
  readonly passages: readonly string[]
  /** How many rolls were typed instead of rolled (spec.md, Horizon). */
  readonly overrides: number
  readonly deeds: readonly string[]
  /** Treasure keys held (of the five). */
  readonly held: readonly string[]
  readonly combat: Combat | null
  readonly filter: Filter
  readonly openId: string | null
  readonly region: Region
  /** The region point the Master stands at. */
  readonly here: number
}

/** Everything a screen may ask the record to do. */
export type Action =
  | { readonly type: 'nav'; readonly screen: Screen }
  | { readonly type: 'option'; readonly id: string }
  | { readonly type: 'roll' }
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
  | { readonly type: 'combat.treasure' }
  | { readonly type: 'combat.leave' }
  | { readonly type: 'rules.filter'; readonly filter: Filter }
  | { readonly type: 'rules.open'; readonly id: string | null }
  | { readonly type: 'region.travel'; readonly to: number }
  | { readonly type: 'record.new' }
