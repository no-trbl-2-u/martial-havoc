/**
 * @martial-havoc/content — public surface.
 *
 * Content is data (agents.md standing rule 7). The TypeScript in this
 * package types the data files and exposes total lookups over them; it
 * holds no copy of its own and does no I/O at runtime — the bundler
 * inlines the JSON.
 *
 * The engine imports this package for **types only** (`import type`);
 * tables are passed into engine functions as arguments, which is what
 * keeps the engine pure and lets Phase 5 hand it an adventure's tables
 * the same way.
 */

// The record types, one per shape in `schema/content.schema.json`.
export type * from './types'

// Total lookups, curried on the records so a table binds once.
export {
  byD66,
  byBanded,
  byFaces,
  byId,
  byName,
  byTotal,
  byTotals,
  inColumn,
} from './lookup'

// The tables themselves.
export * from './world/index'
export * from './rules/index'
export * from './campaigns/index'

// How much of it there is.
export { contentCounts } from './counts'
export type { ContentCounts } from './counts'

import strings from '../data/app/strings.json'
import notesFile from '../data/app/behaviour-notes.json'
import type { BehaviourNote } from './types'

/** One UI string record: what it says and where it comes from. */
export type StringRecord = {
  readonly id: string
  readonly text: string
  readonly cite: string
}

/** Every app-shell string, as shipped in `data/app/strings.json`. */
export const appStrings: readonly StringRecord[] = strings.records

/**
 * Look up one string by id.
 *
 * Total function: an unknown id returns the id itself in square
 * brackets so a missing string is visible on screen and in a test,
 * never a crash and never silently empty.
 */
export const stringById =
  (records: readonly StringRecord[]) =>
  (id: string): string =>
    records.find((r) => r.id === id)?.text ?? `[${id}]`

/** {@link stringById} bound to the shipped app strings. */
export const t = stringById(appStrings)

/**
 * The rules panel's notes, one per engine behaviour (`ref` is the id in
 * the engine's registry). `scripts/labels-check.test.ts` holds the two
 * lists in step; this package cannot import the engine to check it here.
 */
export const behaviourNotes: readonly BehaviourNote[] = Object.freeze(
  notesFile.records as readonly BehaviourNote[],
)

/** The note for one behaviour id, or undefined for one that has none. */
export const behaviourNoteFor = (ref: string): BehaviourNote | undefined =>
  behaviourNotes.find((n) => n.ref === ref)
