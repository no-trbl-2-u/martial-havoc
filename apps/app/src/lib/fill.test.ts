import { describe, expect, it } from 'vitest'
import { fill } from './fill'

describe('fill', () => {
  it('replaces every named placeholder and leaves unknown ones visible', () => {
    expect(fill('AREA {area} OF 8 · {name}', { area: 3, name: 'Attendants room' })).toBe(
      'AREA 3 OF 8 · Attendants room',
    )
    expect(fill('{a} and {b}', { a: 1 })).toBe('1 and {b}')
  })
})
