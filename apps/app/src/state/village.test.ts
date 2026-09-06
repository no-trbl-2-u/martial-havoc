/**
 * The village, through the reducer, on fixed dice.
 *
 * The engine's own village tests prove the rules; these prove the
 * record moves the way the rules say — money leaves the purse, LUCK
 * comes back only where R58 allows it, and a night at the inn resets
 * the day the shrine counts (I-58).
 */
import { describe, expect, it } from 'vitest'
import { fromSequence } from '@martial-havoc/engine'
import { INCENSE_ID } from '@martial-havoc/content'
import { reduce } from './reduce'
import { newRecord } from './record'
import type { RecordState } from './types'

/**
 * A record at the village.
 *
 * `newRecord` throws a whole region (seven points and their links), so
 * it wants more dice than a fixture wants to write out. A constant
 * source is enough: nothing here depends on what the region looks
 * like, and every roll a test *does* care about is scripted explicitly
 * on the source passed to `reduce`.
 */
const always = (face: 1 | 2 | 3 | 4 | 5 | 6) => ({ next: () => face })

const at = (over: Partial<RecordState> = {}): RecordState => ({
  ...newRecord(always(4)),
  creation: null,
  screen: 'village',
  silver: 100,
  ...over,
})

const dice = () => fromSequence([2, 3, 4, 5, 6, 1, 2, 3])

describe('the stall row (MH p.52-55)', () => {
  it('takes the printed price out of the purse', () => {
    const before = at()
    const after = reduce(before, { type: 'village.buy', id: INCENSE_ID }, dice())
    expect(after.silver).toBe(before.silver - 5)
    expect(after.villageNote?.text).toContain('Bought')
  })

  it('remembers incense, because R58 asks whether the Master has any', () => {
    const after = reduce(at(), { type: 'village.buy', id: INCENSE_ID }, dice())
    expect(after.incense).toBe(true)
  })

  it('reports a purchase it cannot afford and takes nothing', () => {
    const before = at({ silver: 1 })
    const after = reduce(before, { type: 'village.buy', id: INCENSE_ID }, dice())
    expect(after.silver).toBe(1)
    expect(after.villageNote?.text).toContain('Not enough')
  })
})

describe('the shrine (MH p.47, R58; I-58)', () => {
  it('does not roll without incense', () => {
    const after = reduce(at({ incense: false }), { type: 'village.temple' }, dice())
    expect(after.villageNote?.roll).toBeNull()
    expect(after.villageNote?.text).toContain('No incense')
  })

  it('recovers 1 LUCK on a passed check, and burns the stick', () => {
    const before = at({ incense: true })
    const wounded = { ...before, sheet: { ...before.sheet, luck: before.sheet.luckInitial - 2 } }
    // 2 + 3 = 5, under San Te's SKILL.
    const after = reduce(wounded, { type: 'village.temple' }, fromSequence([2, 3]))
    expect(after.sheet.luck).toBe(wounded.sheet.luck + 1)
    expect(after.incense).toBe(false)
    expect(after.templeVisitedToday).toBe(true)
  })

  it('will not take LUCK past where the Master started (R05)', () => {
    const before = at({ incense: true })
    const after = reduce(before, { type: 'village.temple' }, fromSequence([2, 3]))
    expect(after.sheet.luck).toBe(before.sheet.luckInitial)
  })

  it('does not roll a second time the same day (I-58)', () => {
    const after = reduce(
      at({ incense: true, templeVisitedToday: true }),
      { type: 'village.temple' },
      dice(),
    )
    expect(after.villageNote?.roll).toBeNull()
    expect(after.villageNote?.text).toContain('heard you today')
  })
})

describe('the inn (MH p.31, R40; spec.md sealed)', () => {
  it('charges the room, restores SKILL and gives ENDURANCE +4', () => {
    const before = at()
    const wounded = {
      ...before,
      sheet: { ...before.sheet, skill: 3, endurance: before.sheet.enduranceInitial - 9 },
    }
    const after = reduce(wounded, { type: 'village.inn' }, dice())
    expect(after.sheet.skill).toBe(before.sheet.skillInitial)
    expect(after.sheet.endurance).toBe(wounded.sheet.endurance + 4)
    expect(after.silver).toBe(before.silver - 4)
  })

  it('changes nothing when the room cannot be paid for', () => {
    const before = at({ silver: 1 })
    const after = reduce(before, { type: 'village.inn' }, dice())
    expect(after.sheet.endurance).toBe(before.sheet.endurance)
    expect(after.silver).toBe(1)
  })

  it('a night passes, so the shrine will listen again (I-58)', () => {
    const after = reduce(at({ templeVisitedToday: true }), { type: 'village.inn' }, dice())
    expect(after.templeVisitedToday).toBe(false)
  })
})

describe('the trail', () => {
  it('leads back to the beat', () => {
    expect(reduce(at(), { type: 'village.trail' }, dice()).screen).toBe('beat')
  })
})
