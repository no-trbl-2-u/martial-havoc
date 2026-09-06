/**
 * The dice on the table: the player taps the two faces they rolled, and
 * the next roll reads them. First-class beside the roll button, and
 * counted as an override (spec.md, Horizon; design prompt).
 */
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { FACES } from '@martial-havoc/engine'
import type { Die } from '@martial-havoc/engine'
import { t } from '@martial-havoc/content'
import { fill } from '../lib/fill'
import { color, font } from '../theme/tokens'
import { Button } from './Button'
import { Slip } from './Slip'

type Props = {
  readonly manual: readonly Die[]
  readonly onFace: (face: Die) => void
  readonly onCancel?: () => void
}

export const ManualDice = ({ manual, onFace, onCancel }: Props) => (
  <Slip borderColor={color.vermilion} style={styles.slip} testID="manual-dice">
    <Text style={styles.heading}>{t('ui.manual.heading')}</Text>
    <View style={styles.faces}>
      {FACES.map((face) => {
        const chosen = manual.includes(face)
        return (
          <Pressable
            key={face}
            accessibilityRole="button"
            accessibilityLabel={String(face)}
            onPress={() => onFace(face)}
            style={[styles.face, chosen && styles.chosen]}
          >
            <Text style={[styles.faceText, chosen && styles.onInk]}>{face}</Text>
          </Pressable>
        )
      })}
    </View>
    <View style={styles.foot}>
      <Text style={styles.status}>
        {manual.length === 2
          ? fill(t('ui.manual.ready'), { a: manual[0] ?? '', b: manual[1] ?? '' })
          : t('ui.manual.prompt')}
      </Text>
      {onCancel === undefined ? null : <Button text={t('ui.manual.cancel')} small onPress={onCancel} />}
    </View>
  </Slip>
)

const styles = StyleSheet.create({
  slip: { paddingVertical: 8, paddingHorizontal: 9 },
  heading: { fontFamily: font.mono, fontSize: 10, letterSpacing: 0.8, color: color.ink },
  faces: { flexDirection: 'row', gap: 5, marginTop: 7 },
  face: { flex: 1, alignItems: 'center', paddingVertical: 7, borderWidth: 2, borderColor: color.ink, backgroundColor: color.paper },
  chosen: { backgroundColor: color.ink },
  faceText: { fontFamily: font.sans, fontSize: 15, fontWeight: '800', color: color.ink },
  onInk: { color: color.paper },
  foot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginTop: 7 },
  status: { flex: 1, fontFamily: font.mono, fontSize: 11, color: color.ink },
})
