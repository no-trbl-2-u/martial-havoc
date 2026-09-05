/**
 * The dice interface.
 *
 * The engine rolls no dice of its own (agents.md standing rule 7): a
 * `DiceSource` is passed in, and every function that needs a die takes
 * one. Tests inject a fixed sequence; the app injects a random source in
 * Phase 8. That is what makes every rule in this package reproducible —
 * a creation is a pure function of its dice and its tables.
 *
 * Lowest layer of the dice folder: nothing here imports anything.
 */

/** One d6 face. The book has no other die. */
export type Die = 1 | 2 | 3 | 4 | 5 | 6

/** Every face, in order — the domain of {@link Die} at runtime. */
export const FACES: readonly Die[] = Object.freeze([1, 2, 3, 4, 5, 6])

/**
 * Where dice come from.
 *
 * One method, because one is all the book needs: every roll in Martial
 * Havoc is some number of d6 read in order. A source is free to be
 * random, scripted, or replayed from a save.
 */
export type DiceSource = {
  readonly next: () => Die
}

/** Runtime guard: is `value` a d6 face? */
export const isDie = (value: unknown): value is Die =>
  typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 6
