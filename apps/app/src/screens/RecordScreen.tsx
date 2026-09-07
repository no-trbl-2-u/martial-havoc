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
            {/*
              Name and age: the first line of the printed sheet (MH p.5).
              A blank age is said in words rather than shown as a dash,
              because the book asks for one and a dash reads like a
              number that failed to load.
            */}
            <Text testID="record-master-name" style={styles.name}>
              {state.sheet.age === null
                ? fill(t('ui.record.master.ageless'), { name: state.sheet.name })
                : fill(t('ui.record.master.named'), { name: state.sheet.name, age: state.sheet.age })}
            </Text>
            <Text testID="record-counts" style={styles.counts}>
              {fill(t('ui.record.counts'), {
                deeds: state.deeds.length,
                passages: state.passages.length,
                overrides: state.overrides,
              })}
            </Text>
            {/* Why this Master is on the road (MH p.36-39; Phase 10j). */}
            {state.sheet.motive === null ? null : (
              <Text testID="record-motive" style={styles.motive}>
                {state.sheet.motive.text}
              </Text>
            )}
            <Text testID="record-xp" style={styles.counts}>
              {fill(t('ui.record.xp'), { n: state.sheet.xp, r: state.sheet.resources })}
            </Text>
            <Text style={styles.note}>{t('ui.record.overrides.note')}</Text>
          </View>
        </Slip>

        {/*
          The adventure so far, in order (Phase 10h). The deeds ledger
          below is the same play counted; this is it told. Each entry
          carries the room it happened in, printed as a running head so
          a reader sees where they were as well as what they did, and a
          run of entries in one room says it once.
        */}
        <Slip style={styles.slip} testID="record-chronicle">
          <View style={styles.head}>
            <Text style={styles.title}>{t('ui.record.chronicle.title')}</Text>
          </View>
          <View style={styles.body}>
            {state.chronicle.length === 0 ? (
              <Text style={styles.empty}>{t('ui.record.chronicle.empty')}</Text>
            ) : (
              state.chronicle.map((entry, i) => {
                const where = entry.area ?? t('ui.record.chronicle.nowhere')
                const before = state.chronicle[i - 1]
                const heading = before === undefined || (before.area ?? null) !== (entry.area ?? null)
                return (
                  <View key={`${String(i)}-${entry.text}`}>
                    {!heading ? null : (
                      <Text style={styles.where}>{where.toUpperCase()}</Text>
                    )}
                    <Text
                      testID={`chronicle-${String(i)}`}
                      style={entry.kind === 'passage' ? styles.passage : styles.line}
                    >
                      {entry.text}
                    </Text>
                  </View>
                )
              })
            )}
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
        {/*
          The Techniques this Master invented off landed Final Blows
          (R31; Phase 10f). Only the learned ones are listed: the
          printed ones are on the sheet, and this section exists to
          hold the things that are in no table at all.
        */}
        <Section
          testID="record-techniques"
          title={t('ui.record.techniques.title')}
          empty={t('ui.record.techniques.empty')}
          lines={state.sheet.learned.map((own) =>
            own.description === ''
              ? fill(t('ui.record.techniques.own.bare'), { name: own.name, value: own.value })
              : fill(t('ui.record.techniques.own'), {
                  name: own.name,
                  value: own.value,
                  description: own.description,
                }),
          )}
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
  /** The Master's own story, in the book's own second person. */
  motive: { fontFamily: font.serif, fontSize: 14, lineHeight: 19, fontStyle: 'italic', color: color.ink },
  note: { fontFamily: font.mono, fontSize: 10, lineHeight: 14, color: color.dim },
  line: { fontFamily: font.serif, fontSize: 14, lineHeight: 19, color: color.ink },
  /** The running head: which room the lines under it happened in. */
  where: { fontFamily: font.sans, fontSize: 9, fontWeight: '800', letterSpacing: 0.9, marginTop: 6, color: color.dim },
  /** The player's own words, set apart from the app's account of them. */
  passage: { fontFamily: font.serif, fontSize: 14, lineHeight: 19, fontStyle: 'italic', color: color.ink },
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
