/** The adventure hooks, at the d66 addresses the book prints. */
import { describe, expect, it } from 'vitest'
import { adventureHooks, rollAdventureHook } from './index'

describe('adventure hooks (MH p.36-39, R50)', () => {
  it('resolves every one of the 36 d66 addresses', () => {
    expect(adventureHooks).toHaveLength(36)
    for (const tens of [1, 2, 3, 4, 5, 6])
      for (const ones of [1, 2, 3, 4, 5, 6]) expect(rollAdventureHook(tens, ones)).toBeDefined()
  })

  it('reads the address as tens die then ones die', () => {
    expect(rollAdventureHook(1, 1)?.text).toContain('An enemy school has killed your master')
    expect(rollAdventureHook(3, 2)?.text).toContain('you must kill the emperor')
    expect(rollAdventureHook(6, 6)?.text).toContain('magical influence of a criminal')
  })
})

/**
 * The prototype slice (5T a1, a2; design/prototype): the menu must only
 * point at things that exist, and every area of the slice must offer
 * something to do - the empty state is for later phases, not for a
 * dropped record.
 */
import {
  beatForArea,
  optionsForArea,
  prototypeBeats,
  prototypeOptions,
  treasureFoeById,
  treasureFoes,
} from './index'

describe('The 5 Treasures: foes', () => {
  it('prints nine stat blocks, each with SKILL, ENDURANCE, ATTACK and two special skills', () => {
    expect(treasureFoes).toHaveLength(9)
    for (const foe of treasureFoes) {
      expect(foe.skill).toBeGreaterThan(0)
      expect(foe.endurance).toBeGreaterThan(0)
      expect(typeof foe.attack).toBe('number')
      expect(foe.proficiencies).toHaveLength(2)
      expect(foe.page).toBe('5T a2')
    }
  })

  it('the Dexterous Ghost is 7 / 8 / 1 with immaterial charge (4) the higher skill', () => {
    const ghost = treasureFoeById('foe.dexterous-ghost')
    expect(ghost).toMatchObject({ skill: 7, endurance: 8, attack: 1 })
    expect(Math.max(...(ghost?.proficiencies.map((p) => p.value) ?? []))).toBe(4)
  })
})

describe('The 5 Treasures: prototype slice', () => {
  it('has one beat per area and no area twice', () => {
    const areas = prototypeBeats.map((b) => b.area)
    expect(new Set(areas).size).toBe(areas.length)
    expect(beatForArea(3)?.name).toBe('Attendants room')
    expect(beatForArea(1)).toBeUndefined()
  })

  it('offers at least one option in every area of the slice', () => {
    for (const beat of prototypeBeats) expect(optionsForArea(beat.area).length).toBeGreaterThan(0)
  })

  it('every option belongs to an area the slice has', () => {
    const stray = prototypeOptions.filter((o) => beatForArea(o.area) === undefined)
    expect(stray.map((o) => o.id)).toEqual([])
  })

  it('every go leads to an area the slice has, every fight to a printed foe', () => {
    for (const o of prototypeOptions) {
      if (o.action === 'go') expect(beatForArea(Number(o.target)), o.id).toBeDefined()
      if (o.action === 'fight') expect(treasureFoeById(o.target ?? ''), o.id).toBeDefined()
      if (o.action === 'take' || o.action === 'go' || o.action === 'fight') {
        expect(o.target, o.id).toBeDefined()
      }
    }
  })

  it('a skill check names a Proficiency or none, never a number', () => {
    for (const o of prototypeOptions.filter((x) => x.action === 'skill-check')) {
      if (o.proficiency !== undefined) expect(Number.isNaN(Number(o.proficiency))).toBe(true)
    }
  })
})

/**
 * The cave in the adventure format (Phase 5).
 *
 * Two kinds of check. **Referential integrity**: every id an adventure
 * record names must resolve, because a dangling reference is exactly the
 * failure a schema cannot see (it validates shapes, not the graph they
 * describe). **Transcription fidelity**: a handful of printed strings
 * asserted verbatim, so a well-meaning tidy-up of the source text is red.
 */
import {
  areaByNumber,
  encountersForArea,
  lootForFoe,
  theFiveTreasures,
  theFiveTreasuresAbsences,
  theFiveTreasuresActs,
  theFiveTreasuresAreaById,
  theFiveTreasuresAreas,
  theFiveTreasuresEncounters,
  theFiveTreasuresEvents,
  theFiveTreasuresFlags,
  theFiveTreasuresLoot,
  theFiveTreasuresMeta,
  theFiveTreasuresTreasureById,
  theFiveTreasuresTreasures,
} from './index'

describe('The 5 Treasures: the adventure header', () => {
  it('is written in format version 1 and starts on the mountain', () => {
    expect(theFiveTreasuresMeta.version).toBe('1')
    expect(theFiveTreasuresMeta.startArea).toBe('area.the-5-treasures.flat-top-mountain')
    expect(theFiveTreasuresAreaById(theFiveTreasuresMeta.startArea)).toBeDefined()
  })

  it('carries the premise paragraph verbatim', () => {
    expect(theFiveTreasuresMeta.premise).toBe(
      'On the Flat-top mountain two fiends threaten the travellers: Senior King Gold Horn and Junior King Silver Horn, human eater demons. In the Lotus Flower cave, where they live protected by devil servants, are kept 5 magic treasures.',
    )
  })

  it('gathers every table of the adventure into one object for the engine', () => {
    expect(theFiveTreasures.areas).toHaveLength(8)
    expect(theFiveTreasures.foes).toHaveLength(9)
    expect(theFiveTreasures.meta).toBe(theFiveTreasuresMeta)
  })
})

describe('The 5 Treasures: the event table (5T a1)', () => {
  it('covers all six faces exactly once', () => {
    const covered = theFiveTreasuresEvents.flatMap((row) => row.totals).sort((a, b) => a - b)
    expect(covered).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('reads Ambush on 1 and Hint on 6', () => {
    const on = (face: number) => theFiveTreasuresEvents.find((r) => r.totals.includes(face))?.text
    expect(on(1)).toBe('Ambush!')
    expect(on(3)).toBe('Encounter')
    expect(on(5)).toBe('Safe exploration')
    expect(on(6)).toBe('Hint')
  })
})

describe('The 5 Treasures: the areas (5T a1)', () => {
  it('numbers the eight areas 1 to 8, each exactly once', () => {
    expect(theFiveTreasuresAreas.map((a) => a.area).sort((x, y) => x - y)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8,
    ])
  })

  it('gives every exit a real area, and every exit a matching one back', () => {
    for (const area of theFiveTreasuresAreas) {
      for (const exit of area.exits) {
        const other = theFiveTreasuresAreaById(exit)
        expect(other, `${area.id} -> ${exit}`).toBeDefined()
        expect(other?.exits, `${exit} -> ${area.id}`).toContain(area.id)
      }
    }
  })

  it('reaches every area from the start, keys aside', () => {
    // A walk of the graph: an area nothing leads to is a typo in `exits`,
    // and no amount of schema validation would find it.
    const seen = new Set<string>([theFiveTreasuresMeta.startArea])
    const queue = [theFiveTreasuresMeta.startArea]
    while (queue.length > 0) {
      const here = theFiveTreasuresAreaById(queue.shift() as string)
      for (const exit of here?.exits ?? [])
        if (!seen.has(exit)) {
          seen.add(exit)
          queue.push(exit)
        }
    }
    expect(seen.size).toBe(theFiveTreasuresAreas.length)
  })

  it('locks both Private Quarters behind the one key (I-07)', () => {
    const chieftain = areaByNumber(8)
    const women = areaByNumber(6)
    expect(chieftain?.gate?.key).toBe('key.the-5-treasures.private-quarter')
    expect(women?.gate?.key).toBe(chieftain?.gate?.key)
    const carriers = theFiveTreasuresLoot.filter(
      (l) => l.key === 'key.the-5-treasures.private-quarter',
    )
    expect(carriers.map((l) => l.foe).sort()).toEqual(['foe.dexterous-ghost', 'foe.skillful-beast'])
  })

  it('puts the two exploration treasures where the source puts them (I-38)', () => {
    expect(areaByNumber(5)?.treasures).toEqual(['treasure.the-5-treasures.gold-and-red-gourd'])
    expect(areaByNumber(3)?.treasures).toEqual(['treasure.the-5-treasures.vase-of-muttonfat-jade'])
    for (const area of theFiveTreasuresAreas)
      for (const id of area.treasures) expect(theFiveTreasuresTreasureById(id), id).toBeDefined()
  })

  it('makes the Kitchen Monk a rescue, not an encounter (I-39)', () => {
    const kitchen = areaByNumber(7)
    expect(kitchen?.rescue?.foe).toBe('foe.monk')
    expect(kitchen?.rescue?.dishonorOnAttack).toBe(true)
    // He is nobody's encounter row: the Kitchen meets Devil servants.
    expect(encountersForArea(7).flatMap((e) => e.foes)).not.toContain('foe.monk')
  })

  it('keeps the printed description and Hint verbatim', () => {
    expect(areaByNumber(2)?.description).toContain('蓮花洞')
    expect(areaByNumber(5)?.description).toContain('recipients')
    expect(areaByNumber(8)?.hint).toBe(
      'By interpreting what is written on the sheets, you come to how two of the treasures work.',
    )
  })

  it('keeps the three prototype lines word for word, so the screen does not move', () => {
    // The design prototype shipped areas 2, 3 and 4. Phase 8 rebuilds the
    // screen on this file; until then the two must not drift.
    for (const beat of prototypeBeats) {
      const area = areaByNumber(beat.area)
      expect(area?.name, `area ${String(beat.area)} name`).toBe(beat.name)
      expect(area?.line, `area ${String(beat.area)} line`).toBe(beat.line)
    }
  })
})

describe('The 5 Treasures: the encounter tables (5T a1)', () => {
  it('belongs to a real area and names only printed foes', () => {
    for (const row of theFiveTreasuresEncounters) {
      expect(areaByNumber(row.area), row.id).toBeDefined()
      for (const foe of row.foes) expect(treasureFoeById(foe), `${row.id} -> ${foe}`).toBeDefined()
    }
  })

  it('covers all six faces exactly once in every area that rolls dice', () => {
    for (const area of theFiveTreasuresAreas) {
      const rows = encountersForArea(area.area)
      expect(rows.length, `${area.name} has no encounter row`).toBeGreaterThan(0)
      const faces = rows.flatMap((r) => r.faces).sort((a, b) => a - b)
      if (faces.length === 0) continue // a fixed encounter (I-34)
      expect(faces, `${area.name} face coverage`).toEqual([1, 2, 3, 4, 5, 6])
    }
  })

  it('makes the three dice-less areas fixed encounters (I-34)', () => {
    for (const area of [5, 6, 7]) {
      const rows = encountersForArea(area)
      expect(rows).toHaveLength(1)
      expect(rows[0]?.faces).toEqual([])
    }
  })

  it('reads the Attendants room 5-6 as two foes at once (R35)', () => {
    const both = encountersForArea(3).find((r) => r.faces.includes(5))
    expect(both?.foes).toEqual(['foe.skillful-beast', 'foe.dexterous-ghost'])
  })

  it('reads the Chieftain quarter 5-6 as Empty (I-36)', () => {
    const empty = encountersForArea(8).find((r) => r.faces.includes(6))
    expect(empty?.empty).toBe(true)
    expect(empty?.foes).toEqual([])
    expect(empty?.count).toBe('none')
  })
})

describe('The 5 Treasures: the loot (5T a2)', () => {
  it('gives every one of the nine foes at least one LOOT row', () => {
    for (const foe of treasureFoes) expect(lootForFoe(foe.id).length, foe.id).toBeGreaterThan(0)
  })

  it('covers all six faces exactly once wherever the line rolls dice', () => {
    for (const foe of treasureFoes) {
      const faces = lootForFoe(foe.id)
        .flatMap((r) => r.faces)
        .sort((a, b) => a - b)
      if (faces.length === 0) continue
      expect(faces, `${foe.name} loot faces`).toEqual([1, 2, 3, 4, 5, 6])
    }
  })

  it('resolves every treasure a drop names', () => {
    for (const row of theFiveTreasuresLoot)
      if (row.treasure !== null)
        expect(theFiveTreasuresTreasureById(row.treasure), row.id).toBeDefined()
  })

  it('reads the Devil servant 6 as a Hint with no text (I-08)', () => {
    const six = lootForFoe('foe.devil-servant').find((r) => r.faces.includes(6))
    expect(six?.hint).toBe(true)
    expect(six?.treasure).toBeNull()
  })

  it('drops the seven-star sword and the fan once each (I-33c)', () => {
    const once = theFiveTreasuresLoot.filter((r) => r.once).map((r) => r.item)
    expect(once).toContain('seven-star sword')
    expect(once).toContain('Plantain fan')
  })
})

describe('The 5 Treasures: the treasures (5T a2)', () => {
  it('names five, each sourced from a real area or a real foe', () => {
    expect(theFiveTreasuresTreasures).toHaveLength(5)
    for (const treasure of theFiveTreasuresTreasures) {
      const resolved =
        treasure.source === 'area'
          ? theFiveTreasuresAreaById(treasure.sourceRef)
          : treasureFoeById(treasure.sourceRef)
      expect(resolved, `${treasure.id} -> ${treasure.sourceRef}`).toBeDefined()
      for (const from of treasure.knownFrom)
        expect(
          theFiveTreasuresAreaById(from) ?? treasureFoeById(from),
          `${treasure.id} knownFrom ${from}`,
        ).toBeDefined()
    }
  })

  it('is reachable in full: every treasure has an area or a foe that yields it', () => {
    const fromLoot = new Set(
      theFiveTreasuresLoot.filter((l) => l.treasure !== null).map((l) => l.treasure),
    )
    const fromAreas = new Set(theFiveTreasuresAreas.flatMap((a) => a.treasures))
    for (const treasure of theFiveTreasuresTreasures)
      expect(fromLoot.has(treasure.id) || fromAreas.has(treasure.id), treasure.id).toBe(true)
  })

  it('keeps the printed effect verbatim', () => {
    expect(theFiveTreasuresTreasureById('treasure.the-5-treasures.gold-and-red-gourd')?.effect).toBe(
      'if opened it will swallow the sky, changing day to night. Close it to have the daylight back.',
    )
  })
})

describe('The 5 Treasures: flags, absences and acts', () => {
  it('starts every flag at its printed-or-inferred initial value', () => {
    expect(theFiveTreasuresFlags.map((f) => f.flag).sort()).toEqual([
      'cord-spells-known',
      'junior-king-asleep',
      'night',
      'sheets-read',
    ])
    for (const flag of theFiveTreasuresFlags) expect(flag.initial).toBe(false)
  })

  it('names a real flag, a real foe and a real area in every absence (I-45)', () => {
    const flags = new Set(theFiveTreasuresFlags.map((f) => f.flag))
    for (const absence of theFiveTreasuresAbsences) {
      expect(flags.has(absence.flag), absence.id).toBe(true)
      expect(treasureFoeById(absence.foe), absence.id).toBeDefined()
      if (absence.area !== 0) expect(areaByNumber(absence.area), absence.id).toBeDefined()
    }
  })

  it('numbers the acts from one, ascending, with exactly one ending', () => {
    expect(theFiveTreasuresActs.map((a) => a.act)).toEqual([1, 2, 3, 4, 5])
    expect(theFiveTreasuresActs.filter((a) => a.ending)).toHaveLength(1)
    expect(theFiveTreasuresActs.at(-1)?.ending).toBe(true)
  })

  it('tests each act against something that exists', () => {
    for (const act of theFiveTreasuresActs) {
      if (act.condition === 'start') expect(act.threshold).toBeNull()
      if (act.condition === 'enter')
        expect(theFiveTreasuresAreaById(String(act.threshold)), act.id).toBeDefined()
      if (act.condition === 'defeated')
        expect(treasureFoeById(String(act.threshold)), act.id).toBeDefined()
      if (act.condition === 'treasures')
        expect(act.threshold).toBeLessThanOrEqual(theFiveTreasuresTreasures.length)
    }
  })
})
