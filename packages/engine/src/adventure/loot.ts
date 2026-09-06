/**
 * What the dead carry, and what is lying in the room.
 *
 * A foe's printed LOOT line becomes rows in `loot.json`: a line with
 * dice is one row per band and needs a d6; a line naming one thing is a
 * single row and needs none. Three of the rows are not objects at all -
 * the Devil servant's silent 6 is a Hint (I-08), two attendants carry
 * the same key (I-07), and three foes carry one of the five treasures.
 * The engine sorts those into the right list on the state and leaves the
 * item text alone.
 */
import type { AdventureLoot, AdventureTables } from '@martial-havoc/content'
import type { Die, DiceSource } from '../dice/types'
import { d6 } from '../dice/rolls'
import type { AdventureState } from './state'
import { withItem, withKey, withTreasure } from './state'

/** Every LOOT row of one foe, in printed order. */
export const rowsForFoe = (tables: AdventureTables, foe: string): readonly AdventureLoot[] =>
  tables.loot.filter((row) => row.foe === foe)

/** One resolved drop: the row, the face that found it, and what it is. */
export type Drop = {
  readonly row: AdventureLoot | undefined
  /** The face rolled, or undefined where the line names a single drop. */
  readonly face: Die | undefined
}

/**
 * Read one face of a foe's LOOT line without rolling.
 *
 * A foe with no rows drops nothing; a face no row covers drops nothing.
 * Both are `row: undefined` rather than a throw - an adventure may hold
 * a foe who carries nothing worth naming.
 */
export const dropFor = (tables: AdventureTables, foe: string, face: number): Drop => {
  const rows = rowsForFoe(tables, foe)
  if (rows.length === 0) return { row: undefined, face: undefined }
  const single = rows.length === 1 && rows[0]?.faces.length === 0
  if (single) return { row: rows[0], face: undefined }
  return { row: rows.find((r) => r.faces.includes(face)), face: face as Die }
}

/**
 * Roll a foe's LOOT line.
 *
 * Draws a die only where the printed line has one, so a scripted
 * sequence matches the printed procedure exactly.
 */
export const lootFrom =
  (tables: AdventureTables, foe: string) =>
  (dice: DiceSource): Drop => {
    const rows = rowsForFoe(tables, foe)
    const single = rows.length === 1 && rows[0]?.faces.length === 0
    return dropFor(tables, foe, single ? 0 : d6(dice))
  }

/**
 * Put a drop where it belongs on the state.
 *
 * A treasure goes to `treasures` (and reveals its own effect, I-60); a
 * key to `keys`; a Hint row to nothing here, because which area's hint
 * it reveals is the caller's reading (I-08) and the engine will not
 * guess it; anything else is an item.
 */
export const takeDrop = (state: AdventureState, row: AdventureLoot | undefined): AdventureState => {
  if (row === undefined) return state
  if (row.treasure !== null) return withTreasure(state, row.treasure)
  if (row.key !== null) return withKey(state, row.key)
  if (row.hint) return state
  return withItem(state, row.item)
}

/**
 * Take a treasure that lies in an area rather than on a body (I-38).
 *
 * The gourd on the Storage room's shelves and the vase on the Attendants
 * room's pedestal are exploration, not loot; the format says so with the
 * area's `treasures` field and this is how it is picked up.
 */
export const takeAreaTreasure = (
  tables: AdventureTables,
  state: AdventureState,
  area: string,
  treasure: string,
): AdventureState =>
  (tables.areas.find((a) => a.id === area)?.treasures ?? []).includes(treasure)
    ? withTreasure(state, treasure)
    : state
