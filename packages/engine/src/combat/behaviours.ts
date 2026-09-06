/**
 * The behaviours the combat folder registers.
 *
 * spec.md, Refusals: every behaviour is labelled rule, reading or
 * invention, with a citation. A `rule` cites its folio; a `reading`
 * cites the estate's inventory id; an `invention` cites the spec line
 * that authorises it (here, the sealed rules).
 */
import type { Behaviour } from '../labels'

export const combatBehaviours: readonly Behaviour[] = Object.freeze([
  { id: 'combat.attack-strength', label: 'rule', cite: 'MH p.23 (R23)' },
  { id: 'combat.exactly-one-proficiency', label: 'rule', cite: 'MH p.23 (R23; D10)' },
  { id: 'combat.training-does-not-add', label: 'reading', cite: 'I-22' },
  { id: 'combat.opponent-proficiency-is-the-higher', label: 'reading', cite: 'I-21' },
  { id: 'combat.master-loses-the-difference', label: 'rule', cite: 'MH p.23 (R24)' },
  { id: 'combat.winners-four-options', label: 'rule', cite: 'MH p.23 (R25)' },
  { id: 'combat.technique-only-as-the-winners-option', label: 'reading', cite: 'I-23' },
  { id: 'combat.technique-costs-endurance-no-roll', label: 'rule', cite: 'MH p.24 (R27)' },
  { id: 'combat.opening', label: 'rule', cite: 'MH p.24 (R29)' },
  { id: 'combat.ends-fight', label: 'rule', cite: 'MH p.23 (R26)' },
  { id: 'combat.final-blow-doubles', label: 'rule', cite: 'MH p.25 (R30)' },
  {
    id: 'combat.double-six-lands-a-doubles-roll',
    label: 'invention',
    cite: 'spec.md, sealed rules',
  },
  { id: 'combat.final-blow-new-technique', label: 'rule', cite: 'MH p.25 (R31)' },
  { id: 'combat.final-blow-luck-on-failure-only', label: 'reading', cite: 'I-12' },
  { id: 'combat.mantis-final-blow-is-lethal', label: 'reading', cite: 'I-25' },
  { id: 'combat.naming-table-is-inspiration-only', label: 'rule', cite: 'MH p.26 (R31)' },
  { id: 'combat.tie-is-an-unexpected-event', label: 'rule', cite: 'MH p.27 (R32)' },
  { id: 'combat.unexpected-event-ends-the-phase', label: 'rule', cite: 'MH p.27 (R32)' },
  { id: 'combat.unexpected-event-minimum-readings', label: 'reading', cite: 'I-30' },
  { id: 'combat.minions-on-a-d6', label: 'reading', cite: 'I-33' },
  { id: 'combat.retreat-rows-roll-morale', label: 'invention', cite: 'spec.md, sealed rules' },
])
