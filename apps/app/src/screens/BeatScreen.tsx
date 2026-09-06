/**
 * The beat: the authored line, the last result with both dice and its
 * label, the menu of what the rules allow here, the passage field and
 * the roll bar (spec.md, Horizon; design prototype, "BEAT").
 */
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { beatForArea, optionsForArea, t } from '@martial-havoc/content'
import type { Label } from '@martial-havoc/engine'
import { fill } from '../lib/fill'
import { citeOf } from '../state/reduce'
import type { Action, RecordState, Result } from '../state/types'
import { color, font } from '../theme/tokens'
import { Die } from '../components/Die'
import { FreeText } from '../components/FreeText'
import { ManualDice } from '../components/ManualDice'
import { MenuButton } from '../components/MenuButton'
import { Pill } from '../components/Pill'
import { RollBar } from '../components/RollBar'
import { Slip } from '../components/Slip'

type Props = { readonly state: RecordState; readonly dispatch: (a: Action) => void }

/** What the result slip prints for each kind of result. */
const shown = (
  r: Result,
  sheet: RecordState['sheet'],
): { title: string; label: Label; pill: string; a: 1 | 2 | 3 | 4 | 5 | 6 | null; b: 1 | 2 | 3 | 4 | 5 | 6 | null; total: string; against: string; cite: string } => {
  switch (r.kind) {
    case 'check': {
      const id = r.check === 'skill' ? 'checks.skill-check' : 'checks.luck-check'
      const cite = citeOf(id)
      return {
        title: t(`ui.result.${r.check}.${r.success ? 'passed' : 'failed'}`),
        label: r.doubleSix ? 'invention' : 'rule',
        pill: r.doubleSix ? citeOf('checks.double-six-fails-every-check') : cite,
        a: r.roll.a,
        b: r.roll.b,
        total: String(r.roll.total),
        against:
          r.check === 'luck'
            ? fill(t('ui.result.against.luck'), { luck: r.threshold, after: r.luckAfter ?? '' })
            : r.proficiency === null
              ? fill(t('ui.result.against.skill.bare'), { skill: sheet.skill })
              : fill(t('ui.result.against.skill'), { skill: sheet.skill, value: r.proficiency.value, name: r.proficiency.name.toUpperCase() }),
        cite: r.doubleSix
          ? fill(t('ui.result.cite.double-six'), { cite })
          : fill(t('ui.result.cite.check'), { cite, total: r.roll.total, op: r.success ? '<=' : '>', threshold: r.threshold }),
      }
    }
    case 'rest':
      return {
        title: t('ui.result.rest.title'),
        label: 'invention',
        pill: citeOf('healing.nights-rest-heals-four-endurance'),
        a: null, b: null,
        total: `+${r.after - r.before}`,
        against: fill(t('ui.result.rest.against'), { before: r.before, after: r.after }),
        cite: t('ui.result.rest.cite'),
      }
    case 'take':
      return {
        title: t('ui.result.take.title'),
        label: 'reading',
        pill: 'I-38',
        a: null, b: null,
        total: t(`ui.treasure.${r.treasure}`),
        against: fill(t('ui.result.take.against'), { n: r.held }),
        cite: t('ui.result.take.cite'),
      }
    case 'treasure':
      return {
        title: fill(t('ui.result.treasure.title'), { face: r.face }),
        label: 'rule',
        pill: citeOf('progression.treasure-band-by-endurance'),
        a: r.face, b: null,
        total: r.text,
        against: fill(t('ui.result.treasure.against'), { band: r.band }),
        cite: t('ui.result.treasure.cite'),
      }
  }
}

export const BeatScreen = ({ state, dispatch }: Props) => {
  const beat = beatForArea(state.area)
  const options = optionsForArea(state.area)
  const result = state.result === null ? null : shown(state.result, state.sheet)
  const hasCheck = options.some((o) => o.action === 'skill-check' || o.action === 'luck-check')
  return (
    <View style={styles.screen}>
      <Slip style={styles.lineSlip}>
        <Text testID="authored-line" style={styles.line}>{beat?.line ?? t('ui.empty.line')}</Text>
      </Slip>

      {result === null ? null : (
        <Slip style={styles.resultSlip} testID="result">
          <View style={styles.resultHead}>
            <Text style={styles.resultTitle}>{result.title}</Text>
            <Pill label={result.label} text={result.pill} />
          </View>
          <View style={styles.resultBody}>
            {result.a === null ? null : <Die face={result.a} testID="die-result-a" />}
            {result.b === null ? null : <Die face={result.b} testID="die-result-b" />}
            <View style={styles.resultNumbers}>
              <Text testID="result-total" style={[styles.total, result.total.length > 4 && styles.totalText]}>{result.total}</Text>
              <Text style={styles.against}>{result.against}</Text>
            </View>
          </View>
          <Text style={styles.cite}>{result.cite}</Text>
        </Slip>
      )}

      <ScrollView style={styles.menu} contentContainerStyle={styles.menuContent}>
        {options.map((o) => (
          <MenuButton
            key={o.id}
            testID={o.id}
            title={o.title}
            note={o.note}
            line={o.line}
            onPress={() => dispatch({ type: 'option', id: o.id })}
          />
        ))}
        {options.length === 0 ? (
          <Slip dashed style={styles.empty}>
            <Text style={styles.emptyTitle}>{t('ui.empty.title')}</Text>
            <Text style={styles.emptyLine}>{t('ui.empty.line')}</Text>
          </Slip>
        ) : null}
      </ScrollView>

      <View style={styles.foot}>
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
          primaryText={state.manual.length === 2 ? t('ui.roll.manual') : t('ui.roll.primary')}
          onPrimary={() => dispatch({ type: 'roll' })}
          primaryDisabled={!hasCheck}
          onManual={() => dispatch({ type: 'manual.toggle' })}
          overrides={state.overrides}
          right={fill(t('ui.deeds'), { n: state.deeds.length })}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  lineSlip: { marginTop: 10, marginHorizontal: 14, padding: 11 },
  line: { fontFamily: font.serif, fontSize: 17, lineHeight: 25, color: color.ink },
  resultSlip: { marginTop: 10, marginHorizontal: 14 },
  resultHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, paddingVertical: 6, paddingHorizontal: 9, backgroundColor: color.ink },
  resultTitle: { flexShrink: 1, fontFamily: font.sans, fontSize: 11, fontWeight: '800', letterSpacing: 0.9, color: color.paper },
  resultBody: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 10, paddingHorizontal: 9 },
  resultNumbers: { marginLeft: 'auto', alignItems: 'flex-end', flexShrink: 1 },
  total: { fontFamily: font.sans, fontSize: 34, fontWeight: '800', lineHeight: 36, color: color.ink },
  totalText: { fontSize: 16, lineHeight: 20, textAlign: 'right' },
  against: { fontFamily: font.mono, fontSize: 10, color: color.ink, textAlign: 'right' },
  cite: { borderTopWidth: 2, borderTopColor: color.ink, paddingVertical: 6, paddingHorizontal: 9, fontFamily: font.mono, fontSize: 10, lineHeight: 15, color: color.ink },
  menu: { flex: 1, marginTop: 10 },
  menuContent: { paddingHorizontal: 14, gap: 7 },
  empty: { padding: 16, alignItems: 'center' },
  emptyTitle: { fontFamily: font.sans, fontSize: 14, fontWeight: '800', letterSpacing: 0.6, color: color.ink },
  emptyLine: { fontFamily: font.serif, fontSize: 15, fontStyle: 'italic', marginTop: 4, color: color.ink },
  foot: { paddingTop: 10, paddingHorizontal: 14, paddingBottom: 14 },
  manual: { marginTop: 8 },
})
