/**
 * Choosing or rolling a Martial Art (MH p.7, R09).
 *
 * The table is banded: the first d6 gives the band (1-2 / 3-4 / 5-6),
 * the second the row within it, 18 entries in all. D05 in the estate's
 * discrepancies confirms the shape against a reading of it as a d66.
 */
import type { MartialArt, NameResolution } from '@martial-havoc/content'
import { d6 } from '../dice/rolls'
import type { DiceSource, Die } from '../dice/types'
import { UnknownEntry } from '../errors'
import { canonicalName, findByName } from './tables'

/** Roll the banded table: band die, then row die. */
export const rollMartialArt =
  (table: readonly MartialArt[]) =>
  (
    dice: DiceSource,
  ): { readonly martialArt: MartialArt; readonly faces: readonly [Die, Die] } => {
    const band = d6(dice)
    const row = d6(dice)
    const martialArt = table.find((m) => m.faces.includes(band) && m.row === row)
    // All 36 (band, row) pairs land on one of the 18 entries; a miss is a
    // malformed table.
    if (martialArt === undefined) throw new UnknownEntry('martial art cell', `${band}/${row}`)
    return { martialArt, faces: [band, row] }
  }

/** Take a Martial Art by id. An id the table does not hold is a caller bug. */
export const chooseMartialArt =
  (table: readonly MartialArt[]) =>
  (id: string): MartialArt => {
    const martialArt = table.find((m) => m.id === id)
    if (martialArt === undefined) throw new UnknownEntry('martial art', id)
    return martialArt
  }

/**
 * Take a Martial Art by the name a sheet prints, through the resolution
 * map ("Wing Chun" is Red Boat Wing Chun, "Scorpion style" is Praying
 * Mantis Style).
 */
export const martialArtBySheetName =
  (table: readonly MartialArt[], resolution: readonly NameResolution[]) =>
  (onSheet: string): MartialArt | undefined =>
    findByName(table, canonicalName(resolution)(onSheet))
