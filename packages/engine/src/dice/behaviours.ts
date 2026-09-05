/**
 * The behaviours the dice folder registers.
 *
 * spec.md, Refusals: every behaviour is labelled rule, reading or
 * invention, with a citation. `labels:check` walks the registry in
 * `../index.ts`, which is the concatenation of these lists.
 */
import type { Behaviour } from '../labels'

export const diceBehaviours: readonly Behaviour[] = Object.freeze([
  { id: 'dice.d6', label: 'rule', cite: 'MH p.6' },
  { id: 'dice.d66', label: 'rule', cite: 'MH p.12' },
  { id: 'dice.two-d6-doubles', label: 'rule', cite: 'MH p.26' },
])
