/**
 * The campaign record: the one durable value a Master's whole play is.
 *
 * `spec.md`, Horizon: one campaign record, offline, no account, export
 * is the backup. `plan/bearings.md` fixes what it holds - "one Master,
 * deeds ledger, per-adventure flags, passages, reading ids, override
 * count; the world dies with the Master".
 *
 * The distinction this module draws is between the **campaign** and the
 * **session**. Which screen is open, whether the manual-dice tray is
 * showing, what is half-typed in the passage box: those are the app's,
 * they change with the UI, and they must never be able to invalidate a
 * save. Everything here is the other half - the things a player would be
 * sorry to lose - and it is the only thing written out.
 *
 * Immutable, like everything in this package. Every function returns a
 * new record; nothing mutates, nothing does I/O, and nothing reads a
 * clock (an export timestamp is passed in, so a record is a pure
 * function of what happened to it).
 */
import type { AdventureState } from '../adventure/state'

/** The record format version this build writes. */
export const RECORD_VERSION = 2

/**
 * The reading ids whose positions this build's record depends on.
 *
 * Written into every record so an import can tell which estate readings
 * were in force when it was saved, and a migration can be keyed on the
 * one that changed (see `./migrate.ts`). Not the whole inventory: only
 * the readings a *saved record* would have to be rewritten for.
 */
export const RECORD_READINGS: readonly string[] = Object.freeze([
  'I-02', // the free-text starting weapon counts as a weapon
  'I-07', // one key opens both Private Quarters
  'I-32', // a bare escape always scores Dishonor
  'I-33b', // re-entry rolls again; named foes are removed once defeated
  'I-33c', // the Kings are one entity across tables
  'I-45', // the gourd's night, and who is absent in it
  'I-60', // hints and treasure effects are hidden until earned
])

/** The Master as the record keeps them, between scenes. */
export type RecordedMaster = {
  readonly name: string
  readonly skill: number
  /** SKILL as created; R05 asks that the initial value be kept. */
  readonly skillInitial: number
  readonly endurance: number
  readonly enduranceInitial: number
  readonly luck: number
  readonly gold: number
  readonly dishonor: number
  readonly proficiencies: readonly { readonly name: string; readonly value: number }[]
  /** Technique and Ritual ids (`technique.*`, `ritual.*`). */
  readonly techniques: readonly string[]
  /**
   * The overspend mark.
   *
   * `spec.md` refuses to block an overspent creation pool - "flag, never
   * refuse" - so a Master created over the cap is created anyway and
   * carries this instead. `creationClean` produces it at creation; the
   * record carries it for the rest of the campaign.
   */
  readonly overspent: boolean
}

/** One line of the deeds ledger. */
export type Deed = {
  /** Which adventure it happened in, or null for the sandbox. */
  readonly adventure: string | null
  readonly text: string
}

/** The whole campaign, as it is saved. */
export type CampaignRecord = {
  readonly version: number
  /** The estate readings in force when this was written. */
  readonly readings: readonly string[]
  readonly master: RecordedMaster
  /** The world dies with the Master (bearings). Set once, never unset. */
  readonly dead: boolean
  /** Per-adventure state, keyed by `adventureMeta` id (Phase 5). */
  readonly adventures: Readonly<Record<string, AdventureState>>
  readonly deeds: readonly Deed[]
  /** What the player wrote, in the order they wrote it. */
  readonly passages: readonly string[]
  /** How many rolls were typed instead of rolled (spec.md, Horizon). */
  readonly overrides: number
  /**
   * The act numbers whose change-of-act slip has already been shown
   * (Phase 10c), per adventure id.
   *
   * Durable rather than session state, and the distinction is the
   * usual one: which screen is open is the app's, but *whether this
   * player has already been told they are in act three* is something
   * they would be sorry to be told twice. An export that dropped it
   * would replay the whole ladder on import.
   *
   * **Optional, and no version bump.** Nothing about the saved shape
   * became wrong when this was added - a v2 record is still a correct
   * v2 record, it simply does not say which acts were announced - and
   * `MIGRATIONS` is keyed on estate readings that moved, not on fields
   * that arrived. No reading moved here. A record without the field is
   * read by filling it from the acts the saved state already satisfies
   * (`fromCampaign`), which is a better answer than "none" and needs no
   * chain step to produce.
   */
  readonly actsSeen?: Readonly<Record<string, readonly number[]>>
}

/** A fresh record for a newly created Master. */
export const newCampaign = (master: RecordedMaster): CampaignRecord =>
  Object.freeze({
    version: RECORD_VERSION,
    readings: RECORD_READINGS,
    master,
    dead: false,
    adventures: Object.freeze({}),
    deeds: Object.freeze([]),
    passages: Object.freeze([]),
    overrides: 0,
    actsSeen: Object.freeze({}),
  })

/** Replace the Master's numbers, leaving everything else alone. */
export const withMaster = (
  record: CampaignRecord,
  master: RecordedMaster,
): CampaignRecord => ({ ...record, master })

/**
 * Store one adventure's state under its id.
 *
 * The record holds a map rather than one adventure because the sandbox
 * is the real game and adventures are scenes in it (`spec.md`): a Master
 * may leave the cave half-explored, do something else, and come back to
 * a cave that remembers.
 */
export const withAdventure = (
  record: CampaignRecord,
  state: AdventureState,
): CampaignRecord => ({
  ...record,
  adventures: { ...record.adventures, [state.adventure]: state },
})

/** One adventure's state, or undefined where the Master has not been. */
export const adventureIn = (
  record: CampaignRecord,
  adventure: string,
): AdventureState | undefined => record.adventures[adventure]

/** Add a line to the deeds ledger. */
export const withDeed = (record: CampaignRecord, deed: Deed): CampaignRecord => ({
  ...record,
  deeds: [...record.deeds, deed],
})

/** Keep what the player wrote. Blank and whitespace are not passages. */
export const withPassage = (record: CampaignRecord, text: string): CampaignRecord =>
  text.trim().length === 0 ? record : { ...record, passages: [...record.passages, text] }

/**
 * Count one typed roll.
 *
 * `spec.md`, Horizon: manual entry for anything but dice increments the
 * override count. The count is never reset - it is the record's own
 * honesty about how much of it was rolled.
 */
export const withOverride = (record: CampaignRecord): CampaignRecord => ({
  ...record,
  overrides: record.overrides + 1,
})

/**
 * The Master dies, and the world with them (bearings).
 *
 * Idempotent and one-way: nothing in this module unsets it. A dead
 * Master's record is still readable - the deeds and the passages are the
 * point of having kept them - but it cannot be continued.
 */
export const withDeath = (record: CampaignRecord): CampaignRecord =>
  record.dead ? record : { ...record, dead: true }

/** May this record be picked up again? False once the Master is dead. */
export const canContinue = (record: CampaignRecord): boolean => !record.dead

/**
 * Start again.
 *
 * Keeps the format version and the readings - those describe the build,
 * not the campaign - and nothing else. The dead Master's world does not
 * survive them.
 */
export const freshStart = (master: RecordedMaster): CampaignRecord => newCampaign(master)
