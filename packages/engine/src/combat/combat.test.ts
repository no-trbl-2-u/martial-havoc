/**
 * Fixed-dice tests for the combat round (MH p.23-29).
 *
 * Every roll is scripted. Attack Strength draws two dice per side, so a
 * sequence for one round is four faces: the Master's pair first, then
 * the opponent's, in the order the calls are made.
 */
import { describe, expect, it } from 'vitest'
import { fromSequence } from '../dice/sources'
import { attackStrength, relevantProficiency } from './attack-strength'
import { endsFight, resolveRound, spendTechnique } from './round'
import { finalBlow, namingRoll, newTechnique } from './final-blow'
import { eventReading, injuryDamage, minions, morale, unexpectedEvent } from './unexpected-event'

describe('relevantProficiency (D10, I-21)', () => {
  const two = [
    { name: 'Sword', value: 2 },
    { name: 'Kick', value: 4 },
  ]

  it('takes the higher of two by default (I-21)', () => {
    expect(relevantProficiency(two)).toEqual({ name: 'Kick', value: 4 })
  })

  it('takes the named one when the narrative selects it (I-21, I-07a)', () => {
    expect(relevantProficiency(two, 'Sword')).toEqual({ name: 'Sword', value: 2 })
  })

  it('returns null when the named Proficiency is not held', () => {
    expect(relevantProficiency(two, 'Spear')).toBeNull()
  })

  it('returns null for a combatant with none — SKILL + 2d6 and nothing else', () => {
    expect(relevantProficiency([])).toBeNull()
  })
})

describe('attackStrength (R23)', () => {
  it('is 2d6 + SKILL + exactly one Proficiency', () => {
    // 3 + 4 = 7, SKILL 9, Proficiency 2 -> 18.
    const result = attackStrength({
      skill: 9,
      proficiencies: [{ name: 'Sword', value: 2 }],
    })(fromSequence([3, 4]))
    expect(result.total).toBe(18)
    expect(result.proficiency).toEqual({ name: 'Sword', value: 2 })
  })

  it('adds only one when two are held (D10)', () => {
    // The higher (4) enters; the other (2) does not. 3+4+9+4 = 20.
    const result = attackStrength({
      skill: 9,
      proficiencies: [
        { name: 'Sword', value: 2 },
        { name: 'Kick', value: 4 },
      ],
    })(fromSequence([3, 4]))
    expect(result.total).toBe(20)
  })

  it('takes the SKILL it is given — multiple combat reduces it upstream (R35)', () => {
    // SKILL 9 less three opponents = 6. 3+4+6 = 13.
    const result = attackStrength({ skill: 6 })(fromSequence([3, 4]))
    expect(result.skill).toBe(6)
    expect(result.total).toBe(13)
  })

  it('keeps the roll so the round can be shown and replayed', () => {
    const result = attackStrength({ skill: 9 })(fromSequence([6, 6]))
    expect(result.roll.a).toBe(6)
    expect(result.roll.b).toBe(6)
    // A double six is not a fumble here: Attack Strength is not a check.
    expect(result.total).toBe(21)
  })
})

describe('resolveRound (R24, R25, R32)', () => {
  const roll = (skill: number, faces: readonly number[]) =>
    attackStrength({ skill })(fromSequence(faces))

  it('opponent higher: the Master loses the difference (R24)', () => {
    // Master 3+3+8 = 14; opponent 5+5+8 = 18. Difference 4.
    const outcome = resolveRound(roll(8, [3, 3]), roll(8, [5, 5]))
    expect(outcome.kind).toBe('master-hit')
    if (outcome.kind !== 'master-hit') throw new Error('unreachable')
    expect(outcome.damage).toBe(4)
  })

  it('Master higher: all four options are offered, none chosen (R25)', () => {
    // Master 5+5+8 = 18; opponent 3+3+8 = 14. Difference 4.
    const outcome = resolveRound(roll(8, [5, 5]), roll(8, [3, 3]))
    expect(outcome.kind).toBe('master-wins')
    if (outcome.kind !== 'master-wins') throw new Error('unreachable')
    expect(outcome.difference).toBe(4)
    expect(outcome.options.map((o) => o.kind)).toEqual([
      'damage',
      'technique',
      'weapon',
      'opening',
    ])
    expect(outcome.options[0]).toEqual({ kind: 'damage', amount: 4 })
  })

  it('a draw is an Unexpected Event, whatever the totals (R32)', () => {
    const outcome = resolveRound(roll(8, [4, 4]), roll(8, [4, 4]))
    expect(outcome.kind).toBe('unexpected-event')
  })

  it('a draw made of different dice is still a draw', () => {
    // Master 6+2+8 = 16; opponent 5+3+8 = 16.
    const outcome = resolveRound(roll(8, [6, 2]), roll(8, [5, 3]))
    expect(outcome.kind).toBe('unexpected-event')
  })
})

describe('spendTechnique (R27)', () => {
  it('costs the Technique its value in ENDURANCE, with no roll', () => {
    expect(spendTechnique(18, 3)).toBe(15)
  })

  it('does not floor at zero — what ENDURANCE zero means is R06, not ours', () => {
    expect(spendTechnique(2, 4)).toBe(-2)
  })
})

describe('endsFight (R26)', () => {
  const alive = {
    masterEndurance: 10,
    opponentEndurance: 10,
    finalBlowLanded: false,
    unexpectedEvent: false,
  }

  it('continues while nothing has happened', () => {
    expect(endsFight(alive)).toEqual({ ended: false })
  })

  it('ends on a landed Final Blow', () => {
    expect(endsFight({ ...alive, finalBlowLanded: true })).toEqual({
      ended: true,
      reason: 'final-blow',
    })
  })

  it('ends when the Master reaches zero ENDURANCE', () => {
    expect(endsFight({ ...alive, masterEndurance: 0 })).toEqual({
      ended: true,
      reason: 'master-down',
    })
  })

  it('ends when the opponent reaches zero ENDURANCE', () => {
    expect(endsFight({ ...alive, opponentEndurance: -3 })).toEqual({
      ended: true,
      reason: 'opponent-down',
    })
  })

  it('ends on an Unexpected Event — the combat phase is over (R32)', () => {
    expect(endsFight({ ...alive, unexpectedEvent: true })).toEqual({
      ended: true,
      reason: 'unexpected-event',
    })
  })

  it('reports the Final Blow when it also drops the opponent', () => {
    // The Final Blow carries the R31 consequence, so it is named first.
    expect(endsFight({ ...alive, finalBlowLanded: true, opponentEndurance: 0 })).toEqual({
      ended: true,
      reason: 'final-blow',
    })
  })
})

describe('finalBlow (R30, R13/I-25)', () => {
  it('lands on doubles', () => {
    expect(finalBlow()(fromSequence([4, 4])).landed).toBe(true)
  })

  it('misses on anything else', () => {
    expect(finalBlow()(fromSequence([4, 5])).landed).toBe(false)
  })

  it('lands on a double six — sealed: a double six lands every doubles roll', () => {
    expect(finalBlow()(fromSequence([6, 6])).landed).toBe(true)
  })

  it('is lethal for a Praying Mantis Master, outcome only (I-25)', () => {
    const landed = finalBlow({ alwaysLethal: true })(fromSequence([2, 2]))
    expect(landed.landed).toBe(true)
    expect(landed.lethal).toBe(true)
  })

  it('is not lethal when the blow did not land, Mantis or not', () => {
    expect(finalBlow({ alwaysLethal: true })(fromSequence([2, 3])).lethal).toBe(false)
  })
})

describe('newTechnique (R31, I-12)', () => {
  it('keeps the Technique and spends no LUCK on a success', () => {
    // LUCK 9, roll 2+3 = 5: success. I-12: no decrement on success.
    const result = newTechnique(9)(fromSequence([2, 3]))
    expect(result.learned).toBe(true)
    expect(result.luck).toBe(9)
  })

  it('loses exactly one LUCK on a failure, never two', () => {
    // LUCK 9, roll 6+5 = 11: failure. -1 only, not R21's decrement too.
    const result = newTechnique(9)(fromSequence([6, 5]))
    expect(result.learned).toBe(false)
    expect(result.luck).toBe(8)
  })

  it('fumbles on a double six like any other check', () => {
    const result = newTechnique(12)(fromSequence([6, 6]))
    expect(result.outcome.doubleSix).toBe(true)
    expect(result.learned).toBe(false)
    expect(result.luck).toBe(11)
  })
})

describe('namingRoll (R31, inspiration only)', () => {
  it('reads the first die as the band and the second as the row', () => {
    const roll = namingRoll(fromSequence([3, 5]))
    expect(roll.first).toBe(3)
    expect(roll.second).toBe(5)
    expect(roll.band).toBe('3-4')
  })

  it('bands 1-2, 3-4 and 5-6 as the table is printed', () => {
    expect(namingRoll(fromSequence([1, 1])).band).toBe('1-2')
    expect(namingRoll(fromSequence([2, 1])).band).toBe('1-2')
    expect(namingRoll(fromSequence([4, 1])).band).toBe('3-4')
    expect(namingRoll(fromSequence([6, 1])).band).toBe('5-6')
  })

  it('returns words to choose from, not a composed name', () => {
    // R31 prints three orderings of one roll; composition is the caller's.
    expect(Object.keys(namingRoll(fromSequence([1, 1])))).not.toContain('name')
  })
})

describe('unexpectedEvent and Morale (R32-R33, I-30, I-33, spec.md)', () => {
  it('rolls 2d6 for the table address', () => {
    const roll = unexpectedEvent(fromSequence([5, 6]))
    expect(roll.total).toBe(11)
  })

  it('flees on 1-3 (sealed Morale)', () => {
    expect(morale(fromSequence([1])).result).toBe('flee')
    expect(morale(fromSequence([3])).result).toBe('flee')
  })

  it('retreats cautiously on 4-5', () => {
    expect(morale(fromSequence([4])).result).toBe('cautious-retreat')
    expect(morale(fromSequence([5])).result).toBe('cautious-retreat')
  })

  it('rallies on a 6 and draws a second d6 for reinforcements', () => {
    const result = morale(fromSequence([6, 4]))
    expect(result.result).toBe('rally')
    if (result.result !== 'rally') throw new Error('unreachable')
    expect(result.reinforcements).toBe(4)
  })

  it('draws only one die when it does not rally', () => {
    // A single-face sequence would throw if a second die were drawn.
    expect(() => morale(fromSequence([2]))).not.toThrow()
  })

  it('gives I-30 a reading for every row of the table', () => {
    const totals = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    expect(totals.every((t) => eventReading(t) !== undefined)).toBe(true)
  })

  it('reads the two retreat rows (4 and 10) as retreats — the Morale rows', () => {
    expect(eventReading(4)).toEqual({ kind: 'retreat' })
    expect(eventReading(10)).toEqual({ kind: 'retreat' })
  })

  it('reads 3 against the Master and 11 against the opponent', () => {
    expect(eventReading(3)).toEqual({ kind: 'injury-or-weapon-loss', target: 'master' })
    expect(eventReading(11)).toEqual({ kind: 'injury-or-weapon-loss', target: 'opponent' })
  })

  it('reads 2 as adverse and 12 as favourable divine intervention', () => {
    expect(eventReading(2)).toEqual({ kind: 'divine-intervention', favourable: false })
    expect(eventReading(12)).toEqual({ kind: 'divine-intervention', favourable: true })
  })

  it('returns undefined off the table rather than throwing', () => {
    expect(eventReading(1)).toBeUndefined()
    expect(eventReading(13)).toBeUndefined()
  })

  it('reads "1-4 Minions" on a d6 (I-33)', () => {
    const counts = [1, 2, 3, 4, 5, 6].map((f) => minions(fromSequence([f])).count)
    expect(counts).toEqual([1, 1, 2, 3, 4, 4])
  })

  it('rolls 1d6 for the injury reading (I-30)', () => {
    expect(injuryDamage(fromSequence([5]))).toBe(5)
  })
})
