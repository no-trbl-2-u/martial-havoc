/**
 * The 149 authored lines (Phase 4).
 *
 * `content.test.ts` validates every file against the schema; this file
 * checks the things a schema cannot: that every authored record points at
 * a transcribed record that exists, that every transcribed record has
 * exactly one authored record, and that an authored line is actually
 * authored rather than a copy of the text it accompanies.
 */
import { describe, expect, it } from 'vitest'
import {
  contentCounts,
  effectFor,
  effects,
  effectsOfClass,
  oracle,
  oracleLineFor,
  oracleLines,
  resultLines,
  rituals,
  techniques,
  theFiveTreasuresActs,
  theFiveTreasuresAreas,
  unexpectedEventLineFor,
  unexpectedEventLines,
  unexpectedEvents,
} from './index'

/** A23's five classes, and nothing else. */
const CLASSES = ['mechanical', 'combat-narrative', 'exploration', 'oracle-like', 'summoning']

/** The timings a Technique may carry (R14, R25, I-23). */
const TECHNIQUE_TIMINGS = ['immediate', 'combat-winner-option', 'scene']

describe('the count (spec.md: readable from the build)', () => {
  it('ships exactly 182 authored lines', () => {
    // Phase 4's 149, Phase 5's 8 area lines and 5 act markers, and
    // Phase 10a's 19 narrator lines, and Phase 10b's Call, one per moment of play.
    expect(contentCounts().authoredLines).toBe(182)
  })

  it('is 72 effects, 66 Oracle lines and 11 Unexpected Event lines', () => {
    expect(effects).toHaveLength(72)
    expect(oracleLines).toHaveLength(66)
    expect(unexpectedEventLines).toHaveLength(11)
    expect(effects.length + oracleLines.length + unexpectedEventLines.length).toBe(149)
  })

  it('adds the cave: one line per area and one per act marker', () => {
    expect(theFiveTreasuresAreas).toHaveLength(8)
    expect(theFiveTreasuresActs).toHaveLength(5)
    expect(contentCounts().authoredLines).toBe(149 + 8 + 5 + resultLines.length)
  })

  it("adds the narrator: one line per moment of play he speaks at", () => {
    expect(resultLines).toHaveLength(20)
    expect(contentCounts().byFile['app.result-lines']).toBe(20)
  })
})

describe('effect records (MH p.12-19; A23)', () => {
  const learnables = [...techniques, ...rituals]

  it('covers every Technique and every Ritual, exactly once', () => {
    expect(learnables).toHaveLength(72)
    for (const l of learnables) expect(effectFor(l.id), l.id).toBeDefined()
    expect(new Set(effects.map((e) => e.ref)).size).toBe(72)
  })

  it('every ref resolves to a record that exists', () => {
    const ids = new Set(learnables.map((l) => l.id))
    for (const e of effects) expect(ids.has(e.ref), e.id).toBe(true)
  })

  it('every class is one of A23’s five', () => {
    for (const e of effects) expect(CLASSES, e.id).toContain(e.class)
  })

  it('every class is actually used — the classification earns its five slots', () => {
    for (const c of CLASSES) expect(effectsOfClass(c as never).length, c).toBeGreaterThan(0)
  })

  it('every cost matches the transcribed record it references (R16, R18)', () => {
    for (const e of effects) {
      const source = learnables.find((l) => l.id === e.ref)
      expect(e.cost, e.id).toBe(source?.cost)
      expect(e.cost).toBeGreaterThanOrEqual(1)
      expect(e.cost).toBeLessThanOrEqual(4)
    }
  })

  it('a Ritual is never a combat winner option (I-24 with I-23)', () => {
    for (const e of effects.filter((x) => x.ref.startsWith('ritual.')))
      expect(e.timing, e.id).toBe('preparation')
  })

  it('a Technique is never `preparation` — Techniques are immediate (R14)', () => {
    for (const e of effects.filter((x) => x.ref.startsWith('technique.')))
      expect(TECHNIQUE_TIMINGS, e.id).toContain(e.timing)
  })

  it('names an engine operation only where one exists, and null otherwise', () => {
    for (const e of effects) {
      if (e.operation === null) continue
      expect(e.operation, e.id).toMatch(/^[a-z]+\.[a-zA-Z]+$/)
    }
    // Most effects are narrative; a classification that made every one
    // mechanical would be inventing rules the book does not print.
    expect(effects.filter((e) => e.operation === null).length).toBeGreaterThan(30)
  })

  it('never restates the printed effect — an authored line is authored', () => {
    for (const e of effects) {
      const source = learnables.find((l) => l.id === e.ref)
      expect(e.line.trim().toLowerCase(), e.id).not.toBe(source?.effect.trim().toLowerCase())
      expect(e.line.trim().length, e.id).toBeGreaterThan(0)
    }
  })
})

describe('Oracle lines (MH p.58)', () => {
  it('covers every one of the 66 cells, exactly once', () => {
    expect(oracle).toHaveLength(66)
    for (const cell of oracle) expect(oracleLineFor(cell.id), cell.id).toBeDefined()
    expect(new Set(oracleLines.map((l) => l.ref)).size).toBe(66)
  })

  it('gives cells that print the same word their own line', () => {
    // Outcome 2 and 3 both print "Negative"; the die tells them apart
    // even where the table does not.
    const a = oracleLineFor('oracle.outcome.2')?.line
    const b = oracleLineFor('oracle.outcome.3')?.line
    expect(a).toBeDefined()
    expect(a).not.toBe(b)
  })

  it('never restates the cell word', () => {
    for (const cell of oracle) {
      const line = oracleLineFor(cell.id)
      expect(line?.line.trim().toLowerCase(), cell.id).not.toBe(cell.text.trim().toLowerCase())
    }
  })

  it('is 66 distinct lines — no cell borrows another’s', () => {
    expect(new Set(oracleLines.map((l) => l.line)).size).toBe(66)
  })
})

describe('Unexpected Event lines (MH p.28)', () => {
  it('covers every one of the 11 rows, exactly once', () => {
    expect(unexpectedEvents).toHaveLength(11)
    for (const row of unexpectedEvents) expect(unexpectedEventLineFor(row.id), row.id).toBeDefined()
    expect(new Set(unexpectedEventLines.map((l) => l.ref)).size).toBe(11)
  })

  it('never restates the printed row', () => {
    for (const row of unexpectedEvents) {
      const line = unexpectedEventLineFor(row.id)
      expect(line?.line.trim().toLowerCase(), row.id).not.toBe(row.text.trim().toLowerCase())
    }
  })

  it('gives the two sealed retreat rows a line each (spec.md: Morale)', () => {
    for (const row of unexpectedEvents.filter((r) => r.retreatRow))
      expect(unexpectedEventLineFor(row.id)?.line, row.id).toBeTruthy()
  })
})

describe('house style for an authored line', () => {
  const all = [
    ...effects.map((e) => [e.id, e.line] as const),
    ...oracleLines.map((l) => [l.id, l.line] as const),
    ...unexpectedEventLines.map((l) => [l.id, l.line] as const),
  ]

  it('carries no emoji (agents.md standing rule 2)', () => {
    for (const [id, line] of all) expect(line, id).toMatch(/^[\p{L}\p{N}\p{P}\p{Zs}]+$/u)
  })

  it('uses no em dash', () => {
    for (const [id, line] of all) expect(line, id).not.toContain('—')
  })

  it('is one sentence to a few, never a paragraph', () => {
    for (const [id, line] of all) expect(line.length, id).toBeLessThanOrEqual(160)
  })

  it('ends in a full stop', () => {
    for (const [id, line] of all) expect(line.trimEnd().endsWith('.'), id).toBe(true)
  })
})
