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
import resultLinesFile from '../data/app/result-lines.json'
import promptsFile from '../data/app/prompts.json'
import type { BehaviourNote, NarratorLine, Prompt, PromptMoment } from './types'

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

/**
 * The questions the app puts to the player (Phase 10j).
 *
 * One per moment the book asks them to imagine. Ours, and deliberately
 * **not** the narrator's: Old Ping speaks about the Master and never to
 * the player, and `plan/VOICE.md` bans the second person for exactly
 * that reason. A prompt is the app asking a question of the person
 * holding the phone, so the second person is the whole point of it.
 * `voice.test.ts` holds them to their own shape instead: one question,
 * ending in a question mark, with no numbers in it.
 */
export const prompts: readonly Prompt[] = Object.freeze(promptsFile.records as readonly Prompt[])

/** The question for one moment, or undefined where the app keeps quiet. */
export const promptFor = (moment: PromptMoment): Prompt | undefined =>
  prompts.find((p) => p.moment === moment)

/** The note for one behaviour id, or undefined for one that has none. */
export const behaviourNoteFor = (ref: string): BehaviourNote | undefined =>
  behaviourNotes.find((n) => n.ref === ref)

/**
 * The narrator's lines, one per moment of play (Phase 10a, plan/VOICE.md).
 *
 * Keyed by `moment` — a result-kind key such as `turn.ambush` or `kill`
 * — because the moments the app narrates are not rows the book prints.
 * `packages/content/src/voice.test.ts` holds every line to the guide.
 */
export const resultLines: readonly NarratorLine[] = Object.freeze(
  resultLinesFile.records as readonly NarratorLine[],
)

/**
 * The narrator's line for one moment, or undefined where he keeps quiet.
 *
 * Total: an unknown ref is silence, not a crash and not a placeholder.
 * Silence is a legitimate answer — VOICE.md says he does not speak on
 * the title page, on ABOUT, on RULES, on RECORD, or in creation — so a
 * caller that gets `undefined` renders nothing at all.
 */
export const narratorLineFor = (moment: string): NarratorLine | undefined =>
  resultLines.find((r) => r.moment === moment)
