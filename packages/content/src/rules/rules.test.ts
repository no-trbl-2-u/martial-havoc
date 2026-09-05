/**
 * The rules tables, checked at the addresses the book prints.
 *
 * As with the world tables: the schema and the counts prove the files are
 * well formed; this proves they say the right thing. The two tables with
 * derived fields get the most attention — social status, whose gold is a
 * dice spec rather than the printed string, and the Encounters matrix,
 * whose cells resolve to opponent ids.
 */
import { describe, expect, it } from 'vitest'
import { opponentById, opponents } from '../world/index'
import {
  cityServices,
  distances,
  encounterColumn,
  encounters,
  finalBlows,
  healingFor,
  monastery,
  monasteryColumn,
  region,
  regionColumn,
  retreatRows,
  rollCityEncounter,
  rollColumn,
  rollEncounter,
  rollFinalBlow,
  rollRoadFeature,
  rollRouteType,
  rollSocialStatus,
  rollSpecialItem,
  rollTreasure,
  rollUnexpectedEvent,
  socialStatuses,
  specialItems,
  treasures,
  unexpectedEvents,
  xpCategories,
  xpCostFor,
  xpCosts,
} from './index'

describe('social status (MH p.5, R03)', () => {
  it('maps each face to the band the book prints', () => {
    expect(rollSocialStatus(1)?.status).toBe('Vagabond')
    expect(rollSocialStatus(2)?.status).toBe('Poor')
    expect(rollSocialStatus(3)?.status).toBe('Middle Class')
    expect(rollSocialStatus(4)?.status).toBe('Middle Class')
    expect(rollSocialStatus(5)?.status).toBe('Rich')
    expect(rollSocialStatus(6)?.status).toBe('Noble')
  })

  it('covers all six faces exactly once between them', () => {
    const faces = socialStatuses.flatMap((s) => s.faces).sort()
    expect(faces).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('carries the printed gold as a dice spec, flat amounts included', () => {
    // Vagabond's flat 1 GP is n: 0, so nothing has to branch on a shape.
    expect(rollSocialStatus(1)?.goldDice).toEqual({ n: 0, d: 6, plus: 1 })
    expect(rollSocialStatus(2)?.goldDice).toEqual({ n: 1, d: 6, plus: -1 })
    expect(rollSocialStatus(3)?.goldDice).toEqual({ n: 3, d: 6, plus: 0 })
    expect(rollSocialStatus(5)?.goldDice).toEqual({ n: 5, d: 6, plus: 6 })
    expect(rollSocialStatus(6)?.goldDice).toEqual({ n: 10, d: 6, plus: 0 })
  })
})

describe('final blow and unexpected events (MH p.26-28)', () => {
  it('resolves all 18 Final Blow cells', () => {
    const rolled = [1, 2, 3, 4, 5, 6].flatMap((a) => [1, 2, 3, 4, 5, 6].map((b) => rollFinalBlow(a, b)))
    expect(rolled.every((r) => r !== undefined)).toBe(true)
    expect(new Set(rolled.map((r) => r?.id)).size).toBe(18)
    expect(rollFinalBlow(1, 1)).toMatchObject({ action: 'Strike', attribute: 'Furious', animal: 'Dragon' })
    expect(rollFinalBlow(6, 6)).toMatchObject({ action: 'Sweep', attribute: 'Sharp', animal: 'Unicorn' })
  })

  it('covers every 2d6 total of the Unexpected Event table', () => {
    for (let total = 2; total <= 12; total += 1) expect(rollUnexpectedEvent(total)).toBeDefined()
    expect(unexpectedEvents).toHaveLength(11)
    expect(rollUnexpectedEvent(6)?.text).toBe('The fight resumes')
  })

  it('flags exactly the two Enemy-retreat rows', () => {
    // Morale on a retreat row is sealed in spec.md; the flag is how the
    // engine finds these two without matching on prose.
    expect(retreatRows.map((r) => r.total)).toEqual([4, 10])
    expect(retreatRows.every((r) => r.text.startsWith('Enemy retreat'))).toBe(true)
  })
})

describe('healing and experience (MH p.31, p.34)', () => {
  it('gives each attribute its partial amount, and LUCK no full restore', () => {
    expect(healingFor('SKILL')?.amount).toBe(1)
    expect(healingFor('ENDURANCE')?.amount).toBe(4)
    expect(healingFor('LUCK')?.amount).toBe(1)
    expect(healingFor('LUCK')?.full).toBeNull()
    expect(healingFor('ENDURANCE')?.full).toBe("a week's rest")
  })

  it('scores four categories out of 3 each, minus Dishonor', () => {
    const scored = xpCategories.filter((c) => !c.subtracted)
    expect(scored).toHaveLength(4)
    expect(scored.every((c) => c.min === 1 && c.max === 3)).toBe(true)
    const dishonor = xpCategories.find((c) => c.subtracted)
    expect(dishonor?.max).toBeNull()
    // R43: 4 to 12 XP before Dishonor.
    expect(scored.reduce((n, c) => n + (c.max ?? 0), 0)).toBe(12)
    expect(scored.reduce((n, c) => n + c.min, 0)).toBe(4)
  })

  it('prices every increase at every SKILL band', () => {
    expect(xpCosts).toHaveLength(15)
    expect(xpCostFor('SKILL')('SKILL 6 or less')?.cost).toBe(8)
    expect(xpCostFor('LUCK')('SKILL 10-12')?.cost).toBe(6)
    expect(xpCostFor('ENDURANCE')('SKILL 7-9')?.cost).toBe(4)
    expect(xpCostFor('Somersaults')('SKILL 7-9')).toBeUndefined()
  })
})

describe('exploration (MH p.43-45)', () => {
  it('fills five region columns and five monastery columns, six faces each', () => {
    expect(region).toHaveLength(30)
    expect(monastery).toHaveLength(30)
    for (const column of ['Location', 'Landmark', 'Resources', 'Risk', 'Event'])
      expect(regionColumn(column)).toHaveLength(6)
    for (const column of ['Location', 'Location Function', 'Openings', 'Atmosphere', 'Event'])
      expect(monasteryColumn(column)).toHaveLength(6)
  })

  it('rolls one d6 on a named column', () => {
    expect(rollColumn(region)('Location')(1)?.text).toBe('City')
    expect(rollColumn(region)('Resources')(5)?.text).toBe('Jade')
    expect(rollColumn(monastery)('Atmosphere')(6)?.text).toBe('Eerie')
    expect(rollColumn(region)('Weather')(1)).toBeUndefined()
  })

  it('keeps the Frontier footnote beside the cell rather than inside it', () => {
    const frontier = rollColumn(region)('Landmark')(4)
    expect(frontier?.text).toBe('Frontier')
    expect(frontier?.note).toContain('border of imperial law')
  })

  it('covers every route-type total and every road-feature face', () => {
    expect(distances).toHaveLength(9)
    for (let total = 2; total <= 12; total += 1) expect(rollRouteType(total)).toBeDefined()
    for (let face = 1; face <= 6; face += 1) expect(rollRoadFeature(face)).toBeDefined()
    expect(rollRouteType(2)?.text).toBe('Nothing')
    expect(rollRouteType(12)?.text).toBe('Paved road')
    expect(rollRoadFeature(6)?.text).toBe('Guard post')
  })
})

describe('cities (MH p.50-51)', () => {
  it('prices every service verbatim, ranges and offerings included', () => {
    expect(cityServices).toHaveLength(11)
    expect(cityServices.find((s) => s.service === 'Funeral')?.price).toBe('50-200 GP')
    expect(cityServices.find((s) => s.service === 'Confucian library')?.price).toBe('free offering')
  })

  it('resolves all 12 city-encounter cells of the banded table', () => {
    const rolled = [1, 2, 3, 4, 5, 6].flatMap((a) => [1, 2, 3, 4, 5, 6].map((b) => rollCityEncounter(a, b)))
    expect(rolled.every((r) => r !== undefined)).toBe(true)
    expect(new Set(rolled.map((r) => r?.id)).size).toBe(12)
    expect(rollCityEncounter(1, 1)).toMatchObject({ connection: 'owes you money', trait: 'Loyalist' })
    expect(rollCityEncounter(6, 6)).toMatchObject({ connection: 'is a rival', trait: 'Undercover' })
  })
})

describe('encounters matrix (MH p.67, R74)', () => {
  it('fills five columns on every 2d6 total', () => {
    expect(encounters).toHaveLength(55)
    for (const column of ['Urban', 'Non-urban', 'Water', 'Supernatural', 'Monastery']) {
      expect(encounterColumn(column)).toHaveLength(11)
      for (let total = 2; total <= 12; total += 1) expect(rollEncounter(column)(total)).toBeDefined()
    }
  })

  it('resolves every named cell to an opponent that exists', () => {
    for (const cell of encounters.filter((c) => c.opponentRef !== null))
      expect(opponentById(cell.opponentRef as string), cell.id).toBeDefined()
  })

  it('redirects the two italic Supernatural cells instead of naming an opponent (I-19)', () => {
    const redirects = encounters.filter((c) => c.redirectColumn !== null)
    expect(redirects.map((c) => `${c.column} ${String(c.total)}`)).toEqual([
      'Non-urban 2',
      'Non-urban 12',
    ])
    expect(redirects.every((c) => c.opponentRef === null)).toBe(true)
    expect(redirects.every((c) => c.redirectColumn === 'Supernatural')).toBe(true)
  })

  it('keeps the matrix spelling of Youxia while resolving it to the stat block', () => {
    const cell = rollEncounter('Non-urban')(11)
    expect(cell?.printed).toBe('Yauxia')
    expect(cell?.opponentRef).toBe('opponent.youxia')
  })

  it('reaches 49 of the 50 opponents; only the Dealer is off the matrix', () => {
    const reachable = new Set(encounters.map((c) => c.opponentRef).filter((id) => id !== null))
    const unreachable = opponents.filter((o) => !reachable.has(o.id)).map((o) => o.name)
    expect(unreachable).toEqual(['Dealer'])
  })
})

describe('treasures and special items (MH p.68-69)', () => {
  it('fills all three ENDURANCE bands on all six faces', () => {
    expect(treasures).toHaveLength(18)
    for (const band of ['Up to 16', '17-19', '20 or more'])
      for (let face = 1; face <= 6; face += 1) expect(rollTreasure(band)(face)).toBeDefined()
    expect(rollTreasure('Up to 16')(1)?.text).toBe('Nothing')
    expect(rollTreasure('20 or more')(6)?.text).toBe('Special Item')
  })

  it('covers every 2d6 total of the Special Items table', () => {
    expect(specialItems).toHaveLength(11)
    for (let total = 2; total <= 12; total += 1) expect(rollSpecialItem(total)).toBeDefined()
    expect(rollSpecialItem(12)?.name).toBe("Sun WuKong's Staff")
    expect(rollSpecialItem(6)?.effect).toBe('effective against spirits')
  })
})
