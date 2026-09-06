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
  attackStrength,
  behaviours,
  buy,
  d6,
  endsFight,
  escape,
  finalBlow,
  fromSilver,
  importJson,
  luckCheck,
  morale,
  nightsRest,
  placeRunning,
  resolveRound,
  skillCheck,
  spendTechnique,
  stayTheNight,
  templeVisit,
  toSilver,
  treasureBand,
  unexpectedEvent,
} from '@martial-havoc/engine'
import type { DiceSource } from '@martial-havoc/engine'
import {
  INCENSE_ID,
  effectFor,
  market,
  optionById,
  optionsForArea,
  rollTreasure,
  rollUnexpectedEvent,
  t,
  treasureFoeById,
  unexpectedEventLineFor,
  villagePlaces,
} from '@martial-havoc/content'
import type { MenuOption, Opponent } from '@martial-havoc/content'
import { queued } from '../dice/random'
import { fill } from '../lib/fill'
import { newRecord } from './record'
import { fromCampaign } from './campaign'
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

/** R26 read off the current numbers. */
const fightEnd = (state: RecordState, combat: Combat) =>
  endsFight({
    masterEndurance: state.sheet.endurance,
    opponentEndurance: combat.foeEndurance,
    finalBlowLanded: combat.blow?.landed === true,
    unexpectedEvent: combat.event !== null,
  })

// ---------------------------------------------------------------- the beat

const doSkillCheck = (state: RecordState, option: MenuOption, dice: DiceSource): RecordState => {
  const { source, manual } = masterDice(state, dice)
  const proficiency =
    state.sheet.proficiencies.find((p) => p.name === option.proficiency) ?? null
  const outcome = skillCheck({ skill: state.sheet.skill, proficiency: proficiency?.value })(source)
  return afterMasterRoll(
    {
      ...state,
      result: {
        kind: 'check',
        check: 'skill',
        roll: outcome.roll,
        threshold: outcome.threshold,
        success: outcome.success,
        doubleSix: outcome.doubleSix,
        proficiency,
        luckAfter: null,
      },
    },
    manual,
  )
}

const doLuckCheck = (state: RecordState, dice: DiceSource): RecordState => {
  const { source, manual } = masterDice(state, dice)
  const { outcome, luck } = luckCheck(state.sheet.luck)(source)
  return afterMasterRoll(
    withSheet(
      {
        ...state,
        result: {
          kind: 'check',
          check: 'luck',
          roll: outcome.roll,
          threshold: outcome.threshold,
          success: outcome.success,
          doubleSix: outcome.doubleSix,
          proficiency: null,
          luckAfter: luck,
        },
      },
      { luck },
    ),
    manual,
  )
}

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

const doTake = (state: RecordState, key: string): RecordState => {
  if (state.held.includes(key)) return state
  const held = [...state.held, key]
  return addDeed(
    { ...state, held, result: { kind: 'take', treasure: key, held: held.length } },
    fill(t('ui.deed.took'), { name: t(`ui.treasure.${key}`) }),
  )
}

const startFight = (state: RecordState, foe: Opponent): RecordState => ({
  ...state,
  screen: 'combat',
  result: null,
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
    treasureRolled: false,
    over: { ended: false },
  },
})

const doOption = (state: RecordState, option: MenuOption, dice: DiceSource): RecordState => {
  switch (option.action) {
    case 'skill-check':
      return doSkillCheck(state, option, dice)
    case 'luck-check':
      return doLuckCheck(state, dice)
    case 'rest':
      return doRest(state)
    case 'go':
      return { ...state, area: Number(option.target), result: null }
    case 'fight': {
      const foe = treasureFoeById(option.target ?? '')
      return foe === undefined ? state : startFight(state, foe)
    }
    case 'take':
      return doTake(state, option.target ?? '')
    case 'leave-cave':
      return { ...state, screen: 'region', result: null }
  }
}

/** The primary roll button on the beat: the area's first check. */
const firstCheck = (state: RecordState): MenuOption | undefined =>
  optionsForArea(state.area).find((o) => o.action === 'skill-check' || o.action === 'luck-check')

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

/** The R78 roll after a victory, offered once and declinable (I-30b). */
const doTreasure = (state: RecordState, dice: DiceSource): RecordState => {
  const c = state.combat
  const foe = c === null ? undefined : treasureFoeById(c.foeId)
  if (c === null || foe === undefined || c.foeEndurance > 0 || c.treasureRolled) return state
  const face = d6(dice)
  const band = treasureBand(foe.endurance)
  const text = rollTreasure(band)(face)?.text ?? ''
  return withCombat(
    { ...state, result: { kind: 'treasure', face, band, text } },
    { treasureRolled: true },
  )
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
  const back: RecordState = { ...state, screen: 'beat', combat: null }
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
    case 'option': {
      const option = optionById(action.id)
      return option === undefined || option.area !== state.area ? state : doOption(state, option, dice)
    }
    case 'roll': {
      const option = firstCheck(state)
      return option === undefined ? state : doOption(state, option, dice)
    }
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
    case 'combat.treasure':
      return doTreasure(state, dice)
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
