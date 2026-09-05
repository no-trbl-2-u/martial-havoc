/**
 * The content package's gate: every data file parses, every record
 * carries a citation, every schema file (once any exist) parses.
 * This is the project's `data:validate` leg, folded into `npm test`
 * as plan/bearings.md states it.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { appStrings, stringById, t } from './index'

const here = new URL('.', import.meta.url).pathname
const dataDir = join(here, '..', 'data')
const schemaDir = join(here, '..', 'schema')

/** Recursively list files under `dir` with the given extension. */
const walk = (dir: string, ext: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    return statSync(full).isDirectory() ? walk(full, ext) : full.endsWith(ext) ? [full] : []
  })

describe('content data files', () => {
  const files = walk(dataDir, '.json')

  it('there is at least one data file', () => {
    expect(files.length).toBeGreaterThan(0)
  })

  it.each(files)('%s parses and every record carries id, text/value and cite', (file) => {
    const parsed = JSON.parse(readFileSync(file, 'utf-8')) as { records?: unknown[] }
    expect(Array.isArray(parsed.records)).toBe(true)
    for (const record of parsed.records ?? []) {
      const r = record as Record<string, unknown>
      expect(typeof r['id'], `${file}: id`).toBe('string')
      expect(typeof r['cite'], `${file}: cite on ${String(r['id'])}`).toBe('string')
      expect((r['cite'] as string).length).toBeGreaterThan(0)
    }
  })
})

describe('content schemas', () => {
  it('every schema file parses as JSON (vacuous until Phase 2)', () => {
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
