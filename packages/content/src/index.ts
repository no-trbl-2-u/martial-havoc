/**
 * @martial-havoc/content — public surface.
 *
 * Content is data (agents.md standing rule 7). This module is the only
 * TypeScript in the package: it types the data files and exposes pure
 * lookups over them. No I/O at runtime — the bundler inlines the JSON.
 */

import strings from '../data/app/strings.json'

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
