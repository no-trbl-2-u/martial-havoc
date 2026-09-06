/**
 * Candidate A — **Scroll**. Read-first.
 *
 * The Phase 5 prototype's arrangement, entered as a candidate rather
 * than assumed: the authored line at the top with as much room as it
 * wants, the result under it, the menu scrolling beneath, and the
 * roll bar at the foot.
 *
 * The bet: the authored line is the point of a solo RPG, and the
 * player reads before they act.
 *
 * The cost: on a long line the menu falls below the fold, and the
 * primary action is a thumb-stretch from where the eye starts.
 */
import { ScrollView, StyleSheet, View } from 'react-native'
import { BeatFoot, LineSlip, MenuList, ResultSlip } from '../components/beat/pieces'
import type { LayoutProps } from './types'

export const ScrollLayout = ({
  state,
  dispatch,
  line,
  options,
  result,
  primaryText,
  primaryDisabled,
  deeds,
}: LayoutProps) => (
  <View style={styles.screen} testID="layout-a">
    <LineSlip line={line} />
    {result === null ? null : <ResultSlip result={result} />}
    <ScrollView style={styles.menu} contentContainerStyle={styles.menuContent}>
      <MenuList options={options} onPick={(id) => dispatch({ type: 'option', id })} />
    </ScrollView>
    <BeatFoot
      state={state}
      dispatch={dispatch}
      primaryText={primaryText}
      primaryDisabled={primaryDisabled}
      deeds={deeds}
    />
  </View>
)

const styles = StyleSheet.create({
  screen: { flex: 1 },
  menu: { flex: 1, marginTop: 10 },
  menuContent: { paddingBottom: 4 },
})
