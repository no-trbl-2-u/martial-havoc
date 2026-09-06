/**
 * Fixed-dice tests for multiple combat (MH p.30, R35-R37; I-06, I-11).
 *
 * Dice order in a multi-opponent round is: the Master's 2d6 first, then
 * two per attacker, in the order the attackers are listed.
 */
import { describe, expect, it } from 'vitest'
import { fromSequence } from '../dice/sources'
import { areaDamage, attackersThisRound, roundAgainstMany, skillForFight } from './multiple'

describe('skillForFight (R35)', () => {
  it('reduces SKILL by the number of opponents faced', () => {
    expect(skillForFight(10, 3)).toBe(7)
  })

  it('is unchanged against one opponent', () => {
    expect(skillForFight(10, 1)).toBe(9)
  })

  it('does not floor at zero — the rule as printed, and the cue to flee', () => {
    expect(skillForFight(4, 6)).toBe(-2)
  })
})

describe('attackersThisRound (R37; sealed, I-09)', () => {
  it('caps simultaneous attackers at ATTACK', () => {
    expect(attackersThisRound(5, 2)).toBe(2)
  })

  it('lets everyone swing when ATTACK exceeds the number present', () => {
    expect(attackersThisRound(3, 5)).toBe(3)
  })

  it('is inert against a lone Master: one creature attacks once (sealed)', () => {
    // An ATTACK-5 monster fighting alone still attacks once.
    expect(attackersThisRound(1, 5)).toBe(1)
  })

  it('reads a blank ATTACK as 1 — the roster mode (I-09)', () => {
    expect(attackersThisRound(4, null)).toBe(1)
  })

  it('never lets a present opponent be capped below one', () => {
    expect(attackersThisRound(3, 0)).toBe(1)
  })
})

describe('roundAgainstMany (I-06)', () => {
  it('rolls the Master once and each attacker separately', () => {
    // Master 3+3 + SKILL 7 = 13. Attacker A 6+6 + 6 = 18 (hits for 5).
    // Attacker B 1+1 + 6 = 8 (the Master wins by 5).
    const round = roundAgainstMany({ skill: 7 }, [{ skill: 6 }, { skill: 6 }])(
      fromSequence([3, 3, 6, 6, 1, 1]),
    )
    expect(round.master.total).toBe(13)
    expect(round.exchanges).toHaveLength(2)
    expect(round.exchanges[0]?.outcome.kind).toBe('master-hit')
    expect(round.exchanges[1]?.outcome.kind).toBe('master-wins')
  })

  it('sums the damage taken across every attacker that won', () => {
    // Master 1+1 + 7 = 9. Two attackers at 5+5 + 6 = 16, each by 7.
    const round = roundAgainstMany({ skill: 7 }, [{ skill: 6 }, { skill: 6 }])(
      fromSequence([1, 1, 5, 5, 5, 5]),
    )
    expect(round.damageTaken).toBe(14)
  })

  it('flags an Unexpected Event when any exchange draws (R32)', () => {
    // Master 3+4 + 7 = 14; attacker 4+4 + 6 = 14: a draw.
    const round = roundAgainstMany({ skill: 7 }, [{ skill: 6 }])(fromSequence([3, 4, 4, 4]))
    expect(round.unexpectedEvent).toBe(true)
  })

  it('compares one Master roll against every attacker, not one roll each', () => {
    // Both attackers roll the same faces, so both must resolve the same
    // way — proof the Master's single roll is reused (I-06).
    const round = roundAgainstMany({ skill: 7 }, [{ skill: 6 }, { skill: 6 }])(
      fromSequence([2, 2, 4, 4, 4, 4]),
    )
    expect(round.exchanges[0]?.outcome.kind).toBe(round.exchanges[1]?.outcome.kind)
    expect(round.exchanges[0]?.opponent.total).toBe(round.exchanges[1]?.opponent.total)
  })
})

describe('areaDamage (R36, I-11)', () => {
  it("repeats the amount, never divides it — the book's own example", () => {
    // Double Strike, 4 damage, three opponents: two take 4 each.
    expect(areaDamage(4, 2, 3)).toEqual([4, 4, 0])
  })

  it('reaches everyone when the prose says "all opponents surrounding you"', () => {
    expect(areaDamage(3, Number.POSITIVE_INFINITY, 4)).toEqual([3, 3, 3, 3])
  })

  it('reaches nobody it cannot: fewer enemies than reach is fine', () => {
    expect(areaDamage(4, 2, 1)).toEqual([4])
  })
})
