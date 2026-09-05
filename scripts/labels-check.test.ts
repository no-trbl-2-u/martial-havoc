/**
 * The label leg of the verify gate — `npm run labels:check`.
 *
 * spec.md, Refusals: "Every behaviour is labelled. Rule, reading or
 * invention, with a citation; a build with an unlabelled behaviour is
 * red." This spec walks the engine's `behaviours` registry and fails
 * on the first entry that is not labelled and cited, naming it.
 *
 * It runs on its own config (vitest.labels.config.ts) so a red label
 * is its own gate, not one failure among the unit tests. In the
 * garden the registry is empty and the leg passes trivially; it still
 * exists and still runs, which is the brief's requirement.
 */
import { describe, expect, it } from 'vitest'
import { behaviours, isLabelled } from '../packages/engine/src/index'

describe('labels:check', () => {
  it('every engine behaviour is rule | reading | invention with a citation', () => {
    const unlabelled = behaviours.filter((b) => !isLabelled(b))
    expect(
      unlabelled,
      `unlabelled behaviours: ${unlabelled.map((b) => (b as { id?: string }).id ?? '?').join(', ')}`,
    ).toHaveLength(0)
  })

  it('behaviour ids are unique', () => {
    const ids = behaviours.map((b) => b.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('prints the count the build reports', () => {
    // The spec asks that content counts be readable from the build; the
    // behaviour count is the engine's half of that.
    console.log(`labels:check — ${behaviours.length} labelled behaviour(s)`)
    expect(behaviours.length).toBeGreaterThanOrEqual(0)
  })
})
