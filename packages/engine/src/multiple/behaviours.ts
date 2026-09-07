/**
 * The behaviours the multiple-combat folder registers.
 *
 * spec.md, Refusals: every behaviour is labelled rule, reading or
 * invention, with a citation.
 */
import type { Behaviour } from '../labels'

export const multipleBehaviours: readonly Behaviour[] = Object.freeze([
  { id: 'multiple.skill-minus-opponents', label: 'rule', cite: 'MH p.30 (R35)' },
  { id: 'multiple.attack-caps-attackers', label: 'rule', cite: 'MH p.30 (R37)' },
  { id: 'multiple.attack-inert-against-a-lone-master', label: 'invention', cite: 'spec.md, sealed rules' },
  { id: 'multiple.blank-attack-reads-as-one', label: 'reading', cite: 'I-09' },
  { id: 'multiple.one-master-roll-per-round', label: 'reading', cite: 'I-06' },
  { id: 'multiple.area-damage-is-repeated-not-divided', label: 'rule', cite: 'MH p.30 (R36)' },
  { id: 'multiple.area-reach-is-read-from-the-prose', label: 'reading', cite: 'I-11' },
  { id: 'multiple.oracle-counts-the-enemies', label: 'rule', cite: 'MH p.58 (R70)' },
  { id: 'multiple.a-band-is-as-many-as-its-attack', label: 'reading', cite: 'I-05b' },
  { id: 'multiple.printed-attack-range-reads-at-its-low-end', label: 'reading', cite: 'I-09' },
  { id: 'multiple.attack-caps-per-kind-not-per-crowd', label: 'reading', cite: 'I-06' },
])
