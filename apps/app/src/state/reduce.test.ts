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
import { actFor, fromSequence, withDefeated, withKey } from '@martial-havoc/engine'
import { theFiveTreasures } from '@martial-havoc/content'
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
const VIXEN = 'foe.old-vixen'
const GOURD = 'treasure.the-5-treasures.gold-and-red-gourd'
const CORD = 'treasure.the-5-treasures.dazzling-golden-cord'
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

  it('walks back down to Fen Pass from the mountain, and from nowhere else', () => {
    // Phase 10b: the trail is the only way onto the mountain, so it is
    // the only way off it. The region is the ending's business now.
    const s = reduce(fresh(), { type: 'cave.village' }, fromSequence([]))
    expect(s.screen).toBe('village')
    expect(menuFor(fresh()).some((o) => o.action.kind === 'village')).toBe(true)
    expect(
      menuFor(play(fresh(), walk(AREA.entrance))).some((o) => o.action.kind === 'village'),
    ).toBe(false)
  })

  it('does not offer the region before the adventure is over', () => {
    // It used to sit on the start area, which offered a way out of an
    // adventure the Master had not yet walked into (Phase 10b).
    expect(menuFor(fresh()).some((o) => o.action.kind === 'leave')).toBe(false)
    expect(
      menuFor(play(fresh(), walk(AREA.entrance))).some((o) => o.action.kind === 'leave'),
    ).toBe(false)
  })
})

describe('the opening: the village as the Call (Phase 10b)', () => {
  it('leaves a fresh record standing on the mountain but not having entered it', () => {
    const r = fresh()
    expect(r.cave.area).toBe(AREA.mountain)
    expect(r.cave.visited).toEqual([])
    expect(r.deeds).toEqual([])
  })

  it('records the arrival and the point of no return when the trail is taken', () => {
    const climbed = reduce(fresh(), { type: 'village.trail' }, fromSequence([]))
    expect(climbed.screen).toBe('beat')
    expect(climbed.cave.visited).toEqual([AREA.mountain])
    expect(climbed.deeds).toEqual(['took the trail'])
  })

  it('keeps the visited list in the order the areas were entered', () => {
    // The brief's scripted first act: trail, cave entrance, dining hall.
    const walked = play(reduce(fresh(), { type: 'village.trail' }, fromSequence([])), [
      ...walk(AREA.entrance),
      ...walk(AREA.hall),
    ])
    expect(walked.cave.visited).toEqual([AREA.mountain, AREA.entrance, AREA.hall])
  })

  it('does not record the trail twice when the Master walks back down and up again', () => {
    const there = reduce(fresh(), { type: 'village.trail' }, fromSequence([]))
    const back = reduce(there, { type: 'cave.village' }, fromSequence([]))
    const again = reduce(back, { type: 'village.trail' }, fromSequence([]))
    expect(back.screen).toBe('village')
    expect(again.cave.visited).toEqual([AREA.mountain])
    expect(again.deeds).toEqual(['took the trail'])
  })
})

describe('every way a fight ends is a moment (Phase 10d)', () => {
  /** In the Attendants room, facing the Dexterous Ghost. */
  const atGhost = (): RecordState =>
    reduce(toGhost(), { type: 'cave.fight', foe: GHOST }, fromSequence([]))

  /**
   * The dice that tie a round: Master 3+4+12 = 19, Ghost 4+4+11 = 19.
   * Everything after them is the Unexpected Event's own 2d6 and
   * whatever reading I-30 makes of the row.
   */
  const TIE: readonly Die[] = [3, 4, 4, 4]

  it('narrates a flight on the beat: the last blow, the Dishonor, the foe left behind', () => {
    const before = atGhost()
    const fled = reduce(before, { type: 'combat.leave' }, fromSequence([]))
    expect(fled.screen).toBe('beat')
    expect(fled.result?.kind).toBe('flee')
    const r = fled.result as Extract<typeof fled.result, { kind: 'flee' }>
    // R38: a last blow of 2. I-32: a Dishonor Point for not getting
    // away clean.
    expect(r.before - r.after).toBe(2)
    expect(r.dishonor).toBe(1)
    expect(r.foe).toBe('Dexterous Ghost')
    expect(fled.sheet.endurance).toBe(before.sheet.endurance - 2)
    expect(fled.sheet.dishonor).toBe(before.sheet.dishonor + 1)
    // The encounter is left behind entirely: it does not follow (I-32).
    expect(fled.pending).toEqual([])
  })

  it('gives an Ambush one unopposed round, then a fair one', () => {
    // Event 1 is "Ambush!" at the Cave entrance; the second face is the
    // area's creature. The first round is theirs: the Master rolls
    // SKILL and 2d6 with no Proficiency at all (I-08a).
    const ambushed = play(reduce(fresh(), { type: 'village.trail' }, fromSequence([])), [
      [{ type: 'cave.go', to: AREA.entrance }, [1, 2]],
      [{ type: 'roll.close' }, []],
    ])
    const turn = ambushed.result as Extract<typeof ambushed.result, { kind: 'turn' }>
    expect(turn.event).toBe('ambush')
    const foe = ambushed.pending[0] ?? ''
    const fighting = reduce(ambushed, { type: 'cave.fight', foe }, fromSequence([]))
    expect(fighting.combat?.ambush).toBe(true)

    // The same four faces, with the ambush and without it: the Master's
    // total is lower by exactly the Proficiency the reading takes away.
    // The tail is spare - one of the two rounds ties on these faces and
    // an Unexpected Event has its own dice to draw.
    const spare: readonly Die[] = [3, 3, 3, 3, 1, 1, 1, 1]
    const caught = reduce(fighting, { type: 'combat.round' }, fromSequence(spare))
    const fair = reduce(
      { ...fighting, combat: { ...fighting.combat, ambush: false } as NonNullable<RecordState['combat']> },
      { type: 'combat.round' },
      fromSequence(spare),
    )
    const caughtTotal = caught.combat?.last?.master.total ?? 0
    const fairTotal = fair.combat?.last?.master.total ?? 0
    expect(caughtTotal).toBeLessThan(fairTotal)
    // And the ambush is spent: whatever that round was, the next is fair.
    expect(caught.combat?.ambush).toBe(false)
  })

  it('puts the player back in the round on a row that says the fight resumes', () => {
    // The tie, then an Unexpected Event of 3 and 3: total 6, "The fight
    // resumes" (R32) - the one row whose printed text states its effect.
    const tied = play(atGhost(), [[{ type: 'combat.round' }, [...TIE, 3, 3]]])
    expect(tied.combat?.event?.roll.total).toBe(6)
    expect(tied.combat?.event?.reading?.kind).toBe('fight-resumes')
    const endurance = tied.combat?.foeEndurance
    const resumed = reduce(tied, { type: 'combat.resume' }, fromSequence([]))
    expect(resumed.combat?.event).toBeNull()
    expect(resumed.combat?.over.ended).toBe(false)
    expect(resumed.combat?.foeEndurance).toBe(endurance)
    expect(resumed.screen).toBe('combat')
  })

  it('leaves the foe in the room after an environmental change', () => {
    // 2 and 3: total 5. The fight is over; the room is not empty.
    const tied = play(atGhost(), [[{ type: 'combat.round' }, [...TIE, 2, 3]]])
    expect(tied.combat?.event?.reading?.kind).toBe('environmental-change')
    const back = reduce(tied, { type: 'combat.leave' }, fromSequence([]))
    expect(back.screen).toBe('beat')
    expect(back.pending).toContain(GHOST)
    expect(menuFor(back).some((o) => o.action.kind === 'fight')).toBe(true)
  })

  it('brings Minions into the room on row 7', () => {
    // 3 and 4: total 7, Reinforcements. A minion die of 3 is two of
    // them (I-33), and they are waiting when the Master steps back out.
    const tied = play(atGhost(), [[{ type: 'combat.round' }, [...TIE, 3, 4, 3]]])
    expect(tied.combat?.event?.reading?.kind).toBe('reinforcements')
    expect(tied.combat?.event?.minions?.count).toBe(2)
    const back = reduce(tied, { type: 'combat.leave' }, fromSequence([]))
    // The Ghost that was fought, plus the two who arrived.
    expect(back.pending.filter((id) => id === GHOST)).toHaveLength(3)
  })

  it("takes I-30's injury off whoever the row names, at once", () => {
    // 1 and 2: total 3, injury or loss of weapon for the Master. I-30's
    // floor is -1d6 ENDURANCE, and the next face is it.
    const before = atGhost()
    const hurt = reduce(before, { type: 'combat.round' }, fromSequence([...TIE, 1, 2, 4]))
    expect(hurt.combat?.event?.injury).toEqual({ target: 'master', amount: 4 })
    expect(hurt.sheet.endurance).toBe(before.sheet.endurance - 4)
  })

  it('rolls the Deities table on a divine intervention and prints its three words', () => {
    // 1 and 1: total 2, adverse divine intervention. R34's banded
    // d6 x d6 follows, and 1,1 is the Rakshasa.
    const tied = play(atGhost(), [[{ type: 'combat.round' }, [...TIE, 1, 1, 1, 1]]])
    expect(tied.combat?.event?.reading).toEqual({ kind: 'divine-intervention', favourable: false })
    expect(tied.combat?.event?.deity).toEqual({
      name: 'Rakshasa',
      action: 'Protector',
      object: 'Purity',
    })
  })

  it('empties the room of a foe whose Morale broke, and fills it on a rally', () => {
    // 2 and 2: total 4, a retreat row (sealed: spec.md).
    const tied = play(atGhost(), [[{ type: 'combat.round' }, [...TIE, 2, 2]]])
    expect(tied.combat?.event?.retreatRow).toBe(true)
    // Morale 1 is flight: the Ghost is gone from the room.
    const broke = reduce(tied, { type: 'combat.morale' }, fromSequence([1]))
    expect(reduce(broke, { type: 'combat.leave' }, fromSequence([])).pending).not.toContain(GHOST)
    // Morale 6 is a rally, and +1d6 more arrive beside it.
    const rallied = reduce(tied, { type: 'combat.morale' }, fromSequence([6, 2]))
    const after = reduce(rallied, { type: 'combat.leave' }, fromSequence([]))
    expect(after.pending.filter((id) => id === GHOST)).toHaveLength(3)
  })
})

describe('the act ladder (Phase 10c)', () => {
  /** Which acts the record has been told about. */
  const seen = (s: RecordState): readonly number[] => s.actsSeen

  it('starts on act 1 with nothing announced, since no slip has been dismissed', () => {
    const r = reduce(fresh(), { type: 'village.trail' }, fromSequence([]))
    expect(actFor(theFiveTreasures, r.cave)?.act).toBe(1)
    expect(seen(r)).toEqual([])
  })

  it('turns to act 2 on entering the cave, and marks it seen once', () => {
    const inside = play(reduce(fresh(), { type: 'village.trail' }, fromSequence([])), [
      ...walk(AREA.entrance),
    ])
    expect(actFor(theFiveTreasures, inside.cave)?.act).toBe(2)
    const dismissed = reduce(inside, { type: 'act.seen' }, fromSequence([]))
    expect(seen(dismissed)).toEqual([2])
    // Dismissing again is a no-op: a rung is announced once.
    expect(seen(reduce(dismissed, { type: 'act.seen' }, fromSequence([])))).toEqual([2])
  })

  it('does not announce an act again after walking out and back in', () => {
    const there = play(reduce(fresh(), { type: 'village.trail' }, fromSequence([])), [
      ...walk(AREA.entrance),
    ])
    const dismissed = reduce(there, { type: 'act.seen' }, fromSequence([]))
    const out = play(dismissed, [...walk(AREA.mountain), ...walk(AREA.entrance)])
    expect(actFor(theFiveTreasures, out.cave)?.act).toBe(2)
    expect(seen(out)).toEqual([2])
  })

  it('announces the rung actually reached, not the ones stepped over', () => {
    // Act 3 wants the Chieftain quarter entered and act 4 wants Golden
    // Horn down. A Master who kills him first is on act 4 and was never
    // on act 3, so act 3 is not something they are owed a slip for.
    const killed = { ...fresh(), cave: withDefeated(fresh().cave, 'foe.senior-king-golden-horn') }
    expect(actFor(theFiveTreasures, killed.cave)?.act).toBe(4)
    expect(seen(reduce(killed, { type: 'act.seen' }, fromSequence([])))).toEqual([4])
  })
})

describe("the boss's door: the story outranks the dice (MH p.84, R82)", () => {
  /** In the Attendants room holding the key, one step from the Chieftain quarter. */
  const atTheDoor = (): RecordState => {
    const base = play(reduce(fresh(), { type: 'village.trail' }, fromSequence([])), [
      ...walk(AREA.entrance),
      ...walk(AREA.hall),
      ...walk(AREA.attendants),
    ])
    return { ...base, cave: withKey(base.cave, KEY) }
  }

  it('reads a quiet roll at the boss door as an Encounter, and says the roll happened', () => {
    // 4 is Safe exploration on the printed table. The die is drawn and
    // kept; only what it is read as changes.
    const through = play(atTheDoor(), [
      [{ type: 'cave.go', to: AREA.chieftain }, [4, 1]],
      [{ type: 'roll.close' }, []],
    ])
    expect(through.result?.kind).toBe('turn')
    const turn = through.result as Extract<typeof through.result, { kind: 'turn' }>
    expect(turn.momentum).toBe(true)
    expect(turn.eventFace).toBe(4)
    expect(turn.eventText).toBe('Safe exploration')
    expect(turn.event).toBe('encounter')
  })

  it('leaves a roll that already brings an encounter alone', () => {
    const through = play(atTheDoor(), [
      [{ type: 'cave.go', to: AREA.chieftain }, [2, 1]],
      [{ type: 'roll.close' }, []],
    ])
    const turn = through.result as Extract<typeof through.result, { kind: 'turn' }>
    expect(turn.event).toBe('encounter')
    expect(turn.momentum).toBe(false)
  })

  it('applies to that door only, and not to the rooms on the way', () => {
    const quiet = play(reduce(fresh(), { type: 'village.trail' }, fromSequence([])), [
      ...walk(AREA.entrance),
    ])
    const turn = quiet.result as Extract<typeof quiet.result, { kind: 'turn' }>
    expect(turn.event).toBe('safe')
    expect(turn.momentum).toBe(false)
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
    // Read from a rescue, not a body: the slip calls it a gift.
    expect(s.result).toMatchObject({ kind: 'loot', foe: 'Monk', face: 1, item: 'rosary', gift: true, hint: false })
    expect(s.cave.items).toEqual(['rosary'])
    expect(s.deeds).toEqual(['freed the Monk', 'took the rosary'])
    expect(menuFor(s).some((o) => o.id === 'rescue')).toBe(false)
    expect(reduce(s, { type: 'cave.rescue' }, fromSequence([1]))).toBe(s)
  })

  it('a Devil servant’s 6 is a Hint, not a thing carried: the area’s grey paragraph is revealed (I-08)', () => {
    const met = play(atKitchen(), [
      [{ type: 'cave.go', to: AREA.storage }, [2]],
      [{ type: 'roll.close' }, []],
    ])
    expect(met.pending).toEqual(['foe.devil-servant'])
    const won = play(reduce(met, { type: 'cave.fight', foe: 'foe.devil-servant' }, fromSequence([])), [...finish()])
    const looted = reduce(won, { type: 'combat.loot' }, fromSequence([6]))
    expect(looted.result).toMatchObject({ kind: 'loot', foe: 'Devil servant', face: 6, hint: true, gift: false, key: false, treasure: null })
    expect((looted.result as { item: string }).item).not.toContain('[')
    expect(looted.cave.hints).toContain(AREA.storage)
    expect(looted.cave.items).toEqual([])
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

describe('the gourd swallows the sky (I-45)', () => {
  /** A record standing in the Storage room with the gourd already taken. */
  const holding = (): RecordState => {
    const base = fresh()
    return {
      ...base,
      cave: { ...base.cave, area: AREA.storage, treasures: [GOURD] },
    }
  }

  it('offers no row until the gourd is held', () => {
    const base = fresh()
    const empty = { ...base, cave: { ...base.cave, area: AREA.storage } }
    expect(menuFor(empty).some((o) => o.id === 'gourd')).toBe(false)
    // And the action is refused, not silently accepted.
    expect(reduce(empty, { type: 'cave.gourd' }, fromSequence([]))).toBe(empty)
  })

  it('opens to night and closes back to day, on the printed text', () => {
    const held = holding()
    const open = menuFor(held).find((o) => o.id === 'gourd')
    expect(open?.title).toBe('OPEN THE GOURD')
    expect(open?.note).toBe('DAY')
    // The line under the row is the treasure's own effect, not a gloss.
    expect(open?.line).toContain('swallow the sky')

    const night = reduce(held, { type: 'cave.gourd' }, fromSequence([]))
    expect(night.cave.flags.night).toBe(true)
    expect(night.result).toMatchObject({ kind: 'note', label: 'reading' })
    expect(night.deeds).toEqual(['opened the gourd · night'])
    expect(menuFor(night).find((o) => o.id === 'gourd')?.title).toBe('CLOSE THE GOURD')

    const day = reduce(night, { type: 'cave.gourd' }, fromSequence([]))
    expect(day.cave.flags.night).toBe(false)
    expect(day.deeds).toEqual(['opened the gourd · night', 'closed the gourd · day'])
  })

  it('is refused while a foe is standing, and the row says so', () => {
    const held = holding()
    const engaged = { ...held, pending: [GHOST] }
    expect(menuFor(engaged).find((o) => o.id === 'gourd')?.enabled).toBe(false)
    expect(reduce(engaged, { type: 'cave.gourd' }, fromSequence([]))).toBe(engaged)
  })

  it('empties the Cave entrance of Ogres by night (absences.json, I-45)', () => {
    // The absence is the tables' business, not the reducer's: by night
    // the entrance's 4-5 row meets nothing where by day it meets an Ogre.
    const base = fresh()
    const atEntrance = { ...base, cave: { ...base.cave, area: AREA.storage, treasures: [GOURD] } }
    const byDay = play(atEntrance, [[{ type: 'cave.go', to: AREA.entrance }, [2, 4]]])
    expect(byDay.pending).toEqual(['foe.ogre'])

    const night = reduce(atEntrance, { type: 'cave.gourd' }, fromSequence([]))
    const byNight = play(night, [[{ type: 'cave.go', to: AREA.entrance }, [2, 4]]])
    expect(byNight.pending).toEqual([])
  })
})

describe('the Old Vixen teaches the Cord\u2019s spells (I-41)', () => {
  /** A record with the Vixen beaten and the fight over, one CONTINUE from the beat. */
  const beaten = (): RecordState => {
    const base = fresh()
    return {
      ...base,
      screen: 'combat',
      cave: { ...base.cave, area: AREA.women },
      pending: [VIXEN],
      combat: {
        foeId: VIXEN,
        foeEndurance: 0,
        round: 2,
        last: null,
        event: null,
        morale: null,
        opening: false,
        blow: null,
        techniqueLine: null,
        ambush: false,
        looted: true,
        over: { ended: true, reason: 'final-blow' },
      },
    }
  }

  it('leaves the fight knowing what the Cord does, and says so in the record', () => {
    const before = beaten()
    expect(before.cave.effects).toEqual([])
    expect(before.cave.flags['cord-spells-known']).toBe(false)

    const back = reduce(before, { type: 'combat.leave' }, fromSequence([]))
    expect(back.screen).toBe('beat')
    expect(back.cave.defeated).toEqual([VIXEN])
    expect(back.cave.effects).toEqual([CORD])
    // The flag is the same fact restated for the record, derived from
    // effects rather than set on its own.
    expect(back.cave.flags['cord-spells-known']).toBe(true)
  })

  it('leaves a foe who teaches nothing exactly as it found it', () => {
    const base = fresh()
    const ghost = reduce(
      {
        ...beaten(),
        cave: { ...base.cave, area: AREA.attendants },
        pending: [GHOST],
        combat: { ...(beaten().combat as NonNullable<RecordState['combat']>), foeId: GHOST },
      },
      { type: 'combat.leave' },
      fromSequence([]),
    )
    expect(ghost.cave.effects).toEqual([])
    expect(ghost.cave.flags['cord-spells-known']).toBe(false)
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
      // 6. The Chieftain quarter: the boss's door, so the book's pacing
      //    rule overrules the roll (MH p.84, R82; Phase 10c). A 6 is a
      //    Hint on the printed table and is read as an Encounter here,
      //    which costs a second die for the area's creature - and finds
      //    nobody, since both Kings are already down (I-36). The sheets
      //    are learned from the room, not from the Hint, so they still
      //    come.
      [{ type: 'cave.go', to: AREA.chieftain }, [6, 1]],
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
