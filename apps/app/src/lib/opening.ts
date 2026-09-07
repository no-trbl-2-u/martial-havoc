/**
 * The first act: has this adventure begun, and where does the app
 * return to while it has not?
 *
 * Phase 10b reversed one of Phase 8c's calls. A made Master used to
 * open on the Flat-top mountain, already inside the scene, with the
 * book's premise as a slip they might or might not read before the
 * first roll. They now open in Fen Pass, the trail-head village, with
 * the premise as the Call (MH p.84, Act I) and the trail as the point
 * of no return.
 *
 * That creates a state the app did not have before — *made, but not
 * yet begun* — and two questions that have to be answered the same way
 * everywhere. Both are answered from one fact, so they cannot disagree:
 * **the start area is in `visited` exactly when the trail has been
 * taken** (`beginAdventure` leaves the list empty; `doTrail` records
 * the arrival).
 *
 * Nothing new is persisted for this. `visited` is already in the
 * campaign record and already means "entered", so a save written before
 * this phase reads correctly: it has the start area in the list,
 * because that Master had walked in.
 */
import { theFiveTreasures } from '@martial-havoc/content'
import type { RecordState, Screen } from '../state/types'

/**
 * Has the Master taken the trail out of Fen Pass?
 *
 * True from the moment they arrive on the mountain and forever after —
 * walking back down to the village does not un-begin an adventure, it
 * only visits the doorstep of one already under way.
 */
export const hasBegun = (state: RecordState): boolean =>
  state.cave.visited.includes(theFiveTreasures.meta.startArea)

/**
 * Where a panel button returns to when it is pressed a second time.
 *
 * The beat once the adventure is under way; the village before that.
 * Returning to a beat that has not started would let a player step over
 * the first act by opening RULES and closing it again — the header
 * would be a door the trail is supposed to be.
 */
export const home = (state: RecordState): Screen => (hasBegun(state) ? 'beat' : 'village')
