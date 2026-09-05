/**
 * The behaviours the creation folder registers.
 *
 * spec.md, Refusals: every behaviour is labelled rule, reading or
 * invention, with a citation. A `rule` cites its folio; a `reading`
 * cites the estate's inventory id; the one `invention` here cites the
 * spec line that authorises it.
 */
import type { Behaviour } from '../labels'

export const creationBehaviours: readonly Behaviour[] = Object.freeze([
  { id: 'creation.attributes', label: 'rule', cite: 'MH p.6 (R04)' },
  { id: 'creation.initial-values', label: 'rule', cite: 'MH p.6 (R05)' },
  { id: 'creation.social-status', label: 'rule', cite: 'MH p.5 (R03)' },
  { id: 'creation.starting-kit', label: 'rule', cite: 'MH p.5 (R02)' },
  { id: 'creation.starting-weapon-is-weapon', label: 'reading', cite: 'I-02' },
  { id: 'creation.martial-art-roll', label: 'rule', cite: 'MH p.7 (R09)' },
  {
    id: 'creation.proficiency-pool-is-rolled-skill',
    label: 'rule',
    cite: 'MH p.7, 11 (R10, R15; D06)',
  },
  { id: 'creation.proficiency-cap-4', label: 'rule', cite: 'MH p.7 (R11)' },
  { id: 'creation.unspent-allowed', label: 'reading', cite: 'I-04' },
  { id: 'creation.training-deduction', label: 'rule', cite: 'MH p.11 (R15)' },
  { id: 'creation.resource-points', label: 'rule', cite: 'MH p.11 (R16)' },
  { id: 'creation.training-is-a-proficiency', label: 'rule', cite: 'MH p.11 (R17)' },
  {
    id: 'creation.pools-advisory-never-refuse',
    label: 'invention',
    cite: 'spec.md, Refusals (Creation’s pools are advisory)',
  },
  { id: 'creation.presets-as-printed', label: 'rule', cite: 'MH p.92 (R83); spec.md, Refusals' },
])
