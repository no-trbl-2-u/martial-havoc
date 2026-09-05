/**
 * The four rolls the book asks for, over an injected source.
 *
 * Every one returns the faces it drew alongside the result. The Horizon
 * asks that the UI be able to show both dice of a d66 and both dice of a
 * 2d6, and a result that has thrown its faces away cannot be shown or
 * replayed. Nothing here is curried on a table: these are the dice, not
 * the rules.
 */
import type { Die, DiceSource } from './types'

/** One d6. */
export const d6 = (dice: DiceSource): Die => dice.next()

/** The result of summing several d6. */
export type SumRoll = {
  readonly faces: readonly Die[]
  readonly sum: number
}

/**
 * `n` d6, summed, with every face kept.
 *
 * `n: 0` is a legal roll of nothing — it is how a flat amount (Vagabond's
 * 1 GP) goes through the same path as `3d6`, so no caller has to branch.
 */
export const nd6 =
  (n: number) =>
  (dice: DiceSource): SumRoll => {
    const faces: Die[] = []
    for (let i = 0; i < n; i += 1) faces.push(dice.next())
    return { faces, sum: faces.reduce<number>((total, face) => total + face, 0) }
  }

/** A d66 result: the two dice, and the two-digit address they make. */
export type D66Roll = {
  readonly tens: Die
  readonly ones: Die
  /** `tens * 10 + ones` — (3, 5) reads as 35, as the book does. */
  readonly value: number
}

/** d66: first die is the row group, second the entry within it. */
export const d66 = (dice: DiceSource): D66Roll => {
  const tens = dice.next()
  const ones = dice.next()
  return { tens, ones, value: tens * 10 + ones }
}

/** A 2d6 result: both dice, their total, and whether they matched. */
export type TwoD6Roll = {
  readonly a: Die
  readonly b: Die
  readonly total: number
  /** Doubles land a Final Blow (R30); 6 of 36 outcomes. */
  readonly doubles: boolean
}

/** 2d6, keeping both dice so a doubles result can be shown, not just asserted. */
export const twoD6 = (dice: DiceSource): TwoD6Roll => {
  const a = dice.next()
  const b = dice.next()
  return { a, b, total: a + b, doubles: a === b }
}

/** A dice expression as data: `n` dice of `d` faces plus `plus`. */
export type DiceSpec = {
  readonly n: number
  readonly d: number
  readonly plus: number
}

/**
 * Roll a {@link DiceSpec} from the content tables (social status gold,
 * treasure amounts). `n: 0` yields the flat `plus` and draws no dice.
 */
export const rollSpec =
  (spec: DiceSpec) =>
  (dice: DiceSource): SumRoll => {
    const rolled = nd6(spec.n)(dice)
    return { faces: rolled.faces, sum: rolled.sum + spec.plus }
  }
