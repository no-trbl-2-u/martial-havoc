/**
 * The content package's gate.
 *
 * This is the project's `data:validate` leg, folded into `npm test` as
 * `plan/bearings.md` states it: there is no separate validation script,
 * so if this file is green the data is shippable.
 *
 * Five things are checked, in rising order of specificity:
 *
 * 1. Every file under `data/` validates against the one JSON Schema in
 *    `schema/content.schema.json` (ajv, draft 2020-12, `allErrors` so a
 *    bad file reports every problem at once, not the first).
 * 2. Every record id is unique across the whole package, so a lookup can
 *    never be ambiguous.
 * 3. Every `docs` pointer resolves to a real file, so a renamed concept
 *    under `docs/` breaks the build rather than rotting silently.
 * 4. Every file holds exactly the number of records the book prints. A
 *    dropped cell is the failure mode transcription actually has, and the
 *    schema cannot see it - only a count can.
 * 5. Every d66 address is made of two real d6 faces (the schema can only
 *    bound it to 11..66, which would admit 17 or 40).
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import Ajv2020 from 'ajv/dist/2020'
import { describe, expect, it } from 'vitest'
import { contentCounts } from './counts'
import { appStrings, stringById, t } from './index'

const here = new URL('.', import.meta.url).pathname
const packageDir = join(here, '..')
const dataDir = join(packageDir, 'data')
const schemaDir = join(packageDir, 'schema')
const repoRoot = join(packageDir, '..', '..')

/**
 * How many records each file must hold, keyed by the file's `id`.
 *
 * These are the counts the rulebook prints, taken from the concept docs
 * under `docs/` (which carry them in their own "Notes" sections). The map
 * is exhaustive in both directions: a file whose id is missing here is a
 * failure, and an id here with no file is a failure. That is what makes a
 * half-transcribed table impossible to ship.
 */
const EXPECTED_RECORD_COUNTS: Readonly<Record<string, number>> = {
  'app.strings': 303,
  // The rules panel's notes: one per engine behaviour (the label leg
  // checks the pairing; this only pins the count).
  'app.behaviour-notes': 109,

  // The 5 Treasures: the nine foes as printed.
  'campaigns.the-5-treasures-foes': 9,

  // The world: the lists a Master is built from and the tables the
  // sandbox is rolled on.
  // The trail-head village: three locations and the trail out
  // (spec.md, Horizon - fixed data, not a printed table).
  'world.village': 4,

  'world.martial-arts': 18,
  'world.techniques': 36,
  'world.rituals': 36,
  'world.deities': 12,
  'world.opponents': 50,
  'world.market': 57,
  'world.oracle': 66,
  'world.inspirations': 72,
  'world.sparks': 216,
  'world.presets': 8,

  // Phase 4's authored lines: records of ours that point at the
  // transcribed ones. 72 + 66 here, 11 in the rules below, 149 in all.
  'world.effects': 72,
  'world.oracle-lines': 66,

  // The rules: the tables the procedures roll on.
  'rules.social-status': 5,
  'rules.final-blow': 18,
  'rules.unexpected-events': 11,
  'rules.unexpected-event-lines': 11,
  'rules.healing': 3,
  'rules.xp-categories': 5,
  'rules.xp-costs': 15,
  'rules.region': 30,
  'rules.monastery': 30,
  'rules.distances': 9,
  'rules.city-services': 11,
  'rules.city-encounters': 12,
  'rules.encounters': 55,
  'rules.treasures': 18,
  'rules.special-items': 11,

  // The campaign layer: what an adventure can be about.
  'campaigns.adventure-hooks': 36,

  // The 5 Treasures written in the adventure format (Phase 5). The
  // counts are the printed ones: 4 event rows, 8 areas, 17 encounter
  // bands, 13 LOOT bands, 5 treasures. The flags, the absence and the
  // acts are readings and inventions of this build, counted here so
  // one going missing is as red as a dropped table cell.
  'campaigns.the-5-treasures.adventure': 1,
  'campaigns.the-5-treasures.events': 4,
  'campaigns.the-5-treasures.areas': 8,
  'campaigns.the-5-treasures.encounters': 17,
  'campaigns.the-5-treasures.loot': 13,
  'campaigns.the-5-treasures.treasures': 5,
  'campaigns.the-5-treasures.flags': 4,
  'campaigns.the-5-treasures.absences': 1,
  'campaigns.the-5-treasures.acts': 5,
}

/** Recursively list files under `dir` with the given extension, sorted. */
const walk = (dir: string, ext: string): readonly string[] =>
  readdirSync(dir)
    .flatMap((name) => {
      const full = join(dir, name)
      return statSync(full).isDirectory() ? walk(full, ext) : full.endsWith(ext) ? [full] : []
    })
    .sort()

/** One content file as it sits on disk, with the path that found it. */
type LoadedFile = {
  readonly path: string
  readonly rel: string
  readonly parsed: {
    readonly id: string
    readonly kind: string
    readonly docs?: string
    readonly records: readonly { readonly id: string; readonly d66?: number }[]
  }
}

/** Parse every data file once; every test below reads this. */
const files: readonly LoadedFile[] = walk(dataDir, '.json').map((path) => ({
  path,
  rel: relative(packageDir, path),
  parsed: JSON.parse(readFileSync(path, 'utf-8')) as LoadedFile['parsed'],
}))

describe('the one schema', () => {
  // Compiled once for the whole file: ajv caches nothing across instances
  // and the schema is large enough that per-test compilation shows up.
  // `strict` catches schema mistakes (a misspelled keyword silently
  // validating everything); `allowUnionTypes` is the one relaxation it
  // needs, because a few printed cells genuinely hold more than one type
  // - an opponent's ATTACK is an integer, the string "2-4", or blank.
  const ajv = new Ajv2020({ allErrors: true, strict: true, allowUnionTypes: true })
  // `JSON.parse` is `any`; naming the shape ajv wants keeps the parse
  // honest without widening it to `unknown` (which ajv will not take).
  const schema = JSON.parse(
    readFileSync(join(schemaDir, 'content.schema.json'), 'utf-8'),
  ) as Record<string, unknown>
  const validate = ajv.compile(schema)

  it('compiles', () => {
    expect(typeof validate).toBe('function')
  })

  it.each(files.map((f) => [f.rel, f] as const))('%s validates', (_rel, file) => {
    const ok = validate(file.parsed)
    // Errors are rendered with the file path and the failing instance
    // path, because "must have required property id" on its own is
    // unactionable when 26 files are in play.
    const detail = (validate.errors ?? [])
      .map((e) => `  ${file.rel}${e.instancePath || '/'} ${e.message ?? ''}`)
      .join('\n')
    expect(ok, `${file.rel} failed schema validation:\n${detail}`).toBe(true)
  })
})

describe('the whole package', () => {
  it('gives every record a unique id', () => {
    const seen = new Map<string, string>()
    const clashes: string[] = []
    for (const file of files) {
      for (const record of file.parsed.records) {
        const first = seen.get(record.id)
        if (first !== undefined) clashes.push(`${record.id}: ${first} and ${file.rel}`)
        else seen.set(record.id, file.rel)
      }
    }
    expect(clashes, `duplicate record ids:\n${clashes.join('\n')}`).toEqual([])
  })

  it('gives every file a unique id', () => {
    const ids = files.map((f) => f.parsed.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('points every `docs` pointer at a file that exists', () => {
    const missing = files
      .filter((f) => f.parsed.docs !== undefined)
      .filter((f) => !existsSync(join(repoRoot, f.parsed.docs as string)))
      .map((f) => `${f.rel} -> ${f.parsed.docs as string}`)
    expect(missing, `dangling docs pointers:\n${missing.join('\n')}`).toEqual([])
  })

  it('holds exactly the records the book prints', () => {
    const wrong = files
      .map((f) => ({ file: f, expected: EXPECTED_RECORD_COUNTS[f.parsed.id] }))
      .filter(({ file, expected }) => expected !== file.parsed.records.length)
      .map(
        ({ file, expected }) =>
          `${file.rel} (${file.parsed.id}): ${file.parsed.records.length} records, expected ${
            expected === undefined ? 'an entry in EXPECTED_RECORD_COUNTS' : String(expected)
          }`,
      )
    expect(wrong, `record counts:\n${wrong.join('\n')}`).toEqual([])
  })

  it('ships every file the count map names', () => {
    const shipped = new Set(files.map((f) => f.parsed.id))
    const absent = Object.keys(EXPECTED_RECORD_COUNTS).filter((id) => !shipped.has(id))
    expect(absent, `expected but not shipped: ${absent.join(', ')}`).toEqual([])
  })

  it('builds every d66 address out of two real d6 faces', () => {
    const bad = files.flatMap((file) =>
      file.parsed.records
        .filter((r) => r.d66 !== undefined)
        .filter((r) => {
          const tens = Math.floor((r.d66 as number) / 10)
          const ones = (r.d66 as number) % 10
          return tens < 1 || tens > 6 || ones < 1 || ones > 6
        })
        .map((r) => `${file.rel}: ${r.id} has d66 ${String(r.d66)}`),
    )
    expect(bad, `impossible d66 addresses:\n${bad.join('\n')}`).toEqual([])
  })

  it('registers every file that ships, so contentCounts sees all of them', () => {
    // contentCounts() is built from static imports (the app is bundled;
    // there is no fs at runtime). This is the check that a file added to
    // data/ but never imported into counts.ts cannot ship unnoticed.
    const counts = contentCounts()
    const onDisk = Object.fromEntries(files.map((f) => [f.parsed.id, f.parsed.records.length]))
    expect(counts.byFile).toEqual(onDisk)
    expect(counts.files).toBe(files.length)
  })

  it('reports its size (the spec asks for counts readable from the build)', () => {
    const records = files.reduce((sum, f) => sum + f.parsed.records.length, 0)
    // The engine's half of this promise is `labels:check`, which prints
    // the behaviour count.
    console.log(`content - ${files.length} files, ${records} records`)
    expect(files.length).toBeGreaterThan(0)
    expect(records).toBeGreaterThan(0)
  })
})

describe('schema directory', () => {
  it('every schema file parses as JSON', () => {
    for (const file of walk(schemaDir, '.json')) {
      expect(() => JSON.parse(readFileSync(file, 'utf-8'))).not.toThrow()
    }
  })
})

describe('string lookup', () => {
  it('returns the shipped text for a known id', () => {
    expect(t('app.title')).toBe('Martial Havoc')
    expect(appStrings.find((r) => r.id === 'app.licence')?.text).toContain('CC BY-SA 4.0')
  })

  it('never crashes on an unknown id; it shows the id', () => {
    expect(stringById([])('nope')).toBe('[nope]')
  })
})
