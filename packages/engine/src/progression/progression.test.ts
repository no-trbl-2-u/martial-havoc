/**
 * Tests for experience, spoils and the two mechanical Oracle readings
 * (MH p.34-35, 66, 68-69; I-53, I-30b, I-07a, I-08a).
 *
 * No dice: every rule here is arithmetic or a band lookup. The rolls
 * these functions feed (1d6 Treasure, 2d6 Special Item, 1d6 Oracle) are
 * `../dice/rolls.ts`, and the tables are the content package's.
 */
import { describe, expect, it } from 'vitest'
import { xpCostFor } from '@martial-havoc/content'
import { CAPS, XP_CATEGORIES, purchase, skillBand, xpAward } from './xp'
import { opponentProficiencyValue, ordinaryBlowsPass, treasureBand } from './spoils'
import { ambush, enemyAttack } from './oracle'
import { relevantProficiency } from '../combat/attack-strength'

/** The book's worked example: Master Lee, scores 2+3+1+3, Dishonor 1 (R49). */
const masterLee = {
  scores: {
    'Mission Success': 2,
    'Use of equipment and environment': 3,
    'Combat spectacularity': 1,
    'Lateral thinking': 3,
  },
  dishonor: 1,
}

describe('xpAward (R43, R49)', () => {
  it("reproduces the book's worked example: 9 earned, 1 Dishonor, 8 XP", () => {
    const award = xpAward(masterLee)
    expect(award.earned).toBe(9)
    expect(award.total).toBe(8)
    expect(award.outOfRange).toEqual([])
  })

  it('ranges 4-12 before Dishonor when every score is in range', () => {
    const low = XP_CATEGORIES.reduce((acc, n) => ({ ...acc, [n]: 1 }), {})
    const high = XP_CATEGORIES.reduce((acc, n) => ({ ...acc, [n]: 3 }), {})
    expect(xpAward({ scores: low as never, dishonor: 0 }).earned).toBe(4)
    expect(xpAward({ scores: high as never, dishonor: 0 }).earned).toBe(12)
  })

  it('floors at zero — Dishonor never leaves an adventure in debt', () => {
    expect(xpAward({ ...masterLee, dishonor: 20 }).total).toBe(0)
  })

  it('flags an out-of-range score and counts it anyway (spec.md: flag, never refuse)', () => {
    const award = xpAward({
      ...masterLee,
      scores: { ...masterLee.scores, 'Mission Success': 5 },
    })
    expect(award.outOfRange).toEqual(['Mission Success'])
    expect(award.earned).toBe(12)
  })
})

describe('skillBand (R44, I-53)', () => {
  it('reads the current SKILL, as the worked example does', () => {
    // Master Lee's SKILL 11 reads the 10-12 column.
    expect(skillBand(11)).toBe('SKILL 10-12')
  })

  it('bands 6-or-less, 7-9 and 10-12 as the table is printed', () => {
    expect(skillBand(6)).toBe('SKILL 6 or less')
    expect(skillBand(7)).toBe('SKILL 7-9')
    expect(skillBand(9)).toBe('SKILL 7-9')
    expect(skillBand(10)).toBe('SKILL 10-12')
  })

  it('keeps a legendary sheet in the top band rather than correcting it', () => {
    // Sun Wukong's implied SKILL 14 is data, not an error (R83).
    expect(skillBand(14)).toBe('SKILL 10-12')
  })
})

describe('purchase (R44, R45, R47)', () => {
  /** The cost table is content; the engine is handed the number. */
  const costOf = (increase: string, skill: number): number =>
    xpCostFor(increase)(skillBand(skill))?.cost ?? Number.NaN

  it('prices a +1 from the shipped cost table', () => {
    // Master Lee, SKILL 11: ENDURANCE costs 4, SKILL costs 12.
    expect(costOf('ENDURANCE', 11)).toBe(4)
    expect(costOf('SKILL', 11)).toBe(12)
  })

  it('spends the XP when it is affordable and legal', () => {
    const result = purchase({
      increase: 'ENDURANCE',
      cost: costOf('ENDURANCE', 11),
      xp: 8,
    })
    expect(result.affordable).toBe(true)
    expect(result.remaining).toBe(4)
  })

  it('carries the XP over untouched when it is unaffordable (R47)', () => {
    const result = purchase({ increase: 'SKILL', cost: costOf('SKILL', 11), xp: 8 })
    expect(result.affordable).toBe(false)
    expect(result.remaining).toBe(8)
  })

  it('refuses a SKILL or LUCK raise at the cap of 12 (R45)', () => {
    expect(CAPS.SKILL).toBe(12)
    const result = purchase({ increase: 'SKILL', cost: 12, xp: 100, current: 12 })
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(100)
  })

  it('allows a Martial Proficiency past creation’s maximum of 4 (R45)', () => {
    const result = purchase({
      increase: 'Martial Proficiency',
      cost: costOf('Martial Proficiency', 11),
      xp: 20,
      current: 4,
    })
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(10)
  })
})

describe('treasureBand (R78)', () => {
  it('bands by the opponent’s ENDURANCE as the table prints it', () => {
    expect(treasureBand(12)).toBe('Up to 16')
    expect(treasureBand(16)).toBe('Up to 16')
    expect(treasureBand(17)).toBe('17-19')
    expect(treasureBand(19)).toBe('17-19')
    expect(treasureBand(20)).toBe('20 or more')
    expect(treasureBand(40)).toBe('20 or more')
  })
})

describe('ordinaryBlowsPass (R77, I-29)', () => {
  it('lets an ordinary blow through against a corporeal opponent', () => {
    expect(ordinaryBlowsPass({ incorporeal: false })).toBe(true)
  })

  it('stops an ordinary blow against a spirit', () => {
    expect(ordinaryBlowsPass({ incorporeal: true })).toBe(false)
  })

  it('lets a Technique or Ritual through against a spirit', () => {
    expect(ordinaryBlowsPass({ incorporeal: true, techniqueOrRitual: true })).toBe(true)
  })

  it('lets an exceptional weapon through against a spirit', () => {
    expect(ordinaryBlowsPass({ incorporeal: true, exceptionalWeapon: true })).toBe(true)
  })

  it('names no opponent of its own — the I-29 tag list is content', () => {
    // The gate is a boolean the caller supplies; the engine holds no roster.
    expect(ordinaryBlowsPass.length).toBe(1)
  })
})

describe('opponentProficiencyValue (R75, R76)', () => {
  it('adds the parenthesised value to Attack Strength', () => {
    expect(opponentProficiencyValue(3)).toBe(3)
  })

  it('adds nothing when the sheet prints no Martial Arts value', () => {
    expect(opponentProficiencyValue(null)).toBe(0)
  })
})

describe('the Oracle’s two mechanical readings (I-07a, I-08a)', () => {
  const wolf = {
    skill: 8,
    proficiencies: [
      { name: 'Claws', value: 2 },
      { name: 'Pounce', value: 4 },
    ],
  }

  it('"Normal" brings SKILL + 2d6 and no Proficiency (I-07a)', () => {
    const combatant = enemyAttack('Normal', wolf)
    expect(combatant.proficiencies).toBeUndefined()
    expect(relevantProficiency(combatant.proficiencies ?? [])).toBeNull()
  })

  it('"Special" brings one listed Proficiency, the higher by default (I-07a, I-21)', () => {
    const combatant = enemyAttack('Special', wolf)
    expect(relevantProficiency(combatant.proficiencies ?? [])).toEqual({
      name: 'Pounce',
      value: 4,
    })
  })

  it('"Special" can name the Proficiency the narrative picked', () => {
    const combatant = enemyAttack('Special', wolf, 'Claws')
    expect(combatant.useProficiency).toBe('Claws')
  })

  it('an Ambush is one unopposed opponent round, then normal rounds (I-08a)', () => {
    expect(ambush()).toEqual({
      masterRollsWithoutProficiency: true,
      roundsAfter: 'normal',
    })
  })
})
