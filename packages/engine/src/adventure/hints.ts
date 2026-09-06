/**
 * The spoiler gates: hints and treasure effects (I-60).
 *
 * The adventure prints two things "read this only if": each area's grey
 * Hint paragraph, and the section explaining how the treasures work. In
 * a book that is an honour system; in an app it is state, so the engine
 * carries which gates have opened and refuses to hand over text that has
 * not been earned.
 *
 * What opens a hint (I-06b): an Event roll of Hint, or information about
 * the area - an Oracle "Yes"-class answer to a question about it, or a
 * Kind/Helpful reaction from an NPC who knows it. The engine does not
 * decide which of those happened; the caller says "this area's hint is
 * earned" and the engine records it.
 */
import type { AdventureTables, AdventureTreasure } from '@martial-havoc/content'
import type { AdventureState } from './state'
import { withEffect, withHint } from './state'

/** Has this area's Hint been revealed? */
export const hintRevealed = (state: AdventureState, area: string): boolean =>
  state.hints.includes(area)

/**
 * The area's Hint if it has been earned, else null.
 *
 * Null rather than the empty string, so a screen that forgets to check
 * renders nothing rather than an empty grey box.
 */
export const hintFor = (
  tables: AdventureTables,
  state: AdventureState,
  area: string,
): string | null =>
  hintRevealed(state, area) ? (tables.areas.find((a) => a.id === area)?.hint ?? null) : null

/** Reveal one area's Hint (Event = Hint, or information about it: I-06b). */
export const revealHint = (state: AdventureState, area: string): AdventureState =>
  withHint(state, area)

/** Has this treasure's effect been revealed? */
export const effectRevealed = (state: AdventureState, treasure: string): boolean =>
  state.effects.includes(treasure)

/**
 * The treasure's effect text if it has been earned, else null.
 *
 * Holding the treasure earns it; so does anything the treasure's own
 * `knownFrom` names - the Chieftain's sheets (I-38b), the Old Vixen's
 * spells (I-41).
 */
export const effectFor = (
  tables: AdventureTables,
  state: AdventureState,
  treasure: string,
): string | null =>
  effectRevealed(state, treasure)
    ? (tables.treasures.find((t) => t.id === treasure)?.effect ?? null)
    : null

/**
 * Learn from a source: every treasure whose `knownFrom` names it opens.
 *
 * `source` is an area id (the sheets on the Chieftain's lectern) or a
 * foe id (the Old Vixen, met kindly). Returns the state unchanged when
 * the source teaches nothing, so a caller may fire it on every read.
 */
export const learnFrom = (
  tables: AdventureTables,
  state: AdventureState,
  source: string,
): AdventureState =>
  tables.treasures
    .filter((treasure: AdventureTreasure) => treasure.knownFrom.includes(source))
    .reduce((next, treasure) => withEffect(next, treasure.id), state)
