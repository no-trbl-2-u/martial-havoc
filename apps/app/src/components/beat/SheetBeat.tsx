/**
 * The beat, laid out.
 *
 * The area's printed text scrolls alone in the upper page. The menu is
 * a fixed sheet across the bottom, above the roll bar, so every button
 * the player can press sits in the bottom third of a 390x844 phone -
 * the part a thumb reaches without regripping. When a result lands it
 * overlays the top of the sheet rather than pushing anything down, so
 * the menu never moves under the finger between one tap and the next.
 *
 * The bet: this is a game played one-handed, in a chair, for an hour
 * at a time. Nothing pressable should ever scroll away.
 *
 * The cost, accepted: the text gets less room than a full-page scroll
 * would give it, and a landed result covers the first row or two of
 * the menu until it is read.
 *
 * Chosen by the operator on 2026-09-06 from the three candidates Phase
 * 8a rendered; `design/INDEX.md` records the decision.
 *
 * The roll card (the operator's pick from design/roll-modal) sits over
 * all of this while a move is being rolled. The result slip yields to
 * it: the card carries the dice, the pill and the citation until
 * CONTINUE, then the slip does. Nothing under the card moves.
 */
import { ScrollView, StyleSheet, View } from 'react-native'
import type { AdventureAct, AdventureArea } from '@martial-havoc/content'
import type { Ending } from '@martial-havoc/engine'
import { ActMark, ActSlip, MomentumSlip } from './ActSlip'
import { AreaSlip, BeatFoot, EndingSlip, MenuList, ResultSlip } from './pieces'
import { RollCard } from './RollCard'
import type { RollCardReason } from './RollCard'
import type { ShownResult } from './shown'
import { color } from '../../theme/tokens'
import type { BeatOption } from '../../state/menu'
import type { Action, RecordState } from '../../state/types'

export type SheetBeatProps = {
  readonly state: RecordState
  readonly dispatch: (a: Action) => void
  /** The area the Master stands in. */
  readonly area: AdventureArea
  /** The area's Hint once earned, else null. */
  readonly hint: string | null
  /** The ending, once the ending act is satisfied. */
  readonly ending: Ending | null
  /** Every rung of the act ladder, in order (Phase 10c). */
  readonly acts: readonly AdventureAct[]
  /** The act the Master is on, or null before any is satisfied. */
  readonly act: AdventureAct | null
  /** The act to announce now, or null when there is nothing new to say. */
  readonly announce: AdventureAct | null
  /** The pacing override to show beside the result, or null. */
  readonly momentum: { readonly face: number; readonly was: string } | null
  /** The menu the cave allows here. */
  readonly options: readonly BeatOption[]
  readonly onPick: (option: BeatOption) => void
  /** The last result, mapped for display, or null. */
  readonly result: ShownResult | null
  /** The deeds count, already worded. */
  readonly deeds: string
  /** What the open roll card is for, or null when no card is up. */
  readonly card: RollCardReason | null
}

export const SheetBeat = ({
  state,
  dispatch,
  area,
  hint,
  ending,
  acts,
  act,
  announce,
  momentum,
  options,
  onPick,
  result,
  deeds,
  card,
}: SheetBeatProps) => (
  <View style={styles.screen} testID="beat">
    {/*
      The outline the book asks a player to draw as they go (MH p.85).
      It sits above the page rather than in it so it never scrolls away:
      "which act am I in" is a question with a permanent answer.
    */}
    <View style={styles.outline}>
      <ActMark acts={acts} current={act?.act ?? 0} />
    </View>

    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
      {ending === null ? null : <EndingSlip ending={ending} master={state.sheet.name} />}
      {announce === null ? null : (
        <ActSlip
          act={announce}
          of={acts.length}
          master={state.sheet.name}
          onSeen={() => dispatch({ type: 'act.seen' })}
        />
      )}
      {momentum === null ? null : <MomentumSlip face={momentum.face} was={momentum.was} />}
      <AreaSlip area={area} hint={hint} master={state.sheet.name} />
    </ScrollView>

    <View style={styles.sheet}>
      {result === null || card !== null ? null : <ResultSlip result={result} style={styles.overlay} />}
      <ScrollView style={styles.menu} contentContainerStyle={styles.menuContent}>
        <MenuList options={options} onPick={onPick} />
      </ScrollView>
      <BeatFoot state={state} dispatch={dispatch} deeds={deeds} style={styles.foot} />
    </View>

    {state.roll === null || card === null ? null : (
      <RollCard state={state} card={state.roll} reason={card} result={result} dispatch={dispatch} />
    )}
  </View>
)

const styles = StyleSheet.create({
  screen: { flex: 1 },
  /** The act outline: a thin strip over the page, always visible. */
  outline: { paddingTop: 2, paddingBottom: 4, paddingHorizontal: 14, alignItems: 'flex-start' },
  /** The upper page: the book's text and nothing else. */
  page: { flex: 1 },
  pageContent: { paddingBottom: 10 },
  /**
   * The sheet. `flexShrink: 0` is the whole mechanism - the page above
   * gives way, the sheet never does, so the menu keeps its place on a
   * long text and on a short one alike.
   */
  sheet: {
    flexShrink: 0,
    borderTopWidth: 3,
    borderTopColor: color.ink,
    backgroundColor: color.paper,
    paddingTop: 4,
  },
  /** The result sits over the sheet's first rows rather than moving them. */
  overlay: { marginTop: 4, marginBottom: 2 },
  menu: { maxHeight: 190 },
  menuContent: { paddingVertical: 6 },
  foot: { paddingTop: 4 },
})
