/**
 * The three attributes (MH p.6, R04) and their initial values (R05).
 *
 * R04: SKILL = 1d6+6, ENDURANCE = 2d6+12, LUCK = 1d6+6, rolled in that
 * order. R05 is guidance about how rarely they rise, but it obliges the
 * engine to *store* what they started at: the Ritual "Body and Mind
 * balance" and Special Item 7 both refer back to the initial value, so a
 * Master that only knows its current SKILL cannot resolve them.
 */
import { nd6 } from '../dice/rolls'
import type { DiceSource } from '../dice/types'
import type { Die } from '../dice/types'

/** One attribute: where it is now, where it started, and what rolled it. */
export type Attribute = {
  readonly current: number
  readonly initial: number
  readonly faces: readonly Die[]
}

/** SKILL, ENDURANCE and LUCK together. */
export type Attributes = {
  readonly skill: Attribute
  readonly endurance: Attribute
  readonly luck: Attribute
}

/** Roll `n` d6 and add `plus`, keeping the faces; current starts at initial. */
const attribute =
  (n: number, plus: number) =>
  (dice: DiceSource): Attribute => {
    const rolled = nd6(n)(dice)
    const value = rolled.sum + plus
    return { current: value, initial: value, faces: rolled.faces }
  }

/**
 * Roll all three, in the order the book prints them.
 *
 * Four dice in total: one for SKILL, two for ENDURANCE, one for LUCK.
 * The ranges that follow are SKILL 7-12, ENDURANCE 14-24, LUCK 7-12.
 */
export const rollAttributes = (dice: DiceSource): Attributes => ({
  skill: attribute(1, 6)(dice),
  endurance: attribute(2, 12)(dice),
  luck: attribute(1, 6)(dice),
})

/** Build an attribute at a known value — how a printed sheet is loaded. */
export const fixedAttribute = (value: number): Attribute => ({
  current: value,
  initial: value,
  faces: [],
})
