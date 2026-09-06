/**
 * The beat, in pieces.
 *
 * Phase 8a rendered three candidate layouts of the same beat, so every
 * part of it had to be a component no layout owned. The operator picked
 * the Sheet arrangement and the other two are gone, but the split
 * stays: `SheetBeat` places these, and the next surface to grow a beat
 * reuses them rather than re-deriving them.
 *
 * Phase 8c made the beat the book's: the area slip prints the area's
 * description, its Encounters line and, once earned, its Hint, all
 * verbatim (5T a1); the menu is derived from the adventure graph.
 *
 * Each piece takes what it draws and a callback, never the reducer's
 * `dispatch` in full: a piece that cannot dispatch an arbitrary action
 * cannot grow a behaviour behind a layout's back.
 */
import { StyleSheet, Text, View } from 'react-native'
import { t } from '@martial-havoc/content'
import type { AdventureArea } from '@martial-havoc/content'
import type { Ending } from '@martial-havoc/engine'
import { fill } from '../../lib/fill'
import { color, font } from '../../theme/tokens'
import { Die } from '../Die'
import { FreeText } from '../FreeText'
import { MenuButton } from '../MenuButton'
import { Pill } from '../Pill'
import { RollBar } from '../RollBar'
import { Slip } from '../Slip'
import type { ShownResult } from './shown'
import type { BeatOption } from '../../state/menu'
import type { Action, RecordState } from '../../state/types'

/**
 * The area the Master is standing in, as the book prints it: the
 * description, the Encounters line, and the Hint once it is earned
 * (I-60). Nothing on this slip is ours but the two headings.
 */
export const AreaSlip = ({
  area,
  hint,
  style,
}: {
  readonly area: AdventureArea
  /** The Hint, or null while it is still hidden. */
  readonly hint: string | null
  readonly style?: object
}) => (
  <Slip style={[styles.lineSlip, style]}>
    <Text testID="authored-line" style={styles.line}>
      {area.description}
    </Text>
    <Text testID="encounters-line" style={styles.encounters}>
      {t('ui.cave.encounters.heading')} {t(`ui.cave.encounters.${area.area}`)}
    </Text>
    {hint === null ? null : (
      <View style={styles.hint} testID="hint">
        <Text style={styles.hintHeading}>{t('ui.cave.hint.heading')}</Text>
        <Text style={styles.hintText}>{hint}</Text>
      </View>
    )}
  </Slip>
)

/** The ending screen, when the ending act is satisfied (Phase 5's acts; ours). */
export const EndingSlip = ({ ending, style }: { readonly ending: Ending; readonly style?: object }) => (
  <Slip dashed style={[styles.lineSlip, style]} testID="ending">
    <View style={styles.resultHead}>
      <Text style={styles.resultTitle}>{t('ui.cave.ending.title')}</Text>
      <Pill label="invention" text={ending.act.cite} />
    </View>
    <Text style={[styles.line, styles.endingLine]}>{ending.line}</Text>
    <Text style={styles.encounters}>
      {fill(t('ui.cave.ending.line'), {
        n: ending.treasures.length,
        d: ending.defeated.length,
        dishonor: ending.dishonor,
      })}
    </Text>
  </Slip>
)

/** The last result: its label pill, its dice, its number and its citation. */
export const ResultSlip = ({
  result,
  style,
}: {
  readonly result: ShownResult
  readonly style?: object
}) => (
  <Slip style={[styles.resultSlip, style]} testID="result">
    <View style={styles.resultHead}>
      <Text style={styles.resultTitle}>{result.title}</Text>
      <Pill label={result.label} text={result.pill} />
    </View>
    <View style={styles.resultBody}>
      {result.a === null ? null : <Die face={result.a} testID="die-result-a" />}
      {result.b === null ? null : <Die face={result.b} testID="die-result-b" />}
      <View style={styles.resultNumbers}>
        <Text
          testID="result-total"
          style={[styles.total, result.total.length > 4 && styles.totalText]}
        >
          {result.total}
        </Text>
        {result.against.length === 0 ? null : <Text style={styles.against}>{result.against}</Text>}
      </View>
    </View>
    <Text style={styles.cite}>{result.cite}</Text>
  </Slip>
)

/** The empty state: a beat the rules allow nothing at. */
export const NoOptions = () => (
  <Slip dashed style={styles.empty}>
    <Text style={styles.emptyTitle}>{t('ui.empty.title')}</Text>
    <Text style={styles.emptyLine}>{t('ui.empty.line')}</Text>
  </Slip>
)

/** The menu the cave allows here. */
export const MenuList = ({
  options,
  onPick,
}: {
  readonly options: readonly BeatOption[]
  readonly onPick: (option: BeatOption) => void
}) => (
  <View style={styles.menuColumn}>
    {options.map((o) => (
      <MenuButton
        key={o.id}
        testID={o.id}
        title={o.title}
        note={o.note}
        line={o.line}
        enabled={o.enabled}
        onPress={() => onPick(o)}
      />
    ))}
    {options.length === 0 ? <NoOptions /> : null}
  </View>
)

/**
 * The foot every layout carries: the passage field (always present,
 * `spec.md`) and the roll bar. The beat's one roll is the Event on
 * entering an area, made by tapping the exit, so the bar holds MY DICE
 * alone: on, the next move's die is entered by hand on the roll card.
 */
export const BeatFoot = ({
  state,
  dispatch,
  deeds,
  style,
}: {
  readonly state: RecordState
  readonly dispatch: (a: Action) => void
  readonly deeds: string
  readonly style?: object
}) => (
  <View style={[styles.foot, style]}>
    <FreeText
      draft={state.draft}
      written={state.passages.length}
      onDraft={(text) => dispatch({ type: 'draft', text })}
      onKeep={() => dispatch({ type: 'passage.keep' })}
    />
    <RollBar
      onManual={() => dispatch({ type: 'roll.manual' })}
      manualOn={state.byHand}
      overrides={state.overrides}
      right={deeds}
    />
  </View>
)

const styles = StyleSheet.create({
  lineSlip: { marginTop: 10, marginHorizontal: 14, padding: 11 },
  line: { fontFamily: font.serif, fontSize: 17, lineHeight: 25, color: color.ink },
  encounters: { marginTop: 8, fontFamily: font.mono, fontSize: 10, lineHeight: 15, color: color.ink },
  hint: { marginTop: 8, borderTopWidth: 2, borderTopColor: color.ink, paddingTop: 6 },
  hintHeading: { fontFamily: font.mono, fontSize: 9, letterSpacing: 0.6, color: color.dim },
  hintText: { marginTop: 3, fontFamily: font.serif, fontSize: 15, lineHeight: 21, fontStyle: 'italic', color: color.dim },
  endingLine: { marginTop: 8 },
  resultSlip: { marginTop: 10, marginHorizontal: 14 },
  resultHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 9,
    backgroundColor: color.ink,
  },
  resultTitle: {
    flexShrink: 1,
    fontFamily: font.sans,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.9,
    color: color.paper,
  },
  resultBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 10,
    paddingHorizontal: 9,
  },
  resultNumbers: { marginLeft: 'auto', alignItems: 'flex-end', flexShrink: 1 },
  total: { fontFamily: font.sans, fontSize: 34, fontWeight: '800', lineHeight: 36, color: color.ink },
  totalText: { fontSize: 16, lineHeight: 20, textAlign: 'right' },
  against: { fontFamily: font.mono, fontSize: 10, color: color.ink, textAlign: 'right' },
  cite: {
    borderTopWidth: 2,
    borderTopColor: color.ink,
    paddingVertical: 6,
    paddingHorizontal: 9,
    fontFamily: font.mono,
    fontSize: 10,
    lineHeight: 15,
    color: color.ink,
  },
  menuColumn: { paddingHorizontal: 14, gap: 7 },
  empty: { padding: 16, alignItems: 'center' },
  emptyTitle: {
    fontFamily: font.sans,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: color.ink,
  },
  emptyLine: { fontFamily: font.serif, fontSize: 15, fontStyle: 'italic', marginTop: 4, color: color.ink },
  foot: { paddingTop: 10, paddingHorizontal: 14, paddingBottom: 14 },
})
