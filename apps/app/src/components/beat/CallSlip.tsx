/**
 * THE CALL: the adventure's premise, read on arrival (MH p.84, Act I;
 * 5T a1).
 *
 * Where this sits, and why it moved. Phase 10b put the Call on the
 * village screen, so a Master standing in Fen Pass read a paragraph
 * about the Lotus Flower cave above a stall row selling torches. The
 * operator's first-impressions pass of 2026-09-08 reported that as two
 * competing narratives on one screen - "am I in a cave, or am I in Fen
 * Pass?" - and settled it: a screen shows the place the Master is
 * standing in and the options that place allows, and nothing else. So
 * the village is now only the village, and the Call lands here, on the
 * mountain, at the moment the trail has been taken.
 *
 * The act it belongs to did not change. The trail out of Fen Pass is
 * still the Point of No Return, and this is still the first act's
 * statement of the world and the thing that changes it; it is now read
 * where the change has happened rather than where it has not.
 *
 * It shows once. `BeatScreen` decides when from the record - arrived,
 * with nothing yet done - so this component holds no condition of its
 * own, only the layout: the premise as the adventure prints it, the
 * narrator under a dashed rule, the act note and the folio.
 */
import { StyleSheet, Text, View } from 'react-native'
import { t, theFiveTreasuresMeta } from '@martial-havoc/content'
import { narrate } from '../../lib/narrator'
import { color, font } from '../../theme/tokens'
import { Narrator } from '../Narrator'
import { Slip } from '../Slip'
import { Source } from '../Source'

export const CallSlip = ({ master }: { readonly master: string }) => (
  <Slip style={styles.slip} testID="call">
    <View style={styles.head}>
      <Text style={styles.name}>{t('ui.village.call.title')}</Text>
    </View>
    <Text style={styles.blurb}>{theFiveTreasuresMeta.premise}</Text>
    <View style={styles.foot}>
      <Narrator testID="call-narrator" line={narrate('call', master)} style={styles.narrator} />
      <View style={styles.noteRow}>
        <Text style={styles.note}>{t('ui.village.call.note')}</Text>
        <Source cite={theFiveTreasuresMeta.cite} />
      </View>
    </View>
  </Slip>
)

const styles = StyleSheet.create({
  slip: { marginTop: 10, marginHorizontal: 14 },
  head: { paddingVertical: 6, paddingHorizontal: 9, backgroundColor: color.ink },
  name: { fontFamily: font.sans, fontSize: 11, fontWeight: '800', letterSpacing: 0.9, color: color.paper },
  blurb: { fontFamily: font.serif, fontSize: 14, lineHeight: 20, padding: 9, color: color.ink },
  foot: { paddingHorizontal: 9, paddingBottom: 9, gap: 7 },
  /** The rule is already drawn by the slip's own edge above it. */
  narrator: { marginTop: 0, paddingTop: 0, borderTopWidth: 0 },
  noteRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  note: { flexShrink: 1, fontFamily: font.mono, fontSize: 10, lineHeight: 14, color: color.dim },
})
