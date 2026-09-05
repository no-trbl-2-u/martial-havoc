/**
 * The starting kit (MH p.5, R02).
 *
 * "Initial equipment: common clothing; a weapon (even if not listed in
 * the weapon table pg. 53); a Health Elixir or an item from the Market
 * costing less than 20 GP; gold pieces by social status."
 *
 * Two readings shape this module:
 *
 * - I-02: the weapon is free text, and *any* item flagged `weapon`
 *   satisfies an armed Proficiency. So the weapon is a string, carried
 *   with the `weapon` flag whether or not it is on the Market list —
 *   Chen Zhen's Nunchaku and Yin's Magical sword are not.
 * - I-03: alcohol is an inventory item obtained narratively. Beggar So's
 *   Wine bottle is free text with the `alcohol` flag, not a Market line.
 *
 * The "less than 20 GP" cap is not recomputed here: the content package
 * flags it at data time and this module reads the flag (agents.md rule
 * 7 — the rule lives with the data it describes).
 */
import type { MarketItem } from '@martial-havoc/content'

/** A flag an inventory item can carry. */
export type ItemFlag = 'weapon' | 'alcohol' | 'underTwentyGp'

/** One line of a Master's equipment. */
export type Item = {
  readonly name: string
  /** Where the line came from: the rule, the Market, or the player's pen. */
  readonly source: 'clothing' | 'weapon' | 'market' | 'free-text'
  readonly flags: readonly ItemFlag[]
}

/**
 * The one item R02 names outright.
 *
 * "A Health Elixir **or** an item from the Market costing less than 20
 * GP" - the Elixir is the alternative to the cap, not an instance of it,
 * which matters because it is priced at 25 GP. XinYue's sheet on the
 * same page takes one.
 */
export const NAMED_STARTING_ITEM = 'Health Elixir'

/** What R02 always grants, before any choice is made. */
export const COMMON_CLOTHING: Item = Object.freeze({
  name: 'common clothing',
  source: 'clothing',
  flags: [],
})

/** A free-text weapon, flagged so an armed Proficiency counts (I-02). */
export const weaponItem = (name: string): Item => ({
  name: name.trim(),
  source: 'weapon',
  flags: ['weapon'],
})

/** A free-text item that is not on the Market, with whatever flags apply. */
export const freeTextItem = (name: string, flags: readonly ItemFlag[] = []): Item => ({
  name: name.trim(),
  source: 'free-text',
  flags,
})

/** A Market line as an inventory item, carrying the flags the data set. */
export const marketItem = (item: MarketItem): Item => ({
  name: item.item,
  source: 'market',
  flags: item.flags,
})

/** What the starting kit was asked for. */
export type KitChoice = {
  /** Free text; R02 allows a weapon that is not on the list. */
  readonly weapon: string
  /**
   * The one extra item. A Market item name (Health Elixir included, it
   * is a Common Item) or free text for something the Market does not
   * price.
   */
  readonly item?: string
}

/** The kit report: what was granted, and whether the item cleared R02's cap. */
export type KitReport = {
  readonly equipment: readonly Item[]
  /**
   * Set when the chosen item is on the Market at 20 GP or more. R02 caps
   * it below 20; like every other pool this is a flag, not a refusal.
   */
  readonly itemOverCap: boolean
  /** Set when the chosen item is not a Market line: it cannot be priced. */
  readonly itemUnpriced: boolean
}

/** Assemble the starting kit. Never refuses; reports instead. */
export const startingKit =
  (market: readonly MarketItem[]) =>
  (choice: KitChoice): KitReport => {
    const chosen =
      choice.item === undefined
        ? undefined
        : market.find((m) => m.item.trim().toLowerCase() === choice.item?.trim().toLowerCase())

    const extra: readonly Item[] =
      choice.item === undefined
        ? []
        : [chosen === undefined ? freeTextItem(choice.item) : marketItem(chosen)]

    return {
      equipment: [COMMON_CLOTHING, weaponItem(choice.weapon), ...extra],
      itemOverCap:
        chosen !== undefined &&
        !chosen.flags.includes('underTwentyGp') &&
        chosen.item.trim().toLowerCase() !== NAMED_STARTING_ITEM.toLowerCase(),
      itemUnpriced: choice.item !== undefined && chosen === undefined,
    }
  }
