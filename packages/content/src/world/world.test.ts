/**
 * The world tables, checked at the addresses the book actually prints.
 *
 * The schema and the counts in `../content.test.ts` prove the files are
 * well formed and complete. This file proves they say the right thing:
 * named cells land where the rulebook puts them, every address in each
 * table resolves, and the two derived fields (the Market's
 * `underTwentyGp` flag and the Oracle's inferred spans) match what the
 * concept docs derive by hand.
 */
import { describe, expect, it } from 'vitest'
import { contentCounts } from '../counts'
import {
  canonicalIdForSheetName,
  consultOracle,
  deities,
  inspirations,
  market,
  martialArtById,
  martialArts,
  opponentByName,
  opponents,
  oracle,
  presetByName,
  presetNameResolution,
  presets,
  ritualById,
  rituals,
  rollDeity,
  rollInspiration,
  rollMartialArt,
  rollSpark,
  sparks,
  startingKitItems,
  techniqueByD66,
  techniqueById,
  techniques,
} from './index'

describe('martial arts (MH p.7-10)', () => {
  it('puts the named styles at the addresses the book prints', () => {
    expect(rollMartialArt(1, 2)?.name).toBe('Long weapons')
    expect(rollMartialArt(6, 6)?.name).toBe('TaiJi Quan')
    expect(rollMartialArt(2, 2)?.name).toBe('Long weapons')
  })

  it('resolves all 18 cells of the banded table', () => {
    const rolled = [1, 2, 3, 4, 5, 6].flatMap((first) =>
      [1, 2, 3, 4, 5, 6].map((second) => rollMartialArt(first, second)),
    )
    expect(rolled.every((r) => r !== undefined)).toBe(true)
    expect(new Set(rolled.map((r) => r?.id)).size).toBe(18)
  })

  it('chooses by id, and answers undefined for one it does not have', () => {
    expect(martialArtById('martial-art.wudang-quan')?.name).toBe('Wudang Quan')
    expect(martialArtById('martial-art.capoeira')).toBeUndefined()
  })

  it('carries the style powers R13 names, and null for the styles without one', () => {
    expect(martialArtById('martial-art.drunken-style')?.power).toContain('alcohol')
    expect(martialArtById('martial-art.wudang-quan')?.power).toBe(
      'You can use Rituals in combat',
    )
    expect(martialArtById('martial-art.taiji-quan')?.power).toBeNull()
    expect(martialArts.filter((m) => m.power !== null)).toHaveLength(7)
  })

  it('gives Wu Xing Quan five Proficiencies and the Cult four', () => {
    expect(martialArtById('martial-art.wu-xing-quan')?.proficiencies).toHaveLength(5)
    expect(martialArtById('martial-art.cult-of-the-great-immortals')?.proficiencies).toHaveLength(4)
    // 16 styles at 3, plus these two, is 57 named Proficiencies and 47
    // distinct after the shared names (Armed combat x5, Unarmed combat
    // x6, Double strike x2). docs/world/martial-arts.md says 56 and 46
    // in its Notes; its own table says 57 and 47, and the table is the
    // authority the data is transcribed from.
    const total = martialArts.reduce((n, m) => n + m.proficiencies.length, 0)
    expect(total).toBe(57)
    expect(new Set(martialArts.flatMap((m) => m.proficiencies)).size).toBe(47)
  })
})

describe('techniques and rituals (MH p.12-19)', () => {
  it('reads a d66 address as tens die then ones die', () => {
    expect(techniqueByD66(3, 5)?.name).toBe('Monkey Jump')
    expect(techniqueByD66(1, 1)?.name).toBe('Blue Dragon')
    expect(techniqueByD66(6, 6)?.name).toBe('Water Splitting Move')
  })

  it('resolves every one of the 36 addresses in each table', () => {
    for (const table of [techniques, rituals]) {
      const addresses = new Set(table.map((r) => r.d66))
      expect(addresses.size).toBe(36)
      for (const tens of [1, 2, 3, 4, 5, 6])
        for (const ones of [1, 2, 3, 4, 5, 6]) expect(addresses.has(tens * 10 + ones)).toBe(true)
    }
  })

  it('keeps costs inside the printed 1-4 range with the printed distribution', () => {
    const distribution = (rows: typeof techniques) =>
      rows.reduce<Record<number, number>>((acc, r) => ({ ...acc, [r.cost]: (acc[r.cost] ?? 0) + 1 }), {})
    // docs/world/techniques.md: 1 x17, 2 x17, 4 x2, none at 3.
    expect(distribution(techniques)).toEqual({ 1: 17, 2: 17, 4: 2 })
    // docs/rules/master-creation.md: Rituals 1 x4, 2 x12, 3 x9, 4 x11.
    expect(distribution(rituals)).toEqual({ 1: 4, 2: 12, 3: 9, 4: 11 })
  })

  it('keeps the pinyin as printed, non-standard spellings included', () => {
    expect(techniqueById('technique.monkey-jump')?.pinyin).toBe('Hou Zung')
    expect(techniqueById('technique.exploding-qi')?.pinyin).toBe('Fa jing')
  })
})

describe('deities (MH p.29)', () => {
  it('is a banded 12-row table, not a d66', () => {
    expect(deities).toHaveLength(12)
    expect(rollDeity(1, 4)?.name).toBe('Great Sage')
    expect(rollDeity(3, 4)?.name).toBe('Great Sage')
    expect(rollDeity(4, 6)?.name).toBe('Dragon')
  })
})

describe('opponents (MH p.70-79)', () => {
  it('keeps ATTACK as printed, range and blank included', () => {
    expect(opponentByName('Brawler')?.attack).toBe('2-4')
    expect(opponentByName('Huang Feng Guai')?.attack).toBeNull()
    expect(opponentByName('Dapeng')?.attack).toBe(10)
  })

  it('reads Martial Arts (n) into martialArtsValue and leaves it in the list', () => {
    const shiGong = opponentByName('Shi Gong')
    expect(shiGong?.martialArtsValue).toBe(4)
    expect(shiGong?.proficiencies).toEqual([{ name: 'Martial Arts', value: 4 }])
    // Youxia carries it beside a named Proficiency, not instead of one.
    const youxia = opponentByName('Youxia')
    expect(youxia?.martialArtsValue).toBe(2)
    expect(youxia?.proficiencies).toHaveLength(2)
    expect(opponents.filter((o) => o.martialArtsValue !== null)).toHaveLength(6)
  })

  it('gives every block a description and a page', () => {
    expect(opponents.every((o) => o.description.length > 0)).toBe(true)
    expect(opponents.every((o) => o.page.startsWith('MH p.'))).toBe(true)
  })
})

describe('market (MH p.52-55)', () => {
  it('sets exactly one of priceGp and priceSp on every line', () => {
    expect(market.every((i) => (i.priceGp === null) !== (i.priceSp === null))).toBe(true)
  })

  it('flags every weapon, and nothing else, as a weapon (R68, I-02)', () => {
    const flagged = market.filter((i) => i.flags.includes('weapon'))
    expect(flagged).toHaveLength(14)
    expect(flagged.every((i) => i.list === 'weapons')).toBe(true)
  })

  it('flags exactly the items R02 lets a new Master take, as docs/world/market.md derives them', () => {
    const excluded = market
      .filter((i) => !i.flags.includes('underTwentyGp'))
      .map((i) => i.item)
      .sort()
    expect(excluded).toEqual(
      [
        'Complete War Armor',
        'Cart',
        'Gunpowder',
        'Health Elixir',
        'Horse',
        'Map of Body Meridians',
        'Mule',
        'Protection Amulet',
        'Smoke Bomb',
        'Steel Helmet with Neck Guard',
        'Trained monkey',
        'Training Manual',
        'War Mask',
      ].sort(),
    )
    // Cart is exactly 20 GP: R02 says "less than 20", so it is out.
    expect(startingKitItems.some((i) => i.item === 'Cart')).toBe(false)
  })

  it('ships no alcohol: the Drunken style bottle is obtained narratively (I-03)', () => {
    expect(market.some((i) => i.flags.includes('alcohol'))).toBe(false)
  })
})

describe('oracle (MH p.58)', () => {
  it('answers a closed question on any face', () => {
    expect(consultOracle('Closed Question')(1)?.text).toBe('No, and')
    expect(consultOracle('Closed Question')(6)?.text).toBe('Yes, and')
  })

  it('resolves all 11 rows on all 6 faces', () => {
    const rows = new Set(oracle.map((c) => c.row))
    expect(rows.size).toBe(11)
    for (const row of rows)
      for (const face of [1, 2, 3, 4, 5, 6]) expect(consultOracle(row)(face)).toBeDefined()
  })

  it('marks a cell spanInferred exactly when it repeats a neighbour', () => {
    // The estate inferred a span wherever a printed cell is centred under
    // two or more faces (docs/world/oracle.md, "Spans"). Repeating text
    // across adjacent faces is what that looks like in the data, so the
    // flag and the text must agree in both directions.
    for (const cell of oracle) {
      const neighbours = [cell.face - 1, cell.face + 1]
        .map((face) => consultOracle(cell.row)(face))
        .filter((c) => c !== undefined)
      const repeats = neighbours.some((c) => c.text === cell.text)
      expect(repeats, `${cell.id} (${cell.text}) spanInferred=${String(cell.spanInferred)}`).toBe(
        cell.spanInferred,
      )
    }
  })

  it('answers undefined for a row it does not have', () => {
    expect(consultOracle('Weather')(1)).toBeUndefined()
  })
})

describe('inspirations and sparks (MH p.59-63)', () => {
  it('rolls d66 on the named Inspirations table', () => {
    expect(rollInspiration('action')(1, 1)?.word).toBe('Attack')
    expect(rollInspiration('theme')(6, 6)?.word).toBe('Tradition')
    expect(rollInspiration('mood')(1, 1)).toBeUndefined()
  })

  it('rolls 1d6 for the Sparks table then d66 for the word', () => {
    expect(rollSpark(1)(1, 1)?.word).toBe('Mace')
    expect(rollSpark(3)(1, 2)?.word).toBe('Giada')
    expect(rollSpark(6)(6, 6)?.word).toBe('Demon')
    expect(rollSpark(7)(1, 1)).toBeUndefined()
  })

  it('fills both Inspirations tables and all six Spark tables', () => {
    expect(inspirations.filter((w) => w.table === 'action')).toHaveLength(36)
    expect(inspirations.filter((w) => w.table === 'theme')).toHaveLength(36)
    for (const n of [1, 2, 3, 4, 5, 6])
      expect(sparks.filter((w) => w.table === String(n))).toHaveLength(36)
  })
})

describe('pre-generated masters (MH p.91-92)', () => {
  it('ships all eight sheets as printed, spelling included', () => {
    expect(presets).toHaveLength(8)
    expect(presetByName('San Te')?.from).toBe('The 36th CHamber of Shaolin (1978)')
    expect(presetByName('Golden Swallow')?.rituals).toEqual(['Open the mount close the mouth'])
    expect(presetByName('Sun Wukong')?.age).toBe(1100)
  })

  it('resolves every sheet name that differs from the tables', () => {
    expect(canonicalIdForSheetName('Wing Chun')).toBe('martial-art.red-boat-wing-chun')
    expect(canonicalIdForSheetName('Scorpion style')).toBe('martial-art.praying-mantis-style')
    expect(canonicalIdForSheetName('Guardians of the gate')).toBe('ritual.door-gods')
    expect(canonicalIdForSheetName('not on any sheet')).toBeUndefined()
  })

  it('points every table-bound resolution at a record that exists', () => {
    // Proficiency names are not records of their own - they live inside a
    // Martial Art - so only the three table prefixes are checked here.
    for (const entry of presetNameResolution) {
      if (entry.canonicalId.startsWith('martial-art.'))
        expect(martialArtById(entry.canonicalId), entry.canonicalId).toBeDefined()
      if (entry.canonicalId.startsWith('ritual.'))
        expect(ritualById(entry.canonicalId), entry.canonicalId).toBeDefined()
      if (entry.canonicalId.startsWith('technique.'))
        expect(techniqueById(entry.canonicalId), entry.canonicalId).toBeDefined()
    }
  })
})

describe('contentCounts', () => {
  it('counts every registered file and record', () => {
    const counts = contentCounts()
    expect(counts.byFile['world.sparks']).toBe(216)
    expect(counts.byFile['world.opponents']).toBe(50)
    expect(counts.records).toBe(
      Object.values(counts.byFile).reduce((sum, n) => sum + n, 0),
    )
    expect(counts.files).toBe(Object.keys(counts.byFile).length)
  })
})
