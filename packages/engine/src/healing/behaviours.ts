/**
 * The behaviours the healing folder registers.
 *
 * spec.md, Refusals: every behaviour is labelled rule, reading or
 * invention, with a citation.
 */
import type { Behaviour } from '../labels'

export const healingBehaviours: readonly Behaviour[] = Object.freeze([
  { id: 'healing.skill-plus-one-full-on-a-night', label: 'rule', cite: 'MH p.31 (R40)' },
  { id: 'healing.endurance-plus-four-full-in-a-week', label: 'rule', cite: 'MH p.31 (R41)' },
  { id: 'healing.luck-plus-one-at-a-temple', label: 'rule', cite: 'MH p.31, 47 (R42, R58)' },
  { id: 'healing.luck-has-no-full-restore', label: 'rule', cite: 'MH p.31 (R42)' },
  { id: 'healing.nights-rest-heals-four-endurance', label: 'invention', cite: 'spec.md, sealed rules' },
])
