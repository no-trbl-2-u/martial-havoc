/**
 * About: who made this, under what licence, and how much of it there is.
 *
 * Three blocks in the order a stranger needs them (phase 9 brief): what
 * this is, whose it is, and what shipped. The credit line and the
 * licence are `app.licence` verbatim - the estate wrote that sentence,
 * and standing rule 9 says transcribe rather than paraphrase.
 *
 * The counts are read at runtime from `contentCounts()` and
 * `behaviours`, never typed in. `spec.md` asks for counts readable from
 * the build; a number hardcoded here would be a claim about the build
 * rather than a reading of it, and would rot the first time a table
 * grew. `scripts/counts.mjs` prints the same two numbers for the
 * release checklist, from the same sources.
 */
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { behaviours } from '@martial-havoc/engine'
import { contentCounts, t, theFiveTreasuresEvents, theFiveTreasuresMeta } from '@martial-havoc/content'
import { fill } from '../lib/fill'
import type { Action } from '../state/types'
import { color, font } from '../theme/tokens'
import { Button } from '../components/Button'
import { Slip } from '../components/Slip'

type Props = { readonly dispatch: (a: Action) => void }

/** One block of the page: a heading and its lines. */
const Block = ({
  heading,
  children,
}: {
  readonly heading: string
  readonly children: React.ReactNode
}) => (
  <Slip style={styles.block}>
    <Text style={styles.heading}>{heading}</Text>
    {children}
  </Slip>
)

export const AboutScreen = ({ dispatch }: Props) => {
  // Called once per render rather than memoised: it is a reduce over a
  // frozen static registry, and the screen renders on a tap, not a tick.
  const counts = contentCounts()
  return (
    <View style={styles.screen} testID="about">
      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <Block heading={t('ui.about.what')}>
          <Text style={styles.title}>{t('app.title')}</Text>
          <Text style={styles.line}>{t('app.tagline')}</Text>
        </Block>

        <Block heading={t('ui.about.whose')}>
          <Text style={styles.line}>{t('ui.about.rules-by')}</Text>
          {/* The licence sentence as the estate wrote it: it names every
              other author - Cammarata, limofeus, watabou - and carries
              the clause that none of the credited art ships. Repeating
              those names above it would be a paraphrase of a sentence
              this repository already transcribes (standing rule 9). */}
          <Text testID="about-licence" style={styles.licence}>
            {t('app.licence')}
          </Text>
        </Block>

        {/* The adventure's page a1 opening and page a2 credits, as
            printed (5T a1, 5T a2): the introduction the book has. The
            operator asked for it here rather than as an interruption
            after creation. */}
        <Block heading={t('ui.intro.heading')}>
          <Text testID="intro-title" style={styles.title}>{t('ui.intro.title')}</Text>
          <Text style={styles.licence}>{t('ui.intro.subtitle')}</Text>
          <Text testID="intro-premise" style={styles.line}>{theFiveTreasuresMeta.premise}</Text>
          <Text style={[styles.licence, styles.gap]}>{t('ui.intro.events')}</Text>
          {theFiveTreasuresEvents.map((row) => (
            <Text key={row.id} style={styles.eventRow}>
              {row.totals.length === 1 ? row.totals[0] : `${row.totals[0]}-${row.totals[row.totals.length - 1]}`} {row.text}
            </Text>
          ))}
          <Text style={[styles.licence, styles.gap]}>{t('ui.intro.encounters')}</Text>
          <Text style={styles.licence}>{t('ui.intro.note.1')}</Text>
          <Text style={styles.licence}>{t('ui.intro.note.2')}</Text>
          <Text style={[styles.licence, styles.gap]}>{t('ui.intro.credits.licence')}</Text>
          <Text style={styles.licence}>{t('ui.intro.credits.writing')}</Text>
          <Text style={styles.licence}>{t('ui.intro.credits.icons')}</Text>
          <Text style={styles.licence}>{t('ui.intro.credits.map')}</Text>
        </Block>

        <Block heading={t('ui.about.shipped')}>
          <Text testID="about-records" style={styles.count}>
            {fill(t('ui.about.records'), { records: counts.records, files: counts.files })}
          </Text>
          <Text style={styles.line}>
            {fill(t('ui.about.authored'), { n: counts.authoredLines })}
          </Text>
          <Text testID="about-behaviours" style={styles.count}>
            {fill(t('ui.about.behaviours'), { n: behaviours.length })}
          </Text>
        </Block>

        <Block heading={t('ui.about.offline')}>
          <Text style={styles.line}>{t('ui.about.offline.line')}</Text>
        </Block>
      </ScrollView>
      <View style={styles.foot}>
        <Text style={styles.footer}>{t('ui.about.footer')}</Text>
        <Button
          primary
          small
          text={t('ui.nav.back')}
          onPress={() => dispatch({ type: 'nav', screen: 'beat' })}
          style={styles.back}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  body: { flex: 1, marginTop: 10 },
  bodyContent: { paddingHorizontal: 14, paddingBottom: 8, gap: 8 },
  block: { padding: 9, gap: 4 },
  heading: { fontFamily: font.sans, fontSize: 9, fontWeight: '800', letterSpacing: 0.9, color: color.ink },
  title: { fontFamily: font.sans, fontSize: 17, fontWeight: '800', letterSpacing: 0.3, color: color.ink },
  line: { fontFamily: font.serif, fontSize: 13, lineHeight: 18, color: color.ink },
  licence: { fontFamily: font.mono, fontSize: 10, lineHeight: 15, marginTop: 2, color: color.dim },
  count: { fontFamily: font.sans, fontSize: 14, fontWeight: '800', color: color.ink },
  eventRow: { fontFamily: font.mono, fontSize: 11, lineHeight: 16, color: color.ink },
  gap: { marginTop: 6 },
  foot: { paddingTop: 9, paddingHorizontal: 14, paddingBottom: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  footer: { flexShrink: 1, fontFamily: font.mono, fontSize: 10, color: color.dim },
  back: { paddingVertical: 9, paddingHorizontal: 13 },
})
