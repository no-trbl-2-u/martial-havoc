/**
 * Money (MH p.52: "1 GP = 10 SP").
 *
 * The book prices goods in two denominations and the Market table
 * carries both columns (`priceGp` / `priceSp`, exactly one set per
 * row), while a Master's starting wealth is gold (R03). Comparing a
 * 5 SP stick of incense against a 3 GP purse needs one common unit,
 * and it has to be the *smaller* one: converting silver to gold gives
 * 0.5, and a purse that drifts by half a coin is a bug that only shows
 * up after the twentieth purchase.
 *
 * So: **everything internal is silver**, integers throughout. Gold is
 * a display concern, reconstructed at the edge by {@link fromSilver}.
 *
 * Pure arithmetic. No dice, no I/O, no React (agents.md rule 7).
 */
import type { MarketItem } from '@martial-havoc/content'

/** Silver pieces to the gold piece (MH p.52). */
export const SP_PER_GP = 10

/** A purse, in silver. The engine's only representation of money. */
export type Purse = number

/**
 * Gold and silver to silver.
 *
 * Both arguments are optional so a caller can pass whichever half it
 * has: `toSilver({ gp: 3 })` and `toSilver({ sp: 5 })` both work, and
 * a `null` price column (the shape the Market table ships) counts as
 * zero rather than throwing.
 */
export const toSilver = (amount: {
  readonly gp?: number | null
  readonly sp?: number | null
}): Purse => (amount.gp ?? 0) * SP_PER_GP + (amount.sp ?? 0)

/**
 * Silver back to the gold/silver pair a screen prints.
 *
 * Integer division and remainder, so 47 SP reads "4 GP 7 SP" and never
 * "4.7 GP". Negative input is not defended against: a negative purse is
 * a caller bug, and hiding it here would only move the bug.
 */
export const fromSilver = (
  silver: Purse,
): { readonly gp: number; readonly sp: number } => ({
  gp: Math.floor(silver / SP_PER_GP),
  sp: silver % SP_PER_GP,
})

/**
 * What one Market row costs, in silver.
 *
 * The table sets exactly one of the two columns; {@link toSilver}
 * treats the other's `null` as zero, so this is a total function over
 * every row the schema admits.
 */
export const priceInSilver = (item: MarketItem): Purse =>
  toSilver({ gp: item.priceGp, sp: item.priceSp })

/** What a spend attempt produced. Never throws; never mutates. */
export type Spend = {
  /** False when the purse could not cover the cost. */
  readonly paid: boolean
  /** The cost that was asked for, in silver. */
  readonly cost: Purse
  readonly before: Purse
  /** Unchanged from `before` when `paid` is false. */
  readonly after: Purse
}

/**
 * Take `cost` out of `purse`, or don't.
 *
 * A purse that cannot cover the cost is returned untouched with
 * `paid: false` — the caller decides whether that is a refusal, a
 * fight (R57's unpaid bet) or a shrug. Deciding here would be the
 * engine inventing a consequence the book gives per-location.
 */
export const spend = (purse: Purse, cost: Purse): Spend =>
  cost <= purse
    ? { paid: true, cost, before: purse, after: purse - cost }
    : { paid: false, cost, before: purse, after: purse }
