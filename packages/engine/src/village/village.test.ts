/**
 * The trail-head village, under fixed dice.
 *
 * Every roll here comes from `fromSequence`, so nothing in this file is
 * random and a failure names a rule rather than a seed. The four groups
 * are the phase's done-condition, one each: money, buy, LUCK recovery,
 * a night's rest — plus the village table itself, which is fixed data
 * and so can be asserted exactly.
 */
import { describe, expect, it } from 'vitest'
import type { MarketItem, VillagePlace } from '@martial-havoc/content'
import { fromSequence } from '../dice/sources'
import {
  SP_PER_GP,
  buy,
  fromSilver,
  locationsOf,
  placeRunning,
  priceInSilver,
  spend,
  stayTheNight,
  templeVisit,
  toSilver,
  trailOf,
} from './village'
import { villageBehaviours } from './behaviours'

/**
 * Two Market rows, one priced in each denomination — the whole point of
 * the silver conversion. Hand-built rather than imported so the test
 * proves the arithmetic, not the shipped table.
 */
const INCENSE: MarketItem = {
  id: 'market.common.incense',
  cite: 'MH p.52-55',
  list: 'common',
  item: 'Incense',
  priceGp: null,
  priceSp: 5,
  flags: ['underTwentyGp'],
}
const LANTERN: MarketItem = {
  id: 'market.common.lantern',
  cite: 'MH p.52-55',
  list: 'common',
  item: 'Lantern',
  priceGp: 1,
  priceSp: null,
  flags: ['underTwentyGp'],
}
const STALL_ROW: readonly MarketItem[] = [INCENSE, LANTERN]

/** A miniature village: two locations and a trail. */
const PLACES: readonly VillagePlace[] = [
  {
    id: 'village.place.temple',
    cite: 'spec.md, Horizon; MH p.47',
    kind: 'location',
    name: 'The shrine',
    blurb: 'Sanxing in flaking red lacquer.',
    procedure: 'temple',
    destination: null,
    roomPriceSp: null,
  },
  {
    id: 'village.place.inn',
    cite: 'spec.md, Horizon; MH p.31',
    kind: 'location',
    name: 'The last inn',
    blurb: 'Millet, hot water, and a mat by the wall.',
    procedure: 'inn',
    destination: null,
    roomPriceSp: 4,
  },
  {
    id: 'village.place.trail',
    cite: 'spec.md, Horizon; 5T a1',
    kind: 'trail',
    name: 'The trail',
    blurb: 'The path leaves past the last well and climbs.',
    procedure: null,
    destination: 'adventure.the-5-treasures',
    roomPriceSp: null,
  },
]

describe('money (MH p.52)', () => {
  it('is ten silver to the gold', () => {
    expect(SP_PER_GP).toBe(10)
  })

  it('round-trips gold and silver without a fraction', () => {
    expect(toSilver({ gp: 4, sp: 7 })).toBe(47)
    expect(fromSilver(47)).toEqual({ gp: 4, sp: 7 })
    // The half-gold case that made silver the internal unit.
    expect(fromSilver(toSilver({ sp: 5 }))).toEqual({ gp: 0, sp: 5 })
  })

  it('prices both Market columns in the same unit', () => {
    expect(priceInSilver(INCENSE)).toBe(5)
    expect(priceInSilver(LANTERN)).toBe(10)
    // A gold-priced lantern really is dearer than a silver-priced stick.
    expect(priceInSilver(LANTERN)).toBeGreaterThan(priceInSilver(INCENSE))
  })

  it('leaves a purse untouched when it cannot cover the cost', () => {
    expect(spend(3, 5)).toEqual({ paid: false, cost: 5, before: 3, after: 3 })
    expect(spend(5, 5)).toEqual({ paid: true, cost: 5, before: 5, after: 0 })
  })
})

describe('buy (MH p.52-55)', () => {
  it('debits exactly the printed price', () => {
    const result = buy({ market: STALL_ROW, itemId: 'market.common.lantern', purse: 25 })
    expect(result.bought).toBe(true)
    expect(result.item).toBe(LANTERN)
    expect(result.cost).toBe(10)
    expect(result.after).toBe(15)
    expect(result.reason).toBeUndefined()
  })

  it('refuses an unaffordable purchase and changes nothing', () => {
    const result = buy({ market: STALL_ROW, itemId: 'market.common.lantern', purse: 9 })
    expect(result.bought).toBe(false)
    expect(result.reason).toBe('insufficient')
    expect(result.after).toBe(result.before)
  })

  it('refuses an unknown id rather than throwing', () => {
    const result = buy({ market: STALL_ROW, itemId: 'market.common.nonesuch', purse: 100 })
    expect(result.bought).toBe(false)
    expect(result.reason).toBe('unknown-item')
    expect(result.item).toBeUndefined()
    expect(result.after).toBe(100)
  })
})

describe('the Temple (MH p.47, R58; I-58)', () => {
  const master = { skill: 9, luck: 4, maxLuck: 8, hasIncense: true, visitedToday: false }

  it('recovers exactly 1 LUCK on a successful Spirituality check', () => {
    // 2 + 3 = 5, under a threshold of 9.
    const visit = templeVisit(master)(fromSequence([2, 3]))
    expect(visit.attempted).toBe(true)
    expect(visit.outcome?.success).toBe(true)
    expect(visit.heal?.restored).toBe(1)
    expect(visit.luck).toBe(5)
  })

  it('recovers nothing on a failed check', () => {
    // 6 + 5 = 11, over a threshold of 9.
    const visit = templeVisit(master)(fromSequence([6, 5]))
    expect(visit.outcome?.success).toBe(false)
    expect(visit.heal?.restored).toBe(0)
    expect(visit.luck).toBe(4)
  })

  it('fails on the sealed double six however high the SKILL', () => {
    const visit = templeVisit({ ...master, skill: 12 })(fromSequence([6, 6]))
    expect(visit.outcome?.doubleSix).toBe(true)
    expect(visit.outcome?.success).toBe(false)
    expect(visit.luck).toBe(4)
  })

  it('adds one relevant Proficiency to the threshold (R20)', () => {
    // 6 + 4 = 10: over SKILL 9 alone, under 9 + 2.
    expect(templeVisit(master)(fromSequence([6, 4])).outcome?.success).toBe(false)
    expect(
      templeVisit({ ...master, proficiency: 2 })(fromSequence([6, 4])).outcome?.success,
    ).toBe(true)
  })

  it('does not roll without incense, and spends no dice doing it', () => {
    const dice = fromSequence([2, 3])
    const visit = templeVisit({ ...master, hasIncense: false })(dice)
    expect(visit.attempted).toBe(false)
    expect(visit.reason).toBe('no-incense')
    expect(visit.luck).toBe(4)
    // The refused visit must not consume a face, or a replayed save drifts.
    expect(templeVisit(master)(dice).outcome?.roll.total).toBe(5)
  })

  it('does not roll a second time in one day (I-58)', () => {
    const visit = templeVisit({ ...master, visitedToday: true })(fromSequence([2, 3]))
    expect(visit.attempted).toBe(false)
    expect(visit.reason).toBe('already-visited-today')
    // I-58 only *risks* a penalty; the engine does not invent one.
    expect(visit.luck).toBe(4)
  })

  it('will not recover LUCK past where the Master started (R05)', () => {
    const visit = templeVisit({ ...master, luck: 8 })(fromSequence([2, 3]))
    expect(visit.outcome?.success).toBe(true)
    expect(visit.heal?.restored).toBe(0)
    expect(visit.luck).toBe(8)
  })
})

describe('the inn (MH p.31, R40; spec.md sealed)', () => {
  const wounded = {
    skill: { current: 5, initial: 9 },
    endurance: { current: 10, initial: 20 },
    roomPriceSp: 4,
  }

  it('charges the room, restores SKILL fully and ENDURANCE by four', () => {
    const stay = stayTheNight({ ...wounded, purse: 12 })
    expect(stay.stayed).toBe(true)
    expect(stay.purseAfter).toBe(8)
    expect(stay.skill?.after).toBe(9)
    expect(stay.skill?.wasFull).toBe(true)
    expect(stay.endurance?.restored).toBe(4)
    expect(stay.endurance?.after).toBe(14)
  })

  it('does not stack the meal and the night into eight', () => {
    const stay = stayTheNight({ ...wounded, purse: 12 })
    expect(stay.endurance?.restored).toBe(4)
  })

  it('restores nothing to a Master already at full ENDURANCE', () => {
    const stay = stayTheNight({
      ...wounded,
      endurance: { current: 20, initial: 20 },
      purse: 12,
    })
    expect(stay.stayed).toBe(true)
    expect(stay.endurance?.restored).toBe(0)
    expect(stay.endurance?.after).toBe(20)
  })

  it('changes nothing at all when the room cannot be paid for', () => {
    const stay = stayTheNight({ ...wounded, purse: 3 })
    expect(stay.stayed).toBe(false)
    expect(stay.purseAfter).toBe(3)
    expect(stay.skill).toBeUndefined()
    expect(stay.endurance).toBeUndefined()
  })
})

describe('the village as fixed data (spec.md, Horizon)', () => {
  it('separates the places to act in from the way out', () => {
    expect(locationsOf(PLACES).map((p) => p.id)).toEqual([
      'village.place.temple',
      'village.place.inn',
    ])
    expect(trailOf(PLACES)?.destination).toBe('adventure.the-5-treasures')
  })

  it('finds a place by what it does, not by its id', () => {
    expect(placeRunning(PLACES, 'inn')?.roomPriceSp).toBe(4)
    // The miniature village has no stall row; asking is not an error.
    expect(placeRunning(PLACES, 'buy')).toBeUndefined()
  })
})

describe('labels', () => {
  it('splits the village from its procedures', () => {
    const by = (id: string) => villageBehaviours.find((b) => b.id === id)
    // Ours: that there is a village at all.
    expect(by('village.is-fixed-data')?.label).toBe('invention')
    // The book's: what a Master does once inside it.
    expect(by('village.temple-recovers-one-luck')?.label).toBe('rule')
    // The estate's: the gate the book leaves uncounted.
    expect(by('village.one-temple-check-per-day')?.label).toBe('reading')
    expect(by('village.one-temple-check-per-day')?.cite).toContain('I-58')
  })
})
