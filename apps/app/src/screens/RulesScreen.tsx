/**
 * The rules panel: every behaviour the engine exports, its label and its
 * citation, filterable by label; one opened to show what it does and
 * where it comes from (spec.md, Horizon; design prototype, "RULES PANEL").
 * The list is the engine's registry itself, so nothing can be shown that
 * the label leg has not checked.
 */
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { LABELS, behaviours, isLabelled } from '@martial-havoc/engine'
import type { Label } from '@martial-havoc/engine'
import { behaviourNoteFor, t } from '@martial-havoc/content'
import { fill } from '../lib/fill'
import type { Action, Filter, RecordState } from '../state/types'
import { color, font } from '../theme/tokens'
import { Button } from '../components/Button'
import { Pill } from '../components/Pill'
import { Slip } from '../components/Slip'

type Props = { readonly state: RecordState; readonly dispatch: (a: Action) => void }

const Field = ({ head, text }: { head: string; text: string }) => (
  <View style={styles.field}>
    <Text style={styles.fieldHead}>{head}</Text>
    <Text style={styles.fieldText}>{text}</Text>
  </View>
)

export const RulesScreen = ({ state, dispatch }: Props) => {
  const count = (label: Filter): number =>
    label === 'all' ? behaviours.length : behaviours.filter((b) => b.label === label).length
  const shown = behaviours.filter((b) => state.filter === 'all' || b.label === state.filter)
  const unlabelled = behaviours.filter((b) => !isLabelled(b)).length
  const chips: readonly Filter[] = ['all', ...LABELS]
  return (
    <View style={styles.screen}>
      <Slip style={styles.head}>
        <Text style={styles.title}>{t('ui.rules.title')}</Text>
        <Text style={styles.lead}>{t('ui.rules.lead')}</Text>
      </Slip>
      <View style={styles.chips}>
        {chips.map((f) => {
          const on = state.filter === f
          return (
            <Text
              key={f}
              accessibilityRole="button"
              testID={`chip-${f}`}
              onPress={() => dispatch({ type: 'rules.filter', filter: f })}
              style={[styles.chip, on && styles.chipOn]}
            >
              {t(`ui.rules.chip.${f}`)} {count(f)}
            </Text>
          )
        })}
      </View>
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {shown.map((b) => {
          const note = behaviourNoteFor(b.id)
          const open = state.openId === b.id
          return (
            <Slip key={b.id} testID={`behaviour-${b.id}`}>
              <Pressable
                accessibilityRole="button"
                onPress={() => dispatch({ type: 'rules.open', id: b.id })}
                style={styles.row}
              >
                <View style={styles.ids}>
                  <Text style={styles.id}>{b.id}</Text>
                  <Text style={styles.cite}>{b.cite}</Text>
                </View>
                <Pill label={b.label as Label} />
              </Pressable>
              {open ? (
                <View style={styles.detail}>
                  <Text style={styles.text}>{note?.text ?? t('ui.rules.no-note')}</Text>
                  <View style={styles.grid}>
                    <Field head={t('ui.rules.says')} text={note?.says ?? t('ui.rules.says.default')} />
                    <Field head={t('ui.rules.silent')} text={note?.silent ?? t('ui.rules.silent.default')} />
                    <Field head={t('ui.rules.source')} text={note?.source ?? b.cite} />
                    <Field head={t('ui.rules.reversed')} text={note?.reversed ?? t('ui.rules.reversed.default')} />
                  </View>
                </View>
              ) : null}
            </Slip>
          )
        })}
      </ScrollView>
      <View style={styles.foot}>
        <Text style={styles.footer}>{fill(t('ui.rules.footer'), { n: behaviours.length, u: unlabelled })}</Text>
        <Button primary small text={t('ui.nav.back')} onPress={() => dispatch({ type: 'nav', screen: 'beat' })} style={styles.back} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  head: { marginTop: 10, marginHorizontal: 14, padding: 10 },
  title: { fontFamily: font.sans, fontSize: 19, fontWeight: '800', letterSpacing: 0.4, lineHeight: 21, color: color.ink },
  lead: { fontFamily: font.serif, fontSize: 14, lineHeight: 20, marginTop: 5, color: color.ink },
  chips: { flexDirection: 'row', gap: 6, marginTop: 8, marginHorizontal: 14 },
  chip: { flex: 1, textAlign: 'center', paddingVertical: 6, borderWidth: 3, borderColor: color.ink, backgroundColor: color.paper, color: color.ink, fontFamily: font.sans, fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  chipOn: { backgroundColor: color.ink, color: color.paper },
  list: { flex: 1, marginTop: 8 },
  listContent: { paddingHorizontal: 14, gap: 7 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, paddingVertical: 7, paddingHorizontal: 9 },
  ids: { flexShrink: 1 },
  id: { fontFamily: font.mono, fontSize: 12, color: color.ink },
  cite: { fontFamily: font.mono, fontSize: 10, marginTop: 2, color: color.ink },
  detail: { borderTopWidth: 2, borderTopColor: color.ink, padding: 9 },
  text: { fontFamily: font.serif, fontSize: 15, lineHeight: 22, color: color.ink },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 9, paddingTop: 8, borderTopWidth: 2, borderTopColor: color.ink, rowGap: 7 },
  field: { width: '50%', paddingRight: 9 },
  fieldHead: { fontFamily: font.sans, fontSize: 9, fontWeight: '800', letterSpacing: 0.9, color: color.ink },
  fieldText: { fontFamily: font.mono, fontSize: 11, lineHeight: 15, marginTop: 2, color: color.ink },
  foot: { paddingTop: 9, paddingHorizontal: 14, paddingBottom: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  footer: { flexShrink: 1, fontFamily: font.mono, fontSize: 10, color: color.dim },
  back: { paddingVertical: 9, paddingHorizontal: 13 },
})
