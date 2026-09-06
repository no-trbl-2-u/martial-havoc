import { describe, expect, it } from 'vitest'
import { angle, frontShown, land, opened, settle, turning } from './turn'

const beat = { key: 'beat', el: 'B1' }
const rules = { key: 'rules', el: 'R1' }

describe('turn', () => {
  it('opens flat, with nothing in the air', () => {
    const t = opened('beat')
    expect(t).toEqual({ key: 'beat', over: null })
    expect(turning(t)).toBe(false)
  })

  it('redraws the same page in place without turning', () => {
    const t = opened('beat')
    expect(settle(t, beat, 'beat')).toBe(t)
  })

  it('lifts the leaf last drawn when the key changes', () => {
    const t = settle(opened('beat'), beat, 'rules')
    expect(t).toEqual({ key: 'rules', over: beat })
    expect(turning(t)).toBe(true)
  })

  it('keeps the lifting leaf as it was while the new page redraws', () => {
    const t = settle(settle(opened('beat'), beat, 'rules'), { key: 'rules', el: 'R2' }, 'rules')
    expect(t.over).toBe(beat)
  })

  it('drops a leaf mid-turn when a third page arrives', () => {
    const t = settle(settle(opened('beat'), beat, 'rules'), rules, 'record')
    expect(t).toEqual({ key: 'record', over: rules })
  })

  it('lands to a flat book, and landing a flat book is a no-op', () => {
    const flat = land(settle(opened('beat'), beat, 'rules'))
    expect(flat).toEqual({ key: 'rules', over: null })
    expect(land(flat)).toBe(flat)
  })

  it('turns toward the reader through 180 degrees, clamped', () => {
    expect(angle(0)).toBe(-0)
    expect(angle(0.5)).toBe(-90)
    expect(angle(1)).toBe(-180)
    expect(angle(1.2)).toBe(-180)
    expect(angle(-1)).toBe(-0)
  })

  it('shows the front until edge-on, then the back', () => {
    expect(frontShown(0)).toBe(true)
    expect(frontShown(0.49)).toBe(true)
    expect(frontShown(0.5)).toBe(false)
    expect(frontShown(1)).toBe(false)
  })
})
