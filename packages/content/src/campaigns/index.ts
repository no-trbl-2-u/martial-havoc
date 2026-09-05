/**
 * The campaign layer: what an adventure can be about.
 *
 * Phase 5 adds the adventure format and The 5 Treasures here; this phase
 * ships only the d66 table of hooks the book prints (MH p.36-39, R50).
 */
import hooksFile from '../../data/campaigns/adventure-hooks.json'

import { byD66, byId } from '../lookup'
import type { D66Text } from '../types'

/** The 36 adventure hooks (MH p.36-39, R50). */
export const adventureHooks: readonly D66Text[] = Object.freeze(
  hooksFile.records as readonly D66Text[],
)
export const adventureHookById = byId(adventureHooks)
export const rollAdventureHook = byD66(adventureHooks)
