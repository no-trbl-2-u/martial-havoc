/**
 * The page turn as pure data. No React, no clock, no dice.
 *
 * The frame is a book: a binding down the left, one leaf to its right.
 * Changing screen turns that leaf over the spine. This module holds
 * everything about a turn that can be decided without a renderer:
 *
 * - which leaves are on the table (`Turn`): the page lying flat, and
 *   the one lifting away over it, if any;
 * - what the lifting leaf looks like at a given point of the turn
 *   (`angle`, `frontShown`).
 *
 * The React half (`components/Leaf.tsx`) only drives a number from 0
 * to 1 through these functions. Keeping the decisions here means they
 * are unit-tested in Vitest, where a component is not.
 */

/** One leaf: the key it turns on, and the rendered thing it carries. */
export type Leaf<E> = {
  /** Identity of the leaf. Two renders with the same key are one page. */
  readonly key: string
  /** Whatever the renderer drew for this leaf, kept as it was. */
  readonly el: E
}

/**
 * What a turn needs to remember.
 *
 * `key` is the page lying flat, the one the player reads; the renderer
 * draws it fresh every time, so it is not kept here. `over` is the
 * previous page still lifting off, kept exactly as it was last drawn,
 * or `null` once it has landed (or when no page has turned yet).
 */
export type Turn<E> = {
  readonly key: string
  readonly over: Leaf<E> | null
}

/** A book open on page `key`: nothing is turning. */
export const opened = <E>(key: string): Turn<E> => ({ key, over: null })

/**
 * The renderer drew `last` the time before and is about to draw page
 * `key`. Decide what is on the table.
 *
 * Same key: the page is redrawn in place (the numbers changed, a card
 * landed), and nothing changes. The leaf lifting away, if any, keeps
 * lifting.
 *
 * A new key: the leaf last drawn starts turning over the new page. If a
 * page was already mid-turn it is dropped: the leaf now lifting is the
 * one the player was just reading, which is what the eye expects.
 */
export const settle = <E>(turn: Turn<E>, last: Leaf<E>, key: string): Turn<E> =>
  turn.key === key ? turn : { key, over: last }

/** The lifting leaf has landed: only the page underneath remains. */
export const land = <E>(turn: Turn<E>): Turn<E> => (turn.over === null ? turn : { ...turn, over: null })

/** True while a leaf is in the air. */
export const turning = <E>(turn: Turn<E>): boolean => turn.over !== null

/** How long a turn takes, in milliseconds. */
export const TURN_MS = 520

/**
 * The lifting leaf's rotation about the spine at progress `p` (0 to 1),
 * in degrees. Negative is toward the reader and over to the left, the
 * way a right-hand page turns: the hinge is the binding on the left.
 */
export const angle = (p: number): number => -180 * clamp(p)

/**
 * Which face of the lifting leaf the reader sees at progress `p`.
 *
 * Up to the midpoint the leaf shows its front (the page just read); past
 * it, edge-on and beyond, the reader sees its back: blank paper. The
 * renderer swaps faces here instead of relying on 3D backface rules,
 * which the native side does not have.
 */
export const frontShown = (p: number): boolean => clamp(p) < 0.5

/** Keep progress on [0, 1]; a timing curve can overshoot. */
const clamp = (p: number): number => (p < 0 ? 0 : p > 1 ? 1 : p)
