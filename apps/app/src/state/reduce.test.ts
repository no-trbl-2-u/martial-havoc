/**
 * The reducer on fixed dice. Every rule it exercises is the engine's;
 * these tests check the wiring: the right engine call, the right place
 * in the record, the override count, and that nothing is mutated.
 *
 * The cave is walked the way the book walks it (5T a1): every die named
 * below is exactly the die the printed procedure asks for - one for the
 * Event, one for the area's creature where the area's table rolls, none
 * where it does not.
 */
import { describe, expect, it } from 'vitest'
import { fromSequence } from '@martial-havoc/engine'
import type { Die } from '@martial-havoc/engine'
import { randomSource } from '../dice/random'
import { menuFor } from './menu'
import { newRecord } from './record'
import { reduce } from './reduce'
import type { Action, RecordState } from './types'

/** A record whose creation dice are all fours: deterministic, no sequence to count. */
const fresh = (): RecordState => newRecord(randomSource(() => 0.5))

/** Apply actions in order, each with its own fixed dice. */
const play = (state: RecordState, steps: readonly (readonly [Action, readonly Die[]])[]): RecordState =>
  steps.reduce((s, [action, faces]) => reduce(s, action, fromSequence(faces)), state)

const AREA = {
  mountain: 'area.the-5-treasures.flat-top-mountain',
  entrance: 'area.the-5-treasures.cave-entrance',
  attendants: 'area.the-5-treasures.attendants-room',
  hall: 'area.the-5-treasures.dining-hall',
  storage: 'area.the-5-treasures.storage-room',
  women: 'area.the-5-treasures.women-quarter',
  kitchen: 'area.the-5-treasures.kitchen',
  chieftain: 'area.the-5-treasures.chieftain-quarter',
} as const

const GHOST = 'foe.dexterous-ghost'
const KEY = 'key.the-5-treasures.private-quarter'
const VASE = 'treasure.the-5-treasures.vase-of-muttonfat-jade'

/** Walk into `to` on a safe Event (4) and close the card. */
const walk = (to: string): readonly (readonly [Action, readonly Die[]])[] => [
  [{ type: 'cave.go', to }, [4]],
  [{ type: 'roll.close' }, []],
]

/** From the mountain to the Attendants room, meeting the Dexterous Ghost there (Event 2, creature 3). */
const toGhost = (): RecordState =>
  play(fresh(), [
    ...walk(AREA.entrance),
    ...walk(AREA.hall),
    [{ type: 'cave.go', to: AREA.attendants }, [2, 3]],
    [{ type: 'roll.close' }, []],
  ])

/** Beat a foe that stands at full ENDURANCE: a won round, an Opening, then doubles. */
const finish = (): readonly (readonly [Action, readonly Die[]])[] => [
  [{ type: 'combat.round' }, [6, 5, 1, 1]],
  [{ type: 'combat.opening' }, []],
  [{ type: 'combat.blow' }, [3, 3]],
]

describe('a new record', () => {
  it('is San Te on the Flat-top mountain with a seven-point region', () => {
    const s = fresh()
    expect(s.sheet).toMatchObject({ name: 'San Te', skill: 8, endurance: 20, luck: 9 })
    expect(s.sheet.techniques).toContain('technique.iron-head')
    expect(s.cave.area).toBe(AREA.mountain)
    expect(s.cave.treasures).toEqual([])
    expect(s.region.points).toHaveLength(7)
    expect(s.overrides).toBe(0)
  })
})

describe('walking the cave (5T a1)', () => {
  it('an exit rolls the Event table at once and opens the card landed', () => {
    const s = play(fresh(), [[{ type: 'cave.go', to: AREA.entrance }, [4]]])
    expect(s.cave.area).toBe(AREA.entrance)
    expect(s.roll).toEqual({ to: AREA.entrance, landed: true })
    expect(s.result).toMatchObject({
      kind: 'turn',
      area: 'Cave entrance',
      eventFace: 4,
      event: 'safe',
      eventText: 'Safe exploration',
      encounterFace: null,
      foes: [],
      hint: false,
    })
    expect(s.pending).toEqual([])
  })

  it('CONTINUE closes the card and keeps the result', () => {
    const s = play(fresh(), [...walk(AREA.entrance)])
    expect(s.roll).toBeNull()
    expect(s.result?.kind).toBe('turn')
  })

  it('an Encounter rolls the area’s creature table and the foe waits on the beat', () => {
    const s = play(fresh(), [[{ type: 'cave.go', to: AREA.entrance }, [2, 5]]])
    expect(s.result).toMatchObject({ event: 'encounter', encounterFace: 5, foes: ['Junior King Silver Horn'] })
    expect(s.pending).toEqual(['foe.junior-king-silver-horn'])
    // With a foe standing, the exits and the rest are refused; facing it is offered.
    const menu = menuFor({ ...s, roll: null })
    expect(menu.find((o) => o.id.startsWith('fight-'))?.title).toBe('FACE THE JUNIOR KING SILVER HORN')
    expect(menu.filter((o) => o.action.kind === 'go').every((o) => !o.enabled)).toBe(true)
    expect(reduce({ ...s, roll: null }, { type: 'cave.go', to: AREA.mountain }, fromSequence([4]))).toMatchObject({ cave: { area: AREA.entrance } })
  })

  it('an Ambush rolls the creature too (Event 1 is an Ambush!)', () => {
    const s = play(fresh(), [[{ type: 'cave.go', to: AREA.entrance }, [1, 2]]])
    expect(s.result).toMatchObject({ event: 'ambush', eventText: 'Ambush!', foes: ['Ogre'] })
  })

  it('a Hint reveals the area’s grey paragraph (I-06b, I-60)', () => {
    const s = play(fresh(), [[{ type: 'cave.go', to: AREA.entrance }, [6]]])
    expect(s.result).toMatchObject({ event: 'hint', hint: true, foes: [] })
    expect(s.cave.hints).toContain(AREA.entrance)
  })

  it('a locked door is refused without its key and draws no die (I-07)', () => {
    const s = play(fresh(), [...walk(AREA.entrance), ...walk(AREA.hall), ...walk(AREA.attendants)])
    const refused = reduce(s, { type: 'cave.go', to: AREA.chieftain }, fromSequence([4]))
    expect(refused).toBe(s)
    const menu = menuFor(s)
    const door = menu.find((o) => o.id === `go-${AREA.chieftain}`)
    expect(door?.enabled).toBe(false)
    expect(door?.note).toBe('LOCKED')
    expect(door?.line).toBe('a paper sliding door')
  })

  it('a night’s rest heals 4 ENDURANCE, never past the initial value', () => {
    const hurt = { ...fresh(), sheet: { ...fresh().sheet, endurance: 18 } }
    const s = reduce(hurt, { type: 'cave.rest' }, fromSequence([]))
    expect(s.sheet.endurance).toBe(20)
    expect(s.result).toEqual({ kind: 'rest', before: 18, after: 20 })
  })

  it('taking the vase holds it once and writes a deed (I-38)', () => {
    const s = play(toGhost(), [
      [{ type: 'cave.fight', foe: GHOST }, []],
      ...finish(),
      [{ type: 'combat.leave' }, []],
      [{ type: 'cave.take', treasure: VASE }, []],
      [{ type: 'cave.take', treasure: VASE }, []],
    ])
    expect(s.cave.treasures).toEqual([VASE])
    expect(s.deeds).toContain('took the Vase of muttonfat jade')
    expect(s.result).toMatchObject({ kind: 'take', treasure: 'Vase of muttonfat jade', held: 1 })
  })

  it('leaves for the region from the mountain', () => {
    const s = reduce(fresh(), { type: 'cave.leave' }, fromSequence([]))
    expect(s.screen).toBe('region')
    expect(menuFor(fresh()).some((o) => o.action.kind === 'leave')).toBe(true)
    expect(menuFor(play(fresh(), walk(AREA.entrance))).some((o) => o.action.kind === 'leave')).toBe(false)
  })
})

describe('my dice on the beat', () => {
  it('MY DICE on: an exit opens the picker; the tapped face is the Event die and counts one override', () => {
    const open = play(fresh(), [
      [{ type: 'roll.manual' }, []],
      [{ type: 'cave.go', to: AREA.entrance }, [4]],
    ])
    expect(open.byHand).toBe(true)
    expect(open.roll).toEqual({ to: AREA.entrance, landed: false })
    expect(open.cave.area).toBe(AREA.mountain)
    const s = play(open, [
      [{ type: 'manual.face', face: 6 }, []],
      [{ type: 'roll' }, [1, 1]], // the table's dice are ignored
    ])
    expect(s.result).toMatchObject({ kind: 'turn', eventFace: 6, event: 'hint' })
    expect(s.roll).toEqual({ to: AREA.entrance, landed: true })
    expect(s.overrides).toBe(1)
    expect(s.manual).toEqual([])
  })

  it('a second tapped face is the creature roll', () => {
    const s = play(fresh(), [
      [{ type: 'roll.manual' }, []],
      [{ type: 'cave.go', to: AREA.entrance }, []],
      [{ type: 'manual.face', face: 2 }, []],
      [{ type: 'manual.face', face: 5 }, []],
      [{ type: 'roll' }, [1, 1]],
    ])
    expect(s.result).toMatchObject({ eventFace: 2, encounterFace: 5, foes: ['Junior King Silver Horn'] })
    expect(s.overrides).toBe(1)
  })

  it('CONTINUE with no face rolls nothing; a tap outside closes with nothing rolled', () => {
    const open = play(fresh(), [
      [{ type: 'roll.manual' }, []],
      [{ type: 'cave.go', to: AREA.entrance }, []],
    ])
    expect(reduce(open, { type: 'roll' }, fromSequence([4]))).toBe(open)
    const closed = reduce(open, { type: 'roll.close' }, fromSequence([]))
    expect(closed.roll).toBeNull()
    expect(closed.cave.area).toBe(AREA.mountain)
    expect(closed.overrides).toBe(0)
  })

  it('a roll the app made is not an override', () => {
    const s = play(fresh(), [[{ type: 'cave.go', to: AREA.entrance }, [4]]])
    expect(s.overrides).toBe(0)
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

describe('the fight with the Dexterous Ghost', () => {
  const atGhost = (): RecordState => reduce(toGhost(), { type: 'cave.fight', foe: GHOST }, fromSequence([]))

  it('starts on the combat screen with the foe’s printed ENDURANCE', () => {
    const s = atGhost()
    expect(s.screen).toBe('combat')
    expect(s.combat).toMatchObject({ foeId: GHOST, foeEndurance: 8, round: 1 })
    // A foe the Event did not bring cannot be fought.
    const before = toGhost()
    expect(reduce(before, { type: 'cave.fight', foe: 'foe.ogre' }, fromSequence([]))).toBe(before)
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
    // The Ghost is not beaten, so it is not gone; but the encounter is over.
    expect(left.cave.defeated).toEqual([])
    expect(left.pending).toEqual([])
  })

  it('an Opening then doubles lands the Final Blow (R29, R30)', () => {
    const s = play(atGhost(), finish())
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

  it('fleeing costs the last blow and a Dishonor Point, and leaves the encounter behind (R38, R39)', () => {
    const s = reduce(atGhost(), { type: 'combat.leave' }, fromSequence([]))
    expect(s.screen).toBe('beat')
    expect(s.sheet.endurance).toBe(18)
    expect(s.sheet.dishonor).toBe(1)
    expect(s.deeds).toContain('fled dexterous ghost · dishonor +1')
    expect(s.pending).toEqual([])
  })

  it('a beaten named foe is gone from every table, and its LOOT line is read once (5T a2, I-33c)', () => {
    const won = play(atGhost(), [...finish()])
    const looted = reduce(won, { type: 'combat.loot' }, fromSequence([]))
    expect(looted.result).toMatchObject({ kind: 'loot', foe: 'Dexterous Ghost', face: null, item: "private quarter's key", key: true, treasure: null })
    expect(looted.cave.keys).toContain(KEY)
    expect(looted.deeds).toContain("took the private quarter's key")
    expect(reduce(looted, { type: 'combat.loot' }, fromSequence([]))).toBe(looted)
    const back = reduce(looted, { type: 'combat.leave' }, fromSequence([]))
    expect(back.screen).toBe('beat')
    expect(back.cave.defeated).toEqual([GHOST])
    expect(back.pending).toEqual([])
    // The key opens the paper door.
    expect(menuFor(back).find((o) => o.id === `go-${AREA.chieftain}`)?.enabled).toBe(true)
  })

  it('the Master down ends the world: leaving starts a new record', () => {
    const down = { ...atGhost(), sheet: { ...atGhost().sheet, endurance: 1 } }
    const s = play(down, [[{ type: 'combat.round' }, [1, 1, 6, 6]]])
    expect(s.sheet.endurance).toBe(0)
    expect(s.combat?.over).toEqual({ ended: true, reason: 'master-down' })
    const again = reduce(s, { type: 'combat.leave' }, randomSource(() => 0.5))
    expect(again.sheet.endurance).toBe(20)
    expect(again.deeds).toEqual([])
    expect(again.cave.area).toBe(AREA.mountain)
  })
})

describe('the Kitchen Monk (I-39) and the Chieftain’s sheets (I-38b)', () => {
  const atKitchen = (): RecordState =>
    play(fresh(), [...walk(AREA.entrance), ...walk(AREA.storage), ...walk(AREA.kitchen)])

  it('freeing him is recorded and rewarded with his LOOT line', () => {
    const s = reduce(atKitchen(), { type: 'cave.rescue' }, fromSequence([1]))
    expect(s.cave.rescued).toEqual(['foe.monk'])
    expect(s.result).toMatchObject({ kind: 'loot', foe: 'Monk', face: 1, item: 'rosary' })
    expect(s.cave.items).toEqual(['rosary'])
    expect(s.deeds).toEqual(['freed the Monk', 'took the rosary'])
    expect(menuFor(s).some((o) => o.id === 'rescue')).toBe(false)
    expect(reduce(s, { type: 'cave.rescue' }, fromSequence([1]))).toBe(s)
  })

  it('attacking him costs a Dishonor Point and starts the fight', () => {
    const s = reduce(atKitchen(), { type: 'cave.attack' }, fromSequence([]))
    expect(s.screen).toBe('combat')
    expect(s.combat?.foeId).toBe('foe.monk')
    expect(s.cave.dishonor).toBe(1)
    expect(s.sheet.dishonor).toBe(1)
  })

  it('the sheets teach the gourd and the fan; once read, the row is gone', () => {
    const inside = { ...fresh(), cave: { ...fresh().cave, area: AREA.chieftain } }
    expect(menuFor(inside).some((o) => o.id === 'learn')).toBe(true)
    const s = reduce(inside, { type: 'cave.learn' }, fromSequence([]))
    expect([...s.cave.effects].sort()).toEqual([
      'treasure.the-5-treasures.gold-and-red-gourd',
      'treasure.the-5-treasures.plantain-fan',
    ])
    expect(s.result).toMatchObject({ kind: 'note', label: 'reading' })
    expect(menuFor(s).some((o) => o.id === 'learn')).toBe(false)
    expect(reduce(s, { type: 'cave.learn' }, fromSequence([]))).toBe(s)
  })
})

describe('the cave, played to its ending on the reducer', () => {
  it('walks the eight areas, takes all five treasures and reaches the ending', () => {
    const KING = 'foe.junior-king-silver-horn'
    const SENIOR = 'foe.senior-king-golden-horn'
    const BEAST = 'foe.skillful-beast'
    const VIXEN = 'foe.old-vixen'
    const beat = (foe: string): readonly (readonly [Action, readonly Die[]])[] => [
      [{ type: 'cave.fight', foe }, []],
      ...finish(),
      [{ type: 'combat.loot' }, []],
      [{ type: 'combat.leave' }, []],
    ]
    const s = play(fresh(), [
      // 1. Into the cave: Encounter, the Junior King; his sword drops once.
      [{ type: 'cave.go', to: AREA.entrance }, [2, 5]],
      [{ type: 'roll.close' }, []],
      ...beat(KING),
      // 2. The Storage room: safe; the gourd off the shelves.
      ...walk(AREA.storage),
      [{ type: 'cave.take', treasure: 'treasure.the-5-treasures.gold-and-red-gourd' }, []],
      // 3. The Kitchen: safe; the Monk freed.
      ...walk(AREA.kitchen),
      [{ type: 'cave.rescue' }, [5]],
      // 4. The Dining Hall: Encounter, 6, the Senior King; the fan.
      [{ type: 'cave.go', to: AREA.hall }, [2, 6]],
      [{ type: 'roll.close' }, []],
      ...beat(SENIOR),
      // 5. The Attendants room: Encounter, 1, the Skillful Beast; the key. The vase.
      [{ type: 'cave.go', to: AREA.attendants }, [2, 1]],
      [{ type: 'roll.close' }, []],
      ...beat(BEAST),
      [{ type: 'cave.take', treasure: VASE }, []],
      // 6. The Chieftain quarter: Hint; the sheets.
      [{ type: 'cave.go', to: AREA.chieftain }, [6]],
      [{ type: 'roll.close' }, []],
      [{ type: 'cave.learn' }, []],
      // 7. The Women quarter: Encounter, fixed: the Old Vixen; the Cord.
      [{ type: 'cave.go', to: AREA.women }, [2]],
      [{ type: 'roll.close' }, []],
      ...beat(VIXEN),
    ])
    expect(s.cave.treasures).toHaveLength(5)
    expect(s.cave.defeated).toEqual([KING, SENIOR, BEAST, VIXEN])
    expect(s.cave.rescued).toEqual(['foe.monk'])
    expect(s.cave.items).toContain('elixir')
    expect(s.screen).toBe('beat')
    expect(menuFor(s).some((o) => o.action.kind === 'leave')).toBe(true)
    // Sword, gourd, the Monk's elixir, fan, key, vase, cord.
    expect(s.deeds.filter((d) => d.startsWith('took the'))).toHaveLength(7)
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
      [{ type: 'cave.go', to: AREA.entrance }, [2, 5]],
      [{ type: 'roll.close' }, []],
      [{ type: 'cave.fight', foe: 'foe.junior-king-silver-horn' }, []],
      [{ type: 'combat.round' }, [6, 5, 1, 1]],
    ])
    expect(JSON.stringify(s)).toBe(frozen)
  })
})
