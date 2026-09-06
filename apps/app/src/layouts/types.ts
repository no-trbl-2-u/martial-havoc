/**
 * The layout candidates Phase 8a puts to the operator.
 *
 * The build-plan row's `[needs-user-call]`: "the agent renders three
 * layouts at phone width with a working beat and files them; the
 * operator picks; the agent builds it." This module is the flag that
 * makes the three reachable, and **it is temporary** — Phase 8b keeps
 * the picked one and deletes this file with the two losers. A shipped
 * product does not carry an unchosen design behind a query string
 * (phase 8 brief, decision 2).
 */
import type { MenuOption } from '@martial-havoc/content'
import type { ShownResult } from '../components/beat/shown'
import type { Action, RecordState } from '../state/types'

/** The three candidates, in the order the brief lists them. */
export const LAYOUTS = ['a', 'b', 'c'] as const

/** One of {@link LAYOUTS}. */
export type LayoutId = (typeof LAYOUTS)[number]

/** The default, and what every unrecognised value falls back to. */
export const DEFAULT_LAYOUT: LayoutId = 'a'

/** What every candidate layout is handed. Identical for all three. */
export type LayoutProps = {
  readonly state: RecordState
  readonly dispatch: (a: Action) => void
  /** The authored line for this beat, already resolved. */
  readonly line: string
  /** The menu the rules allow here. */
  readonly options: readonly MenuOption[]
  /** The last result, mapped for display, or null. */
  readonly result: ShownResult | null
  /** The roll bar's primary label and whether it is live. */
  readonly primaryText: string
  readonly primaryDisabled: boolean
  /** The deeds count, already worded. */
  readonly deeds: string
}

/**
 * Read the candidate out of a query string.
 *
 * Total: anything that is not one of the three — absent, misspelled,
 * a stale bookmark — is {@link DEFAULT_LAYOUT}. A screenshot run and a
 * player who typed nonsense both get a working beat.
 */
export const layoutFromQuery = (search: string): LayoutId => {
  const match = /[?&]layout=([^&]*)/.exec(search)
  const value = match?.[1]?.toLowerCase()
  return (LAYOUTS as readonly string[]).includes(value ?? '')
    ? (value as LayoutId)
    : DEFAULT_LAYOUT
}
