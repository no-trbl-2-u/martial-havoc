/**
 * The docs leg of the verify gate — runs inside `npm run test` as the
 * `docs` Vitest project (see vitest.config.mts).
 *
 * Phase 1b (the decomposition) promises that every concept under docs/
 * is OKF v0.2 (frontmatter with `type`, provenance in `sources`, trust
 * in `generated`) and cites the book. This spec is that promise made
 * mechanical: it is red on a missing citation exactly as labels:check
 * is red on an unlabelled behaviour.
 *
 * Checks, per docs/**\/*.md (docs/sources/*.txt are provenance, not
 * concepts, and are skipped):
 *   1. frontmatter parses as YAML;
 *   2. type, title, description, cite are non-empty strings;
 *   3. sources is a non-empty list of {id, resource}; each resource
 *      path resolves relative to the file;
 *   4. generated.by and generated.at are present;
 *   5. every relative markdown link resolves to an existing file;
 *   6. every index.md lists every sibling .md and every subdirectory;
 *   7. rule ids (R-nn) and reading ids (I-nn) are defined once each
 *      across docs/rules (a table row starting with the id defines it).
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { parse as parseYaml } from 'yaml'
import { describe, expect, it } from 'vitest'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const docsDir = join(root, 'docs')

/** Recursively list files under `dir` ending in `ext`. */
const walk = (dir: string, ext: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    return statSync(full).isDirectory() ? walk(full, ext) : full.endsWith(ext) ? [full] : []
  })

/** Split a markdown file into { frontmatter (parsed), body }. */
const readConcept = (file: string): { data: Record<string, unknown> | null; body: string } => {
  const text = readFileSync(file, 'utf-8')
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!m) return { data: null, body: text }
  return { data: parseYaml(m[1] ?? '') as Record<string, unknown>, body: m[2] ?? '' }
}

/** Relative markdown link targets in a body (ignores http(s), mailto, anchors). */
const relativeLinks = (body: string): string[] =>
  [...body.matchAll(/\]\(([^)\s]+)\)/g)]
    .map((m) => m[1] ?? '')
    .filter((t) => t && !/^(https?:|mailto:|#)/.test(t))
    .map((t) => t.replace(/#.*$/, ''))
    .filter((t) => t.length > 0)

// docs/sources/ holds provenance copied verbatim from elsewhere (the
// estate's inventory keeps the estate's own frontmatter); only its
// index.md is a concept of this bundle.
const sources = join(docsDir, 'sources')
const concepts = walk(docsDir, '.md').filter(
  (f) => !f.startsWith(sources + sep) || f === join(sources, 'index.md'),
)
const rel = (f: string) => relative(root, f)

describe('docs are OKF concepts', () => {
  it('there is a docs bundle with a root index', () => {
    expect(concepts.length).toBeGreaterThan(0)
    expect(existsSync(join(docsDir, 'index.md'))).toBe(true)
  })

  it.each(concepts.map((f) => [rel(f), f] as const))('%s has conformant frontmatter', (_label, file) => {
    const { data } = readConcept(file)
    expect(data, 'frontmatter block').not.toBeNull()
    const d = data as Record<string, unknown>
    for (const key of ['type', 'title', 'description', 'cite'] as const) {
      expect(typeof d[key], key).toBe('string')
      expect((d[key] as string).length, key).toBeGreaterThan(0)
    }
    const sources = d['sources']
    expect(Array.isArray(sources) && sources.length > 0, 'sources non-empty').toBe(true)
    for (const s of sources as Record<string, unknown>[]) {
      expect(typeof s['id'], 'source id').toBe('string')
      expect(typeof s['resource'], 'source resource').toBe('string')
      const target = resolve(dirname(file), s['resource'] as string)
      expect(existsSync(target), `source resolves: ${String(s['resource'])}`).toBe(true)
    }
    const generated = d['generated'] as Record<string, unknown> | undefined
    expect(typeof generated?.['by'], 'generated.by').toBe('string')
    expect(generated?.['at'], 'generated.at').toBeTruthy()
  })

  it.each(concepts.map((f) => [rel(f), f] as const))('%s links resolve', (_label, file) => {
    const { body } = readConcept(file)
    const broken = relativeLinks(body).filter((t) => !existsSync(resolve(dirname(file), t)))
    expect(broken, 'broken relative links').toEqual([])
  })

  const indexes = concepts.filter((f) => f.endsWith('/index.md'))
  it.each(indexes.map((f) => [rel(f), f] as const))('%s lists every sibling', (_label, file) => {
    const dir = dirname(file)
    const { body } = readConcept(file)
    const linked = new Set(relativeLinks(body).map((t) => resolve(dir, t)))
    const missing = readdirSync(dir)
      .filter((name) => name !== 'index.md' && !name.startsWith('.'))
      .filter((name) => {
        const full = join(dir, name)
        if (statSync(full).isDirectory()) {
          return !(linked.has(full) || linked.has(join(full, 'index.md')))
        }
        if (!name.endsWith('.md')) return false // provenance files are listed by prose, not links
        return !linked.has(full)
      })
    expect(missing, 'siblings not listed in index').toEqual([])
  })

  it('rule ids R-nn and reading ids I-nn are each defined once', () => {
    const defs = new Map<string, string[]>()
    for (const file of concepts.filter((f) => f.includes('/docs/rules/'))) {
      const { body } = readConcept(file)
      // A definition is an id in the FIRST cell of a table row: `| R31 |`
      // or the readings' `| A09 / I-12 |`. Suffixed ids (I-07a) are their
      // own ids. Mentions elsewhere in a row are references, not definitions.
      for (const row of body.matchAll(/^\|\s*([^|\n]*?)\s*\|/gm)) {
        const cell = row[1] ?? ''
        for (const idMatch of cell.matchAll(/\b([RI])-?(\d{2}[a-z]?)\b/g)) {
          const id = `${idMatch[1]}-${idMatch[2]}`
          defs.set(id, [...(defs.get(id) ?? []), rel(file)])
        }
      }
    }
    const duplicates = [...defs.entries()].filter(([, files]) => new Set(files).size > 1)
    expect(duplicates, 'ids defined in more than one file').toEqual([])
  })
})
