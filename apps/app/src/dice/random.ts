/**
 * The app's dice sources.
 *
 * The engine rolls nothing of its own (agents.md rule 7): it takes a
 * `DiceSource` and reads faces off it. The app supplies three, all
 * pure functions over their inputs except for the stream position a
 * source must hold to be a stream at all:
 *
 * - {@link randomSource} - the table's dice, `Math.random` by default.
 *   Injected rather than imported so a test can pass its own generator.
 * - {@link queued} - a fixed run of faces, then a fallback. The web
 *   build reads `?dice=3,4,...` into this so a Playwright run gets the
 *   rolls it asked for and the record keeps rolling after them; the
 *   engine's own `fromSequence` throws when exhausted, which a page
 *   must never do.
 * - {@link parseDiceQuery} - the `?dice=` list as faces, dropping
 *   anything that is not 1-6.
 */
import { isDie } from '@martial-havoc/engine'
import type { Die, DiceSource } from '@martial-havoc/engine'

/** A d6 from a `[0, 1)` generator. */
export const randomSource = (random: () => number = Math.random): DiceSource => ({
  next: () => (1 + Math.floor(random() * 6)) as Die,
})

/** `faces` in order, then `fallback` forever. */
export const queued = (faces: readonly Die[], fallback: DiceSource): DiceSource => {
  let position = 0
  return {
    next: () => {
      const face = faces[position]
      if (face === undefined) return fallback.next()
      position += 1
      return face
    },
  }
}

/** The faces named by a `?dice=` query, in order; non-faces are dropped. */
export const parseDiceQuery = (search: string): readonly Die[] => {
  const match = /[?&]dice=([^&]*)/.exec(search)
  if (match === null || match[1] === undefined) return []
  return decodeURIComponent(match[1])
    .split(',')
    .map((s) => Number(s.trim()))
    .filter(isDie)
}
