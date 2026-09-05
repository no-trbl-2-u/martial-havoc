/**
 * Social status and starting gold (MH p.5, R03).
 *
 * One d6 picks the band; the band's own dice spec gives the gold. The
 * spec carries `n: 0` for Vagabond's flat 1 GP, so this function has no
 * branch for it — see `../dice/rolls.ts`.
 */
import type { SocialStatus } from '@martial-havoc/content'
import { d6, rollSpec } from '../dice/rolls'
import type { DiceSource, Die } from '../dice/types'
import { UnknownEntry } from '../errors'

/** A rolled status: which band, how much gold, and the dice behind both. */
export const rollSocialStatus =
  (table: readonly SocialStatus[]) =>
  (
    dice: DiceSource,
  ): {
    readonly status: SocialStatus
    readonly gold: number
    readonly statusFace: Die
    readonly goldFaces: readonly Die[]
  } => {
    const statusFace = d6(dice)
    const status = table.find((s) => s.faces.includes(statusFace))
    // Every face 1-6 is covered by the printed table; a gap here is a
    // malformed table, not a rule outcome.
    if (status === undefined) throw new UnknownEntry('social status face', String(statusFace))
    const gold = rollSpec(status.goldDice)(dice)
    // Poor is 1d6-1, so a 1 gives 0 GP. The book allows it; nothing here
    // clamps it upward.
    return { status, gold: gold.sum, statusFace, goldFaces: gold.faces }
  }

/** Take a named status without rolling — how a printed sheet is loaded. */
export const chooseSocialStatus =
  (table: readonly SocialStatus[]) =>
  (status: string): SocialStatus | undefined =>
    table.find((s) => s.status.trim().toLowerCase() === status.trim().toLowerCase())
