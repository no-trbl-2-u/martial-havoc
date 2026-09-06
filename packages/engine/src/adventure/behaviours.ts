/**
 * The adventure module's labels. Every export of this folder is one of
 * these.
 *
 * The split is sharp here. The **procedure** the adventure prints - roll
 * an event on entering, roll the area's creature on 1-3 - is `rule`. The
 * seven readings the estate took about the cave are `reading`, each
 * citing its `I-nn`. The format's own layer - a version the engine
 * refuses to guess at, and act markers over a source that prints no arc
 * - is `invention`, citing the phase brief that authored it.
 */
import type { Behaviour } from '../labels'

export const adventureBehaviours: readonly Behaviour[] = Object.freeze([
  {
    id: 'adventure.format-version-is-refused-not-guessed',
    label: 'invention',
    cite: 'packages/content/schema/adventure-format.md',
  },
  {
    id: 'adventure.event-on-entering-an-area',
    label: 'rule',
    cite: '5T a1',
  },
  {
    id: 'adventure.event-1-to-3-brings-the-area-encounter',
    label: 'rule',
    cite: '5T a1',
  },
  {
    id: 'adventure.exits-are-the-drawn-passages',
    label: 'reading',
    cite: 'I-42; 5T a1',
  },
  {
    id: 'adventure.one-key-opens-both-private-quarters',
    label: 'reading',
    cite: 'I-07; 5T a1',
  },
  {
    id: 'adventure.dice-less-encounters-are-fixed',
    label: 'reading',
    cite: 'I-34; 5T a1',
  },
  {
    id: 'adventure.named-foes-are-removed-once-defeated',
    label: 'reading',
    cite: 'I-33b; I-33c; 5T a1',
  },
  {
    id: 'adventure.empty-degrades-to-safe-exploration',
    label: 'reading',
    cite: 'I-36; 5T a1',
  },
  {
    id: 'adventure.a-flag-can-make-a-foe-absent',
    label: 'reading',
    cite: 'I-45; 5T a1',
  },
  {
    id: 'adventure.hints-and-effects-are-hidden-until-earned',
    label: 'reading',
    cite: 'I-60; I-06b; 5T a1',
  },
  {
    id: 'adventure.some-treasures-are-explored-not-looted',
    label: 'reading',
    cite: 'I-38; 5T a2',
  },
  {
    id: 'adventure.a-rescue-costs-dishonor-to-attack',
    label: 'reading',
    cite: 'I-39; 5T a2',
  },
  {
    id: 'adventure.acts-are-a-ladder-and-the-last-is-the-ending',
    label: 'invention',
    cite: 'plan/phases/phase_5_adventure_format_and_the_5_treasures.md',
  },
])
