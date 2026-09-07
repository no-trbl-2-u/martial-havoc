/**
 * The plan leg of the verify gate — runs inside `npm run test` as the
 * `plan` Vitest project (see vitest.config.mts).
 *
 * `/ship-a-phase` and `/march` pick the next phase by reading the
 * **Status (at-a-glance)** block of `plan/steps/01_build_plan.md` and
 * taking the first `[ ]` row. That is a pick by *list order*. The
 * dependency graph lives somewhere else entirely: each phase's own
 * scope section carries a `**Waits on:**` line naming the phases that
 * must ship first. Nothing has ever held the two in agreement.
 *
 * Today they agree — the row order happens to be a topological order of
 * the `Waits on` graph. This spec is what keeps it that way: reorder the
 * rows badly, or add a phase that waits on something below it, and the
 * gate is red before the dispatcher can ship the phases out of order.
 *
 * Filed as a HIGH row in `plan/CRITIQUE.md` ("the dispatcher picks by
 * list order, not by dependency", user-jot, commit 14d178e) and scored
 * 5.4 in `plan/AUDIT.md`.
 *
 * The four checks:
 *   1. every status row's phase id is unique;
 *   2. every status row has a scope section, and every scope section
 *      has a status row (8c is the one documented exception — it was
 *      injected by the operator out of band and never got a section);
 *   3. every id named on a `Waits on:` line is a phase that exists;
 *   4. every such phase appears *earlier* in the status block than the
 *      phase that waits on it. This is the topological-order property,
 *      and it is the one the dispatcher's correctness rests on.
 *
 * Reads the plan as text and asserts over it. No engine, no content, no
 * network — the same shape as the docs, release and copy legs beside it.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/** The build plan, read once, as text. */
const planPath = resolve(fileURLToPath(new URL('../plan/steps/01_build_plan.md', import.meta.url)))
const plan = readFileSync(planPath, 'utf8')

/**
 * A phase id as the plan writes it: a number, optionally suffixed by one
 * letter. `1`, `1b`, `10`, `10a`. The suffix is how the plan inserts a
 * phase between two shipped ones without renumbering the rest.
 */
type PhaseId = string

/**
 * The status rows, in the order the dispatcher reads them.
 *
 * A row is `- [x] Phase 10a — ...` or `- [ ] Phase 11 — ...`; the status
 * vocabulary also allows `[skipped]`, `[-]` and `[blocked: ...]`, so the
 * bracket's content is matched loosely and only the phase id is taken.
 * Order is the order of appearance, which is exactly what
 * `/ship-a-phase` walks.
 */
const statusRows: readonly PhaseId[] = Object.freeze(
  Array.from(plan.matchAll(/^- \[[^\]]*\] Phase (\d+[a-z]?) /gm)).map(([, id]) => id ?? ''),
)

/**
 * Position of each phase in the status block, as a lookup.
 *
 * Built by folding rather than mutating a map, so the result is a frozen
 * record with no construction order to reason about.
 */
const positionOf: Readonly<Record<PhaseId, number>> = Object.freeze(
  statusRows.reduce<Record<PhaseId, number>>(
    (acc, id, index) => (id in acc ? acc : { ...acc, [id]: index }),
    {},
  ),
)

/**
 * The per-phase scope sections, split on their own `### Phase <id> —`
 * headings. Each entry is the id and the prose beneath it, up to the
 * next heading (or the end of the file, which is why this splits rather
 * than matching a lookahead: the last section has no heading after it).
 */
const scopeSections: readonly (readonly [PhaseId, string])[] = Object.freeze(
  plan
    .split(/^### Phase /gm)
    .slice(1)
    .map((chunk) => {
      const id = chunk.match(/^(\d+[a-z]?) /)?.[1] ?? ''
      return [id, chunk] as const
    }),
)

/**
 * Expand a range written on a `Waits on:` line — `10a–10k` — into every
 * id it covers.
 *
 * The plan only ever ranges over the letter suffix of one number (the
 * feel-of-play block, 10a through 10l), so expansion walks the suffix
 * and leaves the number alone. A range whose endpoints disagree on the
 * number, or that carries no suffix, is returned as its two endpoints:
 * check 3 then reports whichever of them does not exist, rather than
 * this helper inventing ids that were never written.
 */
const expandRange = (from: PhaseId, to: PhaseId): readonly PhaseId[] => {
  const number = from.replace(/[a-z]$/, '')
  const start = from.slice(-1)
  const end = to.slice(-1)
  const rangesOverSuffix =
    number === to.replace(/[a-z]$/, '') && /[a-z]/.test(start) && /[a-z]/.test(end)
  if (!rangesOverSuffix) return Object.freeze([from, to])
  return Object.freeze(
    Array.from({ length: end.charCodeAt(0) - start.charCodeAt(0) + 1 }, (_, step) =>
      number.concat(String.fromCharCode(start.charCodeAt(0) + step)),
    ),
  )
}

/**
 * The phases named by one `Waits on:` line.
 *
 * The line is prose, not a field, so two conventions are honoured:
 *
 *   - **Everything after the first `;` is commentary, not dependency.**
 *     "Phase 9; may run beside Phases 11 and 12" waits on 9 alone, and
 *     "nothing; the call is made" waits on nothing. Without this cut,
 *     Phase 13's "may run beside" would read as a dependency on two
 *     phases that come after it and the gate would be red on a plan
 *     that is correct.
 *   - **An en, em or plain dash between two ids is a range.**
 *     "Phase 9, and 10a–10k" is the feel-of-play block, all of it.
 *
 * Everything else that looks like an id is taken as one; check 3 is what
 * makes a stray number (a date, a typo) fail loudly rather than pass
 * unnoticed.
 */
const dependenciesIn = (waitsOn: string): readonly PhaseId[] =>
  Object.freeze(
    Array.from(
      (waitsOn.split(';')[0] ?? '').matchAll(
        /(\d+[a-z]?)\s*[–—-]\s*(\d+[a-z]?)|(\d+[a-z]?)/g,
      ),
    ).flatMap(([, rangeStart, rangeEnd, single]) =>
      rangeStart !== undefined && rangeEnd !== undefined
        ? expandRange(rangeStart, rangeEnd)
        : [single ?? ''],
    ),
  )

/**
 * The dependency graph: every phase with a scope section, mapped to the
 * phases its `Waits on:` line names.
 *
 * A section with no such line declares no dependencies (Phase 1, the
 * garden, is the only one — nothing precedes it).
 */
const waitsOn: Readonly<Record<PhaseId, readonly PhaseId[]>> = Object.freeze(
  scopeSections.reduce<Record<PhaseId, readonly PhaseId[]>>((acc, [id, body]) => {
    const line = body.match(/^\*\*Waits on:\*\* (.+)$/m)?.[1]
    return { ...acc, [id]: line === undefined ? Object.freeze([]) : dependenciesIn(line) }
  }, {}),
)

/**
 * The one status row with no scope section. Phase 8c (the cave,
 * verbatim) was injected by the operator on 2026-09-06 between two
 * shipped phases and never got a section of its own. It is shipped, so
 * the dispatcher will never pick it; the exception is named here so a
 * *new* section-less row fails this spec instead of slipping through
 * undeclared.
 */
const SECTIONLESS = Object.freeze(['8c'])

describe('the build plan is dispatchable in the order it is written', () => {
  it('has a status block and a scope section for the plan to be about', () => {
    // Guards every check below: a regex that silently stopped matching
    // would otherwise turn this whole file green on an empty set.
    expect(statusRows.length).toBeGreaterThan(20)
    expect(scopeSections.length).toBeGreaterThan(20)
  })

  it('names each phase exactly once in the status block', () => {
    // Two rows for one phase means the dispatcher's "first [ ] row" is
    // ambiguous, and the position lookup below would be a coin toss.
    const seen = statusRows.filter((id, index) => statusRows.indexOf(id) !== index)
    expect(seen, `phase ids listed twice in the status block: ${seen.join(', ')}`).toEqual([])
  })

  it('gives every status row a scope section, and every section a row', () => {
    const sectionIds = scopeSections.map(([id]) => id)
    const rowsWithoutSection = statusRows.filter(
      (id) => !sectionIds.includes(id) && !SECTIONLESS.includes(id),
    )
    const sectionsWithoutRow = sectionIds.filter((id) => !statusRows.includes(id))
    // A row with no section has no declared dependencies, so it can be
    // dispatched into a hole. A section with no row can never ship.
    expect(
      rowsWithoutSection,
      `status rows with no scope section (add one, or name it in SECTIONLESS): ${rowsWithoutSection.join(', ')}`,
    ).toEqual([])
    expect(
      sectionsWithoutRow,
      `scope sections with no status row: ${sectionsWithoutRow.join(', ')}`,
    ).toEqual([])
  })

  it('waits only on phases that exist', () => {
    const unknown = Object.entries(waitsOn).flatMap(([phase, dependencies]) =>
      dependencies.filter((id) => !(id in positionOf)).map((id) => `${phase} waits on ${id}`),
    )
    // A typo, a renumbered phase, or a stray number that the prose cut
    // above did not remove. Loud, because a dependency nobody can
    // resolve is a dependency nobody is checking.
    expect(unknown, `Waits on names a phase with no status row: ${unknown.join('; ')}`).toEqual([])
  })

  it('lists every phase after the phases it waits on', () => {
    // The property the dispatcher rests on. `/ship-a-phase` takes the
    // first pending row; if that row waits on a phase further down the
    // list, the loop ships them in an order the plan itself forbids.
    const violations = Object.entries(waitsOn).flatMap(([phase, dependencies]) =>
      dependencies
        .filter((id) => id in positionOf && (positionOf[id] ?? 0) >= (positionOf[phase] ?? 0))
        .map(
          (id) =>
            `Phase ${phase} (row ${positionOf[phase]}) waits on Phase ${id} (row ${positionOf[id]})`,
        ),
    )
    expect(
      violations,
      `the status block is not a topological order of the Waits on graph:\n  ${violations.join('\n  ')}`,
    ).toEqual([])
  })
})
