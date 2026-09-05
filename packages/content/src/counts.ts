/**
 * How much content ships, readable at runtime.
 *
 * spec.md asks for counts readable from the build. The content half is
 * this function; the engine half is `labels:check`, which prints the
 * behaviour count. Both are also asserted in tests, so the number in a
 * report and the number on disk cannot drift apart.
 *
 * The registry is built from the same JSON imports the lookup modules
 * use, not from a filesystem walk: the app is bundled, and there is no
 * `fs` at runtime (agents.md rule 7). `content.test.ts` walks the
 * directory and asserts the two agree, which is what catches a file that
 * ships on disk but was never registered here.
 */
import martialArts from '../data/world/martial-arts.json'
import techniques from '../data/world/techniques.json'
import rituals from '../data/world/rituals.json'
import deities from '../data/world/deities.json'
import opponents from '../data/world/opponents.json'
import market from '../data/world/market.json'
import oracle from '../data/world/oracle.json'
import inspirations from '../data/world/inspirations.json'
import sparks from '../data/world/sparks.json'
import presets from '../data/world/presets.json'
import socialStatus from '../data/rules/social-status.json'
import finalBlow from '../data/rules/final-blow.json'
import unexpectedEvents from '../data/rules/unexpected-events.json'
import healing from '../data/rules/healing.json'
import xpCategories from '../data/rules/xp-categories.json'
import xpCosts from '../data/rules/xp-costs.json'
import region from '../data/rules/region.json'
import monastery from '../data/rules/monastery.json'
import distances from '../data/rules/distances.json'
import cityServices from '../data/rules/city-services.json'
import cityEncounters from '../data/rules/city-encounters.json'
import encounters from '../data/rules/encounters.json'
import treasures from '../data/rules/treasures.json'
import specialItems from '../data/rules/special-items.json'
import adventureHooks from '../data/campaigns/adventure-hooks.json'
import strings from '../data/app/strings.json'

/** The minimum every content file exposes for counting. */
type CountedFile = {
  readonly id: string
  readonly records: readonly unknown[]
}

/** Every content file that ships, in the order the package presents them. */
const registry: readonly CountedFile[] = Object.freeze([
  martialArts,
  techniques,
  rituals,
  deities,
  opponents,
  market,
  oracle,
  inspirations,
  sparks,
  presets,
  socialStatus,
  finalBlow,
  unexpectedEvents,
  healing,
  xpCategories,
  xpCosts,
  region,
  monastery,
  distances,
  cityServices,
  cityEncounters,
  encounters,
  treasures,
  specialItems,
  adventureHooks,
  strings,
])

/** What {@link contentCounts} reports. */
export type ContentCounts = {
  readonly files: number
  readonly records: number
  /** Record count per file id, so a report can name what grew. */
  readonly byFile: Readonly<Record<string, number>>
}

/** Count the shipped content. Pure; the registry is frozen and static. */
export const contentCounts = (): ContentCounts => ({
  files: registry.length,
  records: registry.reduce((sum, file) => sum + file.records.length, 0),
  byFile: Object.freeze(
    Object.fromEntries(registry.map((file) => [file.id, file.records.length])),
  ),
})
