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
import { actFor, ending, hintFor } from '@martial-havoc/engine'
import { t, theFiveTreasures, theFiveTreasuresAreaById } from '@martial-havoc/content'
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
    case 'village':
      return { type: 'cave.village' }
  }
}

/**
 * The act ladder, as the beat needs it (Phase 10c).
 *
 * `actFor` gives the rung the Master is on; the record remembers which
 * rungs have been announced. A rung that is current and unannounced is
 * the one slip to show, and there is at most one because the ladder is
 * climbed a rung at a time — a Master who satisfies act 4 without ever
 * standing in act 3 (Golden Horn killed before the paper door) is
 * announced act 4 and never told about a rung they skipped, which is
 * the honest reading of "the highest satisfied act is current".
 */
const ladder = (state: RecordState) => {
  const acts = [...theFiveTreasures.acts].sort((a, b) => a.act - b.act)
  const act = actFor(theFiveTreasures, state.cave) ?? null
  return {
    acts,
    act,
    announce: act !== null && !state.actsSeen.includes(act.act) ? act : null,
  }
}

/**
 * The pacing override to print beside the result, or null.
 *
 * Only for the turn that was overruled, and only while that turn is
 * still the last thing that happened: the slip explains a result, so it
 * goes when the result does.
 */
const momentumFor = (state: RecordState): { readonly face: number; readonly was: string } | null =>
  state.result?.kind === 'turn' && state.result.momentum
    ? { face: state.result.eventFace, was: state.result.eventText }
    : null

export const BeatScreen = ({ state, dispatch }: Props) => {
  const area = theFiveTreasuresAreaById(state.cave.area)
  if (area === undefined) return null
  const { acts, act, announce } = ladder(state)
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
      area={area}
      hint={hintFor(theFiveTreasures, state.cave, area.id)}
      ending={ending(theFiveTreasures, state.cave)}
      acts={acts}
      act={act}
      announce={announce}
      momentum={momentumFor(state)}
      options={menuFor(state)}
      onPick={(option) => dispatch(actionOf(option))}
      result={result}
      deeds={fill(t('ui.deeds'), { n: state.deeds.length })}
      card={card}
    />
  )
}
