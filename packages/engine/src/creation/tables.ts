/**
 * What creation is handed.
 *
 * The engine imports the content package for **types only**; the tables
 * themselves arrive as an argument (agents.md rule 7, enforced by
 * `../purity.test.ts`). That is what keeps the engine pure, and what
 * lets Phase 5 hand it an adventure's tables the same way.
 */
import type {
  Learnable,
  MarketItem,
  MartialArt,
  NameResolution,
  Preset,
  SocialStatus,
} from '@martial-havoc/content'

/** Every table the creation procedure reads. */
export type CreationTables = {
  readonly martialArts: readonly MartialArt[]
  readonly socialStatuses: readonly SocialStatus[]
  readonly techniques: readonly Learnable[]
  readonly rituals: readonly Learnable[]
  readonly market: readonly MarketItem[]
  readonly presets: readonly Preset[]
  /** Sheet spelling to canonical id, for the pre-generated Masters. */
  readonly presetNameResolution: readonly NameResolution[]
}

/**
 * Resolve a name as it is written on a pre-generated sheet to the name
 * the tables use.
 *
 * The sheets abbreviate and re-capitalise. Two steps, in order: the
 * explicit map first (it is the only thing that knows "Wing Chun" means
 * Red Boat Wing Chun), then the name as written. Returns the input
 * unchanged when neither knows better, so the caller still sees what the
 * sheet said.
 */
export const canonicalName =
  (resolution: readonly NameResolution[]) =>
  (onSheet: string): string =>
    resolution.find((r) => r.onSheet.toLowerCase() === onSheet.trim().toLowerCase())
      ?.canonicalName ?? onSheet.trim()

/** Case-insensitive name lookup over any table whose records carry `name`. */
export const findByName = <R extends { readonly name: string }>(
  records: readonly R[],
  name: string,
): R | undefined => {
  const wanted = name.trim().toLowerCase()
  return records.find((r) => r.name.trim().toLowerCase() === wanted)
}
