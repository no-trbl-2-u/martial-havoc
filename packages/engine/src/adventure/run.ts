/**
 * One Master turn, as the adventure's own procedure runs it.
 *
 * The 5 Treasures prints one loop and nothing else: enter an area, roll
 * the Event table, and on 1-3 roll for the creature encountered there.
 * {@link step} is that loop, and it is the only function in this folder
 * that draws dice on its own account.
 *
 * What it does **not** do is resolve a fight. Combat is the rulebook's,
 * it lives in `../combat` and `../multiple`, and it needs decisions the
 * adventure cannot make (which Technique, whether to flee). So `step`
 * hands the encounter back and stops. The caller fights it, then reports
 * the result through {@link resolveEncounter}.
 */
import type { AdventureArea, AdventureTables } from '@martial-havoc/content'
import type { DiceSource } from '../dice/types'
import type { AdventureState } from './state'
import { withDefeated, withDishonor, withRescued } from './state'
import type { Passage } from './graph'
import { areaById, enterArea } from './graph'
import type { Encounter } from './encounter'
import { encounterIn } from './encounter'
import type { EventRoll } from './event'
import { bringsEncounter, forMomentum, rollEvent } from './event'
import { revealHint } from './hints'
import { takeAreaTreasure } from './loot'
import type { Ending } from './acts'
import { actFor, ending } from './acts'
import type { AdventureAct } from '@martial-havoc/content'

/** What one turn produced. */
export type Turn = {
  readonly state: AdventureState
  /** Why a move was refused, or the area walked into. */
  readonly passage: Passage
  /** The area the Master ended the turn in, if the move went through. */
  readonly area: AdventureArea | undefined
  /** The event rolled on entering, or undefined where the move was refused. */
  readonly event: EventRoll | undefined
  /** The encounter the event brought, or undefined where it brought none. */
  readonly encounter: Encounter | undefined
  /** True where the event revealed this area's Hint (I-06b, I-60). */
  readonly hintRevealed: boolean
  /**
   * True where the book's pacing rule overruled the roll (MH p.84, R82).
   *
   * The `event` above already carries the forced kind and the face that
   * was actually rolled, so a screen can print both: what the dice said
   * and what the story did with it.
   */
  readonly momentum: boolean
  /** The act the Master is in after the turn. */
  readonly act: AdventureAct | undefined
  /** The ending screen, or null while the adventure runs. */
  readonly ending: Ending | null
}

/**
 * Take one turn: walk into `to`, roll the Event, resolve what it brings.
 *
 * Dice are drawn in the order the printed procedure asks for them: one
 * for the Event, then one for the area's encounter table where the event
 * brings an encounter and the area's table rolls dice. A refused move
 * draws none at all, so a locked door costs nothing.
 *
 * A Hint event reveals the area's grey paragraph (I-06b); an encounter
 * whose foes are all gone or whose row is `Empty` degrades to a safe
 * exploration (I-36), and the turn reports it as an encounter that met
 * nothing rather than pretending no event was rolled.
 */
export const step = (
  tables: AdventureTables,
  state: AdventureState,
  to: string,
  dice: DiceSource,
  /**
   * Options the caller supplies from the adventure's own judgement.
   *
   * `momentum` says this door is a plot point, so the book's pacing rule
   * applies to the Event rolled at it (MH p.84, R82). Which door that is
   * belongs to the adventure's content, never to the engine, which is
   * why it arrives as an argument rather than a table lookup.
   */
  options: { readonly momentum?: boolean } = {},
): Turn => {
  const walked = enterArea(tables, state, to)
  if (!walked.passage.ok)
    return {
      state,
      passage: walked.passage,
      area: undefined,
      event: undefined,
      encounter: undefined,
      hintRevealed: false,
      momentum: false,
      act: actFor(tables, state),
      ending: ending(tables, state),
    }

  const area = walked.passage.area
  const rolled = rollEvent(tables.events)(dice)
  // The roll first, then the story's veto over it. The order matters:
  // the die is drawn either way, so a forced Encounter costs the same
  // dice as a free one and a fixed sequence stays fixed.
  const event = options.momentum === true ? forMomentum(rolled) : rolled
  const momentum = event.kind !== rolled.kind
  const hinted = event.kind === 'hint'
  const afterHint = hinted ? revealHint(walked.state, area.id) : walked.state
  const encounter = bringsEncounter(event.kind)
    ? encounterIn(tables, afterHint, area.area)(dice)
    : undefined

  return {
    state: afterHint,
    passage: walked.passage,
    area,
    event,
    encounter,
    hintRevealed: hinted,
    momentum,
    act: actFor(tables, afterHint),
    ending: ending(tables, afterHint),
  }
}

/**
 * Report the outcome of a fight the caller resolved.
 *
 * Named foes go into `defeated`, which is what removes them from every
 * table they appear in (I-33b, I-33c). Rank and file are not recorded:
 * Devil servants, Ogres and Woodgatherers are unlimited, so a caller
 * passes only the foes the adventure treats as named.
 */
export const resolveEncounter = (
  state: AdventureState,
  defeated: readonly string[],
): AdventureState => defeated.reduce(withDefeated, state)

/**
 * Free the rescue in the area the Master stands in (I-39).
 *
 * The reward is the rescue's own loot roll, which the caller makes
 * through `lootFrom`; this only records that they were freed rather than
 * fought.
 */
export const rescue = (
  tables: AdventureTables,
  state: AdventureState,
): AdventureState => {
  const here = areaById(tables, state.area)
  return here?.rescue == null ? state : withRescued(state, here.rescue.foe)
}

/**
 * Attack the rescue instead of freeing them (I-39).
 *
 * The source is silent on the cost and the reading names Dishonor, so
 * that is what this applies: one Dishonor Point, subtracted from the
 * adventure's XP total at the end (R43). The fight itself is the
 * caller's, exactly as any other.
 */
export const attackRescue = (
  tables: AdventureTables,
  state: AdventureState,
): AdventureState => {
  const here = areaById(tables, state.area)
  return here?.rescue?.dishonorOnAttack === true ? withDishonor(state, 1) : state
}

/**
 * Take a treasure lying in the area the Master stands in (I-38).
 *
 * A convenience over `takeAreaTreasure` that reads the area off the
 * state, so a caller driving turns never has to name it twice.
 */
export const takeHere = (
  tables: AdventureTables,
  state: AdventureState,
  treasure: string,
): AdventureState => takeAreaTreasure(tables, state, state.area, treasure)
