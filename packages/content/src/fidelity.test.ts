/**
 * The fidelity leg of the content gate: the round trip from a data
 * file back to the concept it cites.
 *
 * `agents.md` rule 9.1 says "transcribe, don't paraphrase": a table's
 * cells, a Technique's effect, an area's description are copied
 * verbatim from the `docs/` concept. Until now nothing checked that.
 * The schema sees shape and `content.test.ts` sees counts; neither can
 * tell a transcription from a paraphrase. This spec can, mechanically:
 * every transcribed text field of every `label: rule` file must appear,
 * character for character, in the concept its `docs` pointer names.
 *
 * Player-facing text falls into exactly two categories here, and the
 * category is decided by the file's `label` and the field's name:
 *
 * - **transcribed** - a field of a `rule` file that is not in
 *   `AUTHORED_FIELDS`. Must round-trip to the concept. Printed spelling
 *   ("CHamber", "Giada") is kept, so a "fix" to the data that the book
 *   does not carry goes red here.
 * - **authored** - every field of a `reading` or `invention` file, and
 *   the fields named in `AUTHORED_FIELDS` on any file (the adventure
 *   format's `line`, the one field of ours on a printed area). These
 *   are the build's own words and have no source to round-trip to;
 *   they are counted, not compared.
 *
 * Matching normalises only what markdown adds around a transcription:
 * blockquote prefixes, footnote markers, curly quotes and line wrapping.
 * It never normalises the words.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

const here = fileURLToPath(new URL('.', import.meta.url))
const packageDir = join(here, '..')
const dataDir = join(packageDir, 'data')
const repoRoot = join(packageDir, '..', '..')

/**
 * The text-bearing record fields, by name. A field not listed here is
 * an address, a number, a reference or a flag, and is not text the
 * player reads. The list is the union over every record shape in
 * `schema/content.schema.json`; adding a text field to the schema means
 * adding it here, or it ships unchecked.
 */
const TEXT_FIELDS: readonly string[] = [
  'text', 'description', 'hint', 'effect', 'styleText', 'premise',
  'credits', 'blurb', 'name', 'word', 'action', 'object', 'trait',
  'connection', 'item', 'service', 'status', 'animal', 'attribute',
  'partial', 'full', 'category', 'increase', 'empty', 'ending',
  'condition', 'line', 'note', 'title', 'says', 'procedure',
]

/**
 * Fields that are the build's own words even inside a `rule` file.
 * `line` is the adventure format's one authored field
 * (`schema/adventure-format.md`: "`line` is the only authored field");
 * `note` and `title` are a menu option's framing, never a transcription.
 */
const AUTHORED_FIELDS: ReadonlySet<string> = new Set(['line', 'note', 'title'])

/**
 * Collapse what markdown adds around a transcription so the words can
 * be compared as words. Applied to both sides of every comparison.
 *
 * - `^> ` blockquote prefixes (the concepts quote printed prose)
 * - `[^adventure]`-style footnote markers (provenance, not text)
 * - curly quotes to straight (the extraction and the data disagree)
 * - any run of whitespace to one space (line wrapping)
 */
const normalise = (s: string): string =>
  s
    .replace(/^>\s?/gm, '')
    .replace(/\[\^[a-z0-9-]+\]/g, '')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()

/** Recursively list files under `dir` with the given extension, sorted. */
const walk = (dir: string, ext: string): readonly string[] =>
  readdirSync(dir)
    .flatMap((name) => {
      const full = join(dir, name)
      return statSync(full).isDirectory() ? walk(full, ext) : full.endsWith(ext) ? [full] : []
    })
    .sort()

/** One data file as parsed: what the two checks below need of it. */
type DataFile = {
  readonly rel: string
  readonly id: string
  readonly label: 'rule' | 'reading' | 'invention'
  readonly docs?: string
  readonly records: readonly Record<string, unknown>[]
}

/** One text field of one record, with where it came from. */
type TextField = {
  readonly file: string
  readonly recordId: string
  readonly field: string
  readonly text: string
}

const files: readonly DataFile[] = walk(dataDir, '.json').map((path) => ({
  ...(JSON.parse(readFileSync(path, 'utf-8')) as Omit<DataFile, 'rel'>),
  rel: relative(packageDir, path),
}))

/** Every non-empty text field of every record of `file`. */
const textFieldsOf = (file: DataFile): readonly TextField[] =>
  file.records.flatMap((record) =>
    TEXT_FIELDS.flatMap((field) => {
      const value = record[field]
      return typeof value === 'string' && value.trim().length > 0
        ? [{ file: file.rel, recordId: String(record.id), field, text: value }]
        : []
    }),
  )

/** The category a field falls in, from the file's label and the field's name. */
const categoryOf = (file: DataFile, field: string): 'transcribed' | 'authored' =>
  file.label === 'rule' && !AUTHORED_FIELDS.has(field) ? 'transcribed' : 'authored'

/** Split every text field of the package into the two categories. */
const partition = (): { transcribed: readonly TextField[]; authored: readonly TextField[] } =>
  files.reduce<{ transcribed: TextField[]; authored: TextField[] }>(
    (acc, file) => {
      for (const tf of textFieldsOf(file)) acc[categoryOf(file, tf.field)].push(tf)
      return acc
    },
    { transcribed: [], authored: [] },
  )

const { transcribed, authored } = partition()

describe('fidelity: transcribed text round-trips to its concept', () => {
  const ruleFiles = files.filter((f) => f.label === 'rule')

  it('gives every rule file a docs pointer to round-trip against', () => {
    const missing = ruleFiles.filter((f) => f.docs === undefined).map((f) => f.rel)
    expect(missing, `rule files with no docs pointer:\n${missing.join('\n')}`).toEqual([])
  })

  it.each(ruleFiles.map((f) => [f.rel, f] as const))('%s is verbatim in its concept', (_rel, file) => {
    const concept = normalise(readFileSync(join(repoRoot, file.docs ?? ''), 'utf-8'))
    const drift = textFieldsOf(file)
      .filter((tf) => categoryOf(file, tf.field) === 'transcribed')
      .filter((tf) => !concept.includes(normalise(tf.text)))
      .map((tf) => `  ${tf.recordId}.${tf.field}: ${normalise(tf.text).slice(0, 100)}`)
    expect(
      drift,
      `${file.rel} has text that is not in ${file.docs ?? '?'} (paraphrased, or the concept moved):\n${drift.join('\n')}`,
    ).toEqual([])
  })
})

describe('fidelity: readings resolve', () => {
  // A record marked `reading` says a cell was inferred, not printed; the
  // id it names must be defined in docs/rules/readings (docs-check
  // already proves each I-nn is defined once - this proves the data
  // names only ids that exist).
  const readingsDir = join(repoRoot, 'docs', 'rules', 'readings')
  // Same extraction as scripts/docs-check.test.ts: the first cell of a
  // table row defines every id it names (`A07 / I-07a` defines I-07a).
  const defined = new Set(
    walk(readingsDir, '.md')
      .flatMap((f) => [...readFileSync(f, 'utf-8').matchAll(/^\|\s*([^|\n]*?)\s*\|/gm)])
      .flatMap((row) => [...(row[1] ?? '').matchAll(/\b([RI])-?(\d{2}[a-z]?)\b/g)])
      .map((m) => `${m[1] ?? ''}-${m[2] ?? ''}`),
  )

  it('names only readings that docs/rules/readings defines', () => {
    const dangling = files
      .flatMap((f) => f.records.map((r) => [f.rel, String(r.id), r['reading']] as const))
      .filter(([, , reading]) => typeof reading === 'string' && !defined.has(reading))
      .map(([rel, id, reading]) => `${rel} ${id} -> ${String(reading)}`)
    expect(defined.size).toBeGreaterThan(0)
    expect(dangling, `readings not defined under docs/rules/readings:\n${dangling.join('\n')}`).toEqual([])
  })
})

describe('fidelity: the two categories', () => {
  it('categorises every text field, and prints the split the build reports', () => {
    const total = files.reduce((n, f) => n + textFieldsOf(f).length, 0)
    expect(transcribed.length + authored.length).toBe(total)
    expect(transcribed.length).toBeGreaterThan(0)
    expect(authored.length).toBeGreaterThan(0)
    console.log(
      `fidelity - ${transcribed.length} transcribed field(s) round-trip; ${authored.length} authored field(s) are ours`,
    )
  })
})
