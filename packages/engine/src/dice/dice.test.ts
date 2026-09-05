/**
 * The dice, at fixed sequences.
 *
 * Every test here scripts its dice, which is the point of the whole
 * folder: if a roll cannot be reproduced from a sequence, no rule built
 * on it can be tested either.
 */
import { describe, expect, it } from 'vitest'
import { DiceExhausted, NotADie, fromSequence } from './sources'
import { d6, d66, nd6, rollSpec, twoD6 } from './rolls'
import { FACES, isDie } from './types'

describe('fromSequence', () => {
  it('yields the faces in the order they were scripted', () => {
    const dice = fromSequence([1, 6, 3])
    expect([d6(dice), d6(dice), d6(dice)]).toEqual([1, 6, 3])
  })

  it('throws DiceExhausted, naming how many it held and how many were drawn', () => {
    const dice = fromSequence([4, 4])
    d6(dice)
    d6(dice)
    expect(() => d6(dice)).toThrow(DiceExhausted)
    try {
      d6(fromSequence([]))
    } catch (error) {
      expect(error).toBeInstanceOf(DiceExhausted)
      expect((error as DiceExhausted).available).toBe(0)
      expect((error as DiceExhausted).drawn).toBe(1)
      expect((error as Error).message).toContain('the sequence held 0')
    }
  })

  it('rejects a sequence that is not made of d6 faces, naming the index', () => {
    expect(() => fromSequence([1, 7])).toThrow(NotADie)
    expect(() => fromSequence([0])).toThrow(NotADie)
    expect(() => fromSequence([1, 2.5])).toThrow(NotADie)
    try {
      fromSequence([1, 2, 9])
    } catch (error) {
      expect((error as NotADie).index).toBe(2)
    }
  })

  it('gives two sources built from the same array independent positions', () => {
    const faces = [1, 2, 3]
    const a = fromSequence(faces)
    const b = fromSequence(faces)
    expect(d6(a)).toBe(1)
    expect(d6(b)).toBe(1)
  })
})

describe('nd6', () => {
  it('sums the faces and keeps every one of them', () => {
    expect(nd6(3)(fromSequence([1, 2, 3]))).toEqual({ faces: [1, 2, 3], sum: 6 })
  })

  it('rolls nothing for n = 0, and draws no dice doing it', () => {
    const dice = fromSequence([5])
    expect(nd6(0)(dice)).toEqual({ faces: [], sum: 0 })
    // The scripted 5 is still there: nd6(0) did not consume it.
    expect(d6(dice)).toBe(5)
  })
})

describe('d66', () => {
  it('reads the first die as tens and the second as ones', () => {
    expect(d66(fromSequence([3, 5]))).toEqual({ tens: 3, ones: 5, value: 35 })
    expect(d66(fromSequence([1, 1])).value).toBe(11)
    expect(d66(fromSequence([6, 6])).value).toBe(66)
  })
})

describe('twoD6', () => {
  it('keeps both dice, the total, and whether they matched', () => {
    expect(twoD6(fromSequence([2, 5]))).toEqual({ a: 2, b: 5, total: 7, doubles: false })
    expect(twoD6(fromSequence([4, 4]))).toEqual({ a: 4, b: 4, total: 8, doubles: true })
  })

  it('reports doubles on exactly 6 of the 36 outcomes (R30)', () => {
    const outcomes = FACES.flatMap((a) => FACES.map((b) => twoD6(fromSequence([a, b]))))
    expect(outcomes).toHaveLength(36)
    expect(outcomes.filter((r) => r.doubles)).toHaveLength(6)
  })
})

describe('rollSpec', () => {
  it('rolls a dice spec from the content tables', () => {
    // Middle Class gold: 3d6 (MH p.5, R03).
    expect(rollSpec({ n: 3, d: 6, plus: 0 })(fromSequence([1, 2, 3]))).toEqual({
      faces: [1, 2, 3],
      sum: 6,
    })
    // Poor gold: 1d6-1, which is 0 GP on a 1.
    expect(rollSpec({ n: 1, d: 6, plus: -1 })(fromSequence([1])).sum).toBe(0)
    // Rich gold: 5d6+6.
    expect(rollSpec({ n: 5, d: 6, plus: 6 })(fromSequence([1, 1, 1, 1, 1])).sum).toBe(11)
  })

  it('yields a flat amount without drawing a die when n is 0', () => {
    const dice = fromSequence([])
    // Vagabond gold: a flat 1 GP, through the same path as every other band.
    expect(rollSpec({ n: 0, d: 6, plus: 1 })(dice)).toEqual({ faces: [], sum: 1 })
  })
})

describe('isDie', () => {
  it('accepts the six faces and nothing else', () => {
    expect(FACES.every(isDie)).toBe(true)
    expect(isDie(0)).toBe(false)
    expect(isDie(7)).toBe(false)
    expect(isDie('3')).toBe(false)
    expect(isDie(undefined)).toBe(false)
  })
})
