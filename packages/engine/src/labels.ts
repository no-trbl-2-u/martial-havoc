/**
 * Labels — the one vocabulary every engine behaviour must speak.
 *
 * `spec.md`, Refusals: "Every behaviour is labelled. Rule, reading or
 * invention, with a citation; a build with an unlabelled behaviour is
 * red." This module is the type-level half of that promise; the
 * runtime half is `scripts/labels-check.test.ts`, which walks the
 * `behaviours` registry in `./index.ts` and fails the gate on any
 * entry that does not satisfy `isLabelled`.
 *
 * Lowest layer of the engine: nothing here imports anything.
 */

/**
 * The three labels a behaviour may carry.
 *
 * - `rule`      — printed in the rulebook or the adventure as written.
 * - `reading`   — the book is silent or ambiguous; the estate's
 *                 inventory took a position (cite its `I-nn` id).
 * - `invention` — ours, with the decision or content file that made it.
 */
export const LABELS = ['rule', 'reading', 'invention'] as const

/** A member of {@link LABELS}. */
export type Label = (typeof LABELS)[number]

/**
 * What every engine behaviour exports alongside its function.
 *
 * `id`   — a stable, unique identifier (kebab-case, e.g. `combat.final-blow`).
 * `label`— one of {@link LABELS}.
 * `cite` — where it comes from: a rulebook page ("MH p.14"), an
 *          inventory id ("I-07"), or a content/decision path.
 */
export type Behaviour = {
  readonly id: string
  readonly label: Label
  readonly cite: string
}

/**
 * Runtime guard: is `value` one of the three labels?
 *
 * Pure predicate; the type narrows so callers can use it in filters.
 */
export const isLabel = (value: unknown): value is Label =>
  typeof value === 'string' && (LABELS as readonly string[]).includes(value)

/**
 * Runtime guard: is `value` a fully labelled behaviour?
 *
 * True iff it has a non-empty `id`, a valid `label`, and a non-empty
 * `cite`. The label leg of the verify gate applies this to every
 * entry of the registry.
 */
export const isLabelled = (value: unknown): value is Behaviour => {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v['id'] === 'string' &&
    v['id'].length > 0 &&
    isLabel(v['label']) &&
    typeof v['cite'] === 'string' &&
    v['cite'].length > 0
  )
}
