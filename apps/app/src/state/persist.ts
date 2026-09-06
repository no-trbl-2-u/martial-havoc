/**
 * The record on the device. Offline, no account (spec.md, Refusals).
 *
 * Web storage where it exists (`localStorage` on the web export); an
 * in-memory shelf otherwise, so native and tests behave the same. Every
 * access is guarded: storage can be absent, full or refused, and none of
 * those is the player's problem. Phase 6 replaces this with the versioned
 * campaign record and its export.
 */
import type { RecordState } from './types'

/** Where the prototype's one record lives. */
export const STORAGE_KEY = 'mh.prototype.record.v1'

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

/** Shallow shape check: the version and the fields every screen reads. */
const looksLikeRecord = (value: unknown): value is RecordState => {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    v['version'] === 1 &&
    typeof v['screen'] === 'string' &&
    typeof v['area'] === 'number' &&
    typeof v['sheet'] === 'object' &&
    Array.isArray(v['manual']) &&
    typeof v['region'] === 'object'
  )
}

/** The saved record, or null when there is none or it cannot be read. */
export const load = (): RecordState | null => {
  try {
    const raw = shelf().getItem(STORAGE_KEY)
    if (raw === null) return null
    const parsed: unknown = JSON.parse(raw)
    return looksLikeRecord(parsed) ? parsed : null
  } catch {
    return null
  }
}

/** Save the record. Best-effort: a refusal is not an error the player sees. */
export const save = (state: RecordState): void => {
  try {
    shelf().setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* storage full or refused */
  }
}
