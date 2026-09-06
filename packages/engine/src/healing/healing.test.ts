/**
 * Tests for recovery (MH p.31, R40-R42; spec.md's sealed night's rest).
 * No dice: every amount in the healing table is flat.
 */
import { describe, expect, it } from 'vitest'
import { NIGHTS_REST_ENDURANCE, PARTIAL, heal, nightsRest } from './healing'

describe('the partial amounts (R40-R42)', () => {
  it('matches the printed table: SKILL 1, ENDURANCE 4, LUCK 1', () => {
    expect(PARTIAL).toEqual({ SKILL: 1, ENDURANCE: 4, LUCK: 1 })
  })
})

describe('heal (R40-R42)', () => {
  it('restores the partial amount by default', () => {
    expect(heal({ attribute: 'ENDURANCE', current: 10 }).after).toBe(14)
  })

  it('stops at the ceiling when one is given (R05, the initial value)', () => {
    const result = heal({ attribute: 'ENDURANCE', current: 18, max: 20 })
    expect(result.after).toBe(20)
    expect(result.restored).toBe(2)
  })

  it('does not cap ENDURANCE when no ceiling is given — the book caps none', () => {
    expect(heal({ attribute: 'ENDURANCE', current: 100 }).after).toBe(104)
  })

  it('restores SKILL completely to its ceiling on a full rest (R40)', () => {
    const result = heal({ attribute: 'SKILL', current: 6, max: 10, full: true })
    expect(result.after).toBe(10)
    expect(result.wasFull).toBe(true)
  })

  it('falls back to the partial amount when a full restore has no ceiling', () => {
    // "Recovers completely" is meaningless without a maximum; guessing
    // one would be inventing a rule.
    const result = heal({ attribute: 'ENDURANCE', current: 6, full: true })
    expect(result.after).toBe(10)
    expect(result.wasFull).toBe(false)
  })

  it('never restores LUCK fully — the book gives it no such rule (R42)', () => {
    const result = heal({ attribute: 'LUCK', current: 3, max: 9, full: true })
    expect(result.after).toBe(4)
    expect(result.wasFull).toBe(false)
  })

  it('never reduces an attribute that is already above the ceiling', () => {
    const result = heal({ attribute: 'ENDURANCE', current: 25, max: 20 })
    expect(result.after).toBe(25)
    expect(result.restored).toBe(0)
  })
})

describe("nightsRest (R40; spec.md's sealed +4 ENDURANCE)", () => {
  it('restores SKILL completely and ENDURANCE by the sealed 4', () => {
    const result = nightsRest({
      skill: { current: 7, initial: 10 },
      endurance: { current: 8, initial: 20 },
    })
    expect(result.skill.after).toBe(10)
    expect(result.skill.wasFull).toBe(true)
    expect(result.endurance.after).toBe(12)
    expect(NIGHTS_REST_ENDURANCE).toBe(4)
  })

  it('does not carry ENDURANCE past where it started', () => {
    const result = nightsRest({
      skill: { current: 10, initial: 10 },
      endurance: { current: 19, initial: 20 },
    })
    expect(result.endurance.after).toBe(20)
  })

  it('touches no LUCK — its only recovery is a Temple check (R42)', () => {
    const result = nightsRest({
      skill: { current: 10, initial: 10 },
      endurance: { current: 20, initial: 20 },
    })
    expect(Object.keys(result)).toEqual(['skill', 'endurance'])
  })
})
