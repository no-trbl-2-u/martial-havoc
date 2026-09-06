/**
 * Buying at the village stall row (MH p.52-55; spec.md, Horizon).
 *
 * The Market table is the book's, printed prices and all; that the
 * village *has* a stall row is the Horizon's. What this module adds
 * over {@link spend} is only the lookup: an item id in, a debited
 * purse out.
 *
 * Two things it deliberately does not do:
 *
 * 1. **It does not resell.** R60 says goods do not fetch full price
 *    "unless you're a skilled negotiator", and reading I-54 prices
 *    that as a SKILL check at -2. That is a check this phase does not
 *    ship (see the phase 7 brief's Follow-ups), and inventing a resale
 *    rate would be worse than not selling.
 * 2. **It does not hold an inventory.** The engine is pure and
 *    stateless (agents.md rule 7); what the Master is carrying belongs
 *    to the campaign record. `buy` reports *what* was bought and what
 *    it cost; the caller appends it.
 *
 * The table is injected, never imported for its values — the same
 * contract every other engine module keeps, and what lets a test hand
 * it two rows instead of a hundred.
 */
import type { MarketItem } from '@martial-havoc/content'
import { priceInSilver, spend } from './money'
import type { Purse } from './money'

/** Why a purchase did not happen. */
export type BuyRefusal = 'unknown-item' | 'insufficient'

/** What one purchase attempt produced. Total: never throws. */
export type Buy = {
  readonly bought: boolean
  /** The row that was bought, when one was. */
  readonly item?: MarketItem
  /** What it cost, in silver. Zero when the item was not found. */
  readonly cost: Purse
  readonly before: Purse
  /** Unchanged from `before` unless `bought` is true. */
  readonly after: Purse
  /** Set iff `bought` is false. */
  readonly reason?: BuyRefusal
}

/** What a purchase is asked for. */
export type BuyInput = {
  /** The Market rows on offer. Injected, not imported. */
  readonly market: readonly MarketItem[]
  /** The `market.*` id being bought. */
  readonly itemId: string
  /** The Master's purse, in silver ({@link toSilver} converts gold). */
  readonly purse: Purse
}

/**
 * Buy one item at its printed price.
 *
 * Returns a refusal rather than throwing, in both failure shapes:
 * an id no row carries (`unknown-item`, which a UI can only get to
 * through a stale save) and a purse too light (`insufficient`). In
 * both, `after` equals `before` — the caller can apply the result
 * unconditionally and a refusal costs nothing.
 */
export const buy = (input: BuyInput): Buy => {
  const item = input.market.find((row) => row.id === input.itemId)
  if (item === undefined) {
    return {
      bought: false,
      cost: 0,
      before: input.purse,
      after: input.purse,
      reason: 'unknown-item',
    }
  }
  const cost = priceInSilver(item)
  const paid = spend(input.purse, cost)
  return paid.paid
    ? { bought: true, item, cost, before: paid.before, after: paid.after }
    : {
        bought: false,
        item,
        cost,
        before: paid.before,
        after: paid.after,
        reason: 'insufficient',
      }
}
