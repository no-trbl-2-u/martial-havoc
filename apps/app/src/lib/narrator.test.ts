/**
 * The narrator's wiring, held to the content and to the guide.
 *
 * `packages/content/src/voice.test.ts` proves the *lines* obey
 * `plan/VOICE.md`. This file proves the *app* can reach them: that
 * every moment has a line, every line has a moment, and every result
 * kind the beat can produce resolves to one of them (or to a silence
 * that was chosen rather than fallen into).
 */
import { describe, expect, it } from 'vitest'
import { resultLines } from '@martial-havoc/content'
import { NARRATOR_MOMENTS, momentOf, momentOfFightEnd, narrate, narrateResult } from './narrator'
import type { Result } from '../state/types'

/** A `turn` result with everything quiet; each test bends one field. */
const turn = (over: Partial<Extract<Result, { kind: 'turn' }>> = {}) =>
  ({
    kind: 'turn',
    area: 'Storage room',
    eventFace: 3,
    event: 'safe',
    eventText: 'Safe exploration',
    encounterFace: null,
    foes: [],
    hint: false,
    ...over,
  }) as Result

/** A `loot` result with nothing special about the drop. */
const loot = (over: Partial<Extract<Result, { kind: 'loot' }>> = {}) =>
  ({
    kind: 'loot',
    foe: 'Devil servant',
    face: 4,
    item: 'A knife',
    treasure: null,
    key: false,
    gift: false,
    hint: false,
    ...over,
  }) as Result

describe('the moment vocabulary is closed in both directions', () => {
  it('gives every declared moment a line', () => {
    const missing = NARRATOR_MOMENTS.filter((m) => narrate(m, 'Lin Shu') === null)
    expect(missing, `moments with no line: ${missing.join(', ')}`).toEqual([])
  })

  it('gives every line a moment the app can reach', () => {
    const declared = new Set(NARRATOR_MOMENTS)
    const orphans = resultLines.filter((r) => !declared.has(r.moment)).map((r) => r.moment)
    expect(orphans, `lines no moment reaches: ${orphans.join(', ')}`).toEqual([])
  })

  it('declares each moment once', () => {
    expect(new Set(NARRATOR_MOMENTS).size).toBe(NARRATOR_MOMENTS.length)
  })
})

describe('a beat result resolves to the moment its slip is about', () => {
  it('names the check and its outcome', () => {
    const check = (kind: 'skill' | 'luck', success: boolean) =>
      momentOf({
        kind: 'check',
        check: kind,
        roll: { a: 1, b: 2, total: 3 },
        threshold: 7,
        success,
        doubleSix: false,
        proficiency: null,
        luckAfter: null,
      } as Result)
    expect(check('skill', true)).toBe('check.skill.passed')
    expect(check('skill', false)).toBe('check.skill.failed')
    expect(check('luck', true)).toBe('check.luck.passed')
    expect(check('luck', false)).toBe('check.luck.failed')
  })

  it('puts who was met above what the Event row was called', () => {
    // An Encounter that brought somebody is the encounter moment...
    expect(momentOf(turn({ event: 'encounter', foes: ['Devil servant'] }))).toBe('turn.encounter')
    // ...and one that brought nobody is an empty room, not an encounter.
    expect(momentOf(turn({ event: 'encounter', foes: [] }))).toBe('turn.nothing')
  })

  it('tells a safe entry, a revealed Hint and an ambush apart', () => {
    expect(momentOf(turn({ event: 'safe' }))).toBe('turn.safe')
    expect(momentOf(turn({ event: 'hint', hint: true }))).toBe('turn.hint')
    expect(momentOf(turn({ event: 'ambush' }))).toBe('turn.ambush')
  })

  it('reads a loot row the way the slip reads it', () => {
    expect(momentOf(loot())).toBe('loot.item')
    expect(momentOf(loot({ treasure: 'Purple Gold Gourd' }))).toBe('loot.treasure')
    expect(momentOf(loot({ key: true }))).toBe('loot.key')
    expect(momentOf(loot({ hint: true }))).toBe('loot.hint')
    // A rescue's reward is a gift, and the gift line is the rescue's.
    expect(momentOf(loot({ gift: true }))).toBe('loot.gift')
  })

  it('narrates a rest and a treasure taken', () => {
    expect(momentOf({ kind: 'rest', before: 4, after: 8 } as Result)).toBe('rest')
    expect(momentOf({ kind: 'take', treasure: 'Plantain Fan', held: 2 } as Result)).toBe('take')
  })

  it('keeps quiet on a note, which is already the app speaking', () => {
    const note = { kind: 'note', title: 'A', text: 'B', label: 'invention', cite: 'x' } as Result
    expect(momentOf(note)).toBeNull()
    expect(narrateResult(note, 'Lin Shu')).toBeNull()
  })
})

describe('a fight end resolves to the moment a listener would name', () => {
  it('calls a final blow and a downed opponent the same thing', () => {
    expect(momentOfFightEnd('final-blow')).toBe('kill')
    expect(momentOfFightEnd('opponent-down')).toBe('kill')
  })

  it('names the Master going down', () => {
    expect(momentOfFightEnd('master-down')).toBe('down')
  })

  it('keeps quiet on the tie, which prints the table\'s own line already', () => {
    expect(momentOfFightEnd('unexpected-event')).toBeNull()
  })
})

describe('the line comes back filled and never as a placeholder', () => {
  it('puts the Master\'s name where the template asks for it', () => {
    const line = narrate('turn.ambush', 'Lin Shu')
    expect(line).toContain('Lin Shu')
    expect(line).not.toContain('{name}')
  })

  it('answers an unknown moment with silence, not a bracketed id', () => {
    expect(narrate('no.such.moment', 'Lin Shu')).toBeNull()
    expect(narrate(null, 'Lin Shu')).toBeNull()
  })
})
