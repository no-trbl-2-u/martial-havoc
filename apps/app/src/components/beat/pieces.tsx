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
 * description and, once earned, its Hint, verbatim (5T a1); the menu is
 * derived from the adventure graph. The 2026-09-06 pass put the area's
 * name over its text, folded the Encounters line and every citation
 * behind a tap (`../Source`), and gave the book's opening paragraph a
 * slip of its own on the first beat, so a player knows where they are
 * and why before the first roll.
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
import { Narrator } from '../Narrator'
import { Slip } from '../Slip'
import { Source } from '../Source'
import type { ShownResult } from './shown'
import type { BeatOption } from '../../state/menu'
import type { Action, RecordState } from '../../state/types'

/**
 * The book's opening, on the first beat: the title block and the
 * premise paragraph as page a1 prints them (5T a1). Shown until the
 * Master has done or seen anything; after that it lives under ABOUT.
 */
export const PremiseSlip = ({ premise, style }: { readonly premise: string; readonly style?: object }) => (
  <Slip style={[styles.lineSlip, style]} testID="premise">
    <Text style={styles.premiseTitle}>{t('ui.intro.title')}</Text>
    <Text style={styles.premiseSub}>{t('ui.intro.subtitle')}</Text>
    <Text style={styles.line}>{premise}</Text>
  </Slip>
)

/**
 * The area the Master is standing in: its printed name over its printed
 * description, the narrator's line under it, and the Hint once it is
 * earned (I-60). The Encounters line is the book's table for the Event
 * roll, not a thing the player needs in front of them; it is folded
 * with the folio behind SOURCE.
 *
 * Phase 10a hung the area's own `line` here. It has been in
 * `areas.json` since Phase 8 and was never rendered, which is exactly
 * the gap the phase was written to close: the book describes the room,
 * and Old Ping says what it is like to stand in it. The description
 * stays upright and his line goes italic under a dashed rule, so the
 * two are told apart without reading either (`plan/VOICE.md`).
 *
 * The `master` name is passed in rather than read from a store: this is
 * a piece, and a piece that could reach the record could grow a
 * behaviour behind a layout's back.
 */
export const AreaSlip = ({
  area,
  hint,
  master,
  style,
}: {
  readonly area: AdventureArea
  /** The Hint, or null while it is still hidden. */
  readonly hint: string | null
  /** The Master's name, filled into the area's authored line. */
  readonly master: string
  readonly style?: object
}) => (
  <Slip style={[styles.lineSlip, style]}>
    <Text style={styles.areaNumber}>{fill(t('ui.cave.area.number'), { n: area.area })}</Text>
    <Text testID="area-name" style={styles.areaName}>
      {area.name.toUpperCase()}
    </Text>
    <Text testID="area-description" style={styles.line}>
      {area.description}
    </Text>
    <Narrator testID="area-narrator" line={fill(area.line, { name: master })} />
    <View style={styles.areaFoot}>
      <Source
        key={area.id}
        testID="area-source"
        cite={`${t('ui.cave.encounters.heading')} ${t(`ui.cave.encounters.${area.area}`)} · ${t('ui.cave.cite.a1')}`}
      />
    </View>
    {hint === null ? null : (
      <View style={styles.hint} testID="hint">
        <Text style={styles.hintHeading}>{t('ui.cave.hint.heading')}</Text>
        <Text style={styles.hintText}>{hint}</Text>
      </View>
    )}
  </Slip>
)

/**
 * The ending screen, when the ending act is satisfied (Phase 5's acts; ours).
 *
 * The act's line is the narrator's, so Phase 10a fills its `{name}` the
 * way every other line of his is filled. It keeps its own place at the
 * top of the slip rather than moving under a dashed rule: the whole
 * slip is already dashed and already labelled `invention`, so a second
 * mark inside it would say the same thing twice.
 */
export const EndingSlip = ({
  ending,
  master,
  style,
}: {
  readonly ending: Ending
  /** The Master's name, filled into the ending act's line. */
  readonly master: string
  readonly style?: object
}) => (
  <Slip dashed style={[styles.lineSlip, style]} testID="ending">
    <View style={styles.resultHead}>
      <Text style={styles.resultTitle}>{t('ui.cave.ending.title')}</Text>
      <Pill label="invention" />
    </View>
    <Text style={[styles.line, styles.endingLine]}>{fill(ending.line, { name: master })}</Text>
    <Text style={styles.encounters}>
      {fill(t('ui.cave.ending.line'), {
        n: ending.treasures.length,
        d: ending.defeated.length,
        dishonor: ending.dishonor,
      })}
    </Text>
    <View style={styles.areaFoot}>
      <Source cite={ending.act.cite} />
    </View>
  </Slip>
)

/**
 * The last result: its label pill, its dice, its number, the book's
 * words for it, the narrator's line, and its folded citation.
 *
 * The order is the argument. The book's own words come first and stand
 * upright; Old Ping comes after them, italic, under his dashed rule
 * (Phase 10a); the folio comes last, folded. A reader going down the
 * slip meets the source, then the storyteller, then the receipt —
 * never the storyteller first, and never inside the book's text.
 */
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
      <Pill label={result.label} />
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
    {result.passage === null ? null : (
      <Text testID="result-passage" style={styles.passage}>
        {result.passage}
      </Text>
    )}
    {result.narrator === null ? null : (
      <Narrator testID="result-narrator" line={result.narrator} style={styles.resultNarrator} />
    )}
    <View style={styles.cite}>
      <Source testID="result-source" cite={result.cite} />
    </View>
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
  premiseTitle: { fontFamily: font.sans, fontSize: 15, fontWeight: '800', letterSpacing: 1.2, color: color.ink },
  premiseSub: { fontFamily: font.serif, fontSize: 13, fontStyle: 'italic', marginBottom: 8, color: color.dim },
  areaNumber: { fontFamily: font.mono, fontSize: 9, letterSpacing: 0.8, color: color.dim },
  areaName: { fontFamily: font.sans, fontSize: 15, fontWeight: '800', letterSpacing: 1, marginTop: 1, marginBottom: 6, color: color.ink },
  line: { fontFamily: font.serif, fontSize: 17, lineHeight: 25, color: color.ink },
  areaFoot: { marginTop: 8, flexDirection: 'row', justifyContent: 'flex-end' },
  encounters: { marginTop: 8, fontFamily: font.mono, fontSize: 10, lineHeight: 15, color: color.ink },
  hint: { marginTop: 8, borderTopWidth: 2, borderTopColor: color.ink, paddingTop: 6 },
  hintHeading: { fontFamily: font.sans, fontSize: 9, fontWeight: '800', letterSpacing: 0.8, color: color.vermilion },
  hintText: { marginTop: 3, fontFamily: font.serif, fontSize: 15, lineHeight: 21, fontStyle: 'italic', color: color.ink },
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
  /** His rule spans the slip's text column, inset like the passage above it. */
  resultNarrator: { marginHorizontal: 9, marginBottom: 8, marginTop: 0 },
  passage: {
    paddingHorizontal: 9,
    paddingBottom: 8,
    fontFamily: font.serif,
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
    color: color.ink,
  },
  cite: {
    borderTopWidth: 2,
    borderTopColor: color.ink,
    paddingVertical: 5,
    paddingHorizontal: 9,
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
