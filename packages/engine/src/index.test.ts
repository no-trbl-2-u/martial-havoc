import { describe, expect, it } from 'vitest'
import { LABELS, behaviours, isLabel, isLabelled } from './index'

describe('engine surface', () => {
  it('exports a frozen behaviour registry, one entry per behaviour', () => {
    expect(Array.isArray(behaviours)).toBe(true)
    expect(Object.isFrozen(behaviours)).toBe(true)
    expect(behaviours.every(isLabelled)).toBe(true)
  })

  it('registers the dice behaviours', () => {
    const ids = behaviours.map((b) => b.id)
    expect(ids).toContain('dice.d6')
    expect(ids).toContain('dice.d66')
    expect(ids).toContain('dice.two-d6-doubles')
  })

  it('knows exactly the three labels the spec allows', () => {
    expect([...LABELS]).toEqual(['rule', 'reading', 'invention'])
    expect(isLabel('rule')).toBe(true)
    expect(isLabel('guess')).toBe(false)
    expect(isLabel(undefined)).toBe(false)
  })

  it('accepts only a fully labelled behaviour', () => {
    expect(isLabelled({ id: 'x', label: 'reading', cite: 'I-01' })).toBe(true)
    expect(isLabelled({ id: 'x', label: 'reading', cite: '' })).toBe(false)
    expect(isLabelled({ id: 'x', label: 'vibe', cite: 'I-01' })).toBe(false)
    expect(isLabelled({ id: '', label: 'rule', cite: 'MH p.1' })).toBe(false)
    expect(isLabelled(null)).toBe(false)
  })
})
