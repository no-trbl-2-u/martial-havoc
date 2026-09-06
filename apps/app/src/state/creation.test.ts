/**
 * Making a Master (R02-R19), on fixed dice.
 *
 * The two things worth proving are the ones `spec.md` is explicit
 * about: creation follows the book's order, and it **reports rather
 * than refuses**. Everything here is a fixed sequence, so a failure
 * names a rule and never a seed.
 */
import { describe, expect, it } from 'vitest'
import { fromSequence } from '@martial-havoc/engine'
import { martialArts, presetById } from '@martial-havoc/content'
import {
  DEFAULT_NAME,
  emptyCreation,
  finishCreation,
  flagsOf,
  pool,
  resourcePool,
  rollArt,
  rollNumbers,
  rollStanding,
  skillAfterTraining,
  spentProficiency,
  takePreset,
} from './creation'

describe('the book’s order', () => {
  it('rolls standing and its gold from one source (R02, R03)', () => {
    // 1 -> the first social band; the faces after it are its gold dice.
    const c = rollStanding(emptyCreation(), fromSequence([1, 4, 4, 4, 4, 4, 4]))
    expect(c.status).not.toBeNull()
    expect(c.status?.name.length ?? 0).toBeGreaterThan(0)
    expect(c.status?.gold ?? -1).toBeGreaterThanOrEqual(0)
  })

  it('rolls SKILL 1d6+6, ENDURANCE 2d6+12, LUCK 1d6+6 in that order (R04)', () => {
    const c = rollNumbers(emptyCreation(), fromSequence([3, 5, 5, 2]))
    expect(c.skill?.current).toBe(9)
    expect(c.endurance?.current).toBe(22)
    expect(c.luck?.current).toBe(8)
  })

  it('keeps what each attribute started at (R05)', () => {
    const c = rollNumbers(emptyCreation(), fromSequence([3, 5, 5, 2]))
    expect(c.skill?.initial).toBe(9)
    expect(c.endurance?.initial).toBe(22)
  })

  it('rolls a martial art off the two-die table (R09)', () => {
    const c = rollArt(emptyCreation(), fromSequence([1, 1]))
    expect(martialArts.some((m) => m.id === c.martialArtId)).toBe(true)
  })
})

describe('training (R15-R17, D06)', () => {
  const rolled = () => rollNumbers(emptyCreation(), fromSequence([3, 5, 5, 2])) // SKILL 9

  it('costs 1 SKILL per point and gives 4 resource points', () => {
    const c = { ...rolled(), training: 2 }
    expect(skillAfterTraining(c)).toBe(7)
    expect(resourcePool(c)).toBe(8)
  })

  it('does not shrink the Proficiency pool — the pool is the rolled SKILL', () => {
    const c = { ...rolled(), training: 2 }
    // D06: R15's deduction is permanent on the sheet but does not reach
    // R10's pool.
    expect(pool(c)).toBe(9)
    expect(skillAfterTraining(c)).toBe(7)
  })
})

describe('it reports, it never refuses (spec.md)', () => {
  const rolled = () => rollNumbers(emptyCreation(), fromSequence([3, 5, 5, 2])) // SKILL 9

  it('lets a Proficiency pool be overspent, and says by how much', () => {
    const c = { ...rolled(), proficiencies: { Stamina: 12 } }
    expect(spentProficiency(c)).toBe(12)
    expect(flagsOf(c).join(' ')).toContain('overspent by 3')
  })

  it('raises no flag on a Master inside the limits', () => {
    const c = { ...rolled(), proficiencies: { Stamina: 4 } }
    expect(flagsOf(c)).toEqual([])
  })

  it('makes a playable sheet from a creation that rolled nothing', () => {
    const sheet = finishCreation(emptyCreation())
    expect(sheet.name).toBe(DEFAULT_NAME)
    expect(sheet.skill).toBeGreaterThan(0)
    expect(sheet.endurance).toBeGreaterThan(0)
    expect(sheet.luck).toBeGreaterThan(0)
  })

  it('carries the typed name, trimmed', () => {
    const sheet = finishCreation({ ...emptyCreation(), name: '  Iron Monkey  ' })
    expect(sheet.name).toBe('Iron Monkey')
  })
})

describe('the eight printed sheets (R83)', () => {
  it('loads one as printed, with its gold rolled (R03)', () => {
    const c = takePreset(emptyCreation(), 'preset.san-te', fromSequence([4, 4, 4, 4, 4, 4]))
    const printed = presetById('preset.san-te')
    expect(printed).toBeDefined()
    expect(c.name).toBe(printed?.name)
    expect(c.skill?.current).toBe(printed?.skill)
    expect(c.endurance?.current).toBe(printed?.endurance)
    expect(c.luck?.current).toBe(printed?.luck)
    expect(c.step).toBe('ready')
    expect(c.status?.gold ?? -1).toBeGreaterThanOrEqual(0)
  })

  it('leaves an unknown preset id alone rather than throwing', () => {
    const before = emptyCreation()
    expect(takePreset(before, 'preset.nobody', fromSequence([4, 4]))).toBe(before)
  })

  it('loads Yin as printed, overspend and all', () => {
    // The author's own sheet is outside the printed limits. A build that
    // refused it could not load the book's eight.
    const yin = presetById('preset.yin')
    expect(yin).toBeDefined()
    const c = takePreset(emptyCreation(), yin?.id ?? '', fromSequence([4, 4, 4, 4, 4, 4]))
    const sheet = finishCreation(c)
    expect(sheet.name).toBe(yin?.name)
  })
})
