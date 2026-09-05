import { describe, expect, it } from 'vitest'
import { LABELS, behaviours, isLabel, isLabelled } from './index'

describe('engine surface (the garden)', () => {
  it('exports an empty, frozen behaviour registry', () => {
    expect(Array.isArray(behaviours)).toBe(true)
    expect(behaviours).toHaveLength(0)
    expect(Object.isFrozen(behaviours)).toBe(true)
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
