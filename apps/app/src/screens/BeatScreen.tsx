/**
 * The beat: the area as the book prints it, the last result with both
 * dice and its label, the menu of what the cave allows here, the
 * passage field and the roll bar (spec.md, Horizon; 5T a1).
 *
 * This screen resolves the beat - area, hint, menu, result, the roll
 * card's reason - and `SheetBeat` lays it out. Every fact comes from
 * the engine's adventure state and the adventure's tables; the menu is
 * `menuFor` in `../state/menu`, a pure function of the record.
 */
import { ending, hintFor } from '@martial-havoc/engine'
import { t, theFiveTreasures, theFiveTreasuresAreaById, theFiveTreasuresMeta } from '@martial-havoc/content'
import { fill } from '../lib/fill'
import { SheetBeat } from '../components/beat/SheetBeat'
import type { RollCardReason } from '../components/beat/RollCard'
import { shown } from '../components/beat/shown'
import { menuFor } from '../state/menu'
import type { BeatOption } from '../state/menu'
import type { Action, RecordState } from '../state/types'

type Props = { readonly state: RecordState; readonly dispatch: (a: Action) => void }

/** A menu row's tap, as the reducer's action. */
const actionOf = (option: BeatOption): Action => {
  switch (option.action.kind) {
    case 'go':
      return { type: 'cave.go', to: option.action.to }
    case 'take':
      return { type: 'cave.take', treasure: option.action.treasure }
    case 'rescue':
      return { type: 'cave.rescue' }
    case 'attack':
      return { type: 'cave.attack' }
    case 'learn':
      return { type: 'cave.learn' }
    case 'fight':
      return { type: 'cave.fight', foe: option.action.foe }
    case 'rest':
      return { type: 'cave.rest' }
    case 'gourd':
      return { type: 'cave.gourd' }
    case 'leave':
      return { type: 'cave.leave' }
  }
}

/**
 * The book's opening stays on the page until the Master has done or
 * seen anything: still on the start area, nothing visited past it, no
 * deed recorded. After that it lives under ABOUT.
 */
const premiseFor = (state: RecordState): string | null =>
  state.cave.area === theFiveTreasures.meta.startArea &&
  state.cave.visited.length <= 1 &&
  state.deeds.length === 0
    ? theFiveTreasuresMeta.premise
    : null

export const BeatScreen = ({ state, dispatch }: Props) => {
  const area = theFiveTreasuresAreaById(state.cave.area)
  if (area === undefined) return null
  const result = state.result === null ? null : shown(state.result, state.sheet)
  const to = state.roll === null ? undefined : theFiveTreasuresAreaById(state.roll.to)
  const card: RollCardReason | null =
    to === undefined
      ? null
      : {
          title: fill(t('ui.cave.go'), { name: to.name.toUpperCase() }),
          note: t('ui.card.move.note'),
          plate: 'event',
          need: 1,
        }
  return (
    <SheetBeat
      state={state}
      dispatch={dispatch}
      premise={premiseFor(state)}
      area={area}
      hint={hintFor(theFiveTreasures, state.cave, area.id)}
      ending={ending(theFiveTreasures, state.cave)}
      options={menuFor(state)}
      onPick={(option) => dispatch(actionOf(option))}
      result={result}
      deeds={fill(t('ui.deeds'), { n: state.deeds.length })}
      card={card}
    />
  )
}
