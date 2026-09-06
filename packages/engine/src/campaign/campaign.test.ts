/**
 * The record's own behaviour: what it holds, and the one-way rules.
 */
import { describe, expect, it } from 'vitest'
import { beginAdventure } from '../adventure/state'
import type { AdventureTables } from '@martial-havoc/content'
import {
  RECORD_READINGS,
  RECORD_VERSION,
  adventureIn,
  canContinue,
  freshStart,
  newCampaign,
  withAdventure,
  withDeath,
  withDeed,
  withMaster,
  withOverride,
  withPassage,
} from './record'
import type { RecordedMaster } from './record'

const master: RecordedMaster = {
  name: 'San Te',
  skill: 9,
  skillInitial: 9,
  endurance: 20,
  enduranceInitial: 20,
  luck: 7,
  gold: 12,
  dishonor: 0,
  proficiencies: [{ name: 'Unarmed', value: 3 }],
  techniques: ['technique.iron-head'],
  overspent: false,
}

/** The smallest thing that is an adventure, so the record can hold one. */
const tables: AdventureTables = {
  meta: {
    id: 'adventure.test',
    cite: 'test',
    version: '1',
    title: 'A test',
    premise: 'a premise',
    startArea: 'area.test.one',
    credits: 'test',
  },
  events: [],
  areas: [],
  encounters: [],
  loot: [],
  treasures: [],
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
  absences: [],
  acts: [],
  foes: [],
}

describe('a new campaign', () => {
  it('is written at this build version, with this build readings', () => {
    const record = newCampaign(master)
    expect(record.version).toBe(RECORD_VERSION)
    expect(record.readings).toEqual(RECORD_READINGS)
    expect(record.readings.length).toBeGreaterThan(0)
  })

  it('starts empty and alive', () => {
    const record = newCampaign(master)
    expect(record.dead).toBe(false)
    expect(canContinue(record)).toBe(true)
    expect(record.adventures).toEqual({})
    expect(record.deeds).toEqual([])
    expect(record.passages).toEqual([])
    expect(record.overrides).toBe(0)
  })

  it('carries the overspend mark rather than refusing the Master', () => {
    // spec.md: creation pools are advisory - flag, never refuse.
    const over = newCampaign({ ...master, overspent: true })
    expect(over.master.overspent).toBe(true)
    expect(canContinue(over)).toBe(true)
  })
})

describe('the record never mutates', () => {
  it('returns a new value from every update', () => {
    const record = newCampaign(master)
    const after = withOverride(withPassage(withDeed(record, { adventure: null, text: 'a deed' }), 'a line'))
    expect(record.deeds).toEqual([])
    expect(record.passages).toEqual([])
    expect(record.overrides).toBe(0)
    expect(after.deeds).toHaveLength(1)
    expect(after.passages).toEqual(['a line'])
    expect(after.overrides).toBe(1)
  })

  it('keeps the Master swappable without touching the ledger', () => {
    const record = withDeed(newCampaign(master), { adventure: null, text: 'a deed' })
    const hurt = withMaster(record, { ...master, endurance: 4 })
    expect(hurt.master.endurance).toBe(4)
    expect(hurt.master.enduranceInitial).toBe(20)
    expect(hurt.deeds).toEqual(record.deeds)
  })
})

describe('the deeds ledger and the passages', () => {
  it('keeps deeds in the order they happened, with the scene they happened in', () => {
    const record = withDeed(
      withDeed(newCampaign(master), { adventure: null, text: 'left the village' }),
      { adventure: 'adventure.the-5-treasures', text: 'beat the Junior King' },
    )
    expect(record.deeds.map((d) => d.text)).toEqual([
      'left the village',
      'beat the Junior King',
    ])
    expect(record.deeds[1]?.adventure).toBe('adventure.the-5-treasures')
  })

  it('does not keep a blank passage', () => {
    const record = newCampaign(master)
    expect(withPassage(record, '   ').passages).toEqual([])
    expect(withPassage(record, '').passages).toEqual([])
    expect(withPassage(record, ' something ').passages).toEqual([' something '])
  })
})

describe('the override count (spec.md, Horizon)', () => {
  it('counts up and never resets', () => {
    const thrice = withOverride(withOverride(withOverride(newCampaign(master))))
    expect(thrice.overrides).toBe(3)
  })
})

describe('per-adventure state', () => {
  it('stores an adventure under its own id and reads it back', () => {
    const state = beginAdventure(tables)
    const record = withAdventure(newCampaign(master), state)
    expect(adventureIn(record, 'adventure.test')).toEqual(state)
    expect(adventureIn(record, 'adventure.never-visited')).toBeUndefined()
  })

  it('keeps one entry per adventure, replacing on the next visit', () => {
    const first = beginAdventure(tables)
    const later = { ...first, flags: { dark: true } }
    const record = withAdventure(withAdventure(newCampaign(master), first), later)
    expect(Object.keys(record.adventures)).toEqual(['adventure.test'])
    expect(adventureIn(record, 'adventure.test')?.flags['dark']).toBe(true)
  })

  it('keeps adventures apart', () => {
    const cave = beginAdventure(tables)
    const other = beginAdventure({ ...tables, meta: { ...tables.meta, id: 'adventure.other' } })
    const record = withAdventure(withAdventure(newCampaign(master), cave), other)
    expect(Object.keys(record.adventures).sort()).toEqual(['adventure.other', 'adventure.test'])
  })
})

describe('the world dies with the Master (bearings)', () => {
  it('stops the record being continued, and is one-way', () => {
    const alive = withDeed(newCampaign(master), { adventure: null, text: 'a deed' })
    const dead = withDeath(alive)
    expect(canContinue(alive)).toBe(true)
    expect(canContinue(dead)).toBe(false)
    // Idempotent: dying twice is dying once.
    expect(withDeath(dead)).toBe(dead)
  })

  it('leaves a dead record readable - the deeds are the point of keeping them', () => {
    const dead = withDeath(withDeed(newCampaign(master), { adventure: null, text: 'a deed' }))
    expect(dead.deeds).toHaveLength(1)
    expect(dead.master.name).toBe('San Te')
  })

  it('inherits nothing into a fresh start', () => {
    const dead = withDeath(
      withOverride(withPassage(withDeed(newCampaign(master), { adventure: null, text: 'd' }), 'p')),
    )
    const again = freshStart({ ...master, name: 'Another' })
    expect(again.dead).toBe(false)
    expect(again.deeds).toEqual([])
    expect(again.passages).toEqual([])
    expect(again.overrides).toBe(0)
    expect(again.adventures).toEqual({})
    expect(again.master.name).toBe('Another')
    // The dead record is untouched by starting again.
    expect(dead.deeds).toHaveLength(1)
  })
})
