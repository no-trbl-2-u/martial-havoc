/**
 * The behaviours the checks folder registers.
 *
 * spec.md, Refusals: every behaviour is labelled rule, reading or
 * invention, with a citation. A `rule` cites its folio; the sealed
 * double-six fumble cites the spec line that seals it.
 */
import type { Behaviour } from '../labels'

export const checkBehaviours: readonly Behaviour[] = Object.freeze([
  { id: 'checks.skill-check', label: 'rule', cite: 'MH p.22 (R20)' },
  { id: 'checks.luck-check', label: 'rule', cite: 'MH p.22 (R21)' },
  { id: 'checks.luck-decrement-regardless', label: 'rule', cite: 'MH p.22 (R21)' },
  {
    id: 'checks.double-six-fails-every-check',
    label: 'invention',
    cite: 'spec.md, sealed rules',
  },
  { id: 'checks.classification-is-the-players', label: 'rule', cite: 'MH p.22 (R22)' },
])
