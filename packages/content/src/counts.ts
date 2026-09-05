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
