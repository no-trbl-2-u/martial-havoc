/**
 * Creation on fixed dice: the eight printed sheets (MH p.91-92, R83) as
 * the app reads them, and the two actions that pick one and start it.
 *
 * Every rule here is the engine's; these tests check the wiring - that
 * the sheet the screen shows is the sheet the record plays, that the
 * advisory pools are reported and never enforced (spec.md, Refusals),
 * and that starting a Master clears the previous one's ledger.
 */
import { describe, expect, it } from 'vitest'
import { fromSequence } from '@martial-havoc/engine'
import { presets } from '@martial-havoc/content'
import { randomSource } from '../dice/random'
import { allCandidates, candidateFor } from './creation'
import { newRecord } from './record'
import { reduce } from './reduce'
import type { Action, RecordState } from './types'

/** Deterministic dice: every face a four, so no sequence has to be counted. */
const fours = () => randomSource(() => 0.5)

const fresh = (): RecordState => newRecord(fours())

/** The pick action for one preset, its candidate read on fixed dice. */
const pick = (presetId: string): Action => ({
  type: 'creation.pick',
  candidate: candidateFor(presetId)(fours()),
})

describe('the eight printed sheets', () => {
  it('loads every one of Appendix C, in printed order', () => {
    const all = allCandidates(fours())
    expect(all).toHaveLength(presets.length)
    expect(all.map((c) => c.presetId)).toEqual(presets.map((p) => p.id))
    expect(all.map((c) => c.sheet.name)).toContain('Yin')
  })

  it('reads San Te as printed, with his style, Proficiencies and kit', () => {
    const c = candidateFor('preset.san-te')(fours())
    expect(c.sheet).toMatchObject({ name: 'San Te', skill: 8, endurance: 20, luck: 9 })
    expect(c.martialArt).toBe('Shaolin Quan')
    expect(c.status).toBe('Poor')
    expect(c.sheet.proficiencies.length).toBeGreaterThan(0)
    expect(c.equipment.length).toBeGreaterThan(0)
  })

  it('throws the status’s gold dice rather than reading a printed coin (R03)', () => {
    // San Te's status is "Poor", which R03 prices at 1d6-1: a face of 4
    // is 3 GP. The sheet itself prints a status and no coin at all.
    const c = candidateFor('preset.san-te')(fromSequence([4]))
    expect(c.sheet.gold).toBe(3)
  })

  it('flags Yin’s overspend on both pools and loads Yin anyway', () => {
    const yin = candidateFor('preset.yin')(fours())
    expect(yin.sheet.overspent).toBe(true)
    expect(yin.flags.length).toBeGreaterThan(0)
    expect(yin.proficiencyPool[0]).toBeGreaterThan(yin.proficiencyPool[1])
    // Refused nothing: the Master is whole and playable.
    expect(yin.sheet.name).toBe('Yin')
    expect(yin.sheet.skill).toBeGreaterThan(0)
  })

  it('reports a balanced sheet as clean', () => {
    const clean = allCandidates(fours()).filter((c) => !c.sheet.overspent)
    expect(clean.length).toBeGreaterThan(0)
    expect(clean.every((c) => c.flags.length === 0)).toBe(true)
  })

  it('throws on an id no preset table holds', () => {
    expect(() => candidateFor('preset.nobody')(fours())).toThrow(/preset\.nobody/)
  })
})

describe('picking and starting a Master', () => {
  it('picking holds the whole candidate without touching the played sheet', () => {
    const s = reduce(fresh(), pick('preset.yin'), fours())
    expect(s.picked?.presetId).toBe('preset.yin')
    expect(s.picked?.sheet.name).toBe('Yin')
    expect(s.sheet.name).toBe('San Te')
  })

  it('rolls nothing: a queued run of faces survives picking and starting', () => {
    const queue = fromSequence([1, 2, 3])
    const picked = reduce(fresh(), pick('preset.yin'), queue)
    reduce(picked, { type: 'creation.start' }, queue)
    // Still all three: creation drew none of them (R03's gold was thrown
    // when the sheet was read, not when it was chosen).
    expect(queue.next()).toBe(1)
    expect(queue.next()).toBe(2)
    expect(queue.next()).toBe(3)
  })

  it('starting plays the picked sheet and clears the previous ledger', () => {
    const played: RecordState = {
      ...fresh(),
      deeds: ['killed a ghost'],
      passages: ['it was cold'],
      overrides: 3,
      held: ['vase-of-muttonfat-jade'],
    }
    const picked = reduce(played, pick('preset.golden-swallow'), fours())
    const started = reduce(picked, { type: 'creation.start' }, fours())
    expect(started.sheet.name).toBe('Golden Swallow')
    expect(started.deeds).toEqual([])
    expect(started.passages).toEqual([])
    expect(started.overrides).toBe(0)
    expect(started.held).toEqual([])
    expect(started.picked).toBeNull()
    expect(started.screen).toBe('beat')
    // The region the Master walks is the one already thrown, not a re-roll.
    expect(started.region).toBe(played.region)
  })

  it('starting with nothing picked changes nothing', () => {
    const before = fresh()
    expect(reduce(before, { type: 'creation.start' }, fours())).toBe(before)
  })

  it('carries the overspend flag onto the record the campaign keeps', () => {
    const picked = reduce(fresh(), pick('preset.yin'), fours())
    expect(reduce(picked, { type: 'creation.start' }, fours()).sheet.overspent).toBe(true)
  })
})
