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
 *   2. string props that render - `label="SKL"`, `placeholder="Name"`
 *      (a single lowercase token is a key, not copy, and is skipped);
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
import { fileURLToPath } from 'node:url'
import { join, relative, resolve, sep } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
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
  (f) => !/\.test\.tsx?$/.test(f) && !f.includes(join('src', 'theme') + sep),
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

/**
 * A prop value that is a key, not copy: one lowercase identifier-like
 * token (`label="invention"` picks the Pill's look and its content
 * string by id). Copy is never a single lowercase token; `SKL` and
 * `Roll again` both fail this test and are caught.
 */
const isKeyToken = (s: string): boolean => /^[a-z][a-z0-9-]*$/.test(s)

/** Rendered props given a string literal: `label="SKL"`. */
const renderedProps = (text: string): readonly Omit<Finding, 'file'>[] =>
  [...text.matchAll(new RegExp(`\\b(${RENDERED_PROPS.join('|')})=(["'])([^"'\\n]*[A-Za-z][^"'\\n]*)\\2`, 'g'))]
    .filter((m) => !isKeyToken(m[3] ?? ''))
    .map((m) => ({ line: lineOf(text, m.index ?? 0), shape: `prop:${m[1] ?? ''}`, text: m[3] ?? '' }))

/**
 * A citation written into a component instead of read from the data
 * (the fourth shape; `plan/CRITIQUE.md`, the copy leg row).
 *
 * The first three shapes are about sentences, and a citation is not
 * one: `cite="I-30"` and `cite: 'MH p.6'` are both under the
 * three-word threshold, so all three hardcoded citations of Phase 10d
 * shipped green and were caught only by reading the diff. One of them
 * (`cite="MH p.28 · R33 · I-33"`) was over the threshold and still
 * passed, so the threshold was never the only hole.
 *
 * A citation is the exact class of string standing rule 7 exists for:
 * it is the thing that says where a rule came from, and a component
 * that invents one is a component asserting the book said something.
 * So the rule here has no judgement in it at all - a `cite` prop or a
 * `cite:` field may not be given a string literal. `t(...)`, a value
 * off the engine's registry, or a variable are all fine.
 *
 * A template built only out of interpolations is fine too: what is
 * checked is whether any letter or digit survives with the `${...}`
 * groups removed, so `` cite={`${t('a')} · ${t('b')}`} `` passes and
 * `` cite={`MH p.${n}`} `` does not.
 */
const CITE_VALUE = /\bcite\s*[:=]\s*\{?\s*(['"`])((?:\\.|(?!\1)[^\\])*)\1/g

/**
 * The literal text of a template, with every `${...}` group removed.
 *
 * The second replace handles a nested template: a regex cannot match
 * balanced backticks, so `` cite={`${t('a')} ${t(`b.${x}`)}`} `` is
 * captured only as far as the inner backtick and leaves a dangling
 * `${t(` behind. Dropping an unterminated trailing interpolation is
 * what makes that case read as "nothing outside the interpolations",
 * which is what it is. A citation with real text in it still has that
 * text before the dangling fragment, so nothing hides behind this.
 */
const outsideInterpolations = (s: string): string =>
  s.replace(/\$\{[^}]*\}/g, '').replace(/\$\{[^}]*$/, '')

const citeLiterals = (text: string): readonly Omit<Finding, 'file'>[] =>
  [...text.matchAll(CITE_VALUE)]
    .filter((m) => /[A-Za-z0-9]/.test(outsideInterpolations(m[2] ?? '')))
    .map((m) => ({ line: lineOf(text, m.index ?? 0), shape: 'cite', text: m[2] ?? '' }))

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
  return [...jsxTextNodes(text), ...renderedProps(text), ...citeLiterals(text), ...sentenceLiterals(text)].map(
    (f) => ({ ...f, file: rel }),
  )
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

/**
 * The fourth shape, proved against the exact strings that got past the
 * first three.
 *
 * The leg above is a sweep over the shipped app: it goes green the
 * moment the app is clean and says nothing about whether the rule
 * would still catch anything. These cases are the rule itself, held to
 * the three citations Phase 10d shipped and to the two forms that are
 * legitimate - so a later simplification of the regex that quietly
 * stops matching is red here rather than silently permissive.
 */
describe('copy-check: a citation is never written into a component', () => {
  const found = (line: string) => citeLiterals(line).map((f) => f.text)

  it.each([
    // The three that shipped green on 2c528b9 (Phase 10d).
    ['<Source cite="I-30" />', 'I-30'],
    ["const r = { cite: 'MH p.6' }", 'MH p.6'],
    ['<Source cite="MH p.28 · R33 · I-33" />', 'MH p.28 · R33 · I-33'],
    // The two the village carried until this tick.
    ["{ roll: null, cite: 'MH p.52-55' }", 'MH p.52-55'],
    // Braces and backticks are the same rule.
    ['<Source cite={"MH p.66"} />', 'MH p.66'],
    ['<Source cite={`MH p.${n}`} />', 'MH p.${n}'],
  ])('catches %s', (line, text) => {
    expect(found(line)).toEqual([text])
  })

  it.each([
    // Read from the data: the whole point.
    ["<Source cite={t('ui.combat.spirit.cite')} />", 'a t() call'],
    ["const r = { cite: t('ui.village.market.source') }", 'a t() call in a field'],
    // Built out of interpolations only, including a nested template.
    ['<Source cite={`${t(`a.${x}`)} · ${t("b")}`} />', 'interpolations only'],
    // A variable, or a value off the engine's registry.
    ['<Source cite={cite} />', 'a variable'],
    ['<Source cite={citeOf(id)} />', 'the registry'],
  ])('allows %s (%s)', (line) => {
    expect(found(line)).toEqual([])
  })
})
