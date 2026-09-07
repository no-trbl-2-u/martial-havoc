/**
 * The voice gate: every line the app speaks in its own voice, held to
 * `plan/VOICE.md`.
 *
 * Phase 10a gave the app a narrator — Old Ping, the shuoshu of Fen Pass
 * — and with him a style guide with hard edges. This file is the edge.
 * A line that breaks a rule here is a red test, not a matter of taste
 * (VOICE.md, preamble).
 *
 * **What counts as a narrator line.** Exactly three sets, because
 * VOICE.md names exactly three ("One line per result kind, in
 * `packages/content/data/app/result-lines.json` and the `line` fields of
 * the adventure files"):
 *
 * 1. every record of `app.result-lines` (the moments of play);
 * 2. the `line` of every area of an adventure;
 * 3. the `line` of every act marker of an adventure.
 *
 * **What does not count**, and why. `world.oracle-lines`,
 * `rules.unexpected-event-lines` and `world.effects` also carry authored
 * `line` fields, and they are *not* his. They are the read-aloud text of
 * a printed table row — the table speaking, not the storyteller — and
 * VOICE.md does not list them. Holding them to his register would mean
 * rewriting 149 lines that the book's own tables already read correctly,
 * which is a content pass with its own reasons, not a side effect of
 * giving the app a narrator. If that pass is ever wanted it gets a phase.
 *
 * The rules below are transcribed from VOICE.md, "How he speaks". Each
 * `it` names the clause it enforces so a failure points at the guide.
 */
import { describe, expect, it } from 'vitest'
import { resultLines } from './index'
import { theFiveTreasuresAreas, theFiveTreasuresActs } from './campaigns/index'

/** One line under test, with enough context to name it in a failure. */
type Line = { readonly id: string; readonly line: string }

/** Every line the narrator speaks, from all three of VOICE.md's homes. */
const lines: readonly Line[] = Object.freeze([
  ...resultLines.map((r) => ({ id: r.id, line: r.line })),
  ...theFiveTreasuresAreas.map((a) => ({ id: a.id, line: a.line })),
  ...theFiveTreasuresActs.map((a) => ({ id: a.id, line: a.line })),
])

/**
 * Words counted the way a reader counts them: whitespace-separated runs.
 *
 * `{name}` is one word, which is what it becomes once filled — a Master
 * named "Lin Shu" would make it two, so the cap is enforced against the
 * template and left a word of headroom rather than against every
 * possible name.
 */
const words = (line: string): readonly string[] => line.trim().split(/\s+/u)

/**
 * Sentences, counted by terminator.
 *
 * A full stop, a question mark or an ellipsis ends one. A trailing
 * terminator does not open another, and a decimal point cannot appear
 * because digits are banned outright below.
 */
const sentences = (line: string): readonly string[] =>
  line
    .split(/(?<=[.?])\s+/u)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

/** The whole words VOICE.md bans, matched case-insensitively. */
const banned = {
  /** "Never the second person for the Master." */
  secondPerson: /\b(you|your|yours|you're|youre|yourself)\b/iu,
  /** "The listener is in the story, not at the table" (operator, 2026-09-07). */
  table: /\b(roll|rolls|rolled|rolling|dice|die|d6|check|checks|result|results|score|scores|stat|stats|modifier|modifiers)\b/iu,
} as const

describe('the narrator speaks to the guide (plan/VOICE.md)', () => {
  it('has a line for every moment result-lines.json declares, and no duplicate moment', () => {
    const refs = resultLines.map((r) => r.moment)
    expect(new Set(refs).size, `duplicate moment among: ${refs.join(', ')}`).toBe(refs.length)
    expect(refs.length).toBeGreaterThan(0)
  })

  it('cites the guide on every record, so a line can never claim the book said it', () => {
    const wrong = resultLines.filter((r) => r.cite !== 'plan/VOICE.md').map((r) => r.id)
    expect(wrong, `narrator records not citing plan/VOICE.md: ${wrong.join(', ')}`).toEqual([])
  })

  it('keeps every line to two sentences ("a line that needs a third is two lines\' work")', () => {
    const long = lines
      .filter((l) => sentences(l.line).length > 2)
      .map((l) => `${l.id} (${sentences(l.line).length} sentences)`)
    expect(long, `over two sentences:\n${long.join('\n')}`).toEqual([])
  })

  it('keeps every line to forty words', () => {
    const long = lines
      .filter((l) => words(l.line).length > 40)
      .map((l) => `${l.id} (${words(l.line).length} words)`)
    expect(long, `over forty words:\n${long.join('\n')}`).toEqual([])
  })

  it('carries no exclamation mark ("No exclamation marks")', () => {
    const shouting = lines.filter((l) => l.line.includes('!')).map((l) => l.id)
    expect(shouting, `exclamation marks in: ${shouting.join(', ')}`).toEqual([])
  })

  it('carries no digit ("A rule, a number, or a citation" is his to leave out)', () => {
    const numbered = lines.filter((l) => /[0-9]/u.test(l.line)).map((l) => l.id)
    expect(numbered, `digits in: ${numbered.join(', ')}`).toEqual([])
  })

  it('never uses the second person for the Master', () => {
    const offenders = lines.filter((l) => banned.secondPerson.test(l.line)).map((l) => l.id)
    expect(offenders, `second person in: ${offenders.join(', ')}`).toEqual([])
  })

  it('never uses a word of the table, so the listener stays in the story', () => {
    const offenders = lines
      .filter((l) => banned.table.test(l.line))
      .map((l) => `${l.id}: ${l.line}`)
    expect(offenders, `table words in:\n${offenders.join('\n')}`).toEqual([])
  })

  it('leaves nothing blank: a moment with no line is silence by omission, not an empty string', () => {
    const empty = lines.filter((l) => l.line.trim().length === 0).map((l) => l.id)
    expect(empty, `empty lines: ${empty.join(', ')}`).toEqual([])
  })
})
