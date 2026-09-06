/**
 * The adventure module, unit by unit, against a small synthetic
 * adventure rather than The 5 Treasures.
 *
 * That is deliberate. The point of the format is that the engine names
 * no adventure, so the unit tests prove the mechanics on a two-room cave
 * of their own making; `playthrough.test.ts` then proves the real cave
 * is finishable. If a test here had to know about the Junior King, the
 * format would have a leak.
 */
import { describe, expect, it } from 'vitest'
import type {
  AdventureAct,
  AdventureArea,
  AdventureEncounter,
  AdventureLoot,
  AdventureTables,
  Band,
  Opponent,
} from '@martial-havoc/content'
import { fromSequence } from '../dice/sources'
import {
  SUPPORTED_FORMAT_VERSIONS,
  UnsupportedAdventure,
  beginAdventure,
  flag,
  toggleFlag,
  withDefeated,
  withKey,
} from './state'
import { EVENT_KINDS, bringsEncounter, eventFor, rollEvent } from './event'
import { canEnter, enterArea, exitsFrom } from './graph'
import { available, encounterFor, encounterIn, isAbsent } from './encounter'
import { effectFor, hintFor, learnFrom, revealHint } from './hints'
import { dropFor, lootFrom, takeAreaTreasure, takeDrop } from './loot'
import { actFor, ending, isEnded } from './acts'
import { attackRescue, rescue, resolveEncounter, step, takeHere } from './run'

// ------------------------------------------------------------ the fixture

const foe = (id: string, name: string): Opponent => ({
  id,
  cite: 'test',
  name,
  description: 'a test opponent',
  skill: 5,
  endurance: 5,
  attack: 1,
  proficiencies: [],
  martialArtsValue: null,
  page: 'test',
  notes: '',
})

const area = (
  id: string,
  n: number,
  extra: Partial<AdventureArea> = {},
): AdventureArea => ({
  id,
  cite: 'test',
  adventure: 'adventure.test',
  area: n,
  name: `Area ${String(n)}`,
  description: 'a test area',
  hint: `hint ${String(n)}`,
  line: `line ${String(n)}`,
  exits: [],
  gate: null,
  treasures: [],
  rescue: null,
  ...extra,
})

const encounter = (
  id: string,
  n: number,
  extra: Partial<AdventureEncounter> = {},
): AdventureEncounter => ({
  id,
  cite: 'test',
  adventure: 'adventure.test',
  area: n,
  faces: [],
  foes: [],
  count: 'one',
  empty: false,
  ...extra,
})

const loot = (id: string, f: string, extra: Partial<AdventureLoot> = {}): AdventureLoot => ({
  id,
  cite: 'test',
  adventure: 'adventure.test',
  foe: f,
  faces: [],
  item: 'a thing',
  treasure: null,
  key: null,
  hint: false,
  once: false,
  ...extra,
})

const act = (n: number, extra: Partial<AdventureAct> = {}): AdventureAct => ({
  id: `act.test.${String(n)}`,
  cite: 'test',
  adventure: 'adventure.test',
  act: n,
  name: `act ${String(n)}`,
  condition: 'start',
  threshold: null,
  line: `act line ${String(n)}`,
  ending: false,
  ...extra,
})

const events: readonly Band[] = [
  { id: 'e.1', cite: 'test', table: 'test', dice: '1d6', totals: [1], text: 'Ambush!' },
  { id: 'e.2', cite: 'test', table: 'test', dice: '1d6', totals: [2, 3], text: 'Encounter' },
  { id: 'e.3', cite: 'test', table: 'test', dice: '1d6', totals: [4, 5], text: 'Safe' },
  { id: 'e.4', cite: 'test', table: 'test', dice: '1d6', totals: [6], text: 'Hint' },
]

/** Two rooms, a locked door, a guard with the key, and a prize behind it. */
const tables = (over: Partial<AdventureTables> = {}): AdventureTables => ({
  meta: {
    id: 'adventure.test',
    cite: 'test',
    version: '1',
    title: 'A test',
    premise: 'a premise',
    startArea: 'area.test.hall',
    credits: 'test',
  },
  events,
  areas: [
    area('area.test.hall', 1, { exits: ['area.test.vault'] }),
    area('area.test.vault', 2, {
      exits: ['area.test.hall'],
      gate: { key: 'key.test', text: 'an iron door' },
      treasures: ['treasure.test.crown'],
      rescue: { foe: 'foe.test.captive', text: 'a captive', dishonorOnAttack: true },
    }),
  ],
  encounters: [
    encounter('enc.hall.1', 1, { faces: [1, 2, 3], foes: ['foe.test.guard'] }),
    encounter('enc.hall.2', 1, { faces: [4, 5, 6], foes: ['foe.test.rat'], count: 'oracle' }),
    encounter('enc.vault.1', 2, { faces: [1, 2, 3], foes: ['foe.test.guard'] }),
    encounter('enc.vault.2', 2, { faces: [4, 5, 6], empty: true, count: 'none' }),
  ],
  loot: [
    loot('loot.guard.1', 'foe.test.guard', { item: "the vault's key", key: 'key.test' }),
    loot('loot.rat.1', 'foe.test.rat', { faces: [1, 2, 3], item: 'junk' }),
    loot('loot.rat.2', 'foe.test.rat', { faces: [4, 5], item: 'a knife' }),
    loot('loot.rat.3', 'foe.test.rat', { faces: [6], item: '[icon]', hint: true }),
  ],
  treasures: [
    {
      id: 'treasure.test.crown',
      cite: 'test',
      adventure: 'adventure.test',
      name: 'A crown',
      effect: 'it is heavy',
      source: 'area',
      sourceRef: 'area.test.vault',
      knownFrom: ['foe.test.guard'],
    },
  ],
  flags: [
    {
      id: 'flag.test.dark',
      cite: 'test',
      adventure: 'adventure.test',
      flag: 'dark',
      initial: false,
      text: 'the lamps are out',
    },
  ],
  absences: [
    {
      id: 'absence.test.rat',
      cite: 'test',
      adventure: 'adventure.test',
      area: 1,
      foe: 'foe.test.rat',
      flag: 'dark',
      whenTrue: true,
      text: 'rats hide in the dark',
    },
  ],
  acts: [
    act(1),
    act(2, { condition: 'enter', threshold: 'area.test.vault' }),
    act(3, { condition: 'treasures', threshold: 1, ending: true }),
  ],
  foes: [foe('foe.test.guard', 'Guard'), foe('foe.test.rat', 'Rat'), foe('foe.test.captive', 'Captive')],
  ...over,
})

// ------------------------------------------------------------------ state

describe('beginAdventure', () => {
  it('stands the Master in the start area with every flag at its initial', () => {
    const state = beginAdventure(tables())
    expect(state.area).toBe('area.test.hall')
    expect(state.visited).toEqual(['area.test.hall'])
    expect(state.flags).toEqual({ dark: false })
    expect(state.treasures).toEqual([])
    expect(state.dishonor).toBe(0)
  })

  it('refuses a format version it does not read', () => {
    const future = tables()
    const bad = { ...future, meta: { ...future.meta, version: '99' } }
    expect(() => beginAdventure(bad)).toThrow(UnsupportedAdventure)
    expect(SUPPORTED_FORMAT_VERSIONS).toContain('1')
  })

  it('never mutates: every update returns a new state', () => {
    const state = beginAdventure(tables())
    const next = withKey(state, 'key.test')
    expect(state.keys).toEqual([])
    expect(next.keys).toEqual(['key.test'])
    // Idempotent: two attendants carrying the same key is one key (I-07).
    expect(withKey(next, 'key.test').keys).toEqual(['key.test'])
  })

  it('reads an undeclared flag as false and toggles a declared one', () => {
    const state = beginAdventure(tables())
    expect(flag(state, 'never-declared')).toBe(false)
    expect(flag(toggleFlag(state, 'dark'), 'dark')).toBe(true)
  })
})

// ------------------------------------------------------------------ event

describe('the event table', () => {
  it('names the four kinds by the row order, not by the printed words', () => {
    expect(EVENT_KINDS).toEqual(['ambush', 'encounter', 'safe', 'hint'])
    expect(eventFor(events, 1).kind).toBe('ambush')
    expect(eventFor(events, 3).kind).toBe('encounter')
    expect(eventFor(events, 4).kind).toBe('safe')
    expect(eventFor(events, 6).kind).toBe('hint')
  })

  it('keeps the printed text for the screen', () => {
    expect(eventFor(events, 1).text).toBe('Ambush!')
  })

  it('rolls one die and reads it', () => {
    expect(rollEvent(events)(fromSequence([6])).kind).toBe('hint')
  })

  it('brings the area encounter on 1, 2 and 3 only', () => {
    expect([1, 2, 3].map((f) => bringsEncounter(eventFor(events, f).kind))).toEqual([
      true,
      true,
      true,
    ])
    expect([4, 5, 6].map((f) => bringsEncounter(eventFor(events, f).kind))).toEqual([
      false,
      false,
      false,
    ])
  })

  it('reads a face no row covers as safe rather than throwing', () => {
    expect(eventFor([], 3).kind).toBe('safe')
  })
})

// ------------------------------------------------------------------ graph

describe('the area graph and its locks', () => {
  const t = tables()

  it('lists the exits an area draws', () => {
    expect(exitsFrom(t, 'area.test.hall').map((a) => a.id)).toEqual(['area.test.vault'])
  })

  it('refuses an unknown area, and one no passage reaches', () => {
    const state = beginAdventure(t)
    expect(canEnter(t, state, 'area.test.nowhere')).toEqual({
      ok: false,
      reason: 'unknown-area',
    })
    const inVault = { ...state, area: 'area.test.vault' }
    expect(canEnter(t, inVault, 'area.test.nowhere').ok).toBe(false)
  })

  it('refuses a gate whose key the Master is not carrying, and names it', () => {
    const refused = canEnter(t, beginAdventure(t), 'area.test.vault')
    expect(refused).toEqual({ ok: false, reason: 'locked', key: 'key.test', text: 'an iron door' })
  })

  it('opens the gate once the key is held, and leaves the state alone when refused', () => {
    const state = beginAdventure(t)
    expect(enterArea(t, state, 'area.test.vault').state).toBe(state)
    const opened = enterArea(t, withKey(state, 'key.test'), 'area.test.vault')
    expect(opened.passage.ok).toBe(true)
    expect(opened.state.area).toBe('area.test.vault')
    expect(opened.state.visited).toEqual(['area.test.hall', 'area.test.vault'])
  })
})

// -------------------------------------------------------------- encounter

describe('the encounter tables', () => {
  const t = tables()

  it('reads the row the face lands on', () => {
    const state = beginAdventure(t)
    expect(encounterFor(t, state, 1, 2).foes.map((f) => f.id)).toEqual(['foe.test.guard'])
    expect(encounterFor(t, state, 1, 5).count).toBe('oracle')
  })

  it('meets nothing on an Empty row, so the event degrades (I-36)', () => {
    const state = beginAdventure(t)
    const empty = encounterFor(t, state, 2, 5)
    expect(empty.empty).toBe(true)
    expect(empty.foes).toEqual([])
  })

  it('removes a defeated named foe from every table (I-33b, I-33c)', () => {
    const beaten = withDefeated(beginAdventure(t), 'foe.test.guard')
    expect(available(t, beaten, 1, 'foe.test.guard')).toBe(false)
    expect(encounterFor(t, beaten, 1, 2).empty).toBe(true)
    expect(encounterFor(t, beaten, 2, 1).empty).toBe(true)
  })

  it('makes a foe absent while its flag holds (I-45)', () => {
    const dark = toggleFlag(beginAdventure(t), 'dark')
    expect(isAbsent(t, dark, 1, 'foe.test.rat')).toBe(true)
    expect(isAbsent(t, dark, 2, 'foe.test.rat')).toBe(false)
    expect(encounterFor(t, dark, 1, 5).empty).toBe(true)
  })

  it('treats an area whose every row is dice-less as fixed, drawing no die (I-34)', () => {
    const fixed = tables({
      encounters: [encounter('enc.fixed', 1, { faces: [], foes: ['foe.test.rat'] })],
    })
    const state = beginAdventure(fixed)
    // An empty sequence proves no die was drawn.
    const met = encounterIn(fixed, state, 1)(fromSequence([]))
    expect(met.foes.map((f) => f.id)).toEqual(['foe.test.rat'])
    expect(met.face).toBeUndefined()
  })

  it('meets nothing in an area with no rows at all', () => {
    const bare = tables({ encounters: [] })
    expect(encounterFor(bare, beginAdventure(bare), 1, 3).empty).toBe(true)
  })
})

// ------------------------------------------------------------------ hints

describe('the spoiler gates (I-60)', () => {
  const t = tables()

  it('hides an area hint until it is revealed', () => {
    const state = beginAdventure(t)
    expect(hintFor(t, state, 'area.test.hall')).toBeNull()
    expect(hintFor(t, revealHint(state, 'area.test.hall'), 'area.test.hall')).toBe('hint 1')
  })

  it('hides a treasure effect until the treasure is held', () => {
    const state = beginAdventure(t)
    expect(effectFor(t, state, 'treasure.test.crown')).toBeNull()
    const held = takeAreaTreasure(t, { ...state, area: 'area.test.vault' }, 'area.test.vault', 'treasure.test.crown')
    expect(effectFor(t, held, 'treasure.test.crown')).toBe('it is heavy')
  })

  it('opens an effect from anything the treasure names as a source (I-38b, I-41)', () => {
    const state = beginAdventure(t)
    const taught = learnFrom(t, state, 'foe.test.guard')
    expect(effectFor(t, taught, 'treasure.test.crown')).toBe('it is heavy')
    // Still not held: knowing how it works is not having it.
    expect(taught.treasures).toEqual([])
    // A source that teaches nothing leaves the state alone.
    expect(learnFrom(t, state, 'foe.test.rat').effects).toEqual([])
  })
})

// ------------------------------------------------------------------- loot

describe('the loot lines', () => {
  const t = tables()

  it('draws no die where the printed line names a single drop', () => {
    const drop = lootFrom(t, 'foe.test.guard')(fromSequence([]))
    expect(drop.row?.key).toBe('key.test')
    expect(drop.face).toBeUndefined()
  })

  it('reads a band where the line rolls', () => {
    expect(dropFor(t, 'foe.test.rat', 4).row?.item).toBe('a knife')
    expect(lootFrom(t, 'foe.test.rat')(fromSequence([1])).row?.item).toBe('junk')
  })

  it('drops nothing for a foe with no rows', () => {
    expect(dropFor(t, 'foe.test.captive', 3).row).toBeUndefined()
  })

  it('sorts a drop into the right list, and leaves a Hint row to the caller (I-08)', () => {
    const state = beginAdventure(t)
    expect(takeDrop(state, dropFor(t, 'foe.test.guard', 0).row).keys).toEqual(['key.test'])
    expect(takeDrop(state, dropFor(t, 'foe.test.rat', 4).row).items).toEqual(['a knife'])
    const hint = takeDrop(state, dropFor(t, 'foe.test.rat', 6).row)
    expect(hint.items).toEqual([])
    expect(hint.hints).toEqual([])
    expect(takeDrop(state, undefined)).toBe(state)
  })

  it('only lets an area treasure be taken in the area that holds it (I-38)', () => {
    const state = beginAdventure(t)
    expect(takeAreaTreasure(t, state, 'area.test.hall', 'treasure.test.crown').treasures).toEqual([])
    expect(
      takeAreaTreasure(t, state, 'area.test.vault', 'treasure.test.crown').treasures,
    ).toEqual(['treasure.test.crown'])
  })
})

// ------------------------------------------------------------------- acts

describe('acts and the ending', () => {
  const t = tables()

  it('is in the highest satisfied act', () => {
    const state = beginAdventure(t)
    expect(actFor(t, state)?.act).toBe(1)
    const entered = { ...state, visited: [...state.visited, 'area.test.vault'] }
    expect(actFor(t, entered)?.act).toBe(2)
  })

  it('ends when the ending act is satisfied, and not before', () => {
    const state = beginAdventure(t)
    expect(isEnded(t, state)).toBe(false)
    expect(ending(t, state)).toBeNull()
    const held = { ...state, treasures: ['treasure.test.crown'] }
    expect(isEnded(t, held)).toBe(true)
    expect(ending(t, held)?.line).toBe('act line 3')
    expect(ending(t, held)?.treasures).toEqual(['treasure.test.crown'])
  })

  it('never ends an adventure that declares no ending', () => {
    const endless = tables({ acts: [act(1)] })
    expect(isEnded(endless, beginAdventure(endless))).toBe(false)
  })
})

// ------------------------------------------------------------------- turn

describe('one turn', () => {
  const t = tables()

  it('draws no dice at all when the door is locked', () => {
    const turn = step(t, beginAdventure(t), 'area.test.vault', fromSequence([]))
    expect(turn.passage).toMatchObject({ ok: false, reason: 'locked' })
    expect(turn.event).toBeUndefined()
    expect(turn.state.area).toBe('area.test.hall')
  })

  it('rolls the event then the encounter, in that order', () => {
    const state = withKey(beginAdventure(t), 'key.test')
    // 2 = Encounter, then 1 lands on the vault's guard row.
    const turn = step(t, state, 'area.test.vault', fromSequence([2, 1]))
    expect(turn.event?.kind).toBe('encounter')
    expect(turn.encounter?.foes.map((f) => f.id)).toEqual(['foe.test.guard'])
    expect(turn.area?.id).toBe('area.test.vault')
  })

  it('rolls no encounter die on a safe exploration', () => {
    const state = withKey(beginAdventure(t), 'key.test')
    const turn = step(t, state, 'area.test.vault', fromSequence([4]))
    expect(turn.event?.kind).toBe('safe')
    expect(turn.encounter).toBeUndefined()
  })

  it('reveals the area hint on a Hint event (I-06b)', () => {
    const state = withKey(beginAdventure(t), 'key.test')
    const turn = step(t, state, 'area.test.vault', fromSequence([6]))
    expect(turn.hintRevealed).toBe(true)
    expect(hintFor(t, turn.state, 'area.test.vault')).toBe('hint 2')
  })

  it('records the named foes the caller defeated', () => {
    const state = resolveEncounter(beginAdventure(t), ['foe.test.guard'])
    expect(state.defeated).toEqual(['foe.test.guard'])
    expect(resolveEncounter(state, ['foe.test.guard']).defeated).toEqual(['foe.test.guard'])
  })

  it('frees a rescue, or scores Dishonor for attacking one (I-39)', () => {
    const inVault = { ...beginAdventure(t), area: 'area.test.vault' }
    expect(rescue(t, inVault).rescued).toEqual(['foe.test.captive'])
    expect(attackRescue(t, inVault).dishonor).toBe(1)
    // An area with no rescue is a no-op either way.
    const inHall = beginAdventure(t)
    expect(rescue(t, inHall)).toBe(inHall)
    expect(attackRescue(t, inHall)).toBe(inHall)
  })

  it('takes a treasure lying where the Master stands', () => {
    const inVault = { ...beginAdventure(t), area: 'area.test.vault' }
    expect(takeHere(t, inVault, 'treasure.test.crown').treasures).toEqual(['treasure.test.crown'])
  })
})
