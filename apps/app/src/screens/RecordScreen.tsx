/**
 * The campaign record (spec.md, Horizon: "one campaign record"; Phase 6).
 *
 * What the app has actually kept: the Master, the deeds, the passages
 * the player wrote, the treasures held, and the override count — the
 * number of rolls typed rather than rolled, which `spec.md` names as
 * the evidence that a playthrough was really played.
 *
 * Export and import are the same record through Phase 6's engine
 * functions. Import **migrates rather than refuses**: an older file is
 * carried forward, and every rejection the engine can return has its
 * own worded line, because "import failed" tells a player nothing they
 * can act on.
 */
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { exportCampaign, toJson } from '@martial-havoc/engine'
import { t } from '@martial-havoc/content'
import { fill } from '../lib/fill'
import { toCampaign } from '../state/campaign'
import { treasureName } from '../state/menu'
import type { Action, RecordState } from '../state/types'
import { color, font } from '../theme/tokens'
import { Button } from '../components/Button'
import { Slip } from '../components/Slip'

type Props = {
  readonly state: RecordState
  readonly dispatch: (a: Action) => void
  /** Passed in rather than read here: a component reads no clock. */
  readonly at: string
}

/** A titled block of lines, or its empty state. */
const Section = ({
  title,
  empty,
  lines,
  testID,
}: {
  readonly title: string
  readonly empty: string
  readonly lines: readonly string[]
  readonly testID?: string
}) => (
  <Slip style={styles.slip} testID={testID}>
    <View style={styles.head}>
      <Text style={styles.title}>{title}</Text>
    </View>
    <View style={styles.body}>
      {lines.length === 0 ? (
        <Text style={styles.empty}>{empty}</Text>
      ) : (
        lines.map((line, i) => (
          <Text key={`${i}-${line}`} style={styles.line}>
            {line}
          </Text>
        ))
      )}
    </View>
  </Slip>
)

export const RecordScreen = ({ state, dispatch, at }: Props) => {
  const json = toJson(exportCampaign(toCampaign(state), at))
  return (
    <View style={styles.screen} testID="record">
      <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
        <Slip style={styles.slip} testID="record-master">
          <View style={styles.head}>
            <Text style={styles.title}>{t('ui.record.master.title')}</Text>
          </View>
          <View style={styles.body}>
            <Text style={styles.name}>{state.sheet.name}</Text>
            <Text testID="record-counts" style={styles.counts}>
              {fill(t('ui.record.counts'), {
                deeds: state.deeds.length,
                passages: state.passages.length,
                overrides: state.overrides,
              })}
            </Text>
            <Text style={styles.note}>{t('ui.record.overrides.note')}</Text>
          </View>
        </Slip>

        <Section
          testID="record-deeds"
          title={t('ui.record.deeds.title')}
          empty={t('ui.record.deeds.empty')}
          lines={state.deeds}
        />
        <Section
          testID="record-passages"
          title={t('ui.record.passages.title')}
          empty={t('ui.record.passages.empty')}
          lines={state.passages}
        />
        <Section
          testID="record-treasures"
          title={t('ui.record.treasures.title')}
          empty={t('ui.record.treasures.empty')}
          lines={state.cave.treasures.map(treasureName)}
        />

        <Slip style={styles.slip} testID="record-export">
          <View style={styles.head}>
            <Text style={styles.title}>{t('ui.record.export.title')}</Text>
          </View>
          <View style={styles.body}>
            <Text style={styles.note}>{t('ui.record.export.note')}</Text>
            <TextInput
              testID="record-json"
              style={styles.json}
              value={json}
              editable={false}
              multiline
            />
          </View>
        </Slip>

        <Slip dashed style={styles.slip} testID="record-import">
          <View style={styles.head}>
            <Text style={styles.title}>{t('ui.record.import.title')}</Text>
          </View>
          <View style={styles.body}>
            <Text style={styles.note}>{t('ui.record.import.note')}</Text>
            <TextInput
              testID="record-paste"
              style={styles.paste}
              value={state.importDraft}
              placeholder={t('ui.record.import.placeholder')}
              placeholderTextColor={color.dim}
              onChangeText={(text) => dispatch({ type: 'record.draft', text })}
              multiline
            />
            <Button
              testID="record-read"
              primary
              text={t('ui.record.import.do')}
              disabled={state.importDraft.trim() === ''}
              onPress={() => dispatch({ type: 'record.import' })}
            />
            {state.importNote === null ? null : (
              <Text testID="record-import-note" style={styles.importNote}>
                {state.importNote}
              </Text>
            )}
          </View>
        </Slip>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  page: { flex: 1 },
  pageContent: { paddingBottom: 14 },
  slip: { marginTop: 10, marginHorizontal: 14 },
  head: { paddingVertical: 6, paddingHorizontal: 9, backgroundColor: color.ink },
  title: { fontFamily: font.sans, fontSize: 11, fontWeight: '800', letterSpacing: 0.9, color: color.paper },
  body: { padding: 9, gap: 6 },
  name: { fontFamily: font.sans, fontSize: 16, fontWeight: '800', letterSpacing: 0.4, color: color.ink },
  counts: { fontFamily: font.mono, fontSize: 11, color: color.ink },
  note: { fontFamily: font.mono, fontSize: 10, lineHeight: 14, color: color.dim },
  line: { fontFamily: font.serif, fontSize: 14, lineHeight: 19, color: color.ink },
  empty: { fontFamily: font.serif, fontSize: 14, fontStyle: 'italic', color: color.dim },
  json: {
    borderWidth: 2,
    borderColor: color.ink,
    padding: 7,
    height: 110,
    fontFamily: font.mono,
    fontSize: 9,
    color: color.dim,
  },
  paste: {
    borderWidth: 2,
    borderColor: color.ink,
    padding: 7,
    height: 70,
    fontFamily: font.mono,
    fontSize: 10,
    color: color.ink,
  },
  importNote: { fontFamily: font.mono, fontSize: 11, color: color.vermilion },
})
