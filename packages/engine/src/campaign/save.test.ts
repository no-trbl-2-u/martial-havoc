/**
 * The phase's done-condition: **a record survives export, import and one
 * migration.**
 *
 * Three groups. The round trip (what a player does when they back up and
 * restore). The migration (what happens to the save they made before
 * this build existed). And the refusals - every way a file can be wrong,
 * each coming back as data rather than as a thrown error.
 */
import { describe, expect, it } from 'vitest'
import {
  RECORD_READINGS,
  RECORD_VERSION,
  newCampaign,
  withAdventure,
  withDeed,
  withOverride,
  withPassage,
} from './record'
import type { RecordedMaster } from './record'
import { MIGRATIONS, chainFrom, readingDrift } from './migrate'
import { CAMPAIGN_FORMAT, exportCampaign, importCampaign, importJson, toJson } from './save'

const master: RecordedMaster = {
  name: 'San Te',
  skill: 9,
  skillInitial: 9,
  endurance: 20,
  enduranceInitial: 20,
  luck: 7,
  gold: 12,
  dishonor: 1,
  proficiencies: [{ name: 'Unarmed', value: 3 }],
  techniques: ['technique.iron-head'],
  overspent: true,
}

const AT = '2026-09-06T04:00:00.000Z'

/** A record with something in every field, so a round trip has work to do. */
const played = () =>
  withOverride(
    withPassage(
      withDeed(
        withAdventure(newCampaign(master), {
          adventure: 'adventure.the-5-treasures',
          area: 'area.the-5-treasures.dining-hall',
          visited: ['area.the-5-treasures.flat-top-mountain', 'area.the-5-treasures.dining-hall'],
          flags: { night: true },
          defeated: ['foe.junior-king-silver-horn'],
          keys: ['key.the-5-treasures.private-quarter'],
          items: ['Spear'],
          treasures: ['treasure.the-5-treasures.seven-star-sword'],
          hints: ['area.the-5-treasures.dining-hall'],
          effects: ['treasure.the-5-treasures.seven-star-sword'],
          rescued: ['foe.monk'],
          dishonor: 0,
        }),
        { adventure: 'adventure.the-5-treasures', text: 'beat the Junior King' },
      ),
      'The torches gave up before the ceiling.',
    ),
  )

describe('export', () => {
  it('wraps the record in a named, versioned envelope', () => {
    const file = exportCampaign(played(), AT)
    expect(file.format).toBe(CAMPAIGN_FORMAT)
    expect(file.version).toBe(RECORD_VERSION)
    expect(file.exported).toBe(AT)
    expect(file.record.master.name).toBe('San Te')
  })

  it('reads no clock of its own', () => {
    // The timestamp is the caller's; two exports of the same record with
    // the same `at` are byte-identical, which is what makes a save
    // diffable and a test deterministic.
    const record = played()
    expect(toJson(exportCampaign(record, AT))).toBe(toJson(exportCampaign(record, AT)))
  })
})

describe('the round trip', () => {
  it('gives back exactly what went in, through the text', () => {
    const record = played()
    const result = importJson(toJson(exportCampaign(record, AT)))
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.record).toEqual(record)
    expect(result.migrations).toEqual([])
  })

  it('keeps the overspend mark, the dishonor and the override count', () => {
    const result = importJson(toJson(exportCampaign(played(), AT)))
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.record.master.overspent).toBe(true)
    expect(result.record.master.dishonor).toBe(1)
    expect(result.record.overrides).toBe(1)
  })

  it('keeps the adventure exactly, so the cave remembers who is dead', () => {
    const result = importJson(toJson(exportCampaign(played(), AT)))
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const cave = result.record.adventures['adventure.the-5-treasures']
    expect(cave?.defeated).toEqual(['foe.junior-king-silver-horn'])
    expect(cave?.keys).toEqual(['key.the-5-treasures.private-quarter'])
    expect(cave?.flags['night']).toBe(true)
  })

  it('survives a second round trip unchanged', () => {
    const once = importJson(toJson(exportCampaign(played(), AT)))
    expect(once.ok).toBe(true)
    if (!once.ok) return
    const twice = importJson(toJson(exportCampaign(once.record, AT)))
    expect(twice.ok).toBe(true)
    if (!twice.ok) return
    expect(twice.record).toEqual(once.record)
  })
})

describe('the migration chain', () => {
  it('is contiguous and ascending, and reaches the current version', () => {
    for (const step of MIGRATIONS) expect(step.to).toBe(step.from + 1)
    expect(MIGRATIONS.at(-1)?.to).toBe(RECORD_VERSION)
  })

  it('names the reading that forced every bump', () => {
    for (const step of MIGRATIONS) {
      expect(step.reading).toMatch(/^I-[0-9]{2}[a-z]?$/)
      expect(step.why.length).toBeGreaterThan(0)
    }
  })

  it('plans no steps for a current file and every step for the oldest', () => {
    const current = chainFrom(RECORD_VERSION)
    expect('steps' in current && current.steps).toEqual([])
    const oldest = chainFrom(1)
    expect('steps' in oldest && oldest.steps.length).toBe(RECORD_VERSION - 1)
  })
})

describe('one migration: a v1 file from the prototype', () => {
  /** What the prototype wrote: a bare area, held keys, no adventures. */
  const v1 = {
    format: CAMPAIGN_FORMAT,
    version: 1,
    exported: AT,
    record: {
      version: 1,
      master,
      dead: false,
      area: 4,
      held: ['gourd'],
      deeds: [{ adventure: null, text: 'entered the cave' }],
      passages: ['A gate shut under a willow.'],
      overrides: 2,
    },
  }

  it('opens, and says which migration ran and why', () => {
    const result = importCampaign(v1)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.migrations.map((m) => `${String(m.from)}->${String(m.to)}`)).toEqual(['1->2'])
    expect(result.migrations[0]?.reading).toBe('I-33b')
  })

  it('comes back at the current version, speaking this build readings', () => {
    const result = importCampaign(v1)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.record.version).toBe(RECORD_VERSION)
    expect(result.record.readings).toEqual(RECORD_READINGS)
  })

  it('keeps everything the old shape held', () => {
    const result = importCampaign(v1)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.record.master.name).toBe('San Te')
    expect(result.record.deeds).toHaveLength(1)
    expect(result.record.passages).toEqual(['A gate shut under a willow.'])
    expect(result.record.overrides).toBe(2)
  })

  it('drops the fields the reading retired, and starts the adventures map', () => {
    const result = importCampaign(v1)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    // A v1 record cannot know who is already defeated (I-33b), so the
    // cave starts unvisited rather than being guessed at.
    expect(result.record.adventures).toEqual({})
    expect(result.record).not.toHaveProperty('area')
    expect(result.record).not.toHaveProperty('held')
  })

  it('re-exports as a current file that needs no migration', () => {
    const first = importCampaign(v1)
    expect(first.ok).toBe(true)
    if (!first.ok) return
    const again = importJson(toJson(exportCampaign(first.record, AT)))
    expect(again.ok).toBe(true)
    if (!again.ok) return
    expect(again.migrations).toEqual([])
    expect(again.record).toEqual(first.record)
  })

  it('reports the readings a v1 save had never heard of', () => {
    const drift = readingDrift({ readings: [] })
    expect(drift.added).toEqual(RECORD_READINGS)
    expect(drift.gone).toEqual([])
    // And a reading this build has dropped shows on the other side.
    expect(readingDrift({ readings: ['I-99'] }).gone).toEqual(['I-99'])
  })
})

describe('a file that cannot be read comes back as data, never a throw', () => {
  it('rejects text that is not JSON', () => {
    expect(importJson('not json at all')).toEqual({
      ok: false,
      rejection: { reason: 'not-json' },
    })
  })

  it('rejects a truncated file', () => {
    const cut = toJson(exportCampaign(played(), AT)).slice(0, 80)
    const result = importJson(cut)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.rejection.reason).toBe('not-json')
  })

  it('rejects JSON that is not a campaign', () => {
    expect(importJson('{"hello":"world"}')).toEqual({
      ok: false,
      rejection: { reason: 'not-a-campaign' },
    })
    expect(importJson('[1,2,3]')).toEqual({
      ok: false,
      rejection: { reason: 'not-a-campaign' },
    })
    expect(importJson('null')).toEqual({ ok: false, rejection: { reason: 'not-a-campaign' } })
  })

  it('rejects an envelope with no record inside', () => {
    expect(importCampaign({ format: CAMPAIGN_FORMAT, version: 2 })).toEqual({
      ok: false,
      rejection: { reason: 'no-record' },
    })
  })

  it('rejects a save from a newer build, and says how much newer', () => {
    const future = { format: CAMPAIGN_FORMAT, version: 99, record: { version: 99 } }
    expect(importCampaign(future)).toEqual({
      ok: false,
      rejection: { reason: 'from-the-future', version: 99, current: RECORD_VERSION },
    })
  })

  it('rejects a version the chain cannot reach', () => {
    // Version 0 is below the oldest migration's `from`: no path forward.
    const orphan = { format: CAMPAIGN_FORMAT, version: 0, record: { version: 0 } }
    expect(importCampaign(orphan)).toEqual({
      ok: false,
      rejection: { reason: 'no-path', version: 0 },
    })
  })

  it('reads a record with no stated version as the oldest one', () => {
    const result = importCampaign({
      format: CAMPAIGN_FORMAT,
      record: { master, deeds: [], passages: [], overrides: 0 },
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.migrations.map((m) => m.from)).toEqual([1])
  })
})
