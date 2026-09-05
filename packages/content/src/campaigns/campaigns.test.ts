/** The adventure hooks, at the d66 addresses the book prints. */
import { describe, expect, it } from 'vitest'
import { adventureHooks, rollAdventureHook } from './index'

describe('adventure hooks (MH p.36-39, R50)', () => {
  it('resolves every one of the 36 d66 addresses', () => {
    expect(adventureHooks).toHaveLength(36)
    for (const tens of [1, 2, 3, 4, 5, 6])
      for (const ones of [1, 2, 3, 4, 5, 6]) expect(rollAdventureHook(tens, ones)).toBeDefined()
  })

  it('reads the address as tens die then ones die', () => {
    expect(rollAdventureHook(1, 1)?.text).toContain('An enemy school has killed your master')
    expect(rollAdventureHook(3, 2)?.text).toContain('you must kill the emperor')
    expect(rollAdventureHook(6, 6)?.text).toContain('magical influence of a criminal')
  })
})
