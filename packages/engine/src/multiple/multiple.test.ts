/**
 * Fixed-dice tests for multiple combat (MH p.30, R35-R37; I-06, I-11).
 *
 * Dice order in a multi-opponent round is: the Master's 2d6 first, then
 * two per attacker, in the order the attackers are listed.
 */
import { describe, expect, it } from 'vitest'
import { fromSequence } from '../dice/sources'
import {
  areaDamage,
  attackersThisRound,
  heldBackInBand,
  roundAgainstBand,
  roundAgainstMany,
  skillForFight,
} from './multiple'

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

describe('heldBackInBand (R37, I-06: the cap is per kind)', () => {
  const ogre = (n: number) =>
    Array.from({ length: n }, () => ({ skill: 6, kind: 'foe.ogre', attack: 3 }))

  it('lets ATTACK of a kind swing and holds the rest back', () => {
    expect(heldBackInBand(ogre(4))).toEqual([false, false, false, true])
  })

  it('holds nobody back while the kind is within its ATTACK', () => {
    expect(heldBackInBand(ogre(3))).toEqual([false, false, false])
  })

  it('counts each kind separately: two caps, not one', () => {
    const mixed = [
      { skill: 7, kind: 'foe.skillful-beast', attack: 5 },
      { skill: 7, kind: 'foe.dexterous-ghost', attack: 1 },
      { skill: 7, kind: 'foe.dexterous-ghost', attack: 1 },
    ]
    expect(heldBackInBand(mixed)).toEqual([false, false, true])
  })

  it('is inert against a lone opponent, whatever its ATTACK (sealed)', () => {
    expect(heldBackInBand([{ skill: 5, kind: 'foe.woodgatherer', attack: 5 }])).toEqual([false])
  })
})

describe('roundAgainstBand (I-06, R37)', () => {
  // The brief's own scenario. SKILL 8 reduced by the three faced is 5;
  // 5 and 4 on the dice plus Non lethal combat 4 is 18. Each servant is
  // SKILL 5 with Surround 3, so 3+3, 6+6 and 2+2 read 14, 20 and 12.
  // Only the second beats the Master, and by 2.
  const master = { skill: 5, proficiencies: [{ name: 'Non lethal combat', value: 4 }] }
  const devils = Array.from({ length: 3 }, () => ({
    skill: 5,
    proficiencies: [{ name: 'Surround', value: 3 }],
    kind: 'foe.devil-servant',
    attack: 1,
  }))

  it('compares one Master roll against each attacker, whoever may reach', () => {
    const round = roundAgainstBand(master, devils)(fromSequence([5, 4, 3, 3, 6, 6, 2, 2]))
    expect(round.master.total).toBe(18)
    expect(round.exchanges.map((e) => e.opponent.total)).toEqual([14, 20, 12])
    expect(round.exchanges.map((e) => e.outcome.kind)).toEqual([
      'master-wins',
      'master-hit',
      'master-wins',
    ])
  })

  it('holds back the servants beyond ATTACK, so a won roll costs nothing', () => {
    // A Devil servant is ATT 1: three of them face the Master, all
    // three roll, and one of them may reach. The 20 that beat the
    // Master is the second, and the second is held back - so the round
    // costs no ENDURANCE, and SKILL is still reduced by all three
    // faced (R35). The two quantities are different, which is the
    // whole reason the module keeps them apart.
    const round = roundAgainstBand(master, devils)(fromSequence([5, 4, 3, 3, 6, 6, 2, 2]))
    expect(round.exchanges.map((e) => e.heldBack)).toEqual([false, true, true])
    expect(round.damageTaken).toBe(0)
  })

  it('lets a held-back attacker roll but not wound (R37)', () => {
    // Four Ogres, ATT 3: the fourth is held back. All four beat the
    // Master, and only three of them cost ENDURANCE.
    const ogres = Array.from({ length: 4 }, () => ({ skill: 6, kind: 'foe.ogre', attack: 3 }))
    const round = roundAgainstBand({ skill: 1 }, ogres)(
      fromSequence([1, 1, 6, 6, 6, 6, 6, 6, 6, 6]),
    )
    expect(round.exchanges.map((e) => e.heldBack)).toEqual([false, false, false, true])
    expect(round.exchanges.every((e) => e.outcome.kind === 'master-hit')).toBe(true)
    // Each of the three that reached the Master struck for the
    // difference; the fourth's identical roll is on screen and inert.
    expect(round.damageTaken).toBe(
      round.exchanges
        .filter((e) => !e.heldBack)
        .reduce((n, e) => n + (e.outcome.kind === 'master-hit' ? e.outcome.damage : 0), 0),
    )
  })
})
