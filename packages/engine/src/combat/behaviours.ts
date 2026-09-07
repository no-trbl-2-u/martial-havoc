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
  // The other half of R26, and the one the build had missing: a round
  // the Master lost is none of the three things that end a fight, so
  // the fight continues and the next exchange is theirs to roll.
  { id: 'combat.lost-round-is-followed-by-another', label: 'rule', cite: 'MH p.23 (R26)' },
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
  // The book's one optional rule that changes a printed stat block, and
  // so the one behaviour here that is off until the player turns it on.
  { id: 'combat.minions-at-endurance-one', label: 'rule', cite: 'MH p.28 (R33, footnote)' },
  // R77 read from the fight's side: the gate itself lives in
  // `progression/spoils.ts` as `ordinaryBlowsPass`; this is the round
  // refusing the strike and the Final Blow when it closes.
  { id: 'combat.spirits-refuse-ordinary-blows', label: 'rule', cite: 'MH p.66 (R77)' },
  // How much a Technique whose printed effect is a blow takes off. The
  // book prices Techniques and never quantifies them (R27).
  { id: 'combat.technique-blow-strikes-for-the-difference', label: 'reading', cite: 'I-65' },
  {
    id: 'combat.armed-proficiency-needs-its-weapon',
    label: 'reading',
    cite: 'MH p.53 (R68); I-02',
  },
  { id: 'combat.retreat-rows-roll-morale', label: 'invention', cite: 'spec.md, sealed rules' },
  {
    id: 'combat.a-learned-technique-strikes-for-its-value',
    label: 'invention',
    cite: 'plan/phases/phase_10f_the_sheet_that_grows.md',
  },
])
