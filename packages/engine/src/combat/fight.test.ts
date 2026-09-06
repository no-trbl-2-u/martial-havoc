/**
 * The scripted fight: a preset Master against a rostered opponent, from
 * the first round to a terminal state, on one fixed dice sequence.
 *
 * This is the phase's end-to-end proof (build plan, Phase 3: "a scripted
 * fight resolves end to end"). It wires the real content tables to the
 * real engine functions and drives them with `fromSequence`, so every
 * round below is reproducible face by face and the whole fight is a pure
 * function of its dice.
 *
 * The loop here is a *test harness*, not an engine export: R25's choice
 * belongs to the player, so the harness makes it with an explicit
 * policy and the engine keeps offering all four options.
 */
import { describe, expect, it } from 'vitest'
import {
  market,
  martialArts,
  opponents,
  presetNameResolution,
  presets,
  rituals,
  socialStatuses,
  techniques,
} from '@martial-havoc/content'
import { fromSequence } from '../dice/sources'
import { loadPreset } from '../creation/presets'
import type { CreationTables } from '../creation/tables'
import { attackStrength } from './attack-strength'
import type { NamedValue } from './attack-strength'
import { endsFight, resolveRound } from './round'
import type { FightEnd } from './round'
import { finalBlow } from './final-blow'

/** Every table creation reads, bound once for the file. */
const tables: CreationTables = {
  martialArts,
  socialStatuses,
  techniques,
  rituals,
  market,
  presets,
  presetNameResolution,
}

/** What one scripted fight reports when it stops. */
type FightLog = {
  readonly end: FightEnd
  readonly rounds: number
  readonly masterEndurance: number
  readonly opponentEndurance: number
}

/**
 * Run a fight to its terminal state under one dice sequence.
 *
 * The harness's policy for a won round (R25): create an Opening on the
 * first win of the fight, then take the damage on every win after it.
 * That is one legal reading of the four options among many - the engine
 * offers all four and picks none, which is exactly why the policy has to
 * live here and not in `./round.ts`.
 *
 * Dice order per round: the Master's 2d6, then the opponent's 2d6, then
 * the Final Blow's 2d6 if an Opening was standing when the round began.
 */
const runFight = (
  script: readonly number[],
  master: { readonly skill: number; readonly endurance: number },
  opponent: {
    readonly skill: number
    readonly endurance: number
    readonly proficiencies: readonly NamedValue[]
  },
  maxRounds = 20,
): FightLog => {
  const dice = fromSequence(script)
  let masterEndurance = master.endurance
  let opponentEndurance = opponent.endurance
  let opening = false
  let hasOpened = false
  let finalBlowLanded = false
  let unexpected = false
  let rounds = 0

  for (; rounds < maxRounds; ) {
    // An Opening standing from last round is spent first (R29 -> R30).
    if (opening) {
      const blow = finalBlow()(dice)
      opening = false
      if (blow.landed) {
        finalBlowLanded = true
        break
      }
    }

    rounds += 1
    const mine = attackStrength({ skill: master.skill })(dice)
    const theirs = attackStrength({
      skill: opponent.skill,
      proficiencies: opponent.proficiencies,
    })(dice)
    const outcome = resolveRound(mine, theirs)

    if (outcome.kind === 'unexpected-event') {
      unexpected = true
      break
    }
    if (outcome.kind === 'master-hit') {
      masterEndurance -= outcome.damage
    } else {
      // R25, harness policy: open once, then strike on every later win.
      if (!hasOpened) {
        opening = true
        hasOpened = true
      } else {
        opponentEndurance -= outcome.difference
      }
    }

    const end = endsFight({
      masterEndurance,
      opponentEndurance,
      finalBlowLanded,
      unexpectedEvent: unexpected,
    })
    if (end.ended) break
  }

  return {
    end: endsFight({
      masterEndurance,
      opponentEndurance,
      finalBlowLanded,
      unexpectedEvent: unexpected,
    }),
    rounds,
    masterEndurance,
    opponentEndurance,
  }
}

describe('a scripted fight, end to end (MH p.23-29)', () => {
  const jenYu = loadPreset(tables)('preset.jen-yu').master
  const brawler = opponents.find((o) => o.name.toLowerCase() === 'brawler')

  it('loads a preset Master and a rostered opponent from the shipped tables', () => {
    expect(jenYu.name).toBeTruthy()
    expect(jenYu.attributes.endurance.current).toBeGreaterThan(0)
    expect(brawler).toBeDefined()
  })

  it('ends on a landed Final Blow after an Opening (R29, R30, R26)', () => {
    // Round 1: Master 6+6=12 +10 = 22; opponent 1+1=2 +6 = 8. Master
    // wins -> Opening. Round 2 opens with the Final Blow: 4+4, doubles.
    const log = runFight(
      [6, 6, 1, 1, 4, 4],
      { skill: 10, endurance: 20 },
      { skill: 6, endurance: 12, proficiencies: [] },
    )
    expect(log.end).toEqual({ ended: true, reason: 'final-blow' })
    expect(log.rounds).toBe(1)
  })

  it('ends when the Master runs out of ENDURANCE (R24, R26)', () => {
    // Master SKILL 7, ENDURANCE 4; opponent SKILL 12 with a Proficiency
    // of 4. Each round the opponent wins by a wide margin.
    const log = runFight(
      [1, 1, 6, 6, 1, 1, 6, 6],
      { skill: 7, endurance: 4 },
      { skill: 12, endurance: 12, proficiencies: [{ name: 'Kick', value: 4 }] },
    )
    expect(log.end).toEqual({ ended: true, reason: 'master-down' })
    expect(log.masterEndurance).toBeLessThanOrEqual(0)
  })

  it('ends on a draw, because an Unexpected Event ends the combat phase (R32)', () => {
    // Both sides SKILL 9, both roll 3+4: a draw on the first round.
    const log = runFight(
      [3, 4, 3, 4],
      { skill: 9, endurance: 20 },
      { skill: 9, endurance: 20, proficiencies: [] },
    )
    expect(log.end).toEqual({ ended: true, reason: 'unexpected-event' })
    expect(log.rounds).toBe(1)
  })

  it('ends when the opponent runs out of ENDURANCE (R26)', () => {
    // Round 1 wins -> Opening. Round 2 begins with a missed Final Blow
    // (2+3), then a win of 12 -> damage. Opponent has 6 ENDURANCE.
    const log = runFight(
      [6, 6, 1, 1, 2, 3, 6, 6, 1, 1],
      { skill: 10, endurance: 20 },
      { skill: 4, endurance: 6, proficiencies: [] },
    )
    expect(log.end).toEqual({ ended: true, reason: 'opponent-down' })
    expect(log.opponentEndurance).toBeLessThanOrEqual(0)
  })

  it('is a pure function of its dice - the same script replays identically', () => {
    const script = [6, 6, 1, 1, 4, 4]
    const master = { skill: 10, endurance: 20 }
    const opponent = { skill: 6, endurance: 12, proficiencies: [] }
    expect(runFight(script, master, opponent)).toEqual(runFight(script, master, opponent))
  })
})
