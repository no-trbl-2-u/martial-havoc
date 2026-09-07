/**
 * The opening's one fact, tested at both of its readings.
 *
 * `hasBegun` and `home` are two questions with one answer, and the
 * point of the module is that they cannot drift apart. These tests
 * pin the answer to `visited` rather than to a screen, a deed or a
 * count, because those are the things that used to stand in for it.
 */
import { describe, expect, it } from 'vitest'
import { theFiveTreasures } from '@martial-havoc/content'
import { hasBegun, home } from './opening'
import type { RecordState } from '../state/types'

const START = theFiveTreasures.meta.startArea

/** A record carrying only what these two functions read. */
const at = (visited: readonly string[]) =>
  ({ cave: { visited } }) as unknown as RecordState

describe('a made Master has not begun until the trail is taken', () => {
  it('is not begun while nothing has been entered', () => {
    expect(hasBegun(at([]))).toBe(false)
    expect(home(at([]))).toBe('village')
  })

  it('is begun the moment the start area is recorded as entered', () => {
    expect(hasBegun(at([START]))).toBe(true)
    expect(home(at([START]))).toBe('beat')
  })

  it('stays begun after walking on, and after walking back down', () => {
    const deeper = at([START, 'area.the-5-treasures.cave-entrance'])
    expect(hasBegun(deeper)).toBe(true)
    expect(home(deeper)).toBe('beat')
  })

  it('reads a pre-10b save correctly, since visited already meant entered', () => {
    // Records written before this phase seeded the start area at
    // creation, which for those Masters was true: they had walked in.
    expect(hasBegun(at([START]))).toBe(true)
  })
})
