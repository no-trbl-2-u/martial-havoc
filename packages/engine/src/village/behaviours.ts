/**
 * The village's labels. Every export of `./village.ts` and the three
 * procedure files behind it is one of these.
 *
 * The split this phase has to keep straight: **the village is ours,
 * its procedures are the book's.** That there is a settlement at the
 * trail-head, that it has these three locations, that a night costs
 * what it costs — invention, cite `spec.md, Horizon`. Buying at a
 * printed price, the Spirituality check for +1 LUCK, the night's rest
 * — rule, cited to the folio. The one-check-per-day gate is the
 * estate's reading I-58.
 */
import type { Behaviour } from '../labels'

export const villageBehaviours: readonly Behaviour[] = Object.freeze([
  { id: 'village.is-fixed-data', label: 'invention', cite: 'spec.md, Horizon' },
  { id: 'village.trail-leads-to-the-cave', label: 'invention', cite: 'spec.md, Horizon; 5T a1' },
  { id: 'village.gold-is-ten-silver', label: 'rule', cite: 'MH p.52' },
  { id: 'village.buy-at-printed-price', label: 'rule', cite: 'MH p.52-55 (R68)' },
  { id: 'village.a-refused-purchase-costs-nothing', label: 'invention', cite: 'spec.md, Horizon' },
  { id: 'village.temple-needs-incense', label: 'rule', cite: 'MH p.47 (R58)' },
  { id: 'village.temple-recovers-one-luck', label: 'rule', cite: 'MH p.47 (R58); MH p.31 (R42)' },
  { id: 'village.one-temple-check-per-day', label: 'reading', cite: 'I-58; MH p.47 (R58)' },
  { id: 'village.inn-charges-before-it-heals', label: 'invention', cite: 'spec.md, Horizon' },
  { id: 'village.a-meal-and-a-night-are-one-recovery', label: 'invention', cite: 'spec.md, Horizon; MH p.31 (R41)' },
  { id: 'village.nights-rest-is-the-sealed-four', label: 'rule', cite: 'MH p.31 (R40); spec.md, sealed rules' },
])
