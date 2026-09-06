/**
 * Candidate B — **Sheet**. Thumb-first.
 *
 * The authored line scrolls alone in the upper page. The menu is a
 * fixed sheet across the bottom, above the roll bar, so every button
 * the player can press sits in the bottom third of a 390x844 phone —
 * the part a thumb reaches without regripping. When a result lands it
 * overlays the top of the sheet rather than pushing anything down, so
 * the menu never moves under the finger between one tap and the next.
 *
 * The bet: this is a game played one-handed, in a chair, for an hour
 * at a time. Nothing pressable should ever scroll away.
 *
 * The cost: the line gets less room than in Scroll, and a landed
 * result covers the first row or two of the menu until it is read.
 */
import { ScrollView, StyleSheet, View } from 'react-native'
import { BeatFoot, LineSlip, MenuList, ResultSlip } from '../components/beat/pieces'
import { color } from '../theme/tokens'
import type { LayoutProps } from './types'

export const SheetLayout = ({
  state,
  dispatch,
  line,
  options,
  result,
  primaryText,
  primaryDisabled,
  deeds,
}: LayoutProps) => (
  <View style={styles.screen} testID="layout-b">
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
      <LineSlip line={line} />
    </ScrollView>

    <View style={styles.sheet}>
      {result === null ? null : <ResultSlip result={result} style={styles.overlay} />}
      <ScrollView style={styles.menu} contentContainerStyle={styles.menuContent}>
        <MenuList options={options} onPick={(id) => dispatch({ type: 'option', id })} />
      </ScrollView>
      <BeatFoot
        state={state}
        dispatch={dispatch}
        primaryText={primaryText}
        primaryDisabled={primaryDisabled}
        deeds={deeds}
        style={styles.foot}
      />
    </View>
  </View>
)

const styles = StyleSheet.create({
  screen: { flex: 1 },
  /** The upper page: the line and nothing else. */
  page: { flex: 1 },
  pageContent: { paddingBottom: 10 },
  /**
   * The sheet. `flexShrink: 0` is the whole mechanism — the page above
   * gives way, the sheet never does, so the menu keeps its place on a
   * long line and on a short one alike.
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
