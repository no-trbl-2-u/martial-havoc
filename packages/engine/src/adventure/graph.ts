/**
 * The area graph: where a Master may go, and what stops them.
 *
 * The adventure's `exits` are the passages; its `gate` is the lock. The
 * engine knows nothing about which door is paper and which is ivory - it
 * knows that a gate names a key and that the Master either carries it or
 * does not (I-07).
 */
import type { AdventureArea, AdventureTables } from '@martial-havoc/content'
import type { AdventureState } from './state'
import { withArea } from './state'

/** Find one area of `tables` by id. Total: undefined for an unknown id. */
export const areaById = (
  tables: AdventureTables,
  id: string,
): AdventureArea | undefined => tables.areas.find((area) => area.id === id)

/** The area the Master is standing in, or undefined if the state is stale. */
export const currentArea = (
  tables: AdventureTables,
  state: AdventureState,
): AdventureArea | undefined => areaById(tables, state.area)

/**
 * The areas reachable in one move from `from`.
 *
 * Every exit the area lists, resolved to a record. An exit naming an
 * area the adventure does not hold is dropped rather than thrown: the
 * content test is where a dangling exit is caught, and a play session is
 * not the place to discover it.
 */
export const exitsFrom = (
  tables: AdventureTables,
  from: string,
): readonly AdventureArea[] =>
  (areaById(tables, from)?.exits ?? [])
    .map((id) => areaById(tables, id))
    .filter((area): area is AdventureArea => area !== undefined)

/** Why a move was refused, or `open` where it was not. */
export type Passage =
  | { readonly ok: true; readonly area: AdventureArea }
  | { readonly ok: false; readonly reason: 'unknown-area' }
  | { readonly ok: false; readonly reason: 'not-adjacent' }
  | { readonly ok: false; readonly reason: 'locked'; readonly key: string; readonly text: string }

/**
 * May the Master walk from where they stand into `to`?
 *
 * Three ways to be told no, and each names itself: the area does not
 * exist, no passage leads there, or a gate wants a key the Master is not
 * carrying. A refusal is data, never an exception (spec.md, Refusals) -
 * the screen shows the door and what it wants.
 */
export const canEnter = (
  tables: AdventureTables,
  state: AdventureState,
  to: string,
): Passage => {
  const area = areaById(tables, to)
  if (area === undefined) return { ok: false, reason: 'unknown-area' }
  const here = areaById(tables, state.area)
  if (here !== undefined && !here.exits.includes(to)) return { ok: false, reason: 'not-adjacent' }
  const gate = area.gate
  if (gate !== null && !state.keys.includes(gate.key))
    return { ok: false, reason: 'locked', key: gate.key, text: gate.text }
  return { ok: true, area }
}

/**
 * Walk into `to` if the passage is open.
 *
 * Returns the unchanged state and the refusal where it is not, so a
 * caller can render "the paper door does not give" without branching on
 * an exception.
 */
export const enterArea = (
  tables: AdventureTables,
  state: AdventureState,
  to: string,
): { readonly state: AdventureState; readonly passage: Passage } => {
  const passage = canEnter(tables, state, to)
  return { state: passage.ok ? withArea(state, to) : state, passage }
}
