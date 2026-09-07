/**
 * Fixed-dice tests for the treasures' mechanics (5T a2; I-38, I-44,
 * I-49, I-50).
 *
 * Each of these is a reading over a printed effect, so each test names
 * the printed words it is reading as much as the number it expects.
 */
import { describe, expect, it } from 'vitest'
import { fromSequence } from '../dice/sources'
import { answersYes, binds, callsOut, magicFire, wards } from './treasures'

describe('calling a name (I-38, the Oracle Closed Question)', () => {
  it('traps on a Yes-class answer: "Yes, but", "Yes", "Yes, and"', () => {
    expect([4, 5, 6].map(answersYes)).toEqual([true, true, true])
  })

  it('does not trap on a No-class answer', () => {
    expect([1, 2, 3].map(answersYes)).toEqual([false, false, false])
  })

  it('draws exactly one die, and reports the face it read', () => {
    expect(callsOut(fromSequence([5]))).toEqual({ face: 5, trapped: true })
    expect(callsOut(fromSequence([3]))).toEqual({ face: 3, trapped: false })
  })
})

describe('binding (I-49)', () => {
  it('is an Opening that a missed Final Blow does not free', () => {
    expect(binds()).toEqual({ opening: true, survivesAMissedBlow: true })
  })
})

describe('magic fire (I-50)', () => {
  it('burns for the die now and for one every round after', () => {
    expect(magicFire(fromSequence([4]))).toEqual({ face: 4, now: 4, each: 1 })
  })

  it('never burns for nothing: the smallest die still burns', () => {
    expect(magicFire(fromSequence([1])).now).toBe(1)
  })
})

describe('warding (I-44)', () => {
  it('takes the hit on a round the opponent won', () => {
    expect(wards(true)).toBe(true)
  })

  it('does nothing on a round the Master won', () => {
    expect(wards(false)).toBe(false)
  })
})
