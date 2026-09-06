/**
 * Fixed-dice tests for the two resolution rolls (MH p.22, R20-R22).
 *
 * Every roll here is scripted: `fromSequence` yields the faces in order,
 * so each assertion names the exact dice that produced it. No randomness
 * enters this package (`../purity.test.ts` enforces that).
 */
import { describe, expect, it } from 'vitest'
import { fromSequence } from '../dice/sources'
import { check, isDoubleSix, luckCheck, skillCheck } from './checks'

describe('check (R20, R21 — 2d6 roll-under)', () => {
  it('succeeds under the threshold', () => {
    // 2 + 3 = 5, threshold 9.
    const outcome = check(9)(fromSequence([2, 3]))
    expect(outcome.success).toBe(true)
    expect(outcome.roll.total).toBe(5)
    expect(outcome.threshold).toBe(9)
  })

  it('succeeds on exactly the threshold — "equal to or lower"', () => {
    // 4 + 5 = 9, threshold 9.
    expect(check(9)(fromSequence([4, 5])).success).toBe(true)
  })

  it('fails over the threshold', () => {
    // 5 + 5 = 10, threshold 9.
    expect(check(9)(fromSequence([5, 5])).success).toBe(false)
  })

  it('keeps both faces so the roll can be shown and replayed', () => {
    const outcome = check(9)(fromSequence([1, 6]))
    expect(outcome.roll.a).toBe(1)
    expect(outcome.roll.b).toBe(6)
    expect(outcome.roll.doubles).toBe(false)
  })
})

describe('the sealed double six (spec.md)', () => {
  it('fails a check it would otherwise pass on the total', () => {
    // 12 against a threshold of 12 would pass "equal or lower"; sealed
    // rule: a double six fails every check.
    const outcome = check(12)(fromSequence([6, 6]))
    expect(outcome.success).toBe(false)
    expect(outcome.doubleSix).toBe(true)
  })

  it('fails a check against an impossibly generous threshold', () => {
    expect(check(99)(fromSequence([6, 6])).success).toBe(false)
  })

  it('is not triggered by any other doubles', () => {
    const outcome = check(12)(fromSequence([5, 5]))
    expect(outcome.doubleSix).toBe(false)
    expect(outcome.success).toBe(true)
  })

  it('isDoubleSix reads the pair, not the total', () => {
    expect(isDoubleSix({ a: 6, b: 6, total: 12, doubles: true })).toBe(true)
    expect(isDoubleSix({ a: 5, b: 5, total: 10, doubles: true })).toBe(false)
  })
})

describe('skillCheck (R20)', () => {
  it('rolls against SKILL alone when no Proficiency is relevant', () => {
    // SKILL 8, roll 4+4 = 8: equal, so a success.
    const outcome = skillCheck({ skill: 8 })(fromSequence([4, 4]))
    expect(outcome.threshold).toBe(8)
    expect(outcome.success).toBe(true)
  })

  it('adds exactly one relevant Proficiency (D10)', () => {
    // SKILL 8 + Proficiency 3 = 11; roll 5+5 = 10 succeeds.
    const outcome = skillCheck({ skill: 8, proficiency: 3 })(fromSequence([5, 5]))
    expect(outcome.threshold).toBe(11)
    expect(outcome.success).toBe(true)
  })

  it('treats a missing Proficiency as adding nothing (R12), not as a refusal', () => {
    // The same roll without the Proficiency: 10 over 8, a failure — but
    // the check still happened.
    const outcome = skillCheck({ skill: 8, proficiency: 0 })(fromSequence([5, 5]))
    expect(outcome.threshold).toBe(8)
    expect(outcome.success).toBe(false)
  })
})

describe('luckCheck (R21)', () => {
  it('spends one LUCK on a success', () => {
    // LUCK 9, roll 2+3 = 5: success, and LUCK still drops.
    const { outcome, luck } = luckCheck(9)(fromSequence([2, 3]))
    expect(outcome.success).toBe(true)
    expect(luck).toBe(8)
  })

  it('spends one LUCK on a failure — "regardless of the outcome"', () => {
    const { outcome, luck } = luckCheck(9)(fromSequence([6, 5]))
    expect(outcome.success).toBe(false)
    expect(luck).toBe(8)
  })

  it('spends one LUCK on the sealed double-six fumble too', () => {
    const { outcome, luck } = luckCheck(12)(fromSequence([6, 6]))
    expect(outcome.doubleSix).toBe(true)
    expect(outcome.success).toBe(false)
    expect(luck).toBe(11)
  })

  it('depletes across repeated checks — LUCK has no full-restore rule (R42)', () => {
    const dice = fromSequence([1, 1, 1, 1, 1, 1])
    const first = luckCheck(9)(dice)
    const second = luckCheck(first.luck)(dice)
    const third = luckCheck(second.luck)(dice)
    expect([first.luck, second.luck, third.luck]).toEqual([8, 7, 6])
    // The threshold falls with it: the third check was rolled against 7.
    expect(third.outcome.threshold).toBe(7)
  })
})
