/**
 * The beat, in pieces.
 *
 * Phase 8a rendered three candidate layouts of the same beat, so every
 * part of it had to be a component no layout owned. The operator picked
 * the Sheet arrangement and the other two are gone, but the split
 * stays: `SheetBeat` places these, and the next surface to grow a beat
 * reuses them rather than re-deriving them.
 *
 * Each piece takes what it draws and a callback, never the reducer's
 * `dispatch` in full: a piece that cannot dispatch an arbitrary action
 * cannot grow a behaviour behind a layout's back.
 */
import { StyleSheet, Text, View } from 'react-native'
import { t } from '@martial-havoc/content'
import type { MenuOption } from '@martial-havoc/content'
import { color, font } from '../../theme/tokens'
import { Die } from '../Die'
import { FreeText } from '../FreeText'
import { ManualDice } from '../ManualDice'
import { MenuButton } from '../MenuButton'
import { Pill } from '../Pill'
import { RollBar } from '../RollBar'
import { Slip } from '../Slip'
import type { ShownResult } from './shown'
import type { Action, RecordState } from '../../state/types'

/** The authored line the Master is standing in. */
export const LineSlip = ({
  line,
  style,
  numberOfLines,
}: {
  readonly line: string
  readonly style?: object
  /** Layouts with a fixed upper page clamp the line rather than push the menu off. */
  readonly numberOfLines?: number
}) => (
  <Slip style={[styles.lineSlip, style]}>
    <Text
      testID="authored-line"
      style={styles.line}
      {...(numberOfLines === undefined ? {} : { numberOfLines })}
    >
      {line}
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
        <Text style={styles.against}>{result.against}</Text>
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

/** The menu the rules allow here. */
export const MenuList = ({
  options,
  onPick,
}: {
  readonly options: readonly MenuOption[]
  readonly onPick: (id: string) => void
}) => (
  <View style={styles.menuColumn}>
    {options.map((o) => (
      <MenuButton
        key={o.id}
        testID={o.id}
        title={o.title}
        note={o.note}
        line={o.line}
        onPress={() => onPick(o.id)}
      />
    ))}
    {options.length === 0 ? <NoOptions /> : null}
  </View>
)

/**
 * The foot every layout carries: the passage field (always present,
 * `spec.md`), the manual dice when open, and the roll bar.
 */
export const BeatFoot = ({
  state,
  dispatch,
  primaryText,
  primaryDisabled,
  deeds,
  style,
}: {
  readonly state: RecordState
  readonly dispatch: (a: Action) => void
  readonly primaryText: string
  readonly primaryDisabled: boolean
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
    {state.manualOpen ? (
      <View style={styles.manual}>
        <ManualDice
          manual={state.manual}
          onFace={(face) => dispatch({ type: 'manual.face', face })}
          onCancel={() => dispatch({ type: 'manual.cancel' })}
        />
      </View>
    ) : null}
    <RollBar
      primaryText={primaryText}
      onPrimary={() => dispatch({ type: 'roll' })}
      primaryDisabled={primaryDisabled}
      onManual={() => dispatch({ type: 'manual.toggle' })}
      overrides={state.overrides}
      right={deeds}
    />
  </View>
)

const styles = StyleSheet.create({
  lineSlip: { marginTop: 10, marginHorizontal: 14, padding: 11 },
  line: { fontFamily: font.serif, fontSize: 17, lineHeight: 25, color: color.ink },
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
  manual: { marginTop: 8 },
})
