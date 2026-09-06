/**
 * Export and import: the record as a file, and a file as a record.
 *
 * `spec.md`, Refusals: no accounts, no cloud sync - "export is the
 * backup". So this is the whole of the project's durability story, and
 * it has one hard requirement beyond round-tripping: **an old file must
 * still open.** A build that cannot read the save a player made three
 * months ago has lost their campaign as surely as a server would have.
 *
 * Nothing here throws. `spec.md`, Refusals again: a refusal is data. A
 * file that cannot be read comes back as a rejection carrying a reason a
 * screen can render, never an exception a screen has to catch.
 */
import { RECORD_READINGS, RECORD_VERSION } from './record'
import type { CampaignRecord } from './record'
import { applyChain, chainFrom } from './migrate'
import type { Migration } from './migrate'

/** What every exported file says it is. */
export const CAMPAIGN_FORMAT = 'martial-havoc/campaign'

/** The envelope written to disk. */
export type CampaignFile = {
  readonly format: typeof CAMPAIGN_FORMAT
  readonly version: number
  /** ISO 8601, passed in: this package reads no clock. */
  readonly exported: string
  readonly record: CampaignRecord
}

/** Wrap a record for export. `at` is the timestamp the caller read. */
export const exportCampaign = (record: CampaignRecord, at: string): CampaignFile => ({
  format: CAMPAIGN_FORMAT,
  version: record.version,
  exported: at,
  record,
})

/** The exported file as text, ready to hand to a download or a file write. */
export const toJson = (file: CampaignFile): string => JSON.stringify(file, null, 2)

/** Why a file was not readable. */
export type ImportRejection =
  | { readonly reason: 'not-json' }
  | { readonly reason: 'not-a-campaign' }
  | { readonly reason: 'no-record' }
  | { readonly reason: 'from-the-future'; readonly version: number; readonly current: number }
  | { readonly reason: 'no-path'; readonly version: number }

/** What an import produced. */
export type ImportResult =
  | {
      readonly ok: true
      readonly record: CampaignRecord
      /** The steps that ran, in order; empty for an already-current file. */
      readonly migrations: readonly Migration[]
    }
  | { readonly ok: false; readonly rejection: ImportRejection }

/** Is `value` a plain object (and so possibly a record or an envelope)? */
const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/**
 * Read a parsed value as a campaign, migrating it forward if it is old.
 *
 * Takes the already-parsed value rather than text so a caller that holds
 * an object (a `localStorage` read that was parsed for a shape check,
 * say) does not have to re-serialise it. {@link importJson} is the text
 * door.
 *
 * The version is read from the record, falling back to the envelope's:
 * the two agree in anything this build wrote, and a hand-edited file
 * that disagrees is better read by its record than by its wrapper.
 */
export const importCampaign = (value: unknown): ImportResult => {
  if (!isObject(value)) return { ok: false, rejection: { reason: 'not-a-campaign' } }
  if (value['format'] !== CAMPAIGN_FORMAT)
    return { ok: false, rejection: { reason: 'not-a-campaign' } }
  const inner = value['record']
  if (!isObject(inner)) return { ok: false, rejection: { reason: 'no-record' } }

  const stated = inner['version'] ?? value['version']
  const version = typeof stated === 'number' && Number.isInteger(stated) ? stated : 1

  const chain = chainFrom(version)
  if (!('steps' in chain)) return { ok: false, rejection: chain }

  const migrated = applyChain(chain.steps, inner)
  return {
    ok: true,
    // The chain's last act: the record now speaks this build's readings.
    record: { ...migrated, version: RECORD_VERSION, readings: RECORD_READINGS } as CampaignRecord,
    migrations: chain.steps,
  }
}

/** Read a campaign from text. Malformed JSON is a rejection, not a throw. */
export const importJson = (text: string): ImportResult => {
  try {
    return importCampaign(JSON.parse(text))
  } catch {
    return { ok: false, rejection: { reason: 'not-json' } }
  }
}
