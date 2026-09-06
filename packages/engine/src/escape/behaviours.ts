/**
 * The behaviours the escape folder registers.
 *
 * spec.md, Refusals: every behaviour is labelled rule, reading or
 * invention, with a citation.
 */
import type { Behaviour } from '../labels'

export const escapeBehaviours: readonly Behaviour[] = Object.freeze([
  { id: 'escape.last-blow-of-two', label: 'rule', cite: 'MH p.30 (R38)' },
  { id: 'escape.dishonor-on-damage', label: 'rule', cite: 'MH p.30 (R39)' },
  { id: 'escape.stratagem-and-the-two-is-damage', label: 'reading', cite: 'I-32' },
])
