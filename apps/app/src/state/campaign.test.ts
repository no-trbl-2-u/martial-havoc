/**
 * The session/campaign bridge and the two-key save (Phase 6).
 *
 * The engine owns the record's shape and its migrations, and tests them.
 * What is tested here is the seam: that the durable half of a session
 * survives being written out and read back, that the disposable half can
 * be thrown away without taking the campaign with it, and that the
 * override count - the thing the phase's done-condition names - comes
 * through intact.
 */
import { beforeEach, describe, expect, it } from 'vitest'
import { CAMPAIGN_FORMAT, importJson } from '@martial-havoc/engine'
import { randomSource } from '../dice/random'
import { ADVENTURE_ID, fromCampaign, toCampaign } from './campaign'
import { CAMPAIGN_KEY, SESSION_KEY, exportText, load, loadCampaign, save } from './persist'
import { newRecord } from './record'
import type { RecordState } from './types'

const AT = '2026-09-06T04:00:00.000Z'

const fresh = (): RecordState => newRecord(randomSource(() => 0.5))

/** A session with something in every durable field. */
const played = (): RecordState => ({
  ...fresh(),
  screen: 'rules',
  area: 3,
  sheet: { ...fresh().sheet, endurance: 11, dishonor: 2, gold: 30 },
  deeds: ['forced the gate', 'faced the Ghost'],
  passages: ['Tea things behind glass.'],
  overrides: 4,
  held: ['vase-of-muttonfat-jade'],
})

/**
 * A shelf that answers, so the module under test writes somewhere it can
 * read back. `persist.ts` prefers `globalThis.localStorage` when it has
 * `getItem`, which is exactly this.
 */
const shelf = new Map<string, string>()
beforeEach(() => {
  shelf.clear()
  ;(globalThis as { localStorage?: unknown }).localStorage = {
    getItem: (key: string) => shelf.get(key) ?? null,
    setItem: (key: string, value: string) => {
      shelf.set(key, value)
    },
  }
})

describe('the durable half of a session', () => {
  it('carries the Master, the ledger, the passages and the override count', () => {
    const record = toCampaign(played())
    expect(record.master.name).toBe('San Te')
    expect(record.master.endurance).toBe(11)
    expect(record.master.dishonor).toBe(2)
    expect(record.deeds.map((d) => d.text)).toEqual(['forced the gate', 'faced the Ghost'])
    expect(record.passages).toEqual(['Tea things behind glass.'])
    expect(record.overrides).toBe(4)
  })

  it('keeps the printed preset unmarked for overspending (R83)', () => {
    // A printed sheet cannot overspend a creation pool; Phase 8's
    // creation screen is what will ever set this.
    expect(toCampaign(played()).master.overspent).toBe(false)
  })

  it('records where in the cave, as the adventure format names it', () => {
    const cave = toCampaign(played()).adventures[ADVENTURE_ID]
    expect(cave?.area).toBe('area.the-5-treasures.attendants-room')
    expect(cave?.treasures).toEqual(['treasure.the-5-treasures.vase-of-muttonfat-jade'])
  })

  it('claims nothing the session never said', () => {
    // The prototype tracks two of the eleven adventure fields. The rest
    // start empty rather than being guessed at.
    const cave = toCampaign(played()).adventures[ADVENTURE_ID]
    expect(cave?.defeated).toEqual([])
    expect(cave?.keys).toEqual([])
    expect(cave?.hints).toEqual([])
  })
})

describe('laying a campaign back over a session', () => {
  it('round-trips every durable field', () => {
    const before = played()
    const after = fromCampaign(toCampaign(before), fresh())
    expect(after.area).toBe(before.area)
    expect(after.deeds).toEqual(before.deeds)
    expect(after.passages).toEqual(before.passages)
    expect(after.overrides).toBe(before.overrides)
    expect(after.held).toEqual(before.held)
    expect(after.sheet.endurance).toBe(11)
    expect(after.sheet.dishonor).toBe(2)
    expect(after.sheet.gold).toBe(30)
  })

  it('leaves the session half to the session', () => {
    const session: RecordState = { ...fresh(), screen: 'region', here: 3 }
    const after = fromCampaign(toCampaign(played()), session)
    expect(after.screen).toBe('region')
    expect(after.here).toBe(3)
    expect(after.region).toBe(session.region)
  })
})

describe('the two-key save', () => {
  it('writes the campaign as the export format, readable by the engine', () => {
    save(played(), AT)
    const raw = shelf.get(CAMPAIGN_KEY)
    expect(raw).toBeDefined()
    const parsed: unknown = JSON.parse(raw as string)
    expect((parsed as { format: string }).format).toBe(CAMPAIGN_FORMAT)
    const imported = importJson(raw as string)
    expect(imported.ok).toBe(true)
    if (!imported.ok) return
    expect(imported.record.overrides).toBe(4)
  })

  it('reopens on what was saved', () => {
    save(played(), AT)
    const opened = load(fresh())
    expect(opened.overrides).toBe(4)
    expect(opened.area).toBe(3)
    expect(opened.deeds).toHaveLength(2)
    expect(opened.screen).toBe('rules')
  })

  it('keeps the campaign when the session snapshot goes stale', () => {
    save(played(), AT)
    // A UI field change is exactly this: the snapshot no longer matches.
    shelf.set(SESSION_KEY, JSON.stringify({ screen: 'beat', nonsense: true }))
    const opened = load(fresh())
    expect(opened.overrides).toBe(4)
    expect(opened.deeds).toHaveLength(2)
    // The session half falls back to the fresh record, and that is fine.
    expect(opened.screen).toBe('beat')
  })

  it('opens the fresh record when there is nothing saved', () => {
    const start = fresh()
    expect(load(start)).toBe(start)
    expect(loadCampaign()).toBeNull()
  })

  it('opens the fresh record rather than throwing on a corrupt campaign', () => {
    shelf.set(CAMPAIGN_KEY, '{ not json')
    const start = fresh()
    expect(load(start).overrides).toBe(0)
    expect(loadCampaign()?.ok).toBe(false)
  })

  it('hands the player the same bytes as a backup', () => {
    const state = played()
    save(state, AT)
    expect(exportText(state, AT)).toBe(shelf.get(CAMPAIGN_KEY))
  })
})
