/**
 * Export and import, through the reducer.
 *
 * Phase 6 proved the engine's own round-trip and its migrations; these
 * prove the screen's door onto them — that a pasted file reaches the
 * record, and that every rejection the engine can return comes back as
 * a sentence a player can act on rather than a silent no-op.
 */
import { describe, expect, it } from 'vitest'
import { exportCampaign, toJson } from '@martial-havoc/engine'
import { toCampaign } from './campaign'
import { reduce } from './reduce'
import { newRecord } from './record'
import type { RecordState } from './types'

const always = (face: 1 | 2 | 3 | 4 | 5 | 6) => ({ next: () => face })
const dice = () => always(4)
const AT = '2026-09-06T00:00:00.000Z'

const played = (): RecordState => ({
  ...newRecord(always(4)),
  creation: null,
  screen: 'record',
  deeds: ['killed the dexterous ghost', 'took the banana fan'],
  passages: ['The willow had grown around the gate.'],
  overrides: 3,
})

const paste = (state: RecordState, text: string): RecordState =>
  reduce(state, { type: 'record.draft', text }, dice())

describe('export and import round-trip', () => {
  it('reads back a campaign it exported', () => {
    const before = played()
    const json = toJson(exportCampaign(toCampaign(before), AT))
    const fresh = { ...newRecord(always(4)), creation: null, screen: 'record' as const }
    const after = reduce(paste(fresh, json), { type: 'record.import' }, dice())
    expect(after.importNote).toBe('Campaign read.')
    expect(after.deeds).toEqual(before.deeds)
    expect(after.passages).toEqual(before.passages)
    expect(after.overrides).toBe(3)
    expect(after.sheet.name).toBe(before.sheet.name)
  })

  it('clears the paste field once it has been read', () => {
    const json = toJson(exportCampaign(toCampaign(played()), AT))
    const after = reduce(paste(played(), json), { type: 'record.import' }, dice())
    expect(after.importDraft).toBe('')
  })
})

describe('a file it cannot read is explained, never swallowed', () => {
  const rejects = (text: string, contains: string) => {
    const after = reduce(paste(played(), text), { type: 'record.import' }, dice())
    expect(after.importNote ?? '').toContain(contains)
    // Nothing of the campaign moved.
    expect(after.deeds).toEqual(played().deeds)
  }

  it('says so when the text is not JSON', () => {
    rejects('not json at all', 'not JSON')
  })

  it('says so when the JSON is not a campaign', () => {
    rejects('{"hello":"world"}', 'not a Martial Havoc campaign')
  })

  it('says so when a campaign envelope carries no record', () => {
    rejects('{"format":"martial-havoc/campaign","version":1}', 'no campaign')
  })

  it('names the version when a file is from a later build', () => {
    const future = JSON.stringify({
      format: 'martial-havoc/campaign',
      version: 99,
      exported: AT,
      record: { ...toCampaign(played()), version: 99 },
    })
    const after = reduce(paste(played(), future), { type: 'record.import' }, dice())
    expect(after.importNote ?? '').toContain('99')
  })
})
