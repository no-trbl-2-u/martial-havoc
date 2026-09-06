/**
 * Migrations, keyed on the reading that forced them.
 *
 * `plan/bearings.md`: "versioned JSON export and import with migrations
 * keyed on reading ids." The keying is the interesting half. A record
 * format does not change because someone felt like it; it changes
 * because a position the estate took about an ambiguous rule changed,
 * and the saved shape no longer expresses it. So every migration names
 * the `I-nn` responsible and says in one line why.
 *
 * That makes the chain readable as history: run down it and you are
 * reading which readings have moved since a save was written, which is
 * exactly what a player who kept a record through three builds wants to
 * know.
 *
 * Pure, total, and ordered. Nothing here throws: a version that cannot
 * be migrated comes back as a rejection for `./save.ts` to render.
 */
import { RECORD_READINGS, RECORD_VERSION } from './record'
import type { CampaignRecord } from './record'

/** One step of the chain: `from` -> `to`, because `reading` moved. */
export type Migration = {
  readonly from: number
  readonly to: number
  /** The estate reading id whose position forced the bump. */
  readonly reading: string
  /** One line: what changed, in a player's words. */
  readonly why: string
  /** Total: takes the older shape as parsed JSON, returns the newer. */
  readonly migrate: (record: Record<string, unknown>) => Record<string, unknown>
}

/**
 * The chain, ascending. Every consecutive pair must meet: a gap is a
 * build mistake, and `chainFrom` reports it rather than skipping a step.
 *
 * **1 -> 2.** The prototype's record (v1) had no per-adventure state at
 * all: it kept a bare `area` number and a list of held treasure keys,
 * because the adventure format did not exist until Phase 5. Reading
 * I-33b is what made per-adventure state necessary - re-entry rolls the
 * event again, and a named foe defeated once is removed from that
 * area's table, so the record has to remember who is already dead. A v1
 * record cannot know that, so the migration starts the adventures map
 * empty and leaves the Master and the ledger untouched.
 */
export const MIGRATIONS: readonly Migration[] = Object.freeze([
  {
    from: 1,
    to: 2,
    reading: 'I-33b',
    why: 'Adventures now remember who is already defeated, so the record keeps per-adventure state instead of a bare area number.',
    migrate: (record) => {
      const { area: _area, held: _held, ...rest } = record
      return {
        ...rest,
        version: 2,
        readings: RECORD_READINGS,
        adventures: {},
        deeds: Array.isArray(record['deeds']) ? record['deeds'] : [],
        passages: Array.isArray(record['passages']) ? record['passages'] : [],
        overrides: typeof record['overrides'] === 'number' ? record['overrides'] : 0,
        dead: record['dead'] === true,
      }
    },
  },
])

/** Why a record could not be brought forward. */
export type MigrationProblem =
  | { readonly reason: 'from-the-future'; readonly version: number; readonly current: number }
  | { readonly reason: 'no-path'; readonly version: number }

/** The steps that carry `version` up to the current one, or the problem. */
export const chainFrom = (
  version: number,
): { readonly steps: readonly Migration[] } | MigrationProblem => {
  if (version > RECORD_VERSION)
    return { reason: 'from-the-future', version, current: RECORD_VERSION }
  const steps: Migration[] = []
  let at = version
  while (at < RECORD_VERSION) {
    const next = MIGRATIONS.find((m) => m.from === at)
    if (next === undefined) return { reason: 'no-path', version }
    steps.push(next)
    at = next.to
  }
  return { steps }
}

/** Run a chain over a parsed record. Pure; each step gets the last one's output. */
export const applyChain = (
  steps: readonly Migration[],
  record: Record<string, unknown>,
): Record<string, unknown> => steps.reduce((acc, step) => step.migrate(acc), record)

/**
 * The readings a record was written under that this build no longer
 * holds, and the ones this build holds that it was not written under.
 *
 * Not used to reject anything - it is what a screen shows a player who
 * asks why their old save came back slightly different.
 */
export const readingDrift = (
  record: Pick<CampaignRecord, 'readings'>,
): { readonly gone: readonly string[]; readonly added: readonly string[] } => ({
  gone: record.readings.filter((id) => !RECORD_READINGS.includes(id)),
  added: RECORD_READINGS.filter((id) => !record.readings.includes(id)),
})
