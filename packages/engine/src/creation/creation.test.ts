/**
 * Creation, at fixed dice, against the book's own worked examples.
 *
 * Two of the book's examples are load-bearing here and both are used as
 * fixtures rather than paraphrased: XinYue on p. 5 (a whole Master,
 * field for field) and the Improvised Weapons Master on p. 11 (the
 * Training arithmetic that is easiest to get wrong). The eight
 * pre-generated sheets on p. 92 are a third, larger one.
 *
 * The tables come from the content package, injected — the engine never
 * imports them as values (`../purity.test.ts`).
 */
import {
  market,
  martialArts,
  presetNameResolution,
  presets,
  rituals,
  socialStatuses,
  techniques,
} from '@martial-havoc/content'
import { describe, expect, it } from 'vitest'
import { fromSequence } from '../dice/sources'
import { UnknownEntry } from '../errors'
import { rollAttributes } from './attributes'
import { startingKit } from './kit'
import { spendResources } from './learning'
import { chooseMartialArt, rollMartialArt } from './martial-art'
import { createMaster, creationClean } from './master'
import { loadAllPresets, loadPreset } from './presets'
import { CREATION_CAP, spendProficiencies } from './proficiencies'
import { rollSocialStatus } from './social-status'
import type { CreationTables } from './tables'
import { finalSkill, proficiencyPool, training } from './training'

/** Every table creation reads, bound once for the whole file. */
const tables: CreationTables = {
  martialArts,
  socialStatuses,
  techniques,
  rituals,
  market,
  presets,
  presetNameResolution,
}

const longWeapons = chooseMartialArt(martialArts)('martial-art.long-weapons')

describe('attributes (MH p.6, R04, R05)', () => {
  it('rolls SKILL 1d6+6, ENDURANCE 2d6+12 and LUCK 1d6+6, in that order', () => {
    const attributes = rollAttributes(fromSequence([1, 6, 6, 3]))
    expect(attributes.skill.current).toBe(7)
    expect(attributes.endurance.current).toBe(24)
    expect(attributes.luck.current).toBe(9)
  })

  it('stores the initial value alongside the current one (R05)', () => {
    const attributes = rollAttributes(fromSequence([1, 6, 6, 3]))
    expect(attributes.skill.initial).toBe(attributes.skill.current)
    expect(attributes.endurance.initial).toBe(attributes.endurance.current)
    expect(attributes.luck.initial).toBe(attributes.luck.current)
  })

  it('keeps the faces it drew, so a roll can be shown and replayed', () => {
    const attributes = rollAttributes(fromSequence([1, 6, 6, 3]))
    expect(attributes.skill.faces).toEqual([1])
    expect(attributes.endurance.faces).toEqual([6, 6])
    expect(attributes.luck.faces).toEqual([3])
  })

  it('stays inside the ranges R04 implies, at both extremes', () => {
    const lowest = rollAttributes(fromSequence([1, 1, 1, 1]))
    const highest = rollAttributes(fromSequence([6, 6, 6, 6]))
    expect([lowest.skill.current, highest.skill.current]).toEqual([7, 12])
    expect([lowest.endurance.current, highest.endurance.current]).toEqual([14, 24])
    expect([lowest.luck.current, highest.luck.current]).toEqual([7, 12])
  })
})

describe('social status (MH p.5, R03)', () => {
  const roll = rollSocialStatus(socialStatuses)

  it('maps each face to its band', () => {
    expect(roll(fromSequence([1])).status.status).toBe('Vagabond')
    expect(roll(fromSequence([2, 1])).status.status).toBe('Poor')
    expect(roll(fromSequence([3, 1, 1, 1])).status.status).toBe('Middle Class')
    expect(roll(fromSequence([4, 1, 1, 1])).status.status).toBe('Middle Class')
    expect(roll(fromSequence([5, 1, 1, 1, 1, 1])).status.status).toBe('Rich')
  })

  it('gives Vagabond a flat 1 GP without drawing a gold die', () => {
    const rolled = roll(fromSequence([1]))
    expect(rolled.gold).toBe(1)
    expect(rolled.goldFaces).toEqual([])
  })

  it('gives Poor 0 GP on a 1, because the band is 1d6-1', () => {
    expect(roll(fromSequence([2, 1])).gold).toBe(0)
  })

  it('sums ten dice for Noble', () => {
    const rolled = roll(fromSequence([6, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4]))
    expect(rolled.goldFaces).toHaveLength(10)
    expect(rolled.gold).toBe(31)
  })
})

describe('martial art (MH p.7, R09)', () => {
  it('rolls the banded table: band die, then row die', () => {
    expect(rollMartialArt(martialArts)(fromSequence([1, 2])).martialArt.name).toBe('Long weapons')
    expect(rollMartialArt(martialArts)(fromSequence([6, 6])).martialArt.name).toBe('TaiJi Quan')
    // The band is 1-2, so a 2 lands on the same row as a 1.
    expect(rollMartialArt(martialArts)(fromSequence([2, 2])).martialArt.name).toBe('Long weapons')
  })

  it('resolves all 36 (band, row) pairs onto the 18 entries', () => {
    const rolled = [1, 2, 3, 4, 5, 6].flatMap((band) =>
      [1, 2, 3, 4, 5, 6].map((row) => rollMartialArt(martialArts)(fromSequence([band, row]))),
    )
    expect(new Set(rolled.map((r) => r.martialArt.id)).size).toBe(18)
  })

  it('chooses by id, and throws on an id the table does not hold', () => {
    expect(chooseMartialArt(martialArts)('martial-art.taiji-quan').name).toBe('TaiJi Quan')
    expect(() => chooseMartialArt(martialArts)('martial-art.capoeira')).toThrow(UnknownEntry)
  })
})

describe('proficiencies (MH p.7, R10, R11, I-04)', () => {
  const spend = spendProficiencies(longWeapons, presetNameResolution)

  it("spends XinYue's 7 points over a pool of 7 with nothing raised", () => {
    // MH p.5: Armed Combat (2), Defensive Barrier (4), Sweep (1).
    const report = spend(7)({ 'Armed Combat': 2, 'Defensive Barrier': 4, Sweep: 1 })
    expect(report.spent).toBe(7)
    expect(report.pool).toBe(7)
    expect(report.unspent).toBe(0)
    expect(report.overBy).toBe(0)
    expect(report.capBreaches).toEqual([])
    expect(report.unknown).toEqual([])
    // Matched case-insensitively and reported under the table's spelling.
    expect(report.assigned).toEqual([
      { name: 'Armed combat', value: 2 },
      { name: 'Defensive Barrier', value: 4 },
      { name: 'Sweep', value: 1 },
    ])
  })

  it('flags a Proficiency taken above the cap of 4, and builds it anyway', () => {
    const report = spend(7)({ 'Armed combat': 5, Sweep: 2 })
    expect(report.capBreaches).toEqual([{ name: 'Armed combat', value: 5 }])
    expect(CREATION_CAP).toBe(4)
    // Never refuses: the value asked for is what was assigned.
    expect(report.assigned).toContainEqual({ name: 'Armed combat', value: 5 })
  })

  it('treats 4 as at the cap rather than over it', () => {
    expect(spend(7)({ 'Armed combat': 4 }).capBreaches).toEqual([])
  })

  it('allows points to be left unspent, and raises nothing for it (I-04)', () => {
    // Beggar So: 8 spent of an implied pool of 12.
    const report = spend(12)({ 'Armed combat': 4, 'Defensive Barrier': 3, Sweep: 1 })
    expect(report.spent).toBe(8)
    expect(report.unspent).toBe(4)
    expect(report.overBy).toBe(0)
    expect(report.capBreaches).toEqual([])
  })

  it('allows a Proficiency at 0 (I-04)', () => {
    expect(spend(7)({ 'Armed combat': 0 }).overBy).toBe(0)
  })

  it('flags a name the style does not carry instead of refusing it (R12)', () => {
    const report = spend(7)({ Occultism: 2 })
    expect(report.unknown).toEqual(['Occultism'])
    expect(report.assigned).toContainEqual({ name: 'Occultism', value: 2 })
  })

  it('flags an overspend and still assigns it', () => {
    const report = spend(7)({ 'Armed combat': 4, 'Defensive Barrier': 4 })
    expect(report.spent).toBe(8)
    expect(report.overBy).toBe(1)
  })
})

describe('training and learning (MH p.11, R15, R16, R17, R19)', () => {
  it('reproduces the p. 11 example exactly', () => {
    // "You roll SKILL=9 [...] deciding to assign 2 points to the Training
    // skill. You have now 8 Resource points [...]; 9 SKILL points to
    // assign [...]; but your final SKILL points will be 7."
    const rolledSkill = 9
    const bought = training(2)
    expect(proficiencyPool(rolledSkill)).toBe(9)
    expect(bought.resourcePool).toBe(8)
    expect(finalSkill(rolledSkill, bought.points)).toBe(7)
    expect(bought.skillDeduction).toBe(2)
    // R17: Training is itself a Proficiency, at the value bought.
    expect(bought.asProficiency).toEqual({ name: 'Training', value: 2 })
  })

  it('buys nothing for 0 Training points', () => {
    expect(training(0)).toMatchObject({ resourcePool: 0, skillDeduction: 0 })
  })

  it('prices Techniques and Rituals at their printed cost', () => {
    const report = spendResources(techniques, rituals, presetNameResolution)(8)({
      techniques: ['Monkey Jump', 'Snake Form'],
      rituals: ['Older Brother'],
    })
    // 1 + 2 + 4 = 7 of 8 (Beggar So's sheet).
    expect(report.spent).toBe(7)
    expect(report.unspent).toBe(1)
    expect(report.overBy).toBe(0)
    expect(report.learned.techniques.map((t) => t.name)).toEqual(['Monkey Jump', 'Snake Form'])
    expect(report.learned.rituals.map((r) => r.name)).toEqual(['Older Brother'])
  })

  it('resolves a sheet spelling through the name map', () => {
    const report = spendResources(techniques, rituals, presetNameResolution)(8)({
      techniques: ['Pluck the phoenix’s Eye'.replace('’', "'")],
      rituals: ['Guardians of the gate'],
    })
    expect(report.learned.techniques.map((t) => t.name)).toEqual(["Tear out a phoenix's eye"])
    expect(report.learned.rituals.map((r) => r.name)).toEqual(['Door gods'])
    expect(report.unknown).toEqual([])
  })

  it('flags an overspend and learns the picks anyway', () => {
    const report = spendResources(techniques, rituals, presetNameResolution)(2)({
      rituals: ['Mystical Fire', 'King of the Underworld'],
    })
    expect(report.spent).toBe(8)
    expect(report.overBy).toBe(6)
    expect(report.learned.rituals).toHaveLength(2)
  })

  it('flags a name neither table holds, and charges nothing for it', () => {
    const report = spendResources(techniques, rituals)(4)({ techniques: ['Hadouken'] })
    expect(report.unknown).toEqual(['Hadouken'])
    expect(report.spent).toBe(0)
  })
})

describe('the starting kit (MH p.5, R02, I-02)', () => {
  const kit = startingKit(market)

  it('grants common clothing and a free-text weapon, flagged as a weapon', () => {
    const report = kit({ weapon: 'Spear', item: 'Health Elixir' })
    expect(report.equipment[0]).toEqual({ name: 'common clothing', source: 'clothing', flags: [] })
    expect(report.equipment[1]).toEqual({ name: 'Spear', source: 'weapon', flags: ['weapon'] })
  })

  it('takes a weapon that is not on the Market list at all (R02, I-02)', () => {
    // Chen Zhen's Nunchaku and Yin's Magical sword are not Market lines.
    const report = kit({ weapon: 'Magical sword' })
    expect(report.equipment[1]?.flags).toContain('weapon')
    expect(report.equipment).toHaveLength(2)
  })

  it('lets the Health Elixir through, though it costs 25 GP', () => {
    // R02 names it as the alternative to the "less than 20 GP" cap.
    expect(kit({ weapon: 'Spear', item: 'Health Elixir' }).itemOverCap).toBe(false)
  })

  it('flags a Market item at or over 20 GP, and grants it anyway', () => {
    const report = kit({ weapon: 'Spear', item: 'Horse' })
    expect(report.itemOverCap).toBe(true)
    expect(report.equipment.map((i) => i.name)).toContain('Horse')
  })

  it('flags an item the Market cannot price', () => {
    expect(kit({ weapon: 'Spear', item: 'a jar of fireflies' }).itemUnpriced).toBe(true)
  })
})

describe('createMaster (MH p.5-11)', () => {
  /**
   * XinYue, the book's own worked example on p. 5, scripted die for die:
   * status face 2 (Poor), gold 4 on 1d6-1 = 3 GP, SKILL 1 (+6 = 7),
   * ENDURANCE 3 and 3 (+12 = 18), LUCK 3 (+6 = 9), Martial Art (1, 2) =
   * Long weapons.
   */
  const xinYue = () =>
    createMaster(tables)(fromSequence([2, 4, 1, 3, 3, 3, 1, 2]))({
      name: 'XinYue',
      age: 27,
      martialArt: { roll: true },
      proficiencies: { 'Armed Combat': 2, 'Defensive Barrier': 4, Sweep: 1 },
      kit: { weapon: 'Spear', item: 'Health Elixir' },
    })

  it('reproduces XinYue field for field', () => {
    const { master } = xinYue()
    expect(master.name).toBe('XinYue')
    expect(master.age).toBe(27)
    expect(master.martialArt.name).toBe('Long weapons')
    expect(master.attributes.skill.current).toBe(7)
    expect(master.attributes.endurance.current).toBe(18)
    expect(master.attributes.luck.current).toBe(9)
    expect(master.status?.status).toBe('Poor')
    expect(master.gold).toBe(3)
    expect(master.proficiencies).toEqual([
      { name: 'Armed combat', value: 2 },
      { name: 'Defensive Barrier', value: 4 },
      { name: 'Sweep', value: 1 },
    ])
    expect(master.equipment.map((i) => i.name)).toEqual([
      'common clothing',
      'Spear',
      'Health Elixir',
    ])
    expect(master.xp).toBe(0)
    expect(master.dishonor).toBe(0)
  })

  it('raises nothing on XinYue', () => {
    const { flags } = xinYue()
    expect(flags.raised).toEqual([])
    expect(creationClean(flags)).toBe(true)
  })

  it('draws no dice for the Martial Art when one is chosen', () => {
    // Two fewer dice than the rolled version: the sequence ends at LUCK.
    const { master } = createMaster(tables)(fromSequence([2, 4, 1, 3, 3, 3]))({
      name: 'XinYue',
      age: 27,
      martialArt: { id: 'martial-art.long-weapons' },
      proficiencies: { 'Armed Combat': 2, 'Defensive Barrier': 4, Sweep: 1 },
      kit: { weapon: 'Spear', item: 'Health Elixir' },
    })
    expect(master.martialArt.name).toBe('Long weapons')
  })

  it('applies Training to SKILL but not to the Proficiency pool (R10, R15)', () => {
    // The p. 11 example, run through the whole procedure: rolled 9,
    // 2 Training, 9 points to spend, final SKILL 7, 8 Resource points.
    const { master, flags } = createMaster(tables)(fromSequence([1, 3, 3, 3, 3]))({
      name: 'Improvised',
      age: 30,
      martialArt: { id: 'martial-art.improvised-weapons' },
      training: 2,
      proficiencies: { 'Armed combat': 4, 'Ranged weapons': 4, 'Surprise attack': 1 },
      kit: { weapon: 'a stool' },
    })
    expect(master.attributes.skill.current).toBe(7)
    // R05: what it was rolled at is kept.
    expect(master.attributes.skill.initial).toBe(9)
    expect(flags.proficiencies.pool).toBe(9)
    expect(flags.proficiencies.spent).toBe(9)
    expect(flags.resources.pool).toBe(8)
    expect(master.training.asProficiency).toEqual({ name: 'Training', value: 2 })
    expect(flags.raised).toEqual([])
  })

  it('builds the Master even when every pool is overspent', () => {
    const { master, flags } = createMaster(tables)(fromSequence([1, 1, 1, 1, 1]))({
      name: 'Overreach',
      age: 20,
      martialArt: { id: 'martial-art.wudang-quan' },
      training: 1,
      proficiencies: { 'Unarmed combat': 6, Occultism: 6 },
      rituals: ['Mystical Fire', 'Punishing the sky'],
      kit: { weapon: 'a stick', item: 'Horse' },
    })
    // Nothing refused: the Master exists, with what was asked for.
    expect(master.proficiencies).toContainEqual({ name: 'Unarmed combat', value: 6 })
    expect(master.rituals).toHaveLength(2)
    expect(flags.proficiencies.overBy).toBeGreaterThan(0)
    expect(flags.resources.overBy).toBeGreaterThan(0)
    expect(flags.kit.itemOverCap).toBe(true)
    expect(flags.raised.map((f) => f.id)).toEqual(
      expect.arrayContaining([
        'creation.proficiencies.over',
        'creation.proficiencies.cap',
        'creation.resources.over',
        'creation.kit.over-cap',
      ]),
    )
    expect(creationClean(flags)).toBe(false)
  })
})

describe('the eight pre-generated Masters (MH p.92, R83)', () => {
  const loaded = loadAllPresets(tables)

  it('loads all eight as printed', () => {
    expect(loaded).toHaveLength(8)
    expect(loaded.map((c) => c.master.name)).toEqual([
      'Beggar So',
      'Chen Zhen',
      'Yin',
      'Golden Swallow',
      'San Te',
      'Sun Wukong',
      'Sonny Wong',
      'Jen Yu',
    ])
  })

  it('resolves every sheet name to a canonical table entry', () => {
    const byName = new Map(loaded.map((c) => [c.master.name, c]))
    expect(byName.get('Chen Zhen')?.master.martialArt.name).toBe('Red Boat Wing Chun')
    expect(byName.get('Sonny Wong')?.master.martialArt.name).toBe('Praying Mantis Style')
    expect(byName.get('San Te')?.master.techniques.map((t) => t.name)).toContain(
      "Tear out a phoenix's eye",
    )
    expect(byName.get('Yin')?.master.rituals.map((r) => r.name)).toContain('Door gods')
    // Nothing on any sheet fails to resolve.
    for (const creation of loaded) {
      expect(creation.flags.proficiencies.unknown, creation.master.name).toEqual([])
      expect(creation.flags.resources.unknown, creation.master.name).toEqual([])
    }
  })

  it('raises nothing on seven of the eight', () => {
    const clean = loaded.filter((c) => c.flags.raised.length === 0)
    expect(clean).toHaveLength(7)
    expect(loaded.filter((c) => c.flags.raised.length > 0).map((c) => c.master.name)).toEqual([
      'Yin',
    ])
  })

  it('flags Yin over both pools, and loads Yin anyway', () => {
    const yin = loaded.find((c) => c.master.name === 'Yin')
    // The estate's arithmetic check: 10 Proficiency points against a
    // pool of 9, and 12 Resource points against 8.
    expect(yin?.flags.proficiencies.overBy).toBe(1)
    expect(yin?.flags.proficiencies.spent).toBe(10)
    expect(yin?.flags.proficiencies.pool).toBe(9)
    expect(yin?.flags.resources.overBy).toBe(4)
    expect(yin?.flags.resources.spent).toBe(12)
    expect(yin?.flags.resources.pool).toBe(8)
    expect(yin?.master.rituals).toHaveLength(4)
  })

  it('runs no range check: Sun Wukong loads with an implied SKILL of 14', () => {
    // R83 makes Appendix C data. His implied rolled SKILL (10 + 4) is
    // outside R04's 1d6+6, and that is not an error to report.
    const wukong = loaded.find((c) => c.master.name === 'Sun Wukong')
    expect(wukong?.flags.proficiencies.pool).toBe(14)
    expect(wukong?.flags.raised).toEqual([])
    expect(wukong?.master.attributes.endurance.current).toBe(24)
  })

  it('flags the free-text equipment the sheets carry (I-02, I-03)', () => {
    const byName = new Map(loaded.map((c) => [c.master.name, c]))
    const beggarSo = byName.get('Beggar So')?.master.equipment
    expect(beggarSo?.find((i) => i.name === 'Wine bottle')?.flags).toEqual(['alcohol'])
    const yin = byName.get('Yin')?.master.equipment
    expect(yin?.find((i) => i.name === 'Magical sword')?.flags).toEqual(['weapon'])
    // Every sheet still starts in common clothing (R02).
    for (const creation of loaded)
      expect(creation.master.equipment[0]?.name).toBe('common clothing')
  })

  it('throws on a preset id the table does not hold', () => {
    expect(() => loadPreset(tables)('preset.bruce-lee')).toThrow(UnknownEntry)
    expect(loadPreset(tables)('preset.jen-yu').master.age).toBe(17)
  })
})
