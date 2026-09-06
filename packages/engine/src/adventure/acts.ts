/**
 * Act markers and the ending screen.
 *
 * The source of an adventure may print no arc at all - The 5 Treasures
 * is two pages of rooms, foes and prizes - so acts are the format's own
 * layer, authored beside the transcription and labelled `invention`.
 * They are the answer to "what does this scene want from me next", and
 * the last of them is the answer to "when is it over".
 *
 * Four conditions, tested against the adventure state and nothing else:
 * `start` always holds, `enter` wants an area visited, `defeated` wants
 * a foe down, `treasures` wants a count in hand. Acts are tested in
 * ascending order and the **highest satisfied** one is current, so an
 * adventure can be written as a ladder without the engine tracking which
 * rungs were climbed.
 */
import type { AdventureAct, AdventureTables } from '@martial-havoc/content'
import type { AdventureState } from './state'

/** Is one act's condition satisfied by this state? */
export const actSatisfied = (state: AdventureState, act: AdventureAct): boolean => {
  switch (act.condition) {
    case 'start':
      return true
    case 'enter':
      return state.visited.includes(String(act.threshold))
    case 'defeated':
      return state.defeated.includes(String(act.threshold))
    case 'treasures':
      return state.treasures.length >= Number(act.threshold)
  }
}

/** The adventure's acts, lowest number first. */
const inOrder = (tables: AdventureTables): readonly AdventureAct[] =>
  [...tables.acts].sort((a, b) => a.act - b.act)

/**
 * The act the Master is in: the highest-numbered satisfied one.
 *
 * Undefined only for an adventure with no acts at all, which the format
 * permits and the content test for The 5 Treasures forbids.
 */
export const actFor = (
  tables: AdventureTables,
  state: AdventureState,
): AdventureAct | undefined =>
  inOrder(tables)
    .filter((act) => actSatisfied(state, act))
    .at(-1)

/** The row that carries `ending: true`, if the adventure has one. */
export const endingAct = (tables: AdventureTables): AdventureAct | undefined =>
  tables.acts.find((act) => act.ending)

/**
 * Has the Master reached the ending screen?
 *
 * True when the ending act's own condition is satisfied - not merely
 * when it is the current act, so an adventure whose ending is not its
 * highest-numbered act still ends correctly.
 */
export const isEnded = (tables: AdventureTables, state: AdventureState): boolean => {
  const ending = endingAct(tables)
  return ending !== undefined && actSatisfied(state, ending)
}

/** What the ending screen shows: the act, its line, and the premise closed. */
export type Ending = {
  readonly act: AdventureAct
  readonly line: string
  /** Treasures held when it ended. */
  readonly treasures: readonly string[]
  /** Foes defeated on the way. */
  readonly defeated: readonly string[]
  /** Dishonor Points earned inside the adventure (R39, I-39). */
  readonly dishonor: number
}

/** The ending screen, or null while the adventure is still running. */
export const ending = (tables: AdventureTables, state: AdventureState): Ending | null => {
  const act = endingAct(tables)
  if (act === undefined || !actSatisfied(state, act)) return null
  return {
    act,
    line: act.line,
    treasures: state.treasures,
    defeated: state.defeated,
    dishonor: state.dishonor,
  }
}
