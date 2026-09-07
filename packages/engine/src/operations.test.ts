/**
 * Every `operation` in `effects.json` names an engine call that exists.
 *
 * `packages/content` classifies each of the 72 Technique and Ritual
 * effects (A23) and, where the class implies machinery, records the
 * engine call it implies as `"<folder>.<export>"`. That string is
 * ordinary data: nothing links it to the engine, so a rename on this
 * side leaves the content pointing at nothing and no test notices.
 *
 * This is that test, and it lives here rather than in
 * `packages/content` for one reason: the engine may import the content
 * package (it already does, for the adventure tables), and the content
 * package may not import the engine. Only this side can see both.
 *
 * The check has two halves, because half a check would pass on a lie:
 *
 * 1. The export name is on the engine's **public surface** — a value
 *    export of `./index.ts`, not a type and not an internal.
 * 2. The folder segment is the folder that export actually comes from,
 *    read out of `index.ts`'s own re-export statements. `combat.heal`
 *    would otherwise pass on the strength of `healing.heal`.
 *
 * A narrative-only effect carries `operation: null` and is skipped —
 * that is the field's documented "no engine call" value, not a gap.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { effects } from '@martial-havoc/content'
import * as engine from './index'

/** `index.ts` as text — the surface's own source, read once. */
const indexSource = readFileSync(fileURLToPath(new URL('./index.ts', import.meta.url)), 'utf8')

/**
 * Every value re-export of `index.ts`, mapped to the folder it is from.
 *
 * Matches `export { a, b } from './folder/file'`, across newlines, and
 * skips `export type { ... }` — a type is not a call, and an operation
 * naming one would be a data error this test must still catch.
 *
 * Built by folding the matches rather than mutating a map, so the
 * result is a plain frozen record with no construction order to reason
 * about (agents.md rule 7: the engine stays pure, tests included).
 */
const folderOfExport: Readonly<Record<string, string>> = Object.freeze(
  Array.from(
    indexSource.matchAll(/export\s+(type\s+)?\{([^}]*)\}\s+from\s+'\.\/([^/']+)\/[^']+'/g),
  )
    .filter(([, isType]) => isType === undefined)
    .flatMap(([, , names, folder]) =>
      (names ?? '')
        .split(',')
        .map((name) => name.trim())
        // `a as b` re-exports under b; the surface name is what data cites.
        .map((name) => name.split(/\s+as\s+/).at(-1)?.trim() ?? '')
        .filter((name) => name.length > 0)
        .map((name) => [name, folder ?? ''] as const),
    )
    .reduce<Record<string, string>>((acc, [name, folder]) => ({ ...acc, [name]: folder }), {}),
)

/** The `<folder>.<export>` strings the content package actually ships. */
const operations: readonly string[] = effects
  .map((effect) => effect.operation)
  .filter((operation): operation is string => operation !== null)

describe('effects.json operations resolve against the engine (A23)', () => {
  it('parses a public surface to check against — the regex still matches index.ts', () => {
    // A guard on the guard: if `index.ts` ever changes its re-export
    // shape, the map silently empties and every check below passes
    // vacuously. This is the canary.
    expect(Object.keys(folderOfExport).length).toBeGreaterThan(50)
    expect(folderOfExport['resolveRound']).toBe('combat')
    expect(folderOfExport['heal']).toBe('healing')
    // A type-only re-export is not a call and must not be in the map.
    expect(folderOfExport['RoundOutcome']).toBeUndefined()
  })

  it('has operations to check — the content package still ships some', () => {
    expect(operations.length).toBeGreaterThan(0)
  })

  it('names an export that exists on the engine surface', () => {
    for (const operation of operations) {
      const name = operation.split('.').at(-1) ?? ''
      expect(Object.keys(engine), operation).toContain(name)
    }
  })

  it('names the folder that export is actually from', () => {
    for (const operation of operations) {
      const [folder, name] = operation.split('.')
      expect(folderOfExport[name ?? ''], operation).toBe(folder)
    }
  })

  it('is a callable function, not an exported constant', () => {
    // Every `operation` is documented as "the engine call the class
    // implies". A table (`CAPS`, `XP_CATEGORIES`) is not a call, and
    // pointing at one would be a classification error the shape check
    // above cannot see.
    for (const operation of operations) {
      const name = operation.split('.').at(-1) ?? ''
      expect(typeof (engine as Record<string, unknown>)[name], operation).toBe('function')
    }
  })
})
