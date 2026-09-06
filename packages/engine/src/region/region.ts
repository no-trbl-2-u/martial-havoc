/**
 * The region: dice thrown on a plane (MH p.42-44, R51-R54; spec.md
 * Horizon; reading I-15).
 *
 * The book's procedure is physical: "roll a handful of d6 on a sheet of
 * paper. Mark where the dice land. The value on the visible face
 * corresponds to the Location" (R52). Distance between the dice is "an
 * arbitrary scale" (R53), and the route type is a separate 2d6 (R54).
 * An app has no sheet of paper, so `spec.md`'s Horizon fixes the
 * replacement, and this module is that replacement and nothing more:
 *
 * - N points on a plane, each position read off dice so that a replayed
 *   save lands the same region (I-15: "N random points on a plane").
 * - Each point's Location is the visible face - one d6 (R52). The text
 *   of the Location is a content lookup (`rules/region.json`, the
 *   `Location` column); the engine returns the face.
 * - Points are linked to their nearest neighbours. Where that graph
 *   falls into pieces, the closest pair across the gap is joined so the
 *   region can be walked; both are inventions of this build.
 * - A link's miles are the sum of the two dice that made it, and the
 *   route band comes from the same sum (spec.md, Horizon). R54's table
 *   is the band; the miles are ours.
 * - Positions are decorative. The screen must say it is not to scale.
 *
 * Reads `docs/rules/exploration.md` (R51-R55) and
 * `docs/rules/readings/exploration-cities-oracle.md` (I-15).
 * No React, no I/O, no dice of its own (agents.md rule 7).
 */
import { d6, d66, twoD6 } from '../dice/rolls'
import type { TwoD6Roll } from '../dice/rolls'
import type { Die, DiceSource } from '../dice/types'

/** One die on the sheet: where it landed and the face it shows. */
export type RegionPoint = {
  /** 0-based, in the order the dice were thrown. */
  readonly id: number
  /** Decorative plane coordinates, each a d66 value (11-66). */
  readonly x: number
  readonly y: number
  /** The visible face: the Location column's address (R52). */
  readonly locationFace: Die
}

/** One link between two points, and the roll that measured it. */
export type RegionLink = {
  /** The two point ids, `a < b`, so a link has one spelling. */
  readonly a: number
  readonly b: number
  /** The 2d6 that made the link; `miles` is its total. */
  readonly roll: TwoD6Roll
  /** Miles between the two points: the dice sum (spec.md, Horizon). */
  readonly miles: number
  /**
   * True where the link was added to join two disconnected parts rather
   * than by nearest neighbour. Surfaced so a UI can draw it differently.
   */
  readonly joined: boolean
}

/** A thrown region. */
export type Region = {
  readonly points: readonly RegionPoint[]
  readonly links: readonly RegionLink[]
}

/** Squared Euclidean distance on the decorative plane. */
const distance2 = (p: RegionPoint, q: RegionPoint): number =>
  (p.x - q.x) ** 2 + (p.y - q.y) ** 2

/** Spell a link one way so the same pair is never listed twice. */
const pairKey = (a: number, b: number): string => (a < b ? `${a}-${b}` : `${b}-${a}`)

/**
 * Throw one point: d66 for x, d66 for y, d6 for the Location (R52).
 *
 * Five dice per point, in that order, so a scripted source can place a
 * point exactly. A duplicate position is nudged one step right per
 * earlier point it lands on; positions are decorative, so the nudge
 * changes nothing the rules read.
 */
const throwPoint =
  (earlier: readonly RegionPoint[], id: number) =>
  (dice: DiceSource): RegionPoint => {
    const x0 = d66(dice).value
    const y = d66(dice).value
    const locationFace = d6(dice)
    const collisions = earlier.filter((p) => p.x === x0 && p.y === y).length
    return { id, x: x0 + collisions, y, locationFace }
  }

/**
 * Every point's nearest neighbour, as an undirected set of pairs.
 *
 * Ties go to the lower id, so the result is a pure function of the
 * positions. A pair chosen from both ends appears once.
 */
const nearestNeighbourPairs = (points: readonly RegionPoint[]): readonly (readonly [number, number])[] => {
  const seen = new Set<string>()
  const pairs: (readonly [number, number])[] = []
  for (const p of points) {
    const nearest = points
      .filter((q) => q.id !== p.id)
      .reduce<RegionPoint | null>(
        (best, q) => (best === null || distance2(p, q) < distance2(p, best) ? q : best),
        null,
      )
    if (nearest === null) continue
    const key = pairKey(p.id, nearest.id)
    if (seen.has(key)) continue
    seen.add(key)
    pairs.push([Math.min(p.id, nearest.id), Math.max(p.id, nearest.id)])
  }
  return pairs
}

/** Label every point with the connected component it belongs to. */
const components = (
  points: readonly RegionPoint[],
  pairs: readonly (readonly [number, number])[],
): readonly number[] => {
  const label = points.map((p) => p.id)
  const find = (i: number): number => (label[i] === i ? i : find(label[i] as number))
  for (const [a, b] of pairs) {
    const ra = find(a)
    const rb = find(b)
    if (ra !== rb) label[Math.max(ra, rb)] = Math.min(ra, rb)
  }
  return points.map((p) => find(p.id))
}

/**
 * Join disconnected parts by their closest pair until one region remains.
 *
 * An invention of this build: R52's sheet of paper needs no such rule
 * because a player walks anywhere. Returns the extra pairs only.
 */
const joiningPairs = (
  points: readonly RegionPoint[],
  pairs: readonly (readonly [number, number])[],
): readonly (readonly [number, number])[] => {
  const added: (readonly [number, number])[] = []
  let all = [...pairs]
  for (;;) {
    const comp = components(points, all)
    if (new Set(comp).size <= 1) return added
    let best: readonly [number, number] | null = null
    for (const p of points) {
      for (const q of points) {
        if (p.id >= q.id || comp[p.id] === comp[q.id]) continue
        if (
          best === null ||
          distance2(p, q) <
            distance2(points[best[0]] as RegionPoint, points[best[1]] as RegionPoint)
        ) {
          best = [p.id, q.id]
        }
      }
    }
    if (best === null) return added
    added.push(best)
    all = [...all, best]
  }
}

/**
 * Throw a region of `n` points (R52, I-15; spec.md, Horizon).
 *
 * Dice order: five per point (x, x, y, y, Location), then two per link in
 * the order the links are listed - nearest-neighbour links first, in
 * point order, then any joining links. `n` under 2 yields points and no
 * links; there is nothing to link.
 */
export const throwRegion =
  (n: number) =>
  (dice: DiceSource): Region => {
    const points: RegionPoint[] = []
    for (let id = 0; id < n; id += 1) points.push(throwPoint(points, id)(dice))
    const nearest = nearestNeighbourPairs(points)
    const joined = joiningPairs(points, nearest)
    const measure = (pair: readonly [number, number], wasJoined: boolean): RegionLink => {
      const roll = twoD6(dice)
      return { a: pair[0], b: pair[1], roll, miles: roll.total, joined: wasJoined }
    }
    return {
      points,
      links: [...nearest.map((p) => measure(p, false)), ...joined.map((p) => measure(p, true))],
    }
  }

/** The links that touch one point, in listed order. */
export const linksFrom = (region: Region, id: number): readonly RegionLink[] =>
  region.links.filter((l) => l.a === id || l.b === id)

/** The far end of a link from `id`. */
export const otherEnd = (link: RegionLink, id: number): number => (link.a === id ? link.b : link.a)
