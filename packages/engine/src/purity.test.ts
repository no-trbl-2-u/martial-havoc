/**
 * The two rules that make this package an engine rather than an app,
 * enforced by reading its own source.
 *
 * Both are agents.md standing rule 7. They are checked by grep rather
 * than by type, because the type system cannot see either: a value
 * import of the content package typechecks fine, and `Math.random()`
 * has exactly the type a die needs.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

const srcDir = join(new URL('.', import.meta.url).pathname)

/** Every non-test TypeScript file in the engine's source. */
const sourceFiles = (dir: string): readonly string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) return sourceFiles(full)
    return full.endsWith('.ts') && !full.endsWith('.test.ts') ? [full] : []
  })

/**
 * Source with comments removed.
 *
 * Both checks below are greps, and both of the things they look for are
 * named in the prose that explains why they are forbidden. Stripping
 * comments first is what lets the documentation say "Math.random" out
 * loud without tripping the rule it is describing.
 */
const withoutComments = (text: string): string =>
  text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')

const files = sourceFiles(srcDir).map((path) => ({
  rel: relative(srcDir, path),
  text: withoutComments(readFileSync(path, 'utf-8')),
}))

describe('the greps these checks rely on', () => {
  it('still sees code after comments are stripped', () => {
    // A stripper that ate everything would make both rules below pass
    // vacuously for ever. This is the check that they are real.
    expect(files.length).toBeGreaterThan(0)
    expect(files.some((f) => f.text.includes('export const'))).toBe(true)
    expect(withoutComments('/** Math.random */ const a = 1')).not.toContain('Math.random')
    expect(withoutComments('const a = Math.random')).toContain('Math.random')
    expect(withoutComments("import type { X } from '@martial-havoc/content'")).toContain(
      '@martial-havoc/content',
    )
  })
})

describe('the engine rolls no dice of its own', () => {
  it('never reaches for Math.random', () => {
    const offenders = files.filter((f) => f.text.includes('Math.random')).map((f) => f.rel)
    expect(
      offenders,
      `dice are injected, never generated here: ${offenders.join(', ')}`,
    ).toEqual([])
  })
})

describe('the engine imports content as types only', () => {
  it('has no value import of @martial-havoc/content', () => {
    // `import type { X } from '@martial-havoc/content'` is allowed and
    // erases at compile time; a plain `import { x } from ...` would bind
    // the tables into the engine instead of letting a caller inject
    // them, and would stop Phase 5 handing it an adventure's tables the
    // same way.
    const offenders = files
      .filter((f) =>
        f.text
          .split('\n')
          .some(
            (line) =>
              line.includes('@martial-havoc/content') &&
              !line.trimStart().startsWith('import type'),
          ),
      )
      .map((f) => f.rel)
    expect(
      offenders,
      `tables are injected, never imported: ${offenders.join(', ')}`,
    ).toEqual([])
  })
})
