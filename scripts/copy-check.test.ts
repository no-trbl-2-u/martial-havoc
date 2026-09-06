/**
 * The copy leg of the verify gate - runs inside `npm run test` as the
 * `copy` Vitest project (see vitest.config.mts).
 *
 * `agents.md` rule 7: "No hardcoded copy in components: authored lines,
 * table cells and UI strings are data files in `packages/content`, each
 * with a citation." Until now that rule was prose. This spec is the
 * rule made mechanical: it reads every source file under `apps/app/src`
 * as text and is red on anything a player could read that did not come
 * through `t()` from `packages/content`.
 *
 * Three shapes of hardcoded copy are caught:
 *
 *   1. JSX text nodes - `<Text>Roll again</Text>`;
 *   2. string props that render - `label="SKL"`, `placeholder="Name"`;
 *   3. string or template literals of three or more words - the
 *      sentence hidden in a helper, `Overspent by ${n} (R10).`
 *
 * What is not copy, and is skipped: test files (fixtures are not
 * shipped), `theme/` (font stacks and tokens), comments, and any literal
 * without three consecutive words (an id like `creation.roll`, a
 * testID, a style key). A literal that is genuinely not copy but trips
 * the third shape goes in `ALLOWED`, with the reason beside it.
 *
 * It lives at the root for the same reason `docs-check.test.ts` does:
 * it reads the filesystem, and the app's tsconfig is Expo's, which
 * carries no node types.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(new URL('..', import.meta.url).pathname)
const srcDir = join(root, 'apps', 'app', 'src')

/**
 * Literals that match the third shape but are not player-facing copy.
 * Keyed by the exact literal body; the value is why it is allowed.
 * Empty on the day this leg shipped; every addition is a decision.
 */
const ALLOWED: Readonly<Record<string, string>> = {
  '-apple-system, Arial, sans-serif':
    'RegionScreen: the SVG font-family stack for the map labels; a CSS value, not words a player reads',
}

/** The props whose string value is rendered to the player. */
const RENDERED_PROPS = [
  'label', 'title', 'note', 'text', 'placeholder', 'caption', 'hint',
  'accessibilityLabel', 'accessibilityHint',
]

/** Recursively list files under `dir` with any of the given extensions. */
const walk = (dir: string, exts: readonly string[]): readonly string[] =>
  readdirSync(dir)
    .flatMap((name) => {
      const full = join(dir, name)
      return statSync(full).isDirectory()
        ? walk(full, exts)
        : exts.some((e) => full.endsWith(e))
          ? [full]
          : []
    })
    .sort()

/** Source files the leg reads: shipped `.ts`/`.tsx`, not tests, not theme. */
const sources = walk(srcDir, ['.ts', '.tsx']).filter(
  (f) => !/\.test\.tsx?$/.test(f) && !f.includes(`${join('src', 'theme')}/`),
)

/**
 * Blank out comments so a sentence in a doc block is not mistaken for
 * copy. Block comments go whole; a line comment is a line whose first
 * non-space characters are `//` (a `//` inside a string - a URL - is
 * kept, because the line does not start with it). Newlines inside a
 * comment are kept so every finding's line number is the file's own.
 */
const stripComments = (text: string): string =>
  text
    .replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '))
    .replace(/^\s*\/\/.*$/gm, '')

/** Three or more words in a row: the signature of a sentence, not an id. */
const looksLikeCopy = (s: string): boolean =>
  /[A-Za-z]{2,}(?:[,.!?:;']*\s+[A-Za-z][A-Za-z',.!?:;]*){2,}/.test(s)

/** One finding: where, which shape, and the offending text. */
type Finding = { readonly file: string; readonly line: number; readonly shape: string; readonly text: string }

/** Line number (1-based) of a character offset in `text`. */
const lineOf = (text: string, offset: number): number => text.slice(0, offset).split('\n').length

/** JSX text nodes: `>words words words<` on one line, with no expression in them. */
const jsxTextNodes = (text: string): readonly Omit<Finding, 'file'>[] =>
  [...text.matchAll(/>([^<>{}\n]*[A-Za-z][^<>{}\n]*)</g)]
    .filter((m) => looksLikeCopy(m[1] ?? ''))
    .map((m) => ({ line: lineOf(text, m.index ?? 0), shape: 'jsx-text', text: (m[1] ?? '').trim() }))

/** Rendered props given a string literal: `label="SKL"`. */
const renderedProps = (text: string): readonly Omit<Finding, 'file'>[] =>
  [...text.matchAll(new RegExp(`\\b(${RENDERED_PROPS.join('|')})=(["'])([^"'\\n]*[A-Za-z][^"'\\n]*)\\2`, 'g'))]
    .map((m) => ({ line: lineOf(text, m.index ?? 0), shape: `prop:${m[1] ?? ''}`, text: m[3] ?? '' }))

/** String and template literals that read as a sentence. */
const sentenceLiterals = (text: string): readonly Omit<Finding, 'file'>[] =>
  [...text.matchAll(/(['"`])((?:\\.|(?!\1)[^\\\n])*)\1/g)]
    .filter((m) => looksLikeCopy(m[2] ?? ''))
    .filter((m) => !((m[2] ?? '') in ALLOWED))
    .map((m) => ({ line: lineOf(text, m.index ?? 0), shape: 'literal', text: m[2] ?? '' }))

/** Every finding in one file. */
const findingsIn = (file: string): readonly Finding[] => {
  const text = stripComments(readFileSync(file, 'utf-8'))
  const rel = relative(root, file)
  return [...jsxTextNodes(text), ...renderedProps(text), ...sentenceLiterals(text)].map((f) => ({ ...f, file: rel }))
}

describe('copy-check: no hardcoded copy in the app (agents.md rule 7)', () => {
  it('reads a non-empty app', () => {
    expect(sources.length).toBeGreaterThan(0)
  })

  it.each(sources.map((f) => [relative(root, f), f] as const))('%s carries no copy of its own', (_rel, file) => {
    const found = findingsIn(file).map((f) => `  ${f.file}:${f.line} [${f.shape}] ${f.text}`)
    expect(
      found,
      `hardcoded copy - move it to packages/content/data/app/strings.json and read it with t():\n${found.join('\n')}`,
    ).toEqual([])
  })

  it('allows nothing it does not explain', () => {
    for (const [literal, reason] of Object.entries(ALLOWED)) {
      expect(reason.length, `ALLOWED[${literal}] has no reason`).toBeGreaterThan(0)
    }
  })
})
