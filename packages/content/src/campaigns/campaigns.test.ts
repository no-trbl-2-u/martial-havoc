/** The adventure hooks, at the d66 addresses the book prints. */
import { describe, expect, it } from 'vitest'
import { adventureHooks, rollAdventureHook } from './index'

describe('adventure hooks (MH p.36-39, R50)', () => {
  it('resolves every one of the 36 d66 addresses', () => {
    expect(adventureHooks).toHaveLength(36)
    for (const tens of [1, 2, 3, 4, 5, 6])
      for (const ones of [1, 2, 3, 4, 5, 6]) expect(rollAdventureHook(tens, ones)).toBeDefined()
  })

  it('reads the address as tens die then ones die', () => {
    expect(rollAdventureHook(1, 1)?.text).toContain('An enemy school has killed your master')
    expect(rollAdventureHook(3, 2)?.text).toContain('you must kill the emperor')
    expect(rollAdventureHook(6, 6)?.text).toContain('magical influence of a criminal')
  })
})

/**
 * The prototype slice (5T a1, a2; design/prototype): the menu must only
 * point at things that exist, and every area of the slice must offer
 * something to do - the empty state is for later phases, not for a
 * dropped record.
 */
import {
  beatForArea,
  optionsForArea,
  prototypeBeats,
  prototypeOptions,
  treasureFoeById,
  treasureFoes,
} from './index'

describe('The 5 Treasures: foes', () => {
  it('prints nine stat blocks, each with SKILL, ENDURANCE, ATTACK and two special skills', () => {
    expect(treasureFoes).toHaveLength(9)
    for (const foe of treasureFoes) {
      expect(foe.skill).toBeGreaterThan(0)
      expect(foe.endurance).toBeGreaterThan(0)
      expect(typeof foe.attack).toBe('number')
      expect(foe.proficiencies).toHaveLength(2)
      expect(foe.page).toBe('5T a2')
    }
  })

  it('the Dexterous Ghost is 7 / 8 / 1 with immaterial charge (4) the higher skill', () => {
    const ghost = treasureFoeById('foe.dexterous-ghost')
    expect(ghost).toMatchObject({ skill: 7, endurance: 8, attack: 1 })
    expect(Math.max(...(ghost?.proficiencies.map((p) => p.value) ?? []))).toBe(4)
  })
})

describe('The 5 Treasures: prototype slice', () => {
  it('has one beat per area and no area twice', () => {
    const areas = prototypeBeats.map((b) => b.area)
    expect(new Set(areas).size).toBe(areas.length)
    expect(beatForArea(3)?.name).toBe('Attendants room')
    expect(beatForArea(1)).toBeUndefined()
  })

  it('offers at least one option in every area of the slice', () => {
    for (const beat of prototypeBeats) expect(optionsForArea(beat.area).length).toBeGreaterThan(0)
  })

  it('every option belongs to an area the slice has', () => {
    const stray = prototypeOptions.filter((o) => beatForArea(o.area) === undefined)
    expect(stray.map((o) => o.id)).toEqual([])
  })

  it('every go leads to an area the slice has, every fight to a printed foe', () => {
    for (const o of prototypeOptions) {
      if (o.action === 'go') expect(beatForArea(Number(o.target)), o.id).toBeDefined()
      if (o.action === 'fight') expect(treasureFoeById(o.target ?? ''), o.id).toBeDefined()
      if (o.action === 'take' || o.action === 'go' || o.action === 'fight') {
        expect(o.target, o.id).toBeDefined()
      }
    }
  })

  it('a skill check names a Proficiency or none, never a number', () => {
    for (const o of prototypeOptions.filter((x) => x.action === 'skill-check')) {
      if (o.proficiency !== undefined) expect(Number.isNaN(Number(o.proficiency))).toBe(true)
    }
  })
})
