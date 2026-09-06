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
  d6,
  endsFight,
  escape,
  finalBlow,
  luckCheck,
  morale,
  nightsRest,
  resolveRound,
  skillCheck,
  spendTechnique,
  treasureBand,
  unexpectedEvent,
} from '@martial-havoc/engine'
import type { DiceSource } from '@martial-havoc/engine'
import {
  effectFor,
  optionById,
  optionsForArea,
  rollTreasure,
  rollUnexpectedEvent,
  t,
  treasureFoeById,
  unexpectedEventLineFor,
} from '@martial-havoc/content'
import type { MenuOption, Opponent } from '@martial-havoc/content'
import { queued } from '../dice/random'
import { fill } from '../lib/fill'
import { newRecord, withMaster } from './record'
import type { Action, Combat, RecordState, Sheet } from './types'

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
    case 'record.new':
      return newRecord(dice)
    // Creation (R83). The candidate arrives whole, gold already thrown by
    // the frame that built the list, so picking rolls nothing: the
    // numbers a player reads are the numbers they start with, and a
    // queued `?dice=` run is spent on play rather than on the choosing.
    case 'creation.pick':
      return { ...state, picked: action.candidate }
    case 'creation.start':
      return state.picked === null ? state : withMaster(state, state.picked.sheet)
  }
}
