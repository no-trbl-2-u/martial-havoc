/**
 * @martial-havoc/engine — public surface.
 *
 * Phase 1 (the garden) ships an empty engine on purpose: the point of
 * this phase is that the verify gate is green on nothing. Phase 2 adds
 * the dice interface and creation; Phase 3 the combat core. Every
 * behaviour those phases add registers itself in {@link behaviours}
 * so the label leg can see it.
 *
 * Rules for this package (agents.md standing rule 7): no React, no
 * I/O, no dice of its own — pure functions over immutable state.
 */

export { LABELS, isLabel, isLabelled } from './labels'
export type { Label, Behaviour } from './labels'

import type { Behaviour } from './labels'

/**
 * The registry of every behaviour the engine exports.
 *
 * `scripts/labels-check.test.ts` reads this list and fails the build
 * on any entry that is not `rule | reading | invention` with a
 * citation. Empty in the garden; grows one entry per behaviour from
 * Phase 2 on. Frozen so nothing mutates it at runtime.
 */
export const behaviours: readonly Behaviour[] = Object.freeze([])
