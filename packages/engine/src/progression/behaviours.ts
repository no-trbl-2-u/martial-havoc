/**
 * The behaviours the progression folder registers.
 *
 * spec.md, Refusals: every behaviour is labelled rule, reading or
 * invention, with a citation.
 */
import type { Behaviour } from '../labels'

export const progressionBehaviours: readonly Behaviour[] = Object.freeze([
  { id: 'progression.xp-four-scores-minus-dishonor', label: 'rule', cite: 'MH p.34 (R43)' },
  { id: 'progression.xp-cost-by-skill-band', label: 'rule', cite: 'MH p.34 (R44)' },
  { id: 'progression.band-reads-current-skill', label: 'reading', cite: 'I-53' },
  { id: 'progression.skill-and-luck-cap-at-twelve', label: 'rule', cite: 'MH p.35 (R45)' },
  { id: 'progression.proficiency-uncapped-after-creation', label: 'rule', cite: 'MH p.35 (R45)' },
  { id: 'progression.unspent-xp-carries-over', label: 'rule', cite: 'MH p.35 (R47)' },
  { id: 'progression.scores-are-advisory-never-refused', label: 'invention', cite: 'spec.md, Refusals' },
  { id: 'progression.treasure-band-by-endurance', label: 'rule', cite: 'MH p.68 (R78)' },
  { id: 'progression.treasure-roll-is-offered-and-declinable', label: 'reading', cite: 'I-30b' },
  { id: 'progression.spirits-immune-to-ordinary-blows', label: 'rule', cite: 'MH p.66 (R77)' },
  { id: 'progression.opponent-martial-arts-value', label: 'rule', cite: 'MH p.66 (R75, R76)' },
  { id: 'progression.oracle-special-enemy-attack', label: 'reading', cite: 'I-07a' },
  { id: 'progression.oracle-ambush-is-one-unopposed-round', label: 'reading', cite: 'I-08a' },
])
