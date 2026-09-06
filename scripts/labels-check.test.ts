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

/**
 * The rules panel reads the registry and, for each entry, the note the
 * content package carries for it. The two lists are kept in step here
 * because this is the one spec that may import both packages: a
 * behaviour with no note would show a bare id, and a note with no
 * behaviour would describe something the engine does not do.
 */
import { behaviourNotes } from '../packages/content/src/index'

describe('labels:check — the rules panel notes', () => {
  it('every behaviour has exactly one note', () => {
    const missing = behaviours
      .map((b) => b.id)
      .filter((id) => behaviourNotes.filter((n) => n.ref === id).length !== 1)
    expect(missing, `behaviours without exactly one note: ${missing.join(', ')}`).toEqual([])
  })

  it('every note describes a behaviour the engine exports', () => {
    const ids = new Set(behaviours.map((b) => b.id))
    const orphans = behaviourNotes.filter((n) => !ids.has(n.ref)).map((n) => n.ref)
    expect(orphans, `notes with no behaviour: ${orphans.join(', ')}`).toEqual([])
  })

  it('a reading answers all four panel questions', () => {
    const incomplete = behaviours
      .filter((b) => b.label === 'reading')
      .map((b) => behaviourNotes.find((n) => n.ref === b.id))
      .filter((n) => n !== undefined && !(n.says && n.silent && n.source && n.reversed))
      .map((n) => n?.ref)
    expect(incomplete, `readings missing says/silent/source/reversed: ${incomplete.join(', ')}`).toEqual([])
  })
})
