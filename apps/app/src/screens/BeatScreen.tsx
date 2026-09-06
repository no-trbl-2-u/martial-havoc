/**
 * The beat: the authored line, the last result with both dice and its
 * label, the menu of what the rules allow here, the passage field and
 * the roll bar (spec.md, Horizon; design prototype, "BEAT").
 *
 * This screen resolves the beat — line, menu, result, roll-bar state —
 * and `./../components/beat/SheetBeat` lays it out. The split survives
 * from Phase 8a, where three candidate arrangements had to render
 * identical data for the operator's comparison to be a fair one; it
 * stays because resolving and arranging are genuinely different jobs,
 * and the next surface to grow a beat reuses the resolution.
 */
import { beatForArea, optionById, optionsForArea, t } from '@martial-havoc/content'
import { fill } from '../lib/fill'
import { SheetBeat } from '../components/beat/SheetBeat'
import { shown } from '../components/beat/shown'
import type { Action, RecordState } from '../state/types'

type Props = { readonly state: RecordState; readonly dispatch: (a: Action) => void }

export const BeatScreen = ({ state, dispatch }: Props) => {
  const beat = beatForArea(state.area)
  const options = optionsForArea(state.area)
  const result = state.result === null ? null : shown(state.result, state.sheet)
  // The roll bar is live only where the menu offers something to roll.
  const hasCheck = options.some((o) => o.action === 'skill-check' || o.action === 'luck-check')
  // The roll card's check, if a card is up and its option is this area's.
  const cardOption = state.roll === null ? undefined : optionById(state.roll.optionId)
  return (
    <SheetBeat
      state={state}
      dispatch={dispatch}
      line={beat?.line ?? t('ui.empty.line')}
      options={options}
      result={result}
      primaryText={t('ui.roll.primary')}
      primaryDisabled={!hasCheck}
      deeds={fill(t('ui.deeds'), { n: state.deeds.length })}
      cardOption={cardOption !== undefined && cardOption.area === state.area ? cardOption : null}
    />
  )
}
