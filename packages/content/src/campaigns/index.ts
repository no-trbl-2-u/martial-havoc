/**
 * The campaign layer: what an adventure can be about.
 *
 * Phase 2 shipped the d66 table of hooks the book prints (MH p.36-39,
 * R50). The prototype slice adds The 5 Treasures' nine foes as printed
 * (5T a2) and three of its eight areas as the beat screen shows them,
 * with a menu per area. Phase 5 replaces the slice with the adventure
 * format and the whole cave; the foes file stays.
 */
import hooksFile from '../../data/campaigns/adventure-hooks.json'
import foesFile from '../../data/campaigns/the-5-treasures-foes.json'
import beatsFile from '../../data/campaigns/the-5-treasures-prototype-beats.json'
import optionsFile from '../../data/campaigns/the-5-treasures-prototype-options.json'

import { byD66, byId, inColumn } from '../lookup'
import type { Beat, D66Text, MenuOption, Opponent } from '../types'

/** The 36 adventure hooks (MH p.36-39, R50). */
export const adventureHooks: readonly D66Text[] = Object.freeze(
  hooksFile.records as readonly D66Text[],
)
export const adventureHookById = byId(adventureHooks)
export const rollAdventureHook = byD66(adventureHooks)

/** The nine stat blocks of The 5 Treasures (5T a2), in the opponent shape. */
export const treasureFoes: readonly Opponent[] = Object.freeze(
  foesFile.records as readonly Opponent[],
)
export const treasureFoeById = byId(treasureFoes)

/** The prototype slice's areas: printed name, authored line (5T a1; ours). */
export const prototypeBeats: readonly Beat[] = Object.freeze(beatsFile.records as readonly Beat[])
/** The beat for one printed area number, or undefined outside the slice. */
export const beatForArea = (area: number): Beat | undefined =>
  prototypeBeats.find((b) => b.area === area)

/** The prototype slice's menu, every entry with its action and its line. */
export const prototypeOptions: readonly MenuOption[] = Object.freeze(
  optionsFile.records as readonly MenuOption[],
)
export const optionById = byId(prototypeOptions)
/** Every menu entry offered in one area, in printed order. */
export const optionsForArea = inColumn(prototypeOptions, 'area')
