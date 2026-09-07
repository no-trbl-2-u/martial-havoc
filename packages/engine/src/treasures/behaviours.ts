/**
 * The behaviours the treasures folder registers.
 *
 * Every one is a reading: the adventure prints what each object is and
 * never what to roll for it (spec.md, Refusals - a behaviour is labelled
 * rule, reading or invention, with a citation).
 */
import type { Behaviour } from '../labels'

export const treasureBehaviours: readonly Behaviour[] = Object.freeze([
  { id: 'treasures.calling-a-name-is-a-closed-question', label: 'reading', cite: 'I-38' },
  { id: 'treasures.a-yes-class-answer-traps', label: 'reading', cite: 'I-38' },
  { id: 'treasures.binding-is-an-opening-that-holds', label: 'reading', cite: 'I-49' },
  { id: 'treasures.magic-fire-burns-now-and-after', label: 'reading', cite: 'I-50' },
  { id: 'treasures.a-ward-takes-the-hits-it-is-behind', label: 'reading', cite: 'I-44' },
])
