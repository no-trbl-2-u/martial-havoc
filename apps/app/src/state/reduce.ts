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
  attackRescue,
  attackStrength,
  behaviours,
  buy,
  endsFight,
  escape,
  finalBlow,
  flag,
  fromSilver,
  importJson,
  learnFrom,
  lootFrom,
  morale,
  nightsRest,
  placeRunning,
  rescue,
  resolveEncounter,
  resolveRound,
  spendTechnique,
  stayTheNight,
  step,
  takeDrop,
  takeHere,
  templeVisit,
  toggleFlag,
  toSilver,
  unexpectedEvent,
  withFlag,
} from '@martial-havoc/engine'
import type { DiceSource } from '@martial-havoc/engine'
import {
  INCENSE_ID,
  effectFor,
  market,
  rollUnexpectedEvent,
  t,
  theFiveTreasures,
  theFiveTreasuresAreaById,
  theFiveTreasuresTreasureById,
  treasureFoeById,
  unexpectedEventLineFor,
  villagePlaces,
} from '@martial-havoc/content'
import type { Opponent } from '@martial-havoc/content'
import { queued } from '../dice/random'
import { fill } from '../lib/fill'
import { newRecord } from './record'
import { fromCampaign } from './campaign'
import { GOURD, NIGHT, RANK_AND_FILE, foeName, treasureName } from './menu'
import {
  MAX_TRAINING,
  finishCreation,
  rollArt,
  rollNumbers,
  rollStanding,
  takePreset,
} from './creation'
import type { Action, Combat, CreationState, RecordState, Sheet } from './types'

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

const addDeed = (state: RecordState, deed: string): RecordState => ({
  ...state,
  deeds: [...state.deeds, deed],
})

/** `list` without its first `value`, if any. */
const withoutFirst = (list: readonly string[], value: string): readonly string[] => {
  const i = list.indexOf(value)
  return i < 0 ? list : [...list.slice(0, i), ...list.slice(i + 1)]
}

/** R26 read off the current numbers. */
const fightEnd = (state: RecordState, combat: Combat) =>
  endsFight({
    masterEndurance: state.sheet.endurance,
    opponentEndurance: combat.foeEndurance,
    finalBlowLanded: combat.blow?.landed === true,
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
  const turn = step(TABLES, state.cave, to, source)
  if (!turn.passage.ok || turn.area === undefined || turn.event === undefined) return state
  const foes = turn.encounter?.foes.map((foe) => foe.id) ?? []
  return afterMasterRoll(
    {
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
        foes: foes.map(foeName),
        hint: turn.hintRevealed,
      },
    },
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

/**
 * Read a foe's LOOT line (5T a2) and put the drop where it belongs:
 * a treasure, a key, an item. The result slip shows the printed item.
 */
const doLootOf = (state: RecordState, foeId: string, dice: DiceSource): RecordState => {
  const drop = lootFrom(TABLES, foeId)(dice)
  const cave = takeDrop(state.cave, drop.row)
  const row = drop.row
  const result: RecordState['result'] = {
    kind: 'loot',
    foe: foeName(foeId),
    face: drop.face ?? null,
    item: row?.item ?? t('ui.cave.loot.nothing'),
    treasure: row?.treasure === undefined || row.treasure === null ? null : treasureName(row.treasure),
    key: row?.key !== undefined && row.key !== null,
  }
  const next = { ...state, cave, result }
  if (row === undefined || row.hint) return next
  const took = row.treasure !== null ? treasureName(row.treasure) : row.item
  return addDeed(next, fill(t('ui.deed.took'), { name: took }))
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
  return doLootOf(
    addDeed(freed, fill(t('ui.deed.freed'), { name: foeName(foe) })),
    foe,
    dice,
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
    opponent,
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
const CORD = 'treasure.the-5-treasures.dazzling-golden-cord'
const CORD_KNOWN = 'cord-spells-known'

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

/** Face one of the foes the Event brought. */
const doFight = (state: RecordState, foe: string): RecordState => {
  const opponent = treasureFoeById(foe)
  return opponent === undefined || !state.pending.includes(foe) ? state : startFight(state, opponent)
}

const startFight = (state: RecordState, foe: Opponent): RecordState => ({
  ...state,
  screen: 'combat',
  result: null,
  roll: null,
  combat: {
    foeId: foe.id,
    foeEndurance: foe.endurance,
    round: 1,
    last: null,
    event: null,
    morale: null,
    opening: false,
    blow: null,
    techniqueLine: null,
    looted: false,
    over: { ended: false },
  },
})

// --------------------------------------------------------------- the fight

const doRound = (state: RecordState, dice: DiceSource): RecordState => {
  const c = state.combat
  const foe = c === null ? undefined : treasureFoeById(c.foeId)
  if (c === null || foe === undefined || c.over.ended || c.last !== null) return state
  const { source, manual } = masterDice(state, dice)
  const master = attackStrength({
    skill: state.sheet.skill,
    proficiencies: state.sheet.proficiencies,
  })(source)
  const opponent = attackStrength({ skill: foe.skill, proficiencies: foe.proficiencies })(dice)
  const outcome = resolveRound(master, opponent)
  const hit = outcome.kind === 'master-hit' ? outcome.damage : 0
  const next = withSheet(state, { endurance: floor(state.sheet.endurance - hit) })
  const event =
    outcome.kind === 'unexpected-event'
      ? (() => {
          const roll = unexpectedEvent(dice)
          const row = rollUnexpectedEvent(roll.total)
          return {
            roll,
            text: row?.text ?? '',
            line: row === undefined ? '' : (unexpectedEventLineFor(row.id)?.line ?? ''),
            retreatRow: row?.retreatRow === true,
          }
        })()
      : null
  const combat: Combat = {
    ...c,
    round: c.round + 1,
    last: {
      master,
      opponent,
      outcome: outcome.kind,
      difference: master.total - opponent.total,
    },
    event,
    morale: null,
    blow: null,
    techniqueLine: null,
  }
  return afterMasterRoll(
    { ...next, combat: { ...combat, over: fightEnd(next, combat) } },
    manual,
  )
}

/** The winner's option (a): the difference off the foe's ENDURANCE (R25a). */
const doStrike = (state: RecordState): RecordState => {
  const c = state.combat
  if (c === null || c.last === null || c.last.outcome !== 'master-wins') return state
  const foe = treasureFoeById(c.foeId)
  const foeEndurance = floor(c.foeEndurance - c.last.difference)
  const combat: Combat = { ...c, foeEndurance, last: null, opening: false }
  const next = { ...state, combat: { ...combat, over: fightEnd(state, combat) } }
  return foeEndurance === 0 && foe !== undefined
    ? addDeed(next, fill(t('ui.deed.killed'), { name: foe.name.toLowerCase() }))
    : next
}

/** The winner's option (b): a Technique, no roll, its cost in ENDURANCE (R27, I-23). */
const doTechnique = (state: RecordState, id: string): RecordState => {
  const c = state.combat
  const effect = effectFor(id)
  if (
    c === null ||
    c.last === null ||
    c.last.outcome !== 'master-wins' ||
    effect === undefined ||
    !state.sheet.techniques.includes(id)
  )
    return state
  const endurance = floor(spendTechnique(state.sheet.endurance, effect.cost))
  const next = withSheet(state, { endurance })
  const combat: Combat = { ...c, last: null, techniqueLine: effect.line }
  return { ...next, combat: { ...combat, over: fightEnd(next, combat) } }
}

/** The winner's option (d): an Opening, no damage (R29). */
const doOpening = (state: RecordState): RecordState => {
  const c = state.combat
  if (c === null || c.last === null || c.last.outcome !== 'master-wins') return state
  return withCombat(state, { opening: true, last: null })
}

/** The Final Blow after an Opening: doubles land it (R30; spec.md sealed). */
const doBlow = (state: RecordState, dice: DiceSource): RecordState => {
  const c = state.combat
  const foe = c === null ? undefined : treasureFoeById(c.foeId)
  if (c === null || foe === undefined || !c.opening || c.over.ended) return state
  const { source, manual } = masterDice(state, dice)
  const blow = finalBlow({})(source)
  const combat: Combat = {
    ...c,
    blow,
    opening: !blow.landed,
    foeEndurance: blow.landed ? 0 : c.foeEndurance,
  }
  const next = { ...state, combat: { ...combat, over: fightEnd(state, combat) } }
  return afterMasterRoll(
    blow.landed
      ? addDeed(next, fill(t('ui.deed.final-blow'), { name: foe.name.toLowerCase() }))
      : next,
    manual,
  )
}

/** Morale on a retreat row (spec.md, sealed): the foe's roll, so the table's dice. */
const doMorale = (state: RecordState, dice: DiceSource): RecordState => {
  const c = state.combat
  if (c === null || c.event === null || !c.event.retreatRow || c.morale !== null) return state
  return withCombat(state, { morale: morale(dice) })
}

/** After a victory: the foe's LOOT line (5T a2), read once. */
const doLoot = (state: RecordState, dice: DiceSource): RecordState => {
  const c = state.combat
  if (c === null || c.foeEndurance > 0 || c.looted) return state
  return withCombat(doLootOf(state, c.foeId, dice), { looted: true })
}

/**
 * Leaving the fight. Won, or ended by an Unexpected Event: back to the
 * beat. Fled with the foe standing: the last blow and a Dishonor Point
 * (R38, R39, I-32). Master down: the world dies with the Master and a
 * new record begins (spec.md, Horizon).
 */
const doLeave = (state: RecordState, dice: DiceSource): RecordState => {
  const c = state.combat
  const foe = c === null ? undefined : treasureFoeById(c.foeId)
  if (c === null || foe === undefined) return state
  if (c.over.ended && c.over.reason === 'master-down') return newRecord(dice)
  // The foe fought is no longer pending; a named foe beaten is gone
  // from every table it appears in (I-33b, I-33c). Fleeing leaves the
  // encounter behind: the rest of it does not follow.
  const beaten = c.foeEndurance === 0
  const remaining = beaten ? withoutFirst(state.pending, foe.id) : []
  const cave =
    beaten && !RANK_AND_FILE.includes(foe.id)
      ? // A named foe beaten is also a source the treasures may name
        // (I-41): what the Old Vixen knew is on her body either way.
        learntInto(resolveEncounter(state.cave, [foe.id]), foe.id)
      : state.cave
  const back: RecordState = { ...state, screen: 'beat', combat: null, cave, pending: remaining }
  if (c.over.ended) return back
  const fled = escape({ endurance: state.sheet.endurance })
  return addDeed(
    withSheet(back, {
      endurance: floor(fled.endurance),
      dishonor: state.sheet.dishonor + fled.dishonor,
    }),
    fill(t('ui.deed.fled'), { name: foe.name.toLowerCase() }),
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
    case 'who':
    case 'standing':
      return { ...rollStanding(c, dice), step: 'numbers' }
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
      return state.pending.length > 0 ? state : doTake(state, action.treasure)
    case 'cave.rescue':
      return doRescue(state, dice)
    case 'cave.attack':
      return doAttackRescue(state)
    case 'cave.learn':
      return doLearn(state)
    case 'cave.fight':
      return doFight(state, action.foe)
    case 'cave.rest':
      return state.pending.length > 0 ? state : doRest(state)
    case 'cave.gourd':
      return doGourd(state)
    case 'cave.leave':
      return state.pending.length > 0 ? state : { ...state, screen: 'region', result: null, roll: null }
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
      return text.length === 0 ? state : { ...state, passages: [...state.passages, text], draft: '' }
    }
    case 'combat.round':
      return doRound(state, dice)
    case 'combat.strike':
      return doStrike(state)
    case 'combat.technique':
      return doTechnique(state, action.id)
    case 'combat.weapon':
      return state.combat?.last?.outcome === 'master-wins' ? withCombat(state, { last: null }) : state
    case 'combat.opening':
      return doOpening(state)
    case 'combat.blow':
      return doBlow(state, dice)
    case 'combat.morale':
      return doMorale(state, dice)
    case 'combat.loot':
      return doLoot(state, dice)
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
    case 'creation.training':
      return onCreation(state, (c) => ({
        ...c,
        training: Math.max(0, Math.min(MAX_TRAINING, action.points)),
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
      return { ...state, screen: 'beat', villageNote: null }

    case 'creation.begin':
      return state.creation === null
        ? state
        : {
            ...state,
            creation: null,
            screen: 'beat',
            sheet: finishCreation(state.creation),
            // R03's gold, in the silver prices are compared at.
            silver: toSilver({ gp: finishCreation(state.creation).gold }),
          }
  }
}
