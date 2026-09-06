/**
 * The record on the device. Offline, no account (spec.md, Refusals).
 *
 * Phase 6 splits what is written into two, because the two halves have
 * different lifetimes:
 *
 * - **The campaign** — the Master, the ledger, the passages, the
 *   override count, each adventure's own memory. Versioned by the
 *   engine, written as the same envelope `exportCampaign` produces, and
 *   read back through `importJson`, which **migrates** an old one rather
 *   than discarding it. This is the durable half, and it is the same
 *   bytes a player would export as a backup.
 * - **The session** — which screen is open, the last result slip, the
 *   fight in progress, the region as thrown, what is half-typed in the
 *   passage box. Disposable and deliberately unversioned: a shape it no
 *   longer matches is simply "no session", and the campaign still opens.
 *
 * Before this, one blob held both, so adding a UI field silently
 * invalidated every save. Now a UI field change costs a session and
 * nothing else.
 *
 * Web storage where it exists (`localStorage` on the web export); an
 * in-memory shelf otherwise, so native and tests behave the same. Every
 * access is guarded: storage can be absent, full or refused, and none of
 * those is the player's problem.
 */
import { exportCampaign, importJson, toJson } from '@martial-havoc/engine'
import type { ImportResult } from '@martial-havoc/engine'
import { fromCampaign, toCampaign } from './campaign'
import type { RecordState } from './types'

/** The durable half: the campaign, as the export format writes it. */
export const CAMPAIGN_KEY = 'mh.campaign'

/** The disposable half: the session snapshot, this shape only. */
export const SESSION_KEY = 'mh.session.v1'

type Shelf = {
  readonly getItem: (key: string) => string | null
  readonly setItem: (key: string, value: string) => void
}

const memory = new Map<string, string>()
const memoryShelf: Shelf = {
  getItem: (key) => memory.get(key) ?? null,
  setItem: (key, value) => {
    memory.set(key, value)
  },
}

/** Web storage if it exists and answers, else the in-memory shelf. */
const shelf = (): Shelf => {
  try {
    const candidate = (globalThis as { localStorage?: Shelf }).localStorage
    if (candidate !== undefined && typeof candidate.getItem === 'function') return candidate
  } catch {
    /* refused: fall through */
  }
  return memoryShelf
}

/** Shallow shape check on a session snapshot: the fields every screen reads. */
const looksLikeSession = (value: unknown): value is RecordState => {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v['screen'] === 'string' &&
    typeof v['area'] === 'number' &&
    typeof v['sheet'] === 'object' &&
    Array.isArray(v['manual']) &&
    typeof v['region'] === 'object'
  )
}

/** The saved session snapshot, or null when there is none or it is stale. */
const loadSession = (): RecordState | null => {
  try {
    const raw = shelf().getItem(SESSION_KEY)
    if (raw === null) return null
    const parsed: unknown = JSON.parse(raw)
    return looksLikeSession(parsed) ? parsed : null
  } catch {
    return null
  }
}

/** The saved campaign, put through the engine's import (and its migrations). */
export const loadCampaign = (): ImportResult | null => {
  try {
    const raw = shelf().getItem(CAMPAIGN_KEY)
    return raw === null ? null : importJson(raw)
  } catch {
    return null
  }
}

/**
 * The record to open the app on, given a freshly rolled one to fall back
 * to.
 *
 * Three cases, in order. A campaign and a session: the session carries
 * the screen and the slip, the campaign overwrites everything durable. A
 * campaign alone (a session dropped for a shape change, or a restored
 * backup): the fresh record carries the region and the screen, the
 * campaign the rest. Neither: the fresh record, untouched.
 *
 * `fresh` is passed in rather than rolled here because rolling needs
 * dice, and this module does storage, not rules.
 */
export const load = (fresh: RecordState): RecordState => {
  const campaign = loadCampaign()
  const session = loadSession()
  const base = session ?? fresh
  if (campaign === null || !campaign.ok) return base
  return fromCampaign(campaign.record, base)
}

/**
 * Save both halves.
 *
 * Best-effort: a refusal is not an error the player sees. `at` is the
 * timestamp for the campaign envelope, passed in because the engine
 * reads no clock and neither should this.
 */
export const save = (state: RecordState, at: string = new Date().toISOString()): void => {
  try {
    shelf().setItem(CAMPAIGN_KEY, toJson(exportCampaign(toCampaign(state), at)))
  } catch {
    /* storage full or refused */
  }
  try {
    shelf().setItem(SESSION_KEY, JSON.stringify(state))
  } catch {
    /* storage full or refused */
  }
}

/** The campaign as a file the player could keep. The backup, per spec.md. */
export const exportText = (state: RecordState, at: string = new Date().toISOString()): string =>
  toJson(exportCampaign(toCampaign(state), at))
