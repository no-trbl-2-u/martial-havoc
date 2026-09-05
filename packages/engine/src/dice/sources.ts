/**
 * Dice sources.
 *
 * Only one ships here, and it is deterministic. A random source is the
 * app's to inject (Phase 8): keeping `Math.random` out of this package
 * is what lets every rule be tested at a fixed sequence, and a test in
 * `../purity.test.ts` enforces it.
 */
import type { Die, DiceSource } from './types'
import { isDie } from './types'

/**
 * Thrown when a fixed sequence runs out mid-roll.
 *
 * This is a programming error, not a rule outcome — a test scripted
 * fewer dice than the procedure asks for — so it throws where a rule
 * result would flag. The message carries how many dice the sequence
 * held and how many were drawn, because "undefined is not a number"
 * three frames deep is the alternative.
 */
export class DiceExhausted extends Error {
  constructor(
    readonly available: number,
    readonly drawn: number,
  ) {
    super(`dice exhausted: the sequence held ${available}, and ${drawn} were drawn`)
    this.name = 'DiceExhausted'
  }
}

/** Thrown when a scripted sequence contains something that is not a d6 face. */
export class NotADie extends Error {
  constructor(
    readonly value: unknown,
    readonly index: number,
  ) {
    super(`not a d6 face at index ${index}: ${String(value)}`)
    this.name = 'NotADie'
  }
}

/**
 * A source that yields the given faces in order, then throws.
 *
 * The one source the engine ships. Its closure is the only mutable
 * state in the package, and it is invisible from outside: two sources
 * built from the same array are wholly independent.
 */
export const fromSequence = (faces: readonly number[]): DiceSource => {
  faces.forEach((face, index) => {
    if (!isDie(face)) throw new NotADie(face, index)
  })
  let drawn = 0
  return {
    next: (): Die => {
      const face = faces[drawn]
      drawn += 1
      if (face === undefined) throw new DiceExhausted(faces.length, drawn)
      return face as Die
    },
  }
}
