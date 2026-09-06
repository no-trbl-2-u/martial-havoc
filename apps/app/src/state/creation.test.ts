/**
 * Making a Master (R01-R19), on fixed dice.
 *
 * The two things worth proving are the ones `spec.md` is explicit
 * about: creation follows the book's order, and it **reports rather
 * than refuses**. Everything here is a fixed sequence, so a failure
 * names a rule and never a seed.
 */
import { describe, expect, it } from 'vitest'
import { fromSequence } from '@martial-havoc/engine'
import { martialArtById, martialArts, presetById } from '@martial-havoc/content'
import {
  DEFAULT_NAME,
  ageOf,
  emptyCreation,
  equipmentOf,
  finishCreation,
  flagsOf,
  pool,
  resourcePool,
  rollArt,
  rollNumbers,
  rollStanding,
  skillAfterTraining,
  spentProficiency,
  spentResources,
  takePreset,
} from './creation'

const dice = () => fromSequence([4, 4, 4, 4, 4, 4, 4, 4])

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

  it('reads the age as a number, or leaves it unsaid (R01)', () => {
    expect(ageOf({ ...emptyCreation(), age: '27' })).toBe(27)
    expect(ageOf({ ...emptyCreation(), age: '' })).toBeNull()
    expect(ageOf({ ...emptyCreation(), age: 'old' })).toBeNull()
  })
})

describe('the starting kit (R02)', () => {
  it('grants common clothing, the typed weapon and the chosen item', () => {
    const c = { ...emptyCreation(), weapon: ' Spear ', kitItemId: 'market.common.health-elixir' }
    expect(equipmentOf(c)).toEqual(['common clothing', 'Spear', 'Health Elixir'])
  })

  it('leaves out what was never given', () => {
    expect(equipmentOf(emptyCreation())).toEqual(['common clothing'])
  })

  it('lands on the sheet', () => {
    const sheet = finishCreation({ ...emptyCreation(), weapon: 'Staff', kitItemId: 'market.common.lantern' })
    expect(sheet.equipment).toEqual(['common clothing', 'Staff', 'Lantern'])
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

  it('is a Proficiency of its own on the sheet (R17)', () => {
    const sheet = finishCreation({ ...rolled(), training: 2 })
    expect(sheet.training).toBe(2)
    expect(sheet.skill).toBe(7)
    expect(sheet.skillInitial).toBe(9)
  })

  it('buys Rituals as well as Techniques with its resource points (R14, R16)', () => {
    const c = {
      ...rolled(),
      training: 2,
      techniqueIds: ['technique.blue-dragon'],
      ritualIds: ['ritual.acupuncture', 'ritual.acting-without-acting'],
    }
    // Blue Dragon 1, Acupuncture 1, Acting without acting 3.
    expect(spentResources(c)).toBe(5)
    const sheet = finishCreation(c)
    expect(sheet.techniques).toEqual(['technique.blue-dragon'])
    expect(sheet.rituals).toEqual(['ritual.acupuncture', 'ritual.acting-without-acting'])
  })
})

describe('it reports, it never refuses (spec.md)', () => {
  // SKILL 9, then a style to spend it on.
  const rolled = () => ({
    ...rollNumbers(emptyCreation(), fromSequence([3, 5, 5, 2])),
    martialArtId: 'martial-art.shaolin-quan',
  })

  it('has a style to spend against', () => {
    expect(martialArtById('martial-art.shaolin-quan')).toBeDefined()
  })

  it('lets a Proficiency pool be overspent, and says by how much (R10)', () => {
    const c = { ...rolled(), proficiencies: { Stamina: 12 } }
    expect(spentProficiency(c)).toBe(12)
    expect(flagsOf(c).join(' ')).toContain('12 of 9 points, over by 3')
  })

  it('says when a Proficiency passes the cap of 4 (R11)', () => {
    const c = { ...rolled(), proficiencies: { Stamina: 5 } }
    expect(flagsOf(c).join(' ')).toContain('Stamina is 5')
  })

  it('names a Proficiency the style does not carry (R10, R12)', () => {
    const c = { ...rolled(), proficiencies: { Astrology: 2 } }
    expect(flagsOf(c).join(' ')).toContain('Astrology')
  })

  it('says when Techniques and Rituals cost more than the resource points (R16)', () => {
    // Acting without acting 3 + Acupuncture 1 = the 4 one Training point buys: no flag.
    const c = { ...rolled(), training: 1, ritualIds: ['ritual.acting-without-acting', 'ritual.acupuncture'] }
    expect(flagsOf(c)).toEqual([])
    const over = { ...c, techniqueIds: ['technique.blue-dragon'] }
    expect(flagsOf(over).join(' ')).toContain('5 of 4 resource points, over by 1')
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
    expect(sheet.xp).toBe(0)
    expect(sheet.age).toBeNull()
  })

  it('carries the typed name, trimmed, and the age', () => {
    const sheet = finishCreation({ ...emptyCreation(), name: '  Iron Monkey  ', age: '31' })
    expect(sheet.name).toBe('Iron Monkey')
    expect(sheet.age).toBe(31)
  })
})

describe('the eight printed sheets (R83)', () => {
  it('loads one as printed, with its gold rolled (R03)', () => {
    const c = takePreset(emptyCreation(), 'preset.san-te', dice())
    const printed = presetById('preset.san-te')
    expect(printed).toBeDefined()
    expect(c.name).toBe(printed?.name)
    expect(c.age).toBe(String(printed?.age))
    expect(skillAfterTraining(c)).toBe(printed?.skill)
    expect(c.endurance?.current).toBe(printed?.endurance)
    expect(c.luck?.current).toBe(printed?.luck)
    expect(c.training).toBe(printed?.training)
    expect(c.step).toBe('ready')
    expect(c.status?.gold ?? -1).toBeGreaterThanOrEqual(0)
  })

  it('derives the rolled SKILL from the printed one plus Training (R10, R15)', () => {
    // San Te prints SKILL 8 with Training 2: the pool he spent was 10.
    const c = takePreset(emptyCreation(), 'preset.san-te', dice())
    expect(pool(c)).toBe(10)
    const sheet = finishCreation(c)
    expect(sheet.skill).toBe(8)
    expect(sheet.skillInitial).toBe(10)
    expect(sheet.training).toBe(2)
  })

  it('reads printed spellings through the resolution map, so nothing is a stranger', () => {
    // "Non lethal combat" is Shaolin Quan's "Non-lethal combat".
    const c = takePreset(emptyCreation(), 'preset.san-te', dice())
    expect(flagsOf(c)).toEqual([])
  })

  it('carries the printed age, equipment, Techniques and Rituals onto the sheet (R01)', () => {
    const c = takePreset(emptyCreation(), 'preset.yin', dice())
    const sheet = finishCreation(c)
    expect(sheet.age).toBe(43)
    expect(sheet.equipment).toEqual(['common clothing', 'Magical sword', 'protection sutra', 'bow and arrows'])
    expect(sheet.techniques).toEqual([])
    // Four printed, "Guardians of the gate" through the map to Door gods.
    expect(sheet.rituals).toHaveLength(4)
    expect(sheet.martialArtId).toBe('martial-art.wudang-quan')
  })

  it('leaves an unknown preset id alone rather than throwing', () => {
    const before = emptyCreation()
    expect(takePreset(before, 'preset.nobody', fromSequence([4, 4]))).toBe(before)
  })

  it('loads Yin as printed, flagged 10 of 9 and 12 of 8 (spec.md)', () => {
    // The author's own sheet is outside the printed limits. A build that
    // refused it could not load the book's eight.
    const c = takePreset(emptyCreation(), 'preset.yin', dice())
    const flags = flagsOf(c).join(' ')
    expect(flags).toContain('10 of 9 points, over by 1')
    expect(flags).toContain('12 of 8 resource points, over by 4')
    expect(finishCreation(c).name).toBe('Yin')
  })

  it('flags nothing on a sheet whose spend fits once Training is counted', () => {
    // Golden Swallow: SKILL 7, Training 1, 8 Proficiency points = pool 8.
    // Sun Wukong: SKILL 10, Training 4, 11 points against 14.
    expect(flagsOf(takePreset(emptyCreation(), 'preset.golden-swallow', dice()))).toEqual([])
    expect(flagsOf(takePreset(emptyCreation(), 'preset.sun-wukong', dice()))).toEqual([])
  })
})
