/**
 * Creation: the eight printed Masters (MH p.91-92, R83), read in the
 * book's own order and started.
 *
 * The screen has two halves. The list names every sheet with the three
 * things that separate them at a glance - style, SKILL, and whether the
 * arithmetic balances - and the panel under it reads the picked sheet in
 * R01's order: status and gold (R02, R03), attributes (R04, R05), Martial
 * Art (R09), Proficiencies (R10), Techniques and Rituals (R16), and the
 * starting equipment (R02).
 *
 * Nothing on this screen refuses. A sheet that overspends its pools -
 * Yin does, on both - is flagged and started anyway (spec.md, Refusals).
 * The flag panel is the whole of the "advisory pools" rule made visible;
 * there is no path here that hides or corrects a Master.
 *
 * No copy lives in this file (agents.md rule 7): every string is a `t`
 * lookup, every number comes from the engine through `state/creation.ts`.
 */
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { t } from '@martial-havoc/content'
import { fill } from '../lib/fill'
import type { Candidate } from '../state/creation'
import type { Action, RecordState } from '../state/types'
import { color, font } from '../theme/tokens'
import { Button } from '../components/Button'
import { MenuButton } from '../components/MenuButton'
import { Slip } from '../components/Slip'

type Props = {
  readonly state: RecordState
  /** Every sheet, gold already thrown; built once per visit by the frame. */
  readonly candidates: readonly Candidate[]
  readonly dispatch: (a: Action) => void
}

/** One labelled block of the read sheet: a heading, a note, and its lines. */
const Section = ({
  heading,
  note,
  children,
}: {
  readonly heading: string
  readonly note?: string
  readonly children: React.ReactNode
}) => (
  <View style={styles.section}>
    <View style={styles.sectionHead}>
      <Text style={styles.heading}>{heading}</Text>
      {note === undefined ? null : <Text style={styles.note}>{note}</Text>}
    </View>
    {children}
  </View>
)

/** `spent of pool`, the one shape both advisory pools report in (R10, R16). */
const poolNote = ([spent, pool]: readonly [number, number]): string =>
  fill(t('ui.creation.pool'), { spent, pool })

/** The picked sheet, read in R01's order. */
const Sheet = ({ picked }: { readonly picked: Candidate }) => (
  <Slip style={styles.sheet}>
    <View style={styles.sheetHead}>
      <Text testID="creation-name" style={styles.name}>
        {picked.sheet.name.toUpperCase()}
      </Text>
      <Text style={styles.note}>{fill(t('ui.creation.age'), { n: picked.age })}</Text>
    </View>

    <Section heading={t('ui.creation.status')}>
      <Text style={styles.line}>
        {picked.status} · {t('ui.creation.gold')} {picked.sheet.gold}
      </Text>
      <Text style={styles.cite}>{t('ui.creation.gold.cite')}</Text>
    </Section>

    <Section heading={t('ui.creation.attributes')}>
      <Text testID="creation-attributes" style={styles.line}>
        {t('ui.attr.skill')} {picked.sheet.skill} · {t('ui.attr.endurance')}{' '}
        {picked.sheet.endurance} · {t('ui.attr.luck')} {picked.sheet.luck}
      </Text>
    </Section>

    <Section heading={t('ui.creation.martial-art')}>
      <Text testID="creation-martial-art" style={styles.line}>
        {picked.martialArt}
      </Text>
    </Section>

    <Section heading={t('ui.creation.proficiencies')} note={poolNote(picked.proficiencyPool)}>
      <Text style={styles.line}>
        {picked.sheet.proficiencies.map((p) => `${p.name} ${String(p.value)}`).join(' · ')}
      </Text>
    </Section>

    <Section heading={t('ui.creation.learned')} note={poolNote(picked.resourcePool)}>
      <Text style={styles.line}>
        {picked.learned.length === 0 ? t('ui.creation.learned.none') : picked.learned.join(' · ')}
      </Text>
    </Section>

    <Section heading={t('ui.creation.equipment')}>
      <Text style={styles.line}>{picked.equipment.join(' · ')}</Text>
    </Section>

    <Section heading={t('ui.creation.flags')}>
      {picked.flags.length === 0 ? (
        <Text testID="creation-clean" style={styles.line}>
          {t('ui.creation.clean')}
        </Text>
      ) : (
        <View style={styles.flags}>
          {picked.flags.map((flag) => (
            <Text key={`${flag.id}:${flag.message}`} testID="creation-flag" style={styles.flag}>
              {flag.message}
            </Text>
          ))}
          <Text style={styles.cite}>{t('ui.creation.flags.cite')}</Text>
        </View>
      )}
    </Section>
  </Slip>
)

export const CreationScreen = ({ state, candidates, dispatch }: Props) => {
  const picked = state.picked
  return (
    <View style={styles.screen}>
      <Slip style={styles.head}>
        <Text style={styles.title}>{t('ui.creation.title')}</Text>
        <Text style={styles.lead}>{t('ui.creation.lead')}</Text>
      </Slip>
      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {candidates.map((candidate) => (
          <MenuButton
            key={candidate.presetId}
            testID={`pick-${candidate.presetId}`}
            title={candidate.sheet.name}
            note={
              candidate.presetId === picked?.presetId
                ? t('ui.creation.picked')
                : t('ui.creation.pick')
            }
            line={`${candidate.martialArt} · ${t('ui.attr.skill')} ${String(candidate.sheet.skill)}`}
            onPress={() => dispatch({ type: 'creation.pick', candidate })}
          />
        ))}
        {picked === null ? null : <Sheet picked={picked} />}
      </ScrollView>
      <View style={styles.foot}>
        <Text style={styles.footer}>{t('ui.creation.footer')}</Text>
        {picked === null ? null : (
          <View style={styles.begin}>
            <Button
              primary
              small
              testID="creation-start"
              text={fill(t('ui.creation.start'), { name: picked.sheet.name.toUpperCase() })}
              onPress={() => dispatch({ type: 'creation.start' })}
              style={styles.startButton}
            />
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  head: { marginTop: 10, marginHorizontal: 14, padding: 9 },
  title: { fontFamily: font.sans, fontSize: 16, fontWeight: '800', letterSpacing: 0.9, color: color.ink },
  lead: { fontFamily: font.serif, fontSize: 13, lineHeight: 18, marginTop: 4, color: color.ink },
  body: { flex: 1, marginTop: 8 },
  bodyContent: { paddingHorizontal: 14, paddingBottom: 8, gap: 6 },
  sheet: { marginTop: 6, padding: 9, gap: 9 },
  sheetHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 },
  name: { fontFamily: font.sans, fontSize: 17, fontWeight: '800', letterSpacing: 0.3, color: color.ink },
  section: { gap: 2 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 },
  heading: { fontFamily: font.sans, fontSize: 9, fontWeight: '800', letterSpacing: 0.9, color: color.ink },
  note: { fontFamily: font.mono, fontSize: 10, color: color.ink },
  line: { fontFamily: font.serif, fontSize: 13, lineHeight: 18, color: color.ink },
  cite: { fontFamily: font.mono, fontSize: 10, marginTop: 2, color: color.dim },
  flags: { gap: 3 },
  flag: { fontFamily: font.serif, fontSize: 13, lineHeight: 18, color: color.vermilion },
  foot: { paddingTop: 9, paddingHorizontal: 14, paddingBottom: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  footer: { flexShrink: 1, fontFamily: font.mono, fontSize: 10, color: color.dim },
  begin: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  startButton: { paddingVertical: 9, paddingHorizontal: 13 },
})
