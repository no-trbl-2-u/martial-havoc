import { describe, expect, it } from 'vitest'
import { spread } from './spread'

const box = { minX: 0, maxX: 300, minY: 0, maxY: 300 }

describe('spread', () => {
  it('leaves well-separated points where they are', () => {
    const points = [{ x: 10, y: 10 }, { x: 200, y: 200 }]
    expect(spread(points, 40, box)).toEqual(points)
  })

  it('pushes close points apart to at least the minimum', () => {
    const out = spread([{ x: 100, y: 100 }, { x: 105, y: 100 }, { x: 100, y: 103 }], 40, box)
    for (let i = 0; i < out.length; i += 1)
      for (let j = i + 1; j < out.length; j += 1) {
        const a = out[i]!
        const b = out[j]!
        expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThanOrEqual(39.9)
      }
  })

  it('separates coincident points deterministically and stays in the box', () => {
    const out = spread([{ x: 0, y: 0 }, { x: 0, y: 0 }], 40, box)
    expect(out).toEqual(spread([{ x: 0, y: 0 }, { x: 0, y: 0 }], 40, box))
    expect(out.every((p) => p.x >= 0 && p.x <= 300 && p.y >= 0 && p.y <= 300)).toBe(true)
    expect(Math.hypot(out[0]!.x - out[1]!.x, out[0]!.y - out[1]!.y)).toBeGreaterThanOrEqual(39.9)
  })
})
