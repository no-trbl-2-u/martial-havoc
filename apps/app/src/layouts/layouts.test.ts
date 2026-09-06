/**
 * The layout flag (Phase 8a).
 *
 * The flag is temporary, but while it exists it is the only thing
 * standing between a stale bookmark and a blank beat, so it is tested
 * like anything else: total, case-insensitive, defaulting.
 */
import { describe, expect, it } from 'vitest'
import { DEFAULT_LAYOUT, LAYOUTS, layoutFromQuery } from './types'

describe('layoutFromQuery', () => {
  it('reads each of the three candidates', () => {
    expect(layoutFromQuery('?layout=a')).toBe('a')
    expect(layoutFromQuery('?layout=b')).toBe('b')
    expect(layoutFromQuery('?layout=c')).toBe('c')
  })

  it('reads the flag from anywhere in the query', () => {
    expect(layoutFromQuery('?dice=1,2&layout=c')).toBe('c')
    expect(layoutFromQuery('?layout=b&dice=6,6')).toBe('b')
  })

  it('is case-insensitive', () => {
    expect(layoutFromQuery('?layout=C')).toBe('c')
  })

  it('falls back rather than blanking the beat', () => {
    expect(layoutFromQuery('')).toBe(DEFAULT_LAYOUT)
    expect(layoutFromQuery('?dice=1,2')).toBe(DEFAULT_LAYOUT)
    expect(layoutFromQuery('?layout=')).toBe(DEFAULT_LAYOUT)
    expect(layoutFromQuery('?layout=d')).toBe(DEFAULT_LAYOUT)
    expect(layoutFromQuery('?layout=scroll')).toBe(DEFAULT_LAYOUT)
  })

  it('offers exactly the three the brief names', () => {
    expect(LAYOUTS).toEqual(['a', 'b', 'c'])
    expect(LAYOUTS).toContain(DEFAULT_LAYOUT)
  })
})
