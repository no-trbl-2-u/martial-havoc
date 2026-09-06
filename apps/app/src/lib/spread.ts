/**
 * Push crowded points apart so their glyphs and labels do not overlap.
 *
 * Region positions are decorative (engine behaviour
 * `region.positions-are-decorative`), so the screen may move them for
 * legibility as long as it moves them the same way every time. This is a
 * fixed number of repulsion passes over pairs closer than `minimum`,
 * clamped to the drawing. Pure: same input, same output.
 */
export type XY = { readonly x: number; readonly y: number }

type Box = { readonly minX: number; readonly maxX: number; readonly minY: number; readonly maxY: number }

const clamp = (n: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, n))

/** One pass: every pair closer than `minimum` moves apart by half the shortfall each. */
const pass = (points: readonly XY[], minimum: number, box: Box): readonly XY[] => {
  const moved = points.map((p) => ({ x: p.x, y: p.y }))
  for (let i = 0; i < moved.length; i += 1) {
    for (let j = i + 1; j < moved.length; j += 1) {
      const a = moved[i]
      const b = moved[j]
      if (a === undefined || b === undefined) continue
      const dx = b.x - a.x
      const dy = b.y - a.y
      const distance = Math.hypot(dx, dy)
      if (distance >= minimum) continue
      // Coincident points get a fixed direction so the result is still a function of the input.
      const ux = distance === 0 ? 1 : dx / distance
      const uy = distance === 0 ? 0 : dy / distance
      const shift = (minimum - distance) / 2
      a.x -= ux * shift
      a.y -= uy * shift
      b.x += ux * shift
      b.y += uy * shift
    }
  }
  return moved.map((p) => ({ x: clamp(p.x, box.minX, box.maxX), y: clamp(p.y, box.minY, box.maxY) }))
}

/** Spread `points` so no two are closer than `minimum`, within `box`, in at most `passes` rounds. */
export const spread = (points: readonly XY[], minimum: number, box: Box, passes = 12): readonly XY[] => {
  let current = points
  for (let n = 0; n < passes; n += 1) current = pass(current, minimum, box)
  return current
}
