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
import { join, relative, sep } from 'node:path'
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

/**
 * The printed spans and the printed spelling (Phase 10k).
 *
 * The round trip above proves a cell's *words* are the book's. It
 * cannot prove a cell is under the right die face, because a merged
 * cell in the PDF flattens to one word in every extraction: "Normal"
 * appears in `docs/world/oracle.md` whether the app reads it on a 3 or
 * on a 4. Nor can it prove that a defect the book actually prints has
 * survived a well-meaning tidy: "Giada" round-trips against the doc,
 * and so would "Giada" corrected to "Jade" if someone corrected both.
 *
 * So these two cases pin the two things the round trip is blind to,
 * face by face and character by character. A normalised cell goes red
 * here, which is the point: standing rule 9.1 is "transcribe, don't
 * paraphrase", and a transcription that has been improved is no longer
 * one.
 */

/** The eleven rows of MH p.58, one word per die face, spans expanded. */
const ORACLE_SPANS: Readonly<Record<string, readonly [string, string, string, string, string, string]>> = {
  'Closed Question': ['No, and', 'No', 'No, but', 'Yes, but', 'Yes', 'Yes, and'],
  Outcome: ['Disaster', 'Negative', 'Negative', 'Positive', 'Positive', 'Excellent'],
  'NPC reaction': ['Hostile', 'Wary', 'Unaware', 'Kind', 'Helpful', 'Flee'],
  'Creature Reaction': ['Hostile', 'Territorial', 'Unaware', 'Curious', 'Docile', 'Flee'],
  'Encounter Outcome': [
    'Ambush',
    'Attack',
    'Attack',
    'Attack',
    'NPC/Creature Reaction',
    'NPC/Creature Reaction',
  ],
  'Enemy Type': ['Minion', 'Subordinate', 'Subordinate', 'Warrior', 'Warrior', 'Boss'],
  'No. of enemies': ['1d6', '3', '3', '2', '2', '1'],
  // Normal is merged across 1-4 and Special across 5-6, read off the
  // rendered page rather than off the flattened extraction; see the
  // commit that corrected docs/world/oracle.md.
  'Enemy attack': ['Normal', 'Normal', 'Normal', 'Normal', 'Special', 'Special'],
  Door: ['Open', 'Open', 'Open', 'Trapped', 'Locked', 'Closed'],
  'Object amount': [
    'Finished',
    'One more',
    'One more',
    'Many remaining',
    'Many remaining',
    'Many remaining',
  ],
  Value: ['5 GP', '10 GP', '25 GP', '50 GP', '100 GP', '250 GP'],
}

/**
 * What the book prints that a proofreader would want to change, and
 * where the data has to keep printing it. Each entry names the file,
 * the record and the field, so a red case says which cell was tidied.
 */
const PRINTED_DEFECTS: readonly {
  readonly why: string
  readonly file: string
  readonly recordId: string
  readonly field: string
  readonly value: unknown
}[] = [
  // MH p.67 spells the wandering swordsman "Yauxia"; p.79 spells the
  // same word "Youxia". The encounter matrix carries p.67's spelling.
  { why: 'MH p.67 "Yauxia" (p.79 spells it "Youxia")', file: 'data/rules/encounters.json', recordId: 'encounter.non-urban.11', field: 'printed', value: 'Yauxia' },
  // MH p.74 prints no ATTACK for Huang Feng Guai. Null is the blank;
  // a 1 invented to fill the column would be the build's number.
  { why: 'MH p.74 prints no ATTACK for Huang Feng Guai', file: 'data/world/opponents.json', recordId: 'opponent.huang-feng-guai', field: 'attack', value: null },
  // MH p.71 prints the Brawler's ATTACK as a range where every other
  // block prints one number.
  { why: 'MH p.71 prints the Brawler\'s ATTACK as "2-4"', file: 'data/world/opponents.json', recordId: 'opponent.brawler', field: 'attack', value: '2-4' },
  // MH p.68, Treasures, row 5 of the 17-19 band: "2d6" with no unit,
  // where every neighbouring cell says "GP".
  { why: 'MH p.68 Treasures 17-19 row 5 prints "2d6 + Common Item", no unit', file: 'data/rules/treasures.json', recordId: 'treasure.17-19.5', field: 'text', value: '2d6 + Common Item' },
]

describe('fidelity: the printed spans and the printed spelling', () => {
  const oracle = files.find((f) => f.rel.endsWith(join('world', 'oracle.json')))

  it('reads every Oracle row on the face the page prints it under', () => {
    expect(oracle, 'data/world/oracle.json is missing').toBeDefined()
    const cells = new Map(
      (oracle?.records ?? []).map((r) => [`${String(r['row'])}/${String(r['face'])}`, String(r['text'])]),
    )
    const wrong = Object.entries(ORACLE_SPANS).flatMap(([row, faces]) =>
      faces.flatMap((want, i) => {
        const got = cells.get(`${row}/${String(i + 1)}`)
        return got === want ? [] : [`${row} on a ${String(i + 1)}: expected ${want}, data has ${String(got)}`]
      }),
    )
    expect(wrong, `Oracle cells under the wrong face:\n${wrong.join('\n')}`).toEqual([])
    expect(cells.size).toBe(Object.keys(ORACLE_SPANS).length * 6)
  })

  it.each(PRINTED_DEFECTS.map((d) => [d.why, d] as const))('keeps what the book prints: %s', (_why, defect) => {
    const file = files.find((f) => f.rel === defect.file.split('/').join(sep))
    expect(file, `${defect.file} is missing`).toBeDefined()
    const record = (file?.records ?? []).find((r) => String(r['id']) === defect.recordId)
    expect(record, `${defect.file} has no record ${defect.recordId}`).toBeDefined()
    expect(record?.[defect.field]).toStrictEqual(defect.value)
  })

  // "SKILLS 9" is a heading defect of the printed opponent block, not
  // a value any record carries: the data holds `skill: 9` like every
  // other block. So it is pinned where it lives, in the concept.
  it('keeps MH p.74\'s "SKILLS 9" in the opponents concept', () => {
    const concept = readFileSync(join(repoRoot, 'docs', 'world', 'opponents.md'), 'utf-8')
    expect(concept).toContain('SKILLS 9')
  })

  // "CHamber" (MH p.92) and "Giada" (MH p.62) are printed inside word
  // tables the player reads a cell of at a time; both are pinned by
  // presence in the file that carries them.
  it.each([
    ['CHamber', 'MH p.92', 'data/world/presets.json'],
    ['Giada', 'MH p.62', 'data/world/sparks.json'],
  ])('keeps %s (%s) in %s', (word, _folio, rel) => {
    const file = files.find((f) => f.rel === rel.split('/').join(sep))
    expect(file, `${rel} is missing`).toBeDefined()
    expect(JSON.stringify(file?.records)).toContain(word)
  })
})
