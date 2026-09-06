/**
 * The phase's done-condition: **a scripted Master reaches the ending
 * screen on fixed dice.**
 *
 * This is the one test in the engine that loads the real adventure. It
 * is a test, so it may import the content package by value; no source
 * file may (`../purity.test.ts`), and that is the whole point - the
 * engine is handed the cave, it does not know it.
 *
 * The walk, and why each step is there:
 *
 * | # | Into | Event | What happens |
 * |---|---|---|---|
 * | 1 | Cave entrance | Encounter, 5 | the Junior King; his seven-star sword |
 * | 2 | Storage room  | Safe         | the gourd, off the shelves (I-38) |
 * | 3 | Kitchen       | Safe         | the Monk freed, not fought (I-39) |
 * | 4 | Dining Hall   | Encounter, 6 | the Senior King; the Plantain fan |
 * | 5 | Attendants    | Encounter, 1 | the Skillful Beast; the key (I-07) |
 * | 6 | Chieftain     | Hint         | the sheets; two effects learnt (I-38b) |
 * | 7 | Women quarter | Encounter    | fixed (I-34): the Old Vixen; the Cord |
 *
 * Five treasures in hand at the end of step 7, which satisfies the
 * ending act. Every die below is exactly the die the printed procedure
 * asks for: one for the event, one for the area's creature where the
 * area's table rolls, none where it does not.
 */
import { describe, expect, it } from 'vitest'
import { theFiveTreasures } from '@martial-havoc/content'
import { fromSequence } from '../dice/sources'
import { beginAdventure } from './state'
import { lootFrom, takeDrop } from './loot'
import { learnFrom } from './hints'
import { actFor, ending, isEnded } from './acts'
import { attackRescue, rescue, resolveEncounter, step, takeHere } from './run'
import type { AdventureState } from './state'

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

const TREASURE = {
  gourd: 'treasure.the-5-treasures.gold-and-red-gourd',
  cord: 'treasure.the-5-treasures.dazzling-golden-cord',
  vase: 'treasure.the-5-treasures.vase-of-muttonfat-jade',
  fan: 'treasure.the-5-treasures.plantain-fan',
  sword: 'treasure.the-5-treasures.seven-star-sword',
} as const

/** Defeat `foe`, take what it carries, and record it as gone. */
const beat = (state: AdventureState, foe: string, dice: readonly number[]): AdventureState =>
  takeDrop(resolveEncounter(state, [foe]), lootFrom(theFiveTreasures, foe)(fromSequence(dice)).row)

describe('The 5 Treasures, played to its ending on fixed dice', () => {
  it('starts on the Flat-top mountain with nothing', () => {
    const state = beginAdventure(theFiveTreasures)
    expect(state.area).toBe(AREA.mountain)
    expect(state.treasures).toEqual([])
    expect(actFor(theFiveTreasures, state)?.act).toBe(1)
    expect(isEnded(theFiveTreasures, state)).toBe(false)
  })

  it('walks the cave, takes all five treasures and reaches the ending screen', () => {
    let state = beginAdventure(theFiveTreasures)

    // 1. Into the cave. Event 2 = Encounter; the entrance's 5 is the
    //    Junior King, whose sword drops once (I-33c).
    const one = step(theFiveTreasures, state, AREA.entrance, fromSequence([2, 5]))
    expect(one.event?.kind).toBe('encounter')
    expect(one.encounter?.foes.map((f) => f.id)).toEqual(['foe.junior-king-silver-horn'])
    state = beat(one.state, 'foe.junior-king-silver-horn', [])
    expect(state.treasures).toContain(TREASURE.sword)
    expect(actFor(theFiveTreasures, state)?.act).toBe(2)

    // 2. The Storage room. Event 4 = Safe exploration; the gourd is on
    //    the shelves, not on a body (I-38).
    const two = step(theFiveTreasures, state, AREA.storage, fromSequence([4]))
    expect(two.event?.kind).toBe('safe')
    expect(two.encounter).toBeUndefined()
    state = takeHere(theFiveTreasures, two.state, TREASURE.gourd)
    expect(state.treasures).toContain(TREASURE.gourd)

    // 3. The Kitchen. Safe again; the Monk in the pool is freed rather
    //    than fought, and the reward is his loot roll (I-39).
    const three = step(theFiveTreasures, state, AREA.kitchen, fromSequence([4]))
    state = rescue(theFiveTreasures, three.state)
    expect(state.rescued).toEqual(['foe.monk'])
    expect(state.dishonor).toBe(0)
    state = takeDrop(state, lootFrom(theFiveTreasures, 'foe.monk')(fromSequence([5])).row)
    expect(state.items).toContain('elixir')

    // 4. The Dining Hall. Event 2 = Encounter; the hall's 6 is the
    //    Senior King, and the Plantain fan is his.
    const four = step(theFiveTreasures, state, AREA.hall, fromSequence([2, 6]))
    expect(four.encounter?.foes.map((f) => f.id)).toEqual(['foe.senior-king-golden-horn'])
    state = beat(four.state, 'foe.senior-king-golden-horn', [])
    expect(state.treasures).toContain(TREASURE.fan)
    expect(actFor(theFiveTreasures, state)?.act).toBe(4)

    // 5. The Attendants room. Event 2 = Encounter; 1 is the Skillful
    //    Beast, who carries the private quarter's key (I-07). The jade
    //    vase stands on its pedestal (I-38).
    const five = step(theFiveTreasures, state, AREA.attendants, fromSequence([2, 1]))
    expect(five.encounter?.foes.map((f) => f.id)).toEqual(['foe.skillful-beast'])
    state = beat(five.state, 'foe.skillful-beast', [])
    expect(state.keys).toEqual(['key.the-5-treasures.private-quarter'])
    state = takeHere(theFiveTreasures, state, TREASURE.vase)
    expect(state.treasures).toContain(TREASURE.vase)

    // 6. Past the paper door. Event 6 = Hint: the sheets on the lectern,
    //    which explain how two of the treasures work (I-38b, I-60).
    const six = step(theFiveTreasures, state, AREA.chieftain, fromSequence([6]))
    expect(six.passage.ok).toBe(true)
    expect(six.hintRevealed).toBe(true)
    state = learnFrom(theFiveTreasures, six.state, AREA.chieftain)
    expect(state.effects).toContain(TREASURE.fan)
    expect(state.effects).toContain(TREASURE.gourd)
    expect(actFor(theFiveTreasures, state)?.act).toBe(4)
    expect(isEnded(theFiveTreasures, state)).toBe(false)

    // 7. The Women quarter. Event 2 = Encounter; the quarter's line
    //    prints no dice, so it is fixed and draws none (I-34). The Old
    //    Vixen carries the Dazzling Golden Cord.
    const seven = step(theFiveTreasures, state, AREA.women, fromSequence([2]))
    expect(seven.encounter?.foes.map((f) => f.id)).toEqual([
      'foe.old-vixen',
      'foe.devil-servant',
    ])
    state = beat(seven.state, 'foe.old-vixen', [])
    expect(state.treasures).toContain(TREASURE.cord)

    // The ending screen.
    expect(state.treasures).toHaveLength(5)
    expect(isEnded(theFiveTreasures, state)).toBe(true)
    const finish = ending(theFiveTreasures, state)
    expect(finish?.act.name).toBe('The 5 Treasures')
    expect(finish?.line).toContain('Gourd, cord, vase, fan and sword')
    expect(finish?.dishonor).toBe(0)
    expect([...(finish?.treasures ?? [])].sort()).toEqual(
      [TREASURE.cord, TREASURE.fan, TREASURE.gourd, TREASURE.sword, TREASURE.vase].sort(),
    )
    expect(actFor(theFiveTreasures, state)?.act).toBe(5)
  })

  it('keeps the Kings one entity across the tables they appear in (I-33c)', () => {
    // Beaten at the Cave entrance, the Junior King is gone from the
    // Dining Hall too - his row there meets nothing.
    const state = resolveEncounter(
      beginAdventure(theFiveTreasures),
      ['foe.junior-king-silver-horn'],
    )
    const hall = step(theFiveTreasures, state, AREA.entrance, fromSequence([2, 5]))
    expect(hall.encounter?.empty).toBe(true)
  })

  it('locks the Private Quarters until an attendant is beaten (I-07)', () => {
    const state = beginAdventure(theFiveTreasures)
    // Standing in the Attendants room without the key.
    const atDoor = { ...state, area: AREA.attendants }
    const refused = step(theFiveTreasures, atDoor, AREA.chieftain, fromSequence([]))
    expect(refused.passage).toMatchObject({
      ok: false,
      reason: 'locked',
      key: 'key.the-5-treasures.private-quarter',
    })
  })

  it('sends the Ogres out hunting once the gourd makes it night (I-45)', () => {
    const state = beginAdventure(theFiveTreasures)
    const day = step(theFiveTreasures, state, AREA.entrance, fromSequence([2, 3]))
    expect(day.encounter?.foes.map((f) => f.id)).toEqual(['foe.ogre'])
    const night = step(
      theFiveTreasures,
      { ...state, flags: { ...state.flags, night: true } },
      AREA.entrance,
      fromSequence([2, 3]),
    )
    expect(night.encounter?.empty).toBe(true)
  })

  it('scores a Dishonor Point for attacking the Monk instead of freeing him (I-39)', () => {
    const state = beginAdventure(theFiveTreasures)
    const inKitchen = { ...state, area: AREA.kitchen }
    expect(attackRescue(theFiveTreasures, inKitchen).dishonor).toBe(1)
  })
})
