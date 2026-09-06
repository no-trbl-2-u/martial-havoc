/**
 * Candidate C — **Ledger**. Record-first.
 *
 * The beat is a transcript. The authored line sits at the top, clamped
 * so it cannot push anything off; the current result keeps its full
 * slip — both dice, the label pill and the citation, which `spec.md`
 * requires on screen and no arrangement may drop — and beneath it the
 * deeds already done here run as ledger rows, newest last. The menu is
 * a compact two-column grid directly above the roll bar.
 *
 * The bet: `spec.md` asks for one campaign record, and a solo player
 * spends as much time reading back what happened as choosing what
 * happens next. Making the screen *be* the record — the same deed
 * strings the save keeps — means the last four rolls are visible
 * without leaving the beat.
 *
 * The cost: it is the densest of the three. The transcript competes
 * with the result slip for the middle of the page, and two-column menu
 * rows drop each option's explanatory note and truncate longer titles.
 */
import { ScrollView, StyleSheet, View } from 'react-native'
import { BeatFoot, Ledger, LineSlip, MenuList, ResultSlip } from '../components/beat/pieces'
import type { LayoutProps } from './types'

export const LedgerLayout = ({
  state,
  dispatch,
  line,
  options,
  result,
  primaryText,
  primaryDisabled,
  deeds,
}: LayoutProps) => (
  <View style={styles.screen} testID="layout-c">
    {/* Clamped: in a transcript the line is the heading, not the page. */}
    <LineSlip line={line} numberOfLines={4} />
    {result === null ? null : <ResultSlip result={result} />}
    <ScrollView style={styles.roll} contentContainerStyle={styles.rollContent}>
      {/* The history only; the current result has its own slip above. */}
      <Ledger deeds={state.deeds} current={null} />
    </ScrollView>
    <View style={styles.menu}>
      <MenuList options={options} onPick={(id) => dispatch({ type: 'option', id })} compact />
    </View>
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
  roll: { flex: 1 },
  rollContent: { paddingBottom: 6 },
  menu: { paddingTop: 4 },
})
