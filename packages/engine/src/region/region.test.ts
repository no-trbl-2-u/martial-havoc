/**
 * The region on fixed dice: every position, face and mile is a pure
 * function of the sequence, and the graph is always walkable.
 */
import { describe, expect, it } from 'vitest'
import { fromSequence } from '../dice/sources'
import type { Die } from '../dice/types'
import { linksFrom, otherEnd, throwRegion } from './region'

/** Five dice per point: x tens, x ones, y tens, y ones, Location. */
const point = (xt: Die, xo: Die, yt: Die, yo: Die, loc: Die): Die[] => [xt, xo, yt, yo, loc]

describe('throwRegion', () => {
  it('reads each point off five dice, in order', () => {
    const dice = fromSequence([...point(1, 1, 2, 2, 3), ...point(6, 6, 5, 5, 4), 3, 4])
    const region = throwRegion(2)(dice)
    expect(region.points).toEqual([
      { id: 0, x: 11, y: 22, locationFace: 3 },
      { id: 1, x: 66, y: 55, locationFace: 4 },
    ])
    expect(region.links).toEqual([
      { a: 0, b: 1, roll: { a: 3, b: 4, total: 7, doubles: false }, miles: 7, joined: false },
    ])
  })

  it('nudges a duplicate position one step right so two dice never overlap', () => {
    const dice = fromSequence([...point(3, 3, 3, 3, 1), ...point(3, 3, 3, 3, 2), 1, 1])
    const { points } = throwRegion(2)(dice)
    expect(points.map((p) => [p.x, p.y])).toEqual([
      [33, 33],
      [34, 33],
    ])
  })

  it('links every point to its nearest neighbour and lists each pair once', () => {
    // Three points in a row: 0 and 1 are each other's nearest, 2's nearest is 1.
    const dice = fromSequence([
      ...point(1, 1, 1, 1, 1),
      ...point(1, 2, 1, 1, 1),
      ...point(2, 6, 1, 1, 1),
      2, 3, // link 0-1
      4, 5, // link 1-2
    ])
    const region = throwRegion(3)(dice)
    expect(region.links.map((l) => [l.a, l.b, l.miles, l.joined])).toEqual([
      [0, 1, 5, false],
      [1, 2, 9, false],
    ])
  })

  it('joins disconnected parts by their closest pair and marks the join', () => {
    // Two tight pairs far apart: nearest-neighbour alone gives two islands.
    const dice = fromSequence([
      ...point(1, 1, 1, 1, 1),
      ...point(1, 2, 1, 1, 1),
      ...point(6, 5, 6, 6, 1),
      ...point(6, 6, 6, 6, 1),
      1, 1, // 0-1
      2, 2, // 2-3
      6, 6, // the join, 1-2
    ])
    const region = throwRegion(4)(dice)
    expect(region.links.map((l) => [l.a, l.b, l.joined])).toEqual([
      [0, 1, false],
      [2, 3, false],
      [1, 2, true],
    ])
    expect(region.links.find((l) => l.joined)?.miles).toBe(12)
  })

  it('is walkable from any point to any other (seven points, many throws)', () => {
    // A fixed pseudo-random sequence long enough for 7 points and up to 21 links.
    const faces: Die[] = []
    let seed = 7
    for (let i = 0; i < 7 * 5 + 21 * 2; i += 1) {
      seed = (seed * 1103515245 + 12345) % 2147483648
      faces.push(((seed >> 16) % 6 + 1) as Die)
    }
    const region = throwRegion(7)(fromSequence(faces))
    const reached = new Set<number>([0])
    const frontier = [0]
    while (frontier.length > 0) {
      const here = frontier.pop() as number
      for (const link of linksFrom(region, here)) {
        const next = otherEnd(link, here)
        if (!reached.has(next)) {
          reached.add(next)
          frontier.push(next)
        }
      }
    }
    expect(reached.size).toBe(7)
    expect(region.links.every((l) => l.miles === l.roll.total)).toBe(true)
  })

  it('throws no links for a single point', () => {
    expect(throwRegion(1)(fromSequence(point(1, 1, 1, 1, 1))).links).toEqual([])
  })
})
