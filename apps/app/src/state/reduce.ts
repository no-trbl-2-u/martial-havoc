/**
 * The record reducer: `(state, action, dice) => state`.
 *
 * Every rule the prototype plays comes from `@martial-havoc/engine`;
 * every line it shows comes from `@martial-havoc/content`. This file
 * only decides *which* engine function an action calls and *where* the
 * answer goes in the record. It holds no rule of its own: a number that
 * is not on the sheet, in a table or returned by the engine does not
 * appear here.
 *
 * Dice: the injected `dice` is the table's. When the player has tapped
 * two faces (`state.manual`), the Master's next 2d6 reads those instead
 * and the override count goes up by one (spec.md, Horizon). The
 * opponent's dice, the Unexpected Event table and Morale always read the
 * injected source: the player rolls their own dice, not the foe's.
 */
import {
  actFor,
  ambush,
  areaDamage,
  attackOf,
  attackRescue,
  attackStrength,
  RESOURCES_PER_TRAINING_POINT,
  XP_CATEGORIES,
  behaviours,
  binds,
  buy,
  callsOut,
  d6,
  endsFight,
  escape,
  eventReading,
  finalBlow,
  flag,
  fromSilver,
  heldBackInBand,
  importJson,
  injuryDamage,
  learnFrom,
  lootFrom,
  magicFire,
  minions,
  morale,
  namingRoll,
  newTechnique,
  nightsRest,
  placeRunning,
  purchase,
  rescue,
  resolveEncounter,
  resolveRound,
  revealHint,
  skillBand,
  skillForFight,
  spendTechnique,
  xpAward,
  stayTheNight,
  step,
  takeDrop,
  takeHere,
  templeVisit,
  toggleFlag,
  toSilver,
  unexpectedEvent,
  wards,
  withoutArmed,
  withArea,
  withFlag,
} from '@martial-havoc/engine'
import type { PromptMoment } from '@martial-havoc/content'
import type {
  DiceSource,
  Increase,
  UnexpectedEventRoll,
  XpAward,
  XpCategoryName,
} from '@martial-havoc/engine'
import {
  INCENSE_ID,
  isMomentumDoor,
  effectFor,
  market,
  adventureHookById,
  ritualById,
  rollAdventureHook,
  rollDeity,
  rollFinalBlow,
  rollUnexpectedEvent,
  t,
  techniqueById,
  theFiveTreasures,
  theFiveTreasuresAreaById,
  theFiveTreasuresTreasureById,
  treasureFoeById,
  unexpectedEventLineFor,
  villagePlaces,
  xpCostFor,
} from '@martial-havoc/content'
import type { Opponent } from '@martial-havoc/content'
import { queued } from '../dice/random'
import { fill } from '../lib/fill'
import { newRecord } from './record'
import { fromCampaign } from './campaign'
import {
  CORD,
  CORD_KNOWN,
  LEFT,
  FAN,
  FIREPROOF,
  GOURD,
  NIGHT,
  RANK_AND_FILE,
  SWORD,
  VASE,
  foeName,
  treasureName,
} from './menu'
import {
    finishCreation,
  rollArt,
  rollNumbers,
  rollStanding,
  takePreset,
} from './creation'
import type {
  Action,
  Combat,
  CreationState,
  ChronicleEntry,
  EventShown,
  FoeInFight,
  Naming,
  RecordState,
  Sheet,
} from './types'

/** The citation the engine registry carries for a behaviour id. */
export const citeOf = (id: string): string => behaviours.find((b) => b.id === id)?.cite ?? id

/** ENDURANCE never shows below zero; what zero means is R06's. */
const floor = (n: number): number => Math.max(0, n)

/**
 * The Master's dice for one roll: the two tapped faces if there are
 * two, else the table's. `manual` says whether the override count moves.
 */
const masterDice = (
  state: RecordState,
  dice: DiceSource,
): { readonly source: DiceSource; readonly manual: boolean } =>
  state.manual.length === 2
    ? { source: queued(state.manual, dice), manual: true }
    : { source: dice, manual: false }

/** After any Master roll: the tapped faces are spent and the count moves. */
const afterMasterRoll = (state: RecordState, manual: boolean): RecordState => ({
  ...state,
  manual: [],
  manualOpen: false,
  overrides: state.overrides + (manual ? 1 : 0),
})

const withSheet = (state: RecordState, sheet: Partial<Sheet>): RecordState => ({
  ...state,
  sheet: { ...state.sheet, ...sheet },
})

const withCombat = (state: RecordState, combat: Partial<Combat>): RecordState =>
  state.combat === null ? state : { ...state, combat: { ...state.combat, ...combat } }

/**
 * Append one line to the chronicle (Phase 10h).
 *
 * The turn number is how many rooms have been entered, which is what
 * `cave.visited` already counts: a chronicle written against a clock
 * would need one, and this build reads no clock. The area is the room
 * the Master stands in, named as the book names it, or null where they
 * stand nowhere the adventure knows - the village, or before the trail.
 */
const chronicled = (
  state: RecordState,
  kind: ChronicleEntry['kind'],
  text: string,
  area: string | null = areaName(state.cave.area),
): RecordState => ({
  ...state,
  chronicle: [
    ...state.chronicle,
    { turn: state.cave.visited.length, area, kind, text },
  ],
})

/**
 * Write a deed, and the same fact into the chronicle.
 *
 * One call rather than two everywhere: the ledger and the story are two
 * readings of the same event, and a deed that reached one and not the
 * other would be a story with a hole in it exactly where something
 * happened. Every deed in the build already goes through here.
 */
const addDeed = (state: RecordState, deed: string): RecordState =>
  chronicled({ ...state, deeds: [...state.deeds, deed] }, 'deed', deed)

/** `list` without its first `value`, if any. */
const withoutFirst = (list: readonly string[], value: string): readonly string[] => {
  const i = list.indexOf(value)
  return i < 0 ? list : [...list.slice(0, i), ...list.slice(i + 1)]
}

// ------------------------------------------------------------ the band
//
// A fight is against a list (Phase 10e). These four read that list; no
// handler below indexes `foes` directly, so "who is the Master aiming
// at" and "is anyone still standing" have one answer each.

/** The opponent the tapped card names - the winner's option applies here. */
const aimedAt = (c: Combat): FoeInFight => c.foes[c.target] ?? c.foes[0] ?? EMPTY_FOE

/** Everyone still on their feet. */
const standing = (c: Combat): readonly FoeInFight[] => c.foes.filter((f) => f.endurance > 0)

/** The band's ENDURANCE together: zero exactly when every body is down. */
const bandEndurance = (c: Combat): number => c.foes.reduce((n, f) => n + f.endurance, 0)

/** Is `treasure` in the Master's hands? (I-60: a held treasure's effect is known.) */
const holds = (state: RecordState, treasure: string): boolean =>
  state.cave.treasures.includes(treasure)

/** Replace one opponent in the band, by index, leaving the rest alone. */
const withFoe = (c: Combat, index: number, change: Partial<FoeInFight>): Combat => ({
  ...c,
  foes: c.foes.map((f, i) => (i === index ? { ...f, ...change } : f)),
})

/**
 * The stand-in for an empty band.
 *
 * `Combat.foes` is never empty in practice - the reducer ends a fight
 * rather than emptying it - but the type cannot say so, and every
 * caller of {@link aimedAt} would otherwise need a null branch that can
 * never run. A body with no ENDURANCE and no id reads as already down
 * everywhere it could be reached.
 */
const EMPTY_FOE: FoeInFight = {
  id: '',
  endurance: 0,
  strength: null,
  outcome: null,
  difference: 0,
  heldBack: false,
  bound: false,
  burning: false,
  looted: false,
}

/**
 * R26 read off the current numbers, for a band rather than one body.
 *
 * Two readings fold in here, both of them forced by there being more
 * than one opponent. The fight is over when the *band* is down, so the
 * opponent's side of R26 is the band's total ENDURANCE. And a Final
 * Blow (R30) kills the body it was aimed at, not the encounter: it only
 * ends the fight when nobody else is left standing.
 */
const fightEnd = (state: RecordState, combat: Combat) =>
  endsFight({
    masterEndurance: state.sheet.endurance,
    opponentEndurance: bandEndurance(combat),
    finalBlowLanded: combat.blow?.landed === true && bandEndurance(combat) === 0,
    unexpectedEvent: combat.event !== null,
  })

// ---------------------------------------------------------------- the cave

const TABLES = theFiveTreasures

/** The printed name of an area id. */
const areaName = (id: string): string => theFiveTreasuresAreaById(id)?.name ?? id

/**
 * One turn of the adventure's own procedure (5T a1): walk into `to`,
 * roll the Event table, and on 1-3 roll for the creature encountered.
 * The engine's `step` draws exactly the printed dice, from the Master's
 * source, so a face tapped by hand reaches the Event roll first and the
 * creature roll second.
 *
 * A refused move (a gate without its key) draws nothing and changes
 * nothing: the menu already shows that door disabled with its text.
 */
const doTurn = (state: RecordState, to: string, dice: DiceSource): RecordState => {
  // One tapped face is enough here: the Event is a single d6, and a
  // second face, if tapped, is the creature roll. The table fills in
  // whatever the player did not tap.
  const manual = state.manual.length > 0
  const source = manual ? queued(state.manual, dice) : dice
  // The book's pacing rule, at the one door this adventure marks as a
  // plot point (MH p.84, R82; `momentum.json`). The engine applies the
  // rule; the content decides where, and the roll is still made and
  // still shown.
  const turn = step(TABLES, state.cave, to, source, { momentum: isMomentumDoor(to) })
  if (!turn.passage.ok || turn.area === undefined || turn.event === undefined) return state
  const foes = turn.encounter?.foes.map((foe) => foe.id) ?? []
  // The room entered and what the Event brought there: the chronicle's
  // spine, written where the turn is resolved so nothing else has to
  // remember to. The area is the one just walked into, not the one just
  // left, so it is taken from the turn rather than from the state.
  const met = foes.map(foeName)
  const line = fill(t('ui.chronicle.turn'), {
    event: turn.event.text,
    met: met.length === 0 ? t('ui.chronicle.alone') : met.join(', '),
  })
  return afterMasterRoll(
    chronicled({
      ...state,
      cave: turn.state,
      pending: foes,
      result: {
        kind: 'turn',
        area: turn.area.name,
        eventFace: turn.event.face,
        event: turn.event.kind,
        eventText: turn.event.text,
        encounterFace: turn.encounter?.face ?? null,
        countFace: turn.encounter?.countFace ?? null,
        foes: foes.map(foeName),
        hint: turn.hintRevealed,
        momentum: turn.momentum,
      },
    },
    'turn',
    line,
    turn.area.name,
  ),
    manual,
  )
}

/** Open the card unrolled: the move is named, the face is the player's to tap. */
const openPicker = (state: RecordState, to: string): RecordState => ({
  ...state,
  roll: { to, landed: false },
  manual: [],
})

/** Tap an exit: roll now with MY DICE off, or open the picker with it on. */
const doGo = (state: RecordState, to: string, dice: DiceSource): RecordState => {
  if (state.pending.length > 0) return state
  if (state.byHand) return openPicker(state, to)
  const next = doTurn(state, to, dice)
  return next === state ? state : { ...next, roll: { to, landed: true } }
}

/**
 * CONTINUE on a picker card: resolve the move on the tapped face(s).
 * No face is nothing to roll; the button is disabled and the reducer
 * agrees. The override count moves inside `doTurn`.
 */
const rollCard = (state: RecordState, dice: DiceSource): RecordState => {
  if (state.roll === null || state.roll.landed || state.manual.length === 0) return state
  const next = doTurn(state, state.roll.to, dice)
  return next === state ? state : { ...next, roll: { to: state.roll.to, landed: true } }
}

/** Close the card. What it rolled is already in `result`; nothing is undone. */
const closeCard = (state: RecordState): RecordState => ({
  ...state,
  roll: null,
  manual: [],
})

const doRest = (state: RecordState): RecordState => {
  const healed = nightsRest({
    skill: { current: state.sheet.skill, initial: state.sheet.skillInitial },
    endurance: { current: state.sheet.endurance, initial: state.sheet.enduranceInitial },
  })
  return withSheet(
    {
      ...state,
      result: { kind: 'rest', before: healed.endurance.before, after: healed.endurance.after },
    },
    { skill: healed.skill.after, endurance: healed.endurance.after },
  )
}

/** Pick up a treasure lying in this area (I-38). */
const doTake = (state: RecordState, treasure: string): RecordState => {
  const cave = takeHere(TABLES, state.cave, treasure)
  if (cave === state.cave) return state
  return addDeed(
    {
      ...state,
      cave,
      result: { kind: 'take', treasure: treasureName(treasure), held: cave.treasures.length },
    },
    fill(t('ui.deed.took'), { name: treasureName(treasure) }),
  )
}

/** A treasure in the hand is a moment the app asks about (Phase 10j). */
const doTakeAsked = (state: RecordState, treasure: string): RecordState => {
  const took = doTake(state, treasure)
  return took === state ? state : asks(took, 'treasure')
}

/**
 * Read a foe's LOOT line (5T a2) and put the drop where it belongs:
 * a treasure, a key, an item. The result slip shows the printed item.
 *
 * A Hint row (the Devil servant's 6, I-08) is not a thing carried: the
 * servant knew something of the place it was met in, so the area's
 * grey paragraph is revealed and the slip says so, rather than printing
 * the transcription's note about an icon with no text.
 *
 * `gift` marks a line read from a rescue rather than a body: the same
 * table, but the slip calls it what it is.
 */
const doLootOf = (state: RecordState, foeId: string, dice: DiceSource, gift = false): RecordState => {
  const drop = lootFrom(TABLES, foeId)(dice)
  const row = drop.row
  const hint = row?.hint === true
  const cave = hint ? revealHint(state.cave, state.cave.area) : takeDrop(state.cave, drop.row)
  const result: RecordState['result'] = {
    kind: 'loot',
    foe: foeName(foeId),
    face: drop.face ?? null,
    item: hint ? t('ui.cave.loot.hint.item') : (row?.item ?? t('ui.cave.loot.nothing')),
    treasure: row?.treasure === undefined || row.treasure === null ? null : treasureName(row.treasure),
    key: row?.key !== undefined && row.key !== null,
    gift,
    hint,
  }
  const next = { ...state, cave, result }
  if (row === undefined || hint) return next
  const took = row.treasure !== null ? treasureName(row.treasure) : row.item
  return addDeed(next, fill(t('ui.deed.took'), { name: took }))
}

/**
 * Take the trail out of Fen Pass: the climax of the first act.
 *
 * This is the one move that turns a made Master into a Master in an
 * adventure, and it does exactly two things. It records the arrival —
 * `withArea` on the start area, which is the first entry in `visited`
 * and the reason `beginAdventure` leaves that list empty (Phase 10b) —
 * and it writes the deed, so the ledger carries the point of no return
 * the way it carries every other thing worth being sorry about.
 *
 * Idempotent on the arrival: `withArea` includes rather than appends, so
 * walking back down to the village and up again does not record the
 * mountain twice or reset anything about the cave.
 */
const doTrail = (state: RecordState): RecordState => {
  const already = state.cave.visited.includes(TABLES.meta.startArea)
  const climbed = {
    ...state,
    screen: 'beat' as const,
    villageNote: null,
    cave: withArea(state.cave, TABLES.meta.startArea),
  }
  return already ? climbed : addDeed(climbed, t('ui.deed.trail'))
}

/** Free the rescue here (I-39): recorded, then rewarded with their LOOT line. */
const doRescue = (state: RecordState, dice: DiceSource): RecordState => {
  const here = theFiveTreasuresAreaById(state.cave.area)
  const foe = here?.rescue?.foe
  if (foe === undefined || state.cave.rescued.includes(foe) || state.pending.length > 0) return state
  // Freeing a foe is a source the treasures may name: the Old Vixen
  // teaches the Cord's spells to a Master who does not simply kill her
  // (I-41), and `knownFrom` is where the adventure says so.
  const freed = { ...state, cave: learntInto(rescue(TABLES, state.cave), foe) }
  return asks(
    doLootOf(addDeed(freed, fill(t('ui.deed.freed'), { name: foeName(foe) })), foe, dice, true),
    'rescue',
  )
}

/** Attack the rescue instead (I-39): a Dishonor Point, then the fight. */
const doAttackRescue = (state: RecordState): RecordState => {
  const here = theFiveTreasuresAreaById(state.cave.area)
  const foe = here?.rescue?.foe
  const opponent = foe === undefined ? undefined : treasureFoeById(foe)
  if (foe === undefined || opponent === undefined || state.pending.length > 0) return state
  const cave = attackRescue(TABLES, state.cave)
  return startFight(
    withSheet({ ...state, cave, pending: [foe] }, { dishonor: state.sheet.dishonor + (cave.dishonor - state.cave.dishonor) }),
    [opponent],
  )
}

/**
 * The one treasure whose workings the adventure also declares as a flag,
 * and that flag's name.
 *
 * `cave.effects` is the mechanism: `learnFrom` puts a treasure's id there
 * and every reader asks that list. `flags.json` also declares
 * `cord-spells-known` ("the spells that control the Dazzling Golden Cord
 * are known; until then the Cord is inert loot", I-41), which is the same
 * fact stated for the record - so it is *derived* from `effects` in
 * {@link learntInto} rather than set independently. Two representations
 * kept in step by hand is the bug the village purse already has; this is
 * one representation and one restatement of it.
 */

/**
 * Learn what `source` teaches about the treasures, and restate the Cord's
 * flag from the result (I-38b, I-41).
 *
 * `source` is an id the treasures' `knownFrom` may name: an area (the
 * Chieftain's scattered sheets) or a foe (the Old Vixen, who teaches the
 * Cord's spells to a Master who does not simply kill her). The engine's
 * `learnFrom` filters on it and knows no names of its own.
 */
const learntInto = (cave: RecordState['cave'], source: string): RecordState['cave'] => {
  const next = learnFrom(TABLES, cave, source)
  return withFlag(next, CORD_KNOWN, next.effects.includes(CORD))
}

/** Learn what this area teaches about the treasures (I-38b, I-41). */
const doLearn = (state: RecordState): RecordState => {
  if (state.pending.length > 0) return state
  const cave = learntInto(state.cave, state.cave.area)
  const learnt = cave.effects.filter((id) => !state.cave.effects.includes(id))
  if (learnt.length === 0) return state
  return {
    ...state,
    cave,
    result: {
      kind: 'note',
      title: t('ui.cave.learn.title'),
      text: learnt
        .map((id) => `${treasureName(id)}: ${TABLES.treasures.find((tr) => tr.id === id)?.effect ?? ''}`)
        .join('\n'),
      label: 'reading',
      cite: t('ui.cave.learn.cite'),
    },
  }
}

/**
 * Open the gourd, or close it again (I-45).
 *
 * The printed effect is the whole rule: "if opened it will swallow the
 * sky, changing day to night. Close it to have the daylight back."
 * Reading I-45 makes that night a flag, and `absences.json` is what reads
 * it - by night the Cave entrance's Ogres are out hunting and are not
 * met. So this toggles one boolean and nothing else; the consequence
 * lives in the tables.
 *
 * A no-op when the gourd is not held or a foe is still pending, which is
 * exactly what the menu row shows disabled.
 */
const doGourd = (state: RecordState): RecordState => {
  if (state.pending.length > 0 || !state.cave.treasures.includes(GOURD)) return state
  const cave = toggleFlag(state.cave, NIGHT)
  const night = flag(cave, NIGHT)
  return addDeed(
    {
      ...state,
      cave,
      result: {
        kind: 'note',
        title: night ? t('ui.cave.gourd.title.night') : t('ui.cave.gourd.title.day'),
        text: theFiveTreasuresTreasureById(GOURD)?.effect ?? '',
        label: 'reading',
        cite: t('ui.cave.gourd.cite'),
      },
    },
    night ? t('ui.deed.gourd.opened') : t('ui.deed.gourd.closed'),
  )
}

/**
 * Face one of the foes the Event brought.
 *
 * An Ambush is the enemy striking first (I-08a), and the fight has to
 * be told so at the moment it starts: the Event that brought this foe
 * is the last turn result, and it is the only place that fact lives.
 * A foe faced from any other state - a foe left in the room by an
 * environmental change, one re-faced after walking back - is a normal
 * fight, because the ambush was spent the first time.
 */
const doFight = (state: RecordState, foe: string): RecordState => {
  const opponent = treasureFoeById(foe)
  if (opponent === undefined || !state.pending.includes(foe)) return state
  return startFight(state, [opponent], ambushed(state))
}

/**
 * FACE THEM ALL: every foe the Event brought, in one fight (R35;
 * Phase 10e).
 *
 * The Master's SKILL drops by the number faced, so facing four at once
 * is a decision with a cost, and facing them one at a time is the other
 * half of the same decision. Both stay on the beat, and neither is the
 * default.
 */
const doFightAll = (state: RecordState): RecordState => {
  const band = state.pending
    .map((id) => treasureFoeById(id))
    .filter((foe): foe is Opponent => foe !== undefined)
  return band.length === 0 ? state : startFight(state, band, ambushed(state))
}

/**
 * Was this fight opened by an Ambush (I-08a)?
 *
 * The Event that brought these foes is the last turn result, and it is
 * the only place the fact lives. A foe faced from any other state - one
 * left in the room by an environmental change, one re-faced after
 * walking back - is a normal fight: the ambush was spent the first time.
 */
const ambushed = (state: RecordState): boolean =>
  state.result?.kind === 'turn' && state.result.event === 'ambush'

/** One opponent as a body in a fight: full ENDURANCE, nothing rolled yet. */
const asFoeInFight = (foe: Opponent): FoeInFight => ({
  id: foe.id,
  endurance: foe.endurance,
  strength: null,
  outcome: null,
  difference: 0,
  heldBack: false,
  bound: false,
  burning: false,
  looted: false,
})

const startFight = (state: RecordState, band: readonly Opponent[], ambush = false): RecordState => ({
  ...state,
  screen: 'combat',
  result: null,
  roll: null,
  combat: {
    foes: band.map(asFoeInFight),
    target: 0,
    round: 1,
    last: null,
    event: null,
    morale: null,
    opening: false,
    blow: null,
    techniqueLine: null,
    ambush,
    naming: null,
    blowSettled: false,
    warded: false,
    over: { ended: false },
  },
})

// --------------------------------------------------------------- the fight

/**
 * Resolve one Unexpected Event roll into everything a screen needs
 * (R32, I-30, R33, R34; Phase 10d).
 *
 * The trigger is mechanical and the resolution is not: nine of the
 * eleven rows print no effect at all, and reading I-30 supplies the
 * floor. This is where that floor is *applied*, and the split is
 * deliberate — an effect that costs nothing to take is taken here and
 * now (a Deity is rolled, Minions are counted, an injury is rolled),
 * while an effect that is a decision is left as a row for the player
 * (the two "The fight resumes" rows, and Morale on the two retreat
 * rows, which already had its own button).
 *
 * Every die this draws comes from the table's own source, not the
 * Master's: none of it is the Master's roll.
 */
const resolveEvent = (roll: UnexpectedEventRoll, dice: DiceSource): EventShown => {
  const row = rollUnexpectedEvent(roll.total)
  const reading = eventReading(roll.total) ?? null
  const deity =
    reading?.kind === 'divine-intervention'
      ? (() => {
          // R34's own address: a banded d6 x d6 over the twelve Deities.
          const found = rollDeity(d6(dice), d6(dice))
          return found === undefined
            ? null
            : { name: found.name, action: found.action, object: found.object }
        })()
      : null
  // Rolled, not yet spent: I-30 makes rows 3 and 11 the operator's pick
  // between the injury and the weapon, so both are offered and neither
  // is taken until one is chosen.
  const injury =
    reading?.kind === 'injury-or-weapon-loss'
      ? { target: reading.target, amount: injuryDamage(dice), resolved: null }
      : null
  const brought = reading?.kind === 'reinforcements' ? minions(dice) : null
  return {
    roll,
    text: row?.text ?? '',
    line: row === undefined ? '' : (unexpectedEventLineFor(row.id)?.line ?? ''),
    retreatRow: row?.retreatRow === true,
    reading,
    injury,
    deity,
    minions: brought,
  }
}

/**
 * One round of the fight, against however many are standing (I-06, R35,
 * R37; Phase 10e).
 *
 * The Master rolls **once**. That one Attack Strength is compared
 * against each standing opponent's own roll, and each comparison
 * resolves as R24/R25 in its own right - which is what makes a round
 * against three a scene rather than three fights interleaved.
 *
 * Two different numbers of opponents are in play and conflating them is
 * the trap the engine's module is written to avoid: SKILL is reduced by
 * everyone **faced** (R35), while only ATTACK of each kind may **wound**
 * (R37). A held-back opponent still rolls and its total still shows;
 * it simply costs nothing this round.
 *
 * An Ambush is one unopposed round: the Master is caught, so their side
 * of the comparison is SKILL and 2d6 with no Proficiency at all (I-08a).
 */
const doRound = (state: RecordState, dice: DiceSource): RecordState => {
  const c = state.combat
  if (c === null || c.over.ended || c.last !== null) return state
  const alive = standing(c)
  if (alive.length === 0) return state
  const { source, manual } = masterDice(state, dice)
  const caught = c.ambush
  const band = alive.map((f) => {
    const foe = treasureFoeById(f.id)
    return {
      skill: foe?.skill ?? 0,
      proficiencies: foe?.proficiencies ?? [],
      kind: f.id,
      attack: attackOf(foe?.attack ?? null),
    }
  })
  // The Master's dice come from their own source (a tapped face reaches
  // this roll first); every opponent's come from the table's.
  // R35 belongs to Multiple Combat: it is the price of facing several
  // at once, and a duel is not multiple combat. Facing one leaves SKILL
  // where the sheet has it, which is what R23 and R24 have always
  // assumed; facing three costs three.
  const mine = attackStrength({
    skill: alive.length > 1 ? skillForFight(state.sheet.skill, alive.length) : state.sheet.skill,
    // Two things can take a Proficiency out of the Master's sum, and
    // they are different sizes: an ambush takes all of them for one
    // round (I-08a), a lost weapon takes only the armed ones and keeps
    // taking them until the weapon is back (R68, I-02).
    proficiencies:
      caught && ambush().masterRollsWithoutProficiency
        ? []
        : state.weaponLost
          ? withoutArmed(state.sheet.proficiencies)
          : state.sheet.proficiencies,
  })(source)
  // R37 is decided before any opponent rolls, because it is a fact about
  // the band rather than about the dice: who may reach the Master this
  // round does not depend on what anyone rolls.
  const flags = heldBackInBand(band)
  // Each opponent's dice come from the table's source, in the order the
  // band is listed, so a scripted round reads left to right.
  const exchanges = band.map((attacker, i) => {
    const opponent = attackStrength(attacker)(dice)
    return { opponent, outcome: resolveRound(mine, opponent), heldBack: flags[i] === true }
  })
  const struck = exchanges.reduce(
    (n, e) => n + (!e.heldBack && e.outcome.kind === 'master-hit' ? e.outcome.damage : 0),
    0,
  )
  // The seven-star sword "can block hits from stronger enemies without
  // any effort from the holder" (I-44): no roll, no cost and no limit,
  // so a Master holding it takes nothing on a round they were behind
  // in - and nothing at all changes on a round they won.
  const warded = struck > 0 && holds(state, SWORD) && wards(true)
  const hit = warded ? 0 : struck
  const afterHit = withSheet(state, { endurance: floor(state.sheet.endurance - hit) })
  const drew = exchanges.some((e) => e.outcome.kind === 'unexpected-event')
  const event = drew ? resolveEvent(unexpectedEvent(dice), dice) : null
  // I-30 makes rows 3 and 11 the operator's pick between the injury and
  // the weapon, so the -1d6 is rolled with the row and waits: neither
  // side loses anything for it until `combat.injury` says which half was
  // taken. The round itself is only the round.
  const injured = afterHit
  // Positional: `alive` was filtered out of `c.foes`, so the exchanges
  // are zipped back onto the bodies they came from by identity, never
  // by index into the whole band.
  const byFoe = new Map(alive.map((f, i) => [f, exchanges[i]]))
  const foes = c.foes.map((f) => {
    const e = byFoe.get(f)
    if (e === undefined) return { ...f, strength: null, outcome: null, heldBack: false }
    // The fan's fire is inextinguishable (I-50): it takes its point at
    // the start of every round after the one it was lit in, and nothing
    // in the fight removes it. I-30's injury is not applied here - it
    // is a pick the player makes, and `doInjury` applies it.
    const burn = f.burning ? FIRE_EACH_ROUND : 0
    return {
      ...f,
      endurance: floor(f.endurance - burn),
      strength: e.opponent,
      outcome: e.outcome.kind,
      difference: mine.total - e.opponent.total,
      heldBack: e.heldBack,
    }
  })
  // The tapped card follows the Master's own reading of the round: if
  // the one they were aimed at has fallen, the aim moves to the first
  // still standing rather than pointing at a body.
  const target = foes[c.target]?.endurance === 0
    ? Math.max(0, foes.findIndex((f) => f.endurance > 0))
    : c.target
  const combat: Combat = {
    ...c,
    round: c.round + 1,
    foes,
    target,
    last: {
      master: mine,
      opponent: aimedAt({ ...c, foes, target }).strength ?? mine,
      outcome: aimedAt({ ...c, foes, target }).outcome ?? 'master-wins',
      difference: aimedAt({ ...c, foes, target }).difference,
    },
    event,
    morale: null,
    blow: null,
    techniqueLine: null,
    // Spent. Whatever this round was, the next one is a fair one.
    ambush: false,
    naming: null,
    blowSettled: false,
    warded,
  }
  return afterMasterRoll(
    { ...injured, combat: { ...combat, over: fightEnd(injured, combat) } },
    manual,
  )
}

/** Tap one of several cards: the winner's option applies to that body. */
const doTarget = (state: RecordState, index: number): RecordState => {
  const c = state.combat
  if (c === null || index < 0 || index >= c.foes.length) return state
  return c.foes[index]?.endurance === 0 ? state : withCombat(state, { target: index })
}

/**
 * Rows 6 and 8: "The fight resumes" (R32).
 *
 * The only row whose printed text states its own effect, and the only
 * one that puts the player back where they were. Clearing the event is
 * the whole of it — the foe keeps its ENDURANCE, the Master keeps
 * theirs, and the round counter has already moved.
 */
const doResume = (state: RecordState): RecordState => {
  const c = state.combat
  if (c === null || c.event === null || c.event.reading?.kind !== 'fight-resumes') return state
  const combat: Combat = { ...c, event: null, last: null, morale: null }
  return { ...state, combat: { ...combat, over: fightEnd(state, combat) } }
}

/** The band with the last round's rolls cleared: the next round is fresh. */
const rolledOff = (c: Combat): readonly FoeInFight[] =>
  c.foes.map((f) => ({ ...f, strength: null, outcome: null, heldBack: false }))

/**
 * The winner's option (a): the difference off the ENDURANCE of the body
 * the Master is aimed at (R25a).
 *
 * With several opponents the difference is the one the tapped card
 * shows - the Master beat *that* opponent by that much - which is why
 * the target is part of the fight's state rather than a thing the
 * screen works out as it draws.
 */
const doStrike = (state: RecordState): RecordState => {
  const c = state.combat
  const aim = c === null ? null : aimedAt(c)
  if (c === null || aim === null || aim.outcome !== 'master-wins') return state
  const foe = treasureFoeById(aim.id)
  const endurance = floor(aim.endurance - aim.difference)
  const struck = withFoe(c, c.target, { endurance })
  const combat: Combat = { ...struck, foes: rolledOff(struck), last: null, opening: false }
  const next = { ...state, combat: { ...combat, over: fightEnd(state, combat) } }
  return endurance === 0 && foe !== undefined
    ? addDeed(next, fill(t('ui.deed.killed'), { name: foe.name.toLowerCase() }))
    : next
}

/**
 * The id prefix of a Technique the Master invented (Phase 10f).
 *
 * A learned Technique has no id in any table, because it is in no
 * table: it exists only on this sheet. So the menu names it by its
 * position on the sheet behind this prefix, which keeps one action
 * (`combat.technique`) for both kinds rather than two that must be
 * kept in step.
 */
export const LEARNED = 'learned:'

/** The learned Technique an id names, or undefined for a printed one. */
const learnedBy = (state: RecordState, id: string) =>
  id.startsWith(LEARNED) ? state.sheet.learned[Number.parseInt(id.slice(LEARNED.length), 10)] : undefined

/**
 * The winner's option (b): a Technique, no roll, its cost in ENDURANCE
 * (R27, R28, I-23).
 *
 * Two kinds arrive here and only one of them is in a table. A printed
 * Technique spends its printed cost and reads its authored line, and an
 * area one carries its damage to the reach its prose names (R36, I-11).
 * A Technique the Master invented off a Final Blow (R31) spends its
 * assigned value and reads the player's own description; what it *does*
 * beyond that the book never says, and this build's answer - it strikes
 * the body it was aimed at for its value - is an invention, labelled as
 * one (`combat.a-learned-technique-strikes-for-its-value`).
 */
const doTechnique = (state: RecordState, id: string): RecordState => {
  const c = state.combat
  const own = learnedBy(state, id)
  const effect = own === undefined ? effectFor(id) : undefined
  if (
    c === null ||
    aimedAt(c).outcome !== 'master-wins' ||
    (own === undefined && (effect === undefined || !state.sheet.techniques.includes(id)))
  )
    return state
  const cost = own?.value ?? effect?.cost ?? 0
  const line = own === undefined ? (effect?.line ?? null) : own.description
  const endurance = floor(spendTechnique(state.sheet.endurance, cost))
  const next = withSheet(state, { endurance })
  // R36, I-11: an area Technique carries the *same* damage to as many
  // opponents as its own prose reaches, never a share of it. Absent
  // means it reaches nobody but the one in front; null means "all
  // opponents surrounding you", which is every body still standing.
  // A learned Technique reaches the one it was aimed at, for its value.
  const reach =
    own !== undefined ? 1 : effect?.reach === undefined ? 0 : (effect.reach ?? Number.POSITIVE_INFINITY)
  const amount = own?.value ?? aimedAt(c).difference
  const order = [c.target, ...c.foes.map((_, i) => i).filter((i) => i !== c.target)]
  const targets = order.filter((i) => (c.foes[i]?.endurance ?? 0) > 0)
  const spread = areaDamage(amount, reach, targets.length)
  const hurt: Combat = targets.reduce(
    (acc, index, at) =>
      withFoe(acc, index, {
        endurance: floor((acc.foes[index]?.endurance ?? 0) - (spread[at] ?? 0)),
      }),
    c,
  )
  const combat: Combat = {
    ...hurt,
    foes: rolledOff(hurt),
    last: null,
    techniqueLine: line,
  }
  return { ...next, combat: { ...combat, over: fightEnd(next, combat) } }
}

/** The winner's option (d): an Opening, no damage (R29). */
const doOpening = (state: RecordState): RecordState => {
  const c = state.combat
  if (c === null || aimedAt(c).outcome !== 'master-wins') return state
  return withCombat(state, { opening: true, last: null, foes: rolledOff(c) })
}

/** The Final Blow after an Opening: doubles land it (R30; spec.md sealed). */
const doBlow = (state: RecordState, dice: DiceSource): RecordState => {
  const c = state.combat
  const foe = c === null ? undefined : treasureFoeById(aimedAt(c).id)
  if (c === null || foe === undefined || !c.opening || c.over.ended) return state
  const { source, manual } = masterDice(state, dice)
  const blow = finalBlow({})(source)
  // The Blow kills the body it was aimed at (R30), not the encounter:
  // with others still standing the fight goes on, which is why the end
  // of the fight is read off the band rather than off this flag.
  const landed = blow.landed ? withFoe(c, c.target, { endurance: 0 }) : c
  // A missed blow closes the Opening - unless the Cord is what made it.
  // "It can't be cut with normal weapons" (5T a2), and a strike that
  // missed did not cut it either (I-49).
  const combat: Combat = {
    ...landed,
    blow,
    opening: !blow.landed || aimedAt(c).bound,
  }
  const next = { ...state, combat: { ...combat, over: fightEnd(state, combat) } }
  return afterMasterRoll(
    blow.landed
      ? addDeed(next, fill(t('ui.deed.final-blow'), { name: foe.name.toLowerCase() }))
      : next,
    manual,
  )
}

/**
 * KEEP IT AS A TECHNIQUE: the LUCK roll after a landed blow (R31, I-12).
 *
 * The roll is the Master's, so it comes from the Master's source and a
 * tapped face reaches it. `newTechnique` applies the sealed reading -
 * 1 LUCK on failure, nothing on success - and this only writes the
 * number it hands back. A failure settles the offer and there is no
 * second asking; a success opens the naming card.
 */
const doKeep = (state: RecordState, dice: DiceSource): RecordState => {
  const c = state.combat
  if (c === null || c.blow?.landed !== true || c.blowSettled) return state
  const { source, manual } = masterDice(state, dice)
  const roll = newTechnique(state.sheet.luck)(source)
  const next = withSheet(state, { luck: floor(roll.luck) })
  return afterMasterRoll(
    withCombat(next, {
      blowSettled: true,
      naming: roll.learned
        ? { roll, words: null, name: '', value: DEFAULT_TECHNIQUE_VALUE, description: '' }
        : null,
      // The roll is a result of its own: a player who lost a point of
      // LUCK for nothing should read why on the slip, not infer it.
      techniqueLine: roll.learned ? null : t('ui.combat.keep.failed.line'),
    }),
    manual,
  )
}

/**
 * The value a naming card opens on.
 *
 * R31 says 1-4 and says nothing else, and the book's own worked example
 * assigns 2 ("Impetuous Slap of the Phoenix (2)"). Opening on the
 * example's number is a default, not a rule; the player moves it.
 */
const DEFAULT_TECHNIQUE_VALUE = 2

/** LET IT GO: the blow was devastating and stays a moment, not a Technique. */
const doLetGo = (state: RecordState): RecordState => {
  const c = state.combat
  if (c === null || c.blow?.landed !== true || c.blowSettled) return state
  return withCombat(state, { blowSettled: true, naming: null })
}

/**
 * ROLL FOR INSPIRATION: the table at MH p.26 (R31).
 *
 * "For inspiration" - so it is optional, it may be rolled once, and the
 * name it suggests is a suggestion. The engine returns the address; the
 * content package holds the three words; composing them into a name is
 * this build's, and the book prints three orderings of one roll, so the
 * first ("Furious Strike of the Dragon") is offered and the field stays
 * free.
 */
const doInspire = (state: RecordState, dice: DiceSource): RecordState => {
  const c = state.combat
  if (c === null || c.naming === null || c.naming.words !== null) return state
  const { source, manual } = masterDice(state, dice)
  const address = namingRoll(source)
  const row = rollFinalBlow(address.first, address.second)
  if (row === undefined) return state
  const words = {
    roll: address.roll,
    action: row.action,
    attribute: row.attribute,
    animal: row.animal,
  }
  return afterMasterRoll(
    withCombat(state, {
      naming: {
        ...c.naming,
        words,
        // Prefilled, never imposed: the player may keep it, reorder it
        // the way the book's own examples do, or write something else.
        name:
          c.naming.name.trim() === ''
            ? fill(t('ui.combat.naming.suggested'), {
                action: row.action,
                attribute: row.attribute,
                animal: row.animal,
              })
            : c.naming.name,
      },
    }),
    manual,
  )
}

/** One field of the naming card. A no-op when there is no card. */
const onNaming = (state: RecordState, change: Partial<Naming>): RecordState => {
  const c = state.combat
  return c === null || c.naming === null ? state : withCombat(state, { naming: { ...c.naming, ...change } })
}

/**
 * KEEP: the named Technique onto the sheet, and into the ledger (R31).
 *
 * A Technique with no name is not a Technique, so the row is disabled
 * until one is typed and the reducer agrees. The value is clamped to the
 * book's 1-4 here rather than trusted from the screen: the sheet is what
 * later fights read.
 */
const doKeepTechnique = (state: RecordState): RecordState => {
  const c = state.combat
  const naming = c?.naming
  if (c === null || naming === undefined || naming === null || naming.name.trim() === '') return state
  const learned = {
    name: naming.name.trim(),
    value: Math.min(4, Math.max(1, Math.round(naming.value))),
    description: naming.description.trim(),
    words:
      naming.words === null
        ? []
        : [naming.words.action, naming.words.attribute, naming.words.animal],
  }
  return addDeed(
    withCombat(withSheet(state, { learned: [...state.sheet.learned, learned] }), { naming: null }),
    fill(t('ui.deed.learned'), { name: learned.name }),
  )
}

/**
 * What the fan's fire takes at the start of every later round (I-50).
 *
 * A constant rather than a second roll: a fire that rolled every round
 * would be a second fight running beside the first, and the reading
 * takes the smallest number that makes "inextinguishable" mean
 * anything. The engine's `magicFire` is where it is decided; this is
 * the same number, read where the round applies it.
 */
const FIRE_EACH_ROUND = 1

/**
 * TIE IT WITH THE CORD: the winner's option that binds (I-49, I-41).
 *
 * "With a spell it moves to tie a person" - so the spells must be known
 * (I-41), which is what the Old Vixen or the Chieftain's sheets teach.
 * Being tied is the state R29 already names, an Opening, and it holds:
 * `bound` is what makes a missed Final Blow leave the rope where it was.
 */
const doTie = (state: RecordState): RecordState => {
  const c = state.combat
  if (
    c === null ||
    aimedAt(c).outcome !== 'master-wins' ||
    !holds(state, CORD) ||
    !flag(state.cave, CORD_KNOWN)
  )
    return state
  const tied = withFoe(c, c.target, { bound: binds().opening })
  return withCombat(state, {
    foes: rolledOff(tied),
    last: null,
    opening: true,
    techniqueLine: theFiveTreasuresTreasureById(CORD)?.effect ?? null,
  })
}

/**
 * WAVE THE FAN: magic fire, now and every round after (I-50).
 *
 * The one opponent it does nothing to is the Senior King, whose own
 * special skill is "Magic flames (4)" (I-37): the fire the fan makes is
 * the fire he is made of. The menu shows that row disabled with the
 * reason, and the reducer agrees rather than trusting the screen.
 */
const doFan = (state: RecordState, dice: DiceSource): RecordState => {
  const c = state.combat
  const aim = c === null ? null : aimedAt(c)
  if (c === null || aim === null || aim.outcome !== 'master-wins' || !holds(state, FAN)) return state
  if (aim.id === FIREPROOF) return state
  const fire = magicFire(dice)
  const lit = withFoe(c, c.target, {
    endurance: floor(aim.endurance - fire.now),
    burning: true,
  })
  const combat: Combat = {
    ...lit,
    foes: rolledOff(lit),
    last: null,
    techniqueLine: fill(t('ui.combat.fan.line'), { n: fire.now }),
  }
  return { ...state, combat: { ...combat, over: fightEnd(state, combat) } }
}

/**
 * CALL OUT ITS NAME: the vase (I-38).
 *
 * "Remove the label and call out a person's name, if they respond
 * they'll be trapped inside." Whether they respond is a closed question,
 * so it is the Oracle's own Closed Question row: a Yes-class answer
 * traps them, and a trapped opponent is removed from every table exactly
 * as a defeated one is (I-33b, I-33c) - with no body, and so no loot.
 *
 * A name shouted into a cave that does not answer has still been
 * shouted: the foe now knows where the Master is standing, and the
 * fight that follows is theirs to open (I-08a).
 */
const doCall = (state: RecordState, foe: string, dice: DiceSource): RecordState => {
  const opponent = treasureFoeById(foe)
  if (opponent === undefined || !state.pending.includes(foe) || !holds(state, VASE)) return state
  if (RANK_AND_FILE.includes(foe)) return state
  const called = callsOut(dice)
  if (!called.trapped)
    return startFight(
      {
        ...state,
        result: {
          kind: 'note',
          title: fill(t('ui.cave.call.refused'), { name: opponent.name.toUpperCase() }),
          text: t('ui.cave.call.refused.text'),
          label: 'reading',
          cite: t('ui.cave.call.cite'),
        },
      },
      [opponent],
      true,
    )
  const cave = learntInto(resolveEncounter(state.cave, [foe]), foe)
  return addDeed(
    {
      ...state,
      cave,
      pending: withoutFirst(state.pending, foe),
      result: {
        kind: 'note',
        title: fill(t('ui.cave.call.trapped'), { name: opponent.name.toUpperCase() }),
        text: theFiveTreasuresTreasureById(VASE)?.effect ?? '',
        label: 'reading',
        cite: t('ui.cave.call.cite'),
      },
    },
    fill(t('ui.deed.trapped'), { name: opponent.name.toLowerCase() }),
  )
}

/**
 * Rows 3 and 11: the operator's pick (I-30).
 *
 * "Injury (-1d6 ENDURANCE) or loss of weapon, the operator's pick" - so
 * the app offers both halves and applies exactly the one taken, once.
 * The injury is the die already rolled with the row; the weapon is a
 * fact that outlives this fight, and only the Master carries one this
 * build can suspend (R68, I-02), so a row naming the opponent offers the
 * injury alone. `resolved` closes the pick.
 *
 * An opponent's injury lands on the body the Master is aimed at, which
 * is where the rest of the round's damage lands too (Phase 10e), and it
 * can end that body on the spot: the reading working, not a bug.
 */
const doInjury = (state: RecordState, take: 'injury' | 'weapon'): RecordState => {
  const c = state.combat
  const injury = c?.event?.injury
  if (c === null || c.event === null || injury == null || injury.resolved !== null) return state
  if (take === 'weapon' && injury.target !== 'master') return state
  const event = { ...c.event, injury: { ...injury, resolved: take } }
  if (take === 'weapon') return { ...state, weaponLost: true, combat: { ...c, event } }
  const next =
    injury.target === 'master'
      ? withSheet(state, { endurance: floor(state.sheet.endurance - injury.amount) })
      : state
  const aimed = aimedAt(c)
  const combat: Combat = {
    ...c,
    event,
    foes:
      injury.target === 'opponent'
        ? c.foes.map((f) =>
            f === aimed ? { ...f, endurance: floor(f.endurance - injury.amount) } : f,
          )
        : c.foes,
  }
  return { ...next, combat: { ...combat, over: fightEnd(next, combat) } }
}

/** Morale on a retreat row (spec.md, sealed): the foe's roll, so the table's dice. */
const doMorale = (state: RecordState, dice: DiceSource): RecordState => {
  const c = state.combat
  if (c === null || c.event === null || !c.event.retreatRow || c.morale !== null) return state
  return withCombat(state, { morale: morale(dice) })
}

/**
 * After a victory: one fallen body's LOOT line (5T a2), read once each.
 *
 * One line per body, in the order they fell, because that is what the
 * adventure prints: a LOOT line belongs to an opponent, not to a fight.
 * Two Devil servants down is two rolls on the Devil servant line, and
 * they may drop different things.
 */
const doLoot = (state: RecordState, dice: DiceSource, index: number): RecordState => {
  const c = state.combat
  const body = c?.foes[index]
  if (c === null || body === undefined || body.endurance > 0 || body.looted) return state
  return { ...doLootOf(state, body.id, dice), combat: withFoe(c, index, { looted: true }) }
}

/**
 * Leaving the fight. Won, or ended by an Unexpected Event: back to the
 * beat. Fled with the foe standing: the last blow and a Dishonor Point
 * (R38, R39, I-32). Master down: the world dies with the Master and a
 * new record begins (spec.md, Horizon).
 */
const doLeave = (state: RecordState, dice: DiceSource): RecordState => {
  const c = state.combat
  if (c === null) return state
  if (c.over.ended && c.over.reason === 'master-down') return newRecord(dice)
  const bodies = c.foes
    .map((f) => ({ body: f, foe: treasureFoeById(f.id) }))
    .filter((x): x is { body: FoeInFight; foe: Opponent } => x.foe !== undefined)
  const beaten = bodies.filter((x) => x.body.endurance === 0)
  const alive = bodies.filter((x) => x.body.endurance > 0)
  // Who is still in the room when the fight stops (Phase 10d, extended
  // to a band in 10e).
  //
  // Beaten: those bodies are gone and the rest of the encounter stays.
  // Ended by an Unexpected Event: the fight stopped, the room did not
  // empty. Whoever is still standing is still standing there unless the
  // row removed them - a retreat the Morale roll turned into a flight
  // or a withdrawal is the one thing that does - and row 7's Minions
  // join them, of the kind the Master was aimed at.
  // Fled: the encounter is left behind entirely (I-32).
  const left =
    c.event !== null &&
    c.event.retreatRow &&
    (c.morale?.result === 'flee' || c.morale?.result === 'cautious-retreat')
  const aim = aimedAt(c)
  const joined =
    c.event?.minions != null
      ? Array.from({ length: c.event.minions.count }, () => aim.id)
      : c.morale?.result === 'rally'
        ? Array.from({ length: c.morale.reinforcements }, () => aim.id)
        : []
  const stillHere = left ? [] : alive.map((x) => x.body.id)
  // Every id that walked into this fight leaves `pending`, whatever
  // became of it; what is still standing goes back on, so a Master who
  // faced one of three and stopped still has the other two waiting.
  const untouched = c.foes.reduce((rest, f) => withoutFirst(rest, f.id), state.pending)
  const remaining =
    c.over.ended && c.over.reason === 'unexpected-event'
      ? [...untouched, ...stillHere, ...joined]
      : bandEndurance(c) === 0
        ? untouched
        : []
  // A named foe beaten is gone from every table it appears in (I-33b,
  // I-33c), and is also a source the treasures may name (I-41): what
  // the Old Vixen knew is on her body either way.
  const named = beaten.map((x) => x.foe.id).filter((id) => !RANK_AND_FILE.includes(id))
  const cave = named.reduce(
    (world, id) => learntInto(resolveEncounter(world, [id]), id),
    state.cave,
  )
  // Two of the four moments the app asks about land here, because both
  // are read on leaving the fight: a body on the floor, and a tie whose
  // row the book itself tells the player to imagine (MH p.27-28).
  const asked =
    c.event !== null
      ? 'unexpected-event'
      : beaten.length > 0
        ? 'kill'
        : null
  const back: RecordState = asks2(
    { ...state, screen: 'beat', combat: null, cave, pending: remaining },
    asked,
  )
  if (c.over.ended) return back
  // Fleeing: the last blow of 2 and a Dishonor Point (R38, R39, I-32).
  // Phase 10d gives it a result slip as well as a deed - running away
  // is a beat of the story, and the ledger is not where a player reads
  // what just happened to them. The name on it is whoever the Master
  // was aimed at when they turned: the slip says who they ran from.
  const from = treasureFoeById(aim.id)
  if (from === undefined) return back
  const fled = escape({ endurance: state.sheet.endurance })
  return addDeed(
    withSheet(
      {
        ...back,
        result: {
          kind: 'flee',
          foe: from.name,
          before: state.sheet.endurance,
          after: floor(fled.endurance),
          dishonor: fled.dishonor,
        },
      },
      {
        endurance: floor(fled.endurance),
        dishonor: state.sheet.dishonor + fled.dishonor,
      },
    ),
    fill(t('ui.deed.fled'), { name: from.name.toLowerCase() }),
  )
}

// --------------------------------------------------------------- the ending

/**
 * One of R43's four scores (MH p.34).
 *
 * "Assign a number from 1 (poor) to 3 (excellent)". Out of range is
 * reported by the engine's `xpAward` and never corrected here, because
 * spec.md refuses to refuse; what this does refuse is a score for a
 * category the book does not print, which is not a judgement but a typo.
 */
const doScore = (state: RecordState, category: XpCategoryName, value: number): RecordState =>
  // Once banked the scores are history: changing them would change a
  // payment already made.
  state.scoresBanked || !(XP_CATEGORIES as readonly string[]).includes(category)
    ? state
    : { ...state, scores: { ...state.scores, [category]: value } }

/**
 * What this adventure was worth (R43), read off the scores given so far.
 *
 * An unscored category counts as nothing rather than as one: the sum has
 * to be visibly incomplete while it is, or a player reads a number that
 * looks like a verdict and is only a partial tally.
 */
export const awardFor = (state: RecordState): XpAward =>
  xpAward({
    scores: Object.fromEntries(
      XP_CATEGORIES.map((name) => [name, state.scores[name] ?? 0]),
    ) as Record<XpCategoryName, number>,
    dishonor: state.sheet.dishonor,
  })

/** Every score given: the ending is scored and the XP is real. */
export const fullyScored = (state: RecordState): boolean =>
  XP_CATEGORIES.every((name) => state.scores[name] !== null)

/**
 * Open the passage field with a question (Phase 10j).
 *
 * "The rulebook gives you the tools, the story comes from your
 * imagination" (MH p.3), and at the tie the book asks the player to
 * imagine outright (MH p.27-28) without printing a question. These are
 * the questions, and they arrive at the moment rather than as a
 * permanently open box that goes unfilled. Nothing is required: the
 * field can be walked away from, and a moment that already has a prompt
 * open is not interrupted by a second one.
 */
const asks = (state: RecordState, moment: PromptMoment): RecordState =>
  state.prompt === null ? { ...state, prompt: moment } : state

/** {@link asks}, where the caller may have no moment to ask about. */
const asks2 = (state: RecordState, moment: PromptMoment | null): RecordState =>
  moment === null ? state : asks(state, moment)

/**
 * Bank the four scores as XP, once (R43, R47).
 *
 * "Add the four values together and subtract your Dishonor Points from
 * the total to obtain the XP you can spend on advancement." It is added
 * to what the Master already carries rather than replacing it, because
 * R47 carries the remainder forward: an ending is a payment, not a
 * balance. Banking twice would pay twice, so it happens once.
 */
const doBank = (state: RecordState): RecordState => {
  if (state.scoresBanked || !fullyScored(state)) return state
  const award = awardFor(state)
  return addDeed(
    withSheet({ ...state, scoresBanked: true }, { xp: state.sheet.xp + award.total }),
    fill(t('ui.ending.deed.banked'), { n: award.total }),
  )
}

/**
 * Spend XP on one +1 of the advancement table (R44, R45, R47).
 *
 * The cost is the table's, read at the Master's current SKILL band; the
 * engine prices it and says whether the cap allows it. The cap is a
 * **flag, never a refusal** (spec.md): a Master with SKILL 12 who buys
 * another point gets SKILL 13 and a line saying so, because the app does
 * not overrule a player at their own sheet. What it will not do is spend
 * XP that is not there - that is arithmetic, not judgement.
 *
 * LUCK raises its initial value with it. R05 keeps the initial beside
 * the current because the shrine restores toward it, and a Master who
 * has bought a point of LUCK and then spent it would otherwise find the
 * point they paid for gone for good. Labelled: the book does not say so.
 */
const doAdvance = (state: RecordState, increase: Increase): RecordState => {
  const band = skillBand(state.sheet.skill)
  const cost = xpCostFor(increase)(band)?.cost
  if (cost === undefined) return state
  const priced = purchase({ increase, cost, xp: state.sheet.xp, current: currentOf(state, increase) })
  if (!priced.affordable) return state
  const xp = state.sheet.xp - cost
  const s = state.sheet
  const bought =
    increase === 'SKILL'
      ? { skill: s.skill + 1 }
      : increase === 'ENDURANCE'
        ? { endurance: s.endurance + 1, enduranceInitial: s.enduranceInitial + 1 }
        : increase === 'LUCK'
          ? { luck: s.luck + 1, luckInitial: s.luckInitial + 1 }
          : increase === 'Training skill'
            ? { training: s.training + 1, resources: s.resources + RESOURCES_PER_TRAINING_POINT }
            : { proficiencies: raiseBest(s.proficiencies) }
  return addDeed(
    withSheet(state, { ...bought, xp }),
    fill(t('ui.ending.deed.bought'), { name: increase, n: cost }),
  )
}

/** The value R45's cap is read against, or undefined where nothing caps it. */
const currentOf = (state: RecordState, increase: Increase): number | undefined =>
  increase === 'SKILL' ? state.sheet.skill : increase === 'LUCK' ? state.sheet.luck : undefined

/**
 * A Martial Proficiency +1 goes on the highest the Master has.
 *
 * The book says "Martial Proficiency" and does not say which, and the
 * app has no business picking for a player who has three. The highest is
 * the one they have been leaning on, which is the choice a player makes
 * anyway; a picker for it is a later phase's row, not a reason to leave
 * the whole line unbuyable.
 */
const raiseBest = (list: readonly Sheet['proficiencies'][number][]) => {
  const best = list.reduce((top, p) => (p.value > top.value ? p : top), list[0] ?? { name: '', value: 0 })
  return list.map((p) => (p.name === best.name ? { ...p, value: p.value + 1 } : p))
}

/**
 * Learn a Technique or a Ritual with resource points (R16, R18; MH p.35).
 *
 * "To learn new Techniques or Rituals, you will need to increase your
 * Training Skill (by spending XP)" - so the Training point bought above
 * is what makes this row exist at all, and its four resource points are
 * what pay for it. A Master who already knows it is not sold it twice.
 */
const doLearnAbility = (state: RecordState, id: string): RecordState => {
  const technique = techniqueById(id)
  const ritual = ritualById(id)
  const cost = technique?.cost ?? ritual?.cost
  const name = technique?.name ?? ritual?.name
  if (cost === undefined || name === undefined || cost > state.sheet.resources) return state
  if (state.sheet.techniques.includes(id) || state.sheet.rituals.includes(id)) return state
  return addDeed(
    withSheet(state, {
      resources: state.sheet.resources - cost,
      ...(technique === undefined
        ? { rituals: [...state.sheet.rituals, id] }
        : { techniques: [...state.sheet.techniques, id] }),
    }),
    fill(t('ui.ending.deed.learned'), { name }),
  )
}

// -------------------------------------------------------------- creation

/** Apply a change to the Master being made; a no-op once one has begun. */
const onCreation = (
  state: RecordState,
  change: (c: CreationState) => CreationState,
): RecordState =>
  state.creation === null ? state : { ...state, creation: change(state.creation) }

/**
 * The ROLL button, whatever step it is on.
 *
 * One action rather than four means the screen has one primary control
 * and the reducer owns the book's order (R02/R03 -> R04/R05 -> R09),
 * rather than three components each knowing what comes next.
 */
const rollStep = (c: CreationState, dice: DiceSource): CreationState => {
  switch (c.step) {
    // R02 and R03 share the book's second step: the standing rolled, the
    // kit chosen on the same page (docs/rules/master-creation.md).
    case 'who':
    case 'standing':
      return { ...rollStanding(c, dice), step: 'kit' }
    case 'numbers':
      return { ...rollNumbers(c, dice), step: 'art' }
    case 'art':
      return { ...rollArt(c, dice), step: 'training' }
    default:
      return c
  }
}

/**
 * Move a Proficiency by `delta`, floored at zero.
 *
 * Not ceilinged: R10's pool is reported, never enforced (spec.md), and
 * `flagsOf` says so on screen. A player who wants Yin's overspend can
 * have it, because Yin's printed sheet has it.
 */
const withProficiency = (c: CreationState, name: string, delta: number): CreationState => {
  const next = Math.max(0, (c.proficiencies[name] ?? 0) + delta)
  return { ...c, proficiencies: { ...c.proficiencies, [name]: next } }
}

// --------------------------------------------------------------- village

/**
 * The village's three procedures (MH p.47, p.52-55; spec.md, Horizon).
 *
 * Each is one call into `packages/engine/src/village`, and each returns
 * a note rather than a `Result`: the shrine rolls, the inn and the
 * stall row do not, and the result slip is built for a roll. Every
 * refusal — no silver, no incense, a second visit today — is reported
 * and never thrown, which is the engine's own contract carried up.
 */
const doBuy = (state: RecordState, id: string): RecordState => {
  const bought = buy({ market, itemId: id, purse: state.silver })
  const name = bought.item?.item ?? id
  if (!bought.bought) {
    return {
      ...state,
      villageNote: { text: fill(t('ui.village.poor'), { item: name }), roll: null, cite: 'MH p.52-55' },
    }
  }
  const paid = fromSilver(bought.cost)
  return {
    ...state,
    silver: bought.after,
    // Incense is the shrine's condition (R58); the engine holds no
    // inventory, so the record remembers this one item.
    incense: state.incense || bought.item?.id === INCENSE_ID,
    sheet: { ...state.sheet, gold: fromSilver(bought.after).gp },
    villageNote: {
      text: fill(t('ui.village.bought'), {
        item: name,
        cost: paid.gp === 0 ? `${paid.sp} SP` : `${paid.gp} GP ${paid.sp} SP`,
      }),
      roll: null,
      cite: 'MH p.52-55',
    },
  }
}

const doTemple = (state: RecordState, dice: DiceSource): RecordState => {
  const { source, manual } = masterDice(state, dice)
  const visit = templeVisit({
    skill: state.sheet.skill,
    luck: state.sheet.luck,
    // R05's initial LUCK is the ceiling: the shrine restores toward
    // where the Master started, never past it.
    maxLuck: state.sheet.luckInitial,
    hasIncense: state.incense,
    visitedToday: state.templeVisitedToday,
  })(source)
  const cite = citeOf('village.temple-recovers-one-luck')
  if (!visit.attempted) {
    return {
      ...state,
      villageNote: {
        text: t(visit.reason === 'no-incense' ? 'ui.village.temple.none' : 'ui.village.temple.spent'),
        roll: null,
        cite: visit.reason === 'no-incense' ? cite : citeOf('village.one-temple-check-per-day'),
      },
    }
  }
  const passed = visit.outcome?.success === true
  return afterMasterRoll(
    withSheet(
      {
        ...state,
        templeVisitedToday: true,
        // The stick is burned whether the gods listen or not.
        incense: false,
        villageNote: {
          text: t(passed ? 'ui.village.temple.passed' : 'ui.village.temple.failed'),
          roll: visit.outcome?.roll ?? null,
          cite,
        },
      },
      { luck: visit.luck },
    ),
    manual,
  )
}

const doInn = (state: RecordState): RecordState => {
  const place = placeRunning(villagePlaces, 'inn')
  const stay = stayTheNight({
    skill: { current: state.sheet.skill, initial: state.sheet.skillInitial },
    endurance: { current: state.sheet.endurance, initial: state.sheet.enduranceInitial },
    purse: state.silver,
    roomPriceSp: place?.roomPriceSp ?? 0,
  })
  if (!stay.stayed) {
    return {
      ...state,
      villageNote: { text: t('ui.village.inn.poor'), roll: null, cite: citeOf('village.inn-charges-before-it-heals') },
    }
  }
  return withSheet(
    {
      ...state,
      silver: stay.purseAfter,
      // A night has passed, so the shrine will listen again (I-58).
      templeVisitedToday: false,
      villageNote: {
        text: fill(t('ui.village.inn.rested'), {
          skill: stay.skill?.after ?? state.sheet.skill,
          endurance: stay.endurance?.after ?? state.sheet.endurance,
        }),
        roll: null,
        cite: citeOf('village.nights-rest-is-the-sealed-four'),
      },
    },
    {
      skill: stay.skill?.after ?? state.sheet.skill,
      endurance: stay.endurance?.after ?? state.sheet.endurance,
      gold: fromSilver(stay.purseAfter).gp,
    },
  )
}

// ---------------------------------------------------------------- import

/**
 * Read a pasted campaign (Phase 6's `importJson`, given a door).
 *
 * The engine migrates rather than refuses, and every rejection it can
 * return has a worded string in the content package — so a player who
 * pastes the wrong thing is told which wrong thing it was, not "import
 * failed". A successful read replaces the campaign half of the record
 * and leaves the session half (the screen, the draft) alone, which is
 * the same split `load` keeps.
 */
const doImport = (state: RecordState): RecordState => {
  const result = importJson(state.importDraft)
  if (!result.ok) {
    const r = result.rejection
    return {
      ...state,
      importNote: fill(t(`ui.record.import.${r.reason}`), {
        version: 'version' in r ? r.version : '',
        current: 'current' in r ? r.current : '',
      }),
    }
  }
  const restored = fromCampaign(result.record, state)
  return {
    ...restored,
    screen: 'record',
    importDraft: '',
    importNote:
      result.migrations.length === 0
        ? t('ui.record.import.ok')
        : fill(t('ui.record.import.migrated'), { n: result.migrations.length }),
  }
}

// ------------------------------------------------------------------ reduce

/** The one way a record changes. Pure: same state, action and dice, same result. */
export const reduce = (state: RecordState, action: Action, dice: DiceSource): RecordState => {
  switch (action.type) {
    case 'nav':
      return { ...state, screen: action.screen }
    case 'cave.go':
      return doGo(state, action.to, dice)
    case 'cave.take':
      return state.pending.length > 0 ? state : doTakeAsked(state, action.treasure)
    case 'cave.rescue':
      return doRescue(state, dice)
    case 'cave.attack':
      return doAttackRescue(state)
    case 'cave.learn':
      return doLearn(state)
    case 'cave.fight':
      return doFight(state, action.foe)
    case 'cave.fight-all':
      return doFightAll(state)
    case 'cave.call':
      return state.pending.length === 0 ? state : doCall(state, action.foe, dice)
    case 'cave.rest':
      return state.pending.length > 0 ? state : doRest(state)
    case 'cave.gourd':
      return doGourd(state)
    case 'cave.leave':
      return state.pending.length > 0
        ? state
        : {
            ...state,
            screen: 'region',
            result: null,
            roll: null,
            // The cave is behind them, and MAP is the region's again
            // (Phase 10h). Durable, because walking off the mountain is
            // not a thing a reload should undo.
            cave: withFlag(state.cave, LEFT, true),
          }
    // The way back down. The mountain's only exit off the adventure is
    // the trail it was reached by (Phase 10b): the region is the
    // ending's business, the village is the doorstep's.
    case 'cave.village':
      return state.pending.length > 0 ? state : { ...state, screen: 'village', result: null, roll: null }
    // The act slip is dismissed by any tap and never returns (Phase
    // 10c). Marking it seen is the whole of the action: nothing else
    // about the record moves, and the act itself is derived, never
    // stored.
    case 'act.seen': {
      const act = actFor(TABLES, state.cave)
      if (act === undefined || state.actsSeen.includes(act.act)) return state
      return { ...state, actsSeen: [...state.actsSeen, act.act] }
    }
    case 'roll.manual':
      return { ...state, byHand: !state.byHand, manual: [] }
    case 'roll':
      return rollCard(state, dice)
    case 'roll.close':
      return closeCard(state)
    case 'manual.toggle':
      return { ...state, manualOpen: !state.manualOpen, manual: [] }
    case 'manual.cancel':
      return { ...state, manualOpen: false, manual: [] }
    case 'manual.face':
      return {
        ...state,
        manual: state.manual.length >= 2 ? [action.face] : [...state.manual, action.face],
      }
    case 'draft':
      return { ...state, draft: action.text }
    case 'passage.keep': {
      const text = state.draft.trim()
      // The player's own words stand in the chronicle where they wrote
      // them, which is the whole point of writing them there.
      return text.length === 0
        ? state
        : chronicled(
            { ...state, passages: [...state.passages, text], draft: '', prompt: null },
            'passage',
            text,
          )
    }
    case 'combat.round':
      return doRound(state, dice)
    case 'combat.strike':
      return doStrike(state)
    case 'combat.technique':
      return doTechnique(state, action.id)
    case 'combat.weapon':
      // R25c is also how a weapon lost to row 3 comes back (I-30): the
      // book already prints the option for exactly this, so the pick
      // needed no row of its own.
      return state.combat !== null && aimedAt(state.combat).outcome === 'master-wins'
        ? withCombat({ ...state, weaponLost: false }, { last: null, foes: rolledOff(state.combat) })
        : state
    case 'combat.target':
      return doTarget(state, action.index)
    case 'combat.opening':
      return doOpening(state)
    case 'combat.tie':
      return doTie(state)
    case 'combat.fan':
      return doFan(state, dice)
    case 'combat.blow':
      return doBlow(state, dice)
    case 'combat.morale':
      return doMorale(state, dice)
    case 'combat.injury':
      return doInjury(state, action.take)
    case 'combat.resume':
      return doResume(state)
    case 'combat.loot':
      return doLoot(state, dice, action.index)
    case 'combat.keep':
      return doKeep(state, dice)
    case 'combat.let-go':
      return doLetGo(state)
    case 'combat.inspire':
      return doInspire(state, dice)
    case 'combat.name':
      return onNaming(state, { name: action.name })
    case 'combat.value':
      return onNaming(state, { value: action.value })
    case 'combat.describe':
      return onNaming(state, { description: action.text })
    case 'combat.learn':
      return doKeepTechnique(state)
    case 'combat.leave':
      return doLeave(state, dice)
    case 'rules.filter':
      return { ...state, filter: action.filter }
    case 'rules.open':
      return { ...state, openId: state.openId === action.id ? null : action.id }
    case 'region.travel':
      return state.region.points.some((p) => p.id === action.to) ? { ...state, here: action.to } : state
    case 'record.draft':
      return { ...state, importDraft: action.text }
    case 'ending.score':
      return doScore(state, action.category, action.value)
    case 'ending.bank':
      return doBank(state)
    case 'ending.buy':
      return doAdvance(state, action.increase)
    case 'ending.learn':
      return doLearnAbility(state, action.id)
    case 'creation.motive.roll': {
      // The book's own address for its own table: d66, tens then ones
      // (MH p.36-39, R50).
      const rolled = rollAdventureHook(d6(dice), d6(dice))
      return rolled === undefined
        ? state
        : onCreation(state, (c) => ({ ...c, motiveId: rolled.id }))
    }
    case 'creation.motive':
      return adventureHookById(action.id) === undefined
        ? state
        : onCreation(state, (c) => ({ ...c, motiveId: action.id }))
    case 'prompt.dismiss':
      return { ...state, prompt: null }
    case 'record.import':
      return doImport(state)
    case 'record.new':
      return newRecord(dice)

    // ---------------------------------------------------------- creation
    // Every branch is a no-op once `creation` is null: a Master who has
    // begun cannot be re-rolled by a stale button or a replayed action.
    case 'creation.name':
      return onCreation(state, (c) => ({ ...c, name: action.name }))
    case 'creation.preset':
      return onCreation(state, (c) => takePreset(c, action.id, dice))
    case 'creation.roll':
      return onCreation(state, (c) => rollStep(c, dice))
    case 'creation.art':
      return onCreation(state, (c) => ({ ...c, martialArtId: action.id, step: 'training' }))
    case 'creation.age':
      return onCreation(state, (c) => ({ ...c, age: action.age }))
    case 'creation.weapon':
      return onCreation(state, (c) => ({ ...c, weapon: action.weapon }))
    // R15 sets no ceiling on Training; the only bound is arithmetic. Each
    // point subtracts one SKILL, so there are at most as many as the
    // rolled SKILL holds (and none before it is rolled).
    case 'creation.training':
      return onCreation(state, (c) => ({
        ...c,
        training: Math.max(0, Math.min(c.skill?.initial ?? 0, action.points)),
      }))
    case 'creation.proficiency':
      return onCreation(state, (c) => withProficiency(c, action.name, action.delta))
    case 'creation.technique':
      return onCreation(state, (c) => ({
        ...c,
        techniqueIds: c.techniqueIds.includes(action.id)
          ? c.techniqueIds.filter((id) => id !== action.id)
          : [...c.techniqueIds, action.id],
      }))
    case 'creation.ritual':
      return onCreation(state, (c) => ({
        ...c,
        ritualIds: c.ritualIds.includes(action.id)
          ? c.ritualIds.filter((id) => id !== action.id)
          : [...c.ritualIds, action.id],
      }))
    case 'creation.kit':
      return onCreation(state, (c) => ({
        ...c,
        kitItemId: c.kitItemId === action.id ? null : action.id,
      }))
    case 'creation.step':
      return onCreation(state, (c) => ({ ...c, step: action.step }))
    case 'village.buy':
      return doBuy(state, action.id)
    case 'village.temple':
      return doTemple(state, dice)
    case 'village.inn':
      return doInn(state)
    case 'village.trail':
      return doTrail(state)

    case 'creation.begin':
      return state.creation === null
        ? state
        : {
            ...state,
            creation: null,
            // A made Master wakes in Fen Pass, not on the mountain
            // (Phase 10b): the premise is read as the Call before the
            // first roll, and the trail is the point of no return.
            screen: 'village',
            sheet: finishCreation(state.creation),
            // R03's gold, in the silver prices are compared at.
            silver: toSilver({ gp: finishCreation(state.creation).gold }),
          }
  }
}
