/**
 * Dice for building a record outside the browser.
 *
 * The lowest layer of `e2e/fixtures`. A fixture folds the app's own
 * reducer over a list of actions (`record.ts`), and the reducer rolls
 * through an injected `DiceSource` exactly as the app does
 * (agents.md rule 7: the engine rolls no dice of its own). Two sources
 * are needed, for the same reason `apps/app/src/hooks/useRecord.ts`
 * keeps two:
 *
 * - {@link named} answers the rolls the *player* makes at the table
 *   (an exit's Event die, a round's 2d6). Every face is listed by the
 *   fixture, in order, and running out is an error: a fixture that
 *   rolls more than it named would silently drift, so it fails loudly
 *   instead. This is the offline twin of the browser's `?dice=` queue
 *   (`apps/app/src/dice/random.ts`).
 * - {@link cycling} answers the *record's own* throws (the region's
 *   points, a preset's gold), which are made when a record is created
 *   and are never something a spec asserts on. It repeats its faces
 *   forever, so those throws are deterministic without the fixture
 *   having to count them.
 *
 * Both are closures over an index, never objects with methods that
 * mutate a visible field: the only state is the position in the list.
 */
import type { DiceSource, Die } from '@martial-havoc/engine'

/**
 * A source that serves `faces` in order and throws once they are spent.
 *
 * @param faces The exact rolls the fixture's actions will make.
 * @returns A `DiceSource` whose `next` returns the next listed face.
 * @throws When `next` is called after the last face: the fixture named
 *   fewer rolls than its actions make, which is a bug in the fixture.
 */
export const named = (faces: readonly Die[]): DiceSource => {
  // The one piece of state: how many faces have been served.
  let served = 0
  return {
    next: () => {
      const face = faces[served]
      if (face === undefined) {
        throw new Error(
          `fixture dice exhausted: ${faces.length} face(s) named, roll ${served + 1} asked for`,
        )
      }
      served += 1
      return face
    },
  }
}

/**
 * A source that serves `faces` in order and starts again at the end.
 *
 * @param faces The faces to repeat; defaults to a plain 1..6 sweep.
 * @returns A `DiceSource` that never runs out.
 */
export const cycling = (faces: readonly Die[] = [1, 2, 3, 4, 5, 6]): DiceSource => {
  let served = 0
  return {
    next: () => {
      // `faces` is non-empty by construction of the default; a caller
      // passing `[]` gets the same loud failure `named` gives.
      const face = faces[served % faces.length]
      if (face === undefined) throw new Error('cycling dice given no faces')
      served += 1
      return face
    },
  }
}
