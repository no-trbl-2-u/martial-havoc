/**
 * Tests for escape (MH p.30, R38-R39; I-32). No dice: the last blow is
 * a flat 2, not a roll.
 */
import { describe, expect, it } from 'vitest'
import { ESCAPE_DAMAGE, escape } from './escape'

describe('escape (R38, R39, I-32)', () => {
  it('costs 2 ENDURANCE and 1 Dishonor without a stratagem', () => {
    const result = escape({ endurance: 12 })
    expect(result.damage).toBe(ESCAPE_DAMAGE)
    expect(result.endurance).toBe(10)
    expect(result.dishonor).toBe(1)
  })

  it('costs nothing with a stratagem (I-32)', () => {
    const result = escape({ endurance: 12, stratagem: true })
    expect(result.damage).toBe(0)
    expect(result.endurance).toBe(12)
    expect(result.dishonor).toBe(0)
  })

  it('always dishonors a bare escape, because the -2 is damage (I-32)', () => {
    // R39 scores Dishonor "for each time you fail to escape without
    // suffering damage"; I-32 reads the last blow as damage, so the two
    // are inseparable.
    const result = escape({ endurance: 30 })
    expect(result.damage).toBeGreaterThan(0)
    expect(result.dishonor).toBe(1)
  })

  it('does not floor ENDURANCE — fleeing into unconsciousness is R06', () => {
    expect(escape({ endurance: 1 }).endurance).toBe(-1)
  })
})
