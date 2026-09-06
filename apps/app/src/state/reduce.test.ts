/**
 * The reducer on fixed dice. Every rule it exercises is the engine's;
 * these tests check the wiring: the right engine call, the right place
 * in the record, the override count, and that nothing is mutated.
 */
import { describe, expect, it } from 'vitest'
import { fromSequence } from '@martial-havoc/engine'
import type { Die } from '@martial-havoc/engine'
import { randomSource } from '../dice/random'
import { newRecord } from './record'
import { reduce } from './reduce'
import type { Action, RecordState } from './types'

/** A record whose creation dice are all fours: deterministic, no sequence to count. */
const fresh = (): RecordState => newRecord(randomSource(() => 0.5))

/** Apply actions in order, each with its own fixed dice. */
const play = (state: RecordState, steps: readonly (readonly [Action, readonly Die[]])[]): RecordState =>
  steps.reduce((s, [action, faces]) => reduce(s, action, fromSequence(faces)), state)

const FORCE = 'option.the-5-treasures.2.force-the-gate'
const GO_IN = 'option.the-5-treasures.2.go-in'
const FIGHT = 'option.the-5-treasures.3.face-the-ghost'
const VASE = 'option.the-5-treasures.3.take-the-vase'
const ON = 'option.the-5-treasures.3.on'
const UNSEEN = 'option.the-5-treasures.4.cross-unseen'

describe('a new record', () => {
  it('is San Te at the cave entrance with a seven-point region', () => {
    const s = fresh()
    expect(s.sheet).toMatchObject({ name: 'San Te', skill: 8, endurance: 20, luck: 9 })
    expect(s.sheet.techniques).toContain('technique.iron-head')
    expect(s.area).toBe(2)
    expect(s.region.points).toHaveLength(7)
    expect(s.overrides).toBe(0)
  })
})

describe('checks on the beat', () => {
  it('a SKILL check adds the option’s Proficiency and passes on equal-or-under (R20)', () => {
    // Stamina 2 + SKILL 8 = 10; 4+6 = 10 passes.
    const s = play(fresh(), [[{ type: 'option', id: FORCE }, [4, 6]]])
    expect(s.result).toMatchObject({
      kind: 'check',
      check: 'skill',
      threshold: 10,
      success: true,
      proficiency: { name: 'Stamina', value: 2 },
    })
  })

  it('a double six fails even under the threshold (spec.md, sealed)', () => {
    const s = play(fresh(), [[{ type: 'option', id: FORCE }, [6, 6]]])
    expect(s.result).toMatchObject({ kind: 'check', success: false, doubleSix: true })
  })

  it('a LUCK check costs one LUCK regardless (R21)', () => {
    const s = play(fresh(), [
      [{ type: 'option', id: GO_IN }, []],
      [{ type: 'option', id: ON }, []],
      [{ type: 'option', id: UNSEEN }, [1, 1]],
    ])
    expect(s.result).toMatchObject({ kind: 'check', check: 'luck', success: true, luckAfter: 8 })
    expect(s.sheet.luck).toBe(8)
  })

  it('the primary roll is the area’s first check, rolled at once with the card landed', () => {
    const s = play(fresh(), [[{ type: 'roll.open' }, [2, 2]]])
    expect(s.result).toMatchObject({ kind: 'check', check: 'skill', threshold: 10 })
    expect(s.roll).toEqual({ optionId: FORCE, landed: true })
  })

  it('a check on the menu rolls at once and opens the card landed; CONTINUE closes it and keeps the result', () => {
    const rolled = play(fresh(), [[{ type: 'option', id: FORCE }, [4, 6]]])
    expect(rolled.roll).toEqual({ optionId: FORCE, landed: true })
    expect(rolled.result).toMatchObject({ kind: 'check', success: true })
    const kept = reduce(rolled, { type: 'roll.close' }, fromSequence([]))
    expect(kept.roll).toBeNull()
    expect(kept.result).toBe(rolled.result)
  })

  it('CONTINUE on a landed card does not roll again', () => {
    const rolled = play(fresh(), [[{ type: 'option', id: FORCE }, [4, 6]]])
    expect(reduce(rolled, { type: 'roll' }, fromSequence([1, 1]))).toBe(rolled)
  })

  it('an option from another area does nothing', () => {
    const s = fresh()
    expect(reduce(s, { type: 'option', id: FIGHT }, fromSequence([]))).toBe(s)
  })
})

describe('manual dice', () => {
  it('MY DICE opens the picker card for the first check; two tapped faces and CONTINUE roll it and count one override', () => {
    const open = play(fresh(), [[{ type: 'roll.manual' }, []]])
    expect(open.roll).toEqual({ optionId: FORCE, landed: false })
    expect(open.result).toBeNull()
    const s = play(open, [
      [{ type: 'manual.face', face: 6 }, []],
      [{ type: 'manual.face', face: 6 }, []],
      [{ type: 'roll' }, [1, 1]], // the table's dice are ignored
    ])
    expect(s.result).toMatchObject({ kind: 'check', doubleSix: true })
    expect(s.roll).toEqual({ optionId: FORCE, landed: true })
    expect(s.overrides).toBe(1)
    expect(s.manual).toEqual([])
    expect(s.manualOpen).toBe(false)
  })

  it('CONTINUE with fewer than two faces rolls nothing', () => {
    const one = play(fresh(), [
      [{ type: 'roll.manual' }, []],
      [{ type: 'manual.face', face: 6 }, []],
    ])
    expect(reduce(one, { type: 'roll' }, fromSequence([1, 1]))).toBe(one)
  })

  it('a tap outside a picker card closes it with nothing rolled', () => {
    const s = play(fresh(), [
      [{ type: 'roll.manual' }, []],
      [{ type: 'manual.face', face: 6 }, []],
      [{ type: 'roll.close' }, []],
    ])
    expect(s.roll).toBeNull()
    expect(s.result).toBeNull()
    expect(s.manual).toEqual([])
    expect(s.overrides).toBe(0)
  })

  it('a roll the app made is not an override', () => {
    // The count is the record's honesty about how much of it the app
    // rolled. A roll from the app's own dice source moves nothing.
    const s = play(fresh(), [[{ type: 'option', id: FORCE }, [1, 1]]])
    expect(s.result).toMatchObject({ kind: 'check' })
    expect(s.overrides).toBe(0)
  })

  it('counts one override per manual roll, never resetting', () => {
    const tap = (face: 6): readonly (readonly [Action, readonly Die[]])[] => [
      [{ type: 'roll.manual' }, []],
      [{ type: 'manual.face', face }, []],
      [{ type: 'manual.face', face }, []],
      [{ type: 'roll' }, [1, 1]],
      [{ type: 'roll.close' }, []],
    ]
    const s = play(fresh(), [
      ...tap(6),
      ...tap(6),
      // ...and a roll the app made in between moves nothing.
      [{ type: 'option', id: FORCE }, [1, 1]],
    ])
    expect(s.overrides).toBe(2)
  })

  it('a third tap starts over; cancel clears', () => {
    const s = play(fresh(), [
      [{ type: 'manual.face', face: 1 }, []],
      [{ type: 'manual.face', face: 2 }, []],
      [{ type: 'manual.face', face: 3 }, []],
    ])
    expect(s.manual).toEqual([3])
    expect(reduce(s, { type: 'manual.cancel' }, fromSequence([])).manual).toEqual([])
  })
})

describe('rest and treasure', () => {
  it('a night’s rest heals 4 ENDURANCE, never past the initial value', () => {
    const hurt = { ...fresh(), sheet: { ...fresh().sheet, endurance: 18 } }
    const s = reduce(hurt, { type: 'option', id: 'option.the-5-treasures.2.rest' }, fromSequence([]))
    expect(s.sheet.endurance).toBe(20)
    expect(s.result).toEqual({ kind: 'rest', before: 18, after: 20 })
  })

  it('taking the vase holds it once and writes a deed', () => {
    const s = play(fresh(), [
      [{ type: 'option', id: GO_IN }, []],
      [{ type: 'option', id: VASE }, []],
      [{ type: 'option', id: VASE }, []],
    ])
    expect(s.held).toEqual(['vase-of-muttonfat-jade'])
    expect(s.deeds).toEqual(['took the Vase of muttonfat jade'])
  })
})

describe('the fight with the Dexterous Ghost', () => {
  const atGhost = (): RecordState =>
    play(fresh(), [
      [{ type: 'option', id: GO_IN }, []],
      [{ type: 'option', id: FIGHT }, []],
    ])

  it('starts on the combat screen with the foe’s printed ENDURANCE', () => {
    const s = atGhost()
    expect(s.screen).toBe('combat')
    expect(s.combat).toMatchObject({ foeId: 'foe.dexterous-ghost', foeEndurance: 8, round: 1 })
  })

  it('a won round shows both strengths and offers the difference (R23, R25)', () => {
    // Master 6+5 + SKILL 8 + Non lethal combat 4 = 23; Ghost 1+1 + 7 + immaterial charge 4 = 13.
    const s = play(atGhost(), [[{ type: 'combat.round' }, [6, 5, 1, 1]]])
    expect(s.combat?.last).toMatchObject({
      outcome: 'master-wins',
      difference: 10,
      master: { total: 23, proficiency: { name: 'Non lethal combat', value: 4 } },
      opponent: { total: 13, proficiency: { name: 'immaterial charge', value: 4 } },
    })
    const struck = reduce(s, { type: 'combat.strike' }, fromSequence([]))
    expect(struck.combat?.foeEndurance).toBe(0)
    expect(struck.combat?.over).toEqual({ ended: true, reason: 'opponent-down' })
    expect(struck.deeds).toContain('killed dexterous ghost')
  })

  it('a lost round takes the difference off the Master (R24)', () => {
    // Master 1+1+12 = 14; Ghost 6+6+11 = 23: the Master loses 9.
    const s = play(atGhost(), [[{ type: 'combat.round' }, [1, 1, 6, 6]]])
    expect(s.combat?.last).toMatchObject({ outcome: 'master-hit', difference: -9 })
    expect(s.sheet.endurance).toBe(11)
    expect(reduce(s, { type: 'combat.strike' }, fromSequence([]))).toBe(s)
  })

  it('a tie is an Unexpected Event; a retreat row rolls Morale (R32; spec.md sealed)', () => {
    // Master 3+4+12 = 19; Ghost 4+4+11 = 19. Event 2d6 = 2+2 = 4, a retreat row. Morale d6 = 2: flee.
    const s = play(atGhost(), [[{ type: 'combat.round' }, [3, 4, 4, 4, 2, 2]]])
    expect(s.combat?.event).toMatchObject({ roll: { total: 4 }, retreatRow: true })
    expect(s.combat?.event?.line.length).toBeGreaterThan(0)
    expect(s.combat?.over).toEqual({ ended: true, reason: 'unexpected-event' })
    const m = reduce(s, { type: 'combat.morale' }, fromSequence([2]))
    expect(m.combat?.morale).toEqual({ result: 'flee', face: 2 })
    const left = reduce(m, { type: 'combat.leave' }, fromSequence([]))
    expect(left.screen).toBe('beat')
    expect(left.sheet.dishonor).toBe(0)
  })

  it('an Opening then doubles lands the Final Blow (R29, R30)', () => {
    const s = play(atGhost(), [
      [{ type: 'combat.round' }, [6, 5, 1, 1]],
      [{ type: 'combat.opening' }, []],
      [{ type: 'combat.blow' }, [3, 3]],
    ])
    expect(s.combat?.blow).toMatchObject({ landed: true })
    expect(s.combat?.foeEndurance).toBe(0)
    expect(s.combat?.over).toEqual({ ended: true, reason: 'final-blow' })
    expect(s.deeds).toContain('final blow on dexterous ghost')
  })

  it('no doubles: the Opening holds and the fight goes on', () => {
    const s = play(atGhost(), [
      [{ type: 'combat.round' }, [6, 5, 1, 1]],
      [{ type: 'combat.opening' }, []],
      [{ type: 'combat.blow' }, [3, 4]],
    ])
    expect(s.combat?.blow).toMatchObject({ landed: false })
    expect(s.combat?.opening).toBe(true)
    expect(s.combat?.over).toEqual({ ended: false })
  })

  it('a Technique costs its value in ENDURANCE and needs no roll (R27, I-23)', () => {
    const s = play(atGhost(), [
      [{ type: 'combat.round' }, [6, 5, 1, 1]],
      [{ type: 'combat.technique', id: 'technique.iron-head' }, []],
    ])
    expect(s.sheet.endurance).toBe(18)
    expect(s.combat?.techniqueLine?.length).toBeGreaterThan(0)
    expect(s.combat?.last).toBeNull()
  })

  it('a Technique is refused when behind or unknown', () => {
    const behind = play(atGhost(), [[{ type: 'combat.round' }, [1, 1, 6, 6]]])
    expect(reduce(behind, { type: 'combat.technique', id: 'technique.iron-head' }, fromSequence([]))).toBe(behind)
    const won = play(atGhost(), [[{ type: 'combat.round' }, [6, 5, 1, 1]]])
    expect(reduce(won, { type: 'combat.technique', id: 'technique.blue-dragon' }, fromSequence([]))).toBe(won)
  })

  it('fleeing costs the last blow and a Dishonor Point (R38, R39)', () => {
    const s = reduce(atGhost(), { type: 'combat.leave' }, fromSequence([]))
    expect(s.screen).toBe('beat')
    expect(s.sheet.endurance).toBe(18)
    expect(s.sheet.dishonor).toBe(1)
    expect(s.deeds).toContain('fled dexterous ghost · dishonor +1')
  })

  it('the treasure roll is offered once after a victory (R78, I-30b)', () => {
    const s = play(atGhost(), [
      [{ type: 'combat.round' }, [6, 5, 1, 1]],
      [{ type: 'combat.strike' }, []],
      [{ type: 'combat.treasure' }, [3]],
    ])
    expect(s.result).toMatchObject({ kind: 'treasure', face: 3, band: 'Up to 16' })
    expect(reduce(s, { type: 'combat.treasure' }, fromSequence([4]))).toBe(s)
  })

  it('the Master down ends the world: leaving starts a new record', () => {
    const down = { ...atGhost(), sheet: { ...atGhost().sheet, endurance: 1 } }
    const s = play(down, [[{ type: 'combat.round' }, [1, 1, 6, 6]]])
    expect(s.sheet.endurance).toBe(0)
    expect(s.combat?.over).toEqual({ ended: true, reason: 'master-down' })
    const again = reduce(s, { type: 'combat.leave' }, randomSource(() => 0.5))
    expect(again.sheet.endurance).toBe(20)
    expect(again.deeds).toEqual([])
  })
})

describe('the rest of the record', () => {
  it('keeps a passage and clears the draft; an empty draft is not kept', () => {
    const s = play(fresh(), [
      [{ type: 'draft', text: '  The gate was older than the tree.  ' }, []],
      [{ type: 'passage.keep' }, []],
      [{ type: 'passage.keep' }, []],
    ])
    expect(s.passages).toEqual(['The gate was older than the tree.'])
    expect(s.draft).toBe('')
  })

  it('travels only along the region’s points', () => {
    const s = fresh()
    expect(reduce(s, { type: 'region.travel', to: 3 }, fromSequence([])).here).toBe(3)
    expect(reduce(s, { type: 'region.travel', to: 99 }, fromSequence([]))).toBe(s)
  })

  it('filters and opens the rules panel', () => {
    const s = play(fresh(), [
      [{ type: 'rules.filter', filter: 'reading' }, []],
      [{ type: 'rules.open', id: 'combat.opponent-proficiency-is-the-higher' }, []],
    ])
    expect(s.filter).toBe('reading')
    expect(s.openId).toBe('combat.opponent-proficiency-is-the-higher')
    expect(reduce(s, { type: 'rules.open', id: s.openId }, fromSequence([])).openId).toBeNull()
  })

  it('never mutates the state it was given', () => {
    const s = fresh()
    const frozen = JSON.stringify(s)
    play(s, [
      [{ type: 'option', id: FORCE }, [1, 1]],
      [{ type: 'option', id: GO_IN }, []],
      [{ type: 'option', id: FIGHT }, []],
      [{ type: 'combat.round' }, [6, 5, 1, 1]],
    ])
    expect(JSON.stringify(s)).toBe(frozen)
  })
})
