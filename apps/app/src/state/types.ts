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
  ChronicleEntry,
  Die,
  Increase,
  EventKind,
  EventReading,
  FightEnd,
  FinalBlowRoll,
  Label,
  LearnedTechnique,
  Morale,
  NamedValue,
  NewTechnique,
  Region,
  RoundOutcome,
  TwoD6Roll,
  XpCategoryName,
  UnexpectedEventRoll,
} from '@martial-havoc/engine'
import { XP_CATEGORIES } from '@martial-havoc/engine'

/**
 * One line of the chronicle, re-exported from the engine (Phase 10h).
 *
 * The record owns the shape, because the chronicle is the durable half
 * and travels in an export; the screens read it from here, the way they
 * read everything else about a record.
 */
export type { ChronicleEntry }

/**
 * The four scores, all blank (R43).
 *
 * Built from the engine's own list of the book's printed headings so no
 * component or reducer ever writes one of them down: they are a table
 * (`rules/xp-categories.json`), and a table in a component is the thing
 * agents.md rule 7 exists to stop.
 */
export const blankScores = (): Readonly<Record<XpCategoryName, number | null>> =>
  Object.fromEntries(XP_CATEGORIES.map((name) => [name, null])) as Record<
    XpCategoryName,
    number | null
  >

/** The screens of the frame. */
export type Screen =
  | 'creation'
  | 'beat'
  /** The ending: the freeze frame, the four scores, and what XP buys. */
  | 'ending'
  | 'combat'
  | 'rules'
  | 'region'
  | 'village'
  | 'record'
  | 'about'

/**
 * Where creation has got to, in the book's own order (R01-R19).
 *
 * `who` is R01's first line, name and age, and the offer of a printed
 * sheet (R83) instead. Then the text's own order
 * (docs/rules/master-creation.md, "Order of operations"): standing and
 * the starting kit (R02, R03), the three numbers (R04), the Martial Art
 * (R09), Training (R15), Proficiencies (R10, R11), Techniques and
 * Rituals (R16). `ready` is a made Master who has not yet begun.
 */
export type CreationStep =
  | 'who'
  | 'standing'
  | 'kit'
  | 'numbers'
  | 'art'
  | 'training'
  | 'spend'
  | 'learn'
  | 'ready'

/** The order the steps run in, which is the order the book prints them. */
export const CREATION_STEPS: readonly CreationStep[] = [
  'who',
  'standing',
  'kit',
  'numbers',
  'art',
  'training',
  'spend',
  'learn',
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
  /** R01: name and age. Age is typed as text and read as a number when it is one. */
  readonly name: string
  readonly age: string
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
  /** R16: the `technique.*` and `ritual.*` ids learned. */
  readonly techniqueIds: readonly string[]
  readonly ritualIds: readonly string[]
  /** R02: the weapon, free text ("even if not listed"). */
  readonly weapon: string
  /** R02: the one starting item, a `market.*` id: the Health Elixir, or a line under 20 GP. */
  readonly kitItemId: string | null
}

/**
 * The Master as the app plays them: R01's schema, with the initial
 * values R05 asks us to keep.
 *
 * "A Master is defined by: name and age; Martial Art; SKILL, ENDURANCE
 * and LUCK points; Martial Proficiencies; Techniques and Rituals (if
 * any); Equipment; Experience points" (MH p.5). Training is kept beside
 * the Proficiencies rather than among them: R17 makes it a Proficiency,
 * and I-22 reads that as applying to checks to perform or resist
 * Techniques and Rituals, not to Attack Strength, which is what the
 * combat screen draws the best Proficiency for.
 */
export type Sheet = {
  readonly name: string
  /** R01. Null when never given: the book asks, it does not require. */
  readonly age: number | null
  /** R01, R09: the `martial-art.*` id, or null for a Master made without one. */
  readonly martialArtId: string | null
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
  /** R17: Training's value, a Proficiency of its own (I-22 says for which checks). */
  readonly training: number
  /** Technique ids (`technique.*`), resolved from the sheet's printed names. */
  readonly techniques: readonly string[]
  /** Ritual ids (`ritual.*`), likewise (R14, R16). */
  readonly rituals: readonly string[]
  /** R01, R02: equipment lines as printed or typed; common clothing first. */
  readonly equipment: readonly string[]
  /**
   * R01, R43, R47: Experience points not yet spent.
   *
   * Zero at creation; an ending adds what the four scores earned, and
   * an advancement spends from it. "Any remaining XP will remain
   * available to spend on the next advancement" (MH p.35), which is
   * why this is a running balance rather than a per-adventure total.
   */
  readonly xp: number
  /**
   * R16, R45: resource points bought after creation, unspent.
   *
   * A Training point bought with XP gives four of them (R16), and they
   * are what a Technique or a Ritual is learned with (MH p.35: "to
   * learn new Techniques or Rituals, you will need to increase your
   * Training Skill"). Creation spends its own pool at creation; this is
   * the pool that opens afterwards.
   */
  readonly resources: number
  /**
   * The Techniques this Master invented off landed Final Blows (R31).
   *
   * Kept whole rather than as ids, because there is no table for them
   * to be ids into: the engine's `LearnedTechnique` is the shape, and
   * the campaign record carries it verbatim.
   */
  readonly learned: readonly LearnedTechnique[]
}

/**
 * Naming a landed Final Blow (R31, I-12; Phase 10f).
 *
 * The book's most delightful rule is a sequence, not a roll: the blow
 * lands, the Master may try to keep it, the LUCK roll decides whether
 * they can, the table may be rolled for three words, and then the
 * player writes down what they just invented. Each step is a field
 * here, null or empty until it has happened, so the card can be drawn
 * from the record alone and a half-named Technique is a legible state
 * rather than a lost one.
 */
export type Naming = {
  /** The LUCK roll: what it was, and what it cost (-1 on failure only). */
  readonly roll: NewTechnique
  /** The inspiration table's three words, or null until it is rolled. */
  readonly words: NamedWords | null
  /** What the player has typed; prefilled from the words when rolled. */
  readonly name: string
  /** 1-4 (R31). Two until the player says otherwise. */
  readonly value: number
  readonly description: string
}

/** The three words the inspiration table gave, and the roll that found them. */
export type NamedWords = {
  readonly roll: TwoD6Roll
  readonly action: string
  readonly attribute: string
  readonly animal: string
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
  /**
   * The face the headcount was read from, or null (MH p.58, I-34;
   * Phase 10e).
   *
   * Only the Oracle's Minion cell is a roll, so most turns leave this
   * null even where several foes were met: a band is counted from its
   * ATTACK and a printed pair is counted by reading the row.
   */
  readonly countFace: Die | null
  /** The printed names of the foes met, one entry each; empty where nothing was. */
  readonly foes: readonly string[]
  /** True where the Event revealed this area's Hint. */
  readonly hint: boolean
  /**
   * True where the book's pacing rule overruled the roll at this door
   * (MH p.84, R82; Phase 10c). `eventFace` is still the face that was
   * rolled, so the slip can print both.
   */
  readonly momentum: boolean
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

/**
 * A fight left with the foe still standing (R38, R39, I-32).
 *
 * Escaping is not free: the book charges a last blow of 2 ENDURANCE and
 * a Dishonor Point for failing to get away clean (MH p.30). Phase 10d
 * gives that its own result kind rather than a bare deed, because
 * running away is a beat of the story and the ledger is not where a
 * player reads what just happened to them.
 */
export type FleeResult = {
  readonly kind: 'flee'
  /** The printed name of who was left behind. */
  readonly foe: string
  /** ENDURANCE before and after the last blow. */
  readonly before: number
  readonly after: number
  /** Dishonor Points earned by the escape (I-32: always one). */
  readonly dishonor: number
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
export type Result =
  | CheckResult
  | RestResult
  | TakeResult
  | TurnResult
  | LootResult
  | FleeResult
  | NoteResult

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

/**
 * One opponent standing in a fight (Phase 10e).
 *
 * A fight has always been against a list; until this phase the list was
 * always one long, and the shape said so. It no longer does: the
 * Attendants room fields both attendants, a band of Woodgatherers is
 * five, and the Oracle counts the devils. Each entry carries its own
 * ENDURANCE, its own roll from the last round and its own LOOT, because
 * all three differ between two opponents of the same kind.
 *
 * `id` is the stat block's id, and several entries may share it: four
 * Ogres are four entries, not one with a multiplier. That is what lets
 * the screen tap one card, the reducer strike one body, and R37 count
 * the kind ({@link Combat.foes} is passed to `heldBackInBand` in order).
 */
export type FoeInFight = {
  readonly id: string
  readonly endurance: number
  /** Its roll in the last round, or null before one has been rolled. */
  readonly strength: AttackStrength | null
  /** How the last round's comparison against the Master went. */
  readonly outcome: RoundOutcome['kind'] | null
  /** Master minus this opponent; negative where this one was ahead. */
  readonly difference: number
  /** R37 kept it out of reach last round: it rolled, it could not wound. */
  readonly heldBack: boolean
  /** Tied by the Dazzling Golden Cord (I-49): an Opening that holds. */
  readonly bound: boolean
  /** Burning with the Plantain Fan's magic fire (I-50): 1 a round, forever. */
  readonly burning: boolean
  /** Its LOOT line has been read (once per body). */
  readonly looted: boolean
}

/**
 * The Unexpected Event a tie produced (R32), with its row, its line and
 * what reading I-30 made of it.
 *
 * Phase 10d gave the row its second half. The trigger was always
 * mechanical and the resolution never was: nine of the eleven rows print
 * no effect, and I-30 supplies the floor. `reading` is that floor,
 * already applied where applying it costs nothing (a Deity is rolled,
 * Minions are counted) and offered as a row where it is a choice (the
 * two "The fight resumes" rows, Morale, and rows 3 and 11).
 *
 * Rows 3 and 11 are the operator's pick, not the app's: I-30 reads them
 * as "injury (-1d6 ENDURANCE) **or** loss of weapon, the operator's
 * pick", so the damage is rolled here and applied only if the injury is
 * the half chosen. Taking it automatically would be the app making a
 * choice the reading gives away.
 */
export type EventShown = {
  readonly roll: UnexpectedEventRoll
  readonly text: string
  readonly line: string
  readonly retreatRow: boolean
  /** I-30's mechanical floor for this row, or null for a row outside 2-12. */
  readonly reading: EventReading | null
  /**
   * What an injury row would cost, and to whom (I-30).
   *
   * Rolled when the row lands, spent only if the injury half is the one
   * taken. `resolved` says which half was, and null means the pick is
   * still open - the row is still on the screen.
   */
  readonly injury: {
    readonly target: 'master' | 'opponent'
    readonly amount: number
    readonly resolved: 'injury' | 'weapon' | null
  } | null
  /** The Deity rows 2 and 12 rolled, in the book's three words (MH p.29, R34). */
  readonly deity: { readonly name: string; readonly action: string; readonly object: string } | null
  /** Minions row 7 brought (R33, I-33), joined to the room on leaving. */
  readonly minions: { readonly face: number; readonly count: number } | null
}

/** A fight in progress or just finished. */
export type Combat = {
  /**
   * Everyone the Master is fighting, in the order they were met.
   *
   * Never empty: a fight with nobody in it is not a fight, and the
   * reducer ends one rather than shrinking this list to nothing.
   */
  readonly foes: readonly FoeInFight[]
  /**
   * Which card is tapped - the index into {@link foes} a winner's
   * option applies to.
   *
   * A single opponent is index 0 and the screen shows no picker. With
   * several, the Master chose, and the choice survives the round so
   * STRIKE knows whose ENDURANCE to take the difference off.
   */
  readonly target: number
  readonly round: number
  readonly last: RoundShown | null
  readonly event: EventShown | null
  readonly morale: Morale | null
  readonly opening: boolean
  readonly blow: FinalBlowRoll | null
  /** The authored line of the Technique last used, if one was. */
  readonly techniqueLine: string | null
  /**
   * The opponent's unopposed first round (I-08a; Phase 10d).
   *
   * True from the moment an Ambush starts the fight until that round
   * has been rolled. While it holds, the Master's Attack Strength is
   * built without Proficiencies and a round they lose offers no
   * winner's option, because it was never their round.
   */
  readonly ambush: boolean
  /**
   * Naming the Technique a landed blow may become (R31; Phase 10f).
   *
   * Null before the offer is taken. The offer itself is drawn from
   * `blow.landed` and {@link blowSettled}, not from this: a Master who
   * let the blow go has no naming and must not be asked twice.
   */
  readonly naming: Naming | null
  /** The offer to keep the blow has been answered, either way. */
  readonly blowSettled: boolean
  /**
   * The seven-star sword took the last round's hit (I-44).
   *
   * "It can block hits from stronger enemies without any effort from the
   * holder": no roll, no cost and no limit, so this is a fact about the
   * round just rolled rather than a resource. False on every round the
   * Master won, because the sword does nothing on those.
   */
  readonly warded: boolean
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
  /**
   * The adventure told in order (Phase 10h).
   *
   * Written beside the deeds rather than instead of them: the ledger is
   * what the ending counts and it stays terse, and this is the same
   * play as a story. Every deed writes one of these; so does every room
   * entered, and every passage the player writes.
   */
  readonly chronicle: readonly ChronicleEntry[]
  /** How many rolls were typed instead of rolled (spec.md, Horizon). */
  readonly overrides: number
  readonly deeds: readonly string[]
  /**
   * The act numbers already announced to this player (Phase 10c).
   *
   * The beat shows an act slip the first time each rung of the ladder
   * is satisfied and never again, so this is what "never again" is made
   * of. Durable: it rides in the campaign record, so an export and an
   * import do not replay the whole arc.
   */
  readonly actsSeen: readonly number[]
  readonly combat: Combat | null
  /**
   * The Master's weapon is gone, taken by Unexpected Event row 3 (I-30).
   *
   * Not on `Combat`, because it outlives the fight it was lost in: the
   * weapon stays gone until CHANGE OR RECOVER A WEAPON is taken (R25c),
   * which is the option the book already prints for exactly this. While
   * it is set the armed Proficiencies do not add (R68, I-02).
   *
   * Session state, not campaign state: a lost weapon is a fact about
   * the fight in progress, and a record that is exported and re-imported
   * comes back armed. No version bump, no migration.
   */
  readonly weaponLost: boolean
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
  /**
   * The four scores the player gives the adventure (R43), or null each
   * until they do.
   *
   * Null rather than 2: the scores are the player's judgement of their
   * own play, and a default is the app judging it for them. `spec.md`
   * refuses to compute them.
   */
  readonly scores: Readonly<Record<XpCategoryName, number | null>>
  /**
   * The four scores have been banked as XP (R43).
   *
   * The ending is a screen, not a moment, and a player may open it
   * twice; banking twice would pay them twice. Durable for the same
   * reason.
   */
  readonly scoresBanked: boolean
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
  /** Back off the mountain to the trail-head village (Phase 10b). */
  | { readonly type: 'cave.village' }
  /** Dismiss the act-change slip, marking the act announced (Phase 10c). */
  | { readonly type: 'act.seen' }
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
  /** Rows 6 and 8 say the fight resumes: back into the round loop (R32). */
  | { readonly type: 'combat.resume' }
  /** Rows 3 and 11: take the injury, or lose the weapon instead (I-30). */
  | { readonly type: 'combat.injury'; readonly take: 'injury' | 'weapon' }
  /** Tap one of several opponents: the winner's option applies to it. */
  | { readonly type: 'combat.target'; readonly index: number }
  /** Face every foe the Event brought at once (R35; Phase 10e). */
  | { readonly type: 'cave.fight-all' }
  /** Call a named foe into the vase (I-38; Phase 10g). */
  | { readonly type: 'cave.call'; readonly foe: string }
  /** The winner's option: tie the foe with the Cord (I-49). */
  | { readonly type: 'combat.tie' }
  /** The winner's option: wave the Plantain Fan (I-50). */
  | { readonly type: 'combat.fan' }
  /** After a victory: one fallen foe's LOOT line (5T a2). */
  | { readonly type: 'combat.loot'; readonly index: number }
  /** Keep the landed blow as a Technique: the LUCK roll (R31). */
  | { readonly type: 'combat.keep' }
  /** Let the landed blow go: no roll, no Technique, no second asking. */
  | { readonly type: 'combat.let-go' }
  /** Roll the inspiration table for three words (MH p.26). */
  | { readonly type: 'combat.inspire' }
  /** The naming card's three fields. */
  | { readonly type: 'combat.name'; readonly name: string }
  | { readonly type: 'combat.value'; readonly value: number }
  | { readonly type: 'combat.describe'; readonly text: string }
  /** Write the named Technique onto the sheet. */
  | { readonly type: 'combat.learn' }
  | { readonly type: 'combat.leave' }
  | { readonly type: 'rules.filter'; readonly filter: Filter }
  | { readonly type: 'rules.open'; readonly id: string | null }
  | { readonly type: 'region.travel'; readonly to: number }
  | { readonly type: 'record.new' }
  | { readonly type: 'creation.name'; readonly name: string }
  | { readonly type: 'creation.age'; readonly age: string }
  | { readonly type: 'creation.weapon'; readonly weapon: string }
  | { readonly type: 'creation.ritual'; readonly id: string }
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
  /** One of R43's four scores, 1-3. */
  | { readonly type: 'ending.score'; readonly category: XpCategoryName; readonly value: number }
  /** Bank the four scores as XP, once (R43). */
  | { readonly type: 'ending.bank' }
  /** Spend XP on one +1 of the advancement table (R44, R45, R47). */
  | { readonly type: 'ending.buy'; readonly increase: Increase }
  /** Spend resource points on a Technique or a Ritual (R16, R18). */
  | { readonly type: 'ending.learn'; readonly id: string }
