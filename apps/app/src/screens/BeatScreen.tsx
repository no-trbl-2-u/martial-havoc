/**
 * The beat: the authored line, the last result with both dice and its
 * label, the menu of what the rules allow here, the passage field and
 * the roll bar (spec.md, Horizon; design prototype, "BEAT").
 *
 * Since Phase 8a this screen no longer lays the beat out itself. It
 * resolves the beat — line, menu, result, roll-bar state — and hands
 * the same props to one of three candidate layouts, which the operator
 * picks between (`plan/phases/phase_8_the_ui.md`, 8a). Phase 8b keeps
 * the picked one and deletes the rest.
 *
 * Resolving here rather than in each layout is what makes the choice a
 * fair one: all three candidates render identical data, so what an
 * operator compares is the arrangement and nothing else.
 */
import type { ReactElement } from 'react'
import { beatForArea, optionsForArea, t } from '@martial-havoc/content'
import { fill } from '../lib/fill'
import { shown } from '../components/beat/shown'
import { LedgerLayout } from '../layouts/LedgerLayout'
import { ScrollLayout } from '../layouts/ScrollLayout'
import { SheetLayout } from '../layouts/SheetLayout'
import type { LayoutId, LayoutProps } from '../layouts/types'
import { DEFAULT_LAYOUT } from '../layouts/types'
import type { Action, RecordState } from '../state/types'

type Props = {
  readonly state: RecordState
  readonly dispatch: (a: Action) => void
  /** Which candidate to draw. Absent means {@link DEFAULT_LAYOUT}. */
  readonly layout?: LayoutId
}

/** The three candidates, keyed by the id the query string carries. */
const LAYOUT_COMPONENTS: Readonly<Record<LayoutId, (p: LayoutProps) => ReactElement>> = {
  a: ScrollLayout,
  b: SheetLayout,
  c: LedgerLayout,
}

export const BeatScreen = ({ state, dispatch, layout }: Props) => {
  const beat = beatForArea(state.area)
  const options = optionsForArea(state.area)
  const result = state.result === null ? null : shown(state.result, state.sheet)
  // The roll bar is live only where the menu offers something to roll.
  const hasCheck = options.some((o) => o.action === 'skill-check' || o.action === 'luck-check')
  const Layout = LAYOUT_COMPONENTS[layout ?? DEFAULT_LAYOUT]
  return (
    <Layout
      state={state}
      dispatch={dispatch}
      line={beat?.line ?? t('ui.empty.line')}
      options={options}
      result={result}
      primaryText={state.manual.length === 2 ? t('ui.roll.manual') : t('ui.roll.primary')}
      primaryDisabled={!hasCheck}
      deeds={fill(t('ui.deeds'), { n: state.deeds.length })}
    />
  )
}
