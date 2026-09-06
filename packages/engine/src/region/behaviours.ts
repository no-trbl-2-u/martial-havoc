/**
 * The region's labels. Every export of `./region.ts` is one of these.
 *
 * The book gives a physical procedure (R52-R54); the Horizon gives its
 * replacement. Where the two meet the label is `rule`; where the Horizon
 * had to fill a gap the book left to a sheet of paper, `invention`.
 */
import type { Behaviour } from '../labels'

export const regionBehaviours: readonly Behaviour[] = Object.freeze([
  { id: 'region.points-are-dice-on-a-plane', label: 'reading', cite: 'I-15; MH p.43 (R52)' },
  { id: 'region.location-is-the-visible-face', label: 'rule', cite: 'MH p.43 (R52)' },
  { id: 'region.nearest-neighbour-links', label: 'invention', cite: 'spec.md, Horizon' },
  { id: 'region.disconnected-parts-are-joined', label: 'invention', cite: 'spec.md, Horizon' },
  { id: 'region.miles-are-the-dice-sum', label: 'invention', cite: 'spec.md, Horizon; MH p.44 (R53)' },
  { id: 'region.route-band-from-the-same-sum', label: 'rule', cite: 'MH p.44 (R54); spec.md, Horizon' },
  { id: 'region.positions-are-decorative', label: 'invention', cite: 'spec.md, Horizon' },
])
